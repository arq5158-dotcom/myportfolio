'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { scrollTo } from './Experience';

const LINKS = [
  ['Index', '#index'],
  ['Work', '#work'],
  ['Dossier', '#dossier'],
  ['Signal', '#signal'],
];

export default function Nav({ name }: { name: string }) {
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  // step out of the way going down, come back on the way up
  useMotionValueEvent(scrollY, 'change', (y) => {
    const down = y > last.current;
    last.current = y;
    setHidden(down && y > 320);
  });

  return (
    <>
      <motion.div
        style={{ scaleX }}
        aria-hidden
        className="fixed inset-x-0 top-0 z-[140] h-[2px] origin-left bg-[var(--volt)]"
      />
      <header
        id="nav"
        className="fixed inset-x-0 top-0 z-[130] mix-blend-difference transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: hidden ? 'translate3d(0,-110%,0)' : 'none' }}
      >
        <div className="shell flex items-center justify-between py-[clamp(0.9rem,2.4vh,1.6rem)]">
          <button
            onClick={() => scrollTo('#top')}
            className="t-mono hidden text-white sm:block"
            aria-label="Back to top"
          >
            {name}
          </button>
          <nav className="flex w-full items-center justify-between gap-[clamp(0.9rem,2.4vw,2.4rem)] sm:w-auto sm:justify-end">
            {LINKS.map(([label, href]) => (
              <button
                key={href}
                onClick={() => scrollTo(href)}
                className="t-mono wipe text-white"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
