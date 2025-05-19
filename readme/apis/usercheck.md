# ユーザーチェック

Firebaseの認証トークンを検証して現在のユーザーのログイン状況を確認した上で、登録されているユーザーIDとユーザー名を取得します。

**URL** : `/api/usercheck`

**メソッド** : `GET`

**認証** : 必須

**権限** : (権限なし)

**ヘッダー制約** :
Firebase認証トークンを含めてください。

```json
{
  "Authorization": `Bearer ${idToken}`, // Firebase認証トークン
  "Content-Type": "application/json",
}
```

## 成功レスポンス

**コード** : `200 OK`

**戻り値の例** :

```json
{
  "id": 10,
  "name": "テストネーム1"
}
```

## エラーレスポンス

**条件** : 適切なidTokenが指定されていない。

**コード** : `404 Not Found`

**戻り値の例** :

```json
{
    "error": "Resource not found"
}
```
