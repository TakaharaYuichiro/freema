# カテゴリデータ更新

登録済みカテゴリデータに対して、idを指定してデータを更新します。

**URL** : `/api/category/{id}/`

**メソッド** : `PUT`

**認証** : 必須

**権限** : (権限なし)

**データ制約** :

```json
{
  "user_id": 1, // 必須、整数型
  "category_id": 1, // 整数型、nullの場合は「カテゴリなし」
  "content": "カテゴリの内容" // 必須、文字列型、1〜191文字
}
```

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

**条件** : データの更新が正常に完了。

**コード** : `200 OK`

**戻り値の例** :

```json
{
    "message": "Updated successfully"
}
```

## エラーレスポンス

**条件** : データ更新に失敗。例）category_idが登録されていない、など。

**コード** : `400 BAD REQUEST`

**戻り値の例** :

```json
{
    "error": "Resource not found"
}
```

**条件** : 適切なidが指定されていない。

**コード** : `404 Not Found`

**戻り値の例** :

```json
{
    "error": "Resource not found"
}
```
