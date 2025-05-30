# Userデータ更新

登録済みUserデータに対して、指定した `id` に基づいて更新します。

---

**URL** : `/api/users/{id}`

**メソッド** : `PUT`

**認証** : 必須（`auth:sanctum`）

**権限** : 不要

**データ制約** :

```json
{
  "name" : "テストユーザー1",
  "email" : "test1@test.com",
  "password" : "password",
  "zipcode" : "123-4567",
  "address" : "東京都新宿区1-1-1",
  "building" : "テストビル101"
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
