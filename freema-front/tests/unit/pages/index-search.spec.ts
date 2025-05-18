import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'
import IndexPage from '~/pages/index.vue'

// このテストで使用するテスト用データ
import { mockProducts } from '../../mockData/mockProducts'
import { mockFavorites } from '../../mockData/mockFavorites'

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
      if (url === '/products') return Promise.resolve({ data: mockProducts })
      if (url === '/get_favorites') return Promise.resolve({ data: mockFavorites })
      return Promise.resolve({ data: [] })
    }),
    post: vi.fn()
  })
}));

// vue-router をモック
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: {} }),
}))

describe('6. 商品検索機能', () => {
  it('6-1. 「商品名」で部分一致検索ができる(ゲストユーザー)', async () => {
    // テスト条件
    const testWord = "時計";  // 検索ワード
    const expectedTexts = ['腕時計'];   // 期待される出力：表示される商品が「腕時計」のみ

    // Pinia ストアのセットアップ（ゲストユーザー）
    const testingPinia = createTestingPinia({
      initialState: {
        search: {
          keyword: testWord,
          triggerSearch: 1,
        },
        auth: {
          user: null,
        },
      },
      stubActions: false, // watchが反応するようにするため false
    })

    render(IndexPage, {
      global: {
        plugins: [testingPinia],
        stubs: {
          ClientOnly: { template: '<slot />' },
          Icon: defineComponent({ template: '<span />' }),
        },
      },
    })
    // renderIndexPage(null);

    // 結果の検証
    await waitFor(() => {
      const items = screen.getAllByTestId('product-item--name');
      const itemTexts = items.map(item => item.textContent?.trim());
      expect(itemTexts).toEqual(expectedTexts);
    })
  })

  it('6-2. 検索状態がマイリストでも保持されている(user_id=1)', async () => {
    const testWord = "バッグ"
    const expectedTexts = ['ショルダーバッグ']

    const testingPinia = createTestingPinia({
      initialState: {
        search: {
          keyword: testWord,
          triggerSearch: 1,
        },
        auth: {
          user: { id: 1 },
        },
      },
      stubActions: false,
    })

    render(IndexPage, {
      global: {
        plugins: [testingPinia],
        stubs: {
          NuxtLink: true,
          ClientOnly: { template: '<slot />' },
          Icon: defineComponent({ template: '<span />' }),
        },
      },
    })

    // 検索が反映されていることを確認（初期表示）
    await waitFor(() => {
      const items = screen.getAllByTestId('product-item--name');
      const itemTexts = items.map(item => item.textContent?.trim());
      expect(itemTexts).toEqual(expectedTexts);
    })

    // 「マイリスト」ボタンをクリックして検索状態が保持されているか確認
    await fireEvent.click(screen.getByTestId('switching-button1'))

    await waitFor(() => {
      const items = screen.getAllByTestId('product-item--name');
      const itemTexts = items.map(item => item.textContent?.trim());
      expect(itemTexts).toEqual(expectedTexts);
    })
  })
})


// import { describe, it, expect, vi } from 'vitest'
// import { render, screen, waitFor, fireEvent } from '@testing-library/vue'
// import { createTestingPinia } from '@pinia/testing'
// import { defineComponent } from 'vue'
// import IndexPage from '~/pages/index.vue'

// import { mockProducts } from '../../mockData/mockProducts'
// import { mockFavorites } from '../../mockData/mockFavorites'

// // useAuth をモック
// vi.mock('~/composables/useAuth', () => ({
//   default: () => ({
//     get: vi.fn().mockImplementation((url: string) => {
//       if (url === '/products') {
//         return Promise.resolve({ data: mockProducts })
//       }
//       if (url === '/get_favorites') {
//         return Promise.resolve({ data: mockFavorites })
//       }
//       return Promise.resolve({ data: [] })
//     }),
//     post: vi.fn()
//   })
// }));

// // vue-router をモック
// vi.mock('vue-router', () => ({
//   useRouter: () => ({
//     push: vi.fn(),
//   }),
//   useRoute: () => ({
//     params: {},
//   }),
// }))

// describe('IndexPage', () => {
//   it('6-1. 「商品名」で部分一致検索ができる(ゲストユーザー)', async () => {
//     // テスト条件
//     const testWord = "時計";  // 検索ワード
//     const expectedTexts = ['腕時計'];   // 期待される出力：表示される商品が「腕時計」のみ

//     // Pinia ストアのセットアップ（ゲストユーザー）
//     const testingPinia = createTestingPinia({
//       initialState: {
//         search: {
//           keyword: testWord,
//           triggerSearch: 1,
//         },
//         auth: {
//           user: null,
//         },
//       },
//       stubActions: false, // watchが反応するようにするため false
//     })

//     render(IndexPage, {
//       global: {
//         plugins: [testingPinia],
//         stubs: {
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }),
//         },
//       },
//     })

//     // 結果の検証
//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item--name');
//       const itemTexts = items.map(item => item.textContent?.trim());
//       expect(itemTexts).toEqual(expectedTexts);
//     })
//   })

//   it('6-2. 検索状態がマイリストでも保持されている(user_id=1)', async () => {
//     const testWord = "バッグ"
//     const expectedTexts = ['ショルダーバッグ']

//     const testingPinia = createTestingPinia({
//       initialState: {
//         search: {
//           keyword: testWord,
//           triggerSearch: 1,
//         },
//         auth: {
//           user: { id: 1 },
//         },
//       },
//       stubActions: false,
//     })

//     render(IndexPage, {
//       global: {
//         plugins: [testingPinia],
//         stubs: {
//           NuxtLink: true,
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }),
//         },
//       },
//     })

//     // 検索が反映されていることを確認（初期表示）
//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item--name');
//       const itemTexts = items.map(item => item.textContent?.trim());
//       expect(itemTexts).toEqual(expectedTexts);
//     })

//     // 「マイリスト」ボタンをクリックして検索状態が保持されているか確認
//     await fireEvent.click(screen.getByTestId('switching-button1'))

//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item--name');
//       const itemTexts = items.map(item => item.textContent?.trim());
//       expect(itemTexts).toEqual(expectedTexts);
//     })
//   })
// })


