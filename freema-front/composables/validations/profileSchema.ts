import * as yup from 'yup';

export interface ProfileFormValues {
  name: string;
  zipcode: string;
  address: string;
  building: string;
  avatar: File | null;
}

export const profileSchema = yup.object({
  name: yup
    .string()
    .required('ユーザー名は必須です')
    .max(255, 'お名前は255文字以内で入力してください'),
  zipcode: yup
    .string()
    .nullable()
    .notRequired()
    .matches(/^\d{7}$|^\d{3}-\d{4}$/, {
      message: '郵便番号の形式が正しくありません(数値7桁 または 3桁-4桁)。',
      excludeEmptyString: true,
    }),
  address: yup
    .string()
    .max(255, '住所は255文字以内で入力してください'),
  building: yup
    .string()
    .max(255, '建物名は255文字以内で入力してください'),
  avatar: yup
    .mixed<File>()
    .test('fileType', 'JPEGまたはPNG形式の画像をアップロードしてください', (file) => {
      if (!file) return true; // アップロードが任意ならtrue
      return ['image/jpeg', 'image/png'].includes(file.type);
    }),
});
