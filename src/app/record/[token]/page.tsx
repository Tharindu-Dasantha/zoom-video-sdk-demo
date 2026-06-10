import Script from "next/script";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const RecordingFlow = dynamic(() => import("./RecordingFlow"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-tl-navy">
      <Loader2 className="h-8 w-8 animate-spin text-tl-blue" />
    </div>
  ),
});

export default async function RecordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      <RecordingFlow token={token} />
      <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
    </>
  );
}
