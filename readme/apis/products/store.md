# Productデータ登録

新しいProductデータを登録します。

---

**URL** : `/api/products`

**メソッド** : `POST`

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

### データ登録成功

**条件** : データの登録が正常に完了。

**コード** : `201 OK`

## エラーレスポンス

### 不正なデータ

**条件** : データ登録に失敗。例）データ制約不整合、など。

**コード** : `400 BAD REQUEST`
