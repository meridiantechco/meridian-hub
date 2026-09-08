import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitiza e normaliza URLs externas para links <a> seguros.
 * Impede injeções de protocolos perigosos (javascript:, data:, vbscript:, file:)
 * e normaliza domínios sem protocolo para https://
 */
export function sanitizarUrlExterna(url?: string | null): string | null {
  if (!url) return null;
  const limpa = url.trim();
  if (!limpa) return null;

  // Rejeita explicitamente protocolos executáveis/perigosos
  if (/^(javascript|data|vbscript|file):/i.test(limpa)) {
    return null;
  }

  // Se já começar com http:// ou https://
  if (/^https?:\/\//i.test(limpa)) {
    try {
      const parsed = new URL(limpa);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
      return null;
    } catch {
      return null;
    }
  }

  // Se começar com // (protocol-relative)
  if (limpa.startsWith("//")) {
    return `https:${limpa}`;
  }

  // Se for domínio sem protocolo (ex: "empresa.com.br")
  try {
    const comProtocolo = `https://${limpa}`;
    const parsed = new URL(comProtocolo);
    if (parsed.hostname.includes(".")) {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}
