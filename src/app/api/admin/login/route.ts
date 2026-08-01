import { NextResponse } from 'next/server';
import { defaultSettingsWithAdmin } from '@/lib/shop-data';

const ADMIN_TOKEN = 'artique-admin-verified-v1';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = body?.password;
    
    if (!password) {
      return NextResponse.json({ ok: false, error: 'Password required' }, { status: 400 });
    }

    // Get admin password from environment or use default
    const adminPassword = process.env.ADMIN_PASSWORD || defaultSettingsWithAdmin.adminPassword;
    
    console.log('[Admin Login] Password check:', {
      envHasPassword: !!process.env.ADMIN_PASSWORD,
      passwordMatch: password === adminPassword,
      nodeEnv: process.env.NODE_ENV,
    });

    // Verify password
    if (password !== adminPassword) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }

    // Password correct - set secure token in cookie
    const res = NextResponse.json({ ok: true, message: 'Login successful' });
    
    // Set the authentication cookie with proper settings for both dev and production
    res.cookies.set({
      name: 'artique_admin_token',
      value: ADMIN_TOKEN,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production, false in dev
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    console.log('[Admin Login] Cookie set successfully');
    
    return res;
  } catch (error) {
    console.error('[Admin Login] Server error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
