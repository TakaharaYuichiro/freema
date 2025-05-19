<template>
  <div class="thanks__content">
    <div class="thanks__content--inner">
      <template v-if="method == 0">
        <div class="thanks__heading">
          <h2>データを確認中です</h2>
        </div>
      </template>
      <template v-else>
        <template v-if="price <= 0">
          <div class="thanks__heading">
            <h2>ご注文ありがとうございました！</h2>
          </div>
          <div class="thanks__message">
            <p>注文を完了しました。</p>
            <p>お支払いが必要な項目はありません。</p>
          </div>
          <div class="form__button">
            <button class="form__button-submit form__button-cancel" type="button">
              <a href="/mypage?mode=1">マイページへ</a>
            </button>
          </div>
        </template>
        <template v-else>
          <div class="thanks__heading">
            <h2>ご注文はまだ完了していません</h2>
          </div>
          <template v-if="method == 2">
            <div class="thanks__message">
              <p>注文を完了するためにはカード決済が必要です。</p>
              <p>支払いを行いますか？</p>
              <div class="form__button">
                <button class="form__button-submit" @click="handleSubmit">カード決済へ</button>
                <button class="form__button-submit form__button-cancel" type="button">
                  <a href="/mypage?mode=2">今はしない</a>
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="thanks__message">
              <p>コンビニでのお支払いを確認後に注文が確定します。</p>
            </div>
            <div class="form__button">
              <button class="form__button-submit" @click="handleSubmitKonbini">コンビニ決済へ</button>
              <button class="form__button-submit form__button-cancel" type="button">
                <a href="/mypage?mode=2">今はしない</a>
              </button>
            </div>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import useAuth from '~/composables/useAuth';

definePageMeta({ middleware: 'auth' });

const { get } = useAuth();
const router = useRouter();
const price = ref(0);
const method = ref(0);

// 簡易セッションストア(server/middleware/session.ts)からpurchase_idを取得
const { data: purchaseId } = await useFetch('/api/get_purchase_id');
if (!purchaseId.value) {
  throw createError({ statusCode: 400, statusMessage: 'No purchase found' });
}

const readPurchase = async () => {
  try {
    const resp = await get(`/purchases/${purchaseId.value}`);
    price.value = resp.data.product.price;
    method.value = resp.data.method_index;
  } catch (err) {
    console.error('読み込みに失敗しました');
  }
}

const handleSubmit = async () => {
  if (purchaseId.value) {
    await $fetch('/api/store_purchase', {
      method: 'POST',
      body: { purchaseId: purchaseId.value }
    })
    router.push('/payment_card');
  }
}

const handleSubmitKonbini = async () => {
  if (purchaseId.value) {
    await $fetch('/api/store_purchase', {
      method: 'POST',
      body: { purchaseId: purchaseId.value }
    })
    router.push('/payment_konbini');
  }
}

onMounted(async () => {
  await readPurchase();
});
</script>

<style scoped>
body {
  margin: 0;
  height: 100%;
}

.thanks__content {
  display: inline-block;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  width: 100%;
  height: 90vh;
}

.backStr {
  position: absolute;
  display: inline-block;
  white-space: nowrap;
  font-size: 22vw;
  font-weight: bold;
  color: #82756A10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Inika';
  font-weight: normal;
}

.thanks__content--inner {
  width: 100%;
  height: 100%;
  display: inline-block;
  position: absolute;
  border: none;
  top: 45%;
  left: 0;
  right: 0;
  bottom: 0;
}

.thanks__heading {
  margin-bottom: 40px;
  text-align: center;
}

.thanks__heading h2 {
  font-weight: bold;
}

.thanks__message {
  margin: 10px auto;
  width: 400px;
}

.form__button {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form__button-submit {
  padding: 0;
  width: 150px;
  height: 50px;
  border: none;
  background: #305DFF;
  cursor: pointer;
  border-radius: 5px;
  margin: 15px;
  color: #fff;
  font-size: 1.2rem;
}

.form__button-cancel {
  background: rgb(124, 106, 106);
  font-size: 0.9rem;
}

.form__button-submit:hover {
  background: #c7c0ba;
}

.form__button a {
  text-decoration: none;
  color: #fff;
  display: block;
  line-height: 50px;
}
</style>