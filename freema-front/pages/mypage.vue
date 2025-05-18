<template>
  <div class="main-container">
    <div class="profile-section">
      <div class="profile">
        <div class="profile__image-container">
          <img class="profile__img" :src="imageSrc" alt="画像プレビュー" />
        </div>
        <div class="prfile__name"><span data-testid="user-name">{{ auth.user.name }}</span>さん</div>
      </div>
      <div class="profile-section__button-container">
        <button class="profile-section__edit-button" @click="handleProfile">プロフィール編集</button>
      </div>
    </div>

    <div class="switching-section">
      <div class="switching-section__switch-button-container">
        <button class="switching-section__switch-button" :style="{ color: (mode === 0) ? 'red' : 'gray' }"
          @click="switchMode(0)">出品した商品</button>
        <button class="switching-section__switch-button" :style="{ color: (mode === 1) ? 'red' : 'gray' }"
          @click="switchMode(1)" data-testid="switching-button1">購入した商品<br>(支払完了)</button>
        <button class="switching-section__switch-button" :style="{ color: (mode === 2) ? 'red' : 'gray' }"
          @click="switchMode(2)">購入した商品<br>(支払確認待ち)</button>
      </div>
    </div>

    <div class="panel-section">
      <Transition :name="transitionName" mode="out-in">
        <div :key="mode">
          <div v-if="mode === 0">
            <ProductPanel :products="products" @toggleFavorite="toggleFavorite" @refreshData="refreshData" />
          </div>
          <div v-else-if="mode === 1">
            <MypagePurchaseList :purchases="completedPurchases" @refreshData="refreshData" />
          </div>
          <div v-else>
            <MypagePurchaseList :purchases="unfinishedPuchases" @refreshData="refreshData" />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { Product } from '~/types/product';
import type { ProductExp } from '~/types/productExp';
import type { Purchase } from '~/types/purchase';
import useAuth from '~/composables/useAuth';
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSearchStore } from '@/stores/search'
import ProductPanel from '~/components/ProductPanel.vue';
import MypagePurchaseList from '~/components/mypage/purchaseList.vue';

typeof definePageMeta === 'function' && definePageMeta({ middleware: 'auth' }); // テスト時には飛ばす

const auth = useAuthStore();
const search = useSearchStore();
const router = useRouter();
const route = useRoute();
const { get, post } = useAuth();
const transitionName = ref('slide-left');

const previewUrl = ref<string | null>(null);
const imageUrlBase = useRuntimeConfig().public.imageUrlBase;

const imageSrc = computed(() => {
  if (previewUrl.value) {
    return previewUrl.value;
  } else if (auth.user?.img_filename) {
    return `${imageUrlBase}/images/${auth.user.img_filename}`;
  } else {
    return '/images/defaultImages/user_icon.png';
  }
});

const handleProfile = () => {
  router.push("/profile");
}

const mode = ref(0);

const switchMode = (mode0: number) => {
  if (mode0 > mode.value) {
    transitionName.value = 'slide-left'
  } else if (mode0 < mode.value) {
    transitionName.value = 'slide-right'
  }
  mode.value = mode0;
}

const refreshData = async () => {
  await readProducts();
  await readPurchases();
};

const purchases = ref<Purchase[]>([]);
const completedPurchases = ref<Purchase[]>([]);
const unfinishedPuchases = ref<Purchase[]>([]);
const readPurchases = async () => {
  const resp = await get('/purchases?option=mine');

  purchases.value = resp.data.map((datum: Purchase) => ({
    id: datum.id,
    product_id: datum.product_id,
    user_id: datum.user_id,
    zipcode: datum.zipcode,
    address: datum.address,
    building: datum.building,
    to_name: datum.to_name,
    method_index: datum.method_index,
    charge_id: datum.charge_id,
    paid_at: datum.paid_at,
    product: datum.product,
    created_at: datum.created_at,
    updated_at: datum.update_at,
  }))

  updateSearchPurchases();
};

const allProducts = ref<ProductExp[]>([]);
const products = ref<ProductExp[]>([]);
const readProducts = async () => {
  try {
    const resp = await get('/products');
    allProducts.value = resp.data.map((datum: Product) => ({
      id: datum.id,
      user_id: datum.user_id,
      name: datum.name,
      brand: datum.brand,
      price: datum.price,
      content: datum.content,
      img_filename: datum.img_filename,
      condition_index: datum.condition_index,
      // status_index: datum.status_index,
      categories: datum.categories,
      is_favorite: false,
      favorites_count: datum.favorites_count,
      purchases_exists: datum.purchases_exists,
    }));

    allProducts.value = allProducts.value.filter(product => product.user_id == auth.user.id);

    const respStates = await get(`/get_favorites`);
    const favoriteIds = new Set(respStates.data.map((item: any) => item.product_id));
    for (const product of allProducts.value) {
      product.is_favorite = favoriteIds.has(product.id);
    }

    updateSearchProducts();
  } catch (err) {
    console.error('読み込み失敗', err);
  }
};

const updateSearchProducts = () => {
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
  })
}

const updateSearchPurchases = () => {
  const keywords = search.keyword
    .toLowerCase()
    .split(' ')
    .filter(kw => kw.trim() !== '') // 空文字除去

  const buffPurchases = purchases.value.filter(purchase => {
    const matchesKeywords = keywords.every(kw =>
      purchase.product.name.toLowerCase().includes(kw) ||
      purchase.product.brand?.toLowerCase().includes(kw) ||
      purchase.product.content?.toLowerCase().includes(kw)
    )
    return matchesKeywords;
  })

  completedPurchases.value = buffPurchases.filter(purchase => purchase.paid_at);
  unfinishedPuchases.value = buffPurchases.filter(purchase => !purchase.paid_at);
}

watch(() => search.triggerSearch, () => {
  updateSearchProducts();
  updateSearchPurchases();
})

const toggleFavorite = async (product_id: number) => {
  const user_id = auth.user.id;
  try {
    const respState = await post("/invert_favorite", {
      'user_id': user_id,
      'product_id': product_id
    })

    const respCount = await get(`/count_favorites/${product_id}`);

    const targetProduct = products.value.find(x => x.id == product_id);
    if (targetProduct) {
      targetProduct.is_favorite = respState.is_favorite;
      targetProduct.favorites_count = respCount.data.count;
    }
  } catch (err) {
    console.error('お気に入り書き込み失敗', err);
  }
}

onMounted(async () => {
  const m = route.query.mode;
  if (typeof m === 'string') {
    const parsed = parseInt(m);
    if (!isNaN(parsed)) {
      mode.value = parsed;
    }
  }
  await readProducts();
  await readPurchases();
});
</script>

<style scoped>
.main-container {
  margin: 0;
  padding: 0;
}

.profile-section {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 550px;
  margin: 10px auto 20px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile__image-container {
  width: 100px;
  height: 100px;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
}

.profile__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.prfile__name {
  font-size: larger;
  font-weight: 550;
}

.profile-section__button-container {
  margin: 0 0 0 auto;
}

.profile-section__edit-button {
  border: 1px solid #FF5656;
  color: #FF5656;
  background: transparent;
  border-radius: 10px;
  height: 30px;
  font-size: 12px;
  text-align: center;
  padding: 0 10px;
  display: flex;
  align-items: center;
}

.profile-section__edit-button:hover {
  background: #FFc0c0;
}

.switching-section {
  border-bottom: 2px solid gray;
  padding: 0 20px;
}

.switching-section__switch-button-container {
  margin: 15px auto;
  max-width: 1230px;
  display: flex;
  gap: 20px;
}

.switching-section__switch-button {
  width: 150px;
  height: 45px;
  border: none;
  background: transparent;
  border-radius: 3px;
}

.switching-section__switch-button:hover {
  background: #FFCCCC;
  ;
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