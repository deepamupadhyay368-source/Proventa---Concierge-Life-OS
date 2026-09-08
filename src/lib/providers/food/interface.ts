import type { BaseProviderInterface, ProviderResult } from '../types';

export interface MenuItem {
  itemId: string;
  name: string;
  description: string;
  pricePaise: number;
  isVeg: boolean;
  category: string;
  customizationOptions?: Array<{
    name: string;
    options: Array<{ name: string; extraPaise: number }>;
  }>;
}

export interface FoodCartItem {
  itemId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface CartCalculation {
  cartId: string;
  itemTotalPaise: number;
  deliveryFeePaise: number;
  taxesPaise: number;
  packagingFeePaise: number;
  totalPaise: number;
  currency: string;
  estimatedDeliveryMinutes: number;
}

export interface FoodOrder {
  orderId: string;
  externalOrderId: string;
  restaurantName: string;
  status: 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  items: Array<{ name: string; quantity: number; pricePaise: number }>;
  totalPaise: number;
  deliveryAddress: string;
  driverName?: string;
  driverPhone?: string;
  estimatedDeliveryTime: string;
}

export interface FoodProvider extends BaseProviderInterface {
  readonly category: 'FOOD';
  searchRestaurants(query: { city: string; keyword?: string; pinCode?: string }): Promise<ProviderResult<any[]>>;
  searchMenu(restaurantId: string, query?: string): Promise<ProviderResult<MenuItem[]>>;
  createCart(restaurantId: string, items: FoodCartItem[]): Promise<ProviderResult<CartCalculation>>;
  updateCart(cartId: string, items: FoodCartItem[]): Promise<ProviderResult<CartCalculation>>;
  calculateTotal(cartId: string, deliveryAddress: string): Promise<ProviderResult<CartCalculation>>;
  placeOrder(cartId: string, paymentDetails: { paymentId: string; address: string }): Promise<ProviderResult<FoodOrder>>;
  getOrder(orderId: string): Promise<ProviderResult<FoodOrder>>;
  cancelOrder(orderId: string, reason?: string): Promise<ProviderResult<{ cancelled: boolean; refundAmountPaise: number }>>;
  trackOrder(orderId: string): Promise<ProviderResult<{ status: string; driverLocation?: { lat: number; lng: number }; estimatedArrivalMinutes: number }>>;
}
