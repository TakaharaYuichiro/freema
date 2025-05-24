# coachtechフリマ SPA版

ある企業が開発した独自のフリマアプリです。商品の出品や購入を行うことができます。

|![sample image](readme/imgs/top_page.png)|
|:-:|

---

## アプリの概要

- 「実践学習ターム 模擬案件初級 フリマアプリ」の案件シートに記載の内容をベースに、バックエンドをLaravel、フロントエンドをNuxt.jsで構築してSPA化しました。

---

## アプリケーションURL

### バックエンド

- 開発環境(Laravel)：<http://localhost:8000/>
- phpMyAdmin：<http://localhost:8080>
- MailHog：<http://localhost:8025>

### フロントエンド

- 開発環境(Nuxt.js)：<http://localhost:3000/>

---

## 動作検証に必要なサイト

- Stripe : <https://stripe.com/>

---

## 他のリポジトリ

なし

---

## 使用技術(実行環境)

### バックエンド (Laravel)

- PHP 8.3.10
- Laravel 8.83.8
- MySQL 8.0.26

### フロントエンド (Nuxt.js)

- nuxt 3.15.4

---

## セットアップ手順

### Stripe APIキー取得

- 本アプリでは、商品購入時の「コンビニ決済」および「クレジットカード決済」に **Stripe** を利用しています。
- 事前に、以下の手順でStripeアカウントおよびAPIキーを取得し、コンビニ決済機能を有効化してください。

1. Stripe 公式サイト（<https://stripe.com/>）にアクセスし、ユーザー登録を行ってください。
2. ログイン後、Stripeのテスト環境で「開発者」→「APIキー」を選択して、以下の 2 種類のテスト用 API キーを取得してください。
   - **公開可能キー（例：`pk_test_xxxxx`）**
   - **シークレットキー（例：`sk_test_xxxxx`）**

    > ※ 取得したキーは、後述の `.env` ファイル設定時に使用するため、メモ帳などに控えておいてください。

3. 同じくStripeのテスト環境で、設定ボタン(歯車マーク)をクリックし、「決済」→「決済手段」→「コンビニ決済」と進み、コンビニ決済を有効にしてください。

### リポジトリのクローン作成

1. GitHubからリポジトリをクローンしてください。

    ``` bash
    git clone git@github.com:TakaharaYuichiro/freema.git
    ```

2. 以下は環境構築に関連する主要なディレクトリおよびファイル構成です。

        .
        ├── freema-back
        │   ├── docker-compose.yml
        │   └── src
        │       └── .env.example
        ├── freema-front
        │   └── .env.example

### バックエンドアプリ環境構築 (Dockerビルド、Laravel環境構築)

1. Docker Desktopを起動してください。

2. クローンしたプロジェクト内の `freema-back` ディレクトリに移動してください。

    ``` bash
    cd freema-back/
    ```

3. 以下のコマンドによりDockerをビルド・起動してください。

    ``` bash
    docker-compose up -d --build
    ```

    > MacのM1・M2チップのPCの場合、
    > `no matching manifest for linux/arm64/v8 in the manifest list entries`
    > というエラーが表示され、ビルドできない場合があります。
    > エラーが発生する場合は、docker-compose.ymlファイルの「mysql」内に「platform」の項目を追加で記載してください。
    >
    > ``` bash
    > mysql:
    >     platform: linux/x86_64 # ← この行を追加
    >     image: mysql:8.0.26
    >     environment:
    > ```

4. `freema-back/src` ディレクトリに移動してください。

    ``` bash
    cd src/
    ```

5. 「.env.example」をコピーし、コピーしたファイルの名称を「.env」に変更してください。

    ``` bash
    cp .env.example .env
    ```

6. .env ファイルを開き、最下部の sk_test_xxxxx を Stripe APIキーの<u>シークレットキー</u>に置き換えてください。

    ``` text
    STRIPE_SECRET_KEY=sk_test_xxxxx
    ```

    > APIキーはStripeの公式サイト(<https://stripe.com/>)の開発者ページから取得してください。
    > なお、同サイトで取得した<u>公開可能キー</u>(pk_test_xxxxx)は、フロントエンド側(Nuxt.js)の.envに記載してください。

7. freema-back に戻り、以下のコマンドで PHP コンテナにログインしてください。

    ``` bash
    cd ..
    docker-compose exec php bash
    ```

8. パッケージをインストールしてください。

    ``` bash
    composer install
    ```

9. アプリケーションキーを作成してください。

    ``` bash
    php artisan key:generate
    ```

10. マイグレーションを実行してください。

    ``` bash
    php artisan migrate
    ```

11. シーディングを実行してください。

    ``` bash
    php artisan db:seed
    ```

12. シンボリックリンクを作成してください。

    ``` bash
    php artisan storage:link
    ```

13. ダミーデータ画像をstorageにコピーしてください。

    ``` bash
    php artisan custom:copy-default-images
    ```

14. PHPコンテナからログアウトしてください。

    ``` bash
    exit
    ```

### フロントエンドアプリ環境構築 (Nuxt.js環境構築)

1. クローンしたプロジェクト内の `freema-front` ディレクトリに移動してください。

    ``` bash
    cd ..
    cd freema-front/
    ```

2. 「.env.example」ファイルをコピーし「.env」に名称を変更してください。

    ``` bash
    cp .env.example .env
    ```

3. .envファイルを開き、最下部の「pk_test_xxxxx」を、Stripe APIキーの<u>公開可能キー</u>に置き換えてください。

    ``` text
    NUXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx
    ```

    > APIキーはStripeの公式サイト(<https://stripe.com/>)の開発者ページから取得してください。
    > なお、同サイトで取得した<u>シークレットキー</u>(sk_test_xxxxx)は、バックエンド側(Laravel)の.envに記載してください。

4. 依存パッケージをインストールしてください（Yarn が必要です）。

    ``` bash
    yarn install
    ```

    > 依存パッケージのインストールには、以下のバージョンが推奨されます。
    >
    > - Node.js: >= 18.x
    > - Yarn: 1.22.x（Yarn 1.x 系）
    >
    > Yarn 2（Berry）は非対応です。必ず Yarn 1.x を使用してください。
    >
    > ※ 以下のコマンドでバージョンを確認できます。
    >
    > ```bash
    > node -v
    > yarn -v
    > ```

以上でセットアップは完了です。

---

## 動作テスト

### アプリ起動

1. `freema-front` ディレクトリに移動してください。
2. 以下のコマンドにより開発用サーバーを起動してください。

    ``` bash
    yarn dev
    ```

3. ブラウザでlocalhost:3000にアクセスしてください。

    ``` bash
    http://localhost:3000/
    ```

### ログイン方法

以下の方法によりログインしてください。

1. ホーム画面左上の「ログイン」をクリックして、ログイン画面に移動してください。

2. ログイン画面で、メールアドレス、パスワードを入力し、「ログイン」をクリックしてください。

    > - シーディングにより、以下のテスト用アカウントが登録されています。
    >
    >   |メールアドレス|パスワード|ユーザー名|
    >   |:---|:---|:---|
    >   |<test1@test.com>|test_pw1234|テストユーザー1|
    >   |<test2@test.com>|test_pw1234|テストユーザー2|
    >   |<test3@test.com>|test_pw1234|テストユーザー3|
    >
    > - なお、初期状態で登録されている10件のダミーの商品データに対して、下表のように出品したユーザーを設定しています。ホーム画面(商品一覧)には、そのユーザーが出品した商品は表示されないのでご注意ください。
    >
    >   |商品名|出品したユーザー|
    >   |:---|:---|
    >   |玉ねぎ3束, 革靴, ノートPC, マイク|テストユーザー1|
    >   |腕時計, HDD, ショルダーバッグ, タンブラー, コーヒーミル, メイクセット|テストユーザー2|

    > - 本アプリは、ログインしなくても、ゲストユーザーとして商品一覧および商品詳細ページを閲覧できます。
    > - ただし、ゲストユーザーではお気に入り登録や商品購入などの主要機能は使用できません。

### 新規会員登録方法

上記の登録済みのテスト用アカウント<u>以外</u>でテストする場合は、以下の方法により新規会員登録してください。

1. ゲストユーザーとしてログインせずにホーム画面にアクセスしている場合は、画面左上の「ログイン」をクリックしてください。また、すでにログインしている場合は、画面左上の「ログアウト」をクリックし、一旦ログアウトしてください。
2. ログイン画面の下部にある「会員登録はこちら」をクリックしてください。
3. 会員登録画面で名前とメールアドレス、パスワード、確認用パスワードを入力のうえ、「登録する」をクリックしてください。これにより、MailHogに確認メールが送信されます (この時点では会員登録は終了していません)。
4. ブラウザで別のタブを開き、localhost:8025にアクセスして、MailHogを起動してください。
5. MailHogに届いた「メールアドレス確認」のメールを開き、「メールアドレスを確認する」のボタンをクリックしてください (「メールアドレスを確認する」のボタンが表示されない場合は、URLリンクをクリックしてください)。
6. 会員登録が完了するとアプリにログインできます。

### 【注意事項】商品出品時の「販売価格」について

本アプリでは、商品購入時に、Stripeを利用した「コンビニ支払い」および「カード支払い」による決済が可能です。
Stripeの仕様上の制約により、決済可能な最低金額があります。
このため、商品購入画面において、下表に記載の最低金額未満の商品を購入することはできません。

  |決済方法|最低金額|
  |:---:|---:|
  |コンビニ支払い|120円|
  |カード払い|50円|

一方で、商品出品画面においては、設定可能な「販売価格」の最低金額を0円としています。
このため、販売価格を50円未満に設定すると、その商品は商品購入画面での決済ができなくなります。
動作検証の際には、商品購入のテストを考慮して、販売価格を少なくとも50円以上、好ましくは120円以上としてください。

---

## テストコード

- 本プロジェクトでは、**Vitest** を使用したユニットテストが用意されています。
- テストを実行するには、`freema-front` ディレクトリ内で以下のコマンドを実行してください。

    ```bash
    yarn test
    ```

- 実装済みのテストケースは以下のとおりです。

| No | テスト対象機能             | テストファイル名             |
|:--:|----------------------------|-------------------------------|
| 1  | 会員登録機能               | `register.spec.ts`           |
| 2  | ログイン機能               | `login.spec.ts`              |
| 3  | ログアウト機能             | `logout.spec.ts`             |
| 4  | 商品一覧取得               | `index.spec.ts`              |
| 5  | マイリスト一覧取得         | `index.spec.ts`              |
| 6  | 商品検索機能               | `index-search.spec.ts`       |
| 7  | 商品詳細情報取得           | `detail.spec.ts`             |
| 8  | いいね機能                 | `detail-favorite.spec.ts`    |
| 9  | コメント送信機能           | `detail-comment.spec.ts`     |
| 10 | 商品購入機能               | `purchase.spec.ts`           |
| 11 | 支払い方法選択機能         | `purchase-addition.spec.ts`  |
| 12 | 配送先変更機能             | `purchase-addition.spec.ts`  |
| 13 | ユーザー情報取得           | `mypage.spec.ts`             |
| 14 | ユーザー情報変更           | `mypage.spec.ts`             |
| 15 | 出品商品情報登録           | `sell.spec.ts`               |

> テストファイルは、`freema-front/tests/unit/pages/` ディレクトリ内に保存されています。

---

## 設計仕様

### テーブル設計

![TABLE SPECIFICATION](readme/imgs/table_users.png)
![TABLE SPECIFICATION](readme/imgs/table_products.png)
![TABLE SPECIFICATION](readme/imgs/table_purchases.png)
![TABLE SPECIFICATION](readme/imgs/table_categories.png)
![TABLE SPECIFICATION](readme/imgs/table_category_products.png)
![TABLE SPECIFICATION](readme/imgs/table_favorites.png)
![TABLE SPECIFICATION](readme/imgs/table_evaluations.png)

### ER図

![TABLE SPECIFICATION](readme/imgs/er_diagram.png)

### API仕様

#### 会員登録

会員情報を登録します。なお、この処理では「仮登録」となり、「本登録」のためにはメール確認の処理が必要です。

- [会員登録](readme/apis/register.md) : `POST /api/register`

#### 会員登録 本人確認

メールによる本人確認を行います。メールの送信や、DBの会員情報を「本登録」に変更する処理を実施します。

- [確認メール送信](readme/apis/verify_email/verification-notification.md) : `POST /api/email/verification-notification`
- [確認メールリンク認証](readme/apis/verify_email/verify.md) : `GET /api/email/verify/{id}/{hash}`
- [確認メール再送信](readme/apis/verify_email/resend.md) : `POST /api/email/resend`

#### ログイン

メールアドレスとパスワードを使ってログインします。

- [ログイン](readme/apis/login.md) : `POST /api/login`

#### ユーザーデータ処理

usersテーブルのデータ取得や登録などの操作をするためのエンドポイントです。

- [全てのデータ取得](readme/apis/users/index.md) : `GET /api/users`
- [データ登録](readme/apis/users/store.md) : `POST /api/users`
- [データ取得](readme/apis/users/show.md) : `GET /api/users/{id}`
- [データ更新](readme/apis/users/update.md) : `PUT /api/users/{id}`
- [データ削除](readme/apis/users/destroy.md) : `DELETE /api/users/{id}`

#### 商品データ処理

productsテーブルのデータ取得や登録などの操作をするためのエンドポイントです。

- [全てのデータ取得](readme/apis/products/index.md) : `GET /api/products`
- [データ登録](readme/apis/products/store.md) : `POST /api/products`
- [データ取得](readme/apis/products/show.md) : `GET /api/products/{id}`
- [データ更新](readme/apis/products/update.md) : `PUT /api/products/{id}`
- [データ削除](readme/apis/products/destroy.md) : `DELETE /api/products/{id}`

#### 商品購入データ処理

purchasesテーブルのデータ取得や登録などの操作をするためのエンドポイントです。

- [全てのデータ取得](readme/apis/purchases/index.md) : `GET /api/purchases`
- [データ登録](readme/apis/purchases/store.md) : `POST /api/purchases`
- [データ取得](readme/apis/purchases/show.md) : `GET /api/purchases/{id}`
- [データ更新](readme/apis/purchases/update.md) : `PUT /api/purchases/{id}`
- [データ削除](readme/apis/purchases/destroy.md) : `DELETE /api/purchases/{id}`

#### カテゴリデータ処理

categoriesテーブルのデータ取得や登録などの操作をするためのエンドポイントです。

- [全てのデータ取得](readme/apis/categories/index.md) : `GET /api/categories`
- [データ登録](readme/apis/categories/store.md) : `POST /api/categories`
- [データ取得](readme/apis/categories/show.md) : `GET /api/categories/{id}`
- [データ更新](readme/apis/categories/update.md) : `PUT /api/categories/{id}`
- [データ削除](readme/apis/categories/destroy.md) : `DELETE /api/categories/{id}`

#### 評価(コメント)データ処理

evaluationsテーブルのデータ取得や登録などの操作をするためのエンドポイントです。

- [全てのデータ取得](readme/apis/evaluations/index.md) : `GET /api/evaluations`
- [データ登録](readme/apis/evaluations/store.md) : `POST /api/evaluations`
- [データ取得](readme/apis/evaluations/show.md) : `GET /api/evaluations/{id}`
- [データ更新](readme/apis/evaluations/update.md) : `PUT /api/evaluations/{id}`
- [データ削除](readme/apis/evaluations/destroy.md) : `DELETE /api/evaluations/{id}`

#### カテゴリ-商品中間テーブルデータ処理

category-productsテーブル(categoriesとproductsの中間テーブル)にデータを登録します。

- [データ登録](readme/apis/category_products/store.md) : `POST /api/category-products`

#### お気に入りデータ評価処理

favoritesテーブルに関連するデータ処理を行います。

- [全てのデータ取得](readme/apis/favorites/get-favorites_index.md) : `GET /api/get-favorites`
- [データ取得](readme/apis/favorites/get-favorites_show.md) : `GET /api/get-favorites/{product_id}`
- [登録数カウント](readme/apis/favorites/count-favorites.md) : `GET /api/count-favorites/{product_id}`
- [お気に入り登録/解除](readme/apis/favorites/invert-favorites.md) : `POST /api/invert-favorite`

#### 画像アップロード処理

画像ファイルをアップロードします。

- [アップロード](readme/apis/upload-image.md) : `POST /api/upload-image`

以上
