<template>
  <div class="container">
    <div v-if="products.length == 0">
      該当する商品はありません。
    </div>
    <div class="item" v-for="product in products" :key="product.id">
      <img class="image" :src="getProductImage(product.img_filename)" @error="onImageError" @click="showDetail(product.id)" />
      <div class="content">
        <div class="content__header">
          <div class="content__header--name">{{ product.name }}</div>
          <div class="content__header--price">{{ product.price.toLocaleString() }}</div>
        </div>
        <div class="content__description">{{ product.content }}</div>
        <div class="content__button">
          <button class="content__button--show-detail" type="button" @click="showDetail(product.id)">詳しく見る</button>
          <div class="content__button--favorite__container">
            <input type="hidden" name="shop_id" value="{{$shop['id']}}">
            <button class="content__button--favorite" type="button" @click="toggleFavorite(product.id)">
              <Icon name="ic:baseline-favorite" :style="{ color: product.is_favorite ? 'red' : 'lightgray' }" size="2em" />
            </button>
            <div class="content__button--favorite__counter">
              {{ product.favorites_count }}
            </div>
          </div>
        </div>
      </div>
      <div class="sold" v-if="product.purchases_exists">
        <div class="sold__text">sold</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductExp } from '~/types/productExp';

const router = useRouter();
const props = defineProps<{
  products: ProductExp[] | null;
}>();
const products = computed(() => props.products ?? []);

const emit = defineEmits(['callParentMethod'])

const toggleFavorite = async (product_id: number) => {
  console.log('click toggle');
  emit('callParentMethod', product_id);
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
}

.content__button--show-detail {
  width: 100px;
  height: 30px;
  border-radius: 5px;
  background: #305DFF;
  color: white;
  border: none;
  font-size: 0.7rem;
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.sold__text {
  font-size: 100px;
  color: white;
  opacity: 0.8;
  font-weight: 800;
  text-shadow:
    4px 4px 1px #40505080,
    -4px 4px 1px #40505080,
    4px -4px 1px #40505080,
    -4px -4px 1px #40505080,
    4px 0px 1px #40505080,
    0px 4px 1px #40505080,
    -4px 0px 1px #40505080,
    0px -4px 1px #40505080;
  transform: rotate(-45deg);
  pointer-events: none;
}
</style>