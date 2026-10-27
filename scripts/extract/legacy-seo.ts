/**
 * Carries the SEO of the current live site (../ocama, English only) into the snapshot:
 * titles, descriptions, Open Graph titles/descriptions and share images with their alt text.
 * English values are read from the old HTML; corrections are listed in FIXES; Spanish is
 * translated by hand in ES below. Share images were copied to public/og/ (the old WordPress
 * host goes away at cutover) and are referenced as site paths, replaceable by Directus file ids.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import type { Offer, Page, SeoT, SiteSettings, Villa } from '../../lib/types';
import { SEO_NULL } from './lib';

const OLD_SITE = path.resolve(import.meta.dirname, '../../../ocama');
const PUBLIC = path.resolve(import.meta.dirname, '../../public');

type Legacy = { title: string; description: string | null; og_title: string; og_description: string; og_image: string; og_image_alt: string };

/** Old page → new page key (villas map by their own slug). */
const PAGE_MAP: Record<string, string> = {
  'index.html': 'home',
  'about/index.html': 'about',
  'villas/index.html': 'stay',
  'experiences/dining/index.html': 'dining',
  'experiences/wellness/index.html': 'wellness',
  'experiences/activities/index.html': 'experiences',
  'experiences/5-stars-services/index.html': 'hospitality',
  'contact/index.html': 'plan',
  'promotions/index.html': 'offers',
};

/** Corrections to the old data, applied to the English text (find → replace). */
const FIXES: [RegExp, string][] = [
  [/\.6\.5$/, '.'], // stray "6.5" at the end of the villas description
  [/Saman Peninsula/, 'Samaná Peninsula'],
  [/forrest/g, 'forest'],
  // The old dining copy credits a previous chef; the 2.0 dining page credits Chef Fierro Pérez Castillo.
  [
    /^Dining at OCAMA is in the magic hands of Chef Ray\. Drawing from his Cocolo heritage, he and his team passionately explore/,
    'Dining at OCAMA is in the hands of Chef Fierro Pérez Castillo and his team, who passionately explore',
  ],
];
/** Casa Bagua's old share image alt text describes Casa Guama. */
const ALT_FIXES: Record<string, string> = {
  'villas/casa-bagua/index.html': 'Image of casa bagua between the forest with view to the ocean',
};

const fix = (s: string) => FIXES.reduce((acc, [re, to]) => acc.replace(re, to), s.replace(/\s+/g, ' ').trim());

function readLegacy(rel: string): Legacy {
  const file = path.join(OLD_SITE, rel);
  if (!existsSync(file)) throw new Error(`legacy SEO: ${rel} not found in ../ocama`);
  const $ = cheerio.load(readFileSync(file, 'utf8'));
  const meta = (sel: string) => {
    const v = $(sel).attr('content');
    if (!v) throw new Error(`legacy SEO: ${rel} has no ${sel}`);
    return fix(v);
  };
  // experiences/dining has two <title>s; the second ("Dining - OCAMA") is the real one.
  const title = $('title').last().text().trim();
  const image = path.basename(meta('meta[property="og:image"]'));
  if (!existsSync(path.join(PUBLIC, 'og', image))) throw new Error(`legacy SEO: public/og/${image} missing`);
  return {
    title,
    description: $('meta[name="description"]').attr('content') ? meta('meta[name="description"]') : null,
    og_title: meta('meta[property="og:title"]'),
    og_description: meta('meta[property="og:description"]'),
    og_image: `/og/${image}`,
    og_image_alt: ALT_FIXES[rel] ?? meta('meta[property="og:image:alt"]'),
  };
}

/** Spanish translations of the old English SEO. */
const ES: Record<string, Omit<SeoT, 'og_title' | 'og_description'> & { og_title: string | null; og_description: string | null }> = {
  home: {
    meta_title: 'OCAMA',
    meta_description:
      'Nuestras 8 villas privadas son exquisitas obras de arquitectura de tres niveles, de un lujo contemporáneo discreto, integradas por completo en el frondoso bosque tropical. Rodeadas de senderos y con impresionantes vistas al mar, son un raro oasis de tranquilidad y belleza.',
    og_title: 'OCAMA es un hotel boutique tropical de 35 acres en las colinas con vista a la bahía de Rincón.',
    og_description:
      'OCAMA es un hotel boutique tropical de 35 acres en las colinas con vista a la bahía de Rincón. Ofrece una vida de lujo tropical, privacidad y acceso directo a varias de las playas más vírgenes de la península de Samaná.',
    og_image_alt: 'Vista de la bahía de Rincón desde una de las villas',
  },
  about: {
    meta_title: 'Sobre nosotros - OCAMA',
    meta_description:
      'Descubra qué hace que OCAMA sea especial y única: conozca nuestros valores, a nuestro equipo y cómo llegar.',
    og_title: 'Sobre OCAMA',
    og_description: null,
    og_image_alt: 'Foto de todo el equipo de Ocama',
  },
  stay: {
    meta_title: 'Villas - OCAMA',
    meta_description:
      'Escondidas entre una exuberante vegetación tropical, nuestras villas privadas combinan a la perfección lujo contemporáneo y tranquilidad. Sumérjase en la paz y la serenidad, con momentos sin interrupciones e impresionantes vistas al mar, mientras lo envuelven los sonidos de la naturaleza.',
    og_title: 'Villas en OCAMA',
    og_description: null,
    og_image_alt: 'Vista previa de las villas',
  },
  dining: {
    meta_title: 'Gastronomía - OCAMA',
    meta_description:
      'La gastronomía en OCAMA está en manos del chef Fierro Pérez Castillo y su equipo, que exploran con pasión la riqueza de los sabores dominicanos, combinando ingredientes prehispánicos con un toque contemporáneo.',
    og_title: 'Gastronomía en OCAMA',
    og_description: null,
    og_image_alt: 'Un plato con camarones, salsa de coco y yuca frita',
  },
  wellness: {
    meta_title: 'Bienestar - OCAMA',
    meta_description:
      'El entorno de bosque de OCAMA convierte su villa en un refugio sanador. Disfrute de tratamientos de spa personalizados, en interiores y al aire libre, pensados para su bienestar.',
    og_title: 'Bienestar en OCAMA',
    og_description: null,
    og_image_alt: 'Dos personas recibiendo un masaje frente a la playa',
  },
  experiences: {
    meta_title: 'Actividades - OCAMA',
    meta_description:
      'Samaná es un paraíso para los amantes de la naturaleza. Disfrute de paisajes marinos impresionantes, montañas exuberantes, cascadas y cuevas escondidas en esta joya costera.',
    og_title: 'Actividades alrededor de OCAMA',
    og_description: null,
    og_image_alt: 'Una ballena en la bahía de Samaná',
  },
  hospitality: {
    meta_title: 'Servicios 5 estrellas - OCAMA',
    meta_description:
      'En OCAMA invitamos a nuestros huéspedes a vivir la máxima expresión del lujo, con servicios personalizados de 5 estrellas pensados para superar todas sus expectativas.',
    og_title: 'Servicios 5 estrellas en OCAMA',
    og_description: null,
    og_image_alt: 'Imagen con 5 estrellas',
  },
  plan: {
    meta_title: 'Contacto - OCAMA',
    meta_description: 'Contáctenos en OCAMA para más información o para hacer una reserva.',
    og_title: 'Contáctenos en OCAMA',
    og_description: null,
    og_image_alt: 'Imagen de una persona marcando un teléfono',
  },
  offers: {
    meta_title: 'OCAMA - Promociones',
    meta_description: 'OCAMA es un hotel boutique tropical de 35 acres en las colinas con vista a la bahía de Rincón.',
    og_title: null,
    og_description: null,
    og_image_alt: 'Vista de la bahía de Rincón desde una de las villas',
  },
};

/** Villa share descriptions follow one pattern; the Spanish keeps the Taíno meaning and the view. */
const VILLA_ES: Record<string, { meaning: string; views: string; alt: string }> = {
  ana: { meaning: 'flor', views: 'vistas espectaculares al mar', alt: 'Casa Ana entre el bosque con vista al mar' },
  bagua: { meaning: 'mar', views: 'espectaculares vistas panorámicas al mar', alt: 'Casa Bagua entre el bosque con vista al mar' },
  bajacu: { meaning: 'la luz de la mañana', views: 'vistas íntimas al mar y un jardín con hamaca', alt: 'Casa Bajacú entre el bosque con vista al mar' },
  guada: { meaning: 'jardín', views: 'vistas espectaculares al mar', alt: 'Casa Guada entre el bosque' },
  guama: { meaning: 'árbol grande de sombra', views: 'vistas espectaculares al mar', alt: 'Casa Guama entre el bosque con vista al mar' },
  kachi: { meaning: 'sol', views: 'majestuosas vistas panorámicas al mar', alt: 'Casa Kachi entre el bosque con vista al mar' },
  tanama: { meaning: 'mariposa', views: 'vistas espectaculares al mar', alt: 'Casa Tanama entre el bosque' },
  turey: { meaning: 'cielo', views: 'vistas espectaculares al mar', alt: 'Casa Turey entre el bosque' },
};

/** Seed descriptions for the offers, [en, es], written from each offer's own copy. */
const OFFER_DESCRIPTIONS: Record<string, [string, string]> = {
  extend: [
    'Reserve four consecutive nights above Rincón Bay and receive a fifth night on us, with daily breakfast, at Ocama in Las Galeras, Samaná.',
    'Reserve cuatro noches consecutivas sobre la bahía de Rincón y la quinta es nuestra, con desayuno diario, en Ocama, Las Galeras, Samaná.',
  ],
  taste: [
    'A three-night introduction to Ocama for first-time guests: slow mornings in a private villa, sunset cocktails and the walk down to Playa del Amor.',
    'Una introducción de tres noches a Ocama para quienes nos visitan por primera vez: mañanas lentas en una villa privada, cócteles al atardecer y Playa del Amor.',
  ],
  discovery: [
    'A five-night stay pairing a private villa with Samaná beyond it: the beaches of Rincón, Frontón and Madama, a curated excursion and whale season.',
    'Cinco noches que unen una villa privada con la Samaná que la rodea: las playas de Rincón, Frontón y Madama, una excursión a la medida y las ballenas.',
  ],
  romance: [
    'A three-night couples escape above the Caribbean: villa privacy for two, breakfast overlooking Rincón Bay, sunset cocktails and a couples massage.',
    'Una escapada de tres noches para parejas sobre el Caribe: privacidad para dos, desayuno frente a la bahía de Rincón, cócteles al atardecer y masaje en pareja.',
  ],
  longer: [
    'Seven nights above Rincón Bay with space to work, rest and explore: high-speed Wi-Fi and remote-work support in a private villa in Samaná.',
    'Siete noches sobre la bahía de Rincón con espacio para trabajar, descansar y explorar: Wi-Fi de alta velocidad y apoyo para trabajo remoto en Samaná.',
  ],
  dominican: [
    'The Dominican Escape: a three-night stay for Dominican residents and citizens at Ocama, a quieter way to experience Samaná without traveling far.',
    'La Escapada Dominicana: tres noches para residentes y ciudadanos dominicanos en Ocama, una manera más serena de vivir Samaná sin viajar lejos.',
  ],
};

/** First sentences of `text` that fit in `max` characters (seed descriptions for pages the old site lacked). */
function seedDescription(text: string, max = 160): string {
  const plain = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const sentences = plain.match(/[^.!?]+[.!?]+/g) ?? [plain];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  if (out) return out.trim();
  return `${plain.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

const OG_IF_DIFFERENT = (v: string, base: string | null) => (v === base ? null : v);

export function applyLegacySeo(site: SiteSettings, villas: Villa[], offers: Offer[], pages: Page[]) {
  // Site-wide defaults: the old home share image.
  const home = readLegacy('index.html');
  site.og_image = home.og_image;
  site.translations[0].og_image_alt = home.og_image_alt;
  site.translations[1].og_image_alt = ES.home.og_image_alt!;

  for (const page of pages) {
    const oldFile = Object.keys(PAGE_MAP).find((f) => PAGE_MAP[f] === page.key);
    const [en, es] = page.translations;
    if (!oldFile) {
      // No counterpart on the old site (sustainability, press): "<nav label> - OCAMA" and a description from the hero.
      const label = (lang: 0 | 1) => site.translations[lang].footer_explore.find((n) => n.key === page.key)?.label ?? page.translations[lang].title;
      for (const [i, t] of [en, es].entries()) {
        const hero = (t.sections as { hero?: { subtitle?: string } }).hero;
        Object.assign(t, SEO_NULL, {
          meta_title: `${label(i as 0 | 1)} - OCAMA`,
          meta_description: hero?.subtitle ? seedDescription(hero.subtitle) : null,
        });
      }
      page.og_image = null;
      continue;
    }
    const old = readLegacy(oldFile);
    page.og_image = old.og_image;
    const description = old.description ?? old.og_description;
    Object.assign(en, {
      meta_title: old.title,
      meta_description: description,
      og_title: OG_IF_DIFFERENT(old.og_title, old.title),
      og_description: OG_IF_DIFFERENT(old.og_description, description),
      og_image_alt: old.og_image_alt,
    });
    // The old promotions page reused the home share title and a truncated home description;
    // keep its title but use its (complete) og:description, so it doesn't duplicate home.
    if (page.key === 'offers') Object.assign(en, { meta_description: old.og_description, og_title: null, og_description: null });
    Object.assign(es, ES[page.key]);
  }

  for (const v of villas) {
    const old = readLegacy(`villas/casa-${v.id}/index.html`);
    const [en, es] = v.translations;
    const x = VILLA_ES[v.id];
    v.og_image = old.og_image;
    Object.assign(en, {
      meta_title: old.title,
      meta_description: old.og_description,
      og_title: OG_IF_DIFFERENT(old.og_title, old.title),
      og_description: null,
      og_image_alt: old.og_image_alt,
    });
    Object.assign(es, {
      meta_title: `${es.name} - OCAMA`,
      meta_description: `${es.name}, palabra taína que significa «${x.meaning}», es una impresionante villa de tres niveles con ${x.views}. Su diseño abierto, con lujosas habitaciones, varias terrazas y piscina infinita, ofrece lo máximo en relajación y tranquilidad.`,
      og_title: es.name,
      og_description: null,
      og_image_alt: x.alt,
    });
  }

  // The old promotion pages all shared boilerplate SEO, so each offer gets its own seed, editable in Directus.
  for (const o of offers) {
    const d = OFFER_DESCRIPTIONS[o.id];
    if (!d) throw new Error(`legacy SEO: no seed description for offer ${o.id}`);
    o.translations.forEach((t, i) => {
      Object.assign(t, SEO_NULL, { meta_title: `${t.title} - OCAMA`, meta_description: d[i] });
    });
  }
}
