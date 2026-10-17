'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** main.js reveal-on-scroll: adds .in to each .reveal element as it enters the viewport. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
