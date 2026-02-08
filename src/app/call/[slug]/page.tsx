import { getData } from "@/data/getToken";
import VideochatClientWrapper from "@/components/VideochatClientWrapper";
import Script from "next/script";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;

  let jwt: string;
  try {
    jwt = getData(params.slug);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate token";
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-destructive mb-3">
            Connection Error
          </h1>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          <a
            href="/"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <VideochatClientWrapper slug={params.slug} JWT={jwt} />
      <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
    </main>
  );
}
