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
      // Check local storage for newer client updates
      try {
        const stored = localStorage.getItem('portfolio_content_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            const localTime = parsed._updatedAt || 0;
            const initialTime = (initialContent as any)?._updatedAt || 0;
            if (localTime > initialTime) {
              setContent(parsed);
            }
          }
        }
      } catch (e) {}

      // Fetch latest state from server and sync
      fetch('/api/content', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data) {
            setContent((current) => {
              const serverTime = data.data._updatedAt || 0;
              const currentTime = (current as any)?._updatedAt || 0;
              if (serverTime >= currentTime) {
                try {
                  localStorage.setItem('portfolio_content_v2', JSON.stringify(data.data));
                } catch (e) {}
                return data.data;
              }
              return current;
            });
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
            try {
              localStorage.setItem('portfolio_content_v2', JSON.stringify(event.data.content));
            } catch (e) {}
          }
        };
      } catch (e) {}

      // Listen for changes from other tabs via storage event
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'portfolio_content_v2' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && typeof parsed === 'object') {
              setContent(parsed);
            }
          } catch (err) {}
        }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
        channel?.close();
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [initialContent]);

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
