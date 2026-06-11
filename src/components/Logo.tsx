import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-6",
  md: "h-8",
  lg: "h-12",
  xl: "h-16",
} as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  className?: string;
}

export default function Logo({ size = "sm", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <Image
        src="/Logo/logo.png"
        alt="tenon-Link Connect"
        width={2206}
        height={543}
        priority
        className={cn(SIZES[size], "w-auto object-contain")}
      />
      <div className={cn(
        "flex items-center border-l border-white/20 pl-2.5 ml-0.5 self-center font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#34B558] to-[#13A983] leading-none",
        size === "sm" && "text-sm h-4",
        size === "md" && "text-base h-5",
        size === "lg" && "text-xl h-8",
        size === "xl" && "text-2xl h-10"
      )}>
        Connect
      </div>
    </span>
  );
}
