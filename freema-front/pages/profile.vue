<template>
  <div class="main-container">
    <h2>プロフィール設定</h2>

    <div class="preview__group">
      <div class="preview__container">
        <client-only>
          <img class="preview__img" :src="imageSrc" alt="画像プレビュー" />
        </client-only>
      </div>
      <div>
        <input ref="fileInput" type="file" accept=".jpeg,.jpg,.png" style="display:none" @change="handleFileChange">
        <button class="upload-button" @click="changeFile">画像を選択する</button>
        <div class="form__error" v-if="errorsAvatar">{{ errorsAvatar }}</div>
      </div>
    </div>

    <div class="sub-group">
      <div class="sub-group-title">ユーザー名(必須)</div>
      <div class="input-text">
        <input v-model="name" type="text" placeholder="ユーザー名" @blur="metaName.touched = true"
          data-testid="profile-name">
        <div class="form__error">{{ errorsName }}</div>
      </div>
    </div>
    <div class="sub-group">
      <div class="sub-group-title">郵便番号</div>
      <div class="input-text">
        <input v-model="zipcode" type="text" placeholder="123-4567" @blur="metaZipcode.touched = true"
          data-testid="profile-zipcode">
        <div class="form__error" v-if="metaZipcode.touched && errorsZipcode">{{ errorsZipcode }}</div>
      </div>
    </div>
    <div class="sub-group">
      <div class="sub-group-title">住所</div>
      <div class="input-text">
        <input v-model="address" type="text" placeholder="住所" @blur="metaAddress.touched = true"
          data-testid="profile-address">
        <div class="form__error" v-if="metaAddress.touched && errorsAddress">{{ errorsAddress }}</div>
      </div>
    </div>
    <div class="sub-group">
      <div class="sub-group-title">建物名</div>
      <div class="input-text">
        <input v-model="building" type="text" placeholder="建物名" @blur="metaBuilding.touched = true"
          data-testid="profile-building">
        <div class="form__error" v-if="metaBuilding.touched && errorsBuilding">{{ errorsBuilding }}</div>
      </div>
    </div>

    <div class="remark">
      郵便番号と住所は、このフォームでは入力必須ではありませんが、商品購入時には入力が必要です(商品購入フォームで入力することも可能です)。
    </div>

    <div class="button-group">
      <client-only>
        <button class="button" :disabled="!auth.user || !isFormValid" @click="uploadData"
          data-testid="update-button">更新する</button>
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from "vue-router";
import useAuth from '~/composables/useAuth';
import { useAuthStore } from "@/stores/auth";
import { useField, useForm } from 'vee-validate';
import { profileSchema } from '@/composables/validations/profileSchema';
import type { ProfileFormValues } from '@/composables/validations/profileSchema';

typeof definePageMeta === 'function' && definePageMeta({ middleware: 'auth' }); // テスト時には飛ばす

const router = useRouter();
const route = useRoute();
const { get, post, put } = useAuth();
const auth = useAuthStore();

const option = route.query.option || 'new';
console.log('option: ', option);

const { setValues, meta } = useForm<ProfileFormValues>({
  validationSchema: profileSchema,
  initialValues: {
    name: '',
    zipcode: '',
    address: '',
    building: ''
  },
});

const isFormValid = computed(() => meta.value.valid);

const { value: name, errorMessage: errorsName, meta: metaName } = useField<string>('name');
const { value: zipcode, errorMessage: errorsZipcode, meta: metaZipcode } = useField<string>('zipcode');
const { value: address, errorMessage: errorsAddress, meta: metaAddress } = useField<string>('address');
const { value: building, errorMessage: errorsBuilding, meta: metaBuilding } = useField<string>('building');
const { value: avatar, errorMessage: errorsAvatar, meta: metaAvatar } = useField<File | null>('avatar');

const setInitialValues = () => {
  if (auth.user) {
    setValues({
      name: auth.user.name || '',
      zipcode: auth.user.zipcode || '',
      address: auth.user.address || '',
      building: auth.user.building || '',
    });
  }
}

const previewUrl = ref<string | null>(null);
const imageUrlBase = useRuntimeConfig().public.imageUrlBase;
const imageSrc = computed(() => {
  if (previewUrl.value) {
    return previewUrl.value;
  }
  if (auth.user?.img_filename) {
    return `${imageUrlBase}/images/${auth.user.img_filename}`;
  }
  return '/images/defaultImages/user_icon.png';
});

const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null)
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
    avatar.value = file;
  }
};

const changeFile = async () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const uploadData = async () => {
  // ユーザー存在チェック
  const resp1 = await get(`/users/${auth.user.id}`);
  if (resp1.data.id != auth.user.id) {
    alert('ユーザー情報の取得に失敗しました');
    return;
  }

  // ユーザーアイコン画像アップロード
  let imgFileName = '';
  if (selectedFile.value) {
    const formData = new FormData()
    formData.append('image', selectedFile.value)

    try {
      const response = await post('/upload-image', formData);
      imgFileName = response.path;

      // アップロード後にプレビュー URL を解除する（メモリ開放）
      URL.revokeObjectURL(previewUrl.value!);
      previewUrl.value = null;
      selectedFile.value = null;
    } catch (err) {
      console.error('アップロード失敗:', err)
      alert('データのアップロードに失敗しました。');
      return;
    }
  } else if (auth.user?.img_filename) {
    imgFileName = auth.user.img_filename;
  }

  // ユーザーデータのアップロード
  try {
    const buffUser = {
      name: name.value,
      zipcode: zipcode.value,
      address: address.value,
      building: building.value,
      img_filename: imgFileName == '' ? null : imgFileName
    };

    const respUser = await put(`/users/${auth.user.id}`, buffUser);
    if (respUser) {
      auth.updateUser(buffUser);  // localStrageをアップデート
      if (option === 'update') {
        router.push('/mypage');
      } else {
        router.push('/');
      }
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
});
</script>

<style scoped>
.main-container {
  display: block;
  max-width: 600px;
  margin: 0 auto;
  padding: 30px 10px;
}

.upload-button {
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

.upload-button:hover {
  background: #FFc0c0;
}

.preview__group {
  display: flex;
  gap: 20px;
  align-items: center;
  margin: 0 0 20px;
}

.preview__container {
  width: 100px;
  height: 100px;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
}

.preview__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.sub-group {
  padding: 5px 0;
}

.sub-group-title {
  margin: 0 0 5px;
  font-weight: bold;
}

.input-text {
  width: 100%;
  height: 45px;
  margin-bottom: 5px;
}

.input-text input {
  width: 100%;
  border-radius: 3px;
  height: 30px;
  border: 1px solid gray;
  color: black;
}

.form__error {
  color: #ff0000;
  text-align: left;
  font-size: 0.8rem;
}

.button-group {
  margin: 20px 0;
  width: 100%;
}

.button {
  background: #FF5655;
  width: 100%;
  height: 35px;
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

.remark {
  background: #f0f0f0;
  padding: 20px 10px;
  margin: 10px 0;
  color: #333;
  font-size: smaller;
}
</style>