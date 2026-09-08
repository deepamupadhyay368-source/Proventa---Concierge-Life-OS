import type { BaseProviderInterface, ProviderResult } from '../types';

export interface GiftProduct {
  productId: string;
  title: string;
  brand: string;
  category: string;
  pricePaise: number;
  currency: string;
  description: string;
  inStock: boolean;
  images: string[];
  packagingOptions: string[];
}

export interface GiftOrder {
  orderId: string;
  trackingNumber: string;
  status: 'PROCESSING' | 'PACKAGED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  productTitle: string;
  recipientName: string;
  deliveryAddress: string;
  greetingCardMessage?: string;
  totalPricePaise: number;
  estimatedDeliveryDate: string;
}

export interface GiftProvider extends BaseProviderInterface {
  readonly category: 'GIFTS';
  searchProducts(query: string, category?: string): Promise<ProviderResult<GiftProduct[]>>;
  checkAvailability(productId: string, pinCode: string): Promise<ProviderResult<{ available: boolean; estimatedDays: number }>>;
  checkDelivery(productId: string, pinCode: string): Promise<ProviderResult<{ canDeliver: boolean; shippingCostPaise: number }>>;
  createOrder(params: {
    productId: string;
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: string;
    pinCode: string;
    cardMessage?: string;
    packagingType?: string;
  }): Promise<ProviderResult<GiftOrder>>;
  trackOrder(orderId: string): Promise<ProviderResult<{ status: string; history: Array<{ date: string; message: string }> }>>;
  cancelOrder(orderId: string, reason?: string): Promise<ProviderResult<{ cancelled: boolean; refundAmountPaise: number }>>;
}
