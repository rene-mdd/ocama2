import type { Rich } from '../types';
import type { HeroImages, HeroSection } from './shared';

export type SustainabilityImages = HeroImages;

export type SustainabilitySections = {
  hero: HeroSection;
  statement: { eyebrow: string; text: Rich };
  choice: { eyebrow: string; headline: Rich; text: Rich };
  practices: { eyebrow: string; headline: Rich; items: { title: string; text: string }[] };
  closing: { text: Rich; cta_plan: string; link_story: string };
};
