<template>
  <div class="container">
    <div class="block">
      <div class="block__icon">
        <button class="content__button--favorite" data-testid="favorite-button" type="button" @click="toggleFavorite()">
          <Icon class="icon" :name="`ic:${product.is_favorite ? 'round-star' : 'round-star-border'}`"
            :style="{ color: product.is_favorite ? 'red' : '#666' }" data-testid="favorite-button-icon" />
        </button>
      </div>
      <div class="block__count" data-testid="product-item--favorite-count">{{ favoriteCount }}</div>
    </div>
    <div class="block">
      <div class="block__icon">
        <Icon class="icon icon1" name="mdi:chat-outline" />
      </div>
      <div class="block__count" data-testid="product-item--evaluation-count">{{ evaluationCount }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import useAuth from '~/composables/useAuth';
import type { ProductExp } from '~/types/productExp';

const { get } = useAuth();
const props = defineProps<{
  product: ProductExp;
}>();

const product = computed(() => props.product);

const emit = defineEmits(['toggleFavorite', 'refreshData'])

const toggleFavorite = () => {
  emit('toggleFavorite', product.value.id);
}

const refreshData = async () => {
  // 兄弟コンポーネント(detail/comment)でコメント数が増減した時に、コメント数を強制的に更新
  await countEvaluations();
  await countFavorites();
};

defineExpose({
  refreshData,
});

const evaluationCount = ref(0);
const favoriteCount = ref(0);

const countEvaluations = async () => {
  try {
    const resp = await get(`/evaluations?product_id=${product.value.id}`);
    evaluationCount.value = resp.data.length;
  } catch (err) {
    console.error('読み込み失敗', err);
  }
};

const countFavorites = async () => {
  try {
    const resp = await get(`/count_favorites/${product.value.id}`);
    favoriteCount.value = resp.data.count;
  } catch (err) {
    console.error('読み込み失敗', err);
  }
};


onMounted(async () => {
  await countEvaluations();
  await countFavorites();
});
</script>

<style scoped>
.container {
  padding: 5px 15px 10px;
  display: flex;
  gap: 20px;
}

.block {
  display: block;
  justify-content: center;
  align-items: center;
}

.block__icon {
  align-items: center;
}

.icon {
  width: 35px;
  height: 40px;
  color: #666;
  vertical-align: bottom;
}

.icon1 {
  width: 27px;
  color: #333;
}

.block__count {
  text-align: center;
  font-size: xx-small;
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

.content__button--favorite:hover {
  background-color: #Fcc;
}
</style>