import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import MypagePage from '~/pages/mypage.vue'
import ProfilePage from '~/pages/profile.vue'
import '@testing-library/jest-dom'    // Chai

// このテストで使用するテスト用データ
import { mockProducts } from '../../mockData/mockProducts'
import { mockFavorites } from '../../mockData/mockFavorites'
import { mockPurchases } from '../../mockData/mockPurchases'
const clonedProducts = structuredClone(mockProducts);   // mockProductsに、破壊的名変更を行うので、ディープコピーしておく

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

// confirmの戻り値を常に「OK」にする
vi.spyOn(window, 'confirm').mockReturnValue(true);

// $fetchをモック（purchaseIdをstoreに保存するところをmockでスルー）
vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ success: true }));

// useAuth をモック
vi.mock('~/composables/useAuth', () => ({
  default: () => ({
    get: vi.fn().mockImplementation((url: string) => {
      if (url === '/products')  return Promise.resolve({ data: clonedProducts });
      if (url === '/get-favorites') return Promise.resolve({ data: mockFavorites });
      if (url === '/purchases?option=mine') {
        const purchases = mockPurchases.filter(item => item.user_id === targetUserId);
        return Promise.resolve({ data: purchases })
      }
      return Promise.resolve({ data: {} })
    }),
  })
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({
    query: {
      product_id: targetProductId
    }
  }),
}))

describe('13. ユーザー情報取得', () => {
  it('13-1. 「マイページ」で必要な情報が取得できる（プロフィール画像、ユーザー名、出品した商品一覧、購入した商品一覧）', async () => {
    const user = { id: targetUserId, name: 'テストユーザー' };

    const expectTextUserName = user.name;
    const expectTextMyProducts = mockProducts.filter(item => item.user_id === targetUserId).map(item => item.name);
    const expectTextMyPurchases = mockPurchases.filter(item => item.user_id === targetUserId).map(item => item.product.name);

    render(MypagePage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          NuxtLink: true,
          ClientOnly: { template: '<slot />' },
          Icon: defineComponent({ template: '<span />' }),
        },
      },
    })

    await waitFor(() => {
      // ユーザー名確認
      expect(screen.getByTestId('user-name').textContent?.trim()).toEqual(expectTextUserName);

      // 自分が出品した商品のリスト確認
      const items = screen.getAllByTestId('product-item--name');
      const itemTexts = items.map(item => item.textContent?.trim());
      expect(itemTexts).toEqual(expectTextMyProducts);
    })

    // 購入済み商品のリスト表示に画面を切り替え
    const switchingButton1Dom = await screen.findByTestId('switching-button1');
    await fireEvent.click(switchingButton1Dom);

    await waitFor(() => {
      // 購入済み商品のリスト確認
      const items = screen.getAllByTestId('purchased-product-name');
      const itemTexts = items.map(item => item.textContent?.trim());
      expect(itemTexts).toEqual(expectTextMyPurchases);
    })
  })
})

describe('14. ユーザー情報変更', () => {

  it('14-1. 「マイページ」で変更項目が初期値として設定されていること（プロフィール画像、ユーザー名、郵便番号、住所）', async () => {
    // テスト用のユーザー情報
    const user = { id: targetUserId, zipcode: '1234567', address: 'テスト住所', building: '', name: 'テストユーザー' };

    // 正解データ
    const expectTextUserName = user.name;
    const expectTextZipcode = user.zipcode;
    const expectTextAddress = user.address;
    const expectTextBuilding = user.building;

    render(ProfilePage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          NuxtLink: true,
          ClientOnly: { template: '<slot />' },
          Icon: defineComponent({ template: '<span />' }),
        },
      },
    })

    await waitFor(() => {
      // 各input要素の初期値を確認
      expect(screen.getByTestId('profile-name')).toHaveValue(expectTextUserName);
      expect(screen.getByTestId('profile-zipcode')).toHaveValue(expectTextZipcode);
      expect(screen.getByTestId('profile-address')).toHaveValue(expectTextAddress);
      expect(screen.getByTestId('profile-building')).toHaveValue(expectTextBuilding);
    })
  })
})