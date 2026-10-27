import type { Locale } from '@/lib/i18n';
import { AboutPage } from './AboutPage';
import { StayPage } from './StayPage';
import { DiningPage } from './DiningPage';
import { WellnessPage } from './WellnessPage';
import { ExperiencesPage } from './ExperiencesPage';
import { HospitalityPage } from './HospitalityPage';
import { SustainabilityPage } from './SustainabilityPage';
import { OffersIndexPage } from './OffersIndexPage';
import { PlanPage } from './PlanPage';
import { PressPage } from './PressPage';

type Template = (props: { lang: Locale }) => React.ReactNode | Promise<React.ReactNode>;

/** Fixed page key → template. Villa and offer detail pages are routed separately. */
export const templates: Record<string, Template> = {
  about: AboutPage,
  stay: StayPage,
  dining: DiningPage,
  wellness: WellnessPage,
  experiences: ExperiencesPage,
  hospitality: HospitalityPage,
  sustainability: SustainabilityPage,
  offers: OffersIndexPage,
  plan: PlanPage,
  press: PressPage,
};
