import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { SectionMark } from '@/components/SectionMark';
import { PageHero } from '@/components/sections/PageHero';
import { getPage } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { AboutImages, AboutSections } from '@/lib/pages/about';

export function AboutPage({ lang }: { lang: Locale }) {
  const page = getPage<AboutImages, AboutSections>('about', lang);
  const img = page.images;
  const s = page.t.sections;

  return (
    <main className="page on" id="pg-about">
      <PageHero hero={s.hero} image={img.hero} />

      <section className="pad">
        <div className="wrap split">
          <Img className="reveal" image={img.founder} alt={s.story.image_alt} />
          <div className="reveal">
            <SectionMark eyebrow={s.story.eyebrow} />
            <Rich as="h2" className="display" html={s.story.headline} />
            <p className="lede mt-1p2">{s.story.body}</p>
            <p className="lede mt-1 ff-serif fst-italic fs-1p15">{s.story.quote}</p>
            <p className="mt-p6 fs-p85 ls-p15em tt-uppercase c-sea-deep">{s.story.quote_cite}</p>
          </div>
        </div>
      </section>

      <section className="pad-dark">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={s.harmony.eyebrow} />
          <Rich as="h2" className="display reveal" html={s.harmony.headline} />
          <p className="lede reveal mt-1p3 c-bone85">{s.harmony.body}</p>
          <div className="grid2 mt-2p6">
            {s.harmony.pillars.map((p) => (
              <div key={p.title} className="reveal">
                <h3 className="display">{p.title}</h3>
                <p className="mt-p7 fs-p95 c-bone78">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="wrap split">
          <div className="reveal">
            <SectionMark eyebrow={s.retreat.eyebrow} />
            <Rich as="h2" className="display" html={s.retreat.headline} />
            <p className="lede mt-1p2">{s.retreat.body}</p>
          </div>
          <Img className="reveal wide" image={img.map} alt={s.retreat.image_alt} />
        </div>
      </section>
    </main>
  );
}
