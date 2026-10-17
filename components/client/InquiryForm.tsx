'use client';
import { useTranslations } from 'next-intl';
import type { InquiryFormContent } from '@/lib/pages/plan';

/**
 * main.js inquiry composer: builds a mailto to reservations from the form fields.
 * Fields are uncontrolled and addressed by id, as in the export, so HeliCta can append to the notes.
 */
export function InquiryForm({
  content: c,
  email,
  bookingUrl,
  availabilityLabel,
}: {
  content: InquiryFormContent;
  email: string;
  bookingUrl: string;
  availabilityLabel: string;
}) {
  const t = useTranslations('plan');

  const send = () => {
    const g = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value ?? '';
    const body = t('mailBody', {
      dates: g('f-dates'),
      guests: g('f-guests'),
      occasion: g('f-occasion'),
      villa: g('f-villa'),
      notes: g('f-notes'),
    });
    location.href = `mailto:${email}?subject=${encodeURIComponent(t('mailSubject'))}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="form">
      <div>
        <label htmlFor="f-dates">{c.dates.label}</label>
        <input id="f-dates" type="text" placeholder={c.dates.placeholder} />
      </div>
      <div>
        <label htmlFor="f-guests">{c.guests.label}</label>
        <input id="f-guests" type="text" placeholder={c.guests.placeholder} />
      </div>
      <div>
        <label htmlFor="f-occasion">{c.occasion.label}</label>
        <select id="f-occasion">
          {c.occasion.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-villa">{c.villa.label}</label>
        <select id="f-villa">
          {c.villa.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="full">
        <label htmlFor="f-notes">{c.notes.label}</label>
        <textarea id="f-notes" rows={4} placeholder={c.notes.placeholder}></textarea>
      </div>
      <div className="full d-flex gap-1 fw-wrap">
        <button className="btn btn-solid" id="send-inq" type="button" onClick={send}>
          {c.send_label}
        </button>
        <a className="btn c-ink" href={bookingUrl}>
          {availabilityLabel}
        </a>
      </div>
    </div>
  );
}
