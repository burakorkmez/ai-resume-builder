import { webhooks } from "@polar-sh/sdk/2026-10";
import { PRO_PRODUCT_ID, syncBilling } from "@/lib/billing";
import { env } from "@/lib/env";

type Data = { product_id?: string | null; metadata?: Record<string, unknown>; subscription?: { metadata?: Record<string, unknown> } | null };

// Polar calls this on billing changes. An event is only a hint to re-read that user's subscription from Polar, so
// duplicate, late, or out-of-order deliveries are harmless. Any error returns 500 and Polar retries.
export async function POST(request: Request) {
  const secret = env("POLAR_WEBHOOK_SECRET");
  let event: webhooks.WebhookPayload;
  try {
    event = await webhooks.validateEvent(await request.text(), Object.fromEntries(request.headers), secret);
  } catch (e) {
    if (e instanceof webhooks.PolarWebhookVerificationError) return new Response("Invalid signature", { status: 403 });
    return new Response(null, { status: 202 }); // signed by Polar, but an event type this SDK version doesn't know
  }

  // Only Pro orders/subscriptions matter; the Polar org may sell other products. A renewal order may not carry the
  // checkout metadata, but its subscription does.
  const data = event.data as Data;
  const ours = /^(order|subscription)\./.test(event.type) && data.product_id === PRO_PRODUCT_ID;
  const userId = ours ? (data.metadata?.user_id ?? data.subscription?.metadata?.user_id) : null;
  if (typeof userId === "string") await syncBilling(userId);
  return new Response(null, { status: 202 });
}
