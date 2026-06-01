"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MATCH_TYPE_LABELS, type Keyword } from "@/types/keywords";

export function KeywordsTable({ keywords }: { keywords: Keyword[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead>Match</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead className="text-right">CPC</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((k) => (
          <TableRow key={k.term}>
            <TableCell className="font-medium">{k.term}</TableCell>
            <TableCell>
              <Badge variant="outline">{MATCH_TYPE_LABELS[k.matchType]}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {k.volume != null ? k.volume.toLocaleString("pt-BR") : "—"}
            </TableCell>
            <TableCell className="text-right">
              {k.cpc != null ? `R$ ${k.cpc.toFixed(2)}` : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
