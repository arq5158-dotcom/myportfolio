'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

/* Module-scoped so overlays can freeze the page without prop-drilling a context. */
let lenis: Lenis | null = null;
let revealer: IntersectionObserver | null = null;

/** Observe any [data-reveal] that hasn't fired yet — call after mounting new markup. */
export function scanReveals() {
  document
    .querySelectorAll('[data-reveal]:not(.is-in)')
    .forEach((el) => revealer?.observe(el));
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle('lenis-stopped', locked);
}

export function scrollTo(target: string) {
  const el = document.querySelector(target);
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Everything that has to run once for the whole page: inertial scroll, the
 * reveal observer, the custom cursor and the entry sequence.
 */
export default function Experience() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  /* --- inertial scroll ---------------------------------------------------- */
  useEffect(() => {
    if (reduced()) return;
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1.05 });
    let id = requestAnimationFrame(function raf(t: number) {
      lenis?.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  /* --- reveal on scroll --------------------------------------------------- */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );
    revealer = io;
    scanReveals();
    return () => {
      io.disconnect();
      revealer = null;
    };
  }, []);

  /* --- entry sequence ----------------------------------------------------- */
  useEffect(() => {
    if (reduced()) {
      setCount(100);
      setDone(true);
      document.documentElement.classList.add('entered');
      return;
    }
    const start = performance.now();
    const span = 1700;
    let id = requestAnimationFrame(function tick(now: number) {
      const p = Math.min(1, (now - start) / span);
      // ease-out so the counter sprints then settles, like a real load
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) id = requestAnimationFrame(tick);
      else {
        document.documentElement.classList.add('entered');
        setTimeout(() => setDone(true), 180);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* --- cursor + magnetics ------------------------------------------------- */
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const soft = { ...pos };
    let magnet: HTMLElement | null = null;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const t = e.target as Element;
      const hot = t.closest?.('a, button, [data-hot]');
      ring.current?.classList.toggle('hot', !!hot);

      const m = t.closest?.('[data-magnetic]') as HTMLElement | null;
      if (magnet && magnet !== m) magnet.style.transform = '';
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = `translate3d(${dx * 0.22}px, ${dy * 0.32}px, 0)`;
      }
    };

    const leave = () => {
      if (magnet) magnet.style.transform = '';
      magnet = null;
    };

    let id = requestAnimationFrame(function raf() {
      soft.x += (pos.x - soft.x) * 0.16;
      soft.y += (pos.y - soft.y) * 0.16;
      if (dot.current)
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${soft.x}px, ${soft.y}px, 0)`;
      id = requestAnimationFrame(raf);
    });

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <>
      <div id="preloader" className={done ? 'done' : undefined} aria-hidden>
        <span className="t-mono t-label">Latent&nbsp;space / initialising</span>
        <span
          className="t-display"
          style={{ fontSize: 'clamp(3rem, 11vw, 10rem)', lineHeight: 0.78 }}
        >
          {String(count).padStart(3, '0')}
        </span>
        <span className="pl-bar" style={{ width: `${count}%` }} />
      </div>

      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div className="grain" aria-hidden />
    </>
  );
}
