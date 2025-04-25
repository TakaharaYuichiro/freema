<template>
  <div class="main-container">
    <div class="switching-section">
      <div class="switching__button-container">
        <client-only>
          <button class="switching-button" :style="{ color: (mode == 0) ? 'red' : 'gray' }"
            @click="switchMode(0)">おすすめ</button>
          <button class="switching-button" :disabled="!auth.user" :style="{ color: (mode == 1) ? 'red' : 'gray' }"
            @click="switchMode(1)">マイリスト</button>
        </client-only>
      </div>
    </div>
    <div class="panel-section">
      <ProductPanel :products="products" @callParentMethod="toggleFavorite" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from "@/stores/auth";
import { useSearchStore } from '@/stores/search'
import useAuth from '~/composables/useAuth';
import type { Product } from '~/types/product';
import type { ProductExp } from '~/types/productExp';
import Purchase from './purchase.vue';

const search = useSearchStore()
const auth = useAuthStore();
const { get, post } = useAuth();

const mode = ref<number>(0);
const switchMode = (mode0: number) => {
  mode.value = mode0;
  readProducts();
}

const allProducts = ref<ProductExp[]>([]);
const products = ref<ProductExp[]>([]);
const readProducts = async () => {
  try {
    const url = auth.user ? `/products?except_user_id=${auth.user.id}` : '/products';
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
      status_index: datum.status_index,
      categories: datum.categories,
      is_favorite: false,
      favorites_count: datum.favorites_count,
      purchases_exists: datum.purchases_exists,
    }));

    if (auth.user) {
      const resp2 = await get(`/getFavoriteStates/${auth.user.id}`);
      const favoriteIds = new Set(resp2.data.map((item: any) => item.product_id));
      for (const product of allProducts.value) {
        product.is_favorite = favoriteIds.has(product.id);
      }
    }

    updateSearchResults();

  } catch (err) {
    console.log('読み込み失敗', err);
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
      product.brand.toLowerCase().includes(kw) ||
      product.content.toLowerCase().includes(kw)
    )
    const matchesFavorite = mode.value !== 1 || product.is_favorite
    return matchesKeywords && matchesFavorite
  })
}

watch(() => search.triggerSearch, () => {
  updateSearchResults()
})

const toggleFavorite = async (product_id: number) => {
  if (!auth.user) {
    alert('お気に入り登録にはログインが必要です。');
    return
  };

  try {
    // この商品のいいねをサーバーでチェックしオンならオフに、オフならオンにする。変更後のいいね状態をrespStateで受ける。
    const respState = await post("/setFavoriteStates", {
      'user_id': auth.user.id,
      'product_id': product_id
    })

    // この商品につけられているいいねの数をカウントする
    const respCount = await get(`/countFavorites/${product_id}`);

    // この商品のオフジェクトを取得し、いいね関連のプロパティを更新
    const targetProduct = allProducts.value.find(x => x.id == product_id);
    if (targetProduct) {
      targetProduct.favorites_count = respCount.data.count;
      targetProduct.is_favorite = respState.is_favorite;
    }
  } catch (err) {
    console.log('お気に入り書き込み失敗', err);
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
</style>