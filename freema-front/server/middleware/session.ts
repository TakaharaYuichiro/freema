const sessionStore = new Map<string, any>() // 簡易メモリセッション

export default defineEventHandler(async (event) => {
  const cookie = parseCookies(event)
  let sessionId = cookie.session_id

  // セッションがなければ作成
  if (!sessionId || !sessionStore.has(sessionId)) {
    sessionId = crypto.randomUUID()
    setCookie(event, 'session_id', sessionId, { httpOnly: true })
    sessionStore.set(sessionId, {})
  }

  // セッションデータを context に格納
  event.context.session = sessionStore.get(sessionId)
})
