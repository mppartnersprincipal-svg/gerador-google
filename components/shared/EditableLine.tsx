"use client";

import { CharCounter } from "./CharCounter";
import { cn } from "@/lib/utils";

/**
 * Campo de edição inline de uma linha com contador de caracteres ao vivo (F13).
 * Permite digitar além do limite (o CharCounter fica vermelho e o gate de
 * qualidade bloqueia a exportação) — o usuário enxerga o excesso em vez de
 * ser silenciosamente cortado.
 */
export function EditableLine({
  value,
  max,
  onChange,
  mono,
  placeholder,
}: {
  value: string;
  max: number;
  onChange: (v: string) => void;
  mono?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-0">
      <input
        value={value}
        maxLength={max + 40}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "min-w-0 flex-1 rounded-sm bg-transparent px-1 py-0.5 text-sm outline-none",
          "border-b border-dashed border-transparent hover:border-border focus:border-primary",
          mono && "font-mono"
        )}
      />
      <CharCounter length={value.length} max={max} />
    </div>
  );
}
