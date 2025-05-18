<template>
  <div class="container">
    <div class="sub-group">
      <div class="sub-title">投稿</div>
      <div class="input-comment__container">
        <textarea class="input-comment" v-model="newComment" placeholder="コメントを入力してください" @blur="metaComment.touched = true" data-testid="input-comment"></textarea>
      </div>
      <div class="form__error" :hidden="!auth.user" data-testid="error-comment">{{ errorsComment }}</div>
      <div class="button-container">
        <button class="button" :disabled="!auth.user || !isFormValid" @click="submitComment" data-testid="submit-comment">コメントを投稿する</button>
      </div>
    </div>

    <div class="sub-group">
      <div class="sub-title">みんなのコメント(<span data-testid="product-item--evaluation-count2">{{ evaluations.length }}</span>)</div>
      <div class="comment-container" v-for="evaluation in evaluations" :key="evaluation.id">
        <div class="comment-header">
          <div class="comment-header__info">
            <div class="comment-header__icon__container">
              <img class="comment-header__icon__img" :src="getProductImage(evaluation.user?.img_filename)"
                @error="onImageError" alt="アイコン" />
            </div>
            <div class="comment-header__text">{{ evaluation.user?.name }}</div>
            <div class="comment-header__text">{{ parseDate(evaluation.created_at) }}</div>
          </div>
          <div class="comment-header__button-container" v-if="evaluation.user?.id == auth.user?.id">
            <button class="comment-header__button" @click="deleteComment(evaluation.id)">削除</button>
          </div>
        </div>
        <div class="comment-content">
          <div data-testid="product-item--evaluation-comment">{{ evaluation.comment }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Evaluation } from '~/types/evaluation';
import useAuth from '~/composables/useAuth';
import { useAuthStore } from "@/stores/auth";
import { useField, useForm } from 'vee-validate';
import * as yup from 'yup';

const { get, post, del } = useAuth();
const auth = useAuthStore();
const props = defineProps<{
  product_id: number;
}>();
const emit = defineEmits(['updated']);  // 兄弟コンポーネント(/detail/vote)のデータを更新するためのイベント
const evaluations = ref<Evaluation[]>([]);

interface FormValues {
  comment: string;
}
const schema = yup.object({
  comment: yup.string().required('コメントを入力してください').max(255, 'コメントは255文字以内で入力してください')
});

const { meta } = useForm<FormValues>({ validationSchema: schema });
const isFormValid = computed(() => meta.value.valid);

const { value: newComment, errorMessage: errorsComment, meta: metaComment } = useField<string>('comment');

const readEvaluations = async () => {
  try {
    const resp = await get(`/evaluations?product_id=${props.product_id}`);
    evaluations.value = resp.data.map((datum: Evaluation) => ({
      id: datum.id,
      user_id: datum.user_id,
      product_id: datum.product_id,
      comment: datum.comment,
      user: datum.user,
      created_at: datum.created_at
    })).sort((a: Evaluation, b: Evaluation) => {
      // 降順（Z→A）
      return b.created_at.localeCompare(a.created_at);
    });
    emit('updated'); // 兄弟コンポーネント(/detail/vote)のデータを更新するため、一旦親に通知
  } catch (err) {
    console.error('読み込み失敗', err);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('コメントを入力してください');
    return;
  }

  const answer = window.confirm('このコメントを投稿してもよろしいですか？');
  if (!answer) return;

  try {
    const resp = await post('/evaluations', {
      user_id: auth.user.id,
      product_id: props.product_id,
      comment: newComment.value,
    });
    await readEvaluations();
    newComment.value = '';
  } catch (err) {
    console.error('コメント送信失敗', err);
    alert('コメント送信に失敗しました');
  }
};

const deleteComment = async (id: number) => {
  const answer = window.confirm('このコメントを削除してもよろしいですか？');
  if (!answer) return;

  try {
    await del(`/evaluations/${id}`);
    await readEvaluations();
    newComment.value = '';
  } catch (err) {
    console.error('コメント削除失敗', err);
    alert('コメントを削除できませんでした');
  }
};

const parseDate = (dateStr: string) => {
  const fixed = dateStr.replace(/(\.\d{3})\d+Z$/, '$1Z'); // 6桁 → 3桁のミリ秒に修正（または削除）
  const pad = (n: number) => n.toString().padStart(2, '0'); // 0埋めする関数
  const date = new Date(fixed);
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const imageUrlBase = useRuntimeConfig().public.imageUrlBase;
const getProductImage = (filename: string) => {
  if (filename && filename != '') {
    return `${imageUrlBase}/images/${filename}`;
  } else {
    return '/images/defaultImages/user_icon.png';
  }
}

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target.dataset.errorHandled) return // すでにnoimageに差し替え済みなら何もしない
  target.src = '/images/defaultImages/user_icon.png'
  target.dataset.errorHandled = 'true'
}

onMounted(async () => {
  await readEvaluations();
});
</script>

<style scoped>
.container {
  width: 100%;
}

.row {
  display: flex;
  gap: 10px;
}

.row__title {
  font-weight: bold;
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

.sub-group {
  margin-bottom: 40px;
}

.sub-title {
  margin: 10px 0 5px 0;
  font-size: medium;
  font-weight: bold;
}

.input-comment__container {
  width: 100%;
  margin-bottom: 3px;
}

.input-comment {
  width: 100%;
  max-width: 800px;
  min-height: 150px;
  resize: vertical;
  
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.button {
  background: #FF5655;
  max-width: 300px;
  height: 28px;
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

.comment-container {
  margin: 5px 0 15px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.comment-header__info {
  display: flex;
  gap: 5px;
  font-size: small;
  align-items: flex-end;
}

.comment-content {
  background: #f8f8f8;
  padding: 10px;
  max-height: 100px;
  overflow-y: scroll;
  overflow-x: hidden;
  overflow-wrap:break-word;
}

.comment-header__icon__container {
  width: 30px;
  height: 30px;
  border-radius: 30px;
  position: relative;
  overflow: hidden;
}

.comment-header__icon__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 30px;
  height: 30px;
  object-fit: cover;
}

.comment-header__text {
  padding-bottom: 5px;
}

.comment-header__button-container {
  padding-bottom: 5px;
}

.comment-header__button {
  padding: 0;
  border: none;
  border-radius: 3px;
  width: 50px;
  height: 20px;
  background: transparent;
  text-decoration: underline;
  color: blue;
  font-size: small;
}

.comment-header__button:hover {
  color: red;
}

.form__error {
  color: #ff0000;
  text-align: left;
  font-size: 0.8rem;
  margin-bottom: 10px;
}
</style>