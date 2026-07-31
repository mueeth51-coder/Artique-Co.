import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { defaultSettingsWithAdmin } from '@/lib/shop-data';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const password = body?.password;
    if (!password) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const fallbackPassword = defaultSettingsWithAdmin.adminPassword;
    let passwordMatches = password === fallbackPassword;

    if (supabase) {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('adminPassword')
        .eq('id', 'artique-co')
        .single();

      if (!error && data?.adminPassword) {
        passwordMatches = data.adminPassword === password;
      }
    }

    if (!passwordMatches) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('artique_admin', password, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
