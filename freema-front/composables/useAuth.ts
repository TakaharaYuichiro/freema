import { ref } from 'vue';
import { useApi } from '@/utils/api'
import { useAuthStore } from '@/stores/auth';

export default function useAuth() {
  const api = useApi();
  const user = ref(null);
  const error = ref(null);
  const auth = useAuthStore();

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    error.value = null;
    // まずログアウトする（Sanctum のトークンもクリア）
    auth.logout();
    try {
      const res = await api.post('/register', { name, email, password, password_confirmation });
      auth.login(res.data.token, null); // Pinia + localStorageに保存。まだ仮登録なのでユーザー情報(第2引数)はnullにしておく
      return true;
    } catch (e) {

      console.error('仮登録に失敗しました');
      return false;
    }
  };

  const verifyEmail = async (id: string, hash: string, expires: string, signature: string, token: string) => {
    try {
      const response = await api.get(`/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (e) {
      handleError(e);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<number> => {
    error.value = null;

    // まずログアウトする（Sanctum のトークンもクリア）
    auth.logout();

    try {
      const response = await api.post('/login', { email, password });
      const token = response.data.access_token;
      const user = response.data.user;

      if (!user?.email_verified_at) {
        auth.login(token, null); // Pinia + localStorageに保存。まだ仮登録なのでユーザー情報(第2引数)はnullにしておく
        return -1;
      }

      auth.login(token, user);
      return 1;
    } catch (e) {
      return 0;
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/logout"); // Laravel側のトークン削除エンドポイント
      localStorage.removeItem("token"); // トークンを削除
      delete api.defaults.headers.common["Authorization"]; // Axios のヘッダーも削除
    } catch (e) {
      console.error("ログアウトエラー:", e);
    }
  };

  const get = async (url: string, params?: any) => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (e) {
      handleError(e);
    }
  };

  // const post = async (url: string, data?: any) => {
  //   try {
  //     const response = await api.post(url, data);
  //     return response.data;
  //   } catch (e) {
  //     handleError(e);
  //   }
  // };
  const post = async (url: string, data?: any) => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (e) {
      handleError(e); // ログなど必要なら残す
      throw e; // ←★ これが重要！
    }
  };

  const put = async (url: string, data?: any) => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (e) {
      handleError(e);
    }
  };

  const del = async (url: string) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (e) {
      handleError(e);
    }
  };

  // エラーハンドリング
  const handleError = (e: any) => {
    console.error('APIエラー:', e);
    error.value = e.response?.data || e.message || '不明なエラー';
  };

  return {
    user,
    register,
    verifyEmail,
    login,
    logout,
    get,
    post,
    put,
    del,
    error,
  };
}
