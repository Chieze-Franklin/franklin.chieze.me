"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // mouse target + smoothed current value (lerp), in range -1..1
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      // ease toward the cursor
      cur.current.x += (target.current.x - cur.current.x) * 0.07;
      cur.current.y += (target.current.y - cur.current.y) * 0.07;
      const { x, y } = cur.current;

      // Whole block tilts toward the mouse (3D rotation)
      if (sceneRef.current) {
        const ry = x * 16; // rotateY
        const rx = -y * 12; // rotateX
        sceneRef.current.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }

      // Extruded 3D text — shadow depth direction follows the skew
      if (titleRef.current) {
        const dx = x * 1.1;            // horizontal extrusion follows mouse
        const dy = 0.55 + y * 0.9;     // mostly downward, modulated by mouse
        const N = 9;
        const step = 1.35;
        const layers: string[] = [];
        for (let i = 1; i <= N; i++) {
          layers.push(`${(dx * i * step).toFixed(2)}px ${(dy * i * step).toFixed(2)}px 0 var(--accent)`);
        }
        // soft grounding shadow at the end of the extrusion
        layers.push(`${(dx * 14).toFixed(2)}px ${(dy * 16).toFixed(2)}px 24px rgba(0,0,0,0.28)`);
        titleRef.current.style.textShadow = layers.join(",");
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const p = Math.min(scrollY / 520, 1); // scroll progress 0→1

  return (
    <section className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden">
      {/* Luminous glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[34%]"
        style={{
          width: "min(120vw, 1100px)",
          height: "min(120vw, 1100px)",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle at center, var(--glow) 0%, transparent 62%)",
          filter: "blur(40px)",
          opacity: (1 - p) * 0.9,
          animation: "drift 14s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 8%, var(--accent-soft) 0%, transparent 70%)",
          opacity: 1 - p,
        }}
      />

      {/* Perspective stage — scroll fade lives here, mouse tilt on the inner scene */}
      <div
        className="relative z-10 px-6"
        style={{
          perspective: "900px",
          transform: `translateY(${p * 36}px)`,
          opacity: 1 - p * 1.5,
        }}
      >
        <div
          ref={sceneRef}
          className="text-center"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          <p className="eyebrow rise mb-6" style={{ color: "var(--accent)", animationDelay: "0.05s" }}>
            Engineer · Entrepreneur · Builder
          </p>

          <h1
            ref={titleRef}
            className="display rise"
            style={{
              fontSize: "clamp(3.4rem, 12vw, 9.5rem)",
              color: "var(--text)",
              animationDelay: "0.16s",
            }}
          >
            Franklin Chieze
          </h1>

          <p
            className="rise mx-auto mt-7 max-w-xl text-[19px] leading-relaxed sm:text-[21px]"
            style={{ color: "var(--text-2)", animationDelay: "0.3s" }}
          >
            Building ProteusAI &amp; Dreambase. I design and build impactful,
            scalable products across Africa&apos;s tech ecosystem.
          </p>

          <div
            className="rise mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "0.44s" }}
          >
            <Link href="/works" className="btn btn-primary">
              View my work <ArrowRight size={16} />
            </Link>
            <a href="#latest" className="btn btn-ghost">
              Latest news
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="fade absolute bottom-10 left-1/2 -translate-x-1/2"
        style={{ opacity: Math.max(0, 1 - p * 4), animationDelay: "0.9s" }}
      >
        <div
          className="flex h-9 w-5.5 items-start justify-center rounded-full pt-2"
          style={{ border: "1.5px solid var(--text-3)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--text-3)", animation: "scrollcue 1.8s ease-in-out infinite" }}
          />
        </div>
      </div>

      {/* Bottom fade into page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
      />
    </section>
  );
}
