import Image from "next/image";
import { cn } from "@/lib/utils";
import logoImg from "../../public/Logo/logo.png";

const SIZES = {
  sm: "h-5 sm:h-6",
  md: "h-6 sm:h-8",
  lg: "h-9 sm:h-12",
  xl: "h-12 sm:h-16",
} as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  className?: string;
}

export default function Logo({ size = "sm", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <Image
        src={logoImg}
        alt="tenon-Link Connect"
        priority
        className={cn(SIZES[size], "w-auto object-contain")}
      />
      <div className={cn(
        "flex items-center border-l border-white/20 pl-2 ml-0.5 self-center font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#34B558] to-[#13A983] leading-none",
        size === "sm" && "text-xs sm:text-sm h-3.5 sm:h-4",
        size === "md" && "text-sm sm:text-base h-4 sm:h-5",
        size === "lg" && "text-lg sm:text-xl h-6 sm:h-8",
        size === "xl" && "text-xl sm:text-2xl h-8 sm:h-10"
      )}>
        Connect
      </div>
    </span>
  );
}
