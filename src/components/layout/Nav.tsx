"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
        {/* Logo — left */}
        <Link
          href="/"
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
          Franklin Chieze
        </Link>

        {/* Menu + clock — right aligned */}
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-0.5">
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
        </div>
      </div>
    </header>
  );
}
