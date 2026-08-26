import { supabase } from "@/integrations/supabase/client";
import { auditoriaService } from "@/features/audit";
import type { UsuarioEquipe } from "../types";

const STORAGE_KEY_USUARIOS = "meridian_equipe_usuarios_v1";
const STORAGE_KEY_USUARIOS_LEGADO = "prospecta_equipe_usuarios_v1";

function obterUsuariosStorage(): UsuarioEquipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY_USUARIOS) ||
      localStorage.getItem(STORAGE_KEY_USUARIOS_LEGADO);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UsuarioEquipe[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function salvarUsuariosStorage(itens: UsuarioEquipe[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_USUARIOS, JSON.stringify(itens));
  } catch (err) {
    console.error("Erro ao salvar usuários no storage local", err);
  }
}

export const usersService = {
  async listarUsuarios(): Promise<UsuarioEquipe[]> {
    const storageUsers = obterUsuariosStorage();

    try {
      const [perfisRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
      ]);

      if (perfisRes.data && perfisRes.data.length > 0) {
        const perfis = perfisRes.data;
        const roles = rolesRes.data || [];

        const usuariosMapeados: UsuarioEquipe[] = perfis.map((p) => {
          const roleData = roles.find((r) => r.user_id === p.id);
          const cached = storageUsers.find((s) => s.id === p.id || s.email === p.email);

          return {
            id: p.id,
            nome: p.nome,
            email: p.email,
            papel: (roleData?.role as "admin" | "vendedor") ?? cached?.papel ?? "vendedor",
            status: cached?.status ?? "ativo",
            senhaProvisoria: cached?.senhaProvisoria ?? null,
            criado_em: p.criado_em,
            ultimo_acesso: cached?.ultimo_acesso ?? null,
          };
        });

        const idsExistentes = new Set(usuariosMapeados.map((u) => u.id));
        const adicionais = storageUsers.filter((s) => !idsExistentes.has(s.id));
        const combinados = [...usuariosMapeados, ...adicionais];

        salvarUsuariosStorage(combinados);
        return combinados;
      }
    } catch {
      // fallback
    }

    return storageUsers;
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

    try {
      const { data: signUpData } = await supabase.auth.signUp({
        email: emailLimpo,
        password: senhaInicial,
        options: {
          data: {
            nome: nomeLimpo,
            primeiro_acesso_pendente: true,
          },
        },
      });

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
    } catch (err) {
      console.warn("Criação de usuário no Supabase Auth prosseguiu localmente:", err);
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

    const lista = obterUsuariosStorage();
    const novaLista = [novoUsuario, ...lista.filter((u) => u.email !== emailLimpo)];
    salvarUsuariosStorage(novaLista);

    await auditoriaService.registrarAtividade({
      tipo: "usuario_criado",
      titulo: `Novo membro cadastrado: ${nomeLimpo}`,
      descricao: `Administrador criou o usuário ${nomeLimpo} (${emailLimpo}) com função ${dados.papel.toUpperCase()} no Meridian Hub. Primeiro acesso pendente para definição de senha.`,
      metadados: {
        usuario_criado_id: novoId,
        papel: dados.papel,
      },
    });

    const urlOrigem = typeof window !== "undefined" ? window.location.origin : "https://meridianhub.app";
    const credenciaisTexto = `*CONVITE DE ACESSO — MERIDIAN HUB*\n\nOlá ${nomeLimpo}!\nVocê foi cadastrado como *${dados.papel === "admin" ? "Administrador" : "Vendedor / Consultor"}* no Meridian Hub (Meridian Tech).\n\n*Acesse:* ${urlOrigem}/auth\n*E-mail:* ${emailLimpo}\n*Senha Inicial Provisória:* ${senhaInicial}\n\n_No seu primeiro login, o sistema solicitará o cadastro da sua senha pessoal definitiva._`;

    return {
      usuario: novoUsuario,
      credenciaisTexto,
    };
  },

  async alterarPapel(userId: string, novoPapel: "admin" | "vendedor"): Promise<void> {
    try {
      await supabase.from("user_roles").upsert({
        user_id: userId,
        role: novoPapel,
      });
    } catch {
      // fallback
    }

    const lista = obterUsuariosStorage();
    const usuarioAlvo = lista.find((u) => u.id === userId);
    const novaLista = lista.map((u) => (u.id === userId ? { ...u, papel: novoPapel } : u));
    salvarUsuariosStorage(novaLista);

    await auditoriaService.registrarAtividade({
      tipo: "usuario_papel",
      titulo: `Permissão alterada: ${usuarioAlvo?.nome || "Membro"}`,
      descricao: `Papel de acesso alterado para ${novoPapel.toUpperCase()} no Meridian Hub.`,
      metadados: { usuario_alvo_id: userId, novo_papel: novoPapel },
    });
  },

  async removerUsuario(userId: string): Promise<void> {
    const lista = obterUsuariosStorage();
    const usuarioAlvo = lista.find((u) => u.id === userId);
    const novaLista = lista.filter((u) => u.id !== userId);
    salvarUsuariosStorage(novaLista);

    try {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);
    } catch {
      // fallback
    }

    await auditoriaService.registrarAtividade({
      tipo: "usuario_papel",
      titulo: `Membro removido: ${usuarioAlvo?.nome || "Usuário"}`,
      descricao: `Usuário ${usuarioAlvo?.email || userId} foi desvinculado da equipe no Meridian Hub.`,
    });
  },
};

export const usuariosService = usersService;
