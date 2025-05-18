import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { describe, it, expect} from 'vitest'
import { defineComponent } from 'vue'
import TestWrapper from '~/tests/utils/TestWrapper.vue' // ログアウトテスト用のdefalut.vueとindex.vueの組み合わせのvue

// このテストで使用するテスト用データ
import { mockProducts } from '../../mockData/mockProducts'

// useRuntimeConfigをモック
import { IMAGE_URL_BASE } from '~/tests/utils/constants'
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    imageUrlBase: IMAGE_URL_BASE, 
  }
}))

// useAuth をモック
const mockLogin = vi.fn();
const mockLogout = vi.fn();
vi.mock('~/composables/useAuth', () => ({
  default: () => ({
    login: mockLogin,
    logout: mockLogout,
    error: null,
    get: vi.fn().mockImplementation((url: string) => {
      if (url === '/products') return Promise.resolve({ data: mockProducts })
      return Promise.resolve({ data: [] })
    }),
    post: vi.fn()
  }),
}))

vi.mock('vue-router', () => {
  const mockPush = vi.fn()
  const mockRoute = { path: '/' } 

  return {
    useRouter: () => ({ push: mockPush }),
    useRoute: () => mockRoute,
    __mockPush: mockPush
  }
})

// @ts-expect-error__mockPush is only available in test context
import { __mockPush as mockPush } from 'vue-router'

describe('3. ログアウト機能', () => {
  it('3-1. ログイン後、ログアウトができる', async () => {
    const userId = 1;
    const user = { id: userId };
    render(TestWrapper, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false, // 実際にアクションが動くようにする
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          ClientOnly: { template: '<slot />' },
          Icon: defineComponent({ template: '<span />' }),
        },
      },
    });

    const logoutButton = await screen.findByTestId('logout-button');
    await fireEvent.click(logoutButton);

    await waitFor(() => {
      // ログアウト後ログイン画面に戻ることを確認
      expect(mockPush).toHaveBeenCalledWith('/login') 
    })
  })
})
