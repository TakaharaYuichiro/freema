export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const purchaseId = body.purchaseId

  // セッションに保存
  event.context.session.purchaseId = purchaseId

  return { success: true }
})