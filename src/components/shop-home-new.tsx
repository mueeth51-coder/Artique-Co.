'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
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

  const addSelectedToCart = () => {
    if (!selectedProduct) return;
    const color = selectedColor || selectedProduct.colorOptions?.[0] || '';
    const size = selectedSize || selectedProduct.sizeOptions?.[0] || '';
    const success = addToCart(selectedProduct, quantity, color, size, customNotes, customText, customImageUrl);
    if (success) {
      setSelectedProduct(null);
      setSelectedColor('');
      setSelectedSize('');
      setCustomNotes('');
      setCustomText('');
      setCustomImageUrl('');
      setQuantity(1);
    }
  };

  return (
    <div className="space-y-0 pb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-slate-50 px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 mb-4 shadow-sm">
                <Sparkles size={16} />
                {settings.promoBanner}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-4">
                {settings.brandName}
              </h1>
              <p className="text-lg text-slate-600 mb-6">{settings.tagline}</p>
              <Link
                href="#shop"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition active:scale-95"
              >
                <ShoppingBag size={20} />
                Start Shopping
              </Link>
            </div>
            {settings.promoBannerImageUrl && (
              <div className="hidden md:block flex-1">
                <Image
                  src={settings.promoBannerImageUrl}
                  alt="Promo"
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-2xl object-cover shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="sticky top-14 z-20 bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3 border border-slate-200 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition">
            <Search size={20} className="text-slate-400 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {categories.map((category: Category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${
                  selectedCategory === category.name
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="shop" className="px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product: Product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition cursor-pointer active:scale-95"
                >
                  {/* Product Image */}
                  <div className="relative bg-slate-100 aspect-square overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                    {!product.unlimitedStock && product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        {product.category}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-1">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-lg font-bold text-slate-900">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-xs font-semibold text-amber-600">
                        {getStockLabel(product)}
                      </span>
                    </div>

                    <button
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      disabled={!product.unlimitedStock && product.stock === 0}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-h-[90vh] sm:max-h-[80vh] sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-y-auto shadow-xl animate-in slide-in-from-bottom-5 sm:zoom-in-95">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-500 hover:text-slate-900 transition p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 sm:px-6 py-6 space-y-6">
              {/* Product Image */}
              <div className="bg-slate-100 rounded-2xl aspect-square overflow-hidden">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                    {selectedProduct.category}
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                  {getStockLabel(selectedProduct)}
                </span>
              </div>

              <p className="text-slate-600 text-base">{selectedProduct.description}</p>

              {/* Color Selection */}
              {selectedProduct.colorOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Color
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select a color</option>
                    {selectedProduct.colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Size Selection */}
              {selectedProduct.sizeOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select a size</option>
                    {selectedProduct.sizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reference Image */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Reference Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Custom Text */}
              {selectedProduct.allowCustomText && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Custom Text (Optional)
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Enter custom message, initials, or text..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Add any special requests or customization details..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Quantity Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4 bg-slate-100 rounded-lg p-2 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-slate-200 rounded-lg transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-lg font-bold text-slate-900 w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 border-2 border-slate-300 text-slate-900 font-semibold px-6 py-4 rounded-xl hover:bg-slate-50 transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={addSelectedToCart}
                  disabled={!selectedProduct.unlimitedStock && selectedProduct.stock === 0}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-4 rounded-xl transition active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
