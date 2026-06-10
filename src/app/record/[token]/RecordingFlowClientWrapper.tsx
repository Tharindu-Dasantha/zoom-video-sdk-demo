"use client";

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

export default function RecordingFlowClientWrapper({ token }: { token: string }) {
  return <RecordingFlow token={token} />;
}
