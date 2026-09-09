import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/usersService";
import { auditoriaService, type AtividadeUsuario } from "@/features/audit";
import type { UsuarioEquipe } from "../types";
import { toast } from "sonner";

export function useUsers() {
  const queryClient = useQueryClient();

  const {
    data: usuarios = [],
    isPending: carregandoUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: usersService.listarUsuarios,
  });

  const {
    data: atividades = [],
    isPending: carregandoAtividades,
    refetch: refetchAtividades,
  } = useQuery({
    queryKey: ["activities"],
    queryFn: auditoriaService.listarAtividades,
  });

  const carregando = carregandoUsers || carregandoAtividades;

  const criarUsuario = async (dados: {
    nome: string;
    email: string;
    papel: "admin" | "vendedor";
    senhaProvisoria?: string;
  }) => {
    const res = await usersService.criarNovoUsuario(dados);
    queryClient.setQueryData<UsuarioEquipe[]>(["users"], (prev = []) => [
      res.usuario,
      ...prev.filter((u) => u.email !== res.usuario.email),
    ]);
    void queryClient.invalidateQueries({ queryKey: ["activities"] });
    return res;
  };

  const alterarPapel = async (userId: string, papel: "admin" | "vendedor") => {
    await usersService.alterarPapel(userId, papel);
    queryClient.setQueryData<UsuarioEquipe[]>(["users"], (prev = []) =>
      prev.map((u) => (u.id === userId ? { ...u, papel } : u)),
    );
    void queryClient.invalidateQueries({ queryKey: ["activities"] });
    toast.success("Função do usuário atualizada!");
  };

  const removerUsuario = async (userId: string, nome?: string, email?: string) => {
    try {
      await usersService.removerUsuario(userId, nome, email);
      queryClient.setQueryData<UsuarioEquipe[]>(["users"], (prev = []) =>
        prev.filter((u) => u.id !== userId),
      );
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(`Usuário ${nome || ""} removido com sucesso!`);
    } catch (err: any) {
      console.error("Erro ao remover usuário:", err);
      toast.error(err?.message || "Erro ao remover usuário do sistema.");
      throw err;
    }
  };

  const totalUsuarios = usuarios.length;
  const totalAdmins = useMemo(() => usuarios.filter((u) => u.papel === "admin").length, [usuarios]);
  const totalVendedores = useMemo(
    () => usuarios.filter((u) => u.papel === "vendedor").length,
    [usuarios],
  );

  return {
    usuarios,
    atividades,
    carregando,
    totalUsuarios,
    totalAdmins,
    totalVendedores,
    criarUsuario,
    alterarPapel,
    removerUsuario,
    recarregar: () => {
      void refetchUsers();
      void refetchAtividades();
    },
  };
}
