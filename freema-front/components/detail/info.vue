<template>
  <div>
    <table>
      <tbody>
        <tr class="row">
          <th class="row__title">カテゴリー</th>
          <td class="row__content category-list">
            <template v-for="category in categories" :key="category.id">
              <div class="category-list__item">{{ category.name }}</div>
            </template>
          </td>
        </tr>
        <tr class="row">
          <th class="row__title">商品の状態</th>
          <td class="row__content">
            {{ conditionLabel }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types/category';
import { PRODUCT_CONDITIONS } from '@/utils/constants'

const props = defineProps<{
  categories: Category[] | null;
  condition_index: number;
}>();
const categories = computed(() => props.categories ?? []);

const condition_index = computed(() => props.condition_index);
const conditionLabel = computed(() => {
  return PRODUCT_CONDITIONS[condition_index.value];
});
</script>

<style scoped>
.row {
  display: flex;
  padding: 5px 0;
}

.row__title {
  font-weight: bold;
  min-width: 100px;
  color: #333;
  text-align: left;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.category-list__item {
  border: none;
  background: #D9D9D9;
  color: #222;
  border-radius: 10px;
  height: 20px;
  font-size: 12px;
  text-align: center;
  padding: 0 10px;
  display: flex;
  align-items: center;
}
</style>