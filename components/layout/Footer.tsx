import { A } from '@/components/A';
import type { SiteSettings, SiteSettingsT } from '@/lib/types';
import type { NavLink } from './Header';

type Props = { site: SiteSettings; t: SiteSettingsT; explore: NavLink[]; planHref: string };

export function Footer({ site, t, explore, planHref }: Props) {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand">OCAMA</div>
            <p className="maxw-26em">{t.footer_copy}</p>
          </div>
          <div>
            <h5>{t.footer_explore_title}</h5>
            <ul>
              {explore.map((n) => (
                <li key={n.key}>
                  <A href={n.href}>{n.label}</A>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>{t.footer_plan_title}</h5>
            <ul>
              <li>
                <a href={site.booking_url}>{t.reserve_long_label}</a>
              </li>
              <li>
                <A href={planHref}>{t.footer_plan_begin}</A>
              </li>
              <li>
                <A href={planHref}>{t.footer_plan_getting_here}</A>
              </li>
              <li>
                <a href={`tel:${site.phone.replace(/-/g, '')}`}>{site.phone_display}</a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href={site.instagram_url}>Instagram</a> · <a href={site.tiktok_url}>TikTok</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-base">
          <span>{t.footer_copyright}</span>
          <span>
            <a href={site.google_reviews_url} className="bb-bone35">
              {t.footer_reviews_label}
            </a>
          </span>
          <span>{t.footer_meaning}</span>
        </div>
      </div>
    </footer>
  );
}
