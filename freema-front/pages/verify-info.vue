<template>
  <div class="main-container">
    <div class="message-container">
      <template v-if="isAutoSending">
        <h2 class="message-container__title">確認メールを送信しました</h2>
        <div class="message-block">
          <p>登録していただいたメールアドレスに認証メールを送付しました。</p>
          <p>メール内のURLリンクをクリックしてメール認証を完了してください。</p>
        </div>
      </template>
      <template v-else>
        <h2 class="message-container__title">本人確認が完了していません</h2>
        <div class="message-block">
          <p>現在は仮登録の状態です。</p>
        </div>
      </template>
    </div>

    <div class="button-container">
      <template v-if="isAutoSending">
        <div class="message-block">
          <p>確認メールが届いていない場合は、下のボタンをクリックして確認メールを再送してください。</p>
        </div>
      </template>
      <template v-else>
        <div class="message-block">
          <p>下のボタンをクリックして確認メールを再送し、メールを確認して登録を完了してください。</p>
        </div>
      </template>

      <button :class="['resend-button', isAutoSending ? 'resend-button__blue' : 'resend-button__red']"
        @click="resendEmail" :disabled="isLoading">
        {{ isLoading ? '再送信中...' : '確認メールを再送する' }}
      </button>

      <p v-if="message">{{ message }}</p>
      <p v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '@/utils/api'

const api = useApi();
const route = useRoute();
const no_auto_sending = route.query.no_auto_sending as string;
const isLoading = ref(false);
const message = ref('');
const error = ref('');
const isAutoSending = ref(no_auto_sending != '1');

const resendEmail = async () => {
  isLoading.value = true;
  message.value = '';
  error.value = '';

  try {
    const token = localStorage.getItem('auth_token');
    const res = await api.post('/email/resend', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    message.value = res.data.message || '確認メールを再送しました。';
  } catch (e: any) {
    error.value = e.response?.data?.message || '再送に失敗しました。';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.main-container {
  margin: 0 auto;
  padding: 30px 15px;
  max-width: 1230px;
}

.message-container {
  margin: 50px auto;
  text-align: center;
  gap: 20px;
}

.message-block {
  margin: 0 auto;
  max-width: 600px;
  text-align: left;
  background: #f0f0f0;
  padding: 10px;
}

.button-container {
  margin: 70px auto;
  text-align: center;
  gap: 20px;
}

.resend-button {
  margin: 15px auto;
  padding: 10px 25px;
  border: none;
  border-radius: 3px;
  color: white;
}

.resend-button__red {
  background: #FF5655;
}

.resend-button__blue {
  background: #8cc0e7;
}

.resend-button__red:hover {
  background: #f4b4b4;
}

.resend-button__blue:hover {
  background: rgb(201, 223, 240)
}
</style>
