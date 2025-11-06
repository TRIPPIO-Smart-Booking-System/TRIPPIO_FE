'use client';

import { useEffect, useRef, useState } from 'react';
import ChatBox from '@/components/ChatBox';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lắng nghe sự kiện toàn cục để mở chat từ nút nổi
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    window.addEventListener('app:openChat', onOpen as EventListener);
    window.addEventListener('app:closeChat', onClose as EventListener);
    return () => {
      window.removeEventListener('app:openChat', onOpen as EventListener);
      window.removeEventListener('app:closeChat', onClose as EventListener);
    };
  }, []);

  // ESC để đóng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* overlay nhạt, click ra ngoài để đóng */}
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) setOpen(false);
        }}
        className="fixed inset-0 z-[60] bg-black/10"
      />
      {/* Panel nổi góc trái */}
      <div
        className="
          fixed bottom-4 left-4 z-[61]
          w-[92vw] max-w-[480px] h-[70vh] max-h-[720px]
          rounded-2xl border bg-white shadow-2xl ring-1 ring-black/5
          flex flex-col overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-sky-600 text-white font-semibold">
              AI
            </div>
            <div>
              <div className="text-sm font-semibold">GenAI Chat</div>
              <div className="text-xs text-zinc-500">Markdown • Streaming</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
            title="Close (Esc)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 L6 18" />
              <path d="M6 6 L18 18" />
            </svg>
          </button>
        </div>

        {/* Body: dùng ChatBox hiện tại (không cần sửa logic) */}
        <div className="flex-1 overflow-hidden">
          {/* ChatBox đang render container riêng; để fit modal: thêm padding nhẹ */}
          <div className="h-full overflow-hidden p-2">
            <ChatBox />
          </div>
        </div>
      </div>
    </>
  );
}
