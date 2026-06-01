import * as cheerio from "cheerio";

export interface FetchedSite {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  h3: string[];
  paragraphs: string[];
  ctas: string[];
  /** Texto estruturado pronto para o agente (máx. ~8000 chars). */
  structuredText: string;
}

const MAX_CHARS = 8000;
const CTA_HINTS = [
  "agende",
  "agendar",
  "solicite",
  "solicitar",
  "orçamento",
  "orcamento",
  "contato",
  "fale",
  "compre",
  "comprar",
  "assine",
  "cadastre",
  "saiba mais",
  "ligue",
  "whatsapp",
  "marcar",
  "consulta",
  "reserve",
  "começe",
  "comece",
  "quero",
];

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function looksLikeCta(text: string): boolean {
  const t = text.toLowerCase();
  return CTA_HINTS.some((h) => t.includes(h)) && text.length <= 60;
}

export async function fetchAndParseSite(rawUrl: string): Promise<FetchedSite> {
  const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AdGenProBot/1.0; +https://mpassessoria.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar a URL (HTTP ${res.status}).`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  $("script, style, noscript, svg, iframe").remove();

  const title = clean($("title").first().text());
  const metaDescription = clean(
    $('meta[name="description"]').attr("content") || ""
  );

  const collect = (sel: string) =>
    $(sel)
      .map((_, el) => clean($(el).text()))
      .get()
      .filter((t) => t.length > 0);

  const h1 = collect("h1");
  const h2 = collect("h2");
  const h3 = collect("h3");

  const paragraphs = $("p")
    .map((_, el) => clean($(el).text()))
    .get()
    .filter((t) => t.length >= 40)
    .slice(0, 40);

  const ctaSet = new Set<string>();
  $("a, button").each((_, el) => {
    const t = clean($(el).text());
    if (t && looksLikeCta(t)) ctaSet.add(t);
  });
  const ctas = Array.from(ctaSet).slice(0, 15);

  const structuredText = [
    `TÍTULO: ${title}`,
    `META DESCRIPTION: ${metaDescription}`,
    `H1: ${h1.join(" | ")}`,
    `H2: ${h2.slice(0, 15).join(" | ")}`,
    `H3: ${h3.slice(0, 15).join(" | ")}`,
    `CTAs ENCONTRADOS: ${ctas.join(" | ")}`,
    `PARÁGRAFOS:`,
    paragraphs.join("\n"),
  ]
    .join("\n")
    .slice(0, MAX_CHARS);

  return {
    url,
    title,
    metaDescription,
    h1,
    h2,
    h3,
    paragraphs,
    ctas,
    structuredText,
  };
}
