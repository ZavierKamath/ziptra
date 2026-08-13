import { request } from "./helpers"

type Upload = { filename: string; url: string; mimeType: string; size: number }

export async function uploadImageAPI(file: File) {
  const form = new FormData()
  form.append("image", file)
  return (await request<{ upload: Upload }>("/api/uploads", { method: "POST", body: form })).upload
}
