/** Contact links built from site settings, so editors only ever type the numbers. */

/** `tel:` link: digits and a leading +, e.g. +1-849-581-4699 → tel:+18495814699 */
export const telUrl = (number: string) => `tel:${number.replace(/[^\d+]/g, '')}`;

/** WhatsApp click-to-chat: digits only, opens WhatsApp (app or web) directly. */
export const whatsappUrl = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`;
