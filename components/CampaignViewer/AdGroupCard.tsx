"use client";

import { FolderOpen, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeywordsTable } from "./KeywordsTable";
import { AdCard } from "./AdCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { formatKeywordsForCopy } from "@/lib/keywordsFormat";
import type { AdGroup, RSAd } from "@/types/campaign";

export function AdGroupCard({
  group,
  index,
  editable,
  onAdChange,
  onRegenerate,
  regenerating,
}: {
  group: AdGroup;
  index: number;
  editable?: boolean;
  onAdChange?: (adIndex: number, ad: RSAd) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FolderOpen className="h-5 w-5 text-primary" />
          Grupo {index + 1}: {group.name}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{group.keywords.length} keywords</Badge>
          {editable && onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={regenerating}
              title="Regerar o anúncio deste grupo com a IA"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Regerar anúncio
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {group.theme && (
          <p className="text-sm text-muted-foreground">{group.theme}</p>
        )}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Palavras-chave</p>
            <CopyButton
              getText={() => formatKeywordsForCopy(group.keywords)}
              label="Copiar keywords"
            />
          </div>
          <div className="rounded-md border border-border">
            <KeywordsTable keywords={group.keywords} />
          </div>
        </div>
        <div className="space-y-3">
          {group.ads.map((ad, i) => (
            <AdCard
              key={i}
              ad={ad}
              index={i}
              editable={editable}
              onChange={onAdChange ? (next) => onAdChange(i, next) : undefined}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
