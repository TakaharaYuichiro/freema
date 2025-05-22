import { describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import MypagePage from '~/pages/mypage.vue'
import SellPage from '~/pages/sell.vue'
import '@testing-library/jest-dom'    // Chai
import type { Product } from '~/types/product';

// このテストで使用するテスト用データ
import { mockFavorites } from '../../mockData/mockFavorites'
import { mockPurchases } from '../../mockData/mockPurchases'
import { mockCategories } from '~/tests/mockData/mockCategories'
const mockProductsLocal: Product[] = [];

// テスト条件
const targetProductId = 3;
const targetUserId = 1;

// useRuntimeConfigをモック
import { IMAGE_URL_BASE } from '~/tests/utils/constants'
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    imageUrlBase: IMAGE_URL_BASE, 
  }
}))

// このテストファイルではwindow.alertをスルーする
beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// useAuth をモック
vi.mock('~/composables/useAuth', () => ({
  default: () => ({
    get: vi.fn().mockImplementation((url: string) => {
      if (url === '/products')  return Promise.resolve({ data: mockProductsLocal });
      if (url === '/get-favorites')  return Promise.resolve({ data: mockFavorites });
      if (url === '/purchases?option=mine') {
        const purchases = mockPurchases.filter(item => item.user_id === targetUserId);
        return Promise.resolve({ data: purchases })
      }
      if (url === '/categories')  return Promise.resolve({ data: mockCategories });
      return Promise.resolve({ data: {} })
    }),

    post: vi.fn().mockImplementation((url: string, payload: any) => {
      if (url === `/products`) mockProductsLocal.push(payload);
      return Promise.resolve({ data: {} });
    })
  })
}));

// vue-routerをモック
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({
      query: {
        product_id: targetProductId
      }
    }),
}))

describe('15. 出品商品情報登録', () => {

  it('15-1. 商品出品画面にて必要な情報が保存できること（カテゴリ、商品の状態、商品名、商品の説明、販売価格）', async () => {
    const user = { id: targetUserId, name: 'テストユーザー' };

    render(SellPage, {
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

    // ①カテゴリを選択（ここでは、「ファッション」と「家電」のボタンを押す）
    await waitFor(async () => {
      const categoryButtons = screen.getAllByTestId('category-button');
      const fashionButton = categoryButtons.find(button => button.textContent?.trim() === 'ファッション');
      const electronicsButton = categoryButtons.find(button => button.textContent?.trim() === '家電');

      expect(fashionButton).toBeDefined();
      expect(electronicsButton).toBeDefined();

      if (fashionButton && electronicsButton) {
        await fireEvent.click(fashionButton);
        await fireEvent.click(electronicsButton);

        // selectedがついたことを確認
        expect(fashionButton.className).toContain('category-list__item__selected');
        expect(electronicsButton.className).toContain('category-list__item__selected');
      }
    })

    // ②商品の状態を選択
    const conditionSelect = await screen.findByTestId('condition-select');
    await fireEvent.update(conditionSelect, String(2))  
    expect((conditionSelect as HTMLSelectElement).value).toBe(String(2)); // 値が更新されたことをアサート

    // ③商品名などを入力
    await fireEvent.update(screen.getByTestId('product-name'), 'テスト商品15-1');
    await fireEvent.update(screen.getByTestId('product-brand'), 'テストブランド');
    await fireEvent.update(screen.getByTestId('product-description'), '商品の説明文のテストです');
    await fireEvent.update(screen.getByTestId('product-price'), '1000');


    // ④出品ボタンをクリック
    await fireEvent.click(screen.getByTestId('submit-button'));

    // 出品されたことをmypageで確認
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

    await waitFor(() => {
      // さきほど出品した商品がリストにあることを確認
      const items = screen.getAllByTestId('product-item--name');
      const itemTexts = items.map(item => item.textContent?.trim());
      expect(itemTexts).toContain('テスト商品15-1');
    })
  })
})