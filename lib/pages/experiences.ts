import type { Rich } from '../types';
import type { HeroImages, HeroSection } from './shared';

export type ExperiencesImages = HeroImages & { sea: string; forest: string };

type Feature = { eyebrow: string; headline: Rich; text: string; image_alt: string };

export type ExperiencesSections = {
  hero: HeroSection;
  sea: Feature;
  forest: Feature;
  pairs: { eyebrow: string; title: string; text: string }[];
  cta_plan: string;
  cta_concierge: string;
  note: string;
};
