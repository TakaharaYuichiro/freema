<template>
  <div class="container">
    <div v-if="products.length == 0">
      該当する商品はありません。
    </div>
    <template v-for="product in products" :key="product.id">
      <div class="item" data-testid="product-item">
        <img class="image" :src="getProductImage(product.img_filename)" @error="onImageError"
          @click="showDetail(product.id)" />
        <div class="content">
          <div class="content__header">
            <div class="content__header--name" data-testid="product-item--name">{{ product.name }}</div>
            <div class="content__header--price">{{ product.price.toLocaleString() }}</div>
          </div>
          <div class="content__description">{{ product.content }}</div>
          <div class="content__button">
            <button class="content__button--show-detail" type="button" @click="showDetail(product.id)">詳しく見る</button>
            <button v-if="product.user_id === auth.user?.id" class="content__button--show-detail" type="button" @click="cancelListing(product.id)">出品取消</button>
            <div class="content__button--favorite__container">
              <button class="content__button--favorite" type="button" @click="toggleFavorite(product.id)">
                <Icon name="ic:round-star" :style="{ color: product.is_favorite ? 'red' : 'lightgray' }" size="2em" />
              </button>
              <div class="content__button--favorite__counter">
                {{ product.favorites_count }}
              </div>
            </div>
          </div>
        </div>
        <div class="sold" v-if="product.purchases_exists" data-testid="product-item--sold"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ProductExp } from '~/types/productExp';
import { useAuthStore } from "@/stores/auth";
import { useRouter } from 'vue-router'
import useAuth from '~/composables/useAuth';
import { ref, computed } from 'vue'

const auth = useAuthStore();
const router = useRouter();
const { get, del } = useAuth();
const props = defineProps<{
  products: ProductExp[] | null;
}>();
const products = computed(() => props.products ?? []);
const isLoading = ref(false);   // ボタン連続クリック防止用フラグ

const emit = defineEmits(['toggleFavorite', 'refreshData'])

const toggleFavorite = async (product_id: number) => {
  emit('toggleFavorite', product_id);
}

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

const cancelListing = async (product_id: number) => {
  if (isLoading.value) return
  isLoading.value = true;

  // 購入データ確認
  try {
    const resp = await get(`/products/${product_id}`);
    if (resp.data.purchases_exists) {
      alert('販売済みの商品の出品は取り消すことができません。');
      isLoading.value = false;
      return;
    }
  } catch (err) {
    console.error('読み込み失敗', err);
    isLoading.value = false;
    return;
  }

  // 出品取り消し確認
  const ret = window.confirm('この商品の出品を取り消してよろしいですか？');
  if (!ret) {
    isLoading.value = false;
    return;
  }

  // 取り消し実行
  try {
    const resp = await del(`/products/${product_id}`);
    if (resp.success) {
      alert('出品を取り消しました。');
      emit('refreshData');
      isLoading.value = false;
      return;
    }
  } catch (err) {
    console.error('読み込み失敗', err);
    isLoading.value = false;
    return;
  }
}
</script>

<style scoped>
.container {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.item {
  border-radius: 5px;
  background: white;
  padding: 0;
  border: 1px solid lightgray;
  box-shadow: 2px 2px 2px gray;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  max-width: 500px;
  position: relative;
}

.panel-section img {
  border-radius: 5px 5px 0 0;
}

.content {
  margin: 10px;
}

.content__header {
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.content__header--name {
  text-align: left;
  color: black;
  font-weight: bold;
  font-size: 1.1rem;
}

.content__header--price {
  font-size: 0.9rem;
  color: #3056e2;
}

.content__header--price::before {
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
  gap: 2px;
}

.content__button--show-detail {
  width: 100px;
  height: 30px;
  border-radius: 5px;
  background: #305DFF;
  color: white;
  border: none;
  font-size: 0.7rem;
  white-space: nowrap;
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

.sold {
  position: absolute;
  top: 0%;
  left: 0%;
  pointer-events: none;
}

.sold:before {
  position: absolute;
  content: "";
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 70px 70px 0 0;
  border-color: #FF5050 transparent transparent transparent;
}

.sold:after {
  position: absolute;
  content: "sold";
  transform: rotate(315deg);
  display: block;
  font-size: 20px;
  font-weight: 700;
  white-space: pre;
  color: #fff;
  top: 17px;
  left: 1px;
  text-align: center;
  z-index: 2;
  line-height: 1.2;
}
</style>