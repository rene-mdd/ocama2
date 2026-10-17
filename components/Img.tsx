/* eslint-disable @next/next/no-img-element -- photography is still on ocama.com with pending filenames; see README */
import type { ImgHTMLAttributes } from 'react';
import type { ImageRef } from '@/lib/types';
import { FallbackImg } from './client/FallbackImg';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { image: ImageRef | string; alt: string };

/**
 * Plain <img> for now: final hosting and filenames are pending from Ocama, and several
 * guessed URLs need a client-side fallback. Swap to next/image once images move to the bucket.
 */
export function Img({ image, alt, ...rest }: Props) {
  const ref = typeof image === 'string' ? { src: image } : image;
  if (ref.fallback || ref.hideOnError) {
    return <FallbackImg src={ref.src} fallback={ref.fallback ?? undefined} hideOnError={ref.hideOnError} alt={alt} {...rest} />;
  }
  return <img src={ref.src} alt={alt} {...rest} />;
}
