/** "Phone calls" / "WhatsApp" after a number; nothing when the label isn't set. */
export function ContactLabel({ text }: { text?: string | null }) {
  return text ? <span className="contact-label">{text}</span> : null;
}
