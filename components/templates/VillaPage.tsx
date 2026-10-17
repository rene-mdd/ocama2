import { A } from '@/components/A';
import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { SectionMark } from '@/components/SectionMark';
import { Spiral } from '@/components/Spiral';
import { getSiteSettings, getVillas, type LocalizedVilla } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import { href } from '@/lib/routes';

export function VillaPage({ lang, villa }: { lang: Locale; villa: LocalizedVilla }) {
  const { t } = villa;
  const inc = getSiteSettings(lang).t.villa_inclusions;
  const all = getVillas(lang);
  const related = villa.related.map((id) => all.find((v) => v.id === id)!);

  return (
    <main className="page on" id={`pg-villa-${villa.id}`}>
      <section className="phero">
        <Img image={villa.header_image} alt={t.header_alt} fetchPriority="high" />
        <div className="inner">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display mt-1">{t.name}</h1>
          <Rich
            as="p"
            className={t.mobile_intro ? 'sub sub-long ff-serif fst-italic fs-1p25' : 'sub ff-serif fst-italic fs-1p25'}
            html={t.tagline}
          />
        </div>
      </section>
      {t.mobile_intro && (
        <section className="m-intro">
          <Spiral className="m-0-auto-1p4 d-block" />
          <p>{t.mobile_intro}</p>
        </section>
      )}

      <section className="pad">
        <div className="wrap split">
          <div className="reveal">
            <SectionMark eyebrow={t.section_eyebrow} />
            <Rich as="h2" className="display" html={t.headline} />
            {t.body.map((p, i) => (
              <Rich key={i} as="p" className={i === 0 ? 'lede mt-1p2' : 'lede mt-1'} html={p} />
            ))}
            <div className="meta-line mt-1p6">{t.meta_line}</div>
          </div>
          <Img className="reveal" image={villa.intro_image} alt={t.intro_alt} />
        </div>
      </section>

      <section className="pad-dark">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={inc.eyebrow} />
          <Rich as="h2" className="display reveal" html={inc.headline} />
          <div className="inc-grid reveal">
            {inc.items.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
          <p className="reveal mt-1p6 fs-p9 c-muted maxw-50em">{inc.note}</p>
        </div>
      </section>

      <section className="pad">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={t.gallery_eyebrow} />
          <div className="gal reveal">
            {villa.gallery.map((g) => (
              <Img key={g.src} image={g} alt={t.gallery_alt} loading="lazy" />
            ))}
          </div>
          {t.quote && (
            <p className="reveal mt-2p6 ff-serif fst-italic fs-1p15 maxw-34em">
              {t.quote.text}{' '}
              <span className="ff-julius fst-normal fs-p6 ls-p3em tt-uppercase c-sea-deep"> · {t.quote.cite}</span>
            </p>
          )}
          <div className={`reveal ${t.quote ? 'mt-1p6' : 'mt-2p4'} d-flex gap-1 fw-wrap ai-center`}>
            <a className="btn btn-solid" href={villa.booking_url}>
              {t.reserve_label}
            </a>
            {related.map((r) => (
              <A key={r.id} className="btn c-ink" href={href(lang, 'stay', r.t.slug)}>
                {r.t.name}
              </A>
            ))}
            <A className="link" href={href(lang, 'stay')}>
              {t.all_villas_label}
            </A>
          </div>
        </div>
      </section>
    </main>
  );
}
