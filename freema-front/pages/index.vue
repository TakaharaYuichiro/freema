<template>
  <div class="main-container">
    <div class="switching-section">
      <div class="switching__button-container">
        <client-only>
          <button class="switching-button" :style="{ color: (mode === 0) ? 'red' : 'gray' }" @click="switchMode(0)"
            data-testid="switching-button0">おすすめ</button>
          <button class="switching-button" :style="{ color: (mode === 1) ? 'red' : 'gray' }" @click="switchMode(1)"
            data-testid="switching-button1">マイリスト</button>
        </client-only>
      </div>
    </div>

    <div class="panel-section">
      <Transition :name="transitionName" mode="out-in">
        <div :key="mode">
          <div v-if="mode === 0">
            <ProductPanel :products="products" @toggleFavorite="toggleFavorite" data-testid="product-panel" />
          </div>
          <div v-else>
            <ProductPanel :products="favoriteProducts" @toggleFavorite="toggleFavorite" data-testid="product-panel" />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from "@/stores/auth";
import { useSearchStore } from '@/stores/search'
import useAuth from '~/composables/useAuth';
import type { Product } from '~/types/product';
import type { ProductExp } from '~/types/productExp';
import ProductPanel from '~/components/productPanel.vue';

const search = useSearchStore()
const auth = useAuthStore();
const { get, post } = useAuth();
const transitionName = ref('slide-left');
const mode = ref<number>(0);

const switchMode = (mode0: number) => {
  if (mode0 > mode.value) {
    transitionName.value = 'slide-left'
  } else if (mode0 < mode.value) {
    transitionName.value = 'slide-right'
  }
  mode.value = mode0;
}

const allProducts = ref<ProductExp[]>([]);
const products = ref<ProductExp[]>([]);
const favoriteProducts = ref<ProductExp[]>([]);
const readProducts = async () => {
  try {
    const url = '/products';
    const resp = await get(url);

    allProducts.value = resp.data.map((datum: Product) => ({
      id: datum.id,
      user_id: datum.user_id,
      name: datum.name,
      brand: datum.brand,
      price: datum.price,
      content: datum.content,
      img_filename: datum.img_filename,
      condition_index: datum.condition_index,
      categories: datum.categories,
      is_favorite: false,
      favorites_count: datum.favorites_count,
      purchases_exists: datum.purchases_exists,
    }));

    if (auth.user) {
      allProducts.value = allProducts.value.filter(product => product.user_id != auth.user.id); // 自分が出品した商品を除外
      const resp2 = await get(`/get-favorites`);
      const favoriteIds = new Set(resp2.data.map((item: any) => item.product_id));
      for (const product of allProducts.value) {
        product.is_favorite = favoriteIds.has(product.id);
      }
    }
    updateSearchResults();
  } catch (err) {
    console.error('読み込み失敗', err);
  }
};

const updateSearchResults = () => {
  const keywords = search.keyword
    .toLowerCase()
    .split(' ')
    .filter(kw => kw.trim() !== '') // 空文字除去

  products.value = allProducts.value.filter(product => {
    const matchesKeywords = keywords.every(kw =>
      product.name.toLowerCase().includes(kw) ||
      product.brand?.toLowerCase().includes(kw) ||
      product.content?.toLowerCase().includes(kw)
    )
    return matchesKeywords;
  });

  favoriteProducts.value = products.value.filter(product => product.is_favorite);
}

watch(() => search.triggerSearch, () => {
  updateSearchResults();
})

const toggleFavorite = async (product_id: number) => {
  if (!auth.user) {
    alert('お気に入り登録にはログインが必要です。');
    return
  };

  try {
    // この商品のいいねをサーバーでチェックしオンならオフに、オフならオンにする。変更後のいいね状態をrespStateで受ける。
    const respState = await post("/invert-favorite", {
      'product_id': product_id
    })

    // この商品につけられているいいねの数をカウントする
    const respCount = await get(`/count-favorites/${product_id}`);

    // この商品のオフジェクトを取得し、いいね関連のプロパティを更新
    const targetProduct = allProducts.value.find(x => x.id == product_id);
    if (targetProduct) {
      targetProduct.favorites_count = respCount.data.count;
      targetProduct.is_favorite = respState.is_favorite;
    }

    updateSearchResults();

  } catch (err) {
    console.error('お気に入り書き込み失敗', err);
  }
}

onMounted(async () => {
  auth.loadFromStorage();
  await readProducts();
});
</script>

<style scoped>
.main-container {
  margin: 0;
  padding: 0;
}

.switching-section {
  border-bottom: 2px solid gray;
  padding: 0 20px;
}

.switching__button-container {
  margin: 15px auto;
  max-width: 1230px;
  display: flex;
  gap: 20px;
}

.switching-button {
  width: 100px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 3px;
}

.switching-button:hover {
  background: #FFCCCC;
}

.switching-button:disabled {
  background: transparent;
}

.panel-section {
  margin: 30px auto;
  padding: 15px;
  max-width: 1230px;
}

/* 左へスライド */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.25s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* 右へスライド */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.25s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>