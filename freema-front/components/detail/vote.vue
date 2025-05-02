<template>
  <div class="container">
    <div class="block">
      <div class="block__icon">
        <Icon class="icon" name="ic:baseline-favorite-border" />
      </div>
      <div class="block__count">{{ favoriteCount }}</div>
    </div>
    <div class="block">
      <div class="block__icon">
        <Icon class="icon" name="ic:baseline-chat-bubble-outline" />
      </div>
      <div class="block__count">{{ evaluationCount }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose } from 'vue';
import useAuth from '~/composables/useAuth';

const { get, post, put, del } = useAuth();
const props = defineProps<{
  product_id: number;
}>();

const refreshData = async () => {
  // 兄弟コンポーネント(detail/comment)でコメント数が増減した時に、コメント数を強制的に更新
  await countEvaluations();
};

defineExpose({
  refreshData,
});

const evaluationCount = ref(0);
const favoriteCount = ref(0);

const countEvaluations = async () => {
  try {
    const resp = await get(`/evaluations?product_id=${props.product_id}`);
    evaluationCount.value = resp.data.length;
  } catch (err) {
    console.error('読み込み失敗', err);
  }
};

const countFavorites = async () => {
  try {
    const resp = await get(`/count_favorites/${props.product_id}`);
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
  width: 25px;
  height: 20px;
  color: #666;
  vertical-align: bottom;
}

.block__count {
  text-align: center;
  font-size: xx-small;
}
</style>