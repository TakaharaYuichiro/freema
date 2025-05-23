import * as yup from 'yup';

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('お名前を入力してください')
    .max(255, 'お名前は255文字以内で入力してください'),
  email: yup
    .string()
    .required('メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください')
    .max(255, 'メールアドレスは255文字以内で入力してください'),
  password: yup
    .string()
    .required('パスワードを入力してください')
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(255, 'パスワードは255文字以内で入力してください'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'パスワードと一致しません')
    .required('パスワード確認は必須です'),
});
