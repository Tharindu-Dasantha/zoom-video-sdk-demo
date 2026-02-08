"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Videochat = dynamic<{ slug: string; JWT: string }>(
  () => import("./Videochat"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Loading video SDK...
        </span>
      </div>
    ),
  }
);

export default function VideochatClientWrapper({
  slug,
  JWT,
}: {
  slug: string;
  JWT: string;
}) {
  return <Videochat slug={slug} JWT={JWT} />;
} 