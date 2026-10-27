import { A } from '@/components/A';
import { assetUrl } from '@/lib/assets';
import { QuoteRotator } from '@/components/client/QuoteRotator';
import { Img } from '@/components/Img';
import { Rich } from '@/components/Rich';
import { SectionMark } from '@/components/SectionMark';
import { Spiral } from '@/components/Spiral';
import { getPage, getSiteSettings } from '@/lib/directus';
import type { Locale } from '@/lib/i18n';
import type { HomeImages, HomeSections } from '@/lib/pages/home';
import { href } from '@/lib/routes';

const delay = (i: number) => (i === 1 ? 'delay-p1s' : i === 2 ? 'delay-p2s' : undefined);

export async function HomePage({ lang }: { lang: Locale }) {
  const page = await getPage<HomeImages, HomeSections>('home', lang);
  const site = await getSiteSettings(lang);
  const { images: img } = page;
  const s = page.t.sections;
  const to = (key: Parameters<typeof href>[1], slug?: string) => href(lang, key, slug);

  return (
    <main className="page on" id="pg-home">
      <section className="phero tall">
        <video autoPlay muted loop playsInline poster={assetUrl(img.hero_poster)}>
          <source src={assetUrl(img.hero_video)} type="video/mp4" />
        </video>
        <div className="inner">
          <Rich as="h1" className="display maxw-14em" html={s.hero.title} />
          <p className="sub sub-long">{s.hero.subtitle}</p>
          <p className="eyebrow mt-1p6 c-bone85">{s.hero.place}</p>
          <div className="ctas">
            <a className="btn btn-sea" href={site.booking_url}>
              {s.hero.cta_reserve}
            </a>
            <A className="btn" href={to('stay')}>
              {s.hero.cta_villa}
            </A>
          </div>
        </div>
        <div className="scrollcue">{s.hero.scroll_cue}</div>
      </section>
      <section className="m-intro">
        <Spiral className="m-0-auto-1p4 d-block" />
        <p>{s.mobile_intro.text}</p>
        <A className="link" href={to('stay')}>
          {s.mobile_intro.link_label}
        </A>
      </section>

      <section className="statement reveal">
        <span className="eyebrow">{s.statement.eyebrow}</span>
        <Rich as="p" html={s.statement.text} />
      </section>
      <div className="stats reveal">
        {s.stats.map((st) => (
          <div key={st.label}>
            <b>{st.value}</b>
            <span>{st.label}</span>
          </div>
        ))}
      </div>

      <section className="pad pt-1">
        <div className="wrap split">
          <div className="reveal">
            <SectionMark eyebrow={s.intro.eyebrow} />
            <Rich as="h2" className="display" html={s.intro.headline} />
            <p className="lede mt-1p3">{s.intro.body}</p>
            <p className="lede mt-1 ff-serif fst-italic fs-1p2">{s.intro.quote}</p>
            <div className="mt-2">
              <A className="link" href={to('about')}>
                {s.intro.link_label}
              </A>
            </div>
          </div>
          <Img className="reveal" image={img.intro} alt={s.intro.image_alt} />
        </div>
      </section>

      <section className="pad-dark">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={s.villas.eyebrow} />
          <Rich as="h2" className="display reveal" html={s.villas.headline} />
          <div className="grid3">
            {s.villas.cards.map((c, i) => (
              <A key={c.title} className={['card villa-card reveal', delay(i)].filter(Boolean).join(' ')} href={to('stay')}>
                <Img image={img.villa_cards[i]} alt={c.alt} />
                <div className="body">
                  <h4>{c.title}</h4>
                  <p>{c.text}</p>
                  <span className="tag">{c.tag}</span>
                </div>
              </A>
            ))}
          </div>
          <div className="mt-2p8 d-flex gap-1 fw-wrap">
            <A className="btn" href={to('stay')}>
              {s.villas.compare_label}
            </A>
            <A className="btn" href={to('stay', 'casa-tanama')}>
              {s.villas.detail_label}
            </A>
          </div>
        </div>
      </section>

      <section className="pad-sand">
        <div className="wrap maxw-840px ta-center">
          <Spiral className="reveal m-0-auto" />
          <p className="eyebrow reveal mt-1p4">{s.buyouts.eyebrow}</p>
          <Rich as="h2" className="display reveal mt-1" html={s.buyouts.headline} />
          <p className="reveal mt-1p2 fs-1p02 maxw-40em ml-auto mr-auto">{s.buyouts.text}</p>
          <p className="reveal mt-1p8">
            <A className="link" href={to('plan')}>
              {s.buyouts.link_label}
            </A>
          </p>
        </div>
      </section>

      <section className="pad">
        <div className="wrap split">
          <Img className="reveal wide" image={img.dining} alt={s.dining.image_alt} />
          <div className="reveal">
            <SectionMark eyebrow={s.dining.eyebrow} />
            <Rich as="h2" className="display" html={s.dining.headline} />
            <p className="lede mt-1p2">{s.dining.text}</p>
            <div className="mt-2">
              <A className="link" href={to('dining')}>
                {s.dining.link_label}
              </A>
            </div>
          </div>
        </div>
      </section>

      <section className="pad bg-jungle-2 c-bone ta-center">
        <div className="wrap maxw-820px">
          <Spiral className="reveal m-0-auto stroke-sea" />
          <p className="eyebrow reveal mt-1p4 c-sea">{s.sustainability.eyebrow}</p>
          <p className="reveal ff-serif fs-clamp-1p25-2p6vw-1p8 mt-1p2">{s.sustainability.lead}</p>
          <p className="reveal mt-1 fs-p98 c-bone85 maxw-38em ml-auto mr-auto">{s.sustainability.text}</p>
          <p className="reveal mt-1p6">
            <A className="link c-bone bc-bone4" href={to('sustainability')}>
              {s.sustainability.link_label}
            </A>
          </p>
        </div>
      </section>

      <section className="pad-sand">
        <div className="wrap">
          <SectionMark className="reveal" eyebrow={s.experiences.eyebrow} />
          <Rich as="h2" className="display reveal" html={s.experiences.headline} />
          <div className="grid3">
            {s.experiences.cards.map((c, i) => (
              <A
                key={c.title}
                className={['card reveal', delay(i)].filter(Boolean).join(' ')}
                href={to((['experiences', 'wellness', 'hospitality'] as const)[i])}
              >
                <Img image={img.experience_cards[i]} alt={c.alt} />
                <div className="body">
                  <h4>{c.title}</h4>
                  <p>{c.text}</p>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      <div className="quoteband">
        <Spiral />
        <p className="eyebrow mb-1p8">
          <a href={site.google_reviews_url} className="bb-current">
            {s.reviews.rating_label}
          </a>
        </p>
        <QuoteRotator quotes={s.reviews.quotes} />
        <p className="mt-1p6">
          <a className="link" href={site.google_reviews_url}>
            {s.reviews.link_label}
          </a>
        </p>
      </div>

      <div className="band">
        <Spiral />
        <Rich as="h2" className="display reveal" html={s.band.headline} />
        <p>{s.band.text}</p>
        <div className="d-flex gap-1 jc-center fw-wrap">
          <a className="btn btn-solid bg-sea bc-sea c-jungle" href={site.booking_url}>
            {s.band.cta_availability}
          </a>
          <A className="btn" href={to('plan')}>
            {s.band.cta_plan}
          </A>
        </div>
      </div>
    </main>
  );
}
