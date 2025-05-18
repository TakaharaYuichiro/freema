import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { vi, describe, it, expect } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import '@testing-library/jest-dom'
import LoginPage from '@/pages/login.vue'

// === Mocks ===
const mockLogin = vi.fn()
const mockLogout = vi.fn()

vi.mock('~/composables/useAuth', () => ({
  default: () => ({
    login: mockLogin,
    logout: mockLogout,
    error: null,
  }),
}))

vi.mock('vue-router', () => {
  const mockPush = vi.fn()
  const mockRoute = { path: '/' }
  return {
    useRouter: () => ({ push: mockPush }),
    useRoute: () => mockRoute,
    __mockPush: mockPush,
  }
})

// @ts-expect-error: __mockPush is test-only
import { __mockPush as mockPush } from 'vue-router'

// === 共通関数 ===
function renderLoginPage() {
  return render(LoginPage, {
    global: {
      plugins: [createTestingPinia({ stubActions: false })],
      stubs: {
        NuxtLink: true,
      },
    },
  })
}

async function fillForm(fields: { email?: string; password?: string }) {
  if (fields.email) await fireEvent.update(screen.getByTestId('email'), fields.email)
  if (fields.password) await fireEvent.update(screen.getByTestId('password'), fields.password)
}

describe('2. ログイン機能', () => {
  it('2-1. メールアドレスが入力されていない場合、バリデーションメッセージが表示される', async () => {
    renderLoginPage()
    await fillForm({ password: 'password123' })
    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(screen.getByTestId('error-email').textContent).toMatch(/メールアドレスを入力してください/)
    })
  })

  it('2-2. パスワードが入力されていない場合、バリデーションメッセージが表示される', async () => {
    renderLoginPage()
    await fillForm({ email: 'test@example.com' })
    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(screen.getByTestId('error-password').textContent).toMatch(/パスワードを入力してください/)
    })
  })

  it('2-3. 入力情報が間違っている場合、バリデーションメッセージが表示される', async () => {
    mockLogin.mockResolvedValue(0)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    renderLoginPage()
    await fillForm({ email: 'test@example.com', password: 'wrongpassword' })
    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('ログイン情報が登録されていません。')
    })

    alertSpy.mockRestore()
  })

  it('2-4. 正しい情報が入力された場合、ログイン処理が実行される', async () => {
    mockLogin.mockResolvedValue(1)

    renderLoginPage()
    await fillForm({ email: 'test1@test.com', password: 'test_pw1234' })
    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })
})
