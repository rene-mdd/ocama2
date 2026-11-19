'use client';
/* eslint-disable @next/next/no-img-element -- see components/Img.tsx */
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const MIN = 1;
const MAX = 5;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Pt = { x: number; y: number };

/**
 * An image that opens full screen with zoom and pan (The Hotel's property map).
 * Zoom: scroll wheel, pinch, double-click/double-tap, or the + / − buttons. Pan: drag.
 * Close: ×, Esc, or a click on the dark area while not zoomed in.
 * `src` arrives resolved by the server (lib/assets.ts reads server-only env vars).
 */
export function ZoomableImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const t = useTranslations('zoom');
  const [open, setOpen] = useState(false);
  const [z, setZ] = useState(1);
  const [p, setP] = useState<Pt>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<{ dist: number; z: number; p: Pt; mid: Pt } | null>(null);
  const drag = useRef<{ start: Pt; p: Pt } | null>(null);
  const lastTap = useRef(0);
  const moved = useRef(false);

  /** Keep the image covering the view: pan is limited to the overflow at this zoom. */
  const bound = useCallback((next: Pt, zoom: number): Pt => {
    const el = img.current;
    if (!el) return next;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    return { x: clamp(next.x, (-(zoom - 1) * w) / 2, ((zoom - 1) * w) / 2), y: clamp(next.y, (-(zoom - 1) * h) / 2, ((zoom - 1) * h) / 2) };
  }, []);

  /** Zoom to `next`, keeping the point `at` (offset from the stage centre) still. */
  const zoomTo = useCallback(
    (next: number, at: Pt = { x: 0, y: 0 }, from = { z, p }) => {
      const nz = clamp(next, MIN, MAX);
      const np = { x: at.x - (nz * (at.x - from.p.x)) / from.z, y: at.y - (nz * (at.y - from.p.y)) / from.z };
      setZ(nz);
      setP(bound(np, nz));
    },
    [z, p, bound],
  );

  /** Pointer position as an offset from the stage centre. */
  const offset = (x: number, y: number): Pt => {
    const r = stage.current!.getBoundingClientRect();
    return { x: x - (r.left + r.width / 2), y: y - (r.top + r.height / 2) };
  };

  const close = useCallback(() => setOpen(false), []);

  // Back to the map after closing (runs once the viewer has been removed).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Keys use the latest zoomTo without re-binding the listener on every zoom step.
  const latest = useRef({ zoomTo, z });
  useEffect(() => {
    latest.current = { zoomTo, z };
  });

  const openViewer = () => {
    setZ(1);
    setP({ x: 0, y: 0 });
    setOpen(true);
  };

  // Open: lock page scroll; Esc closes, + / - zoom.
  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === '+' || e.key === '=') latest.current.zoomTo(latest.current.z * 1.5);
      if (e.key === '-') latest.current.zoomTo(latest.current.z / 1.5);
    };
    addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Wheel zoom needs a non-passive listener to stop the page from scrolling.
  useEffect(() => {
    const el = stage.current;
    if (!open || !el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTo(z * Math.exp(-e.deltaY * 0.0015), offset(e.clientX, e.clientY));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, z, zoomTo]);

  const onPointerDown = (e: ReactPointerEvent) => {
    try {
      (e.target as Element).setPointerCapture?.(e.pointerId); // keep receiving moves outside the image
    } catch {
      // Not capturable (e.g. a pointer that already ended); dragging still works within the stage.
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), z, p, mid: offset((a.x + b.x) / 2, (a.y + b.y) / 2) };
      drag.current = null;
    } else if (pointers.current.size === 1) {
      drag.current = { start: { x: e.clientX, y: e.clientY }, p };
    }
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const g = gesture.current;
      moved.current = true;
      zoomTo((g.z * Math.hypot(a.x - b.x, a.y - b.y)) / g.dist, g.mid, { z: g.z, p: g.p });
    } else if (drag.current) {
      const dx = e.clientX - drag.current.start.x;
      const dy = e.clientY - drag.current.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
      if (z > 1 && moved.current) {
        setDragging(true);
        setP(bound({ x: drag.current.p.x + dx, y: drag.current.p.y + dy }, z));
      }
    }
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0) {
      drag.current = null;
      setDragging(false);
      if (!moved.current) {
        const onImage = e.target === img.current;
        const now = Date.now();
        if (onImage && now - lastTap.current < 300) {
          // Double-click or double-tap: zoom in at that point, or back out.
          zoomTo(z > 1 ? 1 : 2.5, offset(e.clientX, e.clientY));
          lastTap.current = 0;
        } else {
          lastTap.current = onImage ? now : 0;
          // A click on the dark area closes, unless zoomed in (then it's easy to hit by accident).
          if (!onImage && e.target === stage.current && z === 1) close();
        }
      }
    }
  };

  return (
    <>
      <button ref={trigger} type="button" className="zoom-trigger" aria-label={t('open')} onClick={openViewer}>
        <img src={src} alt={alt} className={className} />
      </button>

      {open && (
        <div className="lightbox zoomview" role="dialog" aria-modal="true" aria-label={alt}>
          <div
            ref={stage}
            className="zv-stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <img
              ref={img}
              src={src}
              alt={alt}
              draggable={false}
              className={dragging ? 'dragging' : undefined}
              style={{ transform: `translate(${p.x}px, ${p.y}px) scale(${z})`, cursor: z > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
            />
          </div>
          <button ref={closeBtn} type="button" className="lb-close" aria-label={t('close')} onClick={close}>
            ×
          </button>
          <div className="zv-controls">
            <button type="button" aria-label={t('zoomOut')} onClick={() => zoomTo(z / 1.5)} disabled={z <= MIN}>
              −
            </button>
            <button type="button" className="zv-reset" aria-label={t('reset')} onClick={() => zoomTo(1)}>
              {Math.round(z * 100)}%
            </button>
            <button type="button" aria-label={t('zoomIn')} onClick={() => zoomTo(z * 1.5)} disabled={z >= MAX}>
              +
            </button>
          </div>
          <p className="zv-hint">{t('hint')}</p>
        </div>
      )}
    </>
  );
}
