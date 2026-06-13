import { getData } from "@/data/getToken";
import VideochatClientWrapper from "@/components/VideochatClientWrapper";
import Logo from "@/components/Logo";
import Link from "next/link";
import Script from "next/script";

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; host?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const userName = searchParams.name?.trim() || "Guest";
  // The meeting creator arrives from /meeting/new with host=1 and joins as the
  // Zoom host; invitees open a plain link and join as participants. When the
  // host leaves they end the session for everyone.
  const isHost = searchParams.host === "1";

  let jwt: string;
  try {
    jwt = getData(params.id, isHost ? 1 : 0);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate token";
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-tl-navy p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <Logo size="md" className="justify-center" />
          <div className="rounded-lg bg-tl-navy-800 border border-white/[0.08] p-8 shadow-xl">
            <h1 className="text-lg font-semibold text-tl-error mb-3">
              Connection error
            </h1>
            <p className="text-sm text-white/60 mb-4">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-tl-blue hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <VideochatClientWrapper
        slug={params.id}
        JWT={jwt}
        userName={userName}
        isHost={isHost}
      />
      <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
    </>
  );
}
