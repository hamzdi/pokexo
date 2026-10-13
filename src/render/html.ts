/** Minimal HTML helpers for string-based templates. */

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** A fragment that is already safe HTML; `html` interpolates it verbatim. */
export class Fragment {
  constructor(public readonly html: string) {}
  toString(): string {
    return this.html;
  }
}

function renderValue(value: unknown): string {
  if (value instanceof Fragment) return value.html;
  if (Array.isArray(value)) return value.map(renderValue).join('');
  if (typeof value === 'number') return String(value);
  if (value == null || value === false) return '';
  return escapeHtml(String(value));
}

/**
 * Tagged template that escapes interpolated strings. Nested `html` fragments,
 * arrays of fragments and numbers are inserted as is, so templates compose
 * without double escaping.
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): Fragment {
  const markup = strings.reduce((out, chunk, i) => out + renderValue(values[i - 1]) + chunk);
  return new Fragment(markup);
}

/** Wrap trusted markup so `html` does not escape it. */
export function raw(markup: string): Fragment {
  return new Fragment(markup);
}
