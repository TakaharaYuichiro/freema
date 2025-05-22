# coachtechフリマ SPA版

ある企業が開発した独自のフリマアプリです。アイテムの出品と購入を行うことができます。

|![sample image](readme/imgs/top_page.png)|
|:-:|

## アプリの概要

- 「実践学習ターム 模擬案件初級 フリマアプリ」の案件資料をベースに、バックエンドをLaravel、フロントエンドをNuxt.jsで構築してSPA化しました。

## アプリケーションURL

### バックエンド

- 開発環境(Laravel)：<http://localhost:8000/>
- phpMyAdmin：<http://localhost:8080>
- MailHog：<http://localhost:8025>

### フロントエンド

- 開発環境(Nuxt.js)：<http://localhost:3000/>

## 動作検証に必要なサイト

- Stripe : <https://stripe.com/>
  - 商品購入時の料金のコンビニ決済、および、カード決済のデモに使用します。
  - 上記のStripe公式サイトにてユーザー登録し、開発者ページにてStripe APIキー(公開可能キーとシークレットキー)を取得してください。

## 他のリポジトリ

なし

## 使用技術(実行環境)

### バックエンド (Laravel)

- PHP 8.3.10
- Laravel 8.83.8
- MySQL 8.0.26

### フロントエンド (Nuxt.js)

- nuxt 3.15.4

## セットアップ手順

### リポジトリのクローンを作成

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

2. クローンしたプロジェクト内の freema-back ディレクトリに移動してください。

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

4. freema-back/srcディレクトリに移動してください。

    ``` bash
    cd src/
    ```

5. 「.env.example」をコピーし、コピーしたファイルの名称を「.env」に変更してください。

    ``` bash
    cp .env.example .env
    ```

6. .env ファイルを開き、最下部の sk_test_xxxxx を Stripe の<u>シークレットキー</u>に置き換えてください。

    ``` text
    STRIPE_SECRET_KEY=sk_test_xxxxx
    ```

    > APIキーはStripeの公式サイト(<https://stripe.com/>)の開発者ページから取得してください。なお、同サイトで取得した<u>公開可能キー</u>(pk_test_xxxxx)は、フロントエンド側(Nuxt.js)の.envに記載してください。
    > また、バックエンド側の.envファイルにおいて、STRIPE_SECRET以外の環境変数は、「.env.example」に記載の内容から変更不要です。

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

1. クローンしたプロジェクト内の freema-front ディレクトリに移動してください。

    ``` bash
    cd freema-front/
    ```

2. 「.env.example」ファイルをコピーし「.env」に名称を変更してください。

    ``` bash
    cp .env.example .env
    ```

3. .envファイルを開き、一番下にある「pk_test_xxxxx」に、Stripe APIキーのうち<u>公開可能キー</u>を記載してください。

    ``` text
    NUXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxx
    ```

    > APIキーはStripeの公式サイト(<https://stripe.com/>)の開発者ページから取得してください。なお、同サイトで取得した<u>シークレットキー</u>(sk_test_xxxxx)は、バックエンド側(Laravel)の.envに記載してください。
    > また、フロントエンド側の.envファイルにおいて、NUXT_PUBLIC_STRIPE_PUBLIC_KEY以外の環境変数は、「.env.example」に記載の内容から変更不要です。

4. 依存パッケージをインストールしてください（yarn が必要です）。

    ``` bash
    yarn install
    ```

## テストケース

- vitestを使ったテストケースが用意されています。
- テストケースを実行するには、以下のコマンドを実行してください。
  
  ``` bash
    yarn test
  ```

- テストケースの内容は下表のとおりです。
  
    |内容|テストファイル名|
    |:---|:---|
    |1. 会員登録機能|register.spec.ts|
    |2. ログイン機能|login.spec.ts|
    |3. ログアウト機能|logout.spec.ts|
    |4. 商品一覧取得|index.spec.ts|
    |5. マイリスト一覧取得|index.spec.ts|
    |6. 商品検索機能|index-search.spec.ts|
    |7. 商品詳細情報取得|detail.spec.ts|
    |8. いいね機能|detail-favorite.spec.ts|
    |9. コメント送信機能|detail-comment.spec.ts|
    |10. 商品購入機能|purchase.spec.ts|
    |11. 支払い方法選択機能|purchase-addition.spec.ts|
    |12. 配送先変更機能|purchase-addition.spec.ts|
    |13. ユーザー情報取得、14. ユーザー情報変更|mypage.spec.ts|
    |15. 出品商品情報登録|sell.spec.ts|

  > テストファイルは、以下のディレクトリに保存されています。
  > freema-front/tests/unit/pages/

## 手動での動作検証方法

### テスト用アカウント

シーディングにより、以下のテスト用アカウントが登録されています。
テストする機能に応じていずれかのアカウントでログインしてください。

- 登録済みのテスト用アカウント一覧

    |Email|Password|ユーザー名|
    |:---|:---|:---|
    |<test1@test.com>|test_pw1234|テストユーザー1|
    |<test2@test.com>|test_pw1234|テストユーザー2|
    |<test3@test.com>|test_pw1234|テストユーザー3|

    > 本アプリは、ログインしなくても、ゲストユーザーとして商品一覧および商品詳細ページを閲覧できます。
    > ただし、ゲストユーザーではお気に入り登録、商品購入などの主要機能は使用できません。

### アプリ起動

1. freema-frontディレクトリに移動してください。
2. 以下のコマンドにより開発用サーバーを起動してください。

    ``` bash
    yarn dev
    ```

3. ブラウザでlocalhost:3000にアクセスしてください。

    ``` bash
    http://localhost:3000/
    ```

### ログイン方法

上記の登録済みのテスト用アカウントでテストする場合は、以下の方法によりログインしてください。

1. ログイン画面で、メールアドレス、パスワードを入力し、「ログイン」をクリックしてください。
2. アプリのホーム画面(商品一覧画面)が表示されます。

### 新規アカウント登録方法

上記の登録済みのテスト用アカウント<u>以外</u>でテストする場合は、以下の方法により会員登録してアカウントを新規作成してください。

1. ゲストユーザーとしてログインせずにホーム画面にアクセスしている場合は、画面左上の「ログイン」をクリックしてください。また、すでにログインしている場合は、画面左上の「ログアウト」をクリックし、一旦ログアウトしてください。
2. ログイン画面の下部にある「会員登録はこちら」をクリックしてください。

    ![sample image](readme_fig/ss_menu-to-registration.png)

3. 会員登録画面で名前とメールアドレス、パスワード、確認用パスワードを入力のうえ、会員登録画面で「登録する」をクリックすると、MailHogに確認メールが送信されます (この時点では会員登録は終了していません)。
4. ブラウザで別のタブを開き、localhost:8025にアクセスして、MailHogを起動してください。
5. MailHogに届いた「メールアドレス確認」のメールを開き、「メールアドレスを確認する」(もしくはURLリンク)をクリックしてください。
6. 会員登録が完了するとアプリにログインできます。

## API仕様

### ユーザー登録

Firebaseに登録したユーザーのuidと、その他のユーザー情報を紐づけるためのテーブルにデータを登録します。

- [ユーザー登録](readme/apis/register.md) : `POST /api/register`

### ユーザーデータ取得

DBに登録されているユーザーデータを取得します。

- [ユーザー一覧取得](readme/apis/users.md) : `GET /api/users/`
- [ユーザーチェック](readme/apis/usercheck.md) : `GET /api/usercheck/`

### ToDoデータ操作

ToDoデータの取得や登録などの操作をするためのエンドポイントです。

- [全てのデータ取得](readme/apis/todo/index.md) : `GET /api/todo/`
- [データ登録](readme/apis/todo/store.md) : `POST /api/todo/`
- [データ取得](readme/apis/todo/show.md) : `GET /api/todo/{id}/`
- [データ更新](readme/apis/todo/update.md) : `PUT /api/todo/{id}/`
- [データ削除](readme/apis/todo/destroy.md) : `DELETE /api/todo/{id}/`

### Categoryデータ操作

Categoryデータの取得や登録などの操作をするためのエンドポイントです。

- [全てのデータ取得](readme/apis/category/index.md) : `GET /api/category/`
- [データ登録](readme/apis/category/store.md) : `POST /api/category/`
- [データ取得](readme/apis/category/show.md) : `GET /api/category/{id}/`
- [データ更新](readme/apis/category/update.md) : `PUT /api/category/{id}/`
- [データ削除](readme/apis/category/destroy.md) : `DELETE /api/category/{id}/`

## テーブル設計

![TABLE SPECIFICATION](readme/imgs/table_users.png)
![TABLE SPECIFICATION](readme/imgs/table_products.png)

## ER図

![TABLE SPECIFICATION](readme/imgs/er_diagram.png)

以上
