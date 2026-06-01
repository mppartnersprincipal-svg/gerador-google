"use client";

import { ShieldCheck, ShieldAlert, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QualityReview } from "@/types/campaign";

function scoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 70) return "success";
  if (score >= 50) return "warning";
  return "destructive";
}

export function QualityPanel({ quality }: { quality: QualityReview }) {
  const variant = scoreVariant(quality.score);
  const Icon = quality.aprovado ? ShieldCheck : ShieldAlert;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon
            className={cn(
              "h-5 w-5",
              variant === "success" && "text-success",
              variant === "warning" && "text-warning",
              variant === "destructive" && "text-destructive"
            )}
          />
          Qualidade da Campanha
        </CardTitle>
        <Badge variant={variant}>{quality.score}/100</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {quality.alertas.length === 0 ? (
          <p className="text-sm text-success">
            Nenhum problema encontrado. Campanha dentro dos padrões do Google
            Ads.
          </p>
        ) : (
          quality.alertas.map((a, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <AlertCircle
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  a.tipo === "erro" ? "text-destructive" : "text-warning"
                )}
              />
              <div>
                <span className="font-medium">{a.campo}:</span> {a.mensagem}{" "}
                <span className="text-muted-foreground">— {a.sugestao}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
