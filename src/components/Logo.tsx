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
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/Logo/logo.png"
        alt="tenon-Link"
        width={2206}
        height={543}
        priority
        className={cn(SIZES[size], "w-auto")}
      />
    </span>
  );
}
