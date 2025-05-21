import * as yup from 'yup';

export interface ProfileFormValues {
  name: string;
  zipcode: string;
  address: string;
  building: string;
  avatar: File | null;
}

export const profileSchema = yup.object({
  name: yup.string().required('ユーザー名は必須です'),
  zipcode: yup
    .string()
    .nullable()
    .notRequired()
    .matches(/^\d{7}$|^\d{3}-\d{4}$/, {
      message: '郵便番号の形式が正しくありません(数値7桁 または 3桁-4桁)。',
      excludeEmptyString: true,
    }),
  address: yup.string(),
  building: yup.string(),
  avatar: yup
    .mixed<File>()
    .test('fileType', 'JPEGまたはPNG形式の画像をアップロードしてください', (file) => {
      if (!file) return true; // アップロードが任意ならtrue
      return ['image/jpeg', 'image/png'].includes(file.type);
    }),
});
