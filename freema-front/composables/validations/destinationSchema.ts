import * as yup from 'yup';

export interface DestinationFormValues {
  zipcode: string;
  address: string;
  building: string;
  to_name: string;
}

export const destinationSchema = yup.object({
  zipcode: yup
    .string()
    .required('郵便番号は必須です。')
    .matches(/^\d{7}$|^\d{3}-\d{4}$/, {
      message: '郵便番号の形式が正しくありません(数値7桁 または 3桁-4桁)。',
      excludeEmptyString: true, // 空文字にはマッチをスキップ
    }),
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
});
