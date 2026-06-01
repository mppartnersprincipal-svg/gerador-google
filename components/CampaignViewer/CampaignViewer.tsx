"use client";

import { Settings, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdGroupCard } from "./AdGroupCard";
import { ExtensionsSection } from "./ExtensionsSection";
import { PMaxSection } from "./PMaxSection";
import { OBJECTIVE_LABELS, RADIUS_LABELS } from "@/types/onboarding";
import type {
  Campaign,
  RSAd,
  CampaignExtensions,
  PMaxAssetGroup,
} from "@/types/campaign";

/**
 * Bundle de edição (Fase 4 — F13/F14). Quando ausente, o viewer é read-only
 * (uso no histórico/dashboard permanece inalterado). Quando presente, ativa
 * edição inline com contadores ao vivo e botões de regeneração parcial.
 */
export interface CampaignEdit {
  onAdChange: (groupIndex: number, adIndex: number, ad: RSAd) => void;
  onRegenerateGroup: (groupIndex: number) => void;
  regeneratingGroupIndex: number | null;
  onExtensionsChange: (ext: CampaignExtensions) => void;
  onRegenerateExtensions: () => void;
  regeneratingExtensions: boolean;
  onPMaxChange: (pmax: PMaxAssetGroup) => void;
  onRegeneratePMax: () => void;
  regeneratingPMax: boolean;
}

export function CampaignViewer({
  campaign,
  edit,
}: {
  campaign: Campaign;
  edit?: CampaignEdit;
}) {
  const { onboarding, adGroups } = campaign;
  const totalKeywords = adGroups.reduce((n, g) => n + g.keywords.length, 0);
  const editable = !!edit;

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
            <Config label="Tipo" value="Rede de Pesquisa" />
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
        <AdGroupCard
          key={group.id}
          group={group}
          index={i}
          editable={editable}
          onAdChange={
            edit ? (adIndex, ad) => edit.onAdChange(i, adIndex, ad) : undefined
          }
          onRegenerate={edit ? () => edit.onRegenerateGroup(i) : undefined}
          regenerating={edit?.regeneratingGroupIndex === i}
        />
      ))}

      {campaign.extensions && (
        <ExtensionsSection
          extensions={campaign.extensions}
          editable={editable}
          onChange={edit?.onExtensionsChange}
          onRegenerate={edit?.onRegenerateExtensions}
          regenerating={edit?.regeneratingExtensions}
        />
      )}

      {campaign.pmax && (
        <PMaxSection
          pmax={campaign.pmax}
          editable={editable}
          onChange={edit?.onPMaxChange}
          onRegenerate={edit?.onRegeneratePMax}
          regenerating={edit?.regeneratingPMax}
        />
      )}
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
