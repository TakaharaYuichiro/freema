# お気に入り登録数カウント

指定した `product_id` の商品に登録されているお気に入りの数を取得します。

---

**URL** : `/api/count-favorites/{product_id}`

**メソッド** : `GET`

**認証** : 必須（`auth:sanctum`）

**権限** : 不要

**データ制約** : なし

**ヘッダー制約** : `Authorization: Bearer {token}`  

---

## 成功レスポンス

### データ取得成功

**コード** : `200 OK`

## エラーレスポンス

### 不正なid

**条件** : 適切なidが指定されていない。

**コード** : `404 Not Found`
