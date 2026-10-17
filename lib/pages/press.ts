import type { Rich } from '../types';
import type { HeroImages, HeroSection } from './shared';

/** Coverage URLs are language-neutral, so they sit beside the images on the parent. */
export type PressImages = HeroImages & { coverage_urls: string[] };

type Titled = { title: string; text: string };

export type PressSections = {
  hero: HeroSection;
  boilerplate: { eyebrow: string; text: Rich };
  featured: { eyebrow: string; outlets: string[] };
  coverage: { eyebrow: string; items: { source: string; headline: string; link_label: string }[] };
  facts: { eyebrow: string; items: Titled[] };
  angles: { eyebrow: string; headline: Rich; items: Titled[] };
  contact: { eyebrow: string; headline: Rich; text: string; mailto: string; cta: string; instagram_label: string; note: string };
};
