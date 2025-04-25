import type { Product } from '~/types/product';
export type ProductExp = Product & {
  is_favorite: boolean;
}

