import type { Rich } from '../types';
import type { HeroImages, HeroSection } from './shared';

export type DiningImages = HeroImages & { chef: string; cuisine: string; sample_menus_url: string };

export type DiningSections = {
  hero: HeroSection;
  chef: { eyebrow: string; headline: Rich; body: string[]; image_alt: string };
  ways: { eyebrow: string; rows: { title: string; text: string }[]; cta_plan: string; cta_menus: string };
  cuisine: { eyebrow: string; headline: Rich; body: string; image_alt: string };
};
