import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { auditoriaService } from "@/features/audit";
import type { UsuarioEquipe } from "../types";

/**
 * Cria uma instância de cliente Supabase isolada e efêmera sem persistência no localStorage.
 * Isso garante que ao criar uma conta via auth.signUp(), a sessão ativa do Administrador
 * no navegador NÃO seja deslogada ou substituída.
 */
function createIsolatedAuthClient() {
  const supabaseUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_URL"]) ||
    process.env["VITE_SUPABASE_URL"] ||
    process.env["SUPABASE_URL"] ||
    "";
  const supabaseKey =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"]) ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    "";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Configuração do Supabase não encontrada para criação de cliente efêmero.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export const usersService = {
  async listarUsuarios(): Promise<UsuarioEquipe[]> {
    try {
      const [perfisRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("criado_em", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      if (perfisRes.data) {
        const perfis = perfisRes.data;
        const roles = rolesRes.data || [];

        return perfis.map((p) => {
          const roleData = roles.find((r) => r.user_id === p.id);
          const emailLower = (p.email || "").toLowerCase();
          const papel: "admin" | "vendedor" =
            emailLower === "meridiantech.co@gmail.com"
              ? "admin"
              : (roleData?.role as "admin" | "vendedor") ?? "vendedor";

          return {
            id: p.id,
            nome: p.nome || (p.email ? p.email.split("@")[0] || "Usuário" : "Usuário"),
            email: p.email || "",
            papel,
            status: "ativo",
            senhaProvisoria: null,
            criado_em: p.criado_em,
            ultimo_acesso: null,
          };
        });
      }
    } catch (err) {
      console.error("Erro ao listar usuários do Supabase:", err);
    }

    return [];
  },

  async criarNovoUsuario(dados: {
    nome: string;
    email: string;
    papel: "admin" | "vendedor";
    senhaProvisoria?: string;
  }): Promise<{ usuario: UsuarioEquipe; credenciaisTexto: string }> {
    const senhaInicial =
      dados.senhaProvisoria?.trim() || `Meridian@${Math.floor(1000 + Math.random() * 9000)}`;
    const emailLimpo = dados.email.trim().toLowerCase();
    const nomeLimpo = dados.nome.trim();

    let novoId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // 1. Usa o cliente isolado para não deslogar o administrador
    const isolatedClient = createIsolatedAuthClient();
    const { data: signUpData, error: signUpError } = await isolatedClient.auth.signUp({
      email: emailLimpo,
      password: senhaInicial,
      options: {
        data: {
          nome: nomeLimpo,
          papel: dados.papel,
          primeiro_acesso_pendente: true,
        },
      },
    });

    if (signUpError) {
      console.error("Erro no Supabase Auth SignUp:", signUpError);
      throw new Error(signUpError.message);
    }

    if (signUpData?.user?.id) {
      novoId = signUpData.user.id;

      // 2. Garante gravação de perfil e role pelo cliente autenticado do admin
      await Promise.all([
        supabase.from("profiles").upsert({
          id: novoId,
          nome: nomeLimpo,
          email: emailLimpo,
        }),
        supabase.from("user_roles").upsert({
          user_id: novoId,
          role: dados.papel,
        }),
      ]);
    }

    const novoUsuario: UsuarioEquipe = {
      id: novoId,
      nome: nomeLimpo,
      email: emailLimpo,
      papel: dados.papel,
      status: "pendente_primeiro_acesso",
      senhaProvisoria: senhaInicial,
      criado_em: new Date().toISOString(),
    };

    // 3. Registra log de auditoria
    await auditoriaService.registrarAtividade({
      tipo: "usuario_criado",
      titulo: `Novo membro cadastrado: ${nomeLimpo}`,
      descricao: `Administrador cadastrou o usuário ${nomeLimpo} (${emailLimpo}) com perfil ${dados.papel.toUpperCase()} no Meridian Hub.`,
      metadados: {
        usuario_criado_id: novoId,
        papel: dados.papel,
      },
    });

    const urlOrigem =
      typeof window !== "undefined" ? window.location.origin : "https://meridianhub.app";
    const credenciaisTexto = `*CONVITE DE ACESSO — MERIDIAN HUB*\n\nOlá ${nomeLimpo}!\nVocê foi cadastrado como *${dados.papel === "admin" ? "Administrador" : "Vendedor / Consultor"}* no Meridian Hub.\n\n*Acesse:* ${urlOrigem}/auth\n*E-mail:* ${emailLimpo}\n*Senha Inicial Provisória:* ${senhaInicial}\n\n_Ao fazer login com sua senha inicial, o sistema solicitará automaticamente o cadastro da sua senha pessoal definitiva._`;

    return {
      usuario: novoUsuario,
      credenciaisTexto,
    };
  },

  async alterarPapel(userId: string, novoPapel: "admin" | "vendedor"): Promise<void> {
    const { error } = await supabase.from("user_roles").upsert({
      user_id: userId,
      role: novoPapel,
    });

    if (error) {
      console.error("Erro ao alterar papel do usuário:", error);
      throw error;
    }

    await auditoriaService.registrarAtividade({
      tipo: "usuario_papel",
      titulo: `Permissão de usuário alterada`,
      descricao: `Papel de acesso alterado para ${novoPapel.toUpperCase()}.`,
      metadados: { usuario_alvo_id: userId, novo_papel: novoPapel },
    });
  },

  async removerUsuario(userId: string, nome?: string, email?: string): Promise<void> {
    try {
      // 1. Tenta chamar a RPC segura do Supabase (que exclui de auth.users + cascades)
      const { error: rpcError } = await supabase.rpc("admin_remover_usuario", {
        target_user_id: userId,
      });

      if (rpcError) {
        console.warn(
          "RPC admin_remover_usuario indisponível ou com restrição, aplicando exclusão direta das tabelas:",
          rpcError,
        );

        // Fallback: exclusão direta via RLS de administrador
        await Promise.allSettled([
          supabase.from("leads").update({ responsavel_id: null }).eq("responsavel_id", userId),
          supabase.from("user_roles").delete().eq("user_id", userId),
          supabase.from("profiles").delete().eq("id", userId),
        ]);
      }
    } catch (err) {
      console.error("Erro durante exclusão do usuário:", err);
      // Garante exclusão das tabelas públicas mesmo em caso de erro
      await Promise.allSettled([
        supabase.from("leads").update({ responsavel_id: null }).eq("responsavel_id", userId),
        supabase.from("user_roles").delete().eq("user_id", userId),
        supabase.from("profiles").delete().eq("id", userId),
      ]);
    }

    // 2. Registra o log de auditoria da exclusão
    await auditoriaService.registrarAtividade({
      tipo: "usuario_papel",
      titulo: `Membro removido da equipe: ${nome || userId}`,
      descricao: `O usuário ${nome ? `"${nome}"` : ""} (${email || userId}) foi removido permanentemente da plataforma pelo administrador.`,
      metadados: {
        usuario_removido_id: userId,
        usuario_removido_nome: nome,
        usuario_removido_email: email,
      },
    });
  },
};

export const usuariosService = usersService;
