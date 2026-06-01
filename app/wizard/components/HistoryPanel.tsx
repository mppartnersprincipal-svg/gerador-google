"use client";

import { useEffect, useState } from "react";
import { Clock, FolderOpen, Trash2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listCampaigns,
  getCampaign,
  deleteCampaign,
  type CampaignSummary,
} from "@/lib/history";
import { useWizardStore } from "@/lib/store/wizardStore";

export function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<CampaignSummary[]>([]);
  const { setCampaign, goTo } = useWizardStore();

  const refresh = () => setItems(listCampaigns());
  useEffect(() => {
    refresh();
  }, []);

  const open = (id: string) => {
    const campaign = getCampaign(id);
    if (!campaign) return;
    setCampaign(campaign);
    goTo(5);
    onClose();
  };

  const remove = (id: string) => {
    deleteCampaign(id);
    refresh();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Clock className="h-5 w-5 text-primary" /> Histórico de Campanhas
        </h2>
        <Button variant="outline" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma campanha salva ainda. As campanhas geradas aparecem aqui
            automaticamente.
          </CardContent>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="text-base">{item.clientName}</CardTitle>
              {item.qualityScore != null && (
                <Badge
                  variant={item.qualityScore >= 70 ? "success" : "warning"}
                >
                  {item.qualityScore}/100
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {new Date(item.generatedAt).toLocaleString("pt-BR")} ·{" "}
                {item.groups} grupos · {item.keywords} keywords
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => open(item.id)}>
                  <FolderOpen className="h-4 w-4" /> Abrir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
