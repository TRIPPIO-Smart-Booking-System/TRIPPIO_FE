'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* -------------------------------- Types -------------------------------- */
type Role = 'user' | 'assistant';
export type Msg = { role: Role; content: string };

type ChatBoxProps = {
  /** "modal": nhúng trong panel nổi (full height, ẩn header) | "page": trang thường */
  variant?: 'modal' | 'page';
  /** Endpoint stream trả về text chunk */
  apiUrl?: string;
};

/* ------------------------------ Utilities ------------------------------ */
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

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
      className="rounded-lg border px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 active:scale-95"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ----------- Markdown renderers (typed locally, no `any`) ----------- */
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
      <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.9em] text-zinc-800" {...props}>
        {children}
      </code>
    );
  }
  return (
    <pre className="overflow-x-auto rounded-xl border bg-zinc-50 p-3 text-[0.9em] leading-relaxed">
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
};

const ARenderer = ({ children, ...props }: AnchorProps) => (
  <a
    className="text-sky-600 underline decoration-sky-300 underline-offset-2 hover:text-sky-700"
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
  <th className="border-b bg-zinc-50 px-3 py-2 text-left font-semibold" {...props}>
    {children}
  </th>
);

const TdRenderer = ({ children, ...props }: TdProps) => (
  <td className="border-b px-3 py-2 align-top" {...props}>
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

/* ----------------------------- Message Item ---------------------------- */
function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={classNames('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-1 grid h-7 w-7 shrink-0 select-none place-items-center rounded-full bg-sky-600/10 text-sky-700 ring-1 ring-sky-600/20 font-semibold">
          AI
        </div>
      )}
      <div
        className={classNames(
          'max-w-[84%] rounded-2xl px-3 py-2 text-[15px] leading-relaxed shadow-sm',
          isUser ? 'bg-sky-600 text-white' : 'bg-white text-zinc-800 ring-1 ring-zinc-200'
        )}
      >
        <div
          className={classNames(
            'prose prose-zinc max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-li:marker:text-zinc-400 prose-ol:my-2 prose-pre:my-3',
            isUser ? 'prose-invert' : ''
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
        <div className="mt-1 grid h-7 w-7 shrink-0 select-none place-items-center rounded-full bg-zinc-900 text-white font-semibold">
          U
        </div>
      )}
    </div>
  );
}

/* --------------------- Stable wrappers (hoisted) --------------------- */
const ModalOuter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-full w-full min-h-0">{children}</div>
);

const PageOuter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mx-auto max-w-2xl p-4">{children}</div>
);

/* ------------------------------- Component ------------------------------ */
export default function ChatBox({ variant = 'page', apiUrl = '/api/ai/stream' }: ChatBoxProps) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Xin chào 👋 Mình là GenAI. Bạn cần gì?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const Wrapper = variant === 'modal' ? ModalOuter : PageOuter;

  useLayoutEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);
  useEffect(() => {
    resize();
  }, [input, resize]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((s) => [...s, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((s) => {
          const next = [...s];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') {
            next[next.length - 1] = { ...last, content: last.content + chunk };
          }
          return next;
        });
      }
    } catch {
      setMessages((s) => [
        ...s,
        { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Thử lại nhé.' },
      ]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [apiUrl, input, loading, messages]);

  // Enter = send, Shift+Enter = newline
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // cleanup abort khi unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return (
    <Wrapper>
      <div className="flex h-full min-h-0 flex-col rounded-3xl border bg-white shadow-sm">
        {/* Header: ẩn trong modal */}
        {variant !== 'modal' && (
          <div className="flex items-center justify-between gap-2 border-b px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-sky-600 text-white font-semibold">
                AI
              </div>
              <div>
                <div className="text-sm font-semibold">GenAI Chat</div>
                <div className="text-xs text-zinc-500">Markdown supported • Streaming</div>
              </div>
            </div>
            <div className="text-xs text-zinc-500">ESC to cancel</div>
          </div>
        )}

        {/* Messages */}
        <div
          className={classNames(
            variant === 'modal'
              ? 'flex-1 min-h-0 overflow-y-auto p-4'
              : 'h-[520px] overflow-y-auto p-4'
          )}
        >
          <div className="space-y-3">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="flex items-end gap-2 border-t p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Nhập câu hỏi… (Shift+Enter xuống dòng)"
            rows={1}
            className="min-h-11 max-h-52 flex-1 resize-none rounded-2xl border px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          />
          {loading ? (
            <button
              onClick={() => abortRef.current?.abort()}
              className="rounded-2xl bg-red-600 px-4 py-2 font-semibold text-white shadow hover:bg-red-700 active:scale-95"
            >
              Dừng
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim()}
              className="rounded-2xl bg-sky-600 px-4 py-2 font-semibold text-white shadow hover:bg-sky-700 active:scale-95 disabled:opacity-50"
            >
              Gửi
            </button>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
