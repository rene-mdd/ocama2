import { A } from '@/components/A';
import { Rich } from '@/components/Rich';
import { PageHero } from '@/components/sections/PageHero';
import { Spiral } from '@/components/Spiral';
import { getPage } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { SustainabilityImages, SustainabilitySections } from '@/lib/pages/sustainability';
import { href } from '@/lib/routes';

export function SustainabilityPage({ lang }: { lang: Locale }) {
  const page = getPage<SustainabilityImages, SustainabilitySections>('sustainability', lang);
  const s = page.t.sections;

  return (
    <main className="page on" id="pg-sustain">
      <PageHero hero={s.hero} image={page.images.hero} />

      <section className="statement reveal">
        <span className="eyebrow">{s.statement.eyebrow}</span>
        <Rich as="p" className="fs-clamp-1p15-2p2vw-1p6 maxw-40em" html={s.statement.text} />
      </section>

      <section className="pad bg-jungle c-bone">
        <div className="wrap maxw-880px">
          <div className="section-mark reveal">
            <Spiral className="stroke-sea" />
            <span className="eyebrow c-sea">{s.choice.eyebrow}</span>
          </div>
          <Rich as="h2" className="display reveal mt-1 c-bone" html={s.choice.headline} />
          <Rich as="p" className="lede reveal mt-1p4 c-bone92 maxw-none" html={s.choice.text} />
        </div>
      </section>

      <section className="pad">
        <div className="wrap">
          <div className="section-mark reveal">
            <Spiral />
            <span className="eyebrow">{s.practices.eyebrow}</span>
          </div>
          <Rich as="h2" className="display reveal mt-1 maxw-16em" html={s.practices.headline} />
          <div className="grid3 reveal mt-2p5 gap-2p5">
            {s.practices.items.map((it) => (
              <div key={it.title}>
                <h4 className="ff-serif fs-1p3">{it.title}</h4>
                <p className="mt-p6 fs-p95">{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pad bg-sand">
        <div className="wrap maxw-860px ta-center">
          <Spiral className="reveal m-0-auto" />
          <Rich
            as="p"
            className="reveal ff-serif fs-clamp-1p2-2p4vw-1p7 mt-1p5 maxw-34em ml-auto mr-auto"
            html={s.closing.text}
          />
          <div className="reveal mt-2p4 d-flex gap-1p8 fw-wrap jc-center ai-center">
            <A className="btn btn-solid" href={href(lang, 'plan')}>
              {s.closing.cta_plan}
            </A>
            <A className="link" href={href(lang, 'about')}>
              {s.closing.link_story}
            </A>
          </div>
        </div>
      </section>
    </main>
  );
}
