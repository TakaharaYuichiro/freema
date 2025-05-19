# カテゴリデータ削除

登録済みカテゴリデータに対して、idを指定してデータを削除します。

**URL** : `/api/category/{id}/`

**メソッド** : `DELETE`

**認証** : 必須

**権限** : (権限なし)

**ヘッダー制約**
Firebase認証トークンとLaravelのCSRFトークンを含めてください。

```json
{
    "Authorization": `Bearer ${idToken}`, // Firebase認証トークン
    "X-XSRF-TOKEN": csrfToken || "", // LaravelのCSRFトークン
    "Content-Type": "application/json",
}
```

## 成功レスポンス

**条件** : データの削除が正常に完了。

**コード** : `200 OK`

**戻り値の例** :

```json
{
    "message": "Updated successfully"
}
```

## エラーレスポンス

**条件** : 適切なidが指定されていない。

**コード** : `404 Not Found`

**戻り値の例** :

```json
{
    "error": "Resource not found"
}
```
