# AdGen Pro — Gerador de Campanhas Google Ads Search

Ferramenta interna da **MP Assessoria** para gerar campanhas completas da Rede de
Pesquisa do Google Ads a partir do site do cliente: análise de URL, pesquisa de
palavras-chave, geração de copy por agentes de IA e exportação em `.docx`.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Zustand ·
React Hook Form + Zod · Anthropic Claude API · DataForSEO · cheerio · docx

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

A raiz redireciona para `/wizard`.

## Variáveis de ambiente

- `ANTHROPIC_API_KEY` — **obrigatória** (agentes de IA). Modelo: `claude-sonnet-4-6`.
- `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` — opcionais. Sem elas, a pesquisa de
  keywords usa o **fallback de web search** e sinaliza "modo estimado".

Veja `.env.example` para a lista completa.

## Fluxo (wizard de 5 steps)

1. **Onboarding** — briefing do cliente (RHF + Zod)
2. **Análise do Site** — scraping + Site Analyzer + dicas de SEO on-page
3. **Palavras-Chave** — DataForSEO (real) ou web search (estimado), com seleção
4. **Geração** — pipeline: Keyword Organizer → Ad Copywriter (RSA)
5. **Campanha** — visualização + exportação `.docx`

## Status

Fatia vertical (MVP-1) funcional. **Próximo ciclo:** Agente de Extensões,
Quality Reviewer (gate ≥70), edição inline, regeneração parcial e histórico (Supabase).

---
Gerado por AdGen Pro — MP Assessoria
