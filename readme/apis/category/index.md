# 全てのカテゴリデータ取得

現在登録されている全てのカテゴリデータを取得します。

**URL** : `/api/category/`

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
