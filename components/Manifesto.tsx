'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { HeroContent, Project } from '@/types';

/** One word of the manifesto, lit as the section scrolls past. */
function Word({
  children,
  range,
  progress,
}: {
  children: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
}

/** "100+", "85.9%", "3.65" — animate the numeric core, keep whatever wraps it. */
function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [n, setN] = useState(0);

  const m = value.match(/^(\D*)([\d.]+)(.*)$/);
  const numeric = !!m;
  const target = m ? parseFloat(m[2]) : 0;
  const decimals = m && m[2].includes('.') ? m[2].split('.')[1].length : 0;

  // deps stay primitive — `m` is a fresh array each render and would restart the ramp
  useEffect(() => {
    if (!inView || !numeric) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(target);
      return;
    }
    const start = performance.now();
    let id = requestAnimationFrame(function tick(now: number) {
      const p = Math.min(1, (now - start) / 1400);
      setN(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [inView, target, numeric]);

  if (!m) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {m[1]}
      {n.toFixed(decimals)}
      {m[3]}
    </span>
  );
}

export default function Manifesto({
  hero,
  projects,
  showMetrics,
}: {
  hero: HeroContent;
  projects: Project[];
  showMetrics: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.45'],
  });

  const words = (hero.bio || '').split(/\s+/).filter(Boolean);
  const metrics = showMetrics ? hero.impactMetrics ?? [] : [];

  const stack = Array.from(new Set(projects.flatMap((p) => p.techStack)));
  const domains = Array.from(
    new Set([...(hero.specialtiesTags ?? []), ...projects.flatMap((p) => p.tags)])
  );

  return (
    <section id="index" className="pt-[clamp(5rem,14vh,10rem)]">
      <div className="shell">
        <div className="flex items-baseline justify-between gap-8">
          <span className="t-mono t-label">01 / Index</span>
          <span className="t-mono t-label text-right">{hero.location}</span>
        </div>
        <div className="rule mt-4" />

        <div ref={ref} className="grid gap-10 pt-[clamp(2.5rem,7vh,5rem)] md:grid-cols-12">
          <h2 className="t-display s-big md:col-span-4">
            <span data-reveal className="block">
              <span className="rise">
                <span>What I</span>
              </span>
              <span className="rise">
                <span className="t-serif lowercase text-[var(--volt)]">build</span>
              </span>
            </span>
          </h2>

          <p className="s-lead md:col-span-8 md:text-[clamp(1.2rem,2.3vw,2.35rem)] md:leading-[1.3]">
            {words.map((w, i) => (
              <Word
                key={i}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1.6) / words.length]}
              >
                {w}
              </Word>
            ))}
          </p>
        </div>

        {/* ---------------------------------------------------------- metrics */}
        {metrics.length > 0 && (
          <>
            <div className="rule mt-[clamp(3rem,9vh,7rem)]" />
            <dl className="grid grid-cols-2 md:grid-cols-4">
              {metrics.map((m, i) => (
                <div
                  key={m.id ?? i}
                  data-reveal
                  style={{ ['--d' as string]: `${i * 90}ms` }}
                  className="group border-t border-[var(--rule)] py-[clamp(1.6rem,4vh,2.6rem)] pr-6"
                >
                  <dd className="t-display text-[clamp(2.6rem,5.6vw,5.2rem)] leading-none text-[var(--fg)] transition-colors duration-500 group-hover:text-[var(--volt)]">
                    <Counter value={m.value} />
                  </dd>
                  <dt className="t-mono mt-4 text-[var(--fg)]">{m.label}</dt>
                  <p className="s-body mt-2 max-w-[24ch] text-[var(--fg-dim)]">
                    {m.description}
                  </p>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------ marquee */}
      <div className="mt-[clamp(4rem,11vh,8rem)] select-none overflow-hidden border-y border-[var(--rule)]">
        {[
          { items: stack, cls: 'marquee-a', tone: 'text-[var(--fg-dim)]' },
          { items: domains, cls: 'marquee-b', tone: 'text-[var(--fg)]' },
        ].map((row) => (
          <div
            key={row.cls}
            className={`marquee ${row.cls} border-b border-[var(--rule-soft)] py-4 last:border-b-0`}
          >
            {[0, 1].map((dup) => (
              <div key={dup} className="flex" aria-hidden={dup === 1}>
                {row.items.map((s, i) => (
                  <span
                    key={`${dup}-${i}`}
                    className={`t-display flex items-center gap-8 whitespace-nowrap px-8 text-[clamp(1.15rem,2.3vw,2.1rem)] ${row.tone}`}
                  >
                    {s}
                    <span className="text-[var(--volt)]">✳</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
