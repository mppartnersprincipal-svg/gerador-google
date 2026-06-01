"use client";

import { cn } from "@/lib/utils";
import { charUsageLevel } from "@/lib/constants/limits";

export function CharCounter({
  length,
  max,
}: {
  length: number;
  max: number;
}) {
  const level = charUsageLevel(length, max);
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        level === "ok" && "text-success",
        level === "warning" && "text-warning",
        level === "over" && "text-destructive font-semibold"
      )}
    >
      {length}/{max}
    </span>
  );
}
