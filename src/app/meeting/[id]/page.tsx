import { getData } from "@/data/getToken";
import VideochatClientWrapper from "@/components/VideochatClientWrapper";
import Logo from "@/components/Logo";
import Script from "next/script";

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const userName = searchParams.name?.trim() || "Guest";

  let jwt: string;
  try {
    jwt = getData(params.id);
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
            <a
              href="/"
              className="inline-flex items-center text-sm font-medium text-tl-blue hover:underline"
            >
              ← Back to home
            </a>
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
      />
      <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
    </>
  );
}
