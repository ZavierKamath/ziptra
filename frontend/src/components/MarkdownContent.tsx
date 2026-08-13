import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"

export default function MarkdownContent({ value, empty = "No description." }: { value: string | null; empty?: string }) {
  if (!value) return <p className="text-sm text-text-muted">{empty}</p>
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{value}</ReactMarkdown>
    </div>
  )
}
