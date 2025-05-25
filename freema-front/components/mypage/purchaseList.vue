<template>
  <div class="container">
    <div v-if="purchases.length == 0">
      該当する商品はありません。
    </div>
    <template v-for="purchase in purchases" :key="purchase.id">
      <div class="item" data-testid="purchase-item">
        <img class="image" :src="getProductImage(purchase.product.img_filename)" @error="onImageError"
          @click="showDetail(purchase.product.id)" />
        <div class="content">
          <div v-if="!purchase.paid_at" class="group">
            <div class="content__payment-status">
              <span>お支払いが未済です</span>
            </div>
            <template v-if="purchase.method_index === 1">
              <button class="content__button content__button--payment"
                @click="handlePayment(purchase.id)">コンビニ払いへ</button>
            </template>
            <template v-if="purchase.method_index === 2">
              <button class="content__button content__button--payment"
                @click="handlePayment(purchase.id)">カード支払いへ</button>
            </template>
            <button class="content__button" @click="cancelPurchase(purchase.id)">購入キャンセル</button>
          </div>

          <div class="group">
            <div>購入日時： {{ formatDate(purchase.created_at) }}</div>
            <div>支払方法： {{ getPaymentMethodText(purchase.method_index) }}</div>
            <div>送付先　： <span data-testid="sendto-text">{{ getSendtoText(purchase) }}</span></div>
          </div>

          <div class="group">
            <div class="content__product--name" data-testid="purchased-product-name">{{ purchase.product.name }}</div>
            <div class="content__product--price">{{ purchase.product.price.toLocaleString() }}</div>
            <button class="content__button content__button--detail" type="button" @click="showDetail(purchase.product.id)">商品詳細</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import useAuth from '~/composables/useAuth';
import { useRouter } from "vue-router";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PAYMENT_OPTIONS } from '@/utils/constants'
import type { Purchase } from '~/types/purchase';

// dayjsのプラグインを設定 (.tz()を使えるようにする)
dayjs.extend(utc);
dayjs.extend(timezone);

const { del } = useAuth();
const router = useRouter();
const props = defineProps<{
  purchases: Purchase[] | null;
}>();
const purchases = computed(() => props.purchases ?? []);

const emit = defineEmits(['refreshData'])

const getPaymentMethodText = (method: number) => {
  return (method == 1 || method == 2) ? PAYMENT_OPTIONS[method] : '';
};

const getSendtoText = (purchase: Purchase) => {
  return purchase.zipcode + ' ' + purchase.address + ' ' + (purchase.building ? purchase.building + ' ' : '') + purchase.to_name + '様宛';
};

const formatDate = (original: string): string => {
  const formatted = dayjs(original)   //original = '2025-04-30T00:07:13.000000Z'
    .tz('Asia/Tokyo')
    .format('YYYY年M月D日 H時m分')
  const text = formatted;
  return text;
};

const cancelPurchase = async (purchaseId: number) => {
  const ret = window.confirm('この商品の購入手続きをキャンセルしますか？');
  if (ret) {
    const resp = await del(`/purchases/${purchaseId}`);
    emit('refreshData');
    alert('購入手続きをキャンセルしました。');
  }
};

const handlePayment = async (purchaseId: number) => {
  await $fetch('/api/store_purchase', {
    method: 'POST',
    body: { purchaseId: purchaseId }
  })
  router.push('/purchase_accepted');
};

const showDetail = (product_id: number) => {
  router.push({ path: 'detail', query: { product_id: product_id } });
}

const imageUrlBase = useRuntimeConfig().public.imageUrlBase;
const getProductImage = (filename: string) => {
  return filename ? `${imageUrlBase}/images/${filename}` : `/images/defaultImages/noimage.png`;
}

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target.dataset.errorHandled) return // すでにnoimageに差し替え済みなら何もしない
  target.src = '/images/defaultImages/noimage.png'
  target.dataset.errorHandled = 'true'
}
</script>

<style scoped>
.item {
  padding: 20px;
  border-bottom: 1px solid gray;
  display: grid;
  grid-template-columns: 200px 1fr;
}

.image {
  grid-column: 1;
  border-radius: 5px;
  width: 100%;
}

.content {
  grid-column: 2;
  margin: 0 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-start;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: start;
  margin-bottom: 5px;
}

.content__payment-status {
  background: #FFE0E0;
  font-size: larger;
  height: 30px;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 2px 5px;
}

.content__button {
  border: none;
  text-decoration: underline;
  background: transparent;
  color: #666;
  padding: 0px 8px;
  margin: 0;
}

.content__button--payment {
  font-size: large;
  color: blue;
  font-weight: 600;
}

.content__button--detail {
  color: #333;
  font-weight: 500;
}

.content__button:hover {
  color: #aaf;
}

.content__product {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: start;

  border: 1px solid red;
}

.content__product--name {
  text-align: left;
  color: black;
  font-weight: bold;
  font-size: larger;
  padding: 2px 0;
}

.content__product--price {
  font-size: medium;
}

.content__product--price::before {
  content: "\00A5";
  font-size: 0.8rem;
}

.item--tag {
  text-align: left;
  font-size: 0.9rem;
}

.content__description {
  font-size: 0.8rem;
  padding: 3px 1px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: #666;
}

.content__button {
  margin: 2px 0 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content__button--show-detail {
  width: 100px;
  height: 30px;
  border-radius: 5px;
  background: transparent;
  color: #333;
  border: 1px solid gray;
  font-size: 0.7rem;
}

.content__button--show-detail:hover {
  background: #c7c0ba;
}

.content__button--favorite {
  border: none;
  padding: 0;
  background: transparent;
}

.content__button--favorite__container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.content__button--favorite__counter {
  font-size: smaller;
  color: #666;
}
</style>