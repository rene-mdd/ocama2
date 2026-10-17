import { A } from '@/components/A';
import { Rich } from '@/components/Rich';
import { SectionMark } from '@/components/SectionMark';
import { PageHero } from '@/components/sections/PageHero';
import { Spiral } from '@/components/Spiral';
import { getPage } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { HospitalityImages, HospitalitySections } from '@/lib/pages/hospitality';
import { href } from '@/lib/routes';

export function HospitalityPage({ lang }: { lang: Locale }) {
  const page = getPage<HospitalityImages, HospitalitySections>('hospitality', lang);
  const s = page.t.sections;
  const { care, band } = s;

  return (
    <main className="page on" id="pg-hospitality">
      <PageHero hero={s.hero} image={page.images.hero} />

      <section className="pad">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={care.eyebrow} />
          <Rich as="h2" className="display reveal" html={care.headline} />
          <p className="eyebrow reveal mt-2p2 mb-1">{care.included_title}</p>
          <div className="inc-grid reveal">
            {care.included.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
          <p className="eyebrow reveal mt-2p6 mb-1">{care.carte_title}</p>
          <div className="inc-grid reveal">
            {care.carte.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
          <p className="reveal mt-2 fs-p92 c-muted maxw-56em">{care.note}</p>
        </div>
      </section>

      <div className="band">
        <Spiral />
        <Rich as="h2" className="display" html={band.headline} />
        <p>{band.text}</p>
        <A className="btn" href={href(lang, 'plan')}>
          {band.cta}
        </A>
      </div>
    </main>
  );
}
