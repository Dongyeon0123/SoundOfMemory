import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
};