import type { CartItem, Category, Product, ShopSettings, ShopSettingsWithAdmin } from './types';

export const defaultSettings: ShopSettings = {
  brandName: 'Artique Co.',
  tagline: 'Handmade crafts, thoughtfully made.',
  logoUrl: '/logo.svg',
  promoBanner: 'Handcrafted joy for every celebration — free custom notes on selected pieces.',
  promoBannerImageUrl: '/hero-art.svg',
  whatsappNumber: '+94729540545',
  email: 'hello@artiqueco.com',
  instagramHandle: '@artiqueco',
  footerText: 'A small-batch craft shop building meaningful pieces for everyday rituals.',
  aboutText: 'Artique Co. is a handmade craft brand focused on slow living, meaningful gifts, and pieces that carry warmth and intention.',
  shippingText: 'Orders are carefully packed and shipped within 2-3 business days. Delivery times vary by location.',
  returnsText: 'If your item arrives damaged or incorrect, contact us within 48 hours and we will help resolve it.',
  privacyText: 'We use customer information only to fulfill orders and improve your shopping experience.',
  contactText: 'Reach us via WhatsApp, email, or social media for wholesale orders and custom requests.',
};

export const defaultSettingsWithAdmin: ShopSettingsWithAdmin = {
  ...defaultSettings,
  adminPassword: 'artique123',
};

export const seedCategories: Category[] = [
  { id: '1', name: 'Jewelry' },
  { id: '2', name: 'Home Decor' },
  { id: '3', name: 'Gift Sets' },
];

export const seedProducts: Product[] = [
  {
    id: 'p1',
    name: 'Clay Pendant Set',
    price: 3200,
    category: 'Jewelry',
    stock: 6,
    unlimitedStock: false,
    imageUrl: '/product-1.svg',
    description: 'Hand-formed ceramic pendants with a smooth matte finish.',
    colorOptions: ['Ivory', 'Rose', 'Terracotta'],
    sizeOptions: ['Small', 'Medium'],
    allowCustomText: true,
  },
  {
    id: 'p2',
    name: 'Woven Basket Tray',
    price: 4800,
    category: 'Home Decor',
    stock: 0,
    unlimitedStock: false,
    imageUrl: '/product-2.svg',
    description: 'A woven storage tray made from reclaimed paper yarn.',
    colorOptions: ['Natural', 'Sage'],
    sizeOptions: ['One Size'],
    allowCustomText: false,
  },
  {
    id: 'p3',
    name: 'Custom Gift Box',
    price: 5500,
    category: 'Gift Sets',
    stock: 12,
    unlimitedStock: false,
    imageUrl: '/product-3.svg',
    description: 'A curated gift box with artisan soaps and a handwritten note.',
    colorOptions: ['Blush', 'Midnight'],
    sizeOptions: ['Classic', 'Deluxe'],
    allowCustomText: true,
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  }).format(value);
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createOrderId() {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${dateStamp}-${randomSuffix}`;
}

export function buildCartItemKey(item: Pick<CartItem, 'productId' | 'color' | 'size' | 'notes' | 'customText' | 'customImageUrl'>) {
  return `${item.productId}-${item.color}-${item.size}-${item.notes || 'none'}-${item.customText || 'none'}-${item.customImageUrl || 'none'}`.toLowerCase();
}

export function getStockLabel(product: Product) {
  if (product.unlimitedStock) return 'Unlimited Stock';
  if (product.stock === null || product.stock <= 0) return 'Out of Stock';
  if (product.stock <= 3) return `Only ${product.stock} left`;
  return `${product.stock} available`;
}
