import * as React from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { chatCatalog } from '@/server/modules/chatbot/chatbot-controller'
import { toast } from 'sonner'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatWidgetProps = {
  slug?: string
  userId?: string
  primaryColor?: string
}

const DEFAULT_GREETING: ChatMessage = {
  role: 'assistant',
  content: 'Halo! Tanyakan tentang produk di etalase ini.',
}

const CHAT_TEMPLATES = [
  'Ada produk apa saja di sini?',
  'Produk paling populer apa?',
  'Ada rekomendasi produk untuk hadiah?',
  'Berapa kisaran harga produk?',
  'Apakah ada produk dengan kategori tertentu?',
]

export function ChatWidget({ slug, userId, primaryColor }: ChatWidgetProps) {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    DEFAULT_GREETING,
  ])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    if (!slug && !userId) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await chatCatalog({
        data: {
          ...(slug ? { slug } : {}),
          ...(userId ? { user_id: userId } : {}),
          message: text,
          history: nextMessages
            .slice(1)
            .map(({ role, content }) => ({ role, content })),
        },
      })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.answer },
      ])
    } catch (error) {
      toast.error('Chatbot sedang bermasalah. Coba lagi ya.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="flex h-[420px] w-[320px] flex-col overflow-hidden rounded-2xl border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Chat Etalase</p>
              <p className="text-xs text-muted-foreground">
                Tanya tentang produk & brand
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                  style={
                    msg.role === 'user' && primaryColor
                      ? { backgroundColor: primaryColor }
                      : msg.role === 'user'
                        ? { backgroundColor: 'var(--primary)' }
                        : undefined
                  }
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Mengetik...
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="border-t px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                Template pertanyaan
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHAT_TEMPLATES.map((template) => (
                  <Button
                    key={template}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full px-3 text-xs"
                    disabled={loading}
                    style={
                      primaryColor
                        ? { borderColor: primaryColor, color: primaryColor }
                        : undefined
                    }
                    onClick={() => setInput(template)}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t px-3 py-2">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void handleSend()
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya produk..."
                disabled={loading}
                className="h-9"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                style={
                  primaryColor
                    ? { backgroundColor: primaryColor }
                    : undefined
                }
                aria-label="Kirim"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg"
          style={primaryColor ? { backgroundColor: primaryColor } : undefined}
          aria-label="Buka chat"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
