"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrefsStore } from "@/lib/store/prefsStore";
import { RADIUS_LABELS, type TargetRadius } from "@/types/onboarding";

interface ApiStatus {
  anthropic: boolean;
  dataforseo: boolean;
  appVersion: string;
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background p-3">
      <span className="text-sm font-medium">{label}</span>
      {ok ? (
        <span className="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> Configurada
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <XCircle className="h-4 w-4" /> Ausente
        </span>
      )}
    </div>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const {
    theme,
    setTheme,
    minVolume,
    setMinVolume,
    defaultRadius,
    setDefaultRadius,
  } = usePrefsStore();
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Settings className="h-5 w-5 text-primary" /> Configurações
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status das APIs</CardTitle>
          <p className="text-sm text-muted-foreground">
            As chaves são lidas do arquivo <span className="font-mono">.env</span>{" "}
            no servidor (nunca no navegador). Edite o <span className="font-mono">.env.local</span> e
            reinicie para alterar.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verificando…
            </div>
          ) : (
            <>
              <StatusRow
                label="Anthropic (ANTHROPIC_API_KEY)"
                ok={Boolean(status?.anthropic)}
              />
              <StatusRow
                label="DataForSEO (login + senha)"
                ok={Boolean(status?.dataforseo)}
              />
              {!status?.dataforseo && (
                <p className="text-xs text-muted-foreground">
                  Sem DataForSEO, a pesquisa de keywords usa o modo estimado
                  (web search).
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tema</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Volume mínimo de busca (filtro de keywords)</Label>
            <Input
              type="number"
              min={0}
              value={minVolume}
              onChange={(e) => setMinVolume(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Raio de atuação padrão</Label>
            <Select
              value={defaultRadius}
              onValueChange={(v) => setDefaultRadius(v as TargetRadius)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RADIUS_LABELS) as TargetRadius[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {RADIUS_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Preferências salvas automaticamente neste navegador.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
