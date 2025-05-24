# Evaluationデータ登録

新しいEvaluationデータを登録します。

---

**URL** : `/api/evaluations`

**メソッド** : `POST`

**認証** : 必須（`auth:sanctum`）

**権限** : 不要

**データ制約** :

```json
{
  "product_id": 1,
  "comment": "商品へのコメントや評価など",
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
