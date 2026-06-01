export type SEOStatus = "ok" | "warning" | "error";

export interface SEOTip {
  item: string;
  status: SEOStatus;
  recomendacao: string;
}

export interface SiteAnalysis {
  proposta_de_valor: string;
  publico_alvo: string;
  palavras_chave_semanticas: string[];
  ctas_encontrados: string[];
  seo_audit: SEOTip[];
  resumo_copy: string;
}
