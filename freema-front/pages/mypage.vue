<template>
  <div class="main-container">
    <div class="profile-section">
      <div class="profile">
        <div class="profile__image-container">
          <img class="profile__img" :src="imageSrc" alt="画像プレビュー" />
        </div>
        <div class="prfile__name">{{ auth.user.name }}さん</div>
      </div>
      <div class="profile-section__button-container">
        <button class="profile-section__edit-button" @click="handleProfile">プロフィール編集</button>
      </div>
    </div>

    <div class="switching-section">
      <div class="switching-section__switch-button-container">
        <button class="switching-section__switch-button" :style="{ color: (mode == 0) ? 'red' : 'gray' }"
          @click="switchMode(0)">出品した商品</button>
        <button class="switching-section__switch-button" :style="{ color: (mode == 1) ? 'red' : 'gray' }"
          @click="switchMode(1)">購入した商品</button>
      </div>
    </div>

    <div class="panel-section">
      <ProductPanel :products="products" @callParentMethod="toggleFavorite"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product } from '~/types/product';
import type { ProductExp } from '~/types/productExp';
import useAuth from '~/composables/useAuth';
import { useAuthStore } from "@/stores/auth";
import { useSearchStore } from '@/stores/search'

definePageMeta({ middleware: 'auth' });

const auth = useAuthStore();
const search = useSearchStore();
const router = useRouter();
const route = useRoute();
const { get, post } = useAuth();

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

const mode = ref<number>(route.query.mode == '1'? 1: 0);
const switchMode = (mode0: number) => {
  mode.value = mode0;
  readProducts();
}

const allProducts = ref<ProductExp[]>([]);
const products = ref<ProductExp[]>([]);
const readProducts = async () => {
  try {
    const url = (mode.value == 0)? `/products?user_id=${auth.user.id}`: `/purchased_products/${auth.user.id}`;
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

    const user_id = auth.user.id;
    const respStates = await get(`/getFavoriteStates/${user_id}`);
    const favoriteIds = new Set(respStates.data.map((item: any) => item.product_id));
    for (const product of allProducts.value) {
      product.is_favorite = favoriteIds.has(product.id);
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
    return matchesKeywords;
  })
}

watch(() => search.triggerSearch, () => {
  updateSearchResults()
})

const toggleFavorite = async (product_id: number) => {
  const user_id = auth.user.id;
  try {
    const respState = await post("/setFavoriteStates", {
      'user_id': user_id,
      'product_id': product_id
    })

    const respCount = await get(`/countFavorites/${product_id}`);

    const targetProduct = products.value.find(x => x.id == product_id);
    if (targetProduct) {
      targetProduct.is_favorite = respState.is_favorite;
      targetProduct.favorites_count = respCount.data.count;
    }
  } catch (err) {
    console.log('お気に入り書き込み失敗', err);
  }
}

onMounted(async () => {
  await readProducts();
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
  justify-content:center;
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
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 3px;
}

.switching-section__switch-button:hover {
  background: #FFCCCC;;
}

.panel-section {
  margin: 30px auto;
  padding: 15px;
  max-width: 1230px;
}
</style>