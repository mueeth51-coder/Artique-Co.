'use client';

import Link from 'next/link';
import { useShop } from '@/components/site-shell';

export default function CategoriesPage() {
  const { categories } = useShop();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Explore categories</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Find handcrafted treasures curated for gifting, home styling, and personal celebrations.</p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href="/shop"
            className="group rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8 text-center transition hover:-translate-y-1 hover:border-amber-300 hover:bg-white hover:shadow-xl"
          >
            <p className="text-xl font-semibold text-slate-900 group-hover:text-amber-700">{category.name}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">Click through to explore handcrafted products in this category.</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
