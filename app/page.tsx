import { getPortfolioContent } from '@/lib/contentStore';
import PortfolioView from '@/components/PortfolioView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default function Home() {
  const content = getPortfolioContent();
  return <PortfolioView initialContent={content} />;
}
