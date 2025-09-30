'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = { images: string[] };

export default function HotelGallery({ images }: Props) {
  const hasThumbs = (images?.length ?? 0) > 1;
  const main = images?.[0] ?? '';
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(main);

  const open = (src: string) => {
    setActive(src);
    setIsOpen(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] w-full cursor-pointer" onClick={() => open(main)}>
          <Image src={main} alt="hotel hero" fill className="object-cover" priority />
        </div>
      </div>

      {hasThumbs && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {images.slice(0, 6).map((src, i) => (
            <button key={i} className="overflow-hidden rounded-xl" onClick={() => open(src)}>
              <div className="relative aspect-[4/3]">
                <Image src={src} alt={`thumb ${i + 1}`} fill className="object-cover" />
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative w-[92%] max-w-6xl">
            <Image
              src={active}
              alt="preview"
              width={1600}
              height={1000}
              className="h-auto w-full rounded-xl object-contain"
            />
            <button
              className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-white hover:bg-black"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
