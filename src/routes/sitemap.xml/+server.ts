import type { RequestHandler } from "./$types";

const PUBLIC_PATHS = ["/"] as const;

export const GET: RequestHandler = ({ url }) => {
  const origin = url.origin;
  const entries = PUBLIC_PATHS.map(
    (path) => `  <url>
    <loc>${origin}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`
  ).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${entries}
  </urlset>
  `;

  return new Response(body, {
    headers: {
      "Cache-Control": "max-age=3600",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
