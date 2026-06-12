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
    <div className="relative min-h-screen bg-tl-navy overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(19,169,131,0.12),transparent_60%)] pointer-events-none" />

      {/* Nav */}
      <header className="border-b border-white/[0.08] backdrop-blur-sm bg-tl-navy/20 sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-5">
          <Logo size="md" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white text-xs sm:text-sm px-2.5 sm:px-3">
                Sign in
              </Button>
            </Link>
            <Link href="/meeting/new">
              <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4">Start a meeting</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-[68px] leading-tight">
          One link.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34B558] to-[#13A983]">
            Every meeting.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-white/60 leading-relaxed">
          Start a video meeting, share a single link, and collect testimonial
          recordings — powered by tenon-Link Connect.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <Link href="/meeting/new">
            <Button size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
              Start a meeting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-28">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl bg-tl-navy-800/60 border border-white/[0.08] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#13A983]/30 hover:bg-tl-navy-800/80 hover:shadow-[0_12px_40px_rgba(19,169,131,0.04)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#13A983]/10 border border-[#13A983]/20 transition-colors group-hover:bg-[#13A983]/20">
                <Icon className="h-6 w-6 text-[#13A983]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2.5 text-sm text-white/60 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
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
