<template>
  <div class="main-content">
    <div class="left-section">
      <div class="sold" v-if="product.purchases_exists">
        <div class="sold__text">sold</div>
        <div class="sold__content">この商品は販売済みです。</div>
      </div>

      <div class="product-info-section">
        <div class="img-section">
          <img class="img-section__img" :src="getProductImage(product.img_filename)" @error="onImageError" />
        </div>
        <div class="info-section">
          <div class="info-section__name">{{ product.name }}</div>
          <div class="info-section__brand">{{ product.brand }}</div>
          <div class="info-section__price">
            <span class="info-section__price__before">&yen;</span>
            <span class="info-section__price__value">{{ product.price.toLocaleString() }}</span>
            <span class="info-section__price__after">(税込)</span>
          </div>
        </div>
      </div>

      <div class="group">
        <div class="group-title">お支払い方法</div>
        <div class="group-content">
          <div class="dropdown">
            <select v-model="paymentOptionIndex" class="create-form__item__select">
              <option disabled value="0">選択してください</option>
              <option v-for="(text, index) in paymentOptionText" :value="index + 1">
                {{ text }}
              </option>
            </select>
          </div>
        </div>
        <div class="error-massage">{{ isPaymentValid? '': "お支払い方法が選択されていません" }}</div>
      </div>

      <div class="group">
        <div class="group-header">
          <div class="group-title">配送先</div>
          <div class="change-destination-button-container">
            <button class="change-destination-button" @click="modalOpen = true">配送先を変更する</button>
          </div>
          <PurchaseDestination 
            v-model:modelValue="modalOpen"
            :formData="formValues" 
            @save="handleSave"
          />
        </div>
        <div class="group-content">
          <div>
            <div>{{ formValues.zipcode }}</div>
            <div>{{ formValues.address }}</div>
            <div>{{ formValues.building }}</div>
          </div>
        </div>
        <div class="error-massage">{{ isDestinationValid? '': "郵便番号と住所は必須です" }}</div>
      </div>
    </div>

    <div class="right-section">
      <table class="summary-table">
        <tbody>
          <tr>
            <th class="summary-table__header">商品代金</th>
            <td class="summary-table__content">
              <div class="info-section__price">
                <span class="info-section__price__before">&yen;</span>
                <span class="info-section__price__value">{{ product.price.toLocaleString() }}</span>
                <span class="info-section__price__after">(税込)</span>
              </div>
            </td>
          </tr>
          <tr>
            <th class="summary-table__header">お支払い方法</th>
            <td class="summary-table__content">
              {{ paymentOptionIndex == 0? '選択されていません': paymentOptionText[paymentOptionIndex-1] }}
            </td>
          </tr>
        </tbody>
      </table>
      <div class="submit-button-container">
        <client-only>
          <button class="button" :disabled="product.purchases_exists || !auth.user || !isPaymentValid || !isDestinationValid" @click="uploadData">購入する</button>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '~/types/product';
import type { Category } from '~/types/category';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { get, post } = useAuth();

const product_id = route.query.product_id;
const modalOpen = ref(false)
const formValues = ref({
  zipcode: '',
  address: '',
  building: ''
});

const handleSave = (newData: typeof formValues.value) => {
  formValues.value = newData;
}

const isPaymentValid = computed(() =>  paymentOptionIndex.value != 0);
const isDestinationValid = computed(() => (formValues.value.zipcode != '' && formValues.value.address != ''));

const setInitialValues = () => {
  if (auth.user) {
    formValues.value.zipcode = auth.user.zipcode || '';
    formValues.value.address = auth.user.address || '';
    formValues.value.building = auth.user.building || '';
  }
}

const paymentOptionIndex = ref(0);
const paymentOptionText = ['コンビニ払い', 'カード支払い'];

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

const product = ref<Product>({
  id: 0,
  user_id: 0,
  name: '',
  brand: '',
  price: 0,
  content: '',
  img_filename: '',
  condition_index: 0,
  status_index: 0,
  categories: [],
  favorites_count: 0,
  purchases_exists: false,
});

const categories = ref<Category[]>([]);

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
      status_index: resp.data.status_index,
      categories: resp.data.categories,
      favorites_count: resp.data.favorites_count,
      purchases_exists: resp.data.purchases_exists,
    };

    categories.value = product.value.categories;
  } catch (err) {
    console.error('読み込み失敗', err);
  }
};

const uploadData = async () => {
  // ユーザー存在チェック
  const respAuth = await get(`/users/${auth.user.id}`);
  if (respAuth.data.id != auth.user.id) {
    alert('ユーザー情報の取得に失敗しました');
    return;
  }

  // 自分の出品ではないかチェック
  if (auth.user.id == product.value.user_id) {
    alert('自分が出品した商品を購入することはできません');
    return;
  }

  // 入力内容チェック
  if (!isPaymentValid.value || !isDestinationValid.value) {
    alert('必要事項が入力されていません');
    return;
  }

  // 最終確認
  const ret = window.confirm('この商品を購入しますか？');
  if (!ret) return;

  // 購入データのアップロード
  try {
    const buffPurchase = {
      product_id: product_id,
      user_id: auth.user.id,
      zipcode: formValues.value.zipcode,
      address: formValues.value.address,
      building: formValues.value.building,
      method_index: paymentOptionIndex.value
    };

    const resp2 = await post(`/purchases`, buffPurchase);
    if (resp2) {
      alert('購入しました!');
      router.push(`/mypage?mode=1`);
    } else {
      throw new Error("APIエラー");
    }

  } catch (err) {
    console.error('アップロード失敗:', err)
    alert('データのアップロードに失敗しました。');
  }
}

onMounted(async () => {
  setInitialValues();
  await readProduct();
});
</script>

<style scoped>
.main-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  max-width: 1230px;
  margin: 0 auto;
  padding: 30px 10px;
}

.left-section {
  grid-column: 1;
}

.group {
  padding: 20px;

  border-bottom: 1px solid gray;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.group-title {
  margin: 10px 0;
  padding: 3px 0;
  font-weight: bold;
  font-size: large;
  color: #333;
}

.group-content {
  margin: 20px 0 30px 50px;
}

.error-massage {
  margin: 10px 0 10px 50px;
  color:red;
}

.right-section {
  grid-column: 2;
  padding: 20px;
}

.summary-table {
  width: 100%;
  padding: 20px 0;
  border-collapse: collapse;
}

.summary-table__header {
  height: 100px;
  border: 1px solid gray;
  border-right: none;
}

.summary-table__content {
  height: 100px;
  border: 1px solid gray;
  border-left: none;
}


.submit-button-container {
  margin: 50px 0 20px;
}

.button {
  background: #FF5655;
  width: 100%;
  height: 50px;
  color: white;
  font-weight: 550;
  border: none;
  border-radius: 3px;
}

.button:hover {
  background: #f4b4b4;
}

.button:disabled {
  background: #ccc;
}

.product-info-section {
  display: flex;
  border-bottom: 1px solid gray;
}

.img-section {
  padding: 15px;
}

.img-section__img {
  max-width: 200px;
}

.info-section {
  padding: 15px;
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
}

.info-section__price__value {
  font-size: x-large;
  margin: auto 3px 0;
}

.dropdown {
  position: relative;
  display: block;
  margin-top: 0.5em;
  padding: 0;
}

.dropdown::after {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  content: "";
  width: 0;
  height: 0;
  border-top: 8px solid #555555;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  pointer-events: none;
}

.dropdown select {
  width: 100%;
  margin: 0;
  background: transparent;
  border: 1px solid gray;
  border-radius: 3px;
  padding: .3em 1.9em .3em .8em;
}

.change-destination-button {
  border: none;
  background: transparent;
  text-decoration: underline;
  color: blue;
  font-size: small;
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

@media screen and (max-width: 768px) {
  .main-content {
    display: block;

  }
}
</style>