import { cn } from "@/lib/utils";

type Language = "es" | "en";

type LanguageSwitchProps = {
  currentLanguage: Language;
  alternateUrl: string;
  switchLabel: string;
  groupLabel: string;
  className?: string;
};

function FlagMx({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={cn("h-3 w-4 shrink-0 rounded-[2px]", className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="30" height="20" fill="#ffffff" />
      <rect width="10" height="20" fill="#006341" />
      <rect x="20" width="10" height="20" fill="#ce1126" />
      <ellipse cx="15" cy="10" rx="2.4" ry="3.2" fill="#3f2a14" opacity="0.85" />
    </svg>
  );
}

function FlagUs({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={cn("h-3 w-4 shrink-0 rounded-[2px]", className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="30" height="20" fill="#ffffff" />
      <rect width="30" height="4" fill="#b22234" />
      <rect y="8" width="30" height="4" fill="#b22234" />
      <rect y="16" width="30" height="4" fill="#b22234" />
      <rect width="13" height="12" fill="#3c3b6e" />
    </svg>
  );
}

const FLAGS: Record<Language, typeof FlagMx> = {
  es: FlagMx,
  en: FlagUs,
};

const ORDER: Language[] = ["es", "en"];

export default function LanguageSwitch({
  currentLanguage,
  alternateUrl,
  switchLabel,
  groupLabel,
  className,
}: LanguageSwitchProps) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5",
        className
      )}
    >
      {ORDER.map((lang) => {
        const isActive = lang === currentLanguage;
        const Flag = FLAGS[lang];
        const code = lang.toUpperCase();

        if (isActive) {
          return (
            <span
              key={lang}
              aria-current="true"
              className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs font-medium text-foreground shadow-sm"
            >
              <Flag />
              {code}
            </span>
          );
        }

        return (
          <a
            key={lang}
            href={alternateUrl}
            hrefLang={lang}
            aria-label={switchLabel}
            className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Flag />
            {code}
          </a>
        );
      })}
    </div>
  );
}
