export type ShopSettings = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  promoBanner: string;
  promoBannerImageUrl?: string;
  whatsappNumber: string;
  email: string;
  instagramHandle: string;
  footerText: string;
  aboutText: string;
  shippingText: string;
  returnsText: string;
  privacyText: string;
  contactText: string;
};

export type ShopSettingsWithAdmin = ShopSettings & {
  adminPassword: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number | null;
  unlimitedStock: boolean;
  imageUrl: string;
  description: string;
  colorOptions: string[];
  sizeOptions: string[];
  allowCustomText?: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  notes: string;
  imageUrl: string;
  stock: number | null;
  unlimitedStock: boolean;
  customText?: string;
  customImageUrl?: string;
};

export type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  address: string;
  phone: string;
  notes: string;
  items: CartItem[];
  total: number;
};

export type ThemePalette = 'amber' | 'rose' | 'sage' | 'indigo';
