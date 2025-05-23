import * as yup from 'yup';

export interface LoginFormValues {
  email: string;
  password: string;
}

export const loginSchema = yup.object({
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
});