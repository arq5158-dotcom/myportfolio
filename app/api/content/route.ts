import { NextResponse } from 'next/server';
import { getPortfolioContent, savePortfolioContent, verifyAdminPassword } from '@/lib/contentStore';
import { PortfolioContent } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const content = getPortfolioContent();
    const res = NextResponse.json({ success: true, data: content }, { status: 200 });
    // Never let the admin UI read a cached snapshot: a stale read followed by a
    // save would silently revert newer on-disk changes (incl. section visibility).
    res.headers.set('Cache-Control', 'no-store, must-revalidate');
    return res;
  } catch (error) {
    console.error('API GET /api/content error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve portfolio content' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, password } = body;

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin credentials' },
        { status: 401 }
      );
    }

    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid content data payload' },
        { status: 400 }
      );
    }

    const saved = savePortfolioContent(content as PortfolioContent);
    if (saved) {
      return NextResponse.json(
        { success: true, message: 'Portfolio content updated and saved successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save content to disk' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API POST /api/content error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred' },
      { status: 500 }
    );
  }
}
