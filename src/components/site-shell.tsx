'use client';

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Menu, ShoppingBag, Sparkles, MessageCircle, X } from 'lucide-react';
import type { CartItem, Category, Order, Product, ShopSettings, ThemePalette } from '@/lib/types';
import { buildCartItemKey, createId, createOrderId, defaultSettings, defaultSettingsWithAdmin, seedCategories, seedProducts } from '@/lib/shop-data';
import { supabase } from '@/lib/supabase/client';

const STORAGE_KEYS = {
  settings: 'artique-settings',
  categories: 'artique-categories',
  products: 'artique-products',
  orders: 'artique-orders',
  cart: 'artique-cart',
  admin: 'artique-admin-auth',
  theme: 'artique-theme-palette',
};

export const paletteOptions: Record<ThemePalette, { accent: string; accentSoft: string; accentStrong: string; background: string; text: string }> = {
  amber: { accent: '#f59e0b', accentSoft: '#fef3c7', accentStrong: '#b45309', background: '#ffffff', text: '#111827' },
  rose: { accent: '#e11d48', accentSoft: '#ffe4e6', accentStrong: '#be123c', background: '#fff7f8', text: '#111827' },
  sage: { accent: '#16a34a', accentSoft: '#dcfce7', accentStrong: '#15803d', background: '#f7fdf8', text: '#111827' },
  indigo: { accent: '#4f46e5', accentSoft: '#e0e7ff', accentStrong: '#3730a3', background: '#f7f7ff', text: '#111827' },
};

type ShopContextValue = {
  settings: ShopSettings;
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string, notes?: string, customText?: string, customImageUrl?: string) => boolean;
  updateCartItem: (itemKey: string, quantity: number) => void;
  removeFromCart: (itemKey: string) => void;
  clearCart: () => void;
  resetRevenue: (password: string) => Promise<boolean>;
  saveSettings: (incoming: ShopSettings) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (categoryId: string) => void;
  submitOrder: (customerName: string, address: string, phone: string, notes: string) => Order | null;
  deleteOrder: (orderId: string, password: string) => Promise<boolean>;
  registerUser: (user: { name: string; email: string; phone: string; password: string }) => void;
  adminAuthenticated: boolean;
  setAdminAuthenticated: (value: boolean) => void;
  themePalette: ThemePalette;
  setThemePalette: (value: ThemePalette) => void;
};

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
}

export default function SiteShell({ children, adminMode = false }: { children: React.ReactNode; adminMode?: boolean }) {
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [themePalette, setThemePalette] = useState<ThemePalette>('amber');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = window.setTimeout(() => {
      try {
        const storedSettings = window.localStorage.getItem(STORAGE_KEYS.settings);
        if (storedSettings) setSettings(JSON.parse(storedSettings) as ShopSettings);

        const storedCategories = window.localStorage.getItem(STORAGE_KEYS.categories);
        if (storedCategories) setCategories(JSON.parse(storedCategories) as Category[]);

        const storedProducts = window.localStorage.getItem(STORAGE_KEYS.products);
        if (storedProducts) setProducts(JSON.parse(storedProducts) as Product[]);

        const storedOrders = window.localStorage.getItem(STORAGE_KEYS.orders);
        if (storedOrders) setOrders(JSON.parse(storedOrders) as Order[]);

        const storedCart = window.localStorage.getItem(STORAGE_KEYS.cart);
        if (storedCart) setCart(JSON.parse(storedCart) as CartItem[]);

        const storedAdmin = window.localStorage.getItem(STORAGE_KEYS.admin);
        if (storedAdmin) {
          setAdminAuthenticated(JSON.parse(storedAdmin) as boolean);
        } else if (document.cookie.split(';').some((entry) => entry.trim().startsWith('artique_admin='))) {
          setAdminAuthenticated(true);
        }

        const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme) as ThemePalette | null;
        if (storedTheme && storedTheme in paletteOptions) {
          setThemePalette(storedTheme);
        }
      } catch {
        // ignore malformed local storage and fall back to defaults
      } finally {
        setIsHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    window.localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
    window.localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    window.localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(adminAuthenticated));
    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(themePalette));
  }, [settings, categories, products, orders, cart, adminAuthenticated, themePalette, isHydrated]);

  // persist settings to Supabase
  useEffect(() => {
    if (!supabase) return;
    void supabase.from('shop_settings').upsert({ id: 'artique-co', ...settings }).then(() => undefined);
  }, [settings]);

  // load initial data from Supabase
  useEffect(() => {
    if (!supabase) return;

    (async () => {
      try {
        const { data: sData, error: settingsError } = await supabase
          .from('shop_settings')
          .select(
            'brandName,tagline,logoUrl,promoBanner,whatsappNumber,email,instagramHandle,footerText,aboutText,shippingText,returnsText,privacyText,contactText'
          )
          .eq('id', 'artique-co')
          .single();
        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError;
        }
        if (sData) {
          setSettings((prev) => ({ ...prev, ...sData }));
        } else {
          await supabase.from('shop_settings').insert([{ id: 'artique-co', ...defaultSettingsWithAdmin }]);
        }

        const { data: prodData } = await supabase.from('products').select('*');
        if (prodData && Array.isArray(prodData) && prodData.length) {
          type SupabaseProductRecord = {
            id: string;
            name: string;
            price: number | string;
            category: string;
            stock?: number | null;
            unlimitedStock?: boolean;
            imageUrl: string;
            description?: string;
            colorOptions?: string[];
            sizeOptions?: string[];
          };
          setProducts(prodData.map((p: SupabaseProductRecord) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            stock: p.unlimitedStock ? null : (p.stock ?? 0),
            unlimitedStock: Boolean(p.unlimitedStock),
            imageUrl: p.imageUrl,
            description: p.description || '',
            colorOptions: p.colorOptions || [],
            sizeOptions: p.sizeOptions || [],
          })));
        }

        const { data: catData } = await supabase.from('categories').select('*');
        type SupabaseCategoryRecord = { id: string; name: string };
        if (catData && Array.isArray(catData) && catData.length) setCategories(catData.map((c: SupabaseCategoryRecord) => ({ id: c.id, name: c.name })));

        const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        type SupabaseOrderRecord = Order & { created_at?: string };
        if (ordersData && Array.isArray(ordersData) && ordersData.length) setOrders(ordersData as SupabaseOrderRecord[]);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1, color = '', size = '', notes = '', customText = '', customImageUrl = '') => {
    const available = product.unlimitedStock ? Number.POSITIVE_INFINITY : (product.stock ?? 0);
    const currentQtyInCart = cart.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
    if (!product.unlimitedStock && currentQtyInCart + quantity > available) {
      return false;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id && item.color === color && item.size === size && item.notes === notes);
      if (existing) {
        return prev.map((item) => item.productId === product.id && item.color === color && item.size === size && item.notes === notes && (item.customText || '') === customText && (item.customImageUrl || '') === customImageUrl ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity, color, size, notes, imageUrl: product.imageUrl, stock: product.stock, unlimitedStock: product.unlimitedStock, customText, customImageUrl }];
    });
    return true;
  }, [cart]);

  const updateCartItem = useCallback((itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => buildCartItemKey(item) !== itemKey));
      return;
    }
    setCart((prev) => prev.map((item) => buildCartItemKey(item) === itemKey ? { ...item, quantity } : item));
  }, []);

  const removeFromCart = useCallback((itemKey: string) => setCart((prev) => prev.filter((item) => buildCartItemKey(item) !== itemKey)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const saveSettings = useCallback((incoming: ShopSettings) => setSettings(incoming), []);

  const resetRevenue = useCallback(async (password: string) => {
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!res.ok) return false;
      setOrders([]);
      if (supabase) {
        await supabase.from('orders').delete().neq('id', '');
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
    if (!supabase) return;
    void supabase.from('products').insert([{ ...product }]).then(() => undefined);
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => prev.map((entry) => entry.id === product.id ? product : entry));
    if (!supabase) return;
    void supabase.from('products').upsert([{ ...product }]).then(() => undefined);
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((entry) => entry.id !== productId));
    if (!supabase) return;
    void supabase.from('products').delete().eq('id', productId).then(() => undefined);
  }, []);

  const addCategory = useCallback((name: string) => setCategories((prev) => [...prev, { id: createId('cat'), name }]), []);
  const deleteCategory = useCallback((categoryId: string) => setCategories((prev) => prev.filter((entry) => entry.id !== categoryId)), []);
  const registerUser = useCallback((_user: { name: string; email: string; phone: string; password: string }) => {
    // Account registration remains supported via the public page flow, but the admin-managed registered-users list has been removed.
  }, []);

  const deleteOrder = useCallback(async (orderId: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!res.ok) return false;

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      if (supabase) {
        await supabase.from('orders').delete().eq('id', orderId);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const submitOrder = useCallback((customerName: string, address: string, phone: string, notes: string) => {
    if (!cart.length) return null;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order: Order = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      customerName,
      address,
      phone,
      notes,
      items: cart.map((item) => ({ ...item })),
      total,
    };

    setOrders((prev) => [order, ...prev]);
    setProducts((prev) => prev.map((product) => {
      const matchingItems = cart.filter((item) => item.productId === product.id);
      if (!matchingItems.length) return product;
      const reduction = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
      if (product.unlimitedStock) return product;
      return { ...product, stock: Math.max((product.stock ?? 0) - reduction, 0) };
    }));

    clearCart();

    if (supabase) {
      void (async () => {
        try {
          await supabase.from('orders').insert([{ ...order }]);
          // update stocks
          for (const item of cart) {
            const { data: prod } = await supabase.from('products').select('*').eq('id', item.productId).single();
            if (!prod) continue;
            if (prod.unlimitedStock) continue;
            const newStock = Math.max((prod.stock ?? 0) - item.quantity, 0);
            await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
          }
        } catch (e) {
          // ignore
        }
      })();
    }

    return order;
  }, [cart, clearCart]);

  const contextValue = useMemo<ShopContextValue>(() => ({
    settings,
    products,
    categories,
    orders,
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    resetRevenue,
    saveSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    submitOrder,
    deleteOrder,
    registerUser,
    adminAuthenticated,
    setAdminAuthenticated,
    themePalette,
    setThemePalette,
  }), [settings, products, categories, orders, cart, adminAuthenticated, themePalette, addToCart, addProduct, addCategory, clearCart, deleteCategory, deleteProduct, deleteOrder, removeFromCart, registerUser, resetRevenue, saveSettings, setAdminAuthenticated, submitOrder, updateCartItem, updateProduct]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/categories', label: 'Categories' },
    { href: '/cart', label: 'Cart' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedPalette = paletteOptions[themePalette];
  const themeStyle = {
    '--accent': selectedPalette.accent,
    '--accent-soft': selectedPalette.accentSoft,
    '--accent-strong': selectedPalette.accentStrong,
    '--canvas': selectedPalette.background,
    '--theme-text': selectedPalette.text,
    transition: 'background-color 300ms ease, color 300ms ease',
  } as React.CSSProperties;

  return (
    <ShopContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 text-slate-900" style={themeStyle}>
        {!adminMode ? (
          <header className="border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl text-white shadow-xl" style={{ backgroundColor: 'var(--accent)' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-lg font-semibold">{isHydrated ? settings.brandName : defaultSettings.brandName}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{isHydrated ? settings.tagline : defaultSettings.tagline}</p>
                </div>
              </Link>
              <nav className="hidden items-center gap-6 md:flex">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-amber-600">
                    {link.label}
                  </Link>
                ))}
                <Link href="/register" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>Register</Link>
              </nav>
              <button className="rounded-full border border-slate-200 p-2 md:hidden" onClick={() => setMobileMenuOpen((prev) => !prev)}>
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <Link href="/shop" className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white md:flex" style={{ backgroundColor: 'var(--accent-strong)' }}>
                <ShoppingBag size={16} />
                Shop
              </Link>
            </div>
            {mobileMenuOpen ? (
              <div className="border-t border-slate-200 px-4 py-3 md:hidden">
                <div className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-600" onClick={() => setMobileMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </header>
        ) : null}

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </main>

        {!adminMode ? (
          <footer className="border-t border-slate-200 bg-white/90">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
              <div>
                <p className="text-lg font-semibold">{settings.brandName}</p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{settings.footerText}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Explore</p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                  <Link href="/shop">Shop</Link>
                  <Link href="/categories">Categories</Link>
                  <Link href="/about">About</Link>
                  <Link href="/contact">Contact</Link>
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Connect</p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                  <span>WhatsApp: {settings.whatsappNumber}</span>
                  <span>Email: {settings.email}</span>
                  <span>Instagram: {settings.instagramHandle}</span>
                </div>
              </div>
            </div>
          </footer>
        ) : null}

        {!adminMode ? (
          <Link href="/cart" className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/35 transition hover:bg-slate-800">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <ShoppingBag size={18} />
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-950">{cartItemCount}</span>
            </span>
            <span>Cart</span>
          </Link>
        ) : null}

        {!adminMode ? (
          <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="fixed bottom-24 right-5 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500">
            <MessageCircle size={18} />
            Order on WhatsApp
          </a>
        ) : null}
      </div>
    </ShopContext.Provider>
  );
}

export { ShopContext };
