"use client";

import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeywordsTable } from "./KeywordsTable";
import { AdCard } from "./AdCard";
import type { AdGroup } from "@/types/campaign";

export function AdGroupCard({
  group,
  index,
}: {
  group: AdGroup;
  index: number;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FolderOpen className="h-5 w-5 text-primary" />
          Grupo {index + 1}: {group.name}
        </CardTitle>
        <Badge variant="secondary">{group.keywords.length} keywords</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {group.theme && (
          <p className="text-sm text-muted-foreground">{group.theme}</p>
        )}
        <div>
          <p className="mb-2 text-sm font-semibold">Palavras-chave</p>
          <div className="rounded-md border border-border">
            <KeywordsTable keywords={group.keywords} />
          </div>
        </div>
        <div className="space-y-3">
          {group.ads.map((ad, i) => (
            <AdCard key={i} ad={ad} index={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
