'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { paletteOptions, useShop } from '@/components/site-shell';
import { formatCurrency, getStockLabel } from '@/lib/shop-data';
import type { Product, ShopSettings, ThemePalette } from '@/lib/types';

type AdminDashboardView = 'dashboard' | 'products' | 'categories' | 'orders' | 'settings' | 'theme';
type ConfirmAction =
  | { kind: 'deleteProduct'; productId: string; label: string }
  | { kind: 'deleteCategory'; categoryId: string; label: string }
  | { kind: 'deleteOrder'; orderId: string; label: string }
  | { kind: 'resetRevenue'; label: string }
  | null;

export default function AdminDashboard({ view = 'dashboard' }: { view?: AdminDashboardView }) {
  const { settings, products, categories, orders, saveSettings, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory, adminAuthenticated, setAdminAuthenticated, resetRevenue, deleteOrder, themePalette, setThemePalette } = useShop();
  const [draftSettings, setDraftSettings] = useState<ShopSettings>(settings);
  const [productDraft, setProductDraft] = useState<Partial<Product>>({ name: '', price: undefined, category: '', stock: undefined, unlimitedStock: false, imageUrl: '/product-1.svg', description: '', colorOptions: [], sizeOptions: [] });
  const [categoryDraft, setCategoryDraft] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [revenueResetMessage, setRevenueResetMessage] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [deleteOrderMessage, setDeleteOrderMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const totalSales = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const totalOrders = orders.length;
  const activeProducts = products.filter((p) => p.unlimitedStock || (p.stock ?? 0) > 0).length;
  const averageOrderValue = totalOrders ? Math.round(totalSales / totalOrders) : 0;

  const saveSettingsHandler = () => {
    setIsSaving(true);
    saveSettings(draftSettings);
    window.setTimeout(() => setIsSaving(false), 250);
  };

  const saveProduct = () => {
    if (!productDraft.name || !productDraft.category) {
      alert('Please add a product name and choose a valid category before saving.');
      return;
    }

    const isValidCategory = categories.some((category) => category.name === productDraft.category);
    if (!isValidCategory) {
      alert('Please choose an existing category from the list before saving the product.');
      return;
    }
    const nextProduct: Product = {
      id: productDraft.id || `product-${Math.random().toString(36).slice(2, 7)}`,
      name: productDraft.name,
      price: Number(productDraft.price ?? 0),
      category: productDraft.category,
      stock: productDraft.unlimitedStock ? null : (productDraft.stock !== undefined ? Number(productDraft.stock) : 0),
      unlimitedStock: productDraft.unlimitedStock || false,
      imageUrl: productDraft.imageUrl || '/product-1.svg',
      description: productDraft.description || '',
      colorOptions: (productDraft.colorOptions || []).filter(Boolean),
      sizeOptions: (productDraft.sizeOptions || []).filter(Boolean),
      allowCustomText: Boolean(productDraft.allowCustomText),
    };
    if (Number.isNaN(nextProduct.price) || nextProduct.price < 0) {
      alert('Please enter a valid price (number) for the product.');
      return;
    }
    setIsSaving(true);
    if (productDraft.id) {
      updateProduct(nextProduct);
    } else {
      addProduct(nextProduct);
    }
    setProductDraft({ name: '', price: undefined, category: '', stock: undefined, unlimitedStock: false, imageUrl: '/product-1.svg', description: '', colorOptions: [], sizeOptions: [], allowCustomText: false });
    window.setTimeout(() => setIsSaving(false), 250);
  };

  const uploadImageFile = useCallback(async (file?: File) => {
    if (!file) return;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !preset) {
      alert('Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', preset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (data.secure_url) {
        setProductDraft((d) => ({ ...d, imageUrl: data.secure_url }));
      } else {
        alert('Upload failed');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Upload error');
    }
  }, []);

  const editProduct = (product: Product) => setProductDraft(product);
  const handleCategoryAdd = () => {
    if (!categoryDraft.trim()) return;
    setIsSaving(true);
    addCategory(categoryDraft.trim());
    setCategoryDraft('');
    window.setTimeout(() => setIsSaving(false), 250);
  };

  const handleLogin = async () => {
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (res.ok) {
        setAdminAuthenticated(true);
        window.localStorage.setItem('artique-admin-auth', JSON.stringify(true));
      } else {
        setLoginError('Invalid password');
      }
    } catch {
      setLoginError('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore and continue with client sync
    }
    setAdminAuthenticated(false);
    window.localStorage.setItem('artique-admin-auth', JSON.stringify(false));
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setIsSaving(true);

    if (confirmAction.kind === 'deleteProduct') {
      deleteProduct(confirmAction.productId);
    }

    if (confirmAction.kind === 'deleteCategory') {
      deleteCategory(confirmAction.categoryId);
    }

    if (confirmAction.kind === 'deleteOrder') {
      const success = await deleteOrder(confirmAction.orderId, confirmPassword);
      if (success) {
        setDeleteOrderMessage('Order removed successfully.');
      } else {
        setDeleteOrderMessage('Admin password incorrect or order removal failed.');
      }
    }

    if (confirmAction.kind === 'resetRevenue') {
      const success = await resetRevenue(confirmPassword);
      if (success) {
        setRevenueResetMessage('Revenue statistics were reset successfully.');
      } else {
        setRevenueResetMessage('Password incorrect or reset failed.');
      }
    }

    setConfirmAction(null);
    setConfirmPassword('');
    window.setTimeout(() => setIsSaving(false), 250);
  };

  const productSections = useMemo(() => {
    const byCategory = new Map<string, Product[]>();
    for (const category of categories) {
      byCategory.set(category.name, products.filter((product) => product.category === category.name));
    }
    const uncategorized = products.filter((product) => !categories.some((category) => category.name === product.category));
    if (uncategorized.length) {
      byCategory.set('Uncategorized', uncategorized);
    }
    return Array.from(byCategory.entries());
  }, [categories, products]);

  const navItems = [
    { key: 'dashboard' as const, label: 'Dashboard Metrics' },
    { key: 'products' as const, label: 'Product Management' },
    { key: 'categories' as const, label: 'Category Management' },
    { key: 'orders' as const, label: 'Order History' },
    { key: 'theme' as const, label: 'Theme & Appearance' },
    { key: 'settings' as const, label: 'Site Settings' },
  ];

  const renderView = () => {
    switch (view) {
      case 'products':
        return (
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Product management</h2>
                <p className="text-sm text-slate-500">Use the form below to add or update product records.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{products.length} products</div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Product details</label>
                <div className="mt-3 grid gap-3">
                  <input value={productDraft.name || ''} onChange={(e) => setProductDraft({ ...productDraft, name: e.target.value })} placeholder="Product name" className="rounded-full border border-slate-200 px-3 py-2 text-sm" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={productDraft.price ?? ''} onChange={(e) => setProductDraft({ ...productDraft, price: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Price" type="number" className="rounded-full border border-slate-200 px-3 py-2 text-sm" />
                    <input value={productDraft.stock ?? ''} onChange={(e) => setProductDraft({ ...productDraft, stock: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Stock" type="number" className="rounded-full border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <select value={productDraft.category || ''} onChange={(e) => setProductDraft({ ...productDraft, category: e.target.value })} className="rounded-full border border-slate-200 px-3 py-2 text-sm">
                    <option value="">Select a valid category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                  <input value={productDraft.imageUrl || ''} onChange={(e) => setProductDraft({ ...productDraft, imageUrl: e.target.value })} placeholder="Image URL" className="rounded-full border border-slate-200 px-3 py-2 text-sm" />
                  <input type="file" accept="image/*" onChange={(e) => uploadImageFile(e.target.files?.[0])} className="text-sm" />
                </div>
              </div>

              <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Options & features</label>
                <div className="mt-3 grid gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500">Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {(productDraft.colorOptions || []).map((c) => (
                        <div key={c} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm">
                          <span>{c}</span>
                          <button type="button" onClick={() => setProductDraft({ ...productDraft, colorOptions: (productDraft.colorOptions || []).filter((x) => x !== c) })} className="text-xs text-rose-600">×</button>
                        </div>
                      ))}
                      <input value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const v = colorInput.trim();
                          if (!v) return;
                          setProductDraft({ ...productDraft, colorOptions: Array.from(new Set([...(productDraft.colorOptions || []), v])) });
                          setColorInput('');
                        }
                      }} placeholder="Type a color and press Enter" className="rounded-full border border-slate-200 px-3 py-1 text-sm" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500">Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {(productDraft.sizeOptions || []).map((s) => (
                        <div key={s} className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm">
                          <span>{s}</span>
                          <button type="button" onClick={() => setProductDraft({ ...productDraft, sizeOptions: (productDraft.sizeOptions || []).filter((x) => x !== s) })} className="text-xs text-rose-600">×</button>
                        </div>
                      ))}
                      <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const v = sizeInput.trim();
                          if (!v) return;
                          setProductDraft({ ...productDraft, sizeOptions: Array.from(new Set([...(productDraft.sizeOptions || []), v])) });
                          setSizeInput('');
                        }
                      }} placeholder="Type a size and press Enter" className="rounded-full border border-slate-200 px-3 py-1 text-sm" />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={Boolean(productDraft.unlimitedStock)} onChange={(e) => setProductDraft({ ...productDraft, unlimitedStock: e.target.checked })} />
                      Unlimited stock
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={Boolean(productDraft.allowCustomText)} onChange={(e) => setProductDraft({ ...productDraft, allowCustomText: e.target.checked })} />
                      Enable custom text input
                    </label>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</label>
                <textarea value={productDraft.description || ''} onChange={(e) => setProductDraft({ ...productDraft, description: e.target.value })} placeholder="Description" className="mt-3 min-h-24 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
            <button onClick={saveProduct} disabled={isSaving} className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save product'}
            </button>

            <div className="mt-6 overflow-hidden rounded-[1rem] border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {productSections.flatMap(([categoryName, categoryProducts]) => categoryProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">{categoryName}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{product.category}</td>
                      <td className="px-4 py-3 text-slate-600">{getStockLabel(product)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => editProduct(product)} className="rounded-full border border-slate-200 px-3 py-2 text-sm">Edit</button>
                          <button onClick={() => setConfirmAction({ kind: 'deleteProduct', productId: product.id, label: product.name })} className="rounded-full border border-rose-200 px-3 py-2 text-sm text-rose-600">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </section>
        );
      case 'categories':
        return (
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Categories</h2>
            <div className="mt-4 flex gap-2">
              <input value={categoryDraft} onChange={(e) => setCategoryDraft(e.target.value)} placeholder="New category" className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <button onClick={handleCategoryAdd} disabled={isSaving} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
                {isSaving ? 'Adding...' : 'Add'}
              </button>
            </div>
            <div className="mt-6 overflow-hidden rounded-[1rem] border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Category name</th>
                    <th className="px-4 py-3 font-semibold">Products</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{category.name}</td>
                      <td className="px-4 py-3 text-slate-600">{products.filter((product) => product.category === category.name).length}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setConfirmAction({ kind: 'deleteCategory', categoryId: category.id, label: category.name })} className="rounded-full border border-rose-200 px-3 py-2 text-sm text-rose-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      case 'orders':
        return (
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Recent orders</h2>
            <div className="mt-4 overflow-hidden rounded-[1rem] border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{order.id}</div>
                        <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-xs text-slate-500">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setConfirmAction({ kind: 'deleteOrder', orderId: order.id, label: order.id })} className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {deleteOrderMessage ? <p className="mt-3 text-sm text-rose-600">{deleteOrderMessage}</p> : null}
          </section>
        );
      case 'theme':
        return (
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Appearance</p>
                <h2 className="text-2xl font-semibold text-slate-900">Theme & style control</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Live preview</div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Palette library</h3>
                <div className="mt-4 grid gap-3">
                  {(Object.keys(paletteOptions) as ThemePalette[]).map((palette) => {
                    const option = paletteOptions[palette];
                    return (
                      <button key={palette} type="button" onClick={() => setThemePalette(palette)} className={`flex items-center justify-between rounded-[1rem] border px-4 py-3 text-left transition ${themePalette === palette ? 'border-slate-900 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <span className="flex items-center gap-3">
                          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: option.accent }} />
                          <span className="text-sm font-semibold capitalize text-slate-800">{palette}</span>
                        </span>
                        <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{themePalette === palette ? 'Active' : 'Select'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Global theme preview</h3>
                <div className="mt-4 rounded-[1rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em]" style={{ backgroundColor: paletteOptions[themePalette].accentSoft, color: paletteOptions[themePalette].accentStrong }}>
                    {themePalette} palette
                  </div>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[1rem] p-3" style={{ backgroundColor: paletteOptions[themePalette].accentSoft }}>
                      <p className="text-sm font-semibold text-slate-900">Accent panel</p>
                      <p className="mt-1 text-sm text-slate-600">Primary CTA, highlight cards, and navigation accents</p>
                    </div>
                    <div className="rounded-[1rem] border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">Surface styling</p>
                      <p className="mt-1 text-sm text-slate-600">Background, panel contrast, and text balance all respond to the active global theme.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case 'settings':
        return (
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Shop settings</h2>
            <div className="mt-4 space-y-3">
              <input value={draftSettings.brandName} onChange={(e) => setDraftSettings({ ...draftSettings, brandName: e.target.value })} placeholder="Brand / shop name" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <input value={draftSettings.tagline} onChange={(e) => setDraftSettings({ ...draftSettings, tagline: e.target.value })} placeholder="Tagline" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <input value={draftSettings.logoUrl} onChange={(e) => setDraftSettings({ ...draftSettings, logoUrl: e.target.value })} placeholder="Shop logo URL" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <input value={draftSettings.promoBanner} onChange={(e) => setDraftSettings({ ...draftSettings, promoBanner: e.target.value })} placeholder="Promo banner text" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <input value={draftSettings.promoBannerImageUrl || ''} onChange={(e) => setDraftSettings({ ...draftSettings, promoBannerImageUrl: e.target.value })} placeholder="Promo banner image URL" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <input value={draftSettings.whatsappNumber} onChange={(e) => setDraftSettings({ ...draftSettings, whatsappNumber: e.target.value })} placeholder="WhatsApp number" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <input value={draftSettings.email} onChange={(e) => setDraftSettings({ ...draftSettings, email: e.target.value })} placeholder="Support email" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <input value={draftSettings.instagramHandle} onChange={(e) => setDraftSettings({ ...draftSettings, instagramHandle: e.target.value })} placeholder="Instagram handle" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              <textarea value={draftSettings.footerText} onChange={(e) => setDraftSettings({ ...draftSettings, footerText: e.target.value })} placeholder="Footer description" className="min-h-24 w-full rounded-[1rem] border border-slate-200 px-3 py-2 text-sm" />
              <button onClick={saveSettingsHandler} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </section>
        );
      default:
        return (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Analytics</p>
                <h2 className="text-2xl font-semibold text-slate-900">Sales summary</h2>
              </div>
              <div>
                <button onClick={() => setConfirmAction({ kind: 'resetRevenue', label: 'revenue reset' })} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Reset revenue</button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(totalSales)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="mt-2 text-xl font-semibold">{totalOrders}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <p className="text-sm text-slate-500">Active Products</p>
                <p className="mt-2 text-xl font-semibold">{activeProducts}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <p className="text-sm text-slate-500">Average Order Value</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(averageOrderValue)}</p>
              </div>
            </div>

            {revenueResetMessage ? <p className="mt-2 text-sm text-rose-600">{revenueResetMessage}</p> : null}
          </section>
        );
    }
  };

  if (!isMounted) {
    // avoid hydration mismatch by rendering nothing until mounted
    return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-xl">Loading...</div>;
  }

  if (!adminAuthenticated) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-900">Admin access</h1>
        <p className="mt-3 text-slate-600">Enter the admin password to manage your shop settings, products, and orders.</p>
        <p className="mt-2 text-sm text-slate-500">Demo default password: <strong>artique123</strong>. Change for production or set via environment/Supabase auth.</p>
        <div className="mt-6 max-w-md space-y-4">
          <div className="relative">
            <input value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Admin password" className="w-full rounded-full border border-slate-200 px-4 py-3 pr-12 text-sm text-slate-700 outline-none transition focus:border-amber-400" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          {loginError && <div className="text-sm text-rose-600">{loginError}</div>}
          <button onClick={handleLogin} className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Unlock dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Admin control panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manage {settings.brandName}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Update products, site text, and order activity with a clean dashboard experience.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-amber-50 p-5 text-slate-900 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Revenue</p>
              <p className="mt-3 text-2xl font-semibold">{formatCurrency(totalSales)}</p>
            </div>
            <button onClick={handleLogout} className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
              Log out
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Admin sections</p>
          <div className="mt-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.key} href={`/admin/${item.key === 'dashboard' ? '' : item.key}`} className={`block rounded-full px-4 py-3 text-sm font-medium transition ${view === item.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </aside>

        <div className="space-y-8">
          {renderView()}

        </div>
      </section>

      {confirmAction ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-rose-100 p-2 text-rose-600"><ShieldAlert size={18} /></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Confirm action</h3>
                <p className="text-sm text-slate-500">You are about to {confirmAction.kind === 'deleteProduct' ? 'delete' : confirmAction.kind === 'deleteCategory' ? 'delete' : confirmAction.kind === 'deleteOrder' ? 'remove' : 'reset'} {confirmAction.label}.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(confirmAction.kind === 'deleteOrder' || confirmAction.kind === 'resetRevenue') ? (
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Admin password" className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm" />
              ) : null}
              <div className="flex justify-end gap-2">
                <button onClick={() => { setConfirmAction(null); setConfirmPassword(''); }} className="rounded-full border border-slate-200 px-4 py-2 text-sm">Cancel</button>
                <button onClick={executeConfirmAction} disabled={isSaving} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
                  {isSaving ? 'Working...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
