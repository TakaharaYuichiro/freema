# ToDoデータ登録

新しいToDoデータを登録します。

**URL** : `/api/todo/`

**メソッド** : `POST`

**認証** : 必須

**権限** : (権限なし)

**データ制約** :

```json
{
  "user_id": 1, // 必須、整数型
  "category_id": 1, // 整数型、nullの場合は「カテゴリなし」
  "content": "ToDoの内容" // 必須、文字列型、1〜191文字
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

**条件** : データの登録が正常に完了。

**コード** : `201 OK`

**戻り値の例** :

```json
{
    "message": "Updated successfully"
}
```

## エラーレスポンス

**条件** : データ登録に失敗。例）データ制約不整合、など。

**コード** : `400 BAD REQUEST`

**戻り値の例** :

```json
{
    "error": "Resource not found"
}
```
