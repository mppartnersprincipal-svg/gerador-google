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
 * A conversa termina sempre com uma mensagem do usuário (o prefill de
 * "assistant" não é suportado por modelos Claude 4.x). A saída JSON pura é
 * garantida por instrução explícita + `extractJson`, que isola o objeto/array
 * de qualquer preâmbulo ou cerca de código.
 */
export async function callAgentJson<T>(
  { system, user, maxTokens, temperature = 0.7 }: CallAgentOptions,
  expectArray = false
): Promise<T> {
  const anthropic = getAnthropic();
  const shape = expectArray ? "um ARRAY JSON" : "um OBJETO JSON";
  const jsonHint = `\n\nIMPORTANTE: responda APENAS com ${shape} — sem nenhum texto antes ou depois, sem explicações e sem cercas de código (\`\`\`).`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: "user", content: user + jsonHint }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  try {
    return JSON.parse(extractJson(text)) as T;
  } catch (err) {
    throw new Error(
      `Resposta do agente não é JSON válido: ${(err as Error).message}\n---\n${text.slice(0, 500)}`
    );
  }
}
