<template>
  <div class="main-container">
    <div class="form__heading">
      <h2>ログイン</h2>
    </div>

    <form @submit.prevent="handleLogin" class="form">
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

      <div class="form__button">
        <button class="form__button-submit" type="submit" data-testid="submit">ログインする</button>
        <div class="form__error" data-testid="error-submit">{{ errorsSubmit }}</div>
      </div>
    </form>

    <div class="login-register-switching">
      <p>
        <NuxtLink to="/register">会員登録はこちら</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import * as yup from 'yup';
import { ref, computed } from 'vue';
import useAuth from '~/composables/useAuth';
import { useRouter } from 'vue-router'

const router = useRouter();
const { login, error } = useAuth();
const isLoading = ref(false);   // ボタン連続クリック防止用フラグ
const errorsSubmit = ref('');

interface FormValues {
  email: string;
  password: string;
}
const schema = yup.object({
  email: yup.string().required('メールアドレスを入力してください').email('有効なメールアドレスを入力してください'),
  password: yup.string().required('パスワードを入力してください').min(8, 'パスワードは8文字以上で入力してください')
});

const { validate } = useForm<FormValues>({ validationSchema: schema });

const { value: email, errorMessage: errorsEmail, meta: metaEmail } = useField<string>('email');
const { value: password, errorMessage: errorsPassword, meta: metaPassword } = useField<string>('password');

const handleLogin = async () => {
  if (isLoading.value) return
  const { valid } = await validate(); // バリデーション実行
  if (!valid) {
    // touched をすべて true にしてエラー表示を発火させる
    metaEmail.touched = true;
    metaPassword.touched = true;
    return;
  }

  isLoading.value = true;

  const responceCode = await login(email.value, password.value);

  if (responceCode == 1) {
    // ログイン成功　→ ホーム画面へ
    router.push('/');
  } else if (responceCode == -1) {
    // email_verified_atがnull (仮登録の状態)　→　「メール確認してください」画面へ
    alert("メール確認が未済です。");
    router.push({ path: '/verify-info', query: { no_auto_sending: 1 } });
  } else {
    // ログイン失敗
    errorsSubmit.value = "ログイン情報が登録されていません。";
    alert("ログイン情報が登録されていません。");
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