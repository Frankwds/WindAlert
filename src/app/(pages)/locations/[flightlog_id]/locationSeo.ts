import type { ParaglidingLocation } from '@/lib/supabase/types';

const BASE_URL = 'https://windlord.no';
const SITE_NAME = 'WindLord';

/** Deterministic 0..n-1 from flightlog id so titles vary across ~4000 pages without randomness. */
export function templateIndex(flightlogId: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < flightlogId.length; i++) {
    h = (Math.imul(31, h) + flightlogId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

export function stripHtmlToText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateTitle(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  const cut = name.slice(0, maxLen - 1).trim();
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.5 ? cut.slice(0, lastSpace) : cut) + '…';
}

const TITLE_MAX = 68;

/** ~55–62 chars before brand; primary keywords + place name visibility in SERP. */
export function buildLocationTitle(location: ParaglidingLocation, flightlogId: string): string {
  const name = location.name.trim() || `Start #${flightlogId}`;
  const shortName = truncateTitle(name, 28);
  const idx = templateIndex(flightlogId, 6);

  const candidates = [
    `${shortName} – paragliding starter & vær | Norge`,
    `Paragliding ${shortName}: kart, vind og flyvær`,
    `${shortName} | paragliding vær & starter · Norge`,
    `${shortName} – flyvær, kart og paragliding i Norge`,
    `Paragliding-starter ${shortName} – vær på kartet`,
    `${shortName}: paragliding vær, vindretning & kart`,
  ];

  let base = candidates[idx];
  if (base.length > 62) {
    base = `${truncateTitle(name, 22)} – paragliding vær & starter | Norge`;
  }
  if (base.length > 65) {
    base = `${truncateTitle(name, 20)} | paragliding vær · Norge`;
  }

  let full = `${base} | ${SITE_NAME}`;
  if (full.length > TITLE_MAX) {
    base = `${truncateTitle(name, 18)} | paragliding vær | Norge`;
    full = `${base} | ${SITE_NAME}`;
  }
  if (full.length > TITLE_MAX) {
    full = `${truncateTitle(name, 14)} – PG vær | ${SITE_NAME}`;
  }
  return full;
}

const DESC_MIN = 145;
const DESC_MAX = 160;

function countryPhrase(country: string | undefined): string {
  const c = (country || '').trim().toLowerCase();
  if (c === 'no' || c === 'norway' || c === 'norge') return 'Norge';
  if (c) return country!.trim();
  return 'Norge';
}

/** ISO 3166-1 alpha-2 for schema.org addressCountry */
export function addressCountryCode(country: string | undefined): string {
  const c = (country || '').trim().toLowerCase();
  if (/^(no|norway|norge)$/.test(c)) return 'NO';
  if (/^(se|sweden|sverige)$/.test(c)) return 'SE';
  if (/^(dk|denmark|danmark)$/.test(c)) return 'DK';
  if (/^(fi|finland|suomi)$/.test(c)) return 'FI';
  if (/^[a-z]{2}$/.test(c)) return c.toUpperCase();
  return 'NO';
}

/** Unique, keyword-rich meta description within SERP limits. */
export function buildLocationDescription(location: ParaglidingLocation, flightlogId: string): string {
  const name = location.name.trim() || `Paragliding-starter (${flightlogId})`;
  const country = countryPhrase(location.country);
  const idx = templateIndex(flightlogId, 5);

  let fromDb = '';
  if (location.description) {
    fromDb = stripHtmlToText(location.description).replace(/\s+/g, ' ');
    if (fromDb.length > 120) fromDb = fromDb.slice(0, 117).trim() + '…';
  }

  const suffixes = [
    ` Paragliding kart, værmelding og vind for starter i ${country}.`,
    ` Se paragliding vær på kart, vindretning og flybarhet for ${country}.`,
    ` WindLord: paragliding-starter, kart og oppdatert vær for piloter i ${country}.`,
    ` Kart med paragliding vær og vinddata – tryggere vurdering før flyging i ${country}.`,
    ` Utforsk denne starteren med paragliding vær, kart og sanntidsdata i ${country}.`,
  ];

  let body = fromDb ? `${fromDb}` : '';
  const suffix = suffixes[idx];

  if (body) {
    let combined = body + suffix;
    if (combined.length > DESC_MAX) {
      const room = DESC_MAX - suffix.length - 4;
      if (room > 40) {
        body = body.slice(0, room).trim() + '…';
        combined = body + suffix;
      } else {
        combined = suffix.trimStart();
      }
    }
    if (combined.length < DESC_MIN && !combined.includes(name)) {
      combined = `${name}: ${combined}`.slice(0, DESC_MAX);
    }
    return combined.slice(0, DESC_MAX);
  }

  const noDescVariants = [
    `${name}: paragliding vær, kart og vind for denne starteren i ${country}. WindLord samler værmelding og kart for piloter.`,
    `Paragliding-starter ${name} i ${country} – se vær på kartet, vind, temperatur og flybarhet med WindLord.`,
    `${name} på paragliding-kart med værmelding og vindretning. Planlegg flyging i ${country} med WindLord.`,
    `Flyvær og paragliding kart for ${name} (${country}). Sjekk vind og forhold før du flyr – WindLord.`,
    `${name}: kart for paragliding, oppdatert vær og vinddata. Starter i ${country} – WindLord for PG-piloter.`,
  ];

  const pick = noDescVariants[idx];
  return pick.length <= DESC_MAX ? pick : pick.slice(0, DESC_MAX - 1) + '…';
}

export function buildLocationKeywords(location: ParaglidingLocation): string {
  const name = location.name.trim();
  const country = countryPhrase(location.country);
  const parts = [
    'paragliding',
    'paragliding vær',
    'paragliding kart',
    'paragliding starter',
    'paragliding-starter',
    'flyvær',
    'værmelding',
    'vind',
    'vindretning',
    'kart',
    'Norge',
    country !== 'Norge' ? country : '',
    name,
    'WindLord',
    'PG',
  ].filter(Boolean);
  return [...new Set(parts)].join(', ');
}

export function buildLocationOgAlt(location: ParaglidingLocation): string {
  const name = location.name.trim() || 'Paragliding-starter';
  return `WindLord – ${name}: paragliding vær og kart i Norge`;
}

export type LocationJsonLdGraph = Record<string, unknown>;

export function buildLocationJsonLd(
  location: ParaglidingLocation,
  flightlogId: string
): LocationJsonLdGraph {
  const pageUrl = `${BASE_URL}/locations/${flightlogId}`;
  const placeId = `${pageUrl}#place`;
  const webpageId = `${pageUrl}#webpage`;
  const name = location.name.trim() || `Paragliding-starter ${flightlogId}`;
  const desc = buildLocationDescription(location, flightlogId);
  const iso = addressCountryCode(location.country);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Place', 'TouristAttraction'],
        '@id': placeId,
        name,
        description: desc,
        url: pageUrl,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: location.latitude,
          longitude: location.longitude,
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: iso,
        },
        ...(location.altitude != null && Number.isFinite(location.altitude)
          ? { elevation: Math.round(location.altitude) }
          : {}),
      },
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url: pageUrl,
        name: buildLocationTitle(location, flightlogId),
        description: desc,
        inLanguage: 'nb-NO',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': placeId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/windlord.png`,
        },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: SITE_NAME,
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Alle paragliding-starter',
            item: `${BASE_URL}/locations/all`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name,
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
