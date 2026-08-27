import { useState, useEffect, useMemo } from "react";
import { usersService } from "../services/usersService";
import { auditoriaService, type AtividadeUsuario } from "@/features/audit";
import type { UsuarioEquipe } from "../types";
import { toast } from "sonner";

export function useUsers() {
  const [usuarios, setUsuarios] = useState<UsuarioEquipe[]>([]);
  const [atividades, setAtividades] = useState<AtividadeUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    setCarregando(true);
    const [listaUsers, listaAtividades] = await Promise.all([
      usersService.listarUsuarios(),
      auditoriaService.listarAtividades(),
    ]);

    setUsuarios(listaUsers);
    setAtividades(listaAtividades);
    setCarregando(false);
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const criarUsuario = async (dados: {
    nome: string;
    email: string;
    papel: "admin" | "vendedor";
    senhaProvisoria?: string;
  }) => {
    const res = await usersService.criarNovoUsuario(dados);
    setUsuarios((prev) => [res.usuario, ...prev.filter((u) => u.email !== res.usuario.email)]);
    void auditoriaService.listarAtividades().then(setAtividades);
    return res;
  };

  const alterarPapel = async (userId: string, papel: "admin" | "vendedor") => {
    await usersService.alterarPapel(userId, papel);
    setUsuarios((prev) => prev.map((u) => (u.id === userId ? { ...u, papel } : u)));
    void auditoriaService.listarAtividades().then(setAtividades);
    toast.success("Função do usuário atualizada!");
  };

  const removerUsuario = async (userId: string, nome?: string, email?: string) => {
    try {
      await usersService.removerUsuario(userId, nome, email);
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));
      void auditoriaService.listarAtividades().then(setAtividades);
      toast.success(`Usuário ${nome || ""} removido com sucesso!`);
    } catch (err: any) {
      console.error("Erro ao remover usuário:", err);
      toast.error(err?.message || "Erro ao remover usuário do sistema.");
      throw err;
    }
  };

  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.papel === "admin").length;
  const totalVendedores = usuarios.filter((u) => u.papel === "vendedor").length;
  const totalWhatsApp = atividades.filter((a) => a.tipo === "whatsapp").length;
  const totalStatusMovidos = atividades.filter((a) => a.tipo === "mudanca_status").length;
  const totalFechados = atividades.filter((a) => a.metadados?.["novo_status"] === "fechado").length;

  return {
    usuarios,
    atividades,
    carregando,
    totalUsuarios,
    totalAdmins,
    totalVendedores,
    totalWhatsApp,
    totalStatusMovidos,
    totalFechados,
    criarUsuario,
    alterarPapel,
    removerUsuario,
    recarregar: carregarDados,
  };
}
