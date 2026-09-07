import { getPortfolioContent, getSectionVisibility } from '@/lib/contentStore';
import Experience from '@/components/Experience';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import Work from '@/components/Work';
import Dossier from '@/components/Dossier';
import Signal from '@/components/Signal';

export const dynamic = 'force-dynamic';

export default function Home() {
  const content = getPortfolioContent();
  const visible = getSectionVisibility(content);
  const hero = content.hero;

  return (
    <>
      <Experience />
      <Nav name={hero.name} />

      <main>
        <Hero hero={hero} />

        <Manifesto
          hero={hero}
          projects={content.projects ?? []}
          showMetrics={visible.impactMetrics}
        />

        {visible.projects && content.projects?.length > 0 && (
          <Work projects={content.projects} />
        )}

        {(visible.journey || visible.certifications) && (
          <Dossier
            experiences={content.experiences ?? []}
            education={content.education ?? []}
            certifications={content.certifications ?? []}
            showJourney={visible.journey}
            showCertifications={visible.certifications}
          />
        )}

        {(visible.contact || visible.footer) && (
          <Signal
            hero={hero}
            showContact={visible.contact}
            showFooter={visible.footer}
          />
        )}
      </main>
    </>
  );
}
