import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import DetailPage from '~/pages/detail.vue'
import { PRODUCT_CONDITIONS } from '@/utils/constants'

// このテストで使用するテスト用データ
import { mockProducts } from '../../mockData/mockProducts'
import { mockEvaluations } from '../../mockData/mockEvaluations'
import { mockFavorites } from '../../mockData/mockFavorites'
const clonedFavorites = structuredClone(mockFavorites);   // mockFavoritesに破壊的名変更を行うので、ディープコピーしてから使う

// テスト条件
const targetProductId = 1;

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
      
      if (url === `/evaluations?product_id=${targetProductId}`) {
        const data = mockEvaluations.filter(evaluation => evaluation.product_id === targetProductId);
        return Promise.resolve({ data: data })
      }

      return Promise.resolve({ data: {} })
    }),
  })
}));

// 'vue-routerをモック
vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {
      product_id: targetProductId
    }
  }),
  useRouter: () => ({ push: vi.fn()}),
}))

describe('7. 商品詳細情報取得', () => {

  it('7-1. 商品詳細画面に必要な情報が表示される, 7-2.複数選択されたカテゴリが表示されている', async () => {
    // 商品画像、商品名、ブランド名、価格、いいね数、コメント数、商品説明、商品情報（カテゴリ、商品の状態）、コメント数、コメントしたユーザー情報、コメント内容
    const expectedItem = mockProducts.find(product => product.id === targetProductId);
    const expectedEvaluations = mockEvaluations.filter(item => item.product_id === targetProductId);
    const expectedFavorites = clonedFavorites.filter(item => item.product_id === targetProductId);
  
    const expectedTextObj = {
      'name': expectedItem?.name,
      'brand': expectedItem?.brand,
      'price': "¥" + expectedItem?.price.toLocaleString() + "(税込)",
      'favorite_count': String(expectedFavorites?.length),
      'evaluation_count': String(expectedEvaluations?.length),
      'content': expectedItem?.content,
      'category_texts': expectedItem?.categories.map(category => category.name),
      'codition_text': expectedItem ? PRODUCT_CONDITIONS[expectedItem.condition_index] : '',
      'evaluation_comments': expectedEvaluations.map(evaluation=>evaluation.comment),
    };

    const user = null;
    render(DetailPage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: {
              user
            }
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
      // 各項目の表示内容のテキストを確認する
      expect(screen.getByTestId('product-item--name').textContent?.trim()).toEqual(expectedTextObj.name);
      expect(screen.getByTestId('product-item--brand').textContent?.trim()).toEqual(expectedTextObj.brand);
      expect(screen.getByTestId('product-item--price').textContent?.trim()).toEqual(expectedTextObj.price);
      expect(screen.getByTestId('product-item--favorite-count').textContent?.trim()).toEqual(expectedTextObj.favorite_count);
      expect(screen.getByTestId('product-item--evaluation-count').textContent?.trim()).toEqual(expectedTextObj.evaluation_count);
      expect(screen.getByTestId('product-item--content').textContent?.trim()).toEqual(expectedTextObj.content);
      expect(screen.getByTestId('product-item--condition-text').textContent?.trim()).toEqual(expectedTextObj.codition_text);
      expect(screen.getByTestId('product-item--evaluation-count2').textContent?.trim()).toEqual(expectedTextObj.evaluation_count);

      // カテゴリーを確認する
      const item_categories = screen.queryAllByTestId('product-item--category-name');
      const item_category_texts = item_categories.map(item => item.textContent?.trim());
      expect(item_category_texts).toEqual(expectedTextObj.category_texts);

      // コメントを確認する
      const item_evaluation_comments = screen.queryAllByTestId('product-item--evaluation-comment');
      const item_evaluation_comment_texts = item_evaluation_comments.map(item => item.textContent?.trim());
      expect(item_evaluation_comment_texts).toEqual(expectedTextObj.evaluation_comments);
    })
  })
})