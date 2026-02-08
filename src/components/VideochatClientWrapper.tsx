"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Videochat = dynamic<{ slug: string; JWT: string; userName: string }>(
  () => import("./Videochat"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-[#202124]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8ab4f8]" />
        <span className="ml-3 text-sm text-[#9aa0a6]">
          Loading video SDK...
        </span>
      </div>
    ),
  }
);

export default function VideochatClientWrapper({
  slug,
  JWT,
  userName,
}: {
  slug: string;
  JWT: string;
  userName: string;
}) {
  return <Videochat slug={slug} JWT={JWT} userName={userName} />;
} 