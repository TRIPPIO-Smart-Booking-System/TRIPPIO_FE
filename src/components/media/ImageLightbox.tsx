'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type Props = {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageLightbox({ images, initialIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);

  // lock scroll + keyboard nav
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [images.length, onClose]);

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90"
      onClick={onClose}
      aria-label="Lightbox overlay"
    >
      {/* Top bar */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between p-4 text-white">
        <div className="pointer-events-auto rounded-full bg-white/10 px-3 py-1 text-sm">
          {index + 1}/{images.length}
        </div>
        <button
          aria-label="Close"
          onClick={onClose}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="text-white"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      {/* Image area */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[82vh] w-[92vw]">
          <Image
            src={images[index]}
            alt={`photo-${index + 1}`}
            fill
            className="object-contain select-none"
            sizes="92vw"
            priority
          />
        </div>
      </div>

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <button
            aria-label="Next"
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 6l6 6-6 6" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
