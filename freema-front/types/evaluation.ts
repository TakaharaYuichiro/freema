import type { User } from '~/types/user';
export type Evaluation = {
  id: number;
  user_id: number;
  product_id: number;
  comment: string;
  user: User;
  created_at: string;
}