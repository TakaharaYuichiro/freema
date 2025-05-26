<template>
  <div class="main-container">
    <div class="profile-section">
      <div class="profile__image-container">
        <img class="profile__img" :src="imageSrc" alt="画像プレビュー" />
      </div>
      <div class="profile__content-container">
        <div class="profile__name"><span data-testid="user-name">{{ usernameText(auth.user.name) }}</span>さん</div>
        <div class="profile-section__button-container">
          <button class="profile-section__edit-button" @click="handleProfile">プロフィール編集</button>
        </div>
      </div>
    </div>

    <div class="switching-section">
      <div class="switching-section__switch-button-container">
        <button class="switching-section__switch-button" :style="{ color: (mode === 0) ? 'red' : 'gray' }"
          @click="switchMode(0)">出品した商品</button>
        <button class="switching-section__switch-button" :style="{ color: (mode === 1) ? 'red' : 'gray' }"
          @click="switchMode(1)" data-testid="switching-button1">
          <div>購入した商品</div>
          <div>(支払完了)</div>
        </button>
        <button class="switching-section__switch-button" :style="{ color: (mode === 2) ? 'red' : 'gray' }"
          @click="switchMode(2)">
          <div>購入した商品</div>
          <div>(支払確認待ち)</div>
        </button>
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
import ProductPanel from '~/components/productPanel.vue';
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
  router.push("/profile?option=update");
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
      categories: datum.categories,
      is_favorite: false,
      favorites_count: datum.favorites_count,
      purchases_exists: datum.purchases_exists,
    }));

    allProducts.value = allProducts.value.filter(product => product.user_id == auth.user.id);

    const respStates = await get(`/get-favorites`);
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
    .filter(kw => kw.trim() !== ''); // 空文字除去

  const buffPurchases = purchases.value.filter(purchase => {
    const matchesKeywords = keywords.every(kw =>
      purchase.product.name.toLowerCase().includes(kw) ||
      purchase.product.brand?.toLowerCase().includes(kw) ||
      purchase.product.content?.toLowerCase().includes(kw)
    );
    return matchesKeywords;
  });

  // completed: 降順（新しい順）
  completedPurchases.value = buffPurchases
    .filter(purchase => purchase.paid_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // unfinished: 昇順（古い順）
  unfinishedPuchases.value = buffPurchases
    .filter(purchase => !purchase.paid_at)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

watch(() => search.triggerSearch, () => {
  updateSearchProducts();
  updateSearchPurchases();
})

const toggleFavorite = async (product_id: number) => {
  try {
    const respState = await post("/invert-favorite", {
      'product_id': product_id
    })

    const respCount = await get(`/count-favorites/${product_id}`);

    const targetProduct = products.value.find(x => x.id == product_id);
    if (targetProduct) {
      targetProduct.is_favorite = respState.is_favorite;
      targetProduct.favorites_count = respCount.data.count;
    }
  } catch (err) {
    console.error('お気に入り書き込み失敗', err);
  }
}

const usernameText = (name: string) => {
  const len = 35; 
  if (!name) return "";
  return (name.length > len)? name.substring(0, len) + "…": name;
};

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
  max-width: 700px;
  margin: 10px auto 20px;
}

.profile__content-container {
  display: flex;
  align-items: center;
  gap: 20px;
  padding:  0 0 0 20px;
}

.profile__image-container {
  width: 100px;
  height: 100px;
  position: relative;
  overflow: hidden;
  min-width: 50px;
}

.profile__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit:scale-down;
  border-radius: 50%;
}

.profile__name {
  font-size: larger;
  font-weight: 550;
  max-width: 400px;
  padding: 10px 0;
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

@media screen and (max-width: 768px) {
  .profile__content-container {
    display: block;
  }
}

@media screen and (max-width: 480px) {
  .switching-section__switch-button-container {
    gap: 3px;
    margin-left: 0px;
    flex-flow: column;
  }

  .switching-section__switch-button {
    width: auto;
    height: 25px;
    text-align: left;
    padding: 2px 8px;
    display: flex;
    white-space: nowrap;
  }
}
</style>