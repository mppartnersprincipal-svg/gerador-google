"use client";

import { useMemo } from "react";
import {
  BarChart3,
  ArrowLeft,
  FolderKanban,
  KeyRound,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllCampaigns } from "@/lib/history";
import { estimateCost, formatBRL } from "@/lib/costEstimate";

export function DashboardPanel({ onClose }: { onClose: () => void }) {
  const campaigns = useMemo(() => getAllCampaigns(), []);

  const stats = useMemo(() => {
    const total = campaigns.length;
    let groups = 0;
    let keywords = 0;
    let scoreSum = 0;
    let scoreCount = 0;
    let estSpend = 0;

    for (const c of campaigns) {
      groups += c.adGroups.length;
      const allKw = c.adGroups.flatMap((g) => g.keywords);
      keywords += allKw.length;
      if (c.quality?.score != null) {
        scoreSum += c.quality.score;
        scoreCount++;
      }
      const est = estimateCost(allKw, c.onboarding.monthlyBudget);
      if (!est.unavailable) estSpend += est.monthlyBudget;
    }

    return {
      total,
      groups,
      keywords,
      avgScore: scoreCount ? Math.round(scoreSum / scoreCount) : null,
      estSpend,
    };
  }, [campaigns]);

  // Agrega por cliente
  const byClient = useMemo(() => {
    const map = new Map<
      string,
      { count: number; keywords: number; lastAt: string }
    >();
    for (const c of campaigns) {
      const cur = map.get(c.clientName) ?? {
        count: 0,
        keywords: 0,
        lastAt: c.generatedAt,
      };
      cur.count++;
      cur.keywords += c.adGroups.reduce((n, g) => n + g.keywords.length, 0);
      if (c.generatedAt > cur.lastAt) cur.lastAt = c.generatedAt;
      map.set(c.clientName, cur);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [campaigns]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <BarChart3 className="h-5 w-5 text-primary" /> Dashboard
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Sem dados ainda. Gere campanhas para popular o dashboard (dados
            locais deste navegador).
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              icon={<FolderKanban className="h-5 w-5" />}
              label="Campanhas"
              value={String(stats.total)}
            />
            <Stat
              icon={<KeyRound className="h-5 w-5" />}
              label="Keywords"
              value={stats.keywords.toLocaleString("pt-BR")}
            />
            <Stat
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Score médio"
              value={stats.avgScore != null ? `${stats.avgScore}/100` : "—"}
            />
            <Stat
              icon={<TrendingUp className="h-5 w-5" />}
              label="Budget/mês (soma)"
              value={formatBRL(stats.estSpend)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Por cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byClient.map(([name, d]) => (
                <div
                  key={name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background p-3"
                >
                  <span className="font-medium">{name}</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{d.count} campanha(s)</Badge>
                    <span>{d.keywords} keywords</span>
                    <span>
                      últ. {new Date(d.lastAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}
