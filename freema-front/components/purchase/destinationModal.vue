<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-title">
        <h2>配送先変更</h2>
      </div>
      <form class="modal-form" @submit.prevent="submitForm">
        <div class="sub-group">
          <div class="sub-group-title">郵便番号(必須)</div>
          <div class="input-text">
            <input v-model="zipcode" type="text" @blur="metaZipcode.touched = true">
            <div class="form__error" v-if="errorsZipcode">{{ errorsZipcode }}</div>
          </div>
        </div>
        <div class="sub-group">
          <div class="sub-group-title">住所(必須)</div>
          <div class="input-text">
            <input v-model="address" type="text" @blur="metaAddress.touched = true">
            <div class="form__error" v-if="errorsAddress">{{ errorsAddress }}</div>
          </div>
        </div>
        <div class="sub-group">
          <div class="sub-group-title">建物名</div>
          <div class="input-text">
            <input v-model="building" type="text" @blur="metaBuilding.touched = true">
            <div class="form__error" v-if="errorsBuilding">{{ errorsBuilding }}</div>
          </div>
        </div>
        <div class="sub-group">
          <div class="sub-group-title">配送先氏名(必須)</div>
          <div class="input-text">
            <input v-model="to_name" type="text" @blur="metaToName.touched = true">
            <div class="form__error" v-if="errorsToName">{{ errorsToName }}</div>
          </div>
        </div>

        <div class="actions">
          <button class="action__cancel" type="button" @click="onCancel">キャンセル</button>
          <button class="action__submit" type="submit" :disabled="!isFormValid">この住所に配送する</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useField, useForm } from 'vee-validate';
import * as yup from 'yup';

interface FormValues {
  zipcode: string;
  address: string;
  building: string;
  to_name: string;
}

const props = defineProps<{
  modelValue: boolean;
  formData: FormValues;
}>();

const schema = yup.object({
  zipcode: yup
    .string()
    .required('郵便番号は必須です。')
    // .matches(/^[0-9]{7}$|^[0-9]{3}-[0-9]{4}$/, '郵便番号の形式が正しくありません。'),
    .matches(/^\d{7}$|^\d{3}-\d{4}$/, {
      message: '郵便番号の形式が正しくありません(数値7桁 または 3桁-4桁)。',
      excludeEmptyString: true, // 空文字にはマッチをスキップ
    }),
  address: yup.string().max(191, '住所は191文字以内としてください。').required('住所は必須です。'),
  building: yup.string().max(191, '建物名は191文字以内としてください。'),
  to_name: yup.string().max(191, '配送先氏名は191文字以内としてください。').required('配送先氏名は必須です。'),
});

const { meta, resetForm, handleSubmit } = useForm<FormValues>({
  validationSchema: schema,
});

const isFormValid = computed(() => meta.value.valid);
const { value: zipcode, errorMessage: errorsZipcode, meta: metaZipcode } = useField<string>('zipcode');
const { value: address, errorMessage: errorsAddress, meta: metaAddress } = useField<string>('address');
const { value: building, errorMessage: errorsBuilding, meta: metaBuilding } = useField<string>('building');
const { value: to_name, errorMessage: errorsToName, meta: metaToName } = useField<string>('to_name');

watch(() => props.formData, (newVal) => {
  resetForm({ values: { ...newVal } })
}, { deep: true }) // ネストされたオブジェクトなので deep:true が必要

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', formValues: any): void;
}>();

const submitForm = handleSubmit((values) => {
  emit('save', values);
  emit('update:modelValue', false);
});

function onCancel() {
  resetForm({ values: { ...props.formData } }); // 編集内容を破棄して元に戻す
  emit('update:modelValue', false);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
}

.modal-title {
  display: flex;
  justify-content: center;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  box-sizing: border-box;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.sub-group {
  padding: 5px 0;
  height: 100px;
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

.action__submit {
  background: #FF5655;
  width: 250px;
  height: 50px;
  color: white;
  font-weight: 550;
  border: none;
  border-radius: 3px;
}

.action__submit:hover {
  background: #f4b4b4;
}

.action__submit:disabled {
  background: #ccc;
}

.action__cancel {
  background: transparent;
  width: 110px;
  height: 50px;
  color: #666;
  font-weight: 550;
  border: 1px solid #666;
  border-radius: 3px;
}

.action__cancel:hover {
  background: #ddd;
}
</style>
