import * as yup from 'yup';

export interface SellFormValues {
  productName: string;
  productPrice: number;
  conditionIndex: number;
  productImage: File | null;
  selectedCategoryIds: number[];
}

export const sellSchema = yup.object({
  productName: yup.string().min(3, '商品名は3文字以上必要です').required('商品名は必須です'),
  productPrice: yup.number().typeError("数値を入力してください").min(0, "0以上の整数を入力してください").integer("整数を入力してください"),
  conditionIndex: yup.number().min(1, '状態を選択してください'),
  productImage: yup
    .mixed<File>()
    .required('商品画像は必須です')
    .test('fileType', 'JPEGまたはPNG形式の画像をアップロードしてください', (file) => {
      return file && ['image/jpeg', 'image/png'].includes(file.type);
    }),
  selectedCategoryIds: yup
    .array()
    .of(yup.number())
    .min(1, 'カテゴリーを最低1つ選択してください'), 
});
