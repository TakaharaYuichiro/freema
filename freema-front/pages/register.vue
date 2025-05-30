<template>
  <div class="main-container">
    <div class="form__heading">
      <h2>会員登録</h2>
    </div>

    <form @submit.prevent="handleRegister" class="form">
      <div class="form__group">
        <div class="form__group__title">ユーザー名</div>
        <input v-model="name" class="form__input" type="text" name="お名前" placeholder="お名前"
          @blur="metaName.touched = true" data-testid="name" />
        <div class="form__error" data-testid="error-name">{{ errorsName }}</div>
      </div>

      <div class="form__group">
        <div class="form__group__title">メールアドレス</div>
        <input v-model="email" class="form__input" type="email" name="メールアドレス" placeholder="example@ex.com"
          @blur="metaEmail.touched = true" data-testid="email" />
        <div class="form__error" data-testid="error-email">{{ errorsEmail }}</div>
      </div>

      <div class="form__group">
        <div class="form__group__title">パスワード</div>
        <input v-model="password" class="form__input" type="password" name="パスワード" placeholder="password"
          @blur="metaPassword.touched = true" data-testid="password" />
        <div class="form__error" data-testid="error-password">{{ errorsPassword }}</div>
      </div>

      <div class="form__group">
        <div class="form__group__title">確認用パスワード</div>
        <input v-model="confirm_password" class="form__input" type="password" name="パスワード(確認用)" placeholder="password"
          @blur="metaConfirmPassword.touched = true" data-testid="confirm_password" />
        <div class="form__error" data-testid="error-confirm-password">{{ errorsConfirmPassword }}
        </div>
      </div>

      <div class="form__button">
        <button class="form__button-submit" type="submit" data-testid="submit">登録する</button>
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
import { ref } from 'vue';
import useAuth from '~/composables/useAuth';
import { useRouter } from 'vue-router'
import { registerSchema } from '@/composables/validations/registerSchema';
import type { RegisterFormValues } from '@/composables/validations/registerSchema';

const router = useRouter();
const isLoading = ref(false);   // ボタン連続クリック防止用フラグ

const { validate } = useForm<RegisterFormValues>({ validationSchema: registerSchema });

const { value: name, errorMessage: errorsName, meta: metaName } = useField<string>('name');
const { value: email, errorMessage: errorsEmail, meta: metaEmail } = useField<string>('email');
const { value: password, errorMessage: errorsPassword, meta: metaPassword } = useField<string>('password');
const { value: confirm_password, errorMessage: errorsConfirmPassword, meta: metaConfirmPassword } = useField<string>('confirm_password');

// 会員登録処理(仮登録)
const { register } = useAuth();

const handleRegister = async () => {
  if (isLoading.value) return;

  const { valid } = await validate(); // バリデーション実行
  if (!valid) {
    // touched をすべて true にしてエラー表示を発火させる
    metaName.touched = true;
    metaEmail.touched = true;
    metaPassword.touched = true;
    metaConfirmPassword.touched = true;
    return;
  }

  isLoading.value = true;

  const success = await register(name.value, email.value, password.value, confirm_password.value);
  if (success) {
    router.push('/verify-info');
  } else {
    alert('仮登録に失敗しました。メールアドレスがすでに登録済みの可能性があります。');
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