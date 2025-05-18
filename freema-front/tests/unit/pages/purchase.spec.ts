import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import PurchasePage from '~/pages/purchase.vue'
import IndexPage from '~/pages/index.vue'
import MypagePage from '~/pages/mypage.vue'
import '@testing-library/jest-dom'    // Chai
import type { Purchase } from '~/types/purchase';

// このテストで使用するテスト用データ
import { mockProducts } from '../../mockData/mockProducts'
import { mockFavorites } from '../../mockData/mockFavorites'
const clonedProducts = structuredClone(mockProducts);   // mockProductsに、破壊的名変更を行うので、ディープコピーして使う
const mockPurchases: Purchase[] = [];

// テスト条件
const targetProductId = 3;
const targetUserId = 2;

// useRuntimeConfigをモック
import { IMAGE_URL_BASE } from '~/tests/utils/constants'
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    imageUrlBase: IMAGE_URL_BASE, 
  }
}))

// confirmの戻り値を常に「OK」にする
vi.spyOn(window, 'confirm').mockReturnValue(true);

// $fetchをモック（purchaseIdをstoreに保存するところをmockでスルー）
vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ success: true }));

// useAuth をモック
vi.mock('~/composables/useAuth', () => ({
  default: () => ({
    get: vi.fn().mockImplementation((url: string) => {
      if (url === '/products') {
        return Promise.resolve({ data: clonedProducts })
      }
      if (url === '/get_favorites') {
        return Promise.resolve({ data: mockFavorites })
      }
      if (url === `/products/${targetProductId}`) {
        const products = clonedProducts.find(product => product.id === targetProductId);
        return Promise.resolve({ data: products })
      }
      if (url === `/users/${targetUserId}`) {
        const user = { id: targetUserId, zipcode: '1234567', address: 'テスト住所', building: '', name: 'テストユーザー' };
        return Promise.resolve({ data: user })
      }
      if (url === '/purchases?option=mine') {
        const purchases = mockPurchases.filter(item => item.user_id === targetUserId);
        return Promise.resolve({ data: purchases })
      }
      return Promise.resolve({ data: {} })
    }),

    post: vi.fn().mockImplementation((url: string, payload: any) => {
      if (url === `/purchases`) {
        // ここで、purchases APIのモックとして以下の内容を実行
        // ①購入した商品がindex画面で「sold」と表示されるように、mockProductのpurchases_existsをtrueにする
        // ②「プロフィール/購入した商品一覧」に表示するためにpurchaseを記録しておく、
        const purchase: Purchase = structuredClone(payload);
        const product_id = purchase.product_id;
        const product = clonedProducts.find(item => item.id === product_id);
        if (product) {
          product.purchases_exists = true;
          purchase.product = product;
        }
        purchase.paid_at = "2025-01-01 10:00:00";
        mockPurchases.push(purchase);
        return Promise.resolve({ data: { id: 1 } });
      }
      return Promise.resolve({ data: {} });
    })
  })
}));

vi.mock('vue-router', () => {
  const mockPush = vi.fn()

  return {
    useRouter: () => ({ push: mockPush }),
    useRoute: () => ({
      query: {
        product_id: targetProductId
      }
    }),
    __mockPush: mockPush
  }
})

// @ts-expect-error__mockPush is only available in test context
import { __mockPush as mockPush } from 'vue-router'


describe('10. 商品購入機能', () => {
  it('10-1. 「購入する」ボタンを押下すると購入が完了する', async () => {
    // テスト対象のユーザーデータ
    const user = { id: targetUserId, zipcode: '1234567', address: 'テスト住所', building: '', name: 'テストユーザー' }; 

    // レンダリング
    render(PurchasePage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          ClientOnly: { template: '<slot />' },
        },
      },
    })

    // 支払い方法を設定
    const paymentMethodSelect = await screen.findByTestId('payment-method-select');
    await fireEvent.update(paymentMethodSelect, '1')  // 値を1(コンビニ払い)にする
    expect((paymentMethodSelect as HTMLSelectElement).value).toBe('1'); // 値が更新されたことをアサート

    // 「購入ボタン」をクリック
    const purchaseButton = await screen.findByTestId('purchase-button');
    expect(purchaseButton).not.toBeDisabled();
    await fireEvent.click(purchaseButton);

    // 遷移先を確認
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/purchase_accepted');
    });
  })

  it('10-2. 購入した商品は商品一覧画面にて「sold」と表示される', async () => {
    const user = { id: targetUserId };
    let expectedText = '';
    const targetProduct = clonedProducts.find(item => item.id === targetProductId);
    if (targetProduct) expectedText = targetProduct.name;

    render(IndexPage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          ClientOnly: { template: '<slot />' },
          Icon: defineComponent({ template: '<span />' }),
        },
      },
    })

    await waitFor(() => {
      // soldがついている商品の商品名を配列にする（表示されている商品パネル(product-item)のなかで、product-item--soldが表示されている商品の商品名を抜き出して配列にする）
      const items = screen.getAllByTestId('product-item');
      const soldProductNames: string[] = [];
      items.forEach((item) => {
        const soldMark = within(item).queryByTestId('product-item--sold');
        if (soldMark) {
          const nameEl = within(item).getByTestId('product-item--name');
          soldProductNames.push(nameEl.textContent || '')
        }
      })

      // soldがついている商品の商品名の配列の中に、10-1で購入した商品の商品名があるか？
      expect(soldProductNames).toContain(expectedText);
    })
  })

  it('10-3. 「マイページ/購入した商品一覧」に追加されている', async () => {
    const user = { id: targetUserId };
    let expectedText = '';
    const targetProduct = clonedProducts.find(item => item.id === targetProductId);
    if (targetProduct) expectedText = targetProduct.name;

    render(MypagePage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          Icon: defineComponent({ template: '<span />' }),
        },
      },
    })

    const switchingButton1Dom = await screen.findByTestId('switching-button1');
    await fireEvent.click(switchingButton1Dom); 

    // 表示された商品の商品名のリストを、期待される出力と比較するテスト
    await waitFor(() => {
      const items = screen.queryAllByTestId('purchased-product-name');
      const itemTexts = items.map(item => item.textContent?.trim());
      expect(itemTexts).toContain(expectedText);
    })
  })
})