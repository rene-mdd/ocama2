/**
 * Collection types mirroring the Directus schema (ARCHITECTURE.md, "Directus data model").
 * Language-neutral fields live on the parent; anything a human writes lives in `translations`.
 */
import type { LanguageCode } from './i18n';

/** Limited rich text (em, strong, a, br) as an HTML string, as the Directus WYSIWYG field stores it. */
export type Rich = string;

export type Status = 'draft' | 'published' | 'archived';

export type Translated<T> = { translations: (T & { languages_code: LanguageCode })[] };

/** An image reference plus the fallback used while final photography is pending from Ocama. */
export type ImageRef = { src: string; fallback?: string | null; hideOnError?: boolean };

export type LinkItem = { label: string; href: string };

export type NavItem = { key: string; label: string };

export type SiteSettingsT = {
  site_name: string;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  /** Description used in the Hotel JSON-LD entity. */
  schema_description: string;
  reserve_label: string;
  reserve_long_label: string;
  menu_eyebrow: string;
  header_nav: NavItem[];
  mobile_nav: NavItem[];
  footer_copy: string;
  footer_explore_title: string;
  footer_explore: NavItem[];
  footer_plan_title: string;
  footer_plan_begin: string;
  footer_plan_getting_here: string;
  footer_copyright: string;
  footer_reviews_label: string;
  footer_meaning: string;
  /** "Included in your stay" block shared by every villa page. */
  villa_inclusions: { eyebrow: string; headline: Rich; items: string[]; note: string };
};

export type SiteSettings = Translated<SiteSettingsT> & {
  phone: string;
  phone_display: string;
  email: string;
  booking_url: string;
  google_reviews_url: string;
  instagram_url: string;
  tiktok_url: string;
  same_as: string[];
  latitude: number;
  longitude: number;
  address: { locality: string; region: string; country: string };
  number_of_rooms: number;
  pets_allowed: boolean;
  amenities: string[];
  og_image: string;
  show_offers_banner: boolean;
  show_newsletter: boolean;
};

export type VillaT = {
  name: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  eyebrow: string;
  tagline: Rich;
  mobile_intro: string | null;
  header_alt: string;
  section_eyebrow: string;
  headline: Rich;
  body: Rich[];
  meta_line: string;
  intro_alt: string;
  gallery_eyebrow: string;
  gallery_alt: string;
  quote: { text: string; cite: string } | null;
  reserve_label: string;
  all_villas_label: string;
};

export type Villa = Translated<VillaT> & {
  id: string;
  sort: number;
  status: Status;
  header_image: ImageRef;
  intro_image: ImageRef;
  gallery: ImageRef[];
  booking_url: string;
  /** Villa ids shown as "see also" buttons, in order. */
  related: string[];
};

export type OfferT = {
  title: string;
  slug: string;
  /** Short line under the title, also used on the offers index card. */
  summary: string;
  /** e.g. "Three-Night Stay", shown on the index card. */
  stay_length: string;
  body: Rich;
  meta_title: string | null;
  meta_description: string | null;
  alt_text: string;
  eyebrow: string;
  includes_eyebrow: string;
  inclusions: string[];
  /** Expandable blocks (additional inclusions, terms). Empty means the generic terms note is shown. */
  details: { summary: string; body: Rich }[];
  terms_note: string | null;
  cta_label: string;
  speak_label: string;
  back_label: string;
};

export type Offer = Translated<OfferT> & {
  id: string;
  status: Status;
  sort: number;
  image: ImageRef;
  og_image: string | null;
  price: number | null;
  publish_at: string | null;
  valid_from: string | null;
  valid_until: string | null;
  date_updated: string;
  noindex: boolean;
  canonical_url: string | null;
  booking_url: string;
};

/** A fixed marketing page. `images` and `sections` are typed per page key. */
export type Page<Images = Record<string, unknown>, Sections = Record<string, unknown>> = Translated<{
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  sections: Sections;
}> & {
  key: string;
  status: Status;
  date_updated: string;
  images: Images;
};
