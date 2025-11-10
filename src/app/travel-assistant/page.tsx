'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Send, Upload, Loader, X } from 'lucide-react';
import { getAuth } from '@/lib/auth';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

const SYSTEM_PROMPT = `Bạn là Trợ lý ảo Trippio - một chuyên gia du lịch thông minh giúp khách hàng lên kế hoạch chuyến đi hoàn hảo.

## Thông tin về dịch vụ Trippio:

### Available APIs:
1. **Hotels** - GET /api/Hotel → Danh sách tất cả khách sạn
2. **Rooms** - GET /api/Room → Danh sách tất cả phòng khách sạn
3. **Shows/Entertainment** - GET /api/Show → Danh sách các điểm vui chơi, sự kiện
4. **Transport** - GET /api/Transport → Danh sách phương tiện vận chuyển
5. **Transport Trips** - GET /api/TransportTrip → Danh sách tất cả chuyến đi
   - GET /api/TransportTrip/available → Danh sách chuyến đi khả dụng

## Hướng dẫn tương tác:

### Khi khách hỏi chung chung:
- Chủ động hỏi thêm: 
  - 📍 Địa điểm muốn đi (thành phố/vùng)
  - 📅 Thời gian du lịch (ngày bao nhiêu người)
  - 👥 Số lượng người đi
  - 💰 Ngân sách dự tính
  - ❤️ Sở thích (biển, núi, thành phố, ẩm thực, vui chơi, nghỉ dưỡng...)
  - 🎯 Loại hình du lịch (nhóm bạn, gia đình, cặp đôi, độc hành...)

### Khi phân tích và gợi ý:
- 🏨 **Khách sạn & Phòng**: Gợi ý dựa trên ngân sách, vị trí, tiện ích
- ✈️ **Phương tiện**: Tư vấn xe bus, máy bay dựa trên:
  - Khoảng cách & thời gian hành trình
  - Thời tiết hôm đó
  - Ngân sách & sở thích
  - Tính chất chuyến đi
- 🎭 **Điểm vui chơi**: Đề xuất dựa trên sở thích, thời gian, giá vé
- 📸 **Phân tích ảnh**: Khi khách gửi ảnh du lịch, hãy:
  - Nhận dạng địa điểm
  - Gợi ý nơi liên quan
  - Tư vấn hành trình tối ưu

### Gợi ý địa điểm:
- Phân tích thời tiết, mùa du lịch
- Khoảng cách từ các địa điểm khác
- Chi phí trung bình
- Hoạt động phù hợp
- Nên đi vào thời gian nào trong năm

### Tính tiền:
- Tính toán chi phí dựa trên thông tin đã gợi ý
- So sánh các lựa chọn
- Tối ưu hóa ngân sách

## Tính cách:
- Thân thiện, nhiệt tình, chuyên nghiệp
- Luôn sẵn sàng nghe và hiểu nhu cầu của khách
- Gợi ý cụ thể, chi tiết, có lý do rõ ràng
- Khi có thắc mắc → Hỏi lại để hiểu rõ hơn
- Luôn đề xuất các lựa chọn khác nhau theo mức giá
`;

type Msg = { role: 'user' | 'assistant'; content: string; image?: string };

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/* Markdown renderers */
type CodeRendererProps = React.HTMLAttributes<HTMLElement> & {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode;
};
type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  children?: React.ReactNode;
};
type ThProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
};
type TdProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  children?: React.ReactNode;
};

const CodeRenderer = ({ inline, className, children, ...props }: CodeRendererProps) => {
  if (inline) {
    return (
      <code className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[0.9em] text-cyan-200" {...props}>
        {children}
      </code>
    );
  }
  return (
    <pre className="overflow-x-auto rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-4 text-[0.9em] leading-relaxed">
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
};

const ARenderer = ({ children, ...props }: AnchorProps) => (
  <a
    className="text-cyan-300 underline decoration-cyan-400 underline-offset-2 hover:text-cyan-200"
    target="_blank"
    rel="noreferrer"
    {...props}
  >
    {children}
  </a>
);

const TableRenderer = ({ children, ...props }: TableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse text-sm" {...props}>
      {children}
    </table>
  </div>
);

const ThRenderer = ({ children, ...props }: ThProps) => (
  <th
    className="border-b border-cyan-500/30 bg-cyan-900/30 px-3 py-2 text-left font-semibold text-cyan-200"
    {...props}
  >
    {children}
  </th>
);

const TdRenderer = ({ children, ...props }: TdProps) => (
  <td className="border-b border-cyan-500/20 px-3 py-2 align-top" {...props}>
    {children}
  </td>
);

const MD_COMPONENTS = {
  code: CodeRenderer,
  a: ARenderer,
  table: TableRenderer,
  th: ThRenderer,
  td: TdRenderer,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* no-op */
        }
      }}
      title="Copy"
      className="rounded-lg border border-cyan-500/50 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-900/30 active:scale-95"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className={classNames(
        'flex w-full gap-3 items-start',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="mt-1 grid h-8 w-8 shrink-0 select-none place-items-center rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 text-white font-bold text-sm">
          AI
        </div>
      )}
      <div
        className={classNames(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg',
          isUser
            ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white'
            : 'bg-cyan-950/40 text-cyan-100 border border-cyan-500/30 backdrop-blur'
        )}
      >
        {/* Show image if exists */}
        {msg.image && (
          <img
            src={msg.image}
            alt="message-image"
            className="mb-2 max-w-full rounded-lg max-h-64 object-cover"
          />
        )}
        <div
          className={classNames(
            'prose prose-invert max-w-none text-sm prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-ol:my-2 prose-pre:my-2 prose-headings:my-2'
          )}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {msg.content}
          </ReactMarkdown>
        </div>
        <div
          className={classNames(
            'mt-2 flex items-center gap-2',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <CopyButton text={msg.content} />
        </div>
      </div>
      {isUser && (
        <div className="mt-1 grid h-8 w-8 shrink-0 select-none place-items-center rounded-full bg-sky-600 text-white font-bold text-sm">
          U
        </div>
      )}
    </div>
  );
}

export default function TravelAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        '🤖 Xin chào! Tôi là **Trợ lý ảo Trippio** — chuyên gia gợi ý du lịch thông minh của bạn!\n\n📍 Tôi có thể giúp bạn:\n- 🏨 Tìm kiếm khách sạn, phòng phù hợp\n- ✈️ Gợi ý chuyến bay và phương tiện\n- 🎭 Khám phá các điểm vui chơi, sự kiện\n- 📸 Phân tích hình ảnh du lịch bạn gửi\n- 🗺️ Gợi ý địa điểm du lịch hấp dẫn\n\nHãy nhập tin nhắn hoặc tải lên hình ảnh để bắt đầu!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [input, resize]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;

    let userMsg = text;
    if (uploadedFile) {
      userMsg = text || '📸 Tôi vừa gửi một hình ảnh!';
    }

    // Create message object with image if exists
    const userMessageObj: Msg = {
      role: 'user',
      content: userMsg,
      ...(uploadedImage && { image: uploadedImage }),
    };

    setMessages((s) => [...s, userMessageObj, { role: 'assistant', content: '' }]);
    setInput('');
    setUploadedImage(null);
    setUploadedFile(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API Key không được cấu hình');
      }

      // Prepare Gemini request body
      const contents: any[] = [];

      // Build conversation history
      for (const msg of messages) {
        if (msg.role === 'user') {
          const parts: any[] = [{ text: msg.content }];
          if (msg.image) {
            const base64 = msg.image.split(',')[1];
            const mimeType = msg.image.split(';')[0].split(':')[1];
            parts.unshift({
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64,
              },
            });
          }
          contents.push({
            role: 'user',
            parts,
          });
        } else {
          contents.push({
            role: 'model',
            parts: [{ text: msg.content }],
          });
        }
      }

      // Add current message
      const currentParts: any[] = [{ text }];
      if (uploadedFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(uploadedFile);
        });
        const mimeType = uploadedFile.type;
        currentParts.unshift({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: base64,
          },
        });
      }

      contents.push({
        role: 'user',
        parts: currentParts,
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 64,
            },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Xin lỗi, tôi không thể xử lý yêu cầu này.';

      setMessages((s) => {
        const next = [...s];
        const last = next[next.length - 1];
        if (last?.role === 'assistant') {
          next[next.length - 1] = { ...last, content: reply };
        }
        return next;
      });
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        console.error('Travel chat error:', e);
        setMessages((s) => {
          const next = [...s];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') {
            next[next.length - 1] = {
              ...last,
              content:
                'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Hãy thử lại hoặc nhập câu hỏi đơn giản hơn nhé! 😊',
            };
          }
          return next;
        });
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, loading, messages, uploadedFile, uploadedImage]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(1400px_700px_at_70%_-10%,#ffb2c8_15%,transparent_60%),radial-gradient(900px_500px_at_20%_0%,#fde68a_10%,transparent_50%),linear-gradient(180deg,#0ea5e9_10%,#06b6d4_30%,#14b8a6_50%,#0ea5e9_85%)] p-4 md:p-6 relative overflow-hidden">
      {/* Background grid + noise effect (matching homepage) */}
      <div className="fixed inset-0 [background:linear-gradient(transparent_23px,rgba(255,255,255,.04)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,.04)_24px)] [background-size:24px_24px] mix-blend-overlay pointer-events-none" />
      <div className="fixed inset-0 opacity-20 mix-blend-overlay pointer-events-none [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 opacity=%220.02%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/homepage"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors backdrop-blur-sm bg-white/5 rounded-lg p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">🤖 Trợ lý ảo Trippio</h1>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-white/80 drop-shadow-md font-medium">
            Chuyên gia gợi ý du lịch thông minh • Phân tích ảnh • Tìm kiếm địa điểm
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[70vh] md:h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/5 to-cyan-900/10">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            <div ref={endRef} />
          </div>

          {/* Image Preview */}
          {uploadedImage && (
            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 border-t border-white/30 backdrop-blur-sm">
              <img
                src={uploadedImage}
                alt="preview"
                className="h-16 w-16 rounded-lg object-cover border border-white/30"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{uploadedFile?.name}</p>
              </div>
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setUploadedFile(null);
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/30 text-red-200 transition-colors hover:text-red-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="flex flex-col gap-3 border-t border-white/30 p-4 bg-white/10 backdrop-blur-sm">
            <div className="flex items-end gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Nhập câu hỏi (Shift+Enter xuống dòng)..."
                  rows={1}
                  className="min-h-10 max-h-24 flex-1 resize-none rounded-lg bg-white/20 border border-white/40 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm"
                />
              </div>
              {loading ? (
                <button
                  onClick={() => abortRef.current?.abort()}
                  className="rounded-lg bg-red-500/40 hover:bg-red-500/60 px-4 py-2 font-semibold text-red-100 border border-red-400/50 transition-colors inline-flex items-center gap-2 whitespace-nowrap backdrop-blur-sm"
                >
                  <X className="h-4 w-4" /> Dừng
                </button>
              ) : (
                <button
                  onClick={send}
                  disabled={!input.trim() && !uploadedFile}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 disabled:from-cyan-600/50 disabled:to-sky-700/50 disabled:cursor-not-allowed px-4 py-2 font-semibold text-white transition-all inline-flex items-center gap-2 whitespace-nowrap backdrop-blur-sm shadow-lg"
                >
                  <Send className="h-4 w-4" /> Gửi
                </button>
              )}
            </div>

            {/* Image Upload */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition-colors text-sm font-medium">
                <Upload className="h-4 w-4" />
                <span>Tải ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <span className="text-xs text-white/60">
                Tải ảnh phong cảnh, du lịch để tôi phân tích
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/70 text-xs drop-shadow-md">
          <p>💡 Gợi ý: Hãy gửi ảnh du lịch hoặc đặt câu hỏi về khách sạn, tour, địa điểm</p>
        </div>
      </div>
    </div>
  );
}
