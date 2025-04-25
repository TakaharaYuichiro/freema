export const PRODUCT_CONDITIONS = {
  1: '良好',
  2: '目立った傷や汚れなし',
  3: 'やや傷や汚れあり',
  4: '状態が悪い'
} as const;

export type ProductConditionKey = keyof typeof PRODUCT_CONDITIONS;
export type ProductConditionValue = typeof PRODUCT_CONDITIONS[ProductConditionKey];