export default defineNuxtRouteMiddleware((to) => {
  // 以下のパスはミドルウェア適用外にする
  const publicPaths = ['/login', '/register', '/verify-info', '/verify-email'];
  if (publicPaths.some(path => to.path.startsWith(path))) return;
  
  if (process.client) {
    const auth = useAuthStore();

    try {
      auth.loadFromStorage();
    } catch (error) {
      console.error('auth middleware load error:', error);
      auth.logout(); // 壊れた状態を初期化
      return navigateTo('/login');
    }

    if (!auth.token || !auth.lastLogin) {
      return navigateTo('/login');
    }

    const last = new Date(auth.lastLogin).getTime();
    const now = Date.now();
    const diffMin = (now - last) / 1000 / 60;

    if (diffMin > 120) {
      auth.logout();
      return navigateTo('/login');
    }
  }
});
