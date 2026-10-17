import type { Rich } from '../types';
import type { HeroImages, HeroSection } from './shared';

export type HospitalityImages = HeroImages;

export type HospitalitySections = {
  hero: HeroSection;
  care: { eyebrow: string; headline: Rich; included_title: string; included: string[]; carte_title: string; carte: string[]; note: string };
  band: { headline: Rich; text: string; cta: string };
};
