<template>
  <div class="main-content">
    <div class="img-section">
      <div class="sold" v-if="product.purchases_exists">
        <div class="sold__text">sold</div>
        <div class="sold__content">この商品は販売済みです。</div>
      </div>
      <img class="img-section__img" :src="getProductImage(product.img_filename)" @error="onImageError" />
    </div>
    <div class="info-section">
      <div class="info-section__name" data-testid="product-item--name">{{ product.name }}</div>
      <div class="info-section__brand" data-testid="product-item--brand">{{ product.brand }}</div>
      <div class="info-section__price" data-testid="product-item--price">
        <span class="info-section__price__before">&yen;</span>
        <span class="info-section__price__value">{{ product.price.toLocaleString() }}</span>
        <span class="info-section__price__after">(税込)</span>
      </div>

      <DetailVote ref="voteRef" v-if="product.id !== 0" :product="product" @toggleFavorite="toggleFavorite" />

      <div class="button-contaienr">
        <button class="button" :disabled="!auth.user || product.purchases_exists || myProduct"
          @click="handlePurchase">購入手続きへ</button>
      </div>
      <div class="remark" v-if="myProduct">自分が出品した商品は購入できません。</div>

      <div class="group">
        <div class="group-title">商品説明</div>
        <div data-testid="product-item--content">
          <span>{{ product.content }}</span>
        </div>
      </div>

      <div class="group">
        <div class="group-title">商品の情報</div>
        <DetailInfo :categories="product.categories" :condition_index="product.condition_index" />
      </div>

      <div class="group">
        <div class="group-title">
          <span>コメント</span>
          <Icon class="icon" name="mdi:chat-outline" size="1.3em" />
        </div>
        <DetailComment v-if="product.id !== 0" :product_id="product.id" @updated="handleEvaluationUpdated" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ProductExp } from '~/types/productExp';
import { useRouter, useRoute } from "vue-router";
import useAuth from '~/composables/useAuth';
import { useAuthStore } from "@/stores/auth";
import DetailVote from '~/components/detail/vote.vue';
import DetailInfo from '~/components/detail/info.vue';
import DetailComment from '~/components/detail/comment.vue';

const router = useRouter();
const route = useRoute();
const { get, post } = useAuth();
const auth = useAuthStore();
const product_id = route.query.product_id;
const myProduct = ref(false);

const voteRef = ref();
const handleEvaluationUpdated = async () => {
  // 子コンポーネント1(/detail/comment)でコメント数が増減したことを子コンポーネント2(/detail/vote)に通知
  await voteRef.value?.refreshData();
};

const imageUrlBase = useRuntimeConfig().public.imageUrlBase;
const getProductImage = (filename: string) => {
  if (filename && filename != '') {
    return `${imageUrlBase}/images/${filename}`;
  } else {
    return '/images/defaultImages/noimage.png';
  }
}

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target.dataset.errorHandled) return // すでにnoimageに差し替え済みなら何もしない
  target.src = '/images/defaultImages/noimage.png'
  target.dataset.errorHandled = 'true'
}

const product = ref<ProductExp>({
  id: 0,
  user_id: 0,
  name: '',
  brand: '',
  price: 0,
  content: '',
  img_filename: '',
  condition_index: 0,
  categories: [],
  favorites_count: 0,
  purchases_exists: false,
  is_favorite: false,
});

const readProduct = async () => {
  try {
    const resp = await get(`/products/${product_id}`);
    product.value = {
      id: resp.data.id,
      user_id: resp.data.user_id,
      name: resp.data.name,
      brand: resp.data.brand,
      price: resp.data.price,
      content: resp.data.content,
      img_filename: resp.data.img_filename,
      condition_index: resp.data.condition_index,
      categories: resp.data.categories,
      favorites_count: resp.data.favorites_count,
      purchases_exists: resp.data.purchases_exists,
      is_favorite: false,
    };

    if (auth.user) {
      const resp2 = await get(`/get-favorites/${product_id}`);
      product.value.is_favorite = resp2.is_favorite;
    }

    myProduct.value = product.value.user_id == auth.user?.id;
  } catch (err) {
    console.error('読み込み失敗', err);
  }
};

const handlePurchase = () => {
  router.push({ name: 'purchase', query: { product_id } });
}

const toggleFavorite = async (product_id: number) => {
  if (!auth.user) {
    alert('お気に入り登録にはログインが必要です。');
    return
  };

  try {
    // この商品のいいねをサーバーでチェックしオンならオフに、オフならオンにする。変更後のいいね状態をrespStateで受ける。
    const respState = await post("/invert-favorite", {
      'user_id': auth.user.id,
      'product_id': product_id
    })
    product.value.is_favorite = respState.is_favorite;

    // この商品につけられているいいねの数をカウントする
    const respCount = await get(`/count-favorites/${product_id}`);
    product.value.favorites_count = respCount.data.count;

    await voteRef.value?.refreshData();

  } catch (err) {
    console.error('お気に入り書き込み失敗', err);
  }
}

onMounted(async () => {
  await readProduct();
});
</script>

<style scoped>
.main-content {
  display: flex;
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 10px;
}

.img-section {
  padding: 15px;
  position: relative;
}

.img-section__img {
  width: 100%;
  max-width: 500px;
  border-radius: 1px;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 2px #aaa;
}

.info-section {
  padding: 15px;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}

.info-section__name {
  font-size: 30px;
  font-weight: 600;
}

.info-section__brand {
  font-size: 12px;
  font-weight: 300;
}

.info-section__price {
  padding: 10px 0;
  display: flex;
}

.info-section__price__before,
.info-section__price__after {
  font-size: medium;
  margin: auto 0 0;

  border: 0px solid red;

}

.info-section__price__value {
  font-size: x-large;
  margin: auto 3px 0;

  border: 0px solid red;
}

.button-contaienr {
  width: 100%;
  margin-bottom: 20px;
}

.button {
  background: #FF5655;
  width: 100%;
  height: 50px;
  color: white;
  font-weight: 550;
  border: none;
  border-radius: 3px;
  box-sizing: border-box;
}

.button:hover {
  background: #f4b4b4;
}

.button:disabled {
  background: #ccc;
}

.group {
  padding: 20px 0;
}

.group-title {
  margin: 10px 0;
  padding: 3px 0;
  border-bottom: 1px solid gray;
  font-weight: bold;
  font-size: larger;
  color: #666;
}

.sold {
  margin-bottom: 20px;
}

.sold__text {
  font-size: 70px;
  color: #FF5655;
  font-weight: 800;
}

.sold__content {
  margin: 4px 0;
}

.remark {
  background: #f0f0f0;
  padding: 20px 10px;
  margin: 10px 0;
  color: #333;
  font-size: smaller;
}

.icon {
  margin-left: 15px;
  color: #666;
  vertical-align: bottom;
}

@media screen and (max-width: 580px) {
  .main-content {
    display: block;
  }
}
</style>