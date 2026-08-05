"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeClock } from "@/components/clock/ThemeClock";

const links = [
  { href: "/", label: "News" },
  { href: "/works", label: "Works" },
  { href: "/plays", label: "Plays" },
  { href: "/thoughts", label: "Thoughts" },
  { href: "/cv", label: "CV" },
];

export function Nav() {
  const pathname = usePathname();
  const hasHero = pathname === "/"; // only the landing page has a full-screen hero
  const [solid, setSolid] = useState(!hasHero);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!hasHero) {
      setSolid(true);
      return;
    }
    // On the landing page: transparent over the hero, solid once scrolled past most of it.
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasHero]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40"
      style={{
        height: 56,
        background: solid ? "var(--nav)" : "transparent",
        backdropFilter: solid ? "var(--blur)" : "none",
        WebkitBackdropFilter: solid ? "var(--blur)" : "none",
        borderBottom: `1px solid ${solid ? "var(--line-2)" : "transparent"}`,
        transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      <div className="mx-auto flex h-full max-w-300 items-center justify-between px-5 sm:px-8">
        {/* Logo — left. Name hides on small screens, leaving just the logo. */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-opacity hover:opacity-60"
          style={{ color: "var(--text)" }}
        >
          <Image
            src="/franklin_chieze_128.png"
            alt="Franklin Chieze"
            width={28}
            height={28}
            priority
            className="h-7 w-7 object-contain"
          />
          <span className="hidden sm:inline">Franklin Chieze</span>
        </Link>

        {/* Menu + clock — right aligned */}
        <div className="flex items-center gap-1">
          {/* Desktop links */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
                  style={{ color: active ? "var(--text)" : "var(--text-2)" }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-2">
            <ThemeClock />
          </div>
          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="ml-1 rounded-full p-2 transition-opacity hover:opacity-60 md:hidden"
            style={{ color: "var(--text)" }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Backdrop — tap anywhere outside the menu to close it */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 top-14 z-30 cursor-default md:hidden"
        />
      )}

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          className="absolute inset-x-0 top-14 z-40 flex flex-col gap-1 px-5 py-3 sm:px-8 md:hidden"
          style={{
            background: "var(--nav)",
            backdropFilter: "var(--blur)",
            WebkitBackdropFilter: "var(--blur)",
            borderBottom: "1px solid var(--line-2)",
          }}
        >
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--text)" : "var(--text-2)",
                  background: active ? "var(--surface-2)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
