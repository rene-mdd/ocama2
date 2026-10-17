import type { Rich } from '../types';
import type { HeroImages, HeroSection } from './shared';

export type AboutImages = HeroImages & { founder: string; map: string };

export type AboutSections = {
  hero: HeroSection;
  story: { eyebrow: string; headline: Rich; body: string; quote: string; quote_cite: string; image_alt: string };
  harmony: { eyebrow: string; headline: Rich; body: string; pillars: { title: string; text: string }[] };
  retreat: { eyebrow: string; headline: Rich; body: string; image_alt: string };
};
