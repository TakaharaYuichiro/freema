# Purchaseデータ登録

新しいPurchaseデータを登録します。

---

**URL** : `/api/purchases`

**メソッド** : `POST`

**認証** : 必須（`auth:sanctum`）

**権限** : 不要

**データ制約** :

```json
{
  "product_id" : 1,
  "zipcode" : "123-4567",
  "address" : "東京都新宿区1-1-1",
  "building" : "テストビル101",
  "to_name" : "テストユーザー1",
  "method_index" : 1
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
