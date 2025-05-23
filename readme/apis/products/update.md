# Productデータ更新

登録済みProductデータに対して、指定した `id` に基づいて更新します。

---

**URL** : `/api/products/{id}`

**メソッド** : `PUT`

**認証** : 必須（`auth:sanctum`）

**権限** : 不要

**データ制約** :

```json
{
  "user_id": 2,
  "name": "腕時計",
  "brand": "",
  "price": 15000,
  "content": "スタイリッシュなデザインのメンズ腕時計",
  "img_filename": "defaultImages/Armani+Mens+Clock.jpg",
  "condition_index": 1
}
```

**ヘッダー制約** : `Authorization: Bearer {token}`  

---

## 成功レスポンス

**条件** : データの更新が正常に完了。

**コード** : `200 OK`

## エラーレスポンス

### 不正なデータ

**条件** : データ更新に失敗。例）データ制約不整合、など。

**コード** : `400 BAD REQUEST`

### 不正なid

**条件** : 適切なidが指定されていない。

**コード** : `404 Not Found`
