import type { Rich } from '../types';

export type HomeImages = {
  hero_video: string;
  hero_poster: string;
  intro: string;
  villa_cards: string[];
  dining: string;
  experience_cards: string[];
};

type Card = { title: string; text: string; alt: string };

export type HomeSections = {
  hero: { title: Rich; subtitle: string; place: string; cta_reserve: string; cta_villa: string; scroll_cue: string };
  mobile_intro: { text: string; link_label: string };
  statement: { eyebrow: string; text: Rich };
  stats: { value: string; label: string }[];
  intro: { eyebrow: string; headline: Rich; body: string; quote: string; link_label: string; image_alt: string };
  villas: { eyebrow: string; headline: Rich; cards: (Card & { tag: string })[]; compare_label: string; detail_label: string };
  buyouts: { eyebrow: string; headline: Rich; text: string; link_label: string };
  dining: { eyebrow: string; headline: Rich; text: string; link_label: string; image_alt: string };
  sustainability: { eyebrow: string; lead: string; text: string; link_label: string };
  experiences: { eyebrow: string; headline: Rich; cards: Card[] };
  reviews: { rating_label: string; quotes: { text: string; cite: string }[]; link_label: string };
  band: { headline: Rich; text: string; cta_availability: string; cta_plan: string };
};
