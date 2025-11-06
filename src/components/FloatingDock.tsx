'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoChatbubblesOutline, IoCartOutline, IoAdd, IoClose } from 'react-icons/io5';

export default function FloatingDock() {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // ⬅️ NEW
  const router = useRouter();

  // đóng menu khi scroll
  useEffect(() => {
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // nghe trạng thái chat để ẩn/hiện nút nổi
  useEffect(() => {
    const onOpen = () => setChatOpen(true);
    const onClose = () => setChatOpen(false);
    window.addEventListener('app:openChat', onOpen as EventListener);
    window.addEventListener('app:closeChat', onClose as EventListener);
    return () => {
      window.removeEventListener('app:openChat', onOpen as EventListener);
      window.removeEventListener('app:closeChat', onClose as EventListener);
    };
  }, []);

  const openChat = () => {
    window.dispatchEvent(new Event('app:openChat'));
    setOpen(false);
  };

  const openCart = () => {
    router.push('/cart'); // hoặc trigger drawer/cart
    setOpen(false);
  };

  // ⬇️ Khi chat đang mở, ẩn hẳn dock để không che UI
  if (chatOpen) return null;

  return (
    // z-index thấp hơn overlay/modal
    <div className="fixed bottom-4 left-4 z-[50] select-none">
      {/* options */}
      <div
        className={`mb-2 flex flex-col gap-2 transition-all ${
          open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
        }`}
      >
        <button
          onClick={openChat}
          className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-sky-700 shadow ring-1 ring-black/5 hover:bg-sky-50"
        >
          <IoChatbubblesOutline size={18} />
          Chat
        </button>
        <button
          onClick={openCart}
          className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow ring-1 ring-black/5 hover:bg-emerald-50"
        >
          <IoCartOutline size={18} />
          Cart
        </button>
      </div>

      {/* main FAB */}
      <button
        onClick={() => setOpen((s) => !s)}
        aria-label="Open actions"
        className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-900 text-white shadow-lg hover:opacity-95 active:scale-95"
        title="Chat / Cart"
      >
        {open ? <IoClose size={22} /> : <IoAdd size={22} />}
      </button>
    </div>
  );
}
