"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog } from "@/components/dialog";
import { button, Loading, Meter, Sparkle } from "@/components/ui";
import { COST } from "@/lib/fake-ai";
import { endProPeriod, PLANS, setCancelAtPeriodEnd, startPro, usage, useAppState } from "@/lib/store";

const onDark =
  "rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" });

export function Billing() {
  const state = useAppState();
  const router = useRouter();
  const [dialog, setDialog] = useState<"checkout" | "cancel" | "portal" | null>(null);

  if (!state) return <Loading />;
  const u = usage(state);
  const pro = state.plan === "pro";
  const close = () => setDialog(null);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-1 text-slate-600">Your plan, credits, and subscription.</p>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className={`rounded-3xl p-6 sm:p-8 lg:col-span-1 ${pro ? "bg-slate-900 text-white" : "bg-white ring-1 ring-slate-200"}`}>
          <p className={pro ? "text-indigo-200" : "text-slate-500"}>Current plan</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">
            {u.plan.name}
            <span className={`ml-2 text-base font-normal ${pro ? "text-slate-400" : "text-slate-500"}`}>
              {pro ? "$9 / month" : "$0"}
            </span>
          </p>
          <p className={`mt-3 text-sm ${pro ? "text-slate-300" : "text-slate-600"}`}>
            {!pro && "10 lifetime AI credits and 2 saved resumes."}
            {pro && !state.cancelAtPeriodEnd && `Renews on ${formatDate(state.periodEnd)}.`}
            {pro && state.cancelAtPeriodEnd && `Renewal is off. Pro stays active until ${formatDate(state.periodEnd)}.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {!pro && (
              <button type="button" className={button.primary} onClick={() => setDialog("checkout")}>
                Upgrade to Pro
              </button>
            )}
            {pro && (
              <button type="button" className={`${button.secondary} ring-0`} onClick={() => setDialog("portal")}>
                Manage payment method
              </button>
            )}
            {pro && !state.cancelAtPeriodEnd && (
              <button type="button" className={onDark} onClick={() => setDialog("cancel")}>
                Cancel subscription
              </button>
            )}
            {pro && state.cancelAtPeriodEnd && (
              <button type="button" className={onDark} onClick={() => setCancelAtPeriodEnd(false)}>
                Resume subscription
              </button>
            )}
          </div>
          {pro && state.cancelAtPeriodEnd && (
            <button type="button" onClick={endProPeriod} className="mt-6 text-xs text-slate-400 underline underline-offset-2 hover:text-white">
              Demo: end the paid period now
            </button>
          )}
        </div>

        <Meter
          label="AI credits left"
          value={u.credits}
          max={u.plan.credits}
          hint={pro ? "Pro credits reset each billing month and don't roll over." : "Free credits are a one-time grant."}
        />
        <Meter
          label="Saved resumes"
          value={u.resumes}
          max={u.plan.resumes}
          hint="Over the limit after a downgrade? Everything stays editable and downloadable."
        />
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Compare plans</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-4 font-medium">Feature</th>
                <th className="p-4 font-medium">Free</th>
                <th className="p-4 font-medium">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["Price", "$0", "$9 / month"],
                ["Saved resumes", PLANS.free.resumes, PLANS.pro.resumes],
                ["AI credits", `${PLANS.free.credits}, one time`, `${PLANS.pro.credits} every billing month`],
                ["PDF downloads", "Unlimited, no watermark", "Unlimited, no watermark"],
                ["Job tailoring", "Included", "Included"],
              ].map(([feature, free, proValue]) => (
                <tr key={String(feature)}>
                  <td className="p-4 text-slate-600">{feature}</td>
                  <td className="p-4">{free}</td>
                  <td className="p-4 font-medium">{proValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1.5 text-indigo-700">
            <Sparkle /> Credit costs:
          </span>
          <span>Improve bullet · {COST.bullet}</span>
          <span>Write summary · {COST.summary}</span>
          <span>Tailor to a job · {COST.tailor}</span>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Prices in USD before applicable taxes. Refund requests are handled by{" "}
          <Link href="/account" className="underline underline-offset-2">
            support
          </Link>
          .
        </p>
      </section>

      <Dialog open={dialog === "checkout"} onClose={close} title="Upgrade to Pro">
        <p>
          <span className="font-medium text-slate-900">Veyro Pro · $9.00 / month</span>
          <br />
          20 saved resumes and 200 AI credits every billing month. Cancel anytime.
        </p>
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs">
          Demo mode: the real app hands off to Polar&apos;s secure checkout here. Nothing is charged.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={button.secondary} onClick={close}>
            Not now
          </button>
          <button type="button" className={button.primary} onClick={() => router.push("/billing/success")}>
            Continue to checkout
          </button>
        </div>
      </Dialog>

      <Dialog open={dialog === "cancel"} onClose={close} title="Cancel Pro?">
        <p>
          Renewal stops, and you keep Pro until {pro && formatDate(state.periodEnd)}. After that, all your resumes stay
          editable and downloadable; you just can&apos;t create new ones above the Free limit.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={button.secondary} onClick={close}>
            Keep Pro
          </button>
          <button
            type="button"
            className={button.danger}
            onClick={() => {
              setCancelAtPeriodEnd(true);
              close();
            }}
          >
            Cancel renewal
          </button>
        </div>
      </Dialog>

      <Dialog open={dialog === "portal"} onClose={close} title="Billing portal">
        <p>In the real app this opens Polar&apos;s customer portal, where you can update your card and download receipts.</p>
        <div className="mt-6 flex justify-end">
          <button type="button" className={button.primary} onClick={close}>
            Got it
          </button>
        </div>
      </Dialog>
    </>
  );
}

export function BillingSuccess() {
  const state = useAppState();
  const [verified, setVerified] = useState(false);

  // Simulates server-side reconciliation: the checkout redirect alone never grants Pro (plan.md §9).
  useEffect(() => {
    const timer = setTimeout(() => {
      startPro();
      setVerified(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!state) return <Loading />;

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center ring-1 ring-slate-200 sm:p-10" aria-live="polite">
      {verified ? (
        <>
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-indigo-50 text-indigo-600">
            <Sparkle className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">You&apos;re on Pro</h1>
          <p className="mt-2 text-slate-600">
            {usage(state).credits} AI credits and room for {PLANS.pro.resumes} resumes are ready.
          </p>
          <Link href="/dashboard" className={`${button.primary} mt-8`}>
            Back to resumes
          </Link>
        </>
      ) : (
        <>
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" aria-hidden />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Confirming your subscription…</h1>
          <p className="mt-2 text-slate-600">This usually takes a few seconds. It&apos;s safe to leave this page.</p>
        </>
      )}
    </div>
  );
}
