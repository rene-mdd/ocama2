import { A } from '@/components/A';
import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { PageHero } from '@/components/sections/PageHero';
import { SectionMark } from '@/components/SectionMark';
import { Spiral } from '@/components/Spiral';
import { getPage, getSiteSettings, getVillas } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { StayImages, StaySections } from '@/lib/pages/stay';
import { href } from '@/lib/routes';

export function StayPage({ lang }: { lang: Locale }) {
  const page = getPage<StayImages, StaySections>('stay', lang);
  const site = getSiteSettings(lang);
  const villas = getVillas(lang);
  const { images: img } = page;
  const s = page.t.sections;

  return (
    <main className="page on" id="pg-stay">
      <PageHero hero={s.hero} image={img.hero} />

      <section className="pad">
        <div className="wrap">
          <div className="grid3">
            {s.cards.map((c, i) => (
              <A key={villas[i].id} className="card villa-card reveal" href={href(lang, 'stay', villas[i].t.slug)}>
                <Img image={img.villa_cards[i]} alt={c.alt} />
                <div className="body">
                  <h4>
                    {c.name}
                    {c.meaning && (
                      <>
                        {' '}
                        <span className="fst-italic fs-p85em c-sea-deep">· {c.meaning}</span>
                      </>
                    )}
                  </h4>
                  <div className="meta-line">{c.meta_line}</div>
                  <p>{c.text}</p>
                </div>
              </A>
            ))}
            <div className="card reveal d-flex ai-center jc-center bg-jungle c-bone ar-auto minh-280px ta-center p-2">
              <div>
                <Spiral className="m-0-auto-1 c-sea" />
                <h4 className="ff-serif fs-1p4">{s.help_card.title}</h4>
                <p className="fs-p92 m-p6-0-1p2 c-bone8">{s.help_card.text}</p>
                <A className="btn c-bone" href={href(lang, 'plan')}>
                  {s.help_card.cta}
                </A>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pad-sand" id="compare">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={s.compare.eyebrow} />
          <Rich as="h2" className="display reveal" html={s.compare.headline} />
          <p className="lede reveal mt-1">{s.compare.intro}</p>
          <div className="tblwrap reveal">
            <table className="tbl">
              <thead>
                <tr>
                  {s.compare.columns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.compare.rows.map((r) => (
                  <tr key={r.name}>
                    <td>
                      {r.name}
                      {r.meaning && <span className="tn">{r.meaning}</span>}
                    </td>
                    {r.cells.map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="reveal mt-1p8 fs-p92 maxw-44em">{s.compare.note}</p>
          <div className="reveal mt-1p6 d-flex gap-1 fw-wrap">
            <a className="btn btn-solid" href={site.booking_url}>
              {s.compare.cta_availability}
            </a>
            <A className="btn c-ink" href={href(lang, 'plan')}>
              {s.compare.cta_help}
            </A>
          </div>
        </div>
      </section>
    </main>
  );
}
