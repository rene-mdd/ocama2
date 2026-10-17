import { A } from '@/components/A';
import { Img } from '@/components/Img';
import { PageHero } from '@/components/sections/PageHero';
import { getPage } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { WellnessImages, WellnessSections } from '@/lib/pages/wellness';
import { href } from '@/lib/routes';

export function WellnessPage({ lang }: { lang: Locale }) {
  const page = getPage<WellnessImages, WellnessSections>('wellness', lang);
  const img = page.images;
  const s = page.t.sections;

  return (
    <main className="page on" id="pg-wellness">
      <PageHero hero={s.hero} image={img.hero} />

      <section className="pad">
        <div className="wrap">
          <div className="grid2">
            {s.cards.map((c, i) => (
              <div key={c.title} className="card reveal">
                <Img image={img.cards[i]} alt={c.alt} />
                <div className="body">
                  <h4>{c.title}</h4>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal mt-2p6">
            <p className="fs-p92 maxw-46em c-body">{s.note}</p>
            <div className="mt-1p4 d-flex gap-1 fw-wrap">
              <A className="btn btn-solid" href={href(lang, 'plan')}>
                {s.cta_plan}
              </A>
              <A className="btn c-ink" href={href(lang, 'hospitality')}>
                {s.cta_hospitality}
              </A>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
