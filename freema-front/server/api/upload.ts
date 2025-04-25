import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { IncomingMessage } from 'http'

// BodyParser を無効化
export const config = {
  api: {
    bodyParser: false,
  },
}

export default defineEventHandler(async (event) => {
  const req = event.node.req as IncomingMessage

  const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
  })

  const { fields, files }: { fields: formidable.Fields; files: formidable.Files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })

  // const uploadedFile = files.file as File | File[] | undefined

  // if (!uploadedFile || Array.isArray(uploadedFile)) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: '1ファイルのみアップロードしてください。',
  //   })
  // }

  const uploadedFileRaw = files.file
  let uploadedFile: File | undefined

  if (Array.isArray(uploadedFileRaw)) {
    if (uploadedFileRaw.length !== 1) {
      throw createError({ statusCode: 400, statusMessage: '1ファイルのみアップロードしてください。' })
    }
    uploadedFile = uploadedFileRaw[0]
  } else {
    uploadedFile = uploadedFileRaw
  }

  if (!uploadedFile) {
    throw createError({ statusCode: 400, statusMessage: 'ファイルが見つかりません' })
  }

  const fileUrl = `/uploads/${path.basename(uploadedFile.filepath)}`
  return { url: fileUrl }
})
