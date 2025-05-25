import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import PurchasePage from '~/pages/purchase.vue'
import ProfilePage from '~/pages/profile.vue'
import MypagePage from '~/pages/mypage.vue'
import '@testing-library/jest-dom'    // Chai
import type { Purchase } from '~/types/purchase';
import { PAYMENT_OPTIONS } from '@/utils/constants'

// このテストで使用するテスト用データ
import { mockProducts } from '../../mockData/mockProducts'
import { mockFavorites } from '../../mockData/mockFavorites'
const clonedProducts = structuredClone(mockProducts);   // mockProductsに、破壊的名変更を行うので、ディープコピーしておく
const mockPurchases: Purchase[] = [];

// テスト条件
const targetProductId = 3;
const targetUserId = 2;
const user = { id: targetUserId, zipcode: '1234567', address: 'テスト住所', building: '', name: 'テストユーザー' };

// profile画面で変更するuserデータ
const updatedProfile = { zipcode: '987-6543', address: '変更後のテスト住所', building: '変更後の建物名', name: '変更後の名前' };

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
      if (url === '/products') {
        return Promise.resolve({ data: clonedProducts })
      }
      if (url === '/get-favorites') {
        return Promise.resolve({ data: mockFavorites })
      }
      if (url === `/products/${targetProductId}`) {
        const products = clonedProducts.find(product => product.id === targetProductId);
        return Promise.resolve({ data: products })
      }
      if (url === `/users/${targetUserId}`) {
        const user = { id: targetUserId, zipcode: '1234567', address: 'テスト住所', building: '', name: 'テストユーザー' };
        return Promise.resolve({ data: user })
      }
      if (url === '/purchases?option=mine') {
        const purchases = mockPurchases.filter(item => item.user_id === targetUserId);
        return Promise.resolve({ data: purchases })
      }
      return Promise.resolve({ data: {} })
    }),

    post: vi.fn().mockImplementation((url: string, payload: any) => {
      if (url === `/purchases`) {
        // ここで、purchases のPOST APIのモックとして以下の内容を実行
        // ①購入した商品がindex画面で「sold」と表示されるように、mockProductのpurchases_existsをtrueにする
        // ②「プロフィール/購入した商品一覧」に表示するためにpurchaseを記録しておく、
        const purchase: Purchase = structuredClone(payload);
        const product_id = purchase.product_id;
        const product = clonedProducts.find(item => item.id === product_id);
        if (product) {
          product.purchases_exists = true;
          purchase.product = product;
        }
        purchase.paid_at = "2025-01-01 10:00:00";
        purchase.user_id = targetUserId;
        mockPurchases.push(purchase);
        return Promise.resolve({ data: { id: 1 } });
      }
      return Promise.resolve({ data: {} });
    }),

    put: vi.fn().mockImplementation((url: string, payload: any) => {
      if (url === `/users/${targetUserId}`) {
        // ユーザーデータを更新
        user.name = payload.name;
        user.zipcode = payload.zipcode;
        user.address = payload.address;
        user.building = payload.building;
        return Promise.resolve({ success: true });
      }
      return Promise.resolve({ data: {} });
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

describe('11. 支払い方法選択機能', () => {
  it('11-1. 小計画面で選択した支払い方法が即時反映される', async () => {
    // テスト対象のデータ
    const paymentMethodeIndex = 1;  // 「コンビニ払い」でテスト

    // 正解データ
    const expectedText = PAYMENT_OPTIONS[paymentMethodeIndex];

    // レンダリング
    render(PurchasePage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          ClientOnly: { template: '<slot />' },
        },
      },
    })

    // 支払い方法を設定
    const paymentMethodSelect = await screen.findByTestId('payment-method-select');
    await fireEvent.update(paymentMethodSelect, String(paymentMethodeIndex))  // 支払方法のセレクトボタンの値を設定
    expect((paymentMethodSelect as HTMLSelectElement).value).toBe(String(paymentMethodeIndex)); // 値が更新されたことをアサート

    await waitFor(() => {
      //  小計画面の「支払い方法」の表示内容を確認
      expect(screen.getByTestId('selected-payment-method').textContent?.trim()).toEqual(expectedText);
    });
  })
})

describe('12. 配送先変更機能', () => {
  it('12-1. 送付先住所変更画面にて登録した住所が商品購入画面に反映されている', async () => {
    const paymentMethodeIndex = 1;  // 「コンビニ払い」でテスト

    // まずはプロフィール設定画面で住所などのデータを更新
    render(ProfilePage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          ClientOnly: { template: '<slot />' },
        },
      },
    })

    await fireEvent.update(screen.getByTestId('profile-name'), updatedProfile.name);
    await fireEvent.update(screen.getByTestId('profile-address'), updatedProfile.address);
    await fireEvent.update(screen.getByTestId('profile-zipcode'), updatedProfile.zipcode);
    await fireEvent.update(screen.getByTestId('profile-building'), updatedProfile.building);
    await fireEvent.click(screen.getByTestId('update-button')); // update-buttonをクリックするとモックAPIでuserの内容が更新される

    // 次に商品購入画面をレンダリング
    render(PurchasePage, {
      global: {
        plugins: [createTestingPinia({
          stubActions: false,
          initialState: {
            auth: { user }
          }
        })],
        stubs: {
          ClientOnly: { template: '<slot />' },
        },
      },
    })

    await waitFor(() => {
      // 購入画面に表示されているユーザー情報が、先ほど変更した値になっていることを確認
      expect(screen.getByTestId('sendto-zipcode').textContent?.trim()).toEqual(updatedProfile.zipcode);
      expect(screen.getByTestId('sendto-address').textContent?.trim()).toEqual(updatedProfile.address);
      expect(screen.getByTestId('sendto-building').textContent?.trim()).toEqual(updatedProfile.building);
      expect(screen.getByTestId('sendto-name').textContent?.trim()).toEqual(updatedProfile.name);
    });

    // 以下、12-2のテストのため、購入を実行してpurchaseデータを記録しておく
    // 支払い方法を設定
    const paymentMethodSelect = await screen.findByTestId('payment-method-select');
    await fireEvent.update(paymentMethodSelect, String(paymentMethodeIndex))  // 支払方法のセレクトボタンの値を設定
    expect((paymentMethodSelect as HTMLSelectElement).value).toBe(String(paymentMethodeIndex)); // 値が更新されたことをアサート

    // 「購入ボタン」をクリック
    const purchaseButton = await screen.findByTestId('purchase-button');
    expect(purchaseButton).not.toBeDisabled();
    await fireEvent.click(purchaseButton);
  })

  it('12-2. 購入した商品に送付先住所が紐づいて登録される', async () => {
    // ここでは12-1で購入した商品を正解データとして、それがMypageに表示されることをテストする
    // 正解データ
    const targetPurchase = mockPurchases.find(item => item.product_id === targetProductId);
    const targetProductName = targetPurchase?.product.name;
    const expectSendtoText = targetPurchase?.zipcode + ' ' + targetPurchase?.address + ' ' + (targetPurchase?.building ? targetPurchase?.building + ' ' : '') + targetPurchase?.to_name + '様宛';

    // マイページをレンダリング
    render(MypagePage, {
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

    // 購入した商品のリストを画面に表示する
    const switchingButton1Dom = await screen.findByTestId('switching-button1');
    await fireEvent.click(switchingButton1Dom);

    // 画面の中から商品名と送付先の表示内容を抜き出して、正解データと照合する
    await waitFor(() => {
      const items = screen.getAllByTestId('purchase-item');

      const productSendList: { name: string, sendto: string }[] = [];
      items.forEach((item) => {
        const productName = within(item).queryByTestId('purchased-product-name')?.textContent;
        const sendtoText = within(item).queryByTestId('sendto-text')?.textContent;
        if (productName) {
          const productSend = { name: productName, sendto: sendtoText || '' };
          productSendList.push(productSend);
        }
      })

      const recievedSendtoObject = productSendList.find(item => item.name === targetProductName);
      expect(recievedSendtoObject?.sendto).toEqual(expectSendtoText);
    })
  })
})