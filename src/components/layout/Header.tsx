import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

type HeaderLink = {
  href: string;
  label: string;
};

type HeaderProps = {
  brand: string;
  links: readonly HeaderLink[];
  cta: string;
  mobileCta: string;
  mobileNavLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  languageSwitchLabel: string;
  currentLanguage: "es" | "en";
  alternateUrl: string;
  switchLabel: string;
};

export default function Header({
  brand,
  links,
  cta,
  mobileCta,
  mobileNavLabel,
  openMenuLabel,
  closeMenuLabel,
  languageSwitchLabel,
  currentLanguage,
  alternateUrl,
  switchLabel,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-sm">{brand}</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={alternateUrl}
            hrefLang={currentLanguage === "es" ? "en" : "es"}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            aria-label={languageSwitchLabel}
          >
            {switchLabel}
          </a>
          <a 
            href="#contacto"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            {cta}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
          aria-label={open ? closeMenuLabel : openMenuLabel}
          aria-expanded={open}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-background/95 backdrop-blur-xl md:hidden",
          "overflow-hidden transition-all duration-200 ease-out",
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav className="mx-auto flex max-w-6xl flex-col px-6 py-3" aria-label={mobileNavLabel}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}

          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "mt-2 justify-center"
            )}
          >
            {mobileCta}
          </a>

          <a
            href={alternateUrl}
            hrefLang={currentLanguage === "es" ? "en" : "es"}
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-2 justify-center"
            )}
            aria-label={languageSwitchLabel}
          >
            {switchLabel}
          </a>
        </nav>
      </div>
    </header>
  );
}
