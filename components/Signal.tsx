'use client';

import { HeroContent } from '@/types';
import { scrollTo } from './Experience';

export default function Signal({
  hero,
  showContact,
  showFooter,
}: {
  hero: HeroContent;
  showContact: boolean;
  showFooter: boolean;
}) {
  const s = hero.socialLinks ?? ({} as HeroContent['socialLinks']);
  const links = [
    s?.github && { label: 'GitHub', href: s.github },
    s?.linkedin && { label: 'LinkedIn', href: s.linkedin },
    s?.twitter && { label: 'X / Twitter', href: s.twitter },
    { label: 'Résumé (PDF)', href: '/assets/resume.pdf' },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section id="signal" className="pt-[clamp(4.5rem,13vh,9rem)]">
      <div className="shell">
        {showContact && (
        <>
        <div className="flex items-baseline justify-between gap-8">
          <span className="t-mono t-label">04 / Signal</span>
          <span className="t-mono t-label">{hero.location}</span>
        </div>
        <div className="rule mt-4" />

        <h2
          data-reveal
          className="t-display mt-[clamp(2rem,6vh,4rem)] text-[clamp(2.8rem,10vw,9rem)] leading-[0.84]"
        >
          <span className="rise">
            <span>Let&apos;s build</span>
          </span>
          <span className="rise" style={{ ['--d' as string]: '110ms' }}>
            <span className="t-serif lowercase text-[var(--volt)]">
              something that thinks
            </span>
          </span>
        </h2>

        {s?.email && (
          <a
            href={`mailto:${s.email}`}
            data-hot
            className="group mt-[clamp(2.5rem,7vh,4.5rem)] block border-y border-[var(--rule)] py-[clamp(1.5rem,4vh,2.6rem)]"
          >
            <span className="flex flex-wrap items-center justify-between gap-4">
              <span className="t-display break-all text-[clamp(1.15rem,4.4vw,3.4rem)] leading-[1] transition-colors duration-500 group-hover:text-[var(--volt)]">
                {s.email}
              </span>
              <span
                aria-hidden
                className="t-display text-[clamp(1.4rem,3vw,2.6rem)] transition-transform duration-500 group-hover:translate-x-3 group-hover:text-[var(--volt)]"
              >
                ↗
              </span>
            </span>
          </a>
        )}

        <div className="mt-[clamp(2rem,5vh,3.5rem)] grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="s-body max-w-[36ch] text-[var(--fg-dim)]">
              {hero.aboutText}
            </p>
          </div>

          <ul className="md:col-span-6 md:col-start-7">
            {links.map((l) => (
              <li key={l.label} className="border-b border-[var(--rule)]">
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between py-4"
                >
                  <span className="t-display text-[clamp(1.1rem,2vw,1.9rem)] transition-transform duration-500 group-hover:translate-x-2">
                    {l.label}
                  </span>
                  <span
                    aria-hidden
                    className="t-mono t-label transition-all duration-500 group-hover:translate-x-1 group-hover:text-[var(--volt)]"
                  >
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        </>
        )}

        {/* ------------------------------------------------------------ foot */}
        {showFooter && (
        <footer className="mt-[clamp(4rem,11vh,8rem)] flex flex-wrap items-center justify-between gap-4 border-t border-[var(--rule)] py-6">
          <span className="t-mono t-label">
            © {new Date().getFullYear()} {hero.name}
          </span>
          <div className="flex items-center gap-6">
            <a href="/admin" className="t-mono t-label wipe">
              Admin
            </a>
            <button
              onClick={() => scrollTo('#top')}
              data-magnetic
              className="t-mono t-label flex items-center gap-2 transition-colors hover:text-[var(--volt)]"
            >
              Back to top <span aria-hidden>↑</span>
            </button>
          </div>
        </footer>
        )}
      </div>
    </section>
  );
}
