import * as yup from 'yup';
import type { DestinationFormValues } from '@/composables/validations/destinationSchema';

export interface PurchaseFormValues {
  method_index: number;
  destination: DestinationFormValues;
}

export const purchaseSchema = yup.object({
  method_index: yup
    .number()
    .required('お支払い方法を選択してください')
    .moreThan(0, 'お支払い方法を選択してください'),

  destination: yup.object({
    zipcode: yup.string().required('郵便番号を入力してください'),
    address: yup
      .string()
      .required('住所は必須です。')
      .max(255, '住所は255文字以内で入力してください'),
    to_name: yup
      .string()
      .required('配送先氏名は必須です。')
      .max(255, '配送先氏名は255文字以内で入力してください'),
    building: yup
      .string()
      .optional()
      .max(255, '建物名は255文字以内で入力してください'),
  }),
});