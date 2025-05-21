import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import DetailPage from '~/pages/detail.vue'
import '@testing-library/jest-dom'

// このテストで使用するテスト用データ
import { mockProducts } from '../../mockData/mockProducts'
import { mockEvaluations } from '../../mockData/mockEvaluations'

// テスト条件
const targetProductId = 1;

// useRuntimeConfigをモック
import { IMAGE_URL_BASE } from '~/tests/utils/constants'
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    imageUrlBase: IMAGE_URL_BASE, 
  }
}))

// confirmの戻り値を常に「OK」にする
vi.spyOn(window, 'confirm').mockReturnValue(true);

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

    post: vi.fn().mockImplementation((url: string,  payload: any) => {
      return Promise.resolve({ data: {} });
    })
  })
}));

// vue-routerをモック
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

describe('9. コメント送信機能', () => {
  it('9-1. ログイン済みのユーザーはコメントを送信できる', async () => {
    // テスト対象のユーザー
    const user = { id: 1 };  // ユーザーID=1でテスト

    // 期待される結果
    const expectedEvaluations = mockEvaluations.filter(item => item.product_id === targetProductId);
    const expectedTextObj = {
      'evaluation_count': String(expectedEvaluations?.length),
    };

    // レンダリング
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

    const inputCommentDom = await screen.findByTestId('input-comment');
    const submitCommentDom = await screen.findByTestId('submit-comment');
    await fireEvent.update(inputCommentDom, 'テストコメント')
    await fireEvent.click(submitCommentDom)

    await waitFor(() => {
      const item_evaluation_count1 = screen.getByTestId('product-item--evaluation-count').textContent?.trim();
      const item_evaluation_count2 = screen.getByTestId('product-item--evaluation-count2').textContent?.trim();
      expect(item_evaluation_count1).toEqual(expectedTextObj.evaluation_count);
      expect(item_evaluation_count2).toEqual(expectedTextObj.evaluation_count);
    })
  })

  it('9-2. ログイン前のユーザーはコメントを送信できない', async () => {
    // テスト対象のユーザー
    const user = null;    // ログインしていないユーザーを表す

    // レンダリング
    render(DetailPage, {
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

    const submitCommentDom = await screen.findByTestId('submit-comment');
    await waitFor(() => {
      expect(submitCommentDom).toBeDisabled();
    })
  })

  it('9-3. コメントが入力されていない場合、バリデーションメッセージが表示される', async () => {
    // テスト対象のユーザー
    const user = { id: 1 };  // ユーザーID=1でテスト

    // 期待される結果
    const expectedText = 'コメントを入力してください'; 

    // レンダリング
    render(DetailPage, {
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

    const inputCommentDom = await screen.findByTestId('input-comment'); // DOMが取得できるようになるまで待つ
    await fireEvent.update(inputCommentDom, 'テストコメント'); // 一旦コメントを入力
    await fireEvent.update(inputCommentDom, ''); // コメントを空欄にする

    await waitFor(() => {
      expect(screen.getByTestId('error-comment').textContent).toMatch(expectedText);
    })
  })

  it('9-4. コメントが255字以上の場合、バリデーションメッセージが表示される', async () => {
    // テスト対象のユーザー
    const user = { id: 1 };  // ユーザーID=1でテスト

    // 期待される結果
    const expectedText = 'コメントは255文字以内で入力してください'; 

    // レンダリング
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

    const inputCommentDom = await screen.findByTestId('input-comment'); // DOMが取得できるようになるまで待つ    
    const dummyText256 = 'この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです。文字の大きさ、量、字間、行間等を確認するために入れています。この文章はダミーです';
    await fireEvent.update(inputCommentDom, dummyText256);   // 256文字のダミーテキストを入力

    await waitFor(() => {
      expect(screen.getByTestId('error-comment').textContent).toMatch(expectedText);
    })
  })
})