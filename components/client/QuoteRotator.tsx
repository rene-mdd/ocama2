'use client';
import { useEffect, useState } from 'react';

/** main.js rotating guest quotes: cross-fade every 6.5 s. */
export function QuoteRotator({ quotes }: { quotes: { text: string; cite: string }[] }) {
  const [on, setOn] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setOn((i) => (i + 1) % quotes.length), 6500);
    return () => clearInterval(id);
  }, [quotes.length]);
  return (
    <div id="gq-wrap" className="pos-relative minh-9em">
      {quotes.map((q, i) => (
        <figure key={i} className={i === on ? 'gq on' : 'gq'}>
          <blockquote>{q.text}</blockquote>
          <cite>{q.cite}</cite>
        </figure>
      ))}
    </div>
  );
}
