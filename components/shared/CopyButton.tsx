"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Botão de copiar para a área de transferência com feedback "Copiado!".
 * `getText` é uma função para que o texto seja sempre lido no momento do clique
 * (reflete edições inline feitas até ali).
 */
export function CopyButton({
  getText,
  label = "Copiar",
  copiedLabel = "Copiado!",
  className,
}: {
  getText: () => string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = getText();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para contextos sem Clipboard API
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silencioso — permissão de clipboard negada */
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onCopy}
      className={className}
      title={label}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-success" /> {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> {label}
        </>
      )}
    </Button>
  );
}
