'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Send, Upload, Loader, X } from 'lucide-react';
import { getAuth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

type Msg = { role: 'user' | 'assistant'; content: string };

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
      <code className="rounded bg-blue-900/30 px-1.5 py-0.5 text-[0.9em] text-blue-200" {...props}>
        {children}
      </code>
    );
  }
  return (
    <pre className="overflow-x-auto rounded-xl border border-blue-500/30 bg-blue-950/50 p-4 text-[0.9em] leading-relaxed">
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
};

const ARenderer = ({ children, ...props }: AnchorProps) => (
  <a
    className="text-blue-300 underline decoration-blue-400 underline-offset-2 hover:text-blue-200"
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
    className="border-b border-blue-500/30 bg-blue-900/30 px-3 py-2 text-left font-semibold text-blue-200"
    {...props}
  >
    {children}
  </th>
);

const TdRenderer = ({ children, ...props }: TdProps) => (
  <td className="border-b border-blue-500/20 px-3 py-2 align-top" {...props}>
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
      className="rounded-lg border border-blue-500/50 px-2 py-1 text-xs text-blue-300 hover:bg-blue-900/30 active:scale-95"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={classNames('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-1 grid h-8 w-8 shrink-0 select-none place-items-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
          AI
        </div>
      )}
      <div
        className={classNames(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-blue-950/50 text-blue-100 border border-blue-500/30 backdrop-blur'
        )}
      >
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
        <div className="mt-1 grid h-8 w-8 shrink-0 select-none place-items-center rounded-full bg-blue-600 text-white font-bold text-sm">
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

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((s) => [
      ...s,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: '' },
    ]);
    setInput('');
    setUploadedImage(null);
    setUploadedFile(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Call Gemini API with Flask backend
      const payload: any = {
        message: text,
        history: history,
      };

      if (uploadedFile) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(uploadedFile);
        });
        payload.image = {
          data: base64,
          mimeType: uploadedFile.type,
        };
      }

      const res = await fetch(`${API_BASE}/api/ai/travel-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuth().accessToken ? { Authorization: `Bearer ${getAuth().accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || data.message || 'Xin lỗi, tôi không thể xử lý yêu cầu này.';

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
        setMessages((s) => [
          ...s,
          {
            role: 'assistant',
            content:
              'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Hãy thử lại hoặc nhập câu hỏi đơn giản hơn nhé! 😊',
          },
        ]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [input, loading, messages, uploadedFile]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/homepage"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white">🤖 Trợ lý ảo Trippio</h1>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-white/70">
            Chuyên gia gợi ý du lịch thông minh • Phân tích ảnh • Tìm kiếm địa điểm
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[70vh] md:h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-950/30 to-purple-950/30">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            <div ref={endRef} />
          </div>

          {/* Image Preview */}
          {uploadedImage && (
            <div className="flex items-center gap-3 px-6 py-3 bg-blue-900/30 border-t border-white/20">
              <img
                src={uploadedImage}
                alt="preview"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm text-white/70">{uploadedFile?.name}</p>
              </div>
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setUploadedFile(null);
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/30 text-red-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="flex flex-col gap-3 border-t border-white/20 p-4 bg-blue-950/50 backdrop-blur">
            <div className="flex items-end gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Nhập câu hỏi (Shift+Enter xuống dòng)..."
                  rows={1}
                  className="min-h-10 max-h-24 flex-1 resize-none rounded-lg bg-white/10 border border-white/30 px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                />
              </div>
              {loading ? (
                <button
                  onClick={() => abortRef.current?.abort()}
                  className="rounded-lg bg-red-500/30 hover:bg-red-500/50 px-4 py-2 font-semibold text-red-200 border border-red-500/50 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <X className="h-4 w-4" /> Dừng
                </button>
              ) : (
                <button
                  onClick={send}
                  disabled={!input.trim() && !uploadedFile}
                  className="rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-700/50 disabled:cursor-not-allowed px-4 py-2 font-semibold text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Send className="h-4 w-4" /> Gửi
                </button>
              )}
            </div>

            {/* Image Upload */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white transition-colors text-sm font-medium">
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
              <span className="text-xs text-white/40">
                Tải ảnh phong cảnh, du lịch để tôi phân tích
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/50 text-xs">
          <p>💡 Gợi ý: Hãy gửi ảnh du lịch hoặc đặt câu hỏi về khách sạn, tour, địa điểm</p>
        </div>
      </div>
    </div>
  );
}
