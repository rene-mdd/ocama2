import type { ElementType, HTMLAttributes } from 'react';
import type { Rich as RichText } from '@/lib/types';

type Props = { as?: ElementType; html: RichText } & Omit<HTMLAttributes<HTMLElement>, 'children' | 'dangerouslySetInnerHTML'>;

/**
 * Directus' rich-text editor wraps saved text in <p>. Inside a heading or paragraph that would be
 * invalid HTML (<h1><p>…</p></h1>), so a single wrapping paragraph is removed. Real multi-paragraph
 * text is left alone.
 */
export function unwrapParagraph(html: string): string {
  const m = /^\s*<p>([\s\S]*)<\/p>\s*$/.exec(html);
  return m && !/<\/p>/i.test(m[1]) ? m[1] : html;
}

/** Renders a limited rich-text field (em, strong, a, br) into the given element. */
export function Rich({ as: Tag = 'span', html, ...rest }: Props) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: unwrapParagraph(html) }} />;
}
