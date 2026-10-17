import type { ElementType, HTMLAttributes } from 'react';
import type { Rich as RichText } from '@/lib/types';

type Props = { as?: ElementType; html: RichText } & Omit<HTMLAttributes<HTMLElement>, 'children' | 'dangerouslySetInnerHTML'>;

/** Renders a limited rich-text field (em, strong, a, br) into the given element. */
export function Rich({ as: Tag = 'span', html, ...rest }: Props) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
