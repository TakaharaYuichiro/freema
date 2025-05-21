import * as yup from 'yup';

export interface CommentFormValues {
  comment: string;
}

export const commentSchema = yup.object({
  comment: yup.string().required('コメントを入力してください').max(255, 'コメントは255文字以内で入力してください')
});
