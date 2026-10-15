import { Suspense } from "react";
import { Editor, EditorSkeleton } from "@/components/editor/editor";

export const metadata = { title: "Editor" };

export default function Page({ params }: PageProps<"/resumes/[resumeId]">) {
  return <Suspense fallback={<EditorSkeleton />}>{params.then(({ resumeId }) => <Editor id={resumeId} />)}</Suspense>;
}
