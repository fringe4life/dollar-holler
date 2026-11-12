/**
 * js-xss `require`s cssfilter at module load even when `css: false`.
 * Invoice sanitizer never uses style attributes.
 */
export class FilterCSS {
  process(css: unknown) {
    return css == null ? "" : String(css);
  }
}

export function getDefaultWhiteList() {
  return {};
}
