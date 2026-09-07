import type { Metadata } from 'next';
import { Space_Grotesk, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  // next 14 has no fallback metrics for this face; skip the adjustment it warns about
  adjustFontFallback: false,
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Abdul Rehman — AI Engineer',
  description:
    'AI Engineer working on large language models, production RAG pipelines, autonomous systems and deep learning architectures.',
  keywords: [
    'AI Engineer',
    'LLM',
    'RAG',
    'Machine Learning',
    'Deep Learning',
    'Computer Vision',
    'NLP',
  ],
  authors: [{ name: 'Abdul Rehman' }],
  openGraph: {
    title: 'Abdul Rehman — AI Engineer',
    description: 'Large language models, RAG systems, autonomous agents.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${serif.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
