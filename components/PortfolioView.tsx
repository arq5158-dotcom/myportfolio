'use client';

import { useState, useEffect } from 'react';
import { PortfolioContent, SectionVisibility } from '@/types';
import Experience from '@/components/Experience';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import Work from '@/components/Work';
import Dossier from '@/components/Dossier';
import Signal from '@/components/Signal';

export default function PortfolioView({ initialContent }: { initialContent: PortfolioContent }) {
  const [content, setContent] = useState<PortfolioContent>(initialContent);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear any legacy poisoned localStorage key that caused sections to be locked as hidden
      try {
        localStorage.removeItem('abdulrehman_portfolio_content');
      } catch (e) {}

      // Always fetch latest state from server to guarantee sync
      fetch('/api/content', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data) {
            setContent(data.data);
          }
        })
        .catch(() => {});

      // Listen for real-time live preview messages from Admin UI
      let channel: BroadcastChannel | null = null;
      try {
        channel = new BroadcastChannel('portfolio_cms_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'CONTENT_UPDATED' && event.data?.content) {
            setContent(event.data.content);
          }
        };
      } catch (e) {}

      return () => {
        channel?.close();
      };
    }
  }, []);

  const visible: SectionVisibility = {
    impactMetrics: true,
    projects: true,
    journey: true,
    certifications: true,
    contact: true,
    footer: true,
    ...(content.sectionVisibility ?? {}),
  };

  const hero = content.hero;

  return (
    <>
      <Experience />
      <Nav name={hero.name} visibility={visible} />

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
