# 画像アップロード処理

画像ファイルをアップロードし、アップロード先のパスとURLを返します。

---

**URL** : `/api/upload-image`

**メソッド** : `POST`

**認証** : 必須（`auth:sanctum`）

**権限** : 不要

**ヘッダー制約** :
`Authorization: Bearer {token}`  
`Content-Type: multipart/form-data`

---

## リクエストパラメータ

| パラメータ名 | 必須 | 型     | 内容                         |
|--------------|------|--------|------------------------------|
| `image`      | 必須 | `file` | アップロードする画像（2MB以下） |

### 対応フォーマット

- jpg
- jpeg
- png
- gif
- webp など（Laravel `image` バリデーションに準拠）

---

## 成功レスポンス

### データ登録成功

**条件** : データの登録が正常に完了。

**コード** : `200 OK`

**戻り値の例** :

```json
{
  "url": "http://example.com/storage/images/uploads/example.jpg",
  "path": "uploads/example.jpg"
}
```

- url: 公開用のアクセスURL
- path: storage/app/public/images/ 以下の相対パス

## エラーレスポンス

### 不正なデータ

**条件** : アップロードに失敗。

**コード** : `422 Unprocessable Entity`
