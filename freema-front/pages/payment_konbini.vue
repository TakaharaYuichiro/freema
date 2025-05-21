<template>
  <div class="main-container">
    <div class="main-content__window">
      <div class="header-container">
        <div class="header-text">Stripeコンビニ決済</div>
      </div>
      <div class="description">
        <p>Stripeを利用したコンビニ決済のデモです。</p>
        <p>このデモでは、「支払いを完了して戻る」をクリックすることでコンビニ支払いが完了します。</p>
      </div>
      <div class="payment-content">
        <div>支払い金額: {{ price.toLocaleString() }}円</div>
        <div v-if="paymentInfo">
          <div>支払い期限: {{ formatDate(paymentInfo.expires_at) }}</div>
          <div>
            <button class="confirm-button"
              @click="handleConfirm(paymentInfo.hosted_voucher_url)">Stripeで支払い内容を確認する</button>
          </div>
        </div>
      </div>
      <div class="button-container">
        <button class="button" @click="handleSubmit">支払いを完了して戻る</button>
      </div>
      <div v-if="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import useAuth from '~/composables/useAuth';
import { useRouter } from "vue-router";

definePageMeta({ middleware: 'auth' });

const { get, post } = useAuth();
const router = useRouter();
const price = ref(0);
const paymentInfo = ref<any>(null)
const paymentData = ref<any>(null)
const error = ref<string>('')

// 簡易セッションストア(server/middleware/session.ts)からpurchase_idを取得
const { data: purchaseId } = await useFetch('/api/get_purchase_id');
if (!purchaseId.value) {
  throw createError({ statusCode: 400, statusMessage: 'No purchase found' });
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // 秒→ミリ秒に変換
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const readPurchase = async () => {
  try {
    const resp = await get(`/purchases/${purchaseId.value}`);
    if (resp) {
      const respPrice = resp.data.product.price;
      if (respPrice > 0) {
        price.value = respPrice;
        return true;
      }
    }
    return false;

  } catch (err) {
    return false;
  }
}

const konbiniPayment = async () => {
  try {
    const resp = await post('/konbini-payment', {
      purchase_id: purchaseId.value,
      total_price: price.value,
    })

    if (resp.payment_info) {
      paymentInfo.value = resp.payment_info;
      paymentData.value = resp;
    } else {
      error.value = '支払い情報を取得できませんでした';
    }
  } catch (e: any) {
    error.value = e.data?.error || '支払いに失敗しました'
  }
}

const handleConfirm = (url: string) => {
  window.open(url, '_blank');
}

const handleSubmit = async () => {
  // purchaseの支払日を記録
  try {
    await post('/konbini-payment/complete', {
      purchase_id: purchaseId.value,
      payment_id: paymentData.value.payment_intent_id,
      client_secret: paymentData.value.client_secret,
    })
    router.push('/mypage?mode=1');
    return;
  } catch (err) {
    console.error('APIアクセスエラー');
    alert('エラーが発生し、支払いを完了できませんでした');
  }
  router.push('/mypage?mode=2');
};

onMounted(async () => {
  const retPurchase = await readPurchase();
  if (!retPurchase) {
    console.error('読み込みに失敗しました');
    return;
  }
  await konbiniPayment();
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
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: start;
}

.description {
  padding: 5px 10px;
  background: #FFF3CC;
  font-size: 0.9rem;
}

.confirm-button {
  border: none;
  color: #305DFF;
  text-decoration: underline;
  font-size: 0.9rem;
  background: transparent;
  padding: 0 10px;
  margin: 5px 0;
}

.button-container {
  display: flex;
  justify-content: center;
  margin: 30px 0 15px;
}

.button {
  height: 40px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  background: #305DFF;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
}

.button:hover {
  background: #e5af9d;
  color: #000;
  cursor: pointer;
}

.error {
  color: red;
}
</style>
