'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, Download, Send, ArrowLeft } from 'lucide-react';
import { useShop } from '@/components/site-shell';
import { buildCartItemKey, formatCurrency } from '@/lib/shop-data';
import type { Order } from '@/lib/types';
import Image from 'next/image';

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, settings, submitOrder } = useShop();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const handleCheckout = async () => {
    if (!cart.length) {
      setCheckoutError('Your cart is empty. Add items before placing an order.');
      return;
    }

    const trimmedName = customerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedPhone || !trimmedAddress) {
      setCheckoutError('Please fill in all required fields: name, phone, and address.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const order = submitOrder(trimmedName, trimmedAddress, trimmedPhone, notes.trim());
      if (!order) {
        setCheckoutError('Unable to place the order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setReceipt(order);
      setCustomerName('');
      setPhone('');
      setAddress('');
      setNotes('');
    } catch (err) {
      setCheckoutError('An error occurred. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createReceiptMessage = (order: Order) => {
    const lines = [
      `📦 Receipt for ${settings.brandName}`,
      `Order ID: ${order.id}`,
      `Date: ${new Date(order.createdAt).toLocaleString()}`,
      '',
      '👤 Customer Details',
      `Name: ${order.customerName}`,
      `Phone: ${order.phone}`,
      `Address: ${order.address || 'Not provided'}`,
      `Notes: ${order.notes || 'None'}`,
      '',
      '📝 Items Ordered',
      ...order.items.map((item) => {
        const customText = item.customText ? ` | Custom: ${item.customText}` : '';
        const customImage = item.customImageUrl ? ` | Reference: ${item.customImageUrl}` : '';
        return `• ${item.quantity}x ${item.name} | ${item.color} | ${item.size}${customText}${customImage}`;
      }),
      '',
      `💰 Total: ${formatCurrency(order.total)}`,
      '',
      `Thank you for your order! 🙏`,
    ];
    return lines.join('\n');
  };

  const downloadReceipt = () => {
    if (!receipt) return;
    const blob = new Blob([createReceiptMessage(receipt)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${receipt.id}-receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendViaWhatsApp = () => {
    if (!receipt) return;
    const messageText = encodeURIComponent(createReceiptMessage(receipt));
    const whatsappNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${whatsappNumber}?text=${messageText}`, '_blank', 'noopener,noreferrer');
  };

  // Receipt View
  if (receipt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" onClick={() => setReceipt(null)} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Order Confirmed!</h1>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Order Placed Successfully</h2>
          <p className="text-green-700">Order ID: <span className="font-mono font-bold">{receipt.id}</span></p>
        </div>

        {/* Receipt Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">CUSTOMER NAME</p>
              <p className="text-lg font-bold text-slate-900">{receipt.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold mb-1">PHONE</p>
              <p className="text-lg font-bold text-slate-900">{receipt.phone}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-slate-600 font-semibold mb-1">DELIVERY ADDRESS</p>
              <p className="text-lg font-bold text-slate-900">{receipt.address || 'Not provided'}</p>
            </div>
          </div>

          {/* Items */}
          <div className="border-t pt-6">
            <p className="text-sm font-semibold text-slate-600 mb-4 uppercase">ITEMS ORDERED</p>
            <div className="space-y-3">
              {receipt.items.map((item) => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4 pb-3 border-b border-slate-100 last:border-b-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.color} • {item.size}</p>
                    <p className="text-sm text-slate-600 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-6 flex items-center justify-between">
            <p className="text-lg font-bold text-slate-900">ORDER TOTAL</p>
            <p className="text-3xl font-bold text-amber-600">{formatCurrency(receipt.total)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={downloadReceipt}
            className="flex-1 border-2 border-slate-300 text-slate-900 font-semibold px-6 py-4 rounded-xl hover:bg-slate-50 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download Receipt
          </button>
          <button
            onClick={sendViaWhatsApp}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-4 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            WhatsApp
          </button>
        </div>

        {/* Continue Shopping */}
        <Link
          href="/shop"
          className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-4 rounded-xl transition active:scale-95 text-center"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Cart View
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-slate-600 mt-1">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold">
          <ShoppingCart size={20} className="inline mr-2" />
          {cart.length}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-6">Add some handmade items to get started!</p>
          <Link href="/shop" className="inline-flex bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-xl transition">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-3 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {cart.map((item) => (
              <div key={buildCartItemKey(item)} className="flex gap-4 p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition">
                {/* Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-sm text-slate-600">{item.color} • {item.size}</p>
                  {item.customText && <p className="text-xs text-amber-700 mt-1">✏️ Custom: {item.customText}</p>}
                  <p className="font-bold text-amber-600 mt-2">{formatCurrency(item.price)}</p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => updateCartItem(buildCartItemKey(item), item.quantity - 1)}
                      className="p-1 hover:bg-slate-200 rounded transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(buildCartItemKey(item), item.quantity + 1)}
                      className="p-1 hover:bg-slate-200 rounded transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(buildCartItemKey(item))}
                    className="text-red-600 hover:text-red-700 p-1 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                  <p className="font-bold text-slate-900 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-6">📋 Delivery Details</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Delivery Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, city, postal code"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Special Instructions (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Leave delivery instructions, special requests, etc."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={2}
              />
            </div>

            {checkoutError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-semibold">
                {checkoutError}
              </div>
            )}
          </div>

          {/* Order Summary & Checkout */}
          <div className="bg-gradient-to-br from-amber-50 to-slate-50 border border-amber-200 rounded-2xl p-6 space-y-4 fixed sm:relative bottom-20 md:bottom-0 left-0 right-0 sm:bottom-auto">
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>Contact seller</span>
              </div>
              <div className="border-t border-amber-200 pt-3 flex justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span className="text-amber-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckout}
                disabled={isSubmitting || !cart.length}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-xl transition active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
              <Link
                href="/shop"
                className="flex-1 border-2 border-slate-300 text-slate-900 font-semibold py-4 px-6 rounded-xl hover:bg-slate-50 transition active:scale-95 text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
