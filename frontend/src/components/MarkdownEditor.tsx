import { useRef, useState, type ClipboardEvent } from "react"
import { uploadImageAPI } from "../api/uploads"
import MarkdownContent from "./MarkdownContent"

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export default function MarkdownEditor({ value, onChange, placeholder = "Write with Markdown...", rows = 7 }: Props) {
  const [preview, setPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const textarea = useRef<HTMLTextAreaElement>(null)

  async function upload(file: File) {
    setError("")
    setUploading(true)
    const start = textarea.current?.selectionStart ?? value.length
    const end = textarea.current?.selectionEnd ?? value.length
    try {
      const result = await uploadImageAPI(file)
      const alt = file.name.replace(/\.[^.]+$/, "") || "image"
      const markdown = `![${alt}](${result.url})`
      const spacerBefore = start > 0 && value[start - 1] !== "\n" ? "\n" : ""
      const spacerAfter = end < value.length && value[end] !== "\n" ? "\n" : ""
      onChange(value.slice(0, start) + spacerBefore + markdown + spacerAfter + value.slice(end))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const image = [...event.clipboardData.files].find((file) => file.type.startsWith("image/"))
    if (image) {
      event.preventDefault()
      void upload(image)
    }
  }

  return (
    <div className="editor">
      <div className="editor-tabs">
        <button type="button" className={!preview ? "active" : ""} onClick={() => setPreview(false)}>Write</button>
        <button type="button" className={preview ? "active" : ""} onClick={() => setPreview(true)}>Preview</button>
        <label className="upload-button">
          {uploading ? "Uploading..." : "+ Image"}
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" disabled={uploading} onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
            event.target.value = ""
          }} />
        </label>
      </div>
      {preview ? (
        <div className="editor-preview"><MarkdownContent value={value} empty="Nothing to preview." /></div>
      ) : (
        <textarea ref={textarea} name="markdown" value={value} rows={rows} placeholder={placeholder} onPaste={onPaste} onChange={(event) => onChange(event.target.value)} />
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
