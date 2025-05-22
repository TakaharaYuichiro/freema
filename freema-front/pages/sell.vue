<template>
  <div class="main-content">
    <div class="title">
      <h2>商品の出品</h2>
    </div>
    <div class="group">
      <div class="sub-group-title">商品画像</div>
      <div class="preview__group">
        <div class="preview__container">
          <img class="preview__img" :src="imageSrc" alt="画像プレビュー" />
        </div>
        <div class="preview__input-container">
          <input ref="fileInput" type="file" accept=".jpeg,.jpg,.png" style="display:none" @change="handleFileChange">
          <button class="file-upload-button" @click="changeFile">画像を選択する</button>
          <div class="form__error" v-if="errorsProductImage">{{ errorsProductImage }}</div>
        </div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">商品の詳細</div>
      <div class="sub-group">
        <div class="sub-group-title">カテゴリー</div>
        <div class="category-list">
          <template v-for="category in categories" :key="category.id">
            <button
              :class="['category-list__item', category.selected ? 'category-list__item__selected' : 'category-list__item__not-selected']"
              @click="selectCategory(category.id)" data-testid="category-button">{{ category.name }}
            </button>
          </template>
          <div class="form__error" v-if="errorsCategory">{{ errorsCategory }}</div>
        </div>
      </div>
      <div class="sub-group sub-group__fixed-height">
        <div class="sub-group-title">商品の状態</div>
        <div class="dropdown">
          <select v-model="conditionIndex" class="create-form__item__select" data-testid="condition-select">
            <option disabled value="0">選択してください</option>
            <option v-for="(label, key) in PRODUCT_CONDITIONS" :key="key" :value="Number(key)">{{ label }}</option>
          </select>
        </div>
        <div class="form__error" v-if="errorsConditionIndex">{{ errorsConditionIndex }}</div>
      </div>
    </div>

    <div class="group">
      <div class="group-title">商品名と説明</div>
      <div class="sub-group sub-group__fixed-height">
        <div class="sub-group-title">商品名</div>
        <div class="input-text">
          <input v-model="productName" type="text" @blur="metaProductName.touched = true" data-testid="product-name">
          <div class="form__error" v-if="errorsProductName">{{ errorsProductName }}</div>
        </div>
      </div>
      <div class="sub-group sub-group__fixed-height">
        <div class="sub-group-title">ブランド名</div>
        <div class="input-text">
          <input v-model="productBrand" type="text" data-testid="product-brand">
        </div>
      </div>
      <div class="sub-group">
        <div class="sub-group-title">商品の説明</div>
        <div class="input-text">
          <textarea v-model="productContent" data-testid="product-description"></textarea>
        </div>
      </div>
      <div class="sub-group sub-group__fixed-height">
        <div class="sub-group-title">販売価格</div>
        <div class="input-text">
          <input v-model="productPrice" type="text" @blur="metaProductPrice.touched = true" data-testid="product-price">
          <div class="form__error" v-if="metaProductPrice.touched && errorsProductPrice">{{ errorsProductPrice }}</div>
        </div>
      </div>
    </div>

    <div class="submit-button-container">
      <client-only>
        <button class="submit-button" :disabled="!auth.user || !isFormValid" @click="submitData"
          data-testid="submit-button">出品する</button>
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useField, useForm } from 'vee-validate';
import { PRODUCT_CONDITIONS } from '@/utils/constants'
import type { Category } from '~/types/category';
import useAuth from '~/composables/useAuth';
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { sellSchema } from '@/composables/validations/sellSchema';
import type { SellFormValues } from '@/composables/validations/sellSchema';

typeof definePageMeta === 'function' && definePageMeta({ middleware: 'auth' }); // テスト時には飛ばす

type CategoryExp = Category & {
  selected: boolean
}

const { get, post } = useAuth();
const auth = useAuthStore();
const router = useRouter();
const isLoading = ref(false);   // ボタン連続くリック防止用フラグ

const { meta } = useForm<SellFormValues>({
  validationSchema: sellSchema,
  initialValues: {
    productName: '',
    productPrice: 0,
    conditionIndex: 0,
    selectedCategoryIds: []
  },
  validateOnMount: true,
});

const isFormValid = computed(() => meta.value.valid);
const { value: productName, errorMessage: errorsProductName, meta: metaProductName } = useField<string>('productName');
const { value: productPrice, errorMessage: errorsProductPrice, meta: metaProductPrice } = useField<number>('productPrice');
const { value: conditionIndex, errorMessage: errorsConditionIndex, meta: metaConditionIndex } = useField<number>('conditionIndex');
const { value: productImage, errorMessage: errorsProductImage, meta: metaProductImage } = useField<File | null>('productImage');
const { value: selectedCategoryIds, errorMessage: errorsCategory } = useField<number[]>('selectedCategoryIds');

const productBrand = ref('');
const productContent = ref('');

const categories = ref<CategoryExp[]>([]);
const readCategories = async () => {
  try {
    const resp = await get(`/categories`);
    categories.value = resp.data.map((datum: Category) => ({
      id: datum.id,
      name: datum.name,
      selected: false,
    }));

  } catch (err) {
    console.error('読み込み失敗', err);
  }
};

const selectCategory = (id: number) => {
  const category = categories.value.find((c) => c.id === id);
  if (category) {
    category.selected = !category.selected;

    // 選択されているカテゴリIDだけをフィールドに設定
    const selectedIds = categories.value.filter((c) => c.selected).map((c) => c.id);
    selectedCategoryIds.value = selectedIds;
  }
};

const previewUrl = ref<string | null>(null);

const imageSrc = computed(() => {
  if (previewUrl.value) {
    return previewUrl.value;
  }
  return '/images/defaultImages/noimage.png';
});

const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    previewUrl.value = URL.createObjectURL(selectedFile.value);
    productImage.value = selectedFile.value;
  }
};

const changeFile = async () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const submitData = async () => {
  if (isLoading.value) return
  isLoading.value = true

  // 商品画像アップロード
  let imgFilePath = '';
  if (selectedFile.value) {
    const formData = new FormData()
    formData.append('image', selectedFile.value)

    try {
      const response = await post('/upload-image', formData);
      imgFilePath = response.path;

      // アップロード後にプレビュー URL を解除する（メモリ開放）
      URL.revokeObjectURL(previewUrl.value!);
      previewUrl.value = null;
      selectedFile.value = null;
    } catch (err) {
      console.error('アップロード失敗:', err)
      alert('データのアップロードに失敗しました。');
      router.push('/mypage');
    }
  }

  // 商品データのアップロード
  try {
    const buffProducts = {
      user_id: auth.user.id,
      name: productName.value,
      brand: productBrand.value,
      price: productPrice.value,
      content: productContent.value,
      img_filename: imgFilePath,
      condition_index: conditionIndex.value,
    };

    const resp1 = await post('/products', buffProducts);
    const product_id = resp1.data.id;

    for (let category of categories.value) {
      if (category.selected) {
        const category_product = { product_id: product_id, category_id: category.id };
        await post('/category-products', category_product);
      }
    }
    alert('出品しました!');
    router.push('/mypage');

  } catch (err) {
    console.error('アップロード失敗:', err)
    alert('データのアップロードに失敗しました。');
    router.push('/mypage');
  }
}

onMounted(async () => {
  await readCategories();
});
</script>

<style scoped>
.main-content {
  display: block;
  max-width: 600px;
  margin: 0 auto 100px;
  padding: 30px 10px;
}

.title {
  display: flex;
  justify-content: center;
}

.group {
  padding: 20px 0;
}

.group-title {
  margin: 10px 0;
  padding: 3px 0;
  border-bottom: 1px solid gray;
  font-weight: bold;
  font-size: larger;
  color: #666;
}

.preview__group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 20px;
  border: 1px dashed #aaa;
}

.preview__container {
  padding: 10px;
  max-width: 400px;
  border-radius: 2px;
}

.preview__img {
  width: 100%;
}

.preview__input-container {
  padding: 10px;
}

.file-upload-button {
  border: 1px solid #FF5656;
  color: #FF5656;
  background: transparent;
  border-radius: 10px;
  font-size: 12px;
  text-align: center;
  padding: 10px;
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.file-upload-button:hover {
  background: #FFc0c0;
}

.sub-group {
  padding: 0 0 20px 0;
}

.sub-group__fixed-height {
  height: 90px;
  padding-bottom: 5px;
}

.sub-group__with-textarea {
  padding-bottom: 20px;
}

.sub-group-title {
  margin: 10px 0;
  font-weight: bold;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  column-gap: 10px;
  row-gap: 20px;
}

.category-list__item {
  border: 1px solid #FF5656;
  border-radius: 10px;
  height: 20px;
  font-size: 12px;
  text-align: center;
  padding: 0 10px;
  display: flex;
  align-items: center;
}

.category-list__item__selected {
  background: #FF5656;
  color: white;
}

.category-list__item__not-selected {
  background: transparent;
  color: #FF5656;
}

.category-list__item:hover {
  background: #FFc0c0;
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

.input-text input,
.input-text textarea {
  width: 100%;
  border-radius: 3px;
  padding: 5px 2px;
  border: 1px solid gray;
  box-sizing: border-box;
}

.input-text textarea {
  min-height: 120px;
  resize: vertical;
}

.form__error {
  color: #ff0000;
  text-align: left;
  font-size: 0.8rem;
  padding-top: 2px;
}

.submit-button-container {
  margin: 30px 0;
}

.submit-button {
  background: #FF5655;
  width: 100%;
  height: 50px;
  color: white;
  font-weight: 550;
  border: none;
  border-radius: 3px;
}

.submit-button:hover {
  background: #f4b4b4;
}

.submit-button:disabled {
  background: #ccc;
}

.img-section {
  padding: 15px;
}

.img-section__img {
  width: 100%;
  max-width: 500px;
}

.info-section {
  padding: 15px;
  width: 100%;
  max-width: 600px;
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
</style>