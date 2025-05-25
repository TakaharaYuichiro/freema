<template>
  <div class="input-container">
    <div class="card-content">
      <div class="card-content__label">カード番号</div>
      <div id="card-number" class="form-control"></div>
    </div>

    <div class="card-content">
      <div class="card-content__label">有効期限</div>
      <div id="card-expiry" class="form-control"></div>
    </div>

    <div class="card-content">
      <div class="card-content__label">セキュリティコード</div>
      <div id="card-cvc" class="form-control"></div>
    </div>

    <div id="card-errors" class="text-danger">{{ error }}</div>

    <div class="button-container">
      <button class="button button--cancel" @click="handleCancel">キャンセル</button>
      <button class="button" @click="handleSubmit">お支払い</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import useAuth from '~/composables/useAuth';
import { useRouter } from "vue-router";

const props = defineProps<{
  purchaseId: number
  totalPrice: number
}>();

const { post } = useAuth();
const router = useRouter();

const error = ref('');
let stripe: any = null;
let cardNumber: any = null;
let cardExpiry: any = null;
let cardCvc: any = null;

onMounted(async () => {
  const stripePublicKey = useRuntimeConfig().public.stripePublicKey;
  stripe = await loadStripe(stripePublicKey)
  const elements = stripe.elements()

  cardNumber = elements.create('cardNumber')
  cardNumber.mount('#card-number')

  cardExpiry = elements.create('cardExpiry')
  cardExpiry.mount('#card-expiry')

  cardCvc = elements.create('cardCvc')
  cardCvc.mount('#card-cvc')

  const updateError = (event: any) => {
    error.value = event.error ? event.error.message : ''
  }

  cardNumber.on('change', updateError)
  cardExpiry.on('change', updateError)
  cardCvc.on('change', updateError)
});

const handleSubmit = async () => {
  error.value = '';
  const result = await stripe.createToken(cardNumber)
  if (result.error) {
    error.value = result.error.message;
    return;
  }

  try {
    const resp = await post('/card-payment', {
      stripeToken: result.token.id,
      purchase_id: props.purchaseId,
      total_price: props.totalPrice
    })

    if (resp.success) {
      router.push('/mypage?mode=1');
      return;
    } else {
      throw new Error(resp.error || '決済に失敗しました。');
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || '決済に失敗しました'
  } 
};

const handleCancel = async () => {
  router.push('/mypage?mode=2');
};
</script>

<style scoped>
.input-container {
  padding: 10px;
}

.card-content {
  margin: 10px 0;
}

.card-content__label {
  font-weight: bold;
  color: #666;
  margin-bottom: 2px;
}

.form-control {
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 6px;
}

.text-danger {
  color: red;
  height: 30px;
}

.button-container {
  display: flex;
  justify-content: right;
  margin-top: 20px;
}

.button {
  width: 140px;
  height: 35px;
  margin-left: 10px;
  border: none;
  border-radius: 3px;
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

.button:disabled {
  background: #aaa;
  color: #fff;
  cursor: not-allowed;
}

.button--cancel {
  background: transparent;
  color: #333;
  border: 1px solid #666;
  font-size: 0.9rem;
  width: 100px;
}
</style>
