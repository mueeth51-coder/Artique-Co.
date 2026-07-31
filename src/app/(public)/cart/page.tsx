'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useShop } from '@/components/site-shell';
import { buildCartItemKey, formatCurrency } from '@/lib/shop-data';
import type { Order } from '@/lib/types';

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart, settings, submitOrder } = useShop();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const message = cart.length
    ? `Order from ${settings.brandName}%0A%0A${cart
        .map((item) => {
          const customText = item.customText ? `%0ACustom text: ${item.customText}` : '';
          const customImage = item.customImageUrl ? `%0AReference image: ${item.customImageUrl}` : '';
          return `- ${item.quantity}x ${item.name} (${item.color}, ${item.size})${customText}${customImage}`;
        })
        .join('%0A')}%0A%0ATotal: ${formatCurrency(total)}%0A%0APlease deliver to...`
    : 'Cart is empty';

  const handleCheckout = () => {
    if (!cart.length) {
      setCheckoutError('Your cart is empty. Add items before placing an order.');
      return;
    }

    const trimmedName = customerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName || !trimmedPhone || !trimmedAddress) {
      setCheckoutError('Please enter your name, phone number, and delivery address before placing the order.');
      return;
    }

    const order = submitOrder(trimmedName, trimmedAddress, trimmedPhone, notes.trim());
    if (!order) {
      setCheckoutError('Unable to place the order right now.');
      return;
    }

    setCheckoutError(null);
    setReceipt(order);
    setCustomerName('');
    setPhone('');
    setAddress('');
    setNotes('');
  };

  const createReceiptMessage = (order: Order) => {
    const lines = [
      `Receipt for ${settings.brandName}`,
      `Order ID: ${order.id}`,
      `Placed: ${new Date(order.createdAt).toLocaleString()}`,
      '',
      'Customer Details',
      `Name: ${order.customerName}`,
      `Phone: ${order.phone}`,
      `Address: ${order.address || 'Not provided'}`,
      `Notes: ${order.notes || 'None'}`,
      '',
      'Items',
      ...order.items.map((item) => {
        const customText = item.customText ? ` | Custom text: ${item.customText}` : '';
        const customImage = item.customImageUrl ? ` | Reference image: ${item.customImageUrl}` : '';
        return `- ${item.quantity}x ${item.name} | Color: ${item.color} | Size: ${item.size}${customText}${customImage}`;
      }),
      '',
      `Total: ${formatCurrency(order.total)}`,
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

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Your cart</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Ready to complete your order?</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-700">
            <ShoppingCart size={18} />
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
            Your cart is empty right now. Visit the shop to add handmade gifts, decor, and custom pieces.
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {cart.map((item) => (
              <div key={buildCartItemKey(item)} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.color} • {item.size}</p>
                    {item.customText ? <p className="mt-1 text-sm text-slate-500">Custom text: {item.customText}</p> : null}
                    {item.customImageUrl ? <p className="mt-1 text-sm text-slate-500">Reference image: {item.customImageUrl}</p> : null}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <button onClick={() => updateCartItem(buildCartItemKey(item), item.quantity - 1)} className="rounded-full border border-slate-200 px-2 py-1">−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartItem(buildCartItemKey(item), item.quantity + 1)} className="rounded-full border border-slate-200 px-2 py-1">+</button>
                  </div>
                  <button onClick={() => removeFromCart(buildCartItemKey(item))} className="rounded-full text-sm font-semibold text-rose-600 transition hover:text-rose-700">Remove</button>
                </div>
              </div>
            ))}

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mt-4 grid gap-3">
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="rounded-full border border-slate-200 px-3 py-2 text-sm" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="rounded-full border border-slate-200 px-3 py-2 text-sm" />
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" className="rounded-full border border-slate-200 px-3 py-2 text-sm" />
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Order notes / special instructions" className="min-h-24 rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
              </div>

              {checkoutError ? <p className="mt-3 text-sm text-rose-600">{checkoutError}</p> : null}

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Order total</span>
                <span className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={handleCheckout} className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Place order
                </button>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Checkout on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {receipt ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Receipt</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Order {receipt.id}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadReceipt} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Download receipt</button>
              <button onClick={sendViaWhatsApp} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Buy / Send via WhatsApp</button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{settings.brandName}</p>
                <p>{settings.email}</p>
                <p>{settings.whatsappNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">Order ID</p>
                <p>{receipt.id}</p>
                <p>{new Date(receipt.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-900">Customer</p>
                <p>{receipt.customerName}</p>
                <p>{receipt.phone}</p>
                <p>{receipt.address || 'Address not provided'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Notes</p>
                <p>{receipt.notes || 'No special notes.'}</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Items</p>
              <div className="mt-2 space-y-2">
                {receipt.items.map((item) => (
                  <div key={`${item.productId}-${item.color}-${item.size}-${item.customText || ''}`} className="rounded-[1rem] border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">Color: {item.color || 'Not chosen'} • Size: {item.size || 'Not chosen'}</p>
                    {item.customText ? <p className="text-xs text-slate-500">Custom text: {item.customText}</p> : null}
                    {item.customImageUrl ? <p className="text-xs text-slate-500">Reference image: {item.customImageUrl}</p> : null}
                    <p className="mt-1 text-xs text-slate-500">Quantity: {item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <p className="font-semibold text-slate-900">Total</p>
              <p className="font-semibold text-slate-900">{formatCurrency(receipt.total)}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-900">Need help with your order?</h2>
        <p className="mt-3 text-slate-600">You can update quantities, remove items, or continue shopping. Your cart stays saved while you browse.</p>
        <Link href="/shop" className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
          Continue shopping
        </Link>
      </section>
    </div>
  );
}
