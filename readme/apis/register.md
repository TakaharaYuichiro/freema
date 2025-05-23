# 会員登録

DBに会員情報を登録します。なお、この処理では「仮登録」となり、「本登録」のためにはメール確認の処理が必要です。

**URL** : `/api/register/`

**メソッド** : `POST`

**認証** : 不要

**権限** : (権限なし)

**データ制約** :

```json
{
  "name": "ユーザー名", // 必須、文字列型
  "email": "test@test.com", //必須, メールアドレス、重複不可
  "password": "password", // 必須、文字列型、最低8文字、password_confirmationと一致していることが必要
  "password_confirmation": "password"
}
```

**ヘッダー制約** : なし

## 成功レスポンス

**条件** : データの登録が正常に完了。

**コード** : `201 OK`

**戻り値の例** :

```json
{
    "message": "ユーザーを仮登録しました。確認メールをご確認ください。",
    "token": "xxxxx"
}
```

## エラーレスポンス

**条件** : データ登録に失敗。例）emailが登録済み、データ不整合、など。

**コード** : `422 Unprocessable Content`

**戻り値の例** :

```json
{
    "error": {
        "message": "Validation failed",
        "code": "VALIDATION_FAILED",
        "status": 422,
        "errors": {
            "email": [
                "指定のemailは既に使用されています。"
            ]
        }
    }
}
```
