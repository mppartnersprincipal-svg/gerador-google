"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWizardStore } from "@/lib/store/wizardStore";
import type { OrganizedGroup } from "@/lib/agents/keywordOrganizer";
import type { AdGroup, Campaign, RSAd } from "@/types/campaign";

type Stage = { label: string; status: "pending" | "active" | "done" };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro na geração.");
  return data as T;
}

export function StepGenerating() {
  const { onboarding, siteAnalysis, keywords, setCampaign, goTo, back } =
    useWizardStore();
  const [stages, setStages] = useState<Stage[]>([
    { label: "Organizando grupos de anúncio…", status: "pending" },
    { label: "Gerando anúncios (RSA)…", status: "pending" },
  ]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      if (!onboarding || !siteAnalysis) return;
      try {
        // Etapa 1 — organizar grupos
        setStages((s) =>
          s.map((st, i) => (i === 0 ? { ...st, status: "active" } : st))
        );
        const { groups } = await postJson<{ groups: OrganizedGroup[] }>(
          "/api/organize-groups",
          { keywords, onboarding, analysis: siteAnalysis }
        );
        if (!groups.length) throw new Error("Nenhum grupo foi gerado.");
        setStages((s) =>
          s.map((st, i) =>
            i === 0
              ? { ...st, status: "done" }
              : i === 1
                ? { ...st, status: "active" }
                : st
          )
        );
        setProgress(30);

        // Etapa 2 — gerar RSA por grupo
        const adGroups: AdGroup[] = [];
        for (let i = 0; i < groups.length; i++) {
          const group = groups[i];
          const { ad } = await postJson<{ ad: RSAd }>("/api/generate-ads", {
            group,
            onboarding,
          });
          adGroups.push({
            id: `g${i + 1}`,
            name: group.name,
            theme: group.theme,
            keywords: group.keywords,
            ads: [ad],
          });
          setProgress(30 + Math.round(((i + 1) / groups.length) * 70));
        }

        setStages((s) => s.map((st) => ({ ...st, status: "done" })));

        const campaign: Campaign = {
          id: `camp-${Date.now()}`,
          clientName: onboarding.companyName,
          generatedAt: new Date().toISOString(),
          onboarding,
          siteAnalysis,
          seoTips: siteAnalysis.seo_audit,
          adGroups,
        };
        setCampaign(campaign);
        setTimeout(() => goTo(5), 400);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-4 py-10">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erro ao gerar a campanha</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={back}>
            <ArrowLeft className="h-4 w-4" /> Voltar às keywords
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Gerando sua campanha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 py-4">
        <Progress value={progress} />
        <div className="space-y-3">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-3">
              {stage.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : stage.status === "active" ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted" />
              )}
              <span
                className={
                  stage.status === "pending"
                    ? "text-muted-foreground"
                    : "text-foreground"
                }
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
