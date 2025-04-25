// stores/auth.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    lastLogin: null as string | null,
    user: null as any,
  }),

  actions: {
    login(token: string, user: any) {
      this.token = token;
      this.lastLogin = new Date().toISOString();
      this.user = user;
    
      localStorage.setItem('auth_token', token);
      localStorage.setItem('last_login', this.lastLogin);
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    },

    logout() {
      this.token = null;
      this.lastLogin = null;
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('last_login');
      localStorage.removeItem('auth_user');
    },

    // loadFromStorage() {
    //   try {
    //     this.token = localStorage.getItem('auth_token');
    //     this.lastLogin = localStorage.getItem('last_login');
    
    //     const userRaw = localStorage.getItem('auth_user');
    //     if (userRaw && userRaw !== 'undefined') {
    //       this.user = JSON.parse(userRaw);
    //     } else {
    //       this.user = null;
    //     }
    //   } catch (error) {
    //     console.error('auth_store loadFromStorage error:', error);
    
    //     // ローカルストレージを安全にクリア
    //     this.token = null;
    //     this.lastLogin = null;
    //     this.user = null;
    //     localStorage.removeItem('auth_token');
    //     localStorage.removeItem('last_login');
    //     localStorage.removeItem('auth_user');
    //   }
    // },

    loadFromStorage() {
      if (!process.client) return;
    
      try {
        this.token = localStorage.getItem('auth_token');
        this.lastLogin = localStorage.getItem('last_login');
    
        const userRaw = localStorage.getItem('auth_user');
        if (userRaw && userRaw !== 'undefined') {
          this.user = JSON.parse(userRaw);
        } else {
          this.user = null;
        }
      } catch (error) {
        console.error('auth_store loadFromStorage error:', error);
        this.token = null;
        this.lastLogin = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('last_login');
        localStorage.removeItem('auth_user');
      }
    },

    updateUser(data: Partial<any>) {
      this.user = { ...this.user, ...data };
      localStorage.setItem('auth_user', JSON.stringify(this.user));
    },
  },
});
