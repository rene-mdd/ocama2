import { A } from '@/components/A';
import { Img } from '@/components/Img';
import { PageHero } from '@/components/sections/PageHero';
import { getOffers, getPage } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { OffersImages, OffersSections } from '@/lib/pages/offers';
import { href } from '@/lib/routes';

export function OffersIndexPage({ lang }: { lang: Locale }) {
  const page = getPage<OffersImages, OffersSections>('offers', lang);
  const s = page.t.sections;
  const offers = getOffers(lang);

  return (
    <main className="page on" id="pg-offers">
      <PageHero hero={s.hero} image={page.images.hero}>
        <div className="ctas">
          <A className="btn" href={href(lang, 'plan')}>
            {s.hero.cta_inquiry}
          </A>
        </div>
      </PageHero>
      <section className="pad pt-5">
        <div className="wrap">
          <div className="grid3">
            {offers.map((o) => (
              <A key={o.id} className="card villa-card reveal" href={href(lang, 'offers', o.t.slug)}>
                <Img image={o.image} alt={o.t.alt_text} loading="lazy" />
                <div className="body">
                  <div className="meta-line mt-0">{o.t.stay_length}</div>
                  <h4 className="mt-p5">{o.t.title}</h4>
                  <p className="ff-serif fst-italic fs-1p02">{o.t.summary}</p>
                  <span className="link mt-p9 fs-p64">{s.card_label}</span>
                </div>
              </A>
            ))}
          </div>
          <p className="reveal mt-4p5 fs-p85 c-muted maxw-52em">
            {s.footnote.before}
            <A href={href(lang, 'plan')} className="c-sea-deep bb-current">
              {s.footnote.link_label}
            </A>
            {s.footnote.after}
          </p>
        </div>
      </section>
    </main>
  );
}
