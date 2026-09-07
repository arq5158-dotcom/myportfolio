import { Certification, Education, Experience } from '@/types';

type Row = {
  period: string;
  title: string;
  org: string;
  note?: string;
  kind: string;
};

export default function Dossier({
  experiences,
  education,
  certifications,
  showJourney,
  showCertifications,
}: {
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  showJourney: boolean;
  showCertifications: boolean;
}) {
  const rows: Row[] = [
    ...experiences.map((e) => ({
      period: e.period,
      title: e.title,
      org: e.company,
      note: e.description,
      kind: 'Role',
    })),
    ...education.map((e) => ({
      period: e.period,
      title: e.degree,
      org: e.institution,
      note: e.gpa ? `GPA ${e.gpa}` : undefined,
      kind: 'Study',
    })),
  ];

  return (
    <section id="dossier" className="theme-bone py-[clamp(4.5rem,13vh,9rem)]">
      <div className="shell">
        <div className="flex items-baseline justify-between gap-8">
          <span className="t-mono t-label">03 / Dossier</span>
          <span className="t-mono t-label">Record</span>
        </div>
        <div className="rule mt-4" />

        <h2
          data-reveal
          className="t-display mt-[clamp(2rem,6vh,4rem)] text-[clamp(2.6rem,9vw,7.5rem)] leading-[0.85]"
        >
          <span className="rise">
            <span>Track</span>
          </span>
          <span className="rise">
            <span className="t-serif lowercase">record</span>
          </span>
        </h2>

        {showJourney && (
          <div className="mt-[clamp(2.5rem,7vh,5rem)]">
            {rows.map((r, i) => (
              <div
                key={i}
                data-reveal
                style={{ ['--d' as string]: `${i * 70}ms` }}
                className="cv-row group"
              >
                <div className="relative z-[1] grid items-baseline gap-3 px-2 py-[clamp(1.4rem,3.5vh,2.4rem)] md:grid-cols-12 md:gap-6">
                  <span className="t-mono t-label md:col-span-2">{r.period}</span>
                  <h3 className="t-display text-[clamp(1.25rem,2.6vw,2.4rem)] leading-[1] md:col-span-5">
                    {r.title}
                  </h3>
                  <span className="s-body md:col-span-2">{r.org}</span>
                  <span className="t-mono t-label md:col-span-2">{r.kind}</span>
                  <span className="t-mono t-label hidden text-right md:col-span-1 md:block">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {r.note && (
                    <p className="s-body max-w-[70ch] opacity-70 md:col-span-9 md:col-start-3">
                      {r.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div className="rule" />
          </div>
        )}

        {showCertifications && certifications.length > 0 && (
          <div className="mt-[clamp(3.5rem,10vh,7rem)]">
            <span className="t-mono t-label">Credentials</span>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {certifications.map((c, i) => (
                <article
                  key={c.id ?? i}
                  data-reveal
                  style={{ ['--d' as string]: `${i * 110}ms` }}
                  className="flex flex-col justify-between border border-[var(--rule)] p-6 transition-colors duration-500 hover:bg-[rgba(20,20,26,0.04)]"
                >
                  <div>
                    <h3 className="t-display text-[clamp(1.05rem,1.6vw,1.5rem)] leading-[1.05]">
                      {c.title}
                    </h3>
                    <p className="s-body mt-3 opacity-70">{c.description}</p>
                  </div>
                  <div className="mt-8 flex items-end justify-between gap-4">
                    <span className="t-mono t-label max-w-[18ch]">{c.issuer}</span>
                    <span className="t-mono t-label">{c.date}</span>
                  </div>
                  {c.image && (
                    <div className="mt-5 aspect-[4/3] overflow-hidden border border-[var(--rule)]">
                      <img
                        src={encodeURI(c.image)}
                        alt={`${c.title} certificate`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
