import type { Category } from '~/types/category';
export type Product = {
  id: number;
  user_id: number;
  name: string;
  brand: string;
  price: number;
  content: string;
  img_filename: string;
  condition_index: number;
  categories: Category[];
  favorites_count: number;
  purchases_exists: boolean;
}