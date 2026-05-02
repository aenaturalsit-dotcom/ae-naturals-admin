/**
 * ✅ INDUSTRY STANDARD: ENUMS
 * Do not use raw string unions for Statuses. Enums allow you to 
 * change the underlying string in one place without breaking logic.
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// --- BASE INTERFACES ---

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// --- PRODUCT & VARIANT TYPES ---

export interface Variant {
  id: string;
  name: string;
  stock: number;
  priceModifier: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  oldPrice?: number;
  images: string[];
  stock: number;
  category: Category | string; // Flexible for nested or flat data
  isActive: boolean;
  variants: Variant[];
  createdAt: string;
}

// --- ORDER TYPES ---

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Partial<Product>;
}

export interface AddressSnapshot {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  storeId: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  user: Pick<User, 'name' | 'phone' | 'email'>;
  items?: OrderItem[];
  addressSnapshot?: AddressSnapshot;
  paymentProvider?: string;
  shippingCost?: number;
}

// --- DASHBOARD & UI TYPES ---

export interface DashboardStats {
  revenue: number;
  orderCount: number;
  userCount: number;
  productCount: number;
  activeOrders: number; // Added for better admin visibility
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: {
    value: number;
    isUp: boolean;
  }; // Optional trend indicator for production dashboards
}