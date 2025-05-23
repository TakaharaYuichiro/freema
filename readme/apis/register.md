# 会員登録

DBに会員情報を登録します。なお、この処理では「仮登録」となり、「本登録」のためにはメール確認の処理が必要です。

---

**URL** : `/api/register/`

**メソッド** : `POST`

**認証** : 不要

**権限** : 不要

**データ制約** :

```json
{
  "name": "ユーザー名", 
  "email": "test@test.com",
  "password": "password",
  "password_confirmation": "password"
}
```

- name：必須、文字列型
- email：必須、メールアドレス、重複不可
- password：必須、8文字以上、password_confirmation と一致すること
- password_confirmation：password と同じ値

---

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
