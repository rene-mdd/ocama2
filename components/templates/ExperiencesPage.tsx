import { A } from '@/components/A';
import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { PageHero } from '@/components/sections/PageHero';
import { SectionMark } from '@/components/SectionMark';
import { getPage } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { ExperiencesImages, ExperiencesSections } from '@/lib/pages/experiences';
import { href } from '@/lib/routes';

export function ExperiencesPage({ lang }: { lang: Locale }) {
  const page = getPage<ExperiencesImages, ExperiencesSections>('experiences', lang);
  const { images: img } = page;
  const s = page.t.sections;

  return (
    <main className="page on" id="pg-experiences">
      <PageHero hero={s.hero} image={img.hero} />

      <section className="pad">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={s.sea.eyebrow} />
          <div className="split">
            <Img className="reveal wide" image={img.sea} alt={s.sea.image_alt} />
            <div className="reveal">
              <Rich as="h2" className="display" html={s.sea.headline} />
              <p className="lede mt-1p2">{s.sea.text}</p>
            </div>
          </div>

          <SectionMark className="reveal mt-4p5" eyebrow={s.forest.eyebrow} />
          <div className="split">
            <div className="reveal">
              <Rich as="h2" className="display" html={s.forest.headline} />
              <p className="lede mt-1p2">{s.forest.text}</p>
            </div>
            <Img className="reveal wide" image={img.forest} alt={s.forest.image_alt} />
          </div>

          <div className="grid2 mt-4p5">
            {s.pairs.map((p) => (
              <div key={p.title} className="reveal">
                <SectionMark eyebrow={p.eyebrow} />
                <h3 className="display">{p.title}</h3>
                <p className="mt-p8 fs-p96">{p.text}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-3 d-flex gap-1 fw-wrap">
            <A className="btn btn-solid" href={href(lang, 'plan')}>
              {s.cta_plan}
            </A>
            <A className="btn c-ink" href={href(lang, 'hospitality')}>
              {s.cta_concierge}
            </A>
          </div>
        </div>
      </section>
      <section className="pad pt-0">
        <div className="wrap">
          <p className="reveal fs-p9 c-muted maxw-52em">{s.note}</p>
        </div>
      </section>
    </main>
  );
}
