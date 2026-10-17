import type { HeroImages, HeroSection } from './shared';

export type WellnessImages = HeroImages & { cards: string[] };

export type WellnessSections = {
  hero: HeroSection;
  cards: { title: string; text: string; alt: string }[];
  note: string;
  cta_plan: string;
  cta_hospitality: string;
};
