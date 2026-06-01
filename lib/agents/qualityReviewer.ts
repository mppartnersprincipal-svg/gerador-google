import { GOOGLE_ADS_LIMITS, FORBIDDEN_WORDS } from "@/lib/constants/limits";
import type {
  AdGroup,
  CampaignExtensions,
  QualityAlert,
  QualityReview,
} from "@/types/campaign";

const L = GOOGLE_ADS_LIMITS;

function findForbidden(text: string): string | null {
  const t = text.toLowerCase();
  return FORBIDDEN_WORDS.find((w) => t.includes(w.toLowerCase())) ?? null;
}

/**
 * Revisor de qualidade determinístico (PRD §7 — Agente 5).
 * Valida limites de caracteres, contagens, palavras proibidas e duplicidade.
 * Score parte de 100 e desconta por violação. aprovado = score >= 70.
 */
export function reviewCampaign(
  adGroups: AdGroup[],
  extensions?: CampaignExtensions
): QualityReview {
  const alertas: QualityAlert[] = [];
  let score = 100;

  const erro = (campo: string, mensagem: string, sugestao: string) => {
    alertas.push({ tipo: "erro", campo, mensagem, sugestao });
    score -= 10;
  };
  const alerta = (campo: string, mensagem: string, sugestao: string) => {
    alertas.push({ tipo: "alerta", campo, mensagem, sugestao });
    score -= 4;
  };

  if (adGroups.length < L.GROUPS_MIN) {
    alerta(
      "campanha",
      `Apenas ${adGroups.length} grupo(s) — recomendado no mínimo ${L.GROUPS_MIN}.`,
      "Adicione mais grupos de anúncio temáticos."
    );
  }

  // Keywords duplicadas entre grupos
  const seenKw = new Map<string, string>();
  for (const g of adGroups) {
    for (const k of g.keywords) {
      const key = k.term.toLowerCase();
      if (seenKw.has(key)) {
        erro(
          `keyword:${k.term}`,
          `Keyword "${k.term}" repetida nos grupos "${seenKw.get(key)}" e "${g.name}".`,
          "Mantenha cada keyword em um único grupo."
        );
      } else {
        seenKw.set(key, g.name);
      }
    }
  }

  // Validação por grupo/anúncio
  for (const g of adGroups) {
    if (g.ads.length === 0) {
      erro(
        `grupo:${g.name}`,
        `Grupo "${g.name}" não possui anúncio RSA.`,
        "Gere ao menos 1 anúncio para o grupo."
      );
      continue;
    }

    g.ads.forEach((ad, ai) => {
      const ref = `${g.name} / RSA ${ai + 1}`;

      if (ad.headlines.length < L.HEADLINES_PER_AD) {
        alerta(
          `${ref}:titulos`,
          `${ad.headlines.length}/${L.HEADLINES_PER_AD} títulos.`,
          `Complete ${L.HEADLINES_PER_AD} títulos para máximo desempenho.`
        );
      }
      if (ad.descriptions.length < L.DESCRIPTIONS_PER_AD) {
        alerta(
          `${ref}:descricoes`,
          `${ad.descriptions.length}/${L.DESCRIPTIONS_PER_AD} descrições.`,
          `Complete ${L.DESCRIPTIONS_PER_AD} descrições.`
        );
      }

      ad.headlines.forEach((h, i) => {
        if (h.length > L.HEADLINE_MAX_CHARS) {
          erro(
            `${ref}:titulo ${i + 1}`,
            `Título "${h}" tem ${h.length} chars (máx. ${L.HEADLINE_MAX_CHARS}).`,
            "Encurte o título."
          );
        }
        const fb = findForbidden(h);
        if (fb)
          erro(
            `${ref}:titulo ${i + 1}`,
            `Título contém palavra proibida: "${fb}".`,
            "Remova a palavra proibida."
          );
      });

      ad.descriptions.forEach((d, i) => {
        if (d.length > L.DESCRIPTION_MAX_CHARS) {
          erro(
            `${ref}:descrição ${i + 1}`,
            `Descrição tem ${d.length} chars (máx. ${L.DESCRIPTION_MAX_CHARS}).`,
            "Encurte a descrição."
          );
        }
        const fb = findForbidden(d);
        if (fb)
          erro(
            `${ref}:descrição ${i + 1}`,
            `Descrição contém palavra proibida: "${fb}".`,
            "Remova a palavra proibida."
          );
      });
    });
  }

  // Extensões
  if (extensions) {
    extensions.callouts.forEach((c, i) => {
      if (c.length > L.CALLOUT_MAX_CHARS)
        erro(
          `callout ${i + 1}`,
          `Callout "${c}" tem ${c.length} chars (máx. ${L.CALLOUT_MAX_CHARS}).`,
          "Encurte o callout."
        );
    });
    extensions.sitelinks.forEach((s, i) => {
      if (s.title.length > L.SITELINK_TITLE_MAX_CHARS)
        erro(
          `sitelink ${i + 1}`,
          `Título do sitelink excede ${L.SITELINK_TITLE_MAX_CHARS} chars.`,
          "Encurte o título do sitelink."
        );
    });
  }

  score = Math.max(0, Math.min(100, score));
  return { aprovado: score >= 70, score, alertas };
}
