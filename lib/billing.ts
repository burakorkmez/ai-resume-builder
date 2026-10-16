// Polar is the source of truth for who has paid. syncBilling copies that onto app_users; nothing else grants Pro.
import { createPolar } from "@polar-sh/sdk/2026-10";
import { pool, type UserRow } from "./db";
import { env } from "./env";

export const polar = createPolar({
  accessToken: env("POLAR_ACCESS_TOKEN"),
  environment: env("POLAR_SERVER") === "production" ? "production" : "sandbox",
});

export const PRO_PRODUCT_ID = env("POLAR_PRODUCT_ID");

// Checkout copies this metadata onto the subscription, which is how a subscription is tied to an app user. Polar's
// external customer id can't do it: customers are matched by email across the whole Polar org, so a buyer may
// reuse a customer that another app already gave its own external id.
export const userTag = (userId: string) => ({ user_id: userId });

/** The user's live Pro subscription in Polar, if any. */
export async function proSubscription(userId: string) {
  const { items } = await polar.subscriptions.list({ product_id: PRO_PRODUCT_ID, metadata: userTag(userId), active: true, limit: 1 });
  return items[0];
}

/**
 * Re-reads the user's subscription and newest paid order from Polar and stores the result. Safe to run any number
 * of times in any order (webhook retries, the success page, cancel/resume), so events are only hints to call it.
 */
export async function syncBilling(userId: string) {
  const sub = await proSubscription(userId);
  const orders = sub && (await polar.orders.list({ subscription_id: sub.id, status: "paid", sorting: ["-created_at"], limit: 1 }));
  // ponytail: two overlapping syncs can store the older snapshot of plan/period dates; add a per-user lock if that bites.
  const { rows } = sub
    ? await pool.query<UserRow>(
        // Fresh Pro credits once per paid order: only when it's newer than the last order that granted them.
        // A billing cycle with no successful payment yet has no new paid order, so it grants nothing.
        `update app_users set plan = 'pro', period_end = $2, cancel_at_period_end = $3,
           pro_used = case when $4::timestamptz > coalesce(paid_order_at, '-infinity') then 0 else pro_used end,
           paid_order_at = greatest(paid_order_at, $4::timestamptz)
         where id = $1 returning *`,
        [userId, sub.current_period_end, sub.cancel_at_period_end, orders?.items[0]?.created_at ?? null],
      )
    : await pool.query<UserRow>(
        "update app_users set plan = 'free', period_end = null, cancel_at_period_end = false where id = $1 returning *",
        [userId],
      );
  return rows[0] as UserRow | undefined;
}
