import type { HeroImages, HeroSection } from './shared';

export type OffersImages = HeroImages;

export type OffersSections = {
  hero: HeroSection & { cta_inquiry: string };
  card_label: string;
  /** Footnote with an inline link to Plan Your Stay: text before the link, link label, text after. */
  footnote: { before: string; link_label: string; after: string };
};
