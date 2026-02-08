import { getData } from "@/data/getToken";
import VideochatClientWrapper from "@/components/VideochatClientWrapper";
import Script from "next/script";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const userName = searchParams.name?.trim() || "Guest";

  let jwt: string;
  try {
    jwt = getData(params.slug);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate token";
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#202124] p-24">
        <div className="max-w-md rounded-2xl bg-[#292a2d] border border-[#3c4043] p-8 text-center shadow-xl">
          <h1 className="text-xl font-medium text-red-400 mb-3">
            Connection Error
          </h1>
          <p className="text-sm text-[#9aa0a6] mb-4">{message}</p>
          <a
            href="/"
            className="inline-flex items-center text-sm font-medium text-[#8ab4f8] hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <>
      <VideochatClientWrapper
        slug={params.slug}
        JWT={jwt}
        userName={userName}
      />
      <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
    </>
  );
}
