import { A } from '@/components/A';
import { ArrivalMap } from '@/components/client/ArrivalMap';
import { HeliCta } from '@/components/client/HeliCta';
import { InquiryForm } from '@/components/client/InquiryForm';
import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { PageHero } from '@/components/sections/PageHero';
import { SectionMark } from '@/components/SectionMark';
import { getPage, getSiteSettings } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { PlanImages, PlanSections } from '@/lib/pages/plan';
import { href } from '@/lib/routes';

export async function PlanPage({ lang }: { lang: Locale }) {
  const page = await getPage<PlanImages, PlanSections>('plan', lang);
  const site = await getSiteSettings(lang);
  const s = page.t.sections;
  const { inquiry, arrival, air, faq } = s;

  return (
    <main className="page on" id="pg-plan">
      <PageHero hero={s.hero} image={page.images.hero} />

      <section className="pad">
        {/* Grid columns are a utility class; the export's mobile #plan-grid !important rule still wins on id specificity. */}
        <div className="wrap d-grid cols-1p1fr-p9fr gap-5vw" id="plan-grid">
          <div className="reveal">
            <SectionMark eyebrow={inquiry.eyebrow} />
            <InquiryForm
              content={inquiry}
              email={site.email}
              bookingUrl={site.booking_url}
              availabilityLabel={inquiry.availability_label}
            />
          </div>
          <div className="reveal">
            <SectionMark eyebrow={arrival.eyebrow} />
            <ArrivalMap label={arrival.map_label} lat={site.latitude} lng={site.longitude} />
            <p className="caption mb-1p8">{arrival.caption}</p>
            <div className="arrive">
              {arrival.items.map((it) => (
                <div key={it.label}>
                  <b>{it.value}</b>
                  <span>{it.label}</span>
                  <p>{it.text}</p>
                </div>
              ))}
            </div>
            <p className="reveal mt-1p2 fs-p92 maxw-58em">{arrival.road_note}</p>
            <div className="mrow b-none pt-p4">
              <h5>{arrival.reservations_title}</h5>
              <p>
                <a href={`tel:${site.phone.replace(/-/g, '')}`} className="c-sea-deep">
                  {site.phone_display}
                </a>{' '}
                ·{' '}
                <a href={`tel:${arrival.whatsapp_tel}`} className="c-sea-deep">
                  {arrival.whatsapp_display}
                </a>{' '}
                {arrival.whatsapp_label}
                <br />
                <a href={`mailto:${site.email}`} className="c-sea-deep">
                  {site.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pad-dark">
        <div className="wrap split">
          <Img className="reveal wide" image={page.images.air} alt={air.image_alt} loading="lazy" />
          <div className="reveal">
            <SectionMark eyebrow={air.eyebrow} />
            <Rich as="h2" className="display" html={air.headline} />
            {air.body.map((p, i) => (
              <Rich key={i} as="p" className={i === 0 ? 'lede mt-1p2 c-bone85' : 'lede mt-1 c-bone85'} html={p} />
            ))}
            <p className="fs-p85 mt-1p2 c-bone55">{air.rates_note}</p>
            <div className="mt-1p6 d-flex gap-1p6 fw-wrap ai-center">
              <HeliCta href={href(lang, 'plan')} label={air.cta_helicopter} />
              <A className="link c-bone" href={href(lang, 'offers')}>
                {air.cta_offers}
              </A>
            </div>
          </div>
        </div>
      </section>

      <section className="pad-sand">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={faq.eyebrow} />
          <Rich as="h2" className="display reveal" html={faq.headline} />
          <div className="reveal mt-1p6">
            {faq.items.map((f) => (
              <details key={f.question}>
                <summary>{f.question}</summary>
                <Rich as="p" html={f.answer} />
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
