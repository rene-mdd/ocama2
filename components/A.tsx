import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

/** Internal paths go through next/link; booking, mailto and other external URLs stay plain anchors. */
export function A({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (href.startsWith('/')) return <Link href={href} {...rest} />;
  return <a href={href} {...rest} />;
}
