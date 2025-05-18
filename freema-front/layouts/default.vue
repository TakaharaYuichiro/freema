<template>
  <div>
    <div class="header">
      <div class="header__inner">
        <div class="header__logo">
          <button class="logo-button" @click="handleGotoHome" title="ホーム画面へ">
            <img class="logo" src="/images/defaultImages/logo.svg" />
          </button>
        </div>
        <div class="header__search" v-if="showSearchBar">
          <input v-model="search.keyword" type="text" placeholder="何をお探しですか？" @keyup.enter="handleSearch">
        </div>
        <client-only>
          <div class="header__user" v-if="showLoginInfo">
            <template v-if="auth.user">
              <div class="header__user__name">
                <span>ようこそ、{{ auth.user.name }}さん</span>
              </div>
              <div class="header__user__button-container">
                <button class="header__user__button" @click="handleLogout" data-testid="logout-button">ログアウト</button>
                <button class="header__user__button" @click="handleMypage">マイページ</button>
                <button class="header__user__button" @click="handleListing">出品</button>
              </div>
            </template>
            <template v-else>
              <div class="header__user__name">
                <span>ログインしていません</span>
              </div>
              <div class="header__user__button-container">
                <button class="header__user__button" @click="handleLogin">ログイン</button>
              </div>
            </template>
          </div>
        </client-only>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useSearchStore } from '@/stores/search'
import { useAuthStore } from "@/stores/auth";
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const search = useSearchStore()
const auth = useAuthStore();
const router = useRouter();
const route = useRoute()

const noLoginInfoPages = ['/login', '/register', '/verify-info', '/verify-email']; // ログイン情報(ヘッダー右側)を表示しないページのパス一覧
const useSearchBarPases = ['/', '/mypage'];   // 検索バー(ヘッダー中央)を表示するページのパス一覧

const showLoginInfo = computed(() => {
  return !noLoginInfoPages.includes(route.path)
})
const showSearchBar = computed(() => {
  return useSearchBarPases.includes(route.path)
})

const handleLogout = () => {
  auth.logout();
  router.push("/login"); // ログアウト後ログインページに遷移
};

const handleLogin = async () => {
  router.push("/login");
};

const handleListing = () => {
  router.push("/listing");
}

const handleMypage = () => {
  router.push("/mypage");
}

const handleGotoHome = () => {
  router.push("/");
}

const handleSearch = () => {
  search.doSearch();
}
</script>

<style>
body {
  margin: 0;
  /* font-family: 'Meiryo', "ヒラギノ角ゴ Pro W3", "ＭＳ Ｐゴシック", "Osaka", sans-serif; */
  font-family: 'Inter', sans-serif;
  font-weight: normal;
}

::placeholder {
  color: #aaa;
}

.header {
  background: #000;
  min-height: 60px;
  display: flex;
  align-items: center;
  width: 100%;
}

.header__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.header__logo {
  padding: 5px 15px;
  height: 100%;
  display: flex;
  align-items: center;
}

.logo-button {
  border: none;
  background: transparent;
}

.logo-button:hover {
  background: #aaa;
}

.logo {
  height: 22px;
  pointer-events: none;
}

.header__search {
  flex-grow: 1;
  padding: 5px 0;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
}

.header__search input {
  width: 100%;
  height: 24px;

  border-radius: 3px;
}

.header__user {
  display: flex;
  flex-flow: column;
  color: #fff;
  height: 50px;
}

.header__user__name {
  text-align: right;
  font-size: smaller;
  height: 20px;
  padding-right: 10px;
  padding-left: 10px;
}

.header__user__button-container {
  display: flex;
  align-items: center;
  justify-content: end;
  height: 30px;
  gap: 2px;
  padding-right: 10px;
  padding-left: 10px;
}

.header__user__button {
  padding: 0;
  width: 70px;
  height: 25px;
  border: none;
  background: #333;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: x-small;
  white-space: nowrap;
}

.header__user__button:hover {
  background: #aaa;
}

/* safariにおけるselectの表示調整 */
select {
  -moz-appearance: none;
  -webkit-appearance: none;
}

/* =================================== */
/* レスポンシブデザイン対応 */
/* =================================== */
@media screen and (max-width: 600px) {
  .header__inner {
    display: block;
    justify-content: space-between;
    height: auto;
  }

  .header__logo {
    height: auto;
  }

  .header__user {
    flex-flow: row;
    height: 30px;
  }

  .header__user__name {
    text-align: left;
    white-space: nowrap;
    width: auto;
    height: 25px;
    padding-left: 10px;
    display: flex;
    align-items: center;
  }

  .header__user__button-container {
    display: flex;
    align-items: center;
    justify-content: end;
    height: 25px;
    padding-right: 0px;
  }
}
</style>