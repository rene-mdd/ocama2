import type { ReactNode } from 'react';
import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { Spiral } from '@/components/Spiral';
import type { HeroSection } from '@/lib/pages/shared';

/**
 * Standard sub-page hero. When the page has a mobile intro, the subtitle is marked
 * `sub-long` (hidden under 960px) and the intro band renders below the hero instead.
 */
export function PageHero({ hero, image, children }: { hero: HeroSection; image: string; children?: ReactNode }) {
  return (
    <>
      <section className="phero">
        <Img image={image} alt={hero.alt} fetchPriority="high" />
        <div className="inner">
          <p className="eyebrow">{hero.eyebrow}</p>
          <Rich as="h1" className="display mt-1" html={hero.title} />
          <Rich as="p" className={hero.mobile_intro ? 'sub sub-long' : 'sub'} html={hero.subtitle} />
          {children}
        </div>
      </section>
      {hero.mobile_intro && (
        <section className="m-intro">
          <Spiral className="m-0-auto-1p4 d-block" />
          <p>{hero.mobile_intro}</p>
        </section>
      )}
    </>
  );
}
