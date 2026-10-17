'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

type LatLng = [number, number];

/** Quadratic arc between two points (map.js arcPoints). */
function arcPoints(a: LatLng, b: LatLng, curve = 0.18): LatLng[] {
  const pts: LatLng[] = [];
  const n = 64;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const cx = mx + curve * -dy;
  const cy = my + curve * dx;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([
      (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * cx + t * t * b[0],
      (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * cy + t * t * b[1],
    ]);
  }
  return pts;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SPIRAL =
  '<svg width="26" height="26" viewBox="0 0 40 40"><path d="M20 20 m0 -1 a1 1 0 0 1 1 1 a2.4 2.4 0 0 1 -2.4 2.4 a4 4 0 0 1 -4 -4 a5.8 5.8 0 0 1 5.8 -5.8 a7.6 7.6 0 0 1 7.6 7.6 a9.6 9.6 0 0 1 -9.6 9.6 a11.6 11.6 0 0 1 -11.6 -11.6 a13.6 13.6 0 0 1 13.6 -13.6 a15.6 15.6 0 0 1 15.6 15.6" fill="none" stroke="#5FBFAE" stroke-width="2.4" stroke-linecap="round"/></svg>';

/**
 * map.js arrival map. The container renders on the server; Leaflet is imported only in the
 * browser, only on the page that mounts this component.
 */
export function ArrivalMap({ label, lat, lng }: { label: string; lat: number; lng: number }) {
  const t = useTranslations('map');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import('leaflet').Map | null = null;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !ref.current) return;
      const OCAMA: LatLng = [lat, lng];
      const AZS: LatLng = [19.267, -69.742];
      const SDQ: LatLng = [18.4297, -69.6689];
      const PUJ: LatLng = [18.5675, -68.3634];
      const m = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true });
      map = m;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(m);
      const mk = (pos: LatLng, html: string, size: [number, number], anchor: [number, number]) =>
        L.marker(pos, { icon: L.divIcon({ html, className: '', iconSize: size, iconAnchor: anchor }) }).addTo(m);
      const popup = (key: 'ocama' | 'azs' | 'sdq' | 'puj') => `<b>${esc(t(`${key}Title`))}</b>${esc(t(`${key}Text`))}`;
      const dot = '<div class="am-dot"></div>';

      mk(OCAMA, `<div class="am-ocama">${SPIRAL}</div>`, [44, 44], [22, 22]).bindPopup(popup('ocama'));
      mk(AZS, dot, [14, 14], [7, 7]).bindPopup(popup('azs'));
      mk(SDQ, dot, [14, 14], [7, 7]).bindPopup(popup('sdq'));
      mk(PUJ, dot, [14, 14], [7, 7]).bindPopup(popup('puj'));
      mk([19.335, -69.155], `<span class="am-label am-main">${esc(t('ocamaLabel'))}</span>`, [70, 24], [35, 12]);
      mk([19.3, -69.8], `<span class="am-label">${esc(t('azsLabel'))}</span>`, [110, 24], [55, -10]);
      mk([18.38, -69.72], `<span class="am-label">${esc(t('sdqLabel'))}</span>`, [100, 24], [50, -10]);
      mk([18.51, -68.37], `<span class="am-label">${esc(t('pujLabel'))}</span>`, [110, 24], [55, -10]);
      const route = { color: '#2E7A6E', weight: 2.2, className: 'route-line' };
      L.polyline(arcPoints(AZS, OCAMA, 0.12), route).addTo(m);
      L.polyline(arcPoints(SDQ, OCAMA, 0.16), route).addTo(m);
      L.polyline(arcPoints(PUJ, OCAMA, 0.14), route).addTo(m);
      m.fitBounds(L.latLngBounds([OCAMA, AZS, SDQ, PUJ]).pad(0.18));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      map?.remove();
    };
  }, [lat, lng, t]);

  return <div id="arrival-map" ref={ref} role="application" aria-label={label}></div>;
}
