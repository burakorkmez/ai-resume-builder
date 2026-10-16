import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { SUPPORT_EMAIL } from "@/components/ui";
import { COST, PLANS } from "@/lib/resume";

export const metadata = { title: "Terms of Service" };

// Bracketed values are still unconfirmed and must be filled in before launch (plan.md §17, launch gate 11).
const Todo = ({ children }: { children: ReactNode }) => (
  <mark className="rounded bg-amber-100 px-1 text-amber-900">[{children}]</mark>
);

const mail = (
  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-indigo-600 hover:text-indigo-500">
    {SUPPORT_EMAIL}
  </a>
);

export default function Terms() {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Logo />
      </div>
      <main className="mx-auto max-w-3xl py-12 text-slate-600 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:mt-2 [&_p]:mt-4 [&_strong]:text-slate-900 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        <p role="note" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Draft pending legal review. Highlighted items are not final.
        </p>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Terms of Service</h1>
        <p className="text-sm text-slate-500">
          Effective <Todo>effective date</Todo>
        </p>

        <h2>1. About these Terms</h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) are an agreement between you and <Todo>legal entity name</Todo>,{" "}
          <Todo>entity type and registered address</Todo> (&quot;Veyro&quot;, &quot;we&quot;, &quot;us&quot;). They govern
          your use of the Veyro website and resume builder (the &quot;Service&quot;). By signing in to or using the
          Service, you agree to these Terms. If you don&apos;t agree, don&apos;t use the Service.
        </p>

        <h2>2. The Service</h2>
        <p>
          Veyro helps you write a resume from your own experience, using one fixed template. You can create and edit
          resumes, use optional AI features to suggest wording, make tailored copies of a resume for a specific job,
          and download your resumes as PDFs using your browser&apos;s print feature. Veyro is a writing tool. It does
          not apply for jobs on your behalf, share your resume with employers, or guarantee any hiring outcome.
        </p>
        <p>The Service&apos;s interface and AI output are in English.</p>

        <h2>3. Eligibility</h2>
        <p>
          You must be at least <Todo>minimum age, e.g. 16</Todo> years old, and old enough to form a binding contract
          where you live, to use the Service. You must also be allowed to use a Google account, because Google sign-in
          is the only way to access the Service. <Todo>Any countries or regions where the Service is not offered</Todo>
        </p>

        <h2>4. Your account</h2>
        <ul>
          <li>
            You sign in with your Google account. Your Veyro account is created the first time you sign in, and we use
            your Google name and email address to identify it.
          </li>
          <li>
            You&apos;re responsible for keeping your Google account secure and for activity in the Service that happens
            through it. Tell us at {mail} if you believe someone else has accessed your account.
          </li>
          <li>Accounts are for individual use. Don&apos;t share your account or use someone else&apos;s.</li>
        </ul>

        <h2>5. Your content</h2>
        <p>
          &quot;Your content&quot; means what you put into the Service: resume text, resume titles, and job details you
          paste in for tailoring.
        </p>
        <ul>
          <li>
            <strong>You own your content.</strong> You also own the text of AI suggestions once you accept them into
            your resume, to the extent any rights in them exist. We claim no ownership of your resumes.
          </li>
          <li>
            <strong>Our limited license.</strong> You give us a limited, non-exclusive, worldwide, royalty-free license to
            store, process, and display your content only to provide the Service to you. That includes sending parts of
            it to our AI provider when you use an AI feature (see section 6). This license ends when your content is
            deleted, except for copies we still hold under section 11.
          </li>
          <li>
            <strong>Private by default.</strong> The Service has no feature for publishing or sharing resumes. Your
            resumes are only accessible through your account. We handle your data as described in our{" "}
            <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </Link>
            .
          </li>
          <li>
            <strong>Your responsibility.</strong> You&apos;re responsible for your content. That includes making sure
            your resume is truthful, and that you have the right to use anything you paste in, such as a job
            description.
          </li>
          <li>
            <strong>Deletion is permanent.</strong> When you delete a resume, it&apos;s gone. We don&apos;t offer a way to
            restore it. Tailored copies made from it stay in your account. Keep your own copy (for example, a downloaded
            PDF) of anything you need.
          </li>
        </ul>

        <h2>6. AI features</h2>
        <p>
          AI features are optional, and you can always edit and download resumes without them. Before you use AI for
          the first time, we show you a notice explaining what is sent.
        </p>
        <ul>
          <li>
            <strong>Who provides it.</strong> Suggestions are generated by AI models from OpenAI. When you use an AI
            feature, we send the relevant parts of your resume to OpenAI. For tailoring, we also send the job title,
            company, and description you entered. We don&apos;t send your name, email address, phone number, location,
            or personal links. OpenAI processes this data under its own API terms and policies.
          </li>
          <li>
            <strong>Suggestions only.</strong> AI output is a suggestion. Nothing in your resume changes until you
            accept a suggestion, and you can edit or reject any suggestion.
          </li>
          <li>
            <strong>AI can be wrong.</strong> We instruct the AI to work only from facts you provided, and we
            automatically reject some kinds of invalid output (for example, a tailored skills list that adds a skill
            you didn&apos;t list). We still can&apos;t guarantee that a suggestion is accurate, complete, or suitable.
            Read every suggestion before you accept it. You are responsible for the final content of your resume.
          </li>
          <li>
            <strong>No outcome guarantee.</strong> We don&apos;t guarantee interviews, job offers, or results from
            applicant tracking systems (ATS).
          </li>
          <li>
            <strong>Limits.</strong> Each AI action has a maximum input length. If your input is too long, the request
            is refused and you aren&apos;t charged.
          </li>
        </ul>

        <h2>7. Plans, credits, and payment</h2>
        <p>
          <strong>Plans.</strong> The Service has a Free plan and a paid Pro plan:
        </p>
        <ul>
          <li>
            <strong>Free:</strong> $0. Up to {PLANS.free.resumes} saved resumes and {PLANS.free.credits} AI credits as a
            one-time grant. No payment details are required.
          </li>
          <li>
            <strong>Pro:</strong> $9 per month (USD, before applicable taxes). Up to {PLANS.pro.resumes} saved resumes
            and {PLANS.pro.credits} AI credits for each paid billing month.
          </li>
          <li>PDF downloads are unlimited and unwatermarked on both plans.</li>
        </ul>
        <p>
          <strong>Credits.</strong> AI actions use credits: improving a bullet costs {COST.bullet}, writing a summary
          costs {COST.summary}, and tailoring a resume to a job costs {COST.tailor}. The cost is shown before you use
          an action. Credits are charged only when a result is delivered, so a failed or refused request costs nothing.
          Credits are not refunded when you reject a suggestion or delete a resume. Credits have no cash value and
          can&apos;t be transferred, sold, or exchanged.
        </p>
        <p>
          Pro credits reset to {PLANS.pro.credits} once each billing month&apos;s payment is confirmed. Unused Pro
          credits do not roll over. Your Free credits are tracked separately and are what you&apos;ll have if you go
          back to the Free plan.
        </p>
        <p>
          <strong>Payment.</strong> Payments are processed by our payment provider, Polar (polar.sh), on its hosted
          checkout. Your purchase may also be subject to Polar&apos;s terms. <Todo>Confirm whether Polar is the merchant of record and state it here</Todo>{" "}
          Pro features start once Polar confirms your payment.
        </p>
        <p>
          <strong>Automatic renewal.</strong> Pro is a monthly subscription. It renews automatically, and you&apos;ll be
          charged the then-current price at the start of each billing month until you cancel.
        </p>
        <p>
          <strong>Cancellation.</strong> You can cancel renewal at any time on the Billing page. You keep Pro until the
          end of the billing month you&apos;ve paid for, and you won&apos;t be charged again. Until then, you can resume
          your subscription. You can update your payment method through Polar&apos;s customer portal, linked from the
          Billing page.
        </p>
        <p>
          <strong>Moving back to Free.</strong> When Pro ends, every resume you have stays editable and downloadable,
          even if you have more than the Free limit. You can&apos;t create, duplicate, or tailor a resume until your
          total is below that limit.
        </p>
        <p>
          <strong>Refunds.</strong> Refund requests are handled manually by our support team. Email {mail}.{" "}
          <Todo>Refund policy: eligibility, time window, and whether partial months are refunded</Todo> This doesn&apos;t
          limit any refund or cancellation rights you have under the law where you live.
        </p>
        <p>
          <strong>Price changes.</strong> We may change the price of Pro. We&apos;ll give you at least{" "}
          <Todo>notice period, e.g. 30 days</Todo> notice by email before a change applies to your subscription, and you
          can cancel before it takes effect.
        </p>

        <h2>8. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service to break the law or infringe anyone else&apos;s rights.</li>
          <li>Use the Service to create resumes that impersonate another person.</li>
          <li>
            Try to get around plan limits or credit charges, including by creating more accounts to get more free
            credits.
          </li>
          <li>
            Access the Service, or its AI features, other than through the interface we provide. That includes
            scraping, automating requests, or calling our back-end services directly.
          </li>
          <li>
            Interfere with the Service, probe or test its security without our written permission, or try to access
            another user&apos;s data.
          </li>
          <li>
            Use AI features to try to get the AI to produce content unrelated to your resume, or to extract its
            instructions.
          </li>
          <li>Resell or sublicense the Service.</li>
        </ul>

        <h2>9. Third-party services</h2>
        <p>The Service depends on these providers. Their own terms and policies apply to your use of their services:</p>
        <ul>
          <li>
            <strong>Google</strong> for sign-in.
          </li>
          <li>
            <strong>Neon</strong> for authentication, our database, and the service that runs AI requests.
          </li>
          <li>
            <strong>OpenAI</strong> for AI suggestions.
          </li>
          <li>
            <strong>Polar</strong> for checkout, subscriptions, and payments.
          </li>
          <li>
            <Todo>Hosting provider</Todo> for running the website.
          </li>
        </ul>
        <p>We aren&apos;t responsible for third-party services, including if they are unavailable.</p>

        <h2>10. Our intellectual property</h2>
        <p>
          We own the Service, including its software, resume template, design, and the Veyro name and logo. We give you
          a personal, non-exclusive, non-transferable, revocable license to use the Service under these Terms. You may
          freely use, send, and print the resumes you download, including their template design. You may not copy the
          Service itself or use our name and logo without our permission.
        </p>
        <p>
          If you send us feedback or ideas, we may use them without any obligation to you.
        </p>

        <h2>11. Ending your account</h2>
        <p>
          <strong>Deleting your account.</strong> You can delete your account at any time on the Account page.
          Deletion takes effect immediately and permanently removes your account, every resume, any saved job details,
          and all AI suggestions. It can&apos;t be undone. If you have an active Pro subscription, deleting your account
          ends it immediately, including any time left in the current billing month, and you won&apos;t be charged
          again. Deleting your account does not by itself issue a refund. See the refund terms in section 7. If you
          sign in again later, a new Free account is created.{" "}
          <Todo>Retention: how long deleted data may remain in backups and provider logs</Todo>
        </p>
        <p>
          <strong>Suspension or termination by us.</strong> We may suspend or end your access to the Service if you
          materially or repeatedly break these Terms, if we must do so by law, or to protect the Service or other
          users. Where reasonable, we&apos;ll tell you why and give you a chance to fix the problem or download your
          resumes first. <Todo>Whether a terminated Pro subscription is refunded</Todo>
        </p>
        <p>
          We may also stop offering the Service. If we do, we&apos;ll give you at least <Todo>notice period</Todo>{" "}
          notice so you can download your resumes, and we&apos;ll stop charging for Pro.
        </p>
        <p>Sections 5 (your responsibility), 10, and 12 to 16 continue to apply after your account ends.</p>

        <h2>12. Disclaimers</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot;. To the extent the law allows, we
          disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular
          purpose, and non-infringement. We don&apos;t promise that the Service will be uninterrupted or error-free, that
          edits will always save, or that AI output will be accurate. Some places don&apos;t allow these disclaimers, so
          some may not apply to you.
        </p>

        <h2>13. Limitation of liability</h2>
        <p>
          To the extent the law allows, we will not be liable for any indirect, incidental, special, consequential, or
          punitive damages, or for lost profits, lost data, or lost job opportunities, arising from your use of the
          Service. Our total liability for any claim related to the Service is limited to the greater of the amount you
          paid us in the 12 months before the claim arose and <Todo>fixed amount, e.g. US$50</Todo>. Nothing in these
          Terms limits liability that can&apos;t be limited by law, such as liability for fraud or, where applicable, for
          death or personal injury caused by negligence.
        </p>

        <h2>14. Indemnification</h2>
        <p>
          To the extent the law allows, you agree to indemnify and hold us harmless from claims by third parties arising
          from your content or your breach of these Terms, including reasonable legal costs.{" "}
          <Todo>Confirm whether this applies to consumers in your target markets</Todo>
        </p>

        <h2>15. Changes to these Terms</h2>
        <p>
          We may update these Terms. For material changes, we&apos;ll give you at least{" "}
          <Todo>notice period, e.g. 30 days</Todo> notice by email or in the Service before they take effect. If you keep
          using the Service after the changes take effect, you accept them. If you don&apos;t agree, you can cancel Pro
          or delete your account.
        </p>

        <h2>16. Governing law and disputes</h2>
        <p>
          These Terms are governed by the laws of <Todo>governing law</Todo>. Disputes will be resolved in the courts of{" "}
          <Todo>venue</Todo>. <Todo>Dispute-resolution approach: courts only, or arbitration with any class-action waiver</Todo>{" "}
          If you are a consumer, you also keep any protection that the mandatory law of your country of residence gives
          you.
        </p>
        <p>
          If any part of these Terms is unenforceable, the rest stays in effect. If we don&apos;t enforce a part of these
          Terms, that doesn&apos;t waive our right to enforce it later. These Terms, and the policies they refer to, are
          the entire agreement between you and us about the Service. You can&apos;t transfer your rights under these
          Terms. We may transfer ours as part of a merger, acquisition, or sale of the Service.
        </p>

        <h2>17. Contact</h2>
        <p>
          Questions about these Terms, billing, or refunds: {mail}. Postal address: <Todo>postal address</Todo>.
        </p>

        <p className="mt-12 text-sm">
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            ← Back to Veyro
          </Link>
        </p>
      </main>
    </div>
  );
}
