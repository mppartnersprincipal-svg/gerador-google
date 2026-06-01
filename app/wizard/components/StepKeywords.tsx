"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWizardStore } from "@/lib/store/wizardStore";
import { usePrefsStore } from "@/lib/store/prefsStore";
import { CostEstimateCard } from "@/components/shared/CostEstimateCard";
import { MATCH_TYPE_LABELS, type Keyword } from "@/types/keywords";

function competitionLabel(c?: number): { label: string; variant: "secondary" | "warning" | "destructive" } {
  if (c == null) return { label: "—", variant: "secondary" };
  if (c >= 0.66) return { label: "Alto", variant: "destructive" };
  if (c >= 0.33) return { label: "Médio", variant: "warning" };
  return { label: "Baixo", variant: "secondary" };
}

export function StepKeywords() {
  const {
    onboarding,
    siteAnalysis,
    keywords,
    researchMode,
    setKeywords,
    toggleKeyword,
    next,
    back,
  } = useWizardStore();
  const minVolume = usePrefsStore((s) => s.minVolume);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runResearch = useCallback(async () => {
    if (!onboarding || !siteAnalysis) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding, analysis: siteAnalysis, minVolume }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na pesquisa.");
      setKeywords(data.keywords as Keyword[], data.mode);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [onboarding, siteAnalysis, setKeywords, minVolume]);

  useEffect(() => {
    if (keywords.length === 0 && !loading && !error) runResearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCount = useMemo(
    () => keywords.filter((k) => k.selected).length,
    [keywords]
  );

  if (loading) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Pesquisando palavras-chave…</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-4 py-10">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erro na pesquisa de keywords</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-between">
            <Button variant="outline" onClick={back}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button onClick={runResearch}>
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {researchMode === "estimated" && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo estimado</AlertTitle>
          <AlertDescription>
            Volumes estimados — configure a API DataForSEO para dados reais de
            busca.
          </AlertDescription>
        </Alert>
      )}

      {onboarding && (
        <CostEstimateCard
          keywords={keywords.filter((k) => k.selected)}
          monthlyBudget={onboarding.monthlyBudget}
        />
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border p-4">
            <p className="text-sm font-medium">
              {keywords.length} keywords encontradas
            </p>
            <div className="flex items-center gap-3">
              <Badge>{selectedCount} selecionadas</Badge>
              <Button variant="ghost" size="sm" onClick={runResearch}>
                <RefreshCw className="h-4 w-4" /> Repesquisar
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Keyword</TableHead>
                <TableHead className="text-right">Volume/mês</TableHead>
                <TableHead className="text-right">CPC</TableHead>
                <TableHead>Concorrência</TableHead>
                <TableHead>Match</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((k) => {
                const comp = competitionLabel(k.competition);
                return (
                  <TableRow key={k.term}>
                    <TableCell>
                      <Checkbox
                        checked={k.selected}
                        onCheckedChange={() => toggleKeyword(k.term)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{k.term}</TableCell>
                    <TableCell className="text-right">
                      {k.volume != null ? k.volume.toLocaleString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {k.cpc != null ? `R$ ${k.cpc.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={comp.variant}>{comp.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {MATCH_TYPE_LABELS[k.matchType]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button size="lg" disabled={selectedCount === 0} onClick={next}>
          Gerar Campanha ({selectedCount})
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
