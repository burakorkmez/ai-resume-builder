import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/landing/logo";
import { SUPPORT_EMAIL } from "@/components/ui";

export const metadata = { title: "Privacy Policy" };

// Draft privacy policy, written against the code as of 2026-10-16. Every <Fill> is a fact that still needs
// confirming; search for "<Fill" before publishing, and re-check this page whenever data handling changes.

/** A highlighted placeholder for a detail the founder or counsel still has to confirm. */
const Fill = ({ children }: { children: ReactNode }) => <mark className="rounded bg-amber-100 px-1 text-amber-900">[{children}]</mark>;

const Mail = () => (
  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-indigo-600 hover:text-indigo-500">
    {SUPPORT_EMAIL}
  </a>
);

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-12 scroll-mt-8">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </section>
  );
}

const providers = [
  ["Neon", "Hosts our database, runs sign-in (Neon Auth), and runs the server function that sends AI requests.", "https://neon.com/privacy-policy"],
  ["Google", "Signs you in. Google tells us your name and email address.", "https://policies.google.com/privacy"],
  ["OpenAI", "Writes AI suggestions from the parts of a resume described in section 4.", "https://openai.com/policies/privacy-policy/"],
  ["Polar", "Runs checkout, subscriptions, receipts, and the billing portal for Pro.", "https://polar.sh/legal/privacy"],
] as const;

export default function Privacy() {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Logo />

        <main className="py-16 leading-relaxed text-slate-600">
          <p className="text-sm font-medium text-indigo-600">Legal</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Privacy Policy</h1>
          <p className="mt-4 text-sm text-slate-500">
            Effective <Fill>effective date</Fill> · Last updated October 16, 2026
          </p>

          <p className="mt-8">
            Veyro helps you write a resume, tailor it to jobs, and download it as a PDF. A resume holds a lot of personal
            history, so this policy sets out exactly what we collect, why, who else receives it, and what you can do about
            it. It covers the Veyro website and app at <Fill>domain</Fill>.
          </p>

          <Section id="who" title="1. Who we are">
            <p>
              Veyro is operated by <Fill>legal entity name</Fill>, <Fill>registered address</Fill> (&ldquo;Veyro&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the controller of the personal data described here. You can reach
              us about privacy at <Mail />.
            </p>
          </Section>

          <Section id="collect" title="2. What we collect">
            <p>
              <strong className="text-slate-900">Your account.</strong> You sign in with Google; we don&apos;t offer
              passwords. Google gives our sign-in provider, Neon Auth, your name, email address, and basic profile details
              such as your profile picture. Veyro uses only your name and email: to show who is signed in, to link your
              resumes to you, and to prefill the email on Pro checkout.
            </p>
            <p>
              <strong className="text-slate-900">Your resumes.</strong> Everything you type into the editor, which can
              include your name, headline, email, phone number, location, website, LinkedIn and GitHub profiles, summary,
              work history, education, projects, and skills. We also store each resume&apos;s title, page size, and
              when it was created and last edited.
            </p>
            <p>
              <strong className="text-slate-900">Job postings you tailor to.</strong> When you tailor a resume, we keep
              the job title, company, and job description you entered with the tailored copy. Only you can see it, and
              it&apos;s never part of the PDF.
            </p>
            <p>
              <strong className="text-slate-900">AI suggestions.</strong> Suggestions you haven&apos;t accepted or
              rejected yet are saved with the resume until you review them.
            </p>
            <p>
              <strong className="text-slate-900">Plan and usage.</strong> Your plan (Free or Pro), how many AI credits
              you&apos;ve used, your current billing period end date, whether your subscription is set to cancel, the date
              of your most recent paid order, when you created your account, and when you saw our AI notice.
            </p>
            <p>
              <strong className="text-slate-900">Payments.</strong> Pro payments are handled by Polar on its own pages.
              We never see or store your card or bank details. We send Polar your email address and an internal account
              ID, and Polar tells us your subscription status, billing period, and order dates.
            </p>
            <p>
              <strong className="text-slate-900">Technical data.</strong> Sign-in uses cookies (section 7). Our hosting
              and infrastructure providers may record standard request logs, such as IP address, browser type, and
              time of request. <Fill>Confirm what the hosting provider logs and for how long</Fill>.
            </p>
            <p>
              <strong className="text-slate-900">What we don&apos;t collect.</strong> No analytics, advertising, or
              tracking tools; no file uploads or photos; no access to your Google contacts, files, or other Google data.
            </p>
          </Section>

          <Section id="use" title="3. How we use your data and why">
            <ul>
              <li>
                <strong className="text-slate-900">To run the service you signed up for</strong>: your account, saving
                your resumes, PDF downloads, AI suggestions you ask for, plan limits and credits, and Pro billing. This
                is necessary to perform our contract with you.
              </li>
              <li>
                <strong className="text-slate-900">To keep Veyro secure</strong>: checking that every request comes from
                the signed-in owner, and preventing misuse of paid AI features. This is in our legitimate interest in
                running a safe service.
              </li>
              <li>
                <strong className="text-slate-900">To help you</strong> when you email us about support, billing, or
                refunds.
              </li>
              <li>
                <strong className="text-slate-900">To meet legal obligations</strong>, for example tax and accounting
                records for payments, and responding to lawful requests.
              </li>
            </ul>
            <p>
              We don&apos;t sell your personal data, use it for advertising, or send you marketing email. We don&apos;t use
              your resumes to train AI models.
            </p>
          </Section>

          <Section id="ai" title="4. AI suggestions">
            <p>
              AI is optional. It runs only when you click an AI action (improve a bullet, write a summary, or tailor to
              a job), and we show you a notice before your first one. To get a suggestion, our server sends some of the
              resume text to OpenAI:
            </p>
            <ul>
              <li>
                <strong className="text-slate-900">Improve a bullet</strong>: that bullet&apos;s text, plus the role and
                employer (or project name) it belongs to.
              </li>
              <li>
                <strong className="text-slate-900">Write a summary</strong>: your headline, current summary, roles,
                employers, bullets, education (degree, field, institution, details), project names and roles, and skills.
              </li>
              <li>
                <strong className="text-slate-900">Tailor to a job</strong>: the same parts as a summary, plus the job
                title, company, and description you entered.
              </li>
            </ul>
            <p>
              We leave out the contact section (name, email, phone, location, website, LinkedIn, GitHub), plus the dates
              and locations of your jobs and education and your project links. We can&apos;t filter what you type into
              free-text fields like bullets or the summary, so anything you write there is sent as written.
            </p>
            <p>
              OpenAI processes this text through its API on our behalf. Under its API terms, OpenAI states it doesn&apos;t
              use API data to train its models by default and may keep it for up to 30 days to monitor for abuse.
              Suggestions never change your resume on their own; nothing changes until you accept one. When an AI request
              fails, our logs record the error but not your resume text.
            </p>
          </Section>

          <Section id="sharing" title="5. Who we share data with">
            <p>We share personal data only with the service providers we need to run Veyro, and only for that purpose:</p>
            <ul>
              {providers.map(([name, role, href]) => (
                <li key={name}>
                  <strong className="text-slate-900">{name}</strong>: {role}{" "}
                  <a href={href} className="text-indigo-600 hover:text-indigo-500" rel="noopener">
                    Privacy policy
                  </a>
                </li>
              ))}
              <li>
                <strong className="text-slate-900">
                  <Fill>Hosting provider, e.g. Cloudways</Fill>
                </strong>
                : Runs the Veyro web app, so requests pass through its servers.
              </li>
            </ul>
            <p>
              Polar acts as the <Fill>merchant of record</Fill> for Pro purchases, so it also processes payment data under
              its own privacy policy. We may disclose data if the law requires it, to protect people&apos;s safety or our
              rights, or as part of a merger or sale of the business, in which case this policy would continue to apply to
              your data.
            </p>
          </Section>

          <Section id="private" title="6. Your resumes stay private">
            <p>
              Resumes have no public links, sharing, or public profiles. Every read and write checks your sign-in and is
              limited to your own account. PDFs are made by your browser&apos;s print function when you download them, so
              we never store PDF files.
            </p>
          </Section>

          <Section id="cookies" title="7. Cookies and local storage">
            <p>
              We use only the cookies needed to keep you signed in. Neon Auth sets them when you sign in, and they&apos;re
              required for the app to work. We don&apos;t use analytics or advertising cookies, and we don&apos;t store
              anything in your browser&apos;s local storage. Our fonts, images, and videos come from our own servers.
              Google&apos;s sign-in pages and Polar&apos;s checkout pages may set their own cookies under their own policies.
            </p>
          </Section>

          <Section id="retention" title="8. How long we keep data">
            <ul>
              <li>
                <strong className="text-slate-900">Resumes, job postings, and suggestions</strong> stay until you delete
                them or your account. We don&apos;t delete inactive accounts automatically. <Fill>Confirm, or set an
                inactivity period</Fill>.
              </li>
              <li>
                <strong className="text-slate-900">Database backups</strong>: our database provider keeps restore history
                for <Fill>Neon restore window, e.g. 7 days</Fill>, so deleted data can remain in backups until that
                window passes.
              </li>
              <li>
                <strong className="text-slate-900">Text sent to OpenAI</strong> follows OpenAI&apos;s API retention
                (section 4).
              </li>
              <li>
                <strong className="text-slate-900">Payment records</strong> are kept by Polar as tax and accounting law
                requires.
              </li>
            </ul>
          </Section>

          <Section id="rights" title="9. Your choices and rights">
            <p>In the app, you can:</p>
            <ul>
              <li>View and edit everything in your resumes at any time.</li>
              <li>Delete any resume from the dashboard.</li>
              <li>Download any resume as a PDF, as often as you like.</li>
              <li>Skip AI entirely; editing and PDFs never require it.</li>
              <li>Cancel Pro, and use Polar&apos;s portal for your payment method and receipts, from the Billing page.</li>
              <li>
                Delete your account from the{" "}
                <Link href="/account" className="text-indigo-600 hover:text-indigo-500">
                  Account
                </Link>{" "}
                page.
              </li>
            </ul>
            <p>
              <strong className="text-slate-900">What account deletion does.</strong> It immediately and permanently
              deletes your Veyro account, every resume, job posting, and suggestion, and your plan and usage records. If
              you&apos;re on Pro, it ends your subscription right away so you&apos;re never charged again. It does{" "}
              <em>not</em> remove your sign-in record (name and email) at Neon Auth, or your customer and order history at
              Polar. If you sign in again later, a new, empty account is created. To have your sign-in record removed too,
              email <Mail />.
            </p>
            <p>
              Depending on where you live (for example under the GDPR, UK GDPR, or Turkey&apos;s KVKK), you may also have
              the right to access a copy of your data, correct it, delete it, restrict or object to how we use it, and
              receive it in a portable format. There&apos;s no one-click export of everything yet; email <Mail /> and
              we&apos;ll respond within <Fill>30 days</Fill>. You can also complain to your local data protection
              authority.
            </p>
          </Section>

          <Section id="security" title="10. Security">
            <p>
              We use Google sign-in, so we never store passwords. Every request is checked against your session, and data
              is only ever read or written for the signed-in owner. Service credentials stay on our servers and never
              reach your browser. Our AI function accepts requests only from our own server, with a verified sign-in
              token, and we verify the signature of every billing notification from Polar. Data travels over HTTPS{" "}
              <Fill>confirm HTTPS is enforced in production</Fill>. No system is perfectly secure; if a breach affects
              your data, we&apos;ll notify you and the authorities as the law requires.
            </p>
          </Section>

          <Section id="transfers" title="11. International transfers">
            <p>
              Our providers may process data outside your country, including in the United States. Our database is
              hosted in <Fill>Neon region</Fill>. Where the law requires, we rely on safeguards such as the providers&apos;
              standard contractual clauses <Fill>confirm with each provider&apos;s data processing agreement</Fill>.
            </p>
          </Section>

          <Section id="children" title="12. Children">
            <p>
              Veyro is for job seekers and isn&apos;t meant for anyone under <Fill>16</Fill>. We don&apos;t knowingly
              collect children&apos;s data. If you think a child has given us personal data, email <Mail /> and
              we&apos;ll delete it.
            </p>
          </Section>

          <Section id="changes" title="13. Changes to this policy">
            <p>
              When we change this policy, we&apos;ll update the date at the top. For significant changes, we&apos;ll{" "}
              <Fill>tell you in the app before they take effect</Fill>.
            </p>
          </Section>

          <Section id="contact" title="14. Contact">
            <p>
              Questions or requests about your data: <Mail />. Postal address: <Fill>registered address</Fill>.{" "}
              <Fill>EU/UK representative, if required</Fill>.
            </p>
          </Section>
        </main>
      </div>
    </div>
  );
}
