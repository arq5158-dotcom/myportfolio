'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Project } from '@/types';
import { lockScroll, scanReveals } from './Experience';

const PANEL_VW = 62; // width of one project panel, in vw
const img = (s: string) => encodeURI(s);

/* ------------------------------------------------------------------ panel */

function Panel({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const short = project.title.split(/\s+[–—-]\s+|\s+-\s+/)[0];
  return (
    <article className="flex h-full flex-col">
      <button
        onClick={onOpen}
        className="frame group block min-h-0 w-full flex-1 text-left"
        aria-label={`Open case study: ${short}`}
      >
        <img src={img(project.thumbnail)} alt="" loading="lazy" decoding="async" />
        <span className="pointer-events-none absolute inset-0 flex items-end justify-end p-5">
          <span className="t-mono translate-y-2 rounded-full border border-[var(--volt)] bg-[var(--volt)] px-4 py-2 text-[#0a0a0c] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            Open case
          </span>
        </span>
      </button>

      <div className="mt-6 flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h3 className="t-display text-[clamp(1.4rem,2.5vw,2.6rem)] leading-[0.95]">
            {short}
          </h3>
          <p className="t-mono t-label mt-3 truncate">{project.tags.join(' / ')}</p>
        </div>
        <span className="t-mono t-label shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- overlay */

function Case({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    lockScroll(true);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', key);
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
      tabIndex={-1}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[150] overflow-y-auto overscroll-contain bg-[var(--ink)]"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--rule)] bg-[var(--ink)]/85 px-[4vw] py-4 backdrop-blur-xl">
        <span className="t-mono t-label">Case study</span>
        <button
          onClick={onClose}
          autoFocus
          data-magnetic
          className="t-mono flex items-center gap-3 text-[var(--fg)] transition-colors hover:text-[var(--volt)]"
        >
          Close <span aria-hidden>✕</span>
        </button>
      </div>

      <div className="shell py-[clamp(3rem,9vh,7rem)]">
        <h2 className="t-display text-[clamp(2rem,6vw,5.5rem)] leading-[0.9]">
          {project.title.split(/\s+[–—-]\s+|\s+-\s+/)[0]}
        </h2>

        <div className="mt-[clamp(2rem,5vh,3.5rem)] grid gap-10 md:grid-cols-12">
          <p className="s-lead md:col-span-7">{project.description}</p>

          <div className="md:col-span-4 md:col-start-9">
            <span className="t-mono t-label">Stack</span>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((t) => (
                <span key={t} className="t-mono pill !py-1.5 !text-[0.66rem]">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {project.liveLink && (
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-mono wipe inline-block text-[var(--volt)] font-semibold"
                >
                  Launch live demo ↗
                </a>
              )}
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="t-mono wipe inline-block text-[var(--fg)] transition-colors hover:text-[var(--volt)]"
                >
                  View repository ↗
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="rule mt-[clamp(3rem,8vh,5rem)]" />

        <div className="grid gap-8 pt-[clamp(2rem,5vh,3.5rem)] md:grid-cols-12">
          <span className="t-mono t-label md:col-span-3">Capabilities</span>
          <ol className="md:col-span-9">
            {project.features.map((f, i) => (
              <li
                key={i}
                className="s-body flex gap-6 border-b border-[var(--rule-soft)] py-4 text-[var(--fg)]"
              >
                <span className="t-mono t-label shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {f}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-[clamp(3rem,8vh,6rem)] space-y-[clamp(1rem,3vh,2rem)]">
          {project.screenshots.map((s, i) => (
            <div key={i} className="frame aspect-[16/9] w-full">
              <img
                src={img(s)}
                alt={`${project.title} — view ${i + 1}`}
                loading="lazy"
                decoding="async"
                style={{ filter: 'none', transform: 'none' }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------- work */

export default function Work({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Project | null>(null);
  const [horizontal, setHorizontal] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const sync = () => setHorizontal(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // the vertical list remounts when the breakpoint flips — re-arm its reveals
  useEffect(scanReveals, [horizontal]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${projects.length * PANEL_VW}vw`]);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(projects.length - 1, Math.floor(v * projects.length * 1.06));
    setActive(Math.max(0, i));
  });

  const header = (
    <div className="flex items-baseline justify-between gap-8">
      <span className="t-mono t-label">02 / Selected work</span>
      <span className="t-mono t-label">
        {String(projects.length).padStart(2, '0')} projects
      </span>
    </div>
  );

  return (
    <>
      {horizontal ? (
        <section
          ref={ref}
          id="work"
          style={{ height: `calc(100vh + ${projects.length * PANEL_VW}vw)` }}
        >
          <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
            <div className="shell pt-[clamp(3.6rem,8vh,5.2rem)]">
              {header}
              <div className="rule mt-4" />
            </div>

            <motion.div style={{ x }} className="flex min-h-0 flex-1 items-center">
              {/* opening panel */}
              <div className="flex h-full w-screen shrink-0 items-center px-[4vw]">
                <div className="max-w-[46rem]">
                  <h2 className="t-display text-[clamp(3rem,8vw,8rem)] leading-[0.85]">
                    Selected
                    <br />
                    <span className="t-serif lowercase text-[var(--volt)]">work</span>
                  </h2>
                  <p className="s-lead mt-8 max-w-[38ch] text-[var(--fg-dim)]">
                    Systems shipped end to end — retrieval, detection, fine-tuning,
                    autonomy. Keep scrolling; the gallery moves sideways.
                  </p>
                  <span className="t-mono t-label mt-10 block">Scroll →</span>
                </div>
              </div>

              {projects.map((p, i) => (
                <div
                  key={p.id}
                  className="h-[70vh] shrink-0 pr-[4vw]"
                  style={{ width: `${PANEL_VW}vw` }}
                >
                  <Panel project={p} index={i} onOpen={() => setOpen(p)} />
                </div>
              ))}
            </motion.div>

            {/* progress instrument */}
            <div className="shell pb-[clamp(1.2rem,4vh,2.4rem)]">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="t-mono t-label">
                  {projects[active]?.tags?.[0] ?? '—'}
                </span>
                <span className="t-mono t-label">
                  {String(active + 1).padStart(2, '0')} /{' '}
                  {String(projects.length).padStart(2, '0')}
                </span>
              </div>
              <div className="h-[2px] w-full bg-[var(--rule)]">
                <motion.div style={{ width: bar }} className="h-full bg-[var(--volt)]" />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section id="work" className="py-[clamp(4rem,12vh,8rem)]">
          <div className="shell">
            {header}
            <div className="rule mt-4" />
            <h2 className="t-display mt-10 text-[clamp(2.6rem,12vw,5rem)] leading-[0.85]">
              Selected
              <br />
              <span className="t-serif lowercase text-[var(--volt)]">work</span>
            </h2>
            <div className="mt-12 space-y-16">
              {projects.map((p, i) => (
                <div key={p.id} data-reveal>
                  <Panel project={p} index={i} onOpen={() => setOpen(p)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {open && <Case project={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </>
  );
}
