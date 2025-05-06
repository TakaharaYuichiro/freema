<template>
  <div class="main-container">
    <div class="form__heading">
      <h2>会員登録</h2>
    </div>

    <form @submit.prevent="handleRegister" class="form">
      <div class="form__group">
        <div class="form__group__title">ユーザー名</div>
        <input v-model="name" class="form__input" type="text" name="お名前" placeholder="お名前"
          @blur="metaName.touched = true" />
        <div class="form__error" v-if="metaName.touched && errorsName">{{ errorsName }}</div>
      </div>

      <div class="form__group">
        <div class="form__group__title">メールアドレス</div>
        <input v-model="email" class="form__input" type="email" name="メールアドレス" placeholder="example@ex.com"
          @blur="metaEmail.touched = true" />
        <div class="form__error" v-if="metaEmail.touched && errorsEmail">{{ errorsEmail }}</div>
      </div>

      <div class="form__group">
        <div class="form__group__title">パスワード</div>
        <input v-model="password" class="form__input" type="password" name="パスワード" placeholder="password"
          @blur="metaPassword.touched = true" />
        <div class="form__error" v-if="metaPassword.touched && errorsPassword">{{ errorsPassword }}</div>
      </div>

      <div class="form__group">
        <div class="form__group__title">確認用パスワード</div>
        <input v-model="confirm_password" class="form__input" type="password" name="パスワード(確認用)" placeholder="password"
          @blur="metaConfirmPassword.touched = true" />
        <div class="form__error" v-if="metaConfirmPassword.touched && errorsConfirmPassword">{{ errorsConfirmPassword }}
        </div>
      </div>

      <div class="form__button">
        <button class="form__button-submit" type="submit" :disabled="!isFormValid">登録する</button>
      </div>
    </form>

    <div class="login-register-switching">
      <p>
        <NuxtLink to="/login">ログインはこちら</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import * as yup from 'yup';
import { computed } from 'vue';
import useAuth from '~/composables/useAuth';

const router = useRouter();
const isLoading = ref(false);   // ボタン連続クリック防止用フラグ

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const schema = yup.object({
  name: yup.string().required('お名前を入力してください'),
  email: yup.string().required('メールアドレスを入力してください').email('有効なメールアドレスを入力してください'),
  password: yup.string().required('パスワードを入力してください').min(8, 'パスワードは8文字以上で入力してください'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'パスワードと一致しません')
    .required('パスワード確認は必須です'),
});

const { meta } = useForm<FormValues>({ validationSchema: schema });
const isFormValid = computed(() => meta.value.valid);

// 各フィールドのバリデーション設定
const { value: name, errorMessage: errorsName, meta: metaName } = useField<string>('name');
const { value: email, errorMessage: errorsEmail, meta: metaEmail } = useField<string>('email');
const { value: password, errorMessage: errorsPassword, meta: metaPassword } = useField<string>('password');
const { value: confirm_password, errorMessage: errorsConfirmPassword, meta: metaConfirmPassword } = useField<string>('confirm_password');

// 会員登録処理(仮登録)
const { register, error } = useAuth();
const handleRegister = async () => {
  if (isLoading.value) return
  isLoading.value = true;

  const success = await register(name.value, email.value, password.value, confirm_password.value);
  if (success) {
    router.push('/verify-info'); // 「メール確認してください」画面へ
  }
  isLoading.value = false;
};
</script>

<style scoped>
.main-container {
  margin: 0 auto;
  padding: 30px 15px;
  max-width: 1230px;
}

.form__heading {
  padding: 20px;
  text-align: center;
}

.form {
  margin: 0 auto;
  max-width: 470px;
  text-align: center;
  padding: 30px;
}

.form__group {
  width: 100%;
  height: 90px;
  margin-bottom: 5px;
}

.form__group__title {
  text-align: left;
  margin: 5px 0;
}

.form__input {
  padding: 10px 5px;
  width: 100%;
  height: 40px;
  border: 1px solid #bbb;
  border-radius: 3px;
  appearance: none;
  box-sizing: border-box;
}

.form__error {
  height: 20px;
  color: #ff0000;
  text-align: left;
  font-size: 0.8rem;
  padding: 2px 0 0 0;
}

.form__button {
  margin-top: 20px;
  width: 100%;
}

.form__button-submit {
  padding: 10px;
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 3px;
  background: #FF5655;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
}

.form__button-submit:hover {
  background: #f4b4b4;
}

.form__button-submit:disabled {
  background: #aaa;
}

.login-register-switching {
  text-align: center;
}

.login-register-switching a {
  color: #0073CC;
  text-decoration: none;
}

.login-register-switching a:hover {
  color: #9fc7e6;
}
</style>