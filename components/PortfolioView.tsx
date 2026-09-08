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
    // 1. Check if this browser has local modifications
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('abdulrehman_portfolio_content');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setContent(parsed);
          }
        } catch (e) {}
      }

      // 2. Fetch fresh content from server
      fetch('/api/content', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            // Keep content updated from server if local storage isn't newer
            setContent((prev) => {
              const localSaved = localStorage.getItem('abdulrehman_portfolio_content');
              return localSaved ? prev : data.data;
            });
          }
        })
        .catch(() => {});

      // 3. Listen for live real-time updates from Admin UI
      let channel: BroadcastChannel | null = null;
      try {
        channel = new BroadcastChannel('portfolio_cms_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'CONTENT_UPDATED' && event.data?.content) {
            setContent(event.data.content);
          }
        };
      } catch (e) {}

      // 4. Also listen to storage events across tabs
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'abdulrehman_portfolio_content' && e.newValue) {
          try {
            setContent(JSON.parse(e.newValue));
          } catch (err) {}
        }
      };
      window.addEventListener('storage', onStorage);

      return () => {
        channel?.close();
        window.removeEventListener('storage', onStorage);
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

