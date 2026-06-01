"use client";

import { Link2, Tag, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CharCounter } from "@/components/shared/CharCounter";
import { GOOGLE_ADS_LIMITS } from "@/lib/constants/limits";
import type { CampaignExtensions } from "@/types/campaign";

const L = GOOGLE_ADS_LIMITS;

export function ExtensionsSection({
  extensions,
}: {
  extensions: CampaignExtensions;
}) {
  const { callouts, sitelinks, structuredSnippets } = extensions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-primary" />
          Extensões da Campanha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {callouts.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Tag className="h-4 w-4" /> Frases de Destaque (Callouts)
            </p>
            <div className="flex flex-wrap gap-2">
              {callouts.map((c, i) => (
                <Badge key={i} variant="secondary" className="gap-2">
                  {c}
                  <CharCounter length={c.length} max={L.CALLOUT_MAX_CHARS} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {sitelinks.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Link2 className="h-4 w-4" /> Sitelinks
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {sitelinks.map((s, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border bg-background p-3"
                >
                  <p className="text-sm font-medium text-primary">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.description1}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.description2}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {s.suggestedUrl}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {structuredSnippets.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <List className="h-4 w-4" /> Snippets Estruturados
            </p>
            <div className="space-y-2">
              {structuredSnippets.map((s, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{s.header}:</span>{" "}
                  <span className="text-muted-foreground">
                    {s.values.join(" · ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
