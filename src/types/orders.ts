// types/orders.ts

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus = 
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentProvider = 
  | 'STRIPE'
  | 'RAZORPAY'
  | 'CASHFREE'
  | 'PHONEPE'
  | 'PAYU'
  | 'COD';

export interface Order {
  id: string;
  createdAt: string | Date;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  shippingCost: number;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  _count: {
    items: number;
  };
  // Optional fields for order details
  refundStatus?: string;
  refundAmount?: number;
  refundProcessedAt?: string | Date;
  cancelledBy?: string;
  cancellationSource?: string;
  addressSnapshot?: {
    name: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    images?: string[];
  };
}

export interface ListOrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
}