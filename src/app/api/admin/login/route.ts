import { NextResponse } from 'next/server';
import { defaultSettingsWithAdmin } from '@/lib/shop-data';

const ADMIN_TOKEN = 'artique-admin-verified';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = body?.password;
    
    if (!password) {
      return NextResponse.json({ ok: false, error: 'Password required' }, { status: 400 });
    }

    // Get admin password from environment or use default
    const adminPassword = process.env.ADMIN_PASSWORD || defaultSettingsWithAdmin.adminPassword;
    
    // Verify password
    if (password !== adminPassword) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    // Password correct - set secure token in cookie
    const res = NextResponse.json({ ok: true });
    res.cookies.set('artique_admin_token', ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
