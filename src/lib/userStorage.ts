import { supabase } from "@/integrations/supabase/client";

/**
 * Obtém de forma segura o ID do usuário atualmente autenticado na sessão do Supabase.
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Retorna a chave de armazenamento particionada por usuário para garantir isolamento
 * estrito entre diferentes operadores e administradores no mesmo navegador.
 */
export async function getScopedStorageKey(baseKey: string): Promise<string> {
  const userId = await getAuthUserId();
  return userId ? `${baseKey}_${userId}` : baseKey;
}

/**
 * Lê dados do localStorage de forma isolada para o usuário autenticado.
 * Possui fallback e migração transparente caso existam dados legados.
 */
export async function getScopedItem<T>(baseKey: string): Promise<T | null> {
  if (typeof window === "undefined") return null;
  try {
    const key = await getScopedStorageKey(baseKey);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Migração transparente de dados legados não particionados se existirem
      const legacyRaw = localStorage.getItem(baseKey);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw) as T;
          localStorage.setItem(key, legacyRaw);
          return parsed;
        } catch {
          return null;
        }
      }
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Salva dados no localStorage estritamente no escopo do usuário autenticado.
 */
export async function setScopedItem<T>(baseKey: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const key = await getScopedStorageKey(baseKey);
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[userStorage] Erro ao salvar dados para a chave ${baseKey}:`, err);
  }
}
