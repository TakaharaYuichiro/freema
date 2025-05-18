import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/vue'
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
}))

// vue-router をモック
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: {} }),
}))

// 共通のレンダリング関数
const renderIndexPage = (user: any = null) => {
  return render(IndexPage, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })
      ],
      stubs: {
        NuxtLink: true,
        ClientOnly: { template: '<slot />' },
        Icon: defineComponent({ template: '<span />' }),
      },
    },
  });
};

// Soldマーク付き商品名を抽出
const getSoldProductNames = () => {
  const items = screen.getAllByTestId('product-item');
  return items.reduce<string[]>((names, item) => {
    const soldMark = within(item).queryByTestId('product-item--sold');
    if (soldMark) {
      const nameEl = within(item).getByTestId('product-item--name');
      names.push(nameEl.textContent?.trim() || '');
    }
    return names;
  }, []);
};

// 商品名の一覧を抽出
const getVisibleProductNames = () => {
  return screen.getAllByTestId('product-item--name')
    .map(item => item.textContent?.trim());
};

describe('4. 商品一覧取得', () => {

  it('4-1. 全商品を取得できる(ゲストユーザー)', async () => {
    renderIndexPage(null);
    const expected = mockProducts.map(p => p.name);

    await waitFor(() => {
      expect(getVisibleProductNames()).toEqual(expected);
    });
  });

  it('4-2. 購入済み商品は「Sold」と表示される', async () => {
    renderIndexPage(null);
    const expected = mockProducts.filter(p => p.purchases_exists).map(p => p.name);

    await waitFor(() => {
      expect(getSoldProductNames()).toEqual(expected);
    });
  });

  it('4-3. 自分が出品した商品は表示されない(user_id=1)', async () => {
    const userId = 1;
    renderIndexPage({ id: userId });
    const expected = mockProducts.filter(p => p.user_id !== userId).map(p => p.name);

    await waitFor(() => {
      expect(getVisibleProductNames()).toEqual(expected);
    });
  });
  
})

describe('5. マイリスト一覧取得', () => {

  it('5-1. いいねした商品だけが表示される', async () => {
    const userId = 1;
    renderIndexPage({ id: userId });

    const expected = mockProducts
      .filter(p => p.user_id !== userId)
      .filter(p => mockFavorites.some(f => f.product_id === p.id && f.user_id === userId))
      .map(p => p.name);

    await fireEvent.click(screen.getByTestId('switching-button1'));

    await waitFor(() => {
      expect(getVisibleProductNames()).toEqual(expected);
    });
  });

  it('5-2. マイリストの購入済み商品は「Sold」と表示される', async () => {
    const userId = 1;
    renderIndexPage({ id: userId });

    const expected = mockProducts
      .filter(p => p.user_id !== userId)
      .filter(p => mockFavorites.some(f => f.product_id === p.id && f.user_id === userId))
      .filter(p => p.purchases_exists)
      .map(p => p.name);

    await fireEvent.click(screen.getByTestId('switching-button1'));

    await waitFor(() => {
      expect(getSoldProductNames()).toEqual(expected);
    });
  });

  it('5-3. マイリストには自分が出品した商品は表示されない', async () => {
    const userId = 1;
    renderIndexPage({ id: userId });

    const expected = mockProducts
      .filter(p => p.user_id !== userId)
      .filter(p => mockFavorites.some(f => f.product_id === p.id && f.user_id === userId))
      .map(p => p.name);

    await fireEvent.click(screen.getByTestId('switching-button1'));

    await waitFor(() => {
      expect(getVisibleProductNames()).toEqual(expected);
    });
  });

  it('5-4. 未認証(ゲストユーザー)の場合は何も表示されない', async () => {
    renderIndexPage({ id: null });

    await fireEvent.click(screen.getByTestId('switching-button1'));

    await waitFor(() => {
      expect(screen.queryAllByTestId('product-item')).toHaveLength(0);
    });
  });

});



// import { describe, it, expect, vi } from 'vitest'
// import { render, screen, waitFor, within, fireEvent } from '@testing-library/vue'
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
//         return Promise.resolve({ data:mockFavorites })
//       }
//       return Promise.resolve({ data: [] })
//     }),
//     post: vi.fn()
//   })
// }));

// vi.mock('vue-router', () => ({
//   useRouter: () => ({
//     push: vi.fn(),
//   }),
//   useRoute: () => ({
//     params: {},
//   }),
// }))

// describe('商品一覧取得, マイリスト一覧取得', () => {
//   it('4-1. 全商品を取得できる(ゲストユーザー)', async () => {
//     const user = null;
//     const expectedTexts = mockProducts.map(item => item.name);

//     render(IndexPage, {
//       global: {
//         plugins: [createTestingPinia({
//           stubActions: false,
//           initialState: {
//             auth: { user }
//           }
//         })],
//         stubs: {
//           NuxtLink: true,
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }), 
//         },
//       },
//     })

//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item--name');
//       const itemTexts = items.map(item => item.textContent?.trim());
//       expect(itemTexts).toEqual(expectedTexts);
//     })
//   })

//   it('4-2. 購入済み商品は「Sold」と表示される', async () => {
//     const user = null;
//     const expectedTexts = mockProducts.filter(item => item.purchases_exists).map(item => item.name);

//     render(IndexPage, {
//       global: {
//         plugins: [createTestingPinia({
//           stubActions: false,
//           initialState: {
//             auth: { user }
//           }
//         })],
//         stubs: {
//           NuxtLink: true,
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }), 
//         },
//       },
//     })

//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item');
//       const soldProductNames: string[] = [];
//       items.forEach((item) => {
//         const soldMark = within(item).queryByTestId('product-item--sold');
//         if (soldMark) {
//           const nameEl = within(item).getByTestId('product-item--name');
//           soldProductNames.push(nameEl.textContent || '')
//         }
//       })
//       expect(soldProductNames).toEqual(expectedTexts);
//     })
//   })

//   it('4-3. 自分が出品した商品は表示されない(user_id=1)', async () => {
//     const targetUserId = 1;
//     const expectedTexts = mockProducts.filter(item => item.user_id != targetUserId).map(item => item.name);

//     const user = { id: targetUserId };
//     render(IndexPage, {
//       global: {
//         plugins: [createTestingPinia({
//           stubActions: false,
//           initialState: {
//             auth: { user }
//           }
//         })],
//         stubs: {
//           NuxtLink: true,
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }), 
//         },
//       },
//     })

//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item--name');
//       const itemTexts = items.map(item => item.textContent?.trim());
//       expect(itemTexts).toEqual(expectedTexts);
//     })
//   })

//   it('5-1. いいねした商品だけが表示される(user_id=1)', async () => {
//     // テスト対象のユーザーID
//     const targetUserId = 1;
    
//     // 期待される出力：テスト対象のユーザーがいいねをした商品の商品名のリスト
//     const expectedTexts = mockProducts
//       .filter(item => item.user_id !== targetUserId)
//       .filter(item => mockFavorites.some(fav => fav.product_id === item.id && fav.user_id === targetUserId))
//       .map(item => item.name);

//     // トップページ表示
//     const user = { id: targetUserId };  // テスト対象のユーザー
//     render(IndexPage, {
//       global: {
//         plugins: [createTestingPinia({
//           stubActions: false,
//           initialState: {
//             auth: { user }
//           }
//         })],
//         stubs: {
//           NuxtLink: true,
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }), 
//         },
//       },
//     })

//     // 「マイリストボタン」をクリック
//     await fireEvent.click(screen.getByTestId('switching-button1')); 

//     // 表示された商品の商品名のリストを、期待される出力と比較するテスト
//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item--name');
//       const itemTexts = items.map(item => item.textContent?.trim());
//       expect(itemTexts).toEqual(expectedTexts);
//     })
//   })

//   it('5-2. マイリストの購入済み商品は「Sold」と表示される(user_id=1)', async () => {
//     // テスト対象のユーザーID
//     const targetUserId = 1;
    
//     // 期待される出力：テスト対象のユーザーがいいねをした商品の商品名のリスト
//     const expectedTexts = mockProducts
//       .filter(item => item.user_id !== targetUserId)
//       .filter(item => mockFavorites.some(fav => fav.product_id === item.id && fav.user_id === targetUserId))
//       .filter(item => item.purchases_exists)
//       .map(item => item.name);

//     // トップページ表示
//     const user = { id: targetUserId };  // テスト対象のユーザー
//     render(IndexPage, {
//       global: {
//         plugins: [createTestingPinia({
//           stubActions: false,
//           initialState: {
//             auth: { user }
//           }
//         })],
//         stubs: {
//           NuxtLink: true,
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }), 
//         },
//       },
//     })

//     // 「マイリストボタン」をクリック
//     await fireEvent.click(screen.getByTestId('switching-button1')); 

//     // 表示された商品のうち、Soldマークがついている商品の商品名のリストを、期待される出力と比較するテスト
//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item');
//       const soldProductNames: string[] = [];
//       items.forEach((item) => {
//         const soldMark = within(item).queryByTestId('product-item--sold');
//         if (soldMark) {
//           const nameEl = within(item).getByTestId('product-item--name');
//           soldProductNames.push(nameEl.textContent || '')
//         }
//       })
//       expect(soldProductNames).toEqual(expectedTexts);
//     })
//   })

//   it('5-3. マイリストには自分が出品した商品は表示されない(user_id=1)', async () => {
//     // テスト対象のユーザーID
//     const targetUserId = 1;
    
//     // 期待される出力：テスト対象のユーザーがいいねをした商品の商品名のリスト
//     const expectedTexts = mockProducts
//       .filter(item => item.user_id !== targetUserId)
//       .filter(item => mockFavorites.some(fav => fav.product_id === item.id && fav.user_id === targetUserId))
//       .map(item => item.name);

//     // トップページ表示
//     const user = { id: targetUserId };  // テスト対象のユーザー
//     render(IndexPage, {
//       global: {
//         plugins: [createTestingPinia({
//           stubActions: false,
//           initialState: {
//             auth: { user }
//           }
//         })],
//         stubs: {
//           NuxtLink: true,
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }), 
//         },
//       },
//     })

//     // 「マイリストボタン」をクリック
//     await fireEvent.click(screen.getByTestId('switching-button1')); 

//     // 表示された商品の商品名のリストを、期待される出力と比較するテスト
//     await waitFor(() => {
//       const items = screen.getAllByTestId('product-item--name');
//       const itemTexts = items.map(item => item.textContent?.trim());
//       expect(itemTexts).toEqual(expectedTexts);
//     })
//   })

//   it('5-4. 未認証(ゲストユーザー)の場合は何も表示されない', async () => {
//     // テスト対象のユーザーID
//     const targetUserId = null;
    
//     // 期待される出力：表示される商品がゼロ個
//     const expectedItemCounts = 0;

//     // トップページ表示
//     const user = { id: targetUserId };  // テスト対象のユーザー
//     render(IndexPage, {
//       global: {
//         plugins: [createTestingPinia({
//           stubActions: false,
//           initialState: {
//             auth: { user }
//           }
//         })],
//         stubs: {
//           NuxtLink: true,
//           ClientOnly: { template: '<slot />' },
//           Icon: defineComponent({ template: '<span />' }), 
//         },
//       },
//     })

//     // 「マイリストボタン」をクリック
//     await fireEvent.click(screen.getByTestId('switching-button1')); 

//     // 表示された商品の商品名のリストを、期待される出力と比較するテスト
//     await waitFor(() => {
//       const items = screen.queryAllByTestId('product-item');
//       expect(items).toHaveLength(expectedItemCounts);
//     })
//   })
// })
