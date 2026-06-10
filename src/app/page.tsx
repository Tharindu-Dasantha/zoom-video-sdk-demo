import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Video, Mail, MessageSquareText, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Video,
    title: "Instant meetings",
    description: "Create a room and join from the browser. No downloads, no accounts.",
  },
  {
    icon: Mail,
    title: "Secure email invites",
    description: "Send a meeting link straight to a participant's inbox.",
  },
  {
    icon: MessageSquareText,
    title: "Testimonial recording",
    description: "Share a recording link and capture video testimonials on the spot.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-tl-navy">
      {/* Nav */}
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/meeting/new">
              <Button size="sm">Start a meeting</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          One link. Every meeting.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/60">
          Start a video meeting, share a single link, and collect testimonial
          recordings — powered by tenon-Link Connect.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <Link href="/meeting/new">
            <Button size="lg">
              Start a meeting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg bg-tl-navy-800 border border-white/[0.08] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tl-blue/10">
                <Icon className="h-5 w-5 text-tl-blue" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm text-white/60">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} tenon-Link Connect
          </p>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>A tenon-Link product by</span>
            <Image
              src="/Kneoxt/dark.png"
              alt="Kneoxt"
              width={20}
              height={20}
              className="rounded-sm"
            />
            <span className="font-medium text-white">Kneoxt</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
