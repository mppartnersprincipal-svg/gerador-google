"use client";

import { Link2, Tag, List, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CharCounter } from "@/components/shared/CharCounter";
import { EditableLine } from "@/components/shared/EditableLine";
import { GOOGLE_ADS_LIMITS } from "@/lib/constants/limits";
import type { CampaignExtensions, Sitelink } from "@/types/campaign";

const L = GOOGLE_ADS_LIMITS;

export function ExtensionsSection({
  extensions,
  editable,
  onChange,
  onRegenerate,
  regenerating,
}: {
  extensions: CampaignExtensions;
  editable?: boolean;
  onChange?: (ext: CampaignExtensions) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  const { callouts, sitelinks, structuredSnippets } = extensions;

  const setCallout = (i: number, v: string) =>
    onChange?.({
      ...extensions,
      callouts: callouts.map((c, j) => (j === i ? v : c)),
    });

  const setSitelink = (i: number, patch: Partial<Sitelink>) =>
    onChange?.({
      ...extensions,
      sitelinks: sitelinks.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-primary" />
          Extensões da Campanha
        </CardTitle>
        {editable && onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={regenerating}
            title="Regerar as extensões com a IA"
          >
            {regenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Regerar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {callouts.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Tag className="h-4 w-4" /> Frases de Destaque (Callouts)
            </p>
            {editable ? (
              <div className="space-y-1">
                {callouts.map((c, i) => (
                  <EditableLine
                    key={i}
                    value={c}
                    max={L.CALLOUT_MAX_CHARS}
                    onChange={(v) => setCallout(i, v)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {callouts.map((c, i) => (
                  <Badge key={i} variant="secondary" className="gap-2">
                    {c}
                    <CharCounter length={c.length} max={L.CALLOUT_MAX_CHARS} />
                  </Badge>
                ))}
              </div>
            )}
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
                  {editable ? (
                    <div className="space-y-1">
                      <EditableLine
                        value={s.title}
                        max={L.SITELINK_TITLE_MAX_CHARS}
                        onChange={(v) => setSitelink(i, { title: v })}
                      />
                      <EditableLine
                        value={s.description1}
                        max={L.SITELINK_DESC_MAX_CHARS}
                        onChange={(v) => setSitelink(i, { description1: v })}
                      />
                      <EditableLine
                        value={s.description2}
                        max={L.SITELINK_DESC_MAX_CHARS}
                        onChange={(v) => setSitelink(i, { description2: v })}
                      />
                      <input
                        value={s.suggestedUrl}
                        onChange={(e) =>
                          setSitelink(i, { suggestedUrl: e.target.value })
                        }
                        className="w-full rounded-sm border-b border-dashed border-border bg-transparent px-1 py-0.5 font-mono text-xs outline-none focus:border-primary"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-primary">
                        {s.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.description1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.description2}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {s.suggestedUrl}
                      </p>
                    </>
                  )}
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
