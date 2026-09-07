'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { HeroContent } from '@/types';
import NeuralField from './NeuralField';
import { scrollTo } from './Experience';

/** Splits a word into per-character spans so the entry sequence can stagger them. */
function Split({ text, from = 0 }: { text: string; from?: number }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
      {text.split('').map((c, i) => (
        <span key={i} className="char" style={{ ['--i' as string]: from + i }}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  );
}

function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t || '--:--:--'} PKT</span>;
}

export default function Hero({ hero }: { hero: HeroContent }) {
  const ref = useRef<HTMLElement>(null);
  const [first, ...rest] = (hero.name || 'ABDUL REHMAN').trim().split(/\s+/);
  const second = rest.join(' ');

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const typeY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const fieldY = useTransform(scrollYProgress, [0, 1], [0, 160]);

  // pointer parallax — a few px of drift keeps the type feeling suspended
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const on = (e: PointerEvent) => {
      px.set((e.clientX / innerWidth - 0.5) * 26);
      py.set((e.clientY / innerHeight - 0.5) * 16);
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, [px, py]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex h-[100svh] min-h-[38rem] flex-col justify-end overflow-hidden"
    >
      <motion.div style={{ y: fieldY }} className="absolute inset-0">
        <NeuralField />
      </motion.div>

      {/* vignette so the type never fights the constellation */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(85% 60% at 16% 86%, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.5) 45%, rgba(10,10,12,0) 74%), linear-gradient(to top, #0a0a0c 0%, rgba(10,10,12,0) 26%)',
        }}
      />

      <motion.div
        style={{ y: typeY, opacity: fade }}
        className="shell relative z-10 pb-[clamp(1.6rem,4vh,3rem)]"
      >
        <motion.div style={{ x: sx, y: sy }}>
          <div className="mb-[clamp(1rem,3vh,2.2rem)] flex items-center gap-3">
            <span className="dot-live" />
            <span className="t-mono t-label">
              {hero.title || 'AI Engineer'} — {hero.location}
            </span>
          </div>

          <h1 className="t-display s-mega text-[var(--fg)]">
            <span className="block">
              <Split text={first} />
            </span>
            <span className="block">
              <Split text={second} from={first.length} />
            </span>
          </h1>
        </motion.div>

        <div className="rule mt-[clamp(1.4rem,4vh,2.6rem)]" />

        <div className="mt-[clamp(1rem,2.4vh,1.6rem)] grid gap-6 md:grid-cols-12 md:items-end">
          <p className="s-lead max-w-[34ch] text-[var(--fg)] md:col-span-5">
            {hero.tagline}
          </p>

          <div className="t-mono t-label md:col-span-4 md:justify-self-center">
            {hero.status ? (
              <span className="pill">
                <span className="dot-live" />
                {hero.status}
              </span>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-6 md:col-span-3 md:flex-col md:items-end">
            <span className="t-mono t-label">
              <Clock />
            </span>
            <button
              onClick={() => scrollTo('#index')}
              data-magnetic
              className="t-mono group flex items-center gap-2 text-[var(--fg)] transition-colors hover:text-[var(--volt)]"
            >
              Scroll
              <span className="relative block h-[1px] w-12 overflow-hidden bg-[var(--rule)]">
                <span className="absolute inset-0 animate-[scan_1.8s_linear_infinite] bg-[var(--volt)]" />
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
