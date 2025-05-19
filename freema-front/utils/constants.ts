export const PRODUCT_CONDITIONS: Record<number, string> = {
  1: '良好',
  2: '目立った傷や汚れなし',
  3: 'やや傷や汚れあり',
  4: '状態が悪い'
};

export const PAYMENT_OPTIONS: Record<number, string> = {
  1: 'コンビニ払い',
  2: 'カード支払い',
};

export const PAYMENT_MINIMUM_AMOUNT: Record<number, number> = {
  1: 120,  // Stripe コンビニ決済の最低金額
  2: 50,   // Stripe カード決済の最低金額
};