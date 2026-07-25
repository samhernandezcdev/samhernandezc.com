import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { buttonVariants } from "../ui/button";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import LanguageSwitch from "./LanguageSwitch";

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
  desktopNavLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  languageSwitchLabel: string;
  languageGroupLabel: string;
  currentLanguage: "es" | "en";
  alternateUrl: string;
};

export default function Header({
  brand,
  links,
  cta,
  mobileCta,
  mobileNavLabel,
  desktopNavLabel,
  openMenuLabel,
  closeMenuLabel,
  languageSwitchLabel,
  languageGroupLabel,
  currentLanguage,
  alternateUrl,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.href.replace("#", "")))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          setActiveHref(`#${mostVisible.target.id}`);
        }
      },
      { rootMargin: "-100px 0px -55% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstMobileLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      toggleButtonRef.current?.focus();
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
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

        <nav className="hidden items-center gap-1 md:flex" aria-label={desktopNavLabel}>
          {links.map((link) => {
            const isActive = link.href === activeHref;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "font-medium text-foreground after:absolute after:-bottom-0.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-brand after:content-['']"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitch
            currentLanguage={currentLanguage}
            alternateUrl={alternateUrl}
            switchLabel={languageSwitchLabel}
            groupLabel={languageGroupLabel}
          />
          <a
            href="#contacto"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            {cta}
          </a>
        </div>

        <button
          ref={toggleButtonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
          aria-label={open ? closeMenuLabel : openMenuLabel}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        inert={!open}
        className={cn(
          "border-t border-border bg-background/95 shadow-lg backdrop-blur-xl md:hidden",
          "max-h-[calc(100dvh-4rem)] overflow-y-auto",
          open ? "opacity-100 mobile-menu-enter" : "max-h-0 opacity-0"
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4"
          aria-label={mobileNavLabel}
        >
          {links.map((link, index) => {
            const isActive = link.href === activeHref;
            return (
              <a
                key={link.href}
                ref={index === 0 ? firstMobileLinkRef : undefined}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "border-l-2 py-3 pl-3 text-sm transition-colors",
                  isActive
                    ? "border-brand font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </a>
            );
          })}

          <Separator className="my-2" />

          <div className="flex flex-col items-center gap-3 pb-1">
            <LanguageSwitch
              currentLanguage={currentLanguage}
              alternateUrl={alternateUrl}
              switchLabel={languageSwitchLabel}
              groupLabel={languageGroupLabel}
            />
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "w-full justify-center"
              )}
            >
              {mobileCta}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
