"use client";

import type { Campaign } from "@/types/campaign";

/**
 * Camada de persistência do histórico de campanhas.
 * Implementação atual: localStorage (single-user, local).
 * A interface é isolada de propósito — um adaptador Supabase pode
 * substituir as funções abaixo sem alterar os componentes (PRD Fase 2).
 */

const KEY = "adgen-history";
const MAX_ITEMS = 50;

export interface CampaignSummary {
  id: string;
  clientName: string;
  generatedAt: string;
  groups: number;
  keywords: number;
  qualityScore?: number;
}

function read(): Campaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Campaign[]) : [];
  } catch {
    return [];
  }
}

function write(items: Campaign[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* quota cheia ou storage indisponível — ignora silenciosamente */
  }
}

export function saveCampaign(campaign: Campaign): void {
  const items = read().filter((c) => c.id !== campaign.id);
  items.unshift(campaign);
  write(items);
}

export function listCampaigns(): CampaignSummary[] {
  return read().map((c) => ({
    id: c.id,
    clientName: c.clientName,
    generatedAt: c.generatedAt,
    groups: c.adGroups.length,
    keywords: c.adGroups.reduce((n, g) => n + g.keywords.length, 0),
    qualityScore: c.quality?.score,
  }));
}

export function getCampaign(id: string): Campaign | null {
  return read().find((c) => c.id === id) ?? null;
}

export function getAllCampaigns(): Campaign[] {
  return read();
}

export function deleteCampaign(id: string): void {
  write(read().filter((c) => c.id !== id));
}
