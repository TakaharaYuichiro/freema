export default defineEventHandler((event) => {
  const session = event.context.session
  return session.purchaseId || null
})
