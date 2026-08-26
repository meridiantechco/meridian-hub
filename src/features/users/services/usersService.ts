import { supabase } from "@/integrations/supabase/client";
import { auditoriaService } from "@/features/audit";
import type { UsuarioEquipe } from "../types";

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
          return {
            id: p.id,
            nome: p.nome,
            email: p.email,
            papel: (roleData?.role as "admin" | "vendedor") ?? "vendedor",
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

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: emailLimpo,
      password: senhaInicial,
      options: {
        data: {
          nome: nomeLimpo,
          primeiro_acesso_pendente: true,
        },
      },
    });

    if (signUpError) {
      console.error("Erro no Supabase Auth SignUp:", signUpError);
    }

    if (signUpData?.user?.id) {
      novoId = signUpData.user.id;

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

    await auditoriaService.registrarAtividade({
      tipo: "usuario_criado",
      titulo: `Novo membro cadastrado: ${nomeLimpo}`,
      descricao: `Administrador criou o usuário ${nomeLimpo} (${emailLimpo}) com função ${dados.papel.toUpperCase()} no Meridian Hub.`,
      metadados: {
        usuario_criado_id: novoId,
        papel: dados.papel,
      },
    });

    const urlOrigem = typeof window !== "undefined" ? window.location.origin : "https://meridianhub.app";
    const credenciaisTexto = `*CONVITE DE ACESSO — MERIDIAN HUB*\n\nOlá ${nomeLimpo}!\nVocê foi cadastrado como *${dados.papel === "admin" ? "Administrador" : "Vendedor / Consultor"}* no Meridian Hub.\n\n*Acesse:* ${urlOrigem}/auth\n*E-mail:* ${emailLimpo}\n*Senha Inicial Provisória:* ${senhaInicial}\n\n_No seu primeiro login, o sistema solicitará o cadastro da sua senha pessoal definitiva._`;

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

  async removerUsuario(userId: string): Promise<void> {
    await Promise.all([
      supabase.from("user_roles").delete().eq("user_id", userId),
      supabase.from("profiles").delete().eq("id", userId),
    ]);

    await auditoriaService.registrarAtividade({
      tipo: "usuario_papel",
      titulo: `Membro removido da equipe`,
      descricao: `Usuário ID ${userId} desvinculado do sistema.`,
    });
  },
};

export const usuariosService = usersService;
