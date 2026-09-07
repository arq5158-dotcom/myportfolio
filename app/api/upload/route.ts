import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminPassword } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;
    const isResume = formData.get('isResume') === 'true';

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin credentials' },
        { status: 401 }
      );
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const name = file.name || 'upload';
    const ext = path.extname(name).toLowerCase();
    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.pdf', '.avif'];

    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { success: false, error: `File type '${ext}' not allowed. Please upload an image or PDF.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isResume && ext === '.pdf') {
      const publicAssetsDir = path.join(process.cwd(), 'public', 'assets');
      if (!fs.existsSync(publicAssetsDir)) {
        fs.mkdirSync(publicAssetsDir, { recursive: true });
      }
      const resumePath = path.join(publicAssetsDir, 'resume.pdf');
      fs.writeFileSync(resumePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/assets/resume.pdf?v=${Date.now()}`,
        filename: 'resume.pdf',
      });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'assets', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanBase = path.basename(name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${cleanBase}-${Date.now()}${ext}`;
    const destination = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(destination, buffer);

    const publicUrl = `/assets/uploads/${uniqueFilename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
