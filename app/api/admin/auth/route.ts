import { NextResponse } from 'next/server';
import { verifyAdminPassword, setAdminPassword } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (isValid) {
      // In a local CMS without external dependencies, we issue a simple session token
      const sessionToken = Buffer.from(`admin_auth_${Date.now()}`).toString('base64');
      return NextResponse.json(
        { success: true, token: sessionToken, message: 'Authentication successful' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('API /api/admin/auth POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Both current password and new password are required' },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    if (newPassword.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 4 characters long' },
        { status: 400 }
      );
    }

    const success = setAdminPassword(newPassword.trim());
    if (success) {
      return NextResponse.json(
        { success: true, message: 'Password updated successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API /api/admin/auth PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
