"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWizardStore } from "@/lib/store/wizardStore";
import type { SiteAnalysis, SEOStatus } from "@/types/agents";

function SeoIcon({ status }: { status: SEOStatus }) {
  if (status === "ok")
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />;
  if (status === "warning")
    return <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />;
  return <XCircle className="h-5 w-5 shrink-0 text-destructive" />;
}

export function StepUrlAnalysis() {
  const { onboarding, siteAnalysis, setSiteAnalysis, next, back } =
    useWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!onboarding) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboarding),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na análise.");
      setSiteAnalysis(data.analysis as SiteAnalysis);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [onboarding, setSiteAnalysis]);

  useEffect(() => {
    if (!siteAnalysis && !loading && !error) runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Analisando {onboarding?.websiteUrl}…
          </p>
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
            <AlertTitle>Erro ao analisar o site</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-between">
            <Button variant="outline" onClick={back}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button onClick={runAnalysis}>
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!siteAnalysis) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xl">Análise do Site</CardTitle>
          <Button variant="ghost" size="sm" onClick={runAnalysis}>
            <RefreshCw className="h-4 w-4" /> Reanalisar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Proposta de valor</p>
            <p className="text-sm text-muted-foreground">
              {siteAnalysis.proposta_de_valor}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Público-alvo</p>
            <p className="text-sm text-muted-foreground">
              {siteAnalysis.publico_alvo}
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">
              Palavras-chave semânticas
            </p>
            <div className="flex flex-wrap gap-2">
              {siteAnalysis.palavras_chave_semanticas.map((kw) => (
                <Badge key={kw} variant="secondary">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
          {siteAnalysis.ctas_encontrados.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">CTAs encontrados</p>
              <div className="flex flex-wrap gap-2">
                {siteAnalysis.ctas_encontrados.map((cta, i) => (
                  <Badge key={`${cta}-${i}`} variant="outline">
                    {cta}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dicas de SEO On-Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {siteAnalysis.seo_audit.map((tip, i) => (
            <div key={i} className="flex gap-3">
              <SeoIcon status={tip.status} />
              <div>
                <p className="text-sm font-medium">{tip.item}</p>
                <p className="text-sm text-muted-foreground">
                  {tip.recomendacao}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={back}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button size="lg" onClick={next}>
          Pesquisar Palavras-Chave
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
