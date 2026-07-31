'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useShop } from '@/components/site-shell';
import { formatCurrency, getStockLabel } from '@/lib/shop-data';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { products, addToCart } = useShop();
  const product = products.find((entry) => entry.id === params.id) ?? null;
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customText, setCustomText] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [message, setMessage] = useState('');

  const defaultColor = useMemo(() => product?.colorOptions?.[0] ?? '', [product]);
  const defaultSize = useMemo(() => product?.sizeOptions?.[0] ?? '', [product]);
  const colorPlaceholder = useMemo(() => product?.colorOptions?.join(', ') || 'Enter a custom color', [product]);
  const sizePlaceholder = useMemo(() => product?.sizeOptions?.join(', ') || 'Enter a custom size', [product]);

  if (!product) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Product not found</p>
        <p className="mt-3 text-slate-600">This product is no longer available. Return to the shop to browse similar pieces.</p>
        <Link href="/shop" className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Back to shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const color = selectedColor || defaultColor || '';
    const size = selectedSize || defaultSize || '';
    const success = addToCart(product, 1, color, size, customNotes, customText, customImageUrl);
    if (success) {
      setMessage('Added to cart successfully.');
    } else {
      setMessage('This item is out of stock for the requested quantity.');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <img src={product.imageUrl} alt={product.name} className="h-80 w-full rounded-[1.5rem] object-cover" />
        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">{product.category}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-lg text-slate-600">{product.description}</p>
          <div className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">{formatCurrency(product.price)}</div>
          <p className="mt-3 text-sm text-slate-500">{getStockLabel(product)}</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-900">Customize your order</h2>
        <p className="mt-2 text-sm text-slate-600">Choose your options and leave a little more detail for the maker.</p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Color</label>
            <input value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} placeholder={colorPlaceholder} className="mt-2 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Size</label>
            <input value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} placeholder={sizePlaceholder} className="mt-2 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Reference image URL</label>
            <input value={customImageUrl} onChange={(e) => setCustomImageUrl(e.target.value)} placeholder="https://example.com/reference.jpg" className="mt-2 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
          </div>

          {product.allowCustomText ? (
            <div>
              <label className="text-sm font-medium text-slate-700">Custom text</label>
              <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Enter initials, wording, or any custom text" className="mt-2 min-h-20 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium text-slate-700">Special instructions</label>
            <textarea value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} placeholder="Share a note for the maker or recipient" className="mt-2 min-h-24 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>

        <button onClick={handleAddToCart} className="mt-6 w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white">Add to cart</button>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </section>
    </div>
  );
}
