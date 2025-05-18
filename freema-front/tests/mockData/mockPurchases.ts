import type { Purchase } from '~/types/purchase'
import { mockProducts } from '~/tests/mockData/mockProducts'

export const mockPurchases: Purchase[] = [
  {
    id: 1,
    product_id: 1,
    user_id: 1,
    zipcode: '1234567',
    address: 'テスト住所',
    building: '',
    to_name: 'テストユーザー',
    method_index: 1,
    charge_id: '',
    paid_at: '2025-05-01 10:00:00',
    created_at: '2025-05-01 10:00:00',
    update_at: '2025-05-01 10:00:00',
    product: mockProducts[0]
  },
]