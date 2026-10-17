import { A } from '@/components/A';
import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { SectionMark } from '@/components/SectionMark';
import type { LocalizedOffer } from '@/lib/directus';
import { validUntilLabel } from '@/lib/format';
import type { Locale } from '@/lib/i18n';
import { href } from '@/lib/routes';

export function OfferPage({ lang, offer }: { lang: Locale; offer: LocalizedOffer }) {
  const { t } = offer;
  return (
    <main className="page on" id={`pg-offer-${offer.id}`}>
      <section className="phero">
        <Img image={offer.image} alt={t.alt_text} fetchPriority="high" />
        <div className="inner">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display mt-1">{t.title}</h1>
          <p className="sub ff-serif fst-italic fs-1p25">{t.summary}</p>
        </div>
      </section>
      <section className="pad">
        <div className="wrap maxw-820px">
          <Rich as="p" className="lede reveal maxw-none fs-1p12" html={t.body} />
          {offer.valid_until && <p className="meta-line mt-1p6">{validUntilLabel(lang, offer.valid_until)}</p>}
          <SectionMark className="reveal mt-2p8" eyebrow={t.includes_eyebrow} />
          <div className="inc-grid reveal cols-1fr-1fr mt-1p4">
            {t.inclusions.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
          {t.details.map((d, i) => (
            <details key={d.summary} className={i === 0 ? 'bt-hair mt-2p6' : undefined}>
              <summary>{d.summary}</summary>
              <Rich as="p" html={d.body} />
            </details>
          ))}
          {t.terms_note && <p className="mt-2p4 fs-p85 c-muted">{t.terms_note}</p>}
          <div className="reveal mt-2p8 d-flex gap-1p8 fw-wrap ai-center">
            <a className="btn btn-solid" href={offer.booking_url}>
              {t.cta_label}
            </a>
            <A className="link" href={href(lang, 'plan')}>
              {t.speak_label}
            </A>
            <A className="link" href={href(lang, 'offers')}>
              {t.back_label}
            </A>
          </div>
        </div>
      </section>
    </main>
  );
}
