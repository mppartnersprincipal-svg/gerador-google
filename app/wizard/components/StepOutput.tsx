"use client";

import { useState } from "react";
import { Download, Loader2, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CampaignViewer } from "@/components/CampaignViewer/CampaignViewer";
import { QualityPanel } from "@/components/CampaignViewer/QualityPanel";
import { useWizardStore } from "@/lib/store/wizardStore";

export function StepOutput() {
  const { campaign, reset, goTo } = useWizardStore();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!campaign) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl">
        <AlertDescription>
          Nenhuma campanha gerada. Volte e gere novamente.
        </AlertDescription>
      </Alert>
    );
  }

  // Regra de negócio (PRD §14.3): só exporta com score de qualidade >= 70.
  const blockedByQuality =
    campaign.quality != null && campaign.quality.score < 70;

  const exportDocx = async () => {
    if (blockedByQuality) {
      setError(
        `Exportação bloqueada: score de qualidade ${campaign.quality?.score}/100 (mínimo 70). Corrija os alertas e regenere a campanha.`
      );
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao exportar.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campanha-${campaign.clientName}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <Button variant="outline" size="sm" onClick={() => goTo(3)}>
          <ArrowLeft className="h-4 w-4" /> Keywords
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Nova campanha
          </Button>
          <Button
            onClick={exportDocx}
            disabled={exporting || blockedByQuality}
            title={
              blockedByQuality
                ? "Score de qualidade abaixo de 70"
                : undefined
            }
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar .docx
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {campaign.quality && <QualityPanel quality={campaign.quality} />}

      <CampaignViewer campaign={campaign} />
    </div>
  );
}
