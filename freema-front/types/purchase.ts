import type { Product } from '~/types/product';
export type Purchase = {
  id: number;
  product_id: number;
  user_id: number;
  zipcode: string;
  address: string;
  building: string;
  to_name: string;
  method_index: number;
  charge_id: string;
  paid_at: string;
  created_at: string;
  update_at: string;
  product: Product;
}