import { useState } from "react";
import { cn } from "@/lib/utils";

function getFaviconUrl(websiteUrl?: string): string | null {
  if (!websiteUrl) return null;
  try {
    const { hostname } = new URL(websiteUrl);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

interface ToolLogoProps {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  className?: string;
  letterClassName?: string;
}

const ToolLogo = ({ name, logoUrl, websiteUrl, className, letterClassName }: ToolLogoProps) => {
  const [stage, setStage] = useState<"logo" | "favicon" | "letter">(
    logoUrl ? "logo" : "favicon"
  );

  const faviconUrl = getFaviconUrl(websiteUrl);
  const firstLetter = name?.charAt(0)?.toUpperCase() || "?";

  if (stage === "letter" || (stage === "favicon" && !faviconUrl)) {
    return (
      <span className={cn("flex items-center justify-center font-bold text-primary-foreground bg-primary select-none", letterClassName ?? "text-lg", className)}>
        {firstLetter}
      </span>
    );
  }

  const src = stage === "logo" ? logoUrl! : faviconUrl!;

  return (
    <img
      src={src}
      alt={name}
      className={cn("h-full w-full object-cover", className)}
      loading="lazy"
      onError={() => {
        if (stage === "logo" && faviconUrl) {
          setStage("favicon");
        } else {
          setStage("letter");
        }
      }}
    />
  );
};

export default ToolLogo;
