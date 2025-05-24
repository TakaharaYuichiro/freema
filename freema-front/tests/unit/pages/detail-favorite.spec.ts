import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import DetailPage from '~/pages/detail.vue'
import '@testing-library/jest-dom'    // Chai

// このテストで使用するテスト用データ
import { mockProducts } from '../../mockData/mockProducts'
import { mockFavorites } from '../../mockData/mockFavorites'
import { mockEvaluations } from '../../mockData/mockEvaluations'
const clonedFavorites = structuredClone(mockFavorites);   // mockFavoritesに破壊的名変更を行うので、ディープコピーしてから使う

// テスト条件
const targetProductId = 1;
const targetUserId = 1;

// useRuntimeConfigをモック
import { IMAGE_URL_BASE } from '~/tests/utils/constants'
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    imageUrlBase: IMAGE_URL_BASE,
  }
}))

// useAuth をモック
vi.mock('~/composables/useAuth', () => ({
  default: () => ({
    get: vi.fn().mockImplementation((url: string) => {
      if (url === `/products/${targetProductId}`) {
        const products = mockProducts.find(product => product.id === targetProductId);
        return Promise.resolve({ data: products })
      }
      
      if (url === `/count-favorites/${targetProductId}`) {
        const data = clonedFavorites.filter(item => item.product_id === targetProductId);
        const count = data?.length;
        return Promise.resolve({ data: { count: count } })
      }
      
      if (url === `/evaluations?product_id=${targetProductId}`) {
        const data = mockEvaluations.filter(evaluation => evaluation.product_id === targetProductId);
        return Promise.resolve({ data: data })
      }

      return Promise.resolve({ data: {} })
    }),

    post: vi.fn().mockImplementation((url: string, payload: any) => {
      if (url === `/invert-favorite`) {
        let is_favorite = false;
        const { product_id } = payload;
        const targetIndex = clonedFavorites.findIndex(item => item.product_id == product_id && item.user_id == targetUserId);
        if (targetIndex !== -1) {
          // すでにいいねされていたら、いいねを削除
          clonedFavorites.splice(targetIndex, 1);
          is_favorite = false;
        } else {
          // まだいいねされていなければ、いいねを追加
          clonedFavorites.push({ id: 1, product_id: product_id, user_id: targetUserId });
          is_favorite = true;
        }
        return Promise.resolve({ is_favorite: is_favorite });
      }
      return Promise.resolve({ data: {} });
    })
  })
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {
      product_id: targetProductId
    }
  }),
  useRouter: () => ({
    push: vi.fn()
  }),
}))

describe('8. いいね機能', () => {

  it('8-1. いいねアイコンを押下することによって、いいねした商品として登録することができる、8-2. 追加済みのアイコンは色が変化する', async () => {
    // 期待される結果
    const favorites = clonedFavorites.filter(item => item.product_id === targetProductId);
    const favoriteCountBeforeFireEvent = favorites?.length;
    const favoriteByTragetUser = favorites.find(item => item.user_id === targetUserId);
    const isFavorite = !!favoriteByTragetUser;
    const countUpAfterFireEvent = isFavorite ? -1 : 1
    const expectedFavoriteCount = favoriteCountBeforeFireEvent + countUpAfterFireEvent;
    const expectedIconColor = isFavorite ? 'rgb(102, 102, 102)' : 'rgb(255, 0, 0)';

    const user = { id: targetUserId };  // テスト対象のユーザー
    render(DetailPage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          Icon: true,
        },
      },
    })

    const favoriteCountDom = await screen.findByTestId('product-item--favorite-count');

    // 「いいねボタン」をクリックする前に表示されているいいね数をチェックする
    await waitFor(() => {
      expect(favoriteCountDom.textContent?.trim()).toEqual(String(favoriteCountBeforeFireEvent));
    })

    // 「いいねボタン」をクリック
    const favoriteButton = await screen.findByTestId('favorite-button');
    await fireEvent.click(favoriteButton);

    await waitFor(() => {
      // 表示された内容を確認
      expect(favoriteCountDom.textContent?.trim()).toEqual(String(expectedFavoriteCount));
      expect(screen.getByTestId('favorite-button-icon')).toHaveStyle(`color: ${expectedIconColor}`)
    })
  })

  it('8-3. 再度いいねアイコンを押下することによって、いいねを解除することができる', async () => {
    // 期待される結果
    const favorites = clonedFavorites.filter(item => item.product_id === targetProductId);
    const favoriteCountBeforeFireEvent = favorites?.length;
    const favoriteByTragetUser = favorites.find(item => item.user_id === targetUserId);
    const countUpAfterFireEvent = favoriteByTragetUser ? -1 : 1
    const expectedFavoriteCount = favoriteCountBeforeFireEvent + countUpAfterFireEvent;

    const user = { id: targetUserId };  // テスト対象のユーザー
    render(DetailPage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          Icon: true,
        },
      },
    })

    const favoriteCountDom = await screen.findByTestId('product-item--favorite-count');

    // 「いいねボタン」をクリックする前に表示されているいいね数をチェックする
    await waitFor(() => {
      expect(favoriteCountDom.textContent?.trim()).toEqual(String(favoriteCountBeforeFireEvent));
    })

    // 「いいねボタン」をクリック
    const favoriteButton = await screen.findByTestId('favorite-button');
    await fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(favoriteCountDom.textContent?.trim()).toEqual(String(expectedFavoriteCount));
    })
  })
})