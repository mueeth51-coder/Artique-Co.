'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Sparkles } from 'lucide-react';
import type { Category, Product, CartItem, Order } from '../lib/types';
import { buildCartItemKey, defaultSettings, formatCurrency, getStockLabel } from '../lib/shop-data';
import { useShop } from './site-shell';

export default function ShopHomePage() {
  const { settings, products, categories, cart, addToCart, updateCartItem, removeFromCart, submitOrder } = useShop();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customText, setCustomText] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [receipt, setReceipt] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const resolvedWhatsappNumber = isMounted ? settings.whatsappNumber : defaultSettings.whatsappNumber;

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesQuery = `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, query, selectedCategory]);

  const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  const addSelectedToCart = () => {
    if (!selectedProduct) return;
    const color = selectedColor || selectedProduct.colorOptions?.[0] || '';
    const size = selectedSize || selectedProduct.sizeOptions?.[0] || '';
    const success = addToCart(selectedProduct, 1, color, size, customNotes, customText, customImageUrl);
    if (success) {
      setSelectedProduct(null);
      setSelectedColor('');
      setSelectedSize('');
      setCustomNotes('');
      setCustomText('');
      setCustomImageUrl('');
    }
  };

  const handleCheckout = () => {
    const trimmedName = customerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedPhone) {
      setCheckoutError('Please add your name and phone number before checkout.');
      return;
    }

    if (!cart.length) {
      setCheckoutError('Your cart is empty. Add a handcrafted piece to continue.');
      return;
    }

    setCheckoutError(null);
    const order = submitOrder(trimmedName, trimmedAddress, trimmedPhone, `${checkoutNotes} ${customNotes}`.trim());
    if (order) {
      const orderMessage = [
        `New order for ${trimmedName}`,
        `Phone: ${trimmedPhone}`,
        `Address: ${trimmedAddress || 'Not provided'}`,
        '',
        'Items:',
        ...order.items.map((item: CartItem) => {
          const customTextLine = item.customText ? `\n  Custom text: ${item.customText}` : '';
          const customImageLine = item.customImageUrl ? `\n  Reference image: ${item.customImageUrl}` : '';
          return `- ${item.name} (${item.color} / ${item.size}) x${item.quantity}${customTextLine}${customImageLine}`;
        }),
        '',
        `Total: ${formatCurrency(order.total)}`,
        `Notes: ${order.notes || 'No special notes'}`,
      ].join('\n');
      const whatsappNumber = (resolvedWhatsappNumber || settings.whatsappNumber).replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      setReceipt(order);
      setCustomerName('');
      setAddress('');
      setPhone('');
      setCheckoutNotes('');
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-medium text-amber-700">
              <Sparkles size={14} />
              Handmade with love & intention
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Artique Co. is where thoughtful crafts meet personal gifting.</h1>
            <p className="mt-4 text-lg text-slate-600">Discover one-of-a-kind pieces, custom notes, and easy WhatsApp ordering for your next special moment.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#shop" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Browse crafts</a>
              <Link href="/about" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Meet the story</Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-amber-100 bg-white p-4 shadow-sm">
            <Image src="/hero-art.svg" alt="Artique Co. craft collection" width={640} height={420} className="h-56 w-full rounded-[1rem] object-cover" />
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 rounded-[1rem] bg-amber-50 p-4 text-sm font-medium text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {settings.promoBannerImageUrl ? (
              <Image src={settings.promoBannerImageUrl} alt="Promo banner" width={180} height={96} className="h-24 w-32 rounded-[0.9rem] object-cover" />
            ) : null}
            <span>{settings.promoBanner}</span>
          </div>
          <span className="font-semibold">WhatsApp: {resolvedWhatsappNumber}</span>
        </div>
      </section>

      <div className="grid gap-8">
        <section id="shop" className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Latest handmade finds</h2>
                <p className="text-sm text-slate-500">Search, filter, and customize pieces for gifting and everyday style.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={16} className="text-slate-500" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="w-48 bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory('All')} className={`rounded-full px-3 py-2 text-sm ${selectedCategory === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>All</button>
              {categories.map((category: Category) => (
                <button key={category.id} onClick={() => setSelectedCategory(category.name)} className={`rounded-full px-3 py-2 text-sm ${selectedCategory === category.name ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product: Product) => (
              <div key={product.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
                <Image src={product.imageUrl} alt={product.name} width={420} height={300} className="h-44 w-full rounded-[1rem] object-cover" />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-500">{product.category}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">{formatCurrency(product.price)}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{product.description}</p>
                <p className="mt-3 text-sm font-medium text-slate-700">{getStockLabel(product)}</p>
                <Link href={`/shop/${product.id}`} className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300" >
                  View details
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Ready to order?</h2>
              <p className="mt-2 text-sm text-slate-500">Review your selections and continue to the dedicated cart and checkout experience.</p>
            </div>
            <div className="rounded-full bg-amber-50 p-2 text-amber-700">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/cart" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">View cart</Link>
            <span className="text-sm text-slate-500">{cart.length} item{cart.length !== 1 ? 's' : ''} in your basket</span>
          </div>
        </section>
      </div>

      {selectedProduct ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">Customize {selectedProduct.name}</h3>
                <p className="text-sm text-slate-500">Pick your color, size, and add a special note.</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-sm text-slate-500">Close</button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Color</label>
                <input value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} placeholder={selectedProduct.colorOptions.join(', ') || 'Enter a custom color'} className="mt-2 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Size</label>
                <input value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} placeholder={selectedProduct.sizeOptions.join(', ') || 'Enter a custom size'} className="mt-2 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Reference image URL</label>
                <input value={customImageUrl} onChange={(e) => setCustomImageUrl(e.target.value)} placeholder="https://..." className="mt-2 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
              </div>
              {selectedProduct.allowCustomText ? (
                <div>
                  <label className="text-sm font-medium text-slate-700">Custom text</label>
                  <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Enter custom wording or initials" className="mt-2 min-h-20 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
                </div>
              ) : null}
              <div>
                <label className="text-sm font-medium text-slate-700">More details / special instructions</label>
                <textarea value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} placeholder="Add a custom message or engraving request" className="mt-2 min-h-24 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{getStockLabel(selectedProduct)}</p>
                <p className="text-lg font-semibold">{formatCurrency(selectedProduct.price)}</p>
              </div>
              <button onClick={addSelectedToCart} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">Add to cart</button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
