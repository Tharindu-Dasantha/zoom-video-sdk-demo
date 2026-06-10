import Script from "next/script";
import RecordingFlowClientWrapper from "./RecordingFlowClientWrapper";

export default async function RecordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <>
      <RecordingFlowClientWrapper token={token} />
      <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
    </>
  );
}
