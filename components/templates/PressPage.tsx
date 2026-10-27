import { A } from '@/components/A';
import { Rich } from '@/components/Rich';
import { PageHero } from '@/components/sections/PageHero';
import { SectionMark } from '@/components/SectionMark';
import { Spiral } from '@/components/Spiral';
import { getPage, getSiteSettings } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { PressImages, PressSections } from '@/lib/pages/press';

export async function PressPage({ lang }: { lang: Locale }) {
  const page = await getPage<PressImages, PressSections>('press', lang);
  const site = await getSiteSettings(lang);
  const { images: img } = page;
  const s = page.t.sections;
  const last = s.coverage.items.length - 1;

  return (
    <main className="page on" id="pg-press">
      <PageHero hero={s.hero} image={img.hero} />

      <section className="statement reveal">
        <span className="eyebrow">{s.boilerplate.eyebrow}</span>
        <Rich as="p" className="fs-clamp-1p15-2p2vw-1p6 maxw-44em" html={s.boilerplate.text} />
      </section>

      <section className="pad pt-4 pb-4">
        <div className="wrap ta-center">
          <SectionMark className="reveal jc-center" eyebrow={s.featured.eyebrow} />
          <p className="reveal mt-1p8 ff-julius fs-p78 ls-p32em tt-uppercase lh-2p6 c-ink">
            {s.featured.outlets.join('  ·  ')}
          </p>
        </div>
      </section>

      <section className="pad bg-jungle c-bone pt-5 pb-5">
        <div className="wrap maxw-900px">
          <div className="section-mark reveal">
            <Spiral className="stroke-sea" />
            <span className="eyebrow c-sea">{s.coverage.eyebrow}</span>
          </div>
          <div className="reveal mt-2p2 d-grid gap-2p2">
            {s.coverage.items.map((c, i) => (
              <div key={c.headline} className={i < last ? 'bb-bone14 pb-2' : undefined}>
                <p className="eyebrow c-sea fs-p62">{c.source}</p>
                <p className="ff-serif fst-italic fs-1p35 mt-p5 c-bone">{c.headline}</p>
                <a className="link c-bone bc-bone4 mt-1" href={img.coverage_urls[i]}>
                  {c.link_label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pad pt-0">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={s.facts.eyebrow} />
          <div className="grid3 reveal mt-2 gap-2p5">
            {s.facts.items.map((f) => (
              <div key={f.title}>
                <h4 className="ff-serif fs-1p3">{f.title}</h4>
                <p className="mt-p6 fs-p95">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pad bg-sand">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={s.angles.eyebrow} />
          <Rich as="h2" className="display reveal mt-1 maxw-16em" html={s.angles.headline} />
          <div className="grid3 reveal mt-2p5 gap-2p5">
            {s.angles.items.map((a) => (
              <div key={a.title}>
                <p className="fs-p95">
                  <b className="fwt-500">{a.title}</b>
                  <br />
                  {a.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pad">
        <div className="wrap maxw-860px">
          <SectionMark className="reveal" eyebrow={s.contact.eyebrow} />
          <Rich as="h2" className="display reveal mt-1" html={s.contact.headline} />
          <p className="lede reveal mt-1p2">{s.contact.text}</p>
          <div className="reveal mt-2p2 d-flex gap-1p8 fw-wrap ai-center">
            <a className="btn btn-solid" href={s.contact.mailto}>
              {s.contact.cta}
            </a>
            <A className="link" href={site.instagram_url}>
              {s.contact.instagram_label}
            </A>
          </div>
          <p className="reveal mt-2 fs-p85 c-muted">{s.contact.note}</p>
        </div>
      </section>
    </main>
  );
}
