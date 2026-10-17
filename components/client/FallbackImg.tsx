'use client';
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; fallback?: string; hideOnError?: boolean };

/** Replaces the export's inline onerror handlers: swap to a fallback image, or hide the image. */
export function FallbackImg({ src, alt, fallback, hideOnError, style, ...rest }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [current, setCurrent] = useState(src);
  const [hidden, setHidden] = useState(false);

  const onError = useCallback(() => {
    if (fallback && current !== fallback) setCurrent(fallback);
    else if (hideOnError) setHidden(true);
  }, [current, fallback, hideOnError]);

  // The error may fire before hydration attaches onError; catch that case once mounted.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) onError();
  }, [onError]);

  return <img ref={ref} src={current} alt={alt} onError={onError} style={hidden ? { ...style, display: 'none' } : style} {...rest} />;
}
