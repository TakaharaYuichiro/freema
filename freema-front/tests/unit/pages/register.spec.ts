import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { vi, describe, it, expect } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import RegisterPage from '@/pages/register.vue'

// === Mocks ===
// useAuth をモック
vi.mock('~/composables/useAuth', () => ({
  default: () => ({
    register: vi.fn().mockResolvedValue(true),
    error: null,
  }),
}))

// vue-router をモック
vi.mock('vue-router', () => {
  const mockPush = vi.fn()
  return {
    useRouter: () => ({ push: mockPush }),
    __mockPush: mockPush,
  }
})
// @ts-expect-error: __mockPush is test-only
import { __mockPush as mockPush } from 'vue-router'

// === 共通関数 ===
// ページをレンダリングする関数
function renderRegisterPage() {
  return render(RegisterPage, {
    global: {
      plugins: [createTestingPinia({ stubActions: false })],
      stubs: {
        NuxtLink: true,
      },
    },
  })
}

// フォーム入力補助関数
async function fillForm(fields: {
  name?: string
  email?: string
  password?: string
  confirm_password?: string
}) {
  if (fields.name) await fireEvent.update(screen.getByTestId('name'), fields.name)
  if (fields.email) await fireEvent.update(screen.getByTestId('email'), fields.email)
  if (fields.password) await fireEvent.update(screen.getByTestId('password'), fields.password)
  if (fields.confirm_password) await fireEvent.update(screen.getByTestId('confirm_password'), fields.confirm_password)
}

describe('1. 会員登録機能', () => {
  it('1-1. 名前が入力されていない場合、バリデーションメッセージが表示される', async () => {
    renderRegisterPage()
    await fillForm({
      email: 'test@example.com',
      password: 'password123',
      confirm_password: 'password123',
    })

    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(screen.getByTestId('error-name').textContent).toMatch(/お名前を入力してください/)
    })
  })

  it('1-2. メールアドレスが入力されていない場合、バリデーションメッセージが表示される', async () => {
    renderRegisterPage()
    await fillForm({
      name: 'テストユーザー',
      password: 'password123',
      confirm_password: 'password123',
    })

    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(screen.getByTestId('error-email').textContent).toMatch(/メールアドレスを入力してください/)
    })
  })

  it('1-3. パスワードが入力されていない場合、バリデーションメッセージが表示される', async () => {
    renderRegisterPage()
    await fillForm({
      name: 'テストユーザー',
      email: 'test@example.com',
      confirm_password: 'password123',
    })

    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(screen.getByTestId('error-password').textContent).toMatch(/パスワードを入力してください/)
    })
  })

  it('1-4. パスワードが7文字以下の場合、バリデーションメッセージが表示される', async () => {
    renderRegisterPage()
    await fillForm({
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'pass123',
      confirm_password: 'pass123',
    })

    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(screen.getByTestId('error-password').textContent).toMatch(/パスワードは8文字以上で入力してください/)
    })
  })

  it('1-5. パスワードが確認用パスワードと一致しない場合、バリデーションメッセージが表示される', async () => {
    renderRegisterPage()
    await fillForm({
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'password123',
      confirm_password: 'password456',
    })

    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(screen.getByTestId('error-confirm-password').textContent).toMatch(/パスワードと一致しません/)
    })
  })

  it('1-6. 登録後に verify-info に遷移する', async () => {
    renderRegisterPage()
    await fillForm({
      name: 'テストユーザー',
      email: 'test@example.com',
      password: 'password123',
      confirm_password: 'password123',
    })

    await fireEvent.click(screen.getByTestId('submit'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/verify-info')
    })
  })
})
