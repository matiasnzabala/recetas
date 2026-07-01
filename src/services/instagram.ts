/**
 * Servicio de extracción de metadatos desde una URL (Instagram u otras).
 *
 * Instagram no ofrece una API pública sencilla para posts, así que hacemos
 * "best effort" leyendo las etiquetas OpenGraph del HTML público. Puede fallar
 * si Instagram exige login; en ese caso devolvemos lo que se pueda y el resto
 * se completa a mano o con IA.
 */

export interface ScrapedMetadata {
  title?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
  sourceType: "instagram" | "web";
  raw?: string; // texto/descripcion crudo para pasar a la IA
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
};

function getMeta(html: string, property: string): string | undefined {
  // og:*, name="..." y twitter:*
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return undefined;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\\u0026/g, "&");
}

export function isInstagramUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /(^|\.)instagram\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

/** Extrae el @autor desde el título típico de Instagram. */
function extractAuthor(title?: string): string | undefined {
  if (!title) return undefined;
  // "Nombre (@handle) on Instagram: ..."
  const m = title.match(/\(@([^)]+)\)/) || title.match(/@([a-zA-Z0-9._]+)/);
  return m?.[1] ? `@${m[1]}` : undefined;
}

export async function scrapeUrl(inputUrl: string): Promise<ScrapedMetadata> {
  const url = normalizeUrl(inputUrl);
  const instagram = isInstagramUrl(url);
  const result: ScrapedMetadata = {
    sourceType: instagram ? "instagram" : "web",
  };

  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return result;
    const html = await res.text();

    const ogTitle = getMeta(html, "og:title");
    const ogDesc = getMeta(html, "og:description");
    const ogImage = getMeta(html, "og:image");
    const ogVideo =
      getMeta(html, "og:video") ||
      getMeta(html, "og:video:secure_url") ||
      getMeta(html, "og:video:url");
    const twitterImage = getMeta(html, "twitter:image");

    result.title = cleanTitle(ogTitle) || cleanTitle(getPageTitle(html));
    result.description = ogDesc;
    result.imageUrl = ogImage || twitterImage;
    result.videoUrl = ogVideo;
    result.author = extractAuthor(ogTitle) || extractAuthor(ogDesc);
    result.raw = [ogTitle, ogDesc].filter(Boolean).join("\n");
  } catch {
    // silencioso: devolvemos lo que haya
  }

  return result;
}

function getPageTitle(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1] ? decodeEntities(m[1]) : undefined;
}

function cleanTitle(title?: string): string | undefined {
  if (!title) return undefined;
  return title
    .replace(/\s*[·|].*(Instagram|Facebook).*/i, "")
    .replace(/on Instagram.*/i, "")
    .replace(/\(@[^)]+\)/, "")
    .trim()
    .slice(0, 140);
}
