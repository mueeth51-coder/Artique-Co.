import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except /admin/login and API routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/api')) {
    const cookie = req.cookies.get('artique_admin')?.value;
    if (cookie && supabase) {
      const { data, error } = await supabase.from('shop_settings').select('adminPassword').eq('id', 'artique-co').single();
      if (!error && data && data.adminPassword === cookie) {
        return NextResponse.next();
      }
    }

    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
