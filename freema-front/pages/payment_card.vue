<template>
  <div class="main-container">
    <div class="main-content__window">
      <div class="header-container">
        <div class="header-text">Stripe決済</div>
      </div>
      <div class="description">
        Stripeを利用したカード決済のデモです。<br>
        テストに使用するカード番号等は
        <a href="https://docs.stripe.com/testing?locale=ja-JP" target="_blank">こちら(stripeDOCS)</a>
        を参照してください。
      </div>
      <div class="payment-content">
        支払い金額: {{ price }}円
      </div>
      <StripeCardForm :purchaseId="purchaseId" :totalPrice="price" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import useAuth from '~/composables/useAuth';

definePageMeta({ middleware: 'auth' });

const { get } = useAuth();
const price = ref(0);

// 簡易セッションストア(server/middleware/session.ts)からpurchase_idを取得
const { data: purchaseId } = await useFetch('/api/get_purchase_id');
if (!purchaseId.value) {
  throw createError({ statusCode: 400, statusMessage: 'No purchase found' });
}

const readPurchase = async () => {
  try {
    const resp = await get(`/purchases/${purchaseId.value}`);
    price.value = resp.data.product.price;
  } catch (err) {
    console.error('読み込みに失敗しました');
  }
}

onMounted(async () => {
  await readPurchase();
});
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-content__window {
  margin: auto;
  padding: 0px;
  max-width: 1230px;
  width: 400px;
  background: white;
  box-shadow: 6px 2px 10px gray;
  border-radius: 4px;
}

.header-container {
  padding: 15px 15px;
  background: #305DFF;
}

.header-text {
  font-size: 1.2rem;
  color: white;
}

.main-form-container {
  padding: 15px;
  color: #8B7969;
}

.payment-content {
  margin: 10px 10px 5px;
}

.payment-content span {
  color: #333;
}

.message-container--success {
  padding: 10px;
  background: #d1e7dd;
  border-color: #bcd5c9;
  color: #0f5132
}

.message-container--danger {
  padding: 10px 0;
  border-color: #f5c2c7;
  background-color: #f8d7da;
  color: #842029;
}

.message-container--danger ul {
  margin: 0;
}

.description {
  padding: 10px;
  background: #FFF3CC;
  font-size: 0.9rem;
}
</style>
