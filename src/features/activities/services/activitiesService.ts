import { leadsService } from "@/features/leads";
import { tasksService } from "@/features/tasks";
import { calendarService } from "@/features/calendar";
import { auditoriaService } from "@/features/audit";
import type { AtividadeGlobal } from "../types";

export const activitiesService = {
  async listarAtividades(): Promise<AtividadeGlobal[]> {
    const [leads, tarefas, reunioes, auditorias] = await Promise.all([
      leadsService.listarLeads(),
      tasksService.listarTarefas(),
      calendarService.listarReunioes(),
      auditoriaService.listarAtividades({ limite: 100 }),
    ]);

    const lista: AtividadeGlobal[] = [];

    // Auditoria de atividades reais do Supabase
    auditorias.forEach((a) => {
      lista.push({
        id: `act-audit-${a.id}`,
        tipo: (a.tipo as any) || "interacao",
        titulo: a.titulo,
        descricao: a.descricao,
        empresa_nome: a.lead_nome || undefined,
        empresa_id: a.lead_id || undefined,
        usuario_nome: a.usuario_nome || "Operador",
        data_hora: a.criado_em,
      });
    });

    // Leads adicionados
    leads.forEach((l) => {
      lista.push({
        id: `act-lead-${l.id}`,
        tipo: "lead_criado",
        titulo: `Novo estabelecimento minerado: ${l.nome}`,
        descricao: `${l.categoria} · Score ${l.score} · ${!l.tem_site ? "Sem site próprio" : "Com website"}`,
        empresa_nome: l.nome,
        empresa_id: l.id,
        usuario_nome: "Radar Meridian",
        data_hora: l.criado_em,
      });

      if (l.status === "contatado" || l.status === "proposta" || l.status === "fechado") {
        lista.push({
          id: `act-status-${l.id}`,
          tipo: l.status === "proposta" ? "proposta_enviada" : "status_alterado",
          titulo: `Status alterado para "${l.status}" em ${l.nome}`,
          descricao: `Etapa comercial atualizada pela equipe`,
          empresa_nome: l.nome,
          empresa_id: l.id,
          usuario_nome: "Equipe Comercial",
          data_hora: l.atualizado_em || l.criado_em,
        });
      }
    });

    // Tarefas
    tarefas.forEach((t) => {
      if (t.status === "concluida" && t.concluida_em) {
        lista.push({
          id: `act-task-${t.id}`,
          tipo: "tarefa_concluida",
          titulo: `Tarefa concluída: ${t.titulo}`,
          descricao: t.descricao,
          empresa_nome: t.empresa_nome,
          empresa_id: t.empresa_id,
          usuario_nome: t.responsavel || "Equipe",
          data_hora: t.concluida_em,
        });
      }
    });

    // Reuniões
    reunioes.forEach((r) => {
      lista.push({
        id: `act-meet-${r.id}`,
        tipo: r.status === "realizada" ? "reuniao_concluida" : "reuniao_agendada",
        titulo: `${r.status === "realizada" ? "Reunião realizada" : "Reunião agendada"}: ${r.titulo}`,
        descricao: `Horário: ${r.horario} · Formato: ${r.local || "Online"}`,
        empresa_nome: r.empresa_nome,
        empresa_id: r.empresa_id,
        usuario_nome: "Equipe Comercial",
        data_hora: r.criado_em,
      });
    });

    // Ordenar por data mais recente
    return lista.sort(
      (a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime(),
    );
  },

  async excluirAtividade(id: string): Promise<boolean> {
    if (id.startsWith("act-audit-")) {
      const realId = id.replace("act-audit-", "");
      return await auditoriaService.excluirAtividade(realId);
    }
    return true;
  },
};
