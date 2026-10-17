import type { Rich } from '../types';

/** The standard sub-page hero, plus the mobile intro band that replaces a long subtitle on mobile. */
export type HeroSection = { eyebrow: string; title: Rich; subtitle: Rich; alt: string; mobile_intro: string | null };
export type HeroImages = { hero: string };
