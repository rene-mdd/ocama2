import { A } from '@/components/A';
import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { SectionMark } from '@/components/SectionMark';
import { PageHero } from '@/components/sections/PageHero';
import { getPage } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { DiningImages, DiningSections } from '@/lib/pages/dining';
import { href } from '@/lib/routes';

export async function DiningPage({ lang }: { lang: Locale }) {
  const page = await getPage<DiningImages, DiningSections>('dining', lang);
  const img = page.images;
  const s = page.t.sections;

  return (
    <main className="page on" id="pg-dining">
      <PageHero hero={s.hero} image={img.hero} />

      <section className="pad">
        <div className="wrap split">
          <Img className="reveal" image={img.chef} alt={s.chef.image_alt} />
          <div className="reveal">
            <SectionMark eyebrow={s.chef.eyebrow} />
            <Rich as="h2" className="display" html={s.chef.headline} />
            {s.chef.body.map((p, i) => (
              <Rich key={i} as="p" className={i === 0 ? 'lede mt-1p2' : 'lede mt-1'} html={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="pad-sand">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={s.ways.eyebrow} />
          <div className="reveal">
            {s.ways.rows.map((r) => (
              <div key={r.title} className="mrow">
                <h5>{r.title}</h5>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
          <div className="reveal mt-2p4 d-flex gap-1 fw-wrap">
            <A className="btn btn-solid" href={href(lang, 'plan')}>
              {s.ways.cta_plan}
            </A>
            <a className="btn c-ink" href={img.sample_menus_url}>
              {s.ways.cta_menus}
            </a>
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="wrap split">
          <div className="reveal">
            <SectionMark eyebrow={s.cuisine.eyebrow} />
            <Rich as="h2" className="display" html={s.cuisine.headline} />
            <p className="lede mt-1p2">{s.cuisine.body}</p>
          </div>
          <Img className="reveal wide" image={img.cuisine} alt={s.cuisine.image_alt} />
        </div>
      </section>
    </main>
  );
}
