import type { Rich } from '../types';
import type { HeroImages, HeroSection } from './shared';

export type PlanImages = HeroImages & { air: string };

type Field = { label: string; placeholder: string };
type Choice = { label: string; options: string[] };

export type InquiryFormContent = {
  dates: Field;
  guests: Field;
  occasion: Choice;
  villa: Choice;
  notes: Field;
  send_label: string;
};

export type PlanSections = {
  hero: HeroSection;
  inquiry: InquiryFormContent & { eyebrow: string; availability_label: string };
  arrival: {
    eyebrow: string;
    map_label: string;
    caption: string;
    items: { value: string; label: string; text: string }[];
    road_note: string;
    reservations_title: string;
    whatsapp_display: string;
    whatsapp_tel: string;
    whatsapp_label: string;
  };
  air: {
    eyebrow: string;
    headline: Rich;
    body: Rich[];
    rates_note: string;
    cta_helicopter: string;
    cta_offers: string;
    image_alt: string;
  };
  faq: { eyebrow: string; headline: Rich; items: { question: string; answer: Rich }[] };
};
