# ToDoデータ取得

登録済みToDoデータに対して、idを指定してデータを取得します。

**URL** : `/api/todo/{id}/`

**メソッド** : `GET`

**認証** : 必須

**権限** : (権限なし)

**ヘッダー制約**
Firebase認証トークンを含めてください。

```json
{
  "Authorization": `Bearer ${idToken}`, // Firebase認証トークン
  "Content-Type": "application/json",
}
```

## 成功レスポンス

**コード** : `200 OK`

## エラーレスポンス

**条件** : 適切なidが指定されていない。

**コード** : `404 Not Found`

**戻り値の例** :

```json
{
    "error": "Resource not found"
}
```
