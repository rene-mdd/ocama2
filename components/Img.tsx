/* eslint-disable @next/next/no-img-element -- photography is still on ocama.com with pending filenames; see README */
import type { ImgHTMLAttributes } from 'react';
import { assetUrl } from '@/lib/assets';
import type { ImageRef } from '@/lib/types';
import { FallbackImg } from './client/FallbackImg';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { image: ImageRef | string; alt: string };

/**
 * Plain <img> for now: final hosting and filenames are pending from Ocama, and several
 * guessed URLs need a client-side fallback. Swap to next/image once images move to the bucket
 * (add the bucket host to images.remotePatterns in next.config.ts).
 */
export function Img({ image, alt, ...rest }: Props) {
  const raw = typeof image === 'string' ? { src: image } : image;
  // Directus file ids, site paths and legacy URLs all resolve through lib/assets.ts.
  const ref = { ...raw, src: assetUrl(raw.src), fallback: raw.fallback ? assetUrl(raw.fallback) : raw.fallback };
  if (ref.fallback || ref.hideOnError) {
    return <FallbackImg src={ref.src} fallback={ref.fallback ?? undefined} hideOnError={ref.hideOnError} alt={alt} {...rest} />;
  }
  return <img src={ref.src} alt={alt} {...rest} />;
}
