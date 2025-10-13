'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Gallery({ main, thumbs }: { main: string; thumbs: string[] }) {
  const images = thumbs.length > 0 ? thumbs : [main];
  const [isOpen, setIsOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(main);

  const openModal = (src: string) => {
    setActiveImg(src);
    setIsOpen(true);
  };

  return (
    <>
      {/* Main image */}
      <div className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => openModal(main)}>
        <div className="relative aspect-[16/9] w-full">
          <Image src={main} alt="tour image" fill className="object-cover" priority />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {images.map((src, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl cursor-pointer"
              onClick={() => openModal(src)}
            >
              <div className="relative aspect-[4/3]">
                <Image src={src} alt={`thumb ${idx + 1}`} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative w-[90%] max-w-5xl">
            <Image
              src={activeImg}
              alt="zoomed"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg object-contain"
            />
            <button
              className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-white hover:bg-black"
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
