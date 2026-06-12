import Image from "next/image";
import { cn } from "@/lib/utils";
import kneoxtLogo from "../../public/Kneoxt/kneoxt_light.svg";

interface KneoxtPillProps {
  className?: string;
}

export default function KneoxtPill({ className }: KneoxtPillProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/60 px-3 py-1.5 text-[11px] text-white/50 backdrop-blur-md transition-all duration-300 hover:text-white hover:border-white/20 select-none shadow-lg shadow-black/40",
        className
      )}
    >
      <span className="font-light tracking-wide">Product by</span>
      <Image
        src={kneoxtLogo}
        alt="Kneoxt"
        className="h-3 w-auto object-contain brightness-0 invert opacity-60 hover:opacity-100 transition-opacity duration-150"
      />
    </div>
  );
}
