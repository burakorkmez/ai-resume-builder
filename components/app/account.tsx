"use client";

import { useState, type ReactNode } from "react";
import { Dialog } from "@/components/dialog";
import { button, Field, Loading, SUPPORT_EMAIL } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { deleteAccount, useAppState } from "@/lib/store";

// Full page load (not a client navigation) so this account's cached data is dropped from memory and history.
const signOut = () => authClient.signOut().finally(() => location.replace("/"));

export function Account() {
  const state = useAppState();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!state) return <Loading />;

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
      <p className="mt-1 text-slate-600">Your profile, privacy, and data.</p>

      <div className="mt-8 grid gap-4">
        <Card title="Profile">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid size-14 place-items-center rounded-full bg-slate-900 text-xl font-medium text-white">
              {state.user.name.charAt(0)}
            </div>
            <div className="mr-auto">
              <p className="font-medium">{state.user.name}</p>
              <p className="text-sm text-slate-500">{state.user.email}</p>
              <p className="mt-1 text-xs text-slate-500">Signed in with Google</p>
            </div>
            <button type="button" className={button.secondary} onClick={signOut}>
              Sign out
            </button>
          </div>
        </Card>

        <Card title="How AI uses your data">
          <p>
            When you use an AI action, Veyro sends the relevant parts of your resume to OpenAI to write suggestions. Your name, email, phone, address, and personal links are left out.
            Suggestions only reshape what you&apos;ve written, and nothing changes until you accept it.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {state.aiDisclosureAccepted ? "You've seen this notice." : "You'll see this notice before your first AI action."}
          </p>
        </Card>

        <Card title="Support">
          <p>
            Questions, billing problems, or refund requests? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-indigo-600 hover:text-indigo-500">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </Card>

        <Card title="Delete account" danger>
          <p>
            Permanently deletes your account, every resume, and all AI suggestions. If you&apos;re on Pro, future charges
            stop. This can&apos;t be undone.
          </p>
          <button type="button" className={`${button.danger} mt-4`} onClick={() => setDeleteOpen(true)}>
            Delete account
          </button>
        </Card>
      </div>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete your account?">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setDeleting(true);
            setDeleteError("");
            try {
              await deleteAccount();
            } catch {
              setDeleteError("Your account couldn't be deleted. Check your connection and try again.");
              setDeleting(false);
              return;
            }
            await signOut();
          }}
        >
          <p>
            This removes {state.resumes.length} resume{state.resumes.length === 1 ? "" : "s"} and everything else tied to
            your account. Type <span className="font-mono font-medium text-slate-900">delete</span> to confirm.
          </p>
          <Field
            label="Confirmation"
            className="mt-4"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
          {deleteError && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className={button.secondary} onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
            <button className={button.danger} disabled={deleting || confirmText.trim().toLowerCase() !== "delete"}>
              {deleting ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

function Card({ title, danger, children }: { title: string; danger?: boolean; children: ReactNode }) {
  return (
    <section className={`rounded-2xl bg-white p-6 ring-1 ${danger ? "ring-red-200" : "ring-slate-200"}`}>
      <h2 className={`font-semibold ${danger ? "text-red-600" : ""}`}>{title}</h2>
      <div className="mt-3 text-slate-600">{children}</div>
    </section>
  );
}
