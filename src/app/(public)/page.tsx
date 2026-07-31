'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Sparkles, Package, HeartHandshake } from 'lucide-react';
import { useShop } from '@/components/site-shell';
import { formatCurrency } from '@/lib/shop-data';

export default function LandingPage() {
  const { settings, categories, products } = useShop();

  const featuredProducts = useMemo(() => {
    return products.filter((product) => product.unlimitedStock || (product.stock ?? 0) > 0).slice(0, 3);
  }, [products]);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-slate-50 p-6 shadow-xl sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <Sparkles size={16} />
              {settings.promoBanner}
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
              {settings.brandName} brings boutique handmade style to your everyday rituals.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">{settings.tagline}</p>
            <div className="grid gap-3 sm:flex sm:items-center sm:gap-4">
              <Link href="/shop" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                Explore the shop
              </Link>
              <Link href="/categories" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:text-slate-900">
                Browse categories
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/40">
            <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Why choose us</p>
                  <p className="mt-2 text-slate-600">A calm, curated collection for gifting, home styling, and personal keepsakes.</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-3xl bg-amber-100 text-amber-800">
                  <HeartHandshake size={24} />
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Curated craftsmanship</p>
                    <p className="text-sm text-slate-500">Designed for meaningful moments and everyday beauty.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Package size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Easy delivery</p>
                    <p className="text-sm text-slate-500">Fast quotes, careful packing, and thoughtful shipping details.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {categories.slice(0, 3).map((category) => (
          <Link key={category.id} href="/shop" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl">
            <p className="text-xl font-semibold text-slate-900">{category.name}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Handpicked products for your home, gifting, and personal style.</p>
          </Link>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Featured products</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Fresh from our current collection, ready for gifting or everyday joy.</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-slate-700 transition hover:text-amber-700">Browse the full shop</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featuredProducts.length > 0 ? featuredProducts.map((product) => (
            <div key={product.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{product.category}</p>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700">{formatCurrency(product.price)}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{product.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
              <Link href="/shop" className="mt-5 inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">View details</Link>
            </div>
          )) : <p className="text-sm text-slate-500">Featured products will appear here as soon as they are available in Supabase.</p>}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Connect with us</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Order custom pieces and ask about new arrivals via WhatsApp.</h2>
          </div>
          <div className="grid gap-2 rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-600">
            <span>{settings.email}</span>
            <span>{settings.whatsappNumber}</span>
            <span>{settings.instagramHandle}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
