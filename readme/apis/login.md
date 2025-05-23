# ログイン

メールアドレスとパスワードを使ってログインします。

---

**URL** : `/api/login/`

**メソッド** : `POST`

**認証** : 不要

**権限** : 不要

**データ制約** :

```json
{
  "email": "test@test.com",
  "password": "password",
}
```

- email：必須、メールアドレス
- password：必須

---

**ヘッダー制約** : なし

## 成功レスポンス

**条件** : 正常にログイン完了。

**コード** : `200 OK`

**戻り値の例** :

```json
{
    "access_token": "xxxxxxxxxx",
    "token_type": "Bearer",
    "user": {
        "id": 1,
        "name": "テストユーザー1",
        "email": "test1@test.com",
        "email_verified_at": "2025-05-19T04:57:26.000000Z",
        "zipcode": "123-4567",
        "address": "テスト住所",
        "building": null,
        "img_filename": "uploads/xxxxx.png",
        "created_at": "2025-05-19T04:57:26.000000Z",
        "updated_at": "2025-05-21T06:03:28.000000Z"
    }
}
```

## エラーレスポンス

**条件** : ログイン失敗。

**コード** : `401 Unauthorized`

**戻り値の例** :

```json
{
    "message": "Invalid credentials"
}
```
