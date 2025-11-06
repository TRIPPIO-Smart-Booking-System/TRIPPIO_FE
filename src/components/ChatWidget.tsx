'use client';

import { useEffect, useRef, useState } from 'react';
import ChatBox from '@/components/ChatBox';
import { IoClose } from 'react-icons/io5';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // mở/đóng qua event toàn cục
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

  // ESC đóng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* overlay */}
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) setOpen(false);
        }}
        className="fixed inset-0 z-[60] bg-black/10"
      />
      {/* panel góc trái */}
      <div
        className="
          fixed bottom-4 left-4 z-[61]
          w-[92vw] max-w-[480px] h-[70vh] max-h-[720px]
          flex flex-col overflow-hidden
          rounded-2xl border bg-white shadow-2xl ring-1 ring-black/5
        "
      >
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
            <IoClose size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* dùng bản modal để composer dính đáy */}
          <ChatBox variant="modal" />
        </div>
      </div>
    </>
  );
}
