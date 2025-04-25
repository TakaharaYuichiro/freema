import { defineNuxtPlugin } from '#app'
import { defineRule, configure } from 'vee-validate'
import { required, email } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import ja from '@vee-validate/i18n/dist/locale/ja.json'

export default defineNuxtPlugin((nuxtApp) => {
  // ルールを定義
  defineRule('required', required)
  defineRule('email', email)

  // 日本語のバリデーションメッセージを設定
  configure({
    generateMessage: localize({
      ja
    }),
  })
})


