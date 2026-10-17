import { cx } from '@/lib/cx';

/** The Ocama spiral mark, referencing the sprite rendered once in the layout. */
export function Spiral({ className }: { className?: string }) {
  return (
    <svg className={cx('spiral', className)}>
      <use href="#sp" />
    </svg>
  );
}

export function SpiralSprite() {
  return (
    <svg className="d-none" xmlns="http://www.w3.org/2000/svg">
      <symbol id="sp" viewBox="0 0 40 40">
        <path
          d="M20 20 m0 -1 a1 1 0 0 1 1 1 a2.4 2.4 0 0 1 -2.4 2.4 a4 4 0 0 1 -4 -4 a5.8 5.8 0 0 1 5.8 -5.8 a7.6 7.6 0 0 1 7.6 7.6 a9.6 9.6 0 0 1 -9.6 9.6 a11.6 11.6 0 0 1 -11.6 -11.6 a13.6 13.6 0 0 1 13.6 -13.6 a15.6 15.6 0 0 1 15.6 15.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </symbol>
    </svg>
  );
}
