import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import { MATCH_TYPE_LABELS } from "@/types/keywords";
import { OBJECTIVE_LABELS, RADIUS_LABELS } from "@/types/onboarding";
import type { Campaign } from "@/types/campaign";
import type { SEOTip } from "@/types/agents";

const BLUE = "2563EB";
const GRAY = "64748B";

function statusSymbol(s: SEOTip["status"]): string {
  return s === "ok" ? "✅" : s === "warning" ? "⚠️" : "❌";
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, color: level === HeadingLevel.HEADING_1 ? BLUE : "1E293B" })],
  });
}

function p(text: string, opts: { bold?: boolean; color?: string } = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, bold: opts.bold, color: opts.color })],
  });
}

function cell(text: string, opts: { bold?: boolean; width?: number } = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts.bold, size: 18 })],
      }),
    ],
  });
}

function table(header: string[], rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: header.map((h) => cell(h, { bold: true })),
      }),
      ...rows.map(
        (r) => new TableRow({ children: r.map((c) => cell(c)) })
      ),
    ],
  });
}

export async function buildCampaignDocx(campaign: Campaign): Promise<Buffer> {
  const { onboarding, siteAnalysis, adGroups } = campaign;
  const dateStr = new Date(campaign.generatedAt).toLocaleDateString("pt-BR");
  const totalKeywords = adGroups.reduce((n, g) => n + g.keywords.length, 0);

  const children: (Paragraph | Table)[] = [];

  // ---- Capa ----
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 200 },
      children: [
        new TextRun({ text: "MP ASSESSORIA", bold: true, size: 32, color: BLUE }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "Estrutura de Campanha — Google Ads Search",
          size: 28,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: campaign.clientName, size: 24, color: GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [new TextRun({ text: `Gerado em ${dateStr}`, size: 20, color: GRAY })],
    })
  );

  // ---- Seção 1: Resumo da Análise ----
  children.push(heading("1. Resumo da Análise", HeadingLevel.HEADING_1));
  children.push(p("Proposta de valor:", { bold: true }));
  children.push(p(siteAnalysis.proposta_de_valor));
  children.push(p("Público-alvo identificado:", { bold: true }));
  children.push(p(siteAnalysis.publico_alvo));
  children.push(p(`Total de keywords: ${totalKeywords}`));
  children.push(p(`Grupos de anúncio criados: ${adGroups.length}`));

  // ---- Seção 2: SEO On-Page ----
  children.push(heading("2. Dicas de SEO On-Page", HeadingLevel.HEADING_1));
  children.push(
    table(
      ["Item", "Status", "Recomendação"],
      campaign.seoTips.map((t) => [
        t.item,
        statusSymbol(t.status),
        t.recomendacao,
      ])
    )
  );

  // ---- Seção 3: Estrutura da Campanha ----
  children.push(heading("3. Estrutura da Campanha", HeadingLevel.HEADING_1));
  children.push(p(`Tipo: Rede de Pesquisa`));
  children.push(p(`Objetivo: ${OBJECTIVE_LABELS[onboarding.campaignObjective]}`));
  children.push(p(`Idioma: Português`));
  children.push(
    p(`Localização: ${onboarding.targetCity} — ${RADIUS_LABELS[onboarding.targetRadius]}`)
  );

  adGroups.forEach((group, gi) => {
    children.push(
      heading(`Grupo ${gi + 1}: ${group.name}`, HeadingLevel.HEADING_2)
    );
    if (group.theme) children.push(p(`Tema: ${group.theme}`, { color: GRAY }));

    // Keywords
    children.push(p("Palavras-chave:", { bold: true }));
    children.push(
      table(
        ["Keyword", "Match", "Volume", "CPC est."],
        group.keywords.map((k) => [
          k.term,
          MATCH_TYPE_LABELS[k.matchType],
          k.volume != null ? String(k.volume) : "—",
          k.cpc != null ? `R$ ${k.cpc.toFixed(2)}` : "—",
        ])
      )
    );

    // Ads
    group.ads.forEach((ad, ai) => {
      children.push(p(`Anúncio RSA ${ai + 1}`, { bold: true, color: BLUE }));
      children.push(
        table(
          ["#", "Título", "Chars"],
          ad.headlines.map((h, i) => [String(i + 1), h, String(h.length)])
        )
      );
      children.push(
        table(
          ["#", "Descrição", "Chars"],
          ad.descriptions.map((d, i) => [String(i + 1), d, String(d.length)])
        )
      );
      children.push(
        p(`URL de exibição: /${ad.displayUrlPath[0]}/${ad.displayUrlPath[1]}`, {
          color: GRAY,
        })
      );
      if (ad.pinRecommendations.length) {
        const pins = ad.pinRecommendations
          .map((pin) => `Pos.${pin.position} → Título ${pin.headlineIndex + 1}`)
          .join("; ");
        children.push(p(`Pins recomendados: ${pins}`, { color: GRAY }));
      }
    });
  });

  // ---- Rodapé ----
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
      children: [
        new TextRun({
          text: `Gerado por AdGen Pro — MP Assessoria | ${dateStr}`,
          size: 16,
          color: GRAY,
          italics: true,
        }),
      ],
    })
  );

  const doc = new Document({
    creator: "AdGen Pro — MP Assessoria",
    title: `Campanha Google Ads — ${campaign.clientName}`,
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
