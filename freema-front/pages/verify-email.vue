<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import useAuth from '~/composables/useAuth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { verifyEmail } = useAuth();

const verify = async () => {
  const id = route.query.id as string;
  const hash = route.query.hash as string;
  const expires = route.query.expires as string;
  const signature = route.query.signature as string;
  const token = route.query.token as string;

  try {
    const res = await verifyEmail(id, hash, expires, signature, token);

    // トークンとユーザー情報をストアに保存してログイン状態にする
    const { token: newToken, user } = res;

    if (newToken && user) {
      auth.login(newToken, user);
      router.push('/profile');
      alert('会員登録しました！ 続いて、プロフィールを設定してください。');
    } else {
      throw new Error('ログイン情報が不完全です');
    }
  } catch (e) {
    console.error('確認失敗', e);
    router.push('/login?verified=0');
  }
};

onMounted(() => {
  verify();
});
</script>

<template>
  <div class="p-4 text-center">
    <p>メール確認中です...</p>
  </div>
</template>
