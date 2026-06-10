import { cn } from "@/lib/utils";

const SIZES = {
  sm: { mark: "h-3.5", word: "text-base" },
  md: { mark: "h-5", word: "text-xl" },
  lg: { mark: "h-7", word: "text-3xl" },
} as const;

interface LogoProps {
  size?: keyof typeof SIZES;
  showWordmark?: boolean;
  className?: string;
}

// Two filled circles joined by a solid bridge — placeholder mark built to the
// design.md construction spec (bridge height = 40% of circle diameter).
// Swap for the official tenon-Link Connect mark SVG when it's provided.
export default function Logo({
  size = "sm",
  showWordmark = true,
  className,
}: LogoProps) {
  const { mark, word } = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 36 16"
        fill="currentColor"
        aria-hidden="true"
        className={cn(mark, "w-auto text-tl-blue shrink-0")}
      >
        <circle cx="8" cy="8" r="8" />
        <rect x="16" y="4.8" width="4" height="6.4" />
        <circle cx="28" cy="8" r="8" />
      </svg>
      {showWordmark && (
        <span className={cn("font-semibold tracking-[-0.025em] leading-none", word)}>
          <span className="text-white">tenon-Link</span>{" "}
          <span className="text-tl-blue">Connect</span>
        </span>
      )}
    </span>
  );
}
