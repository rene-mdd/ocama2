'use client';
/* eslint-disable @next/next/no-img-element -- see components/Img.tsx */
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';

export type GalleryImage = { src: string; fallback?: string | null; hideOnError?: boolean };

/**
 * Villa gallery (customer feedback, Nov 2026): every image opens a lightbox with previous/next
 * arrows (also ←/→), swipe on touch screens, and closes on ×, Esc or a tap outside the image.
 * URLs arrive already resolved by the server (lib/assets.ts reads server-only env vars).
 */
export function VillaGallery({ images, alt }: { images: GalleryImage[]; alt: string }) {
  const t = useTranslations('gallery');
  const [failed, setFailed] = useState<Set<number>>(new Set());
  const [srcs, setSrcs] = useState(() => images.map((i) => i.src));
  const [open, setOpen] = useState<number | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<number | null>(null);

  // Images that fail to load: swap to their fallback, or drop them (as the export hid them).
  const onError = useCallback(
    (i: number) => {
      const fb = images[i].fallback;
      if (fb && srcs[i] !== fb) setSrcs((s) => s.map((x, j) => (j === i ? fb : x)));
      else setFailed((f) => new Set(f).add(i));
    },
    [images, srcs],
  );
  // An error can fire before hydration attaches onError; catch it once mounted.
  useEffect(() => {
    imgs.current.forEach((img, i) => {
      if (img && img.complete && img.naturalWidth === 0) onError(i);
    });
  }, [onError]);

  const visible = images.map((_, i) => i).filter((i) => !failed.has(i));
  const pos = open === null ? -1 : visible.indexOf(open);
  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : visible[(visible.indexOf(o) + d + visible.length) % visible.length])),
    [visible],
  );
  const close = useCallback(() => {
    setOpen((o) => {
      if (o !== null) requestAnimationFrame(() => thumbs.current[o]?.focus());
      return null;
    });
  }, []);

  useEffect(() => {
    if (open === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      removeEventListener('keydown', onKey);
    };
  }, [open, close, step]);

  const onPointerDown = (e: PointerEvent) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  };

  return (
    <>
      <div className="gal reveal">
        {images.map((img, i) =>
          failed.has(i) ? null : (
            <button
              key={img.src}
              type="button"
              className="gal-item"
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              aria-label={t('open', { n: visible.indexOf(i) + 1, total: visible.length })}
              onClick={() => setOpen(i)}
            >
              <img
                ref={(el) => {
                  imgs.current[i] = el;
                }}
                src={srcs[i]}
                alt={alt}
                loading="lazy"
                onError={() => onError(i)}
              />
            </button>
          ),
        )}
      </div>

      {open !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={(e) => e.target === e.currentTarget && close()}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <img src={srcs[open]} alt={alt} draggable={false} />
          <button ref={closeBtn} type="button" className="lb-close" aria-label={t('close')} onClick={close}>
            ×
          </button>
          {visible.length > 1 && (
            <>
              <button type="button" className="lb-prev" aria-label={t('previous')} onClick={() => step(-1)}>
                ‹
              </button>
              <button type="button" className="lb-next" aria-label={t('next')} onClick={() => step(1)}>
                ›
              </button>
            </>
          )}
          <p className="lb-count" aria-live="polite">
            {t('counter', { n: pos + 1, total: visible.length })}
          </p>
        </div>
      )}
    </>
  );
}
