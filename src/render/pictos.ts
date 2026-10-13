/** Instruction pictograms (stroke SVG, from the Claude Design charte). */
import { raw, type Fragment } from './html.ts';

export type PictoKey = 'ecoute' | 'ecris' | 'calcule' | 'relie' | 'entoure' | 'colorie';

const PATHS: Record<PictoKey, { label: string; body: string }> = {
  ecoute: { label: 'Écoute', body: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"></path><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"></path>' },
  ecris: { label: 'Écris', body: '<path d="M4 20l1.2-4.4L16 4.8l3.2 3.2L8.4 18.8z"></path><path d="M13.6 7.2l3.2 3.2"></path>' },
  calcule: { label: 'Calcule', body: '<path d="M4 7h6M7 4v6M14 7h6M4.8 14.8l4.4 4.4M9.2 14.8l-4.4 4.4M14 15.5h6M14 18.5h6"></path>' },
  relie: { label: 'Relie', body: '<circle cx="5" cy="6" r="2"></circle><circle cx="19" cy="18" r="2"></circle><path d="M7 6c7 0 3 12 10 12"></path>' },
  entoure: { label: 'Entoure', body: '<ellipse cx="12" cy="11" rx="8" ry="6.5"></ellipse><path d="M8 16.5L6 21"></path><circle cx="12" cy="11" r="1.5" fill="currentColor"></circle>' },
  colorie: { label: 'Colorie', body: '<path d="M15 3.5l5.5 5.5L10 19.5H4.5V14z"></path><path d="M12.5 6l5.5 5.5"></path><path d="M4 22h16"></path>' },
};

export function picto(key: PictoKey, size = 30): Fragment {
  const { label, body } = PATHS[key];
  return raw(
    `<svg class="picto" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}">${body}</svg>`,
  );
}
