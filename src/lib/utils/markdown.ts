/**
 * Server-only markdown utility. Uses Bun.markdown which is only available on the server.
 * Do not import this in client-side code.
 */
import { sanitize } from "isomorphic-dompurify";

export function markdownToHtml(source: string): string {
  if (!source) return "";

  try {
    const html = Bun.markdown.html(source);
    return sanitize(html);
  } catch (error) {
    console.error("Error parsing markdown with Bun.markdown:", error);
    return sanitize(source);
  }
}
