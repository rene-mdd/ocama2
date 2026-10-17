import type { Rich } from '../types';
import type { HeroImages, HeroSection } from './shared';

export type StayImages = HeroImages & { villa_cards: string[] };

export type StaySections = {
  hero: HeroSection;
  /** One card per villa, in villa sort order. `meaning` is the Taíno translation shown beside the name. */
  cards: { name: string; meaning: string | null; meta_line: string; text: string; alt: string }[];
  help_card: { title: string; text: string; cta: string };
  compare: {
    eyebrow: string;
    headline: Rich;
    intro: string;
    columns: string[];
    rows: { name: string; meaning: string | null; cells: string[] }[];
    note: string;
    cta_availability: string;
    cta_help: string;
  };
};
