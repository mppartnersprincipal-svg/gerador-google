import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Defina a variável de ambiente para usar os agentes."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Remove cercas de markdown (```json ... ```) e extrai o primeiro objeto/array JSON.
 */
export function extractJson(raw: string): string {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const firstBrace = text.search(/[[{]/);
  if (firstBrace > 0) text = text.slice(firstBrace);
  const lastBrace = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (lastBrace >= 0 && lastBrace < text.length - 1) {
    text = text.slice(0, lastBrace + 1);
  }
  return text.trim();
}

interface CallAgentOptions {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
}

/**
 * Chama um agente Claude e devolve JSON já parseado.
 * Força saída JSON pura via prefill com "{" (ou "[").
 */
export async function callAgentJson<T>(
  { system, user, maxTokens, temperature = 0.7 }: CallAgentOptions,
  expectArray = false
): Promise<T> {
  const anthropic = getAnthropic();
  const prefill = expectArray ? "[" : "{";

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [
      { role: "user", content: user },
      { role: "assistant", content: prefill },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
  const full = prefill + text;

  try {
    return JSON.parse(extractJson(full)) as T;
  } catch (err) {
    throw new Error(
      `Resposta do agente não é JSON válido: ${(err as Error).message}\n---\n${full.slice(0, 500)}`
    );
  }
}
