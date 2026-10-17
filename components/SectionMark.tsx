import { cx } from '@/lib/cx';
import { Spiral } from './Spiral';

export function SectionMark({ eyebrow, className }: { eyebrow: string; className?: string }) {
  return (
    <div className={cx('section-mark', className)}>
      <Spiral />
      <span className="eyebrow">{eyebrow}</span>
    </div>
  );
}
