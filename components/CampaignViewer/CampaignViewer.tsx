"use client";

import { Settings, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdGroupCard } from "./AdGroupCard";
import { ExtensionsSection } from "./ExtensionsSection";
import { PMaxSection } from "./PMaxSection";
import { OBJECTIVE_LABELS, RADIUS_LABELS } from "@/types/onboarding";
import type { Campaign } from "@/types/campaign";

export function CampaignViewer({ campaign }: { campaign: Campaign }) {
  const { onboarding, adGroups } = campaign;
  const totalKeywords = adGroups.reduce((n, g) => n + g.keywords.length, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="h-5 w-5 text-primary" />
            Campanha: {campaign.clientName} — Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{adGroups.length} grupos</Badge>
            <Badge variant="secondary">{totalKeywords} keywords</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Config
              label="Tipo"
              value="Rede de Pesquisa"
            />
            <Config
              label="Objetivo"
              value={OBJECTIVE_LABELS[onboarding.campaignObjective]}
            />
            <Config label="Idioma" value="Português" />
            <Config
              label="Localização"
              value={`${onboarding.targetCity} — ${RADIUS_LABELS[onboarding.targetRadius]}`}
            />
          </div>
        </CardContent>
      </Card>

      {adGroups.map((group, i) => (
        <AdGroupCard key={group.id} group={group} index={i} />
      ))}

      {campaign.extensions && (
        <ExtensionsSection extensions={campaign.extensions} />
      )}

      {campaign.pmax && <PMaxSection pmax={campaign.pmax} />}
    </div>
  );
}

function Config({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-background p-3">
      <Settings className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
