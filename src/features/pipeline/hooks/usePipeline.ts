import { useEffect, useState } from "react";
import { leadsService, type LeadItem } from "@/features/leads";
import { auditoriaService } from "@/features/audit";
import { financialService } from "@/features/financial";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function usePipeline() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [conectadoRealtime, setConectadoRealtime] = useState(false);
  const [processandoAcaoFunil, setProcessandoAcaoFunil] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    const lista = await leadsService.listarLeads();
    setLeads(lista);
    setCarregando(false);
  };

  useEffect(() => {
    void carregarDados();

    const channel = supabase
      .channel("leads-funil-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const novo = payload.new as LeadItem;
          setLeads((prev) => [novo, ...prev.filter((l) => l.id !== novo.id)]);
          toast.info(`Novo lead recebido: ${novo.nome}`);
        } else if (payload.eventType === "UPDATE") {
          const atualizado = payload.new as LeadItem;
          setLeads((prev) => prev.map((l) => (l.id === atualizado.id ? atualizado : l)));
        } else if (payload.eventType === "DELETE") {
          const deletadoId = (payload.old as { id: string })?.id;
          if (deletadoId) {
            setLeads((prev) => prev.filter((l) => l.id !== deletadoId));
          }
        }
      })
      .subscribe((status) => {
        setConectadoRealtime(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const moverStatus = async (leadId: string, novoStatus: LeadItem["status"]) => {
    const leadAlvo = leads.find((l) => l.id === leadId);

    // Otimista
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: novoStatus } : l)));

    await leadsService.atualizarStatusLead(leadId, novoStatus);

    await auditoriaService.registrarAtividade({
      tipo: "mudanca_status",
      titulo: `Funil: ${leadAlvo?.nome || "Lead"} -> ${novoStatus.toUpperCase()}`,
      descricao: `Status do estabelecimento alterado para "${novoStatus.toUpperCase()}"`,
      lead_id: leadId,
      lead_nome: leadAlvo?.nome,
      metadados: {
        status_anterior: leadAlvo?.status,
        novo_status: novoStatus,
      },
    });

    if (novoStatus === "fechado" && leadAlvo) {
      toast.success(`🎉 Contrato Fechado com ${leadAlvo.nome}!`, {
        description: "Deseja lançar a receita deste contrato no Financeiro da Meridian Tech?",
        action: {
          label: "Lançar Receita",
          onClick: () => {
            void financialService.registrarReceitaLeadFechado(
              leadAlvo.id,
              leadAlvo.nome,
              2500.0,
              "venda_site",
              "pontual",
            );
            toast.success(`Receita de R$ 2.500,00 lançada no Financeiro para ${leadAlvo.nome}!`);
          },
        },
      });
    } else {
      toast.success(`Estágio alterado para "${novoStatus}"`);
    }
  };

  const reiniciarFunil = async () => {
    setProcessandoAcaoFunil(true);
    try {
      const total = await leadsService.reiniciarFunilLeads();
      setLeads((prev) => prev.map((l) => ({ ...l, status: "novo" })));

      await auditoriaService.registrarAtividade({
        tipo: "mudanca_status",
        titulo: "Funil reiniciado",
        descricao: `Todos os ${total} estabelecimentos foram movidos de volta para a etapa "Novo".`,
      });

      toast.success("Todos os leads foram movidos para a etapa 'Novo'!");
    } catch (err: any) {
      toast.error("Erro ao reiniciar funil", { description: err?.message || String(err) });
    } finally {
      setProcessandoAcaoFunil(false);
    }
  };

  const zerarBase = async () => {
    setProcessandoAcaoFunil(true);
    try {
      const total = await leadsService.zerarBaseLeads();
      setLeads([]);

      await auditoriaService.registrarAtividade({
        tipo: "edicao_lead",
        titulo: "Funil de estabelecimentos zerado",
        descricao: `Administrador zerou todos os ${total} estabelecimentos do funil.`,
      });

      toast.success("Funil e base de estabelecimentos zerados com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao zerar funil", { description: err?.message || String(err) });
    } finally {
      setProcessandoAcaoFunil(false);
    }
  };

  const removerLead = async (id: string, nome?: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    const sucesso = await leadsService.removerLead(id);
    if (sucesso) {
      await auditoriaService.registrarAtividade({
        tipo: "edicao_lead",
        titulo: `Estabelecimento excluído: ${nome || id}`,
        descricao: `Estabelecimento "${nome || id}" removido do funil comercial.`,
        lead_id: id,
        lead_nome: nome,
      });
      toast.success("Estabelecimento removido com sucesso!");
      return true;
    } else {
      toast.error("Erro ao remover estabelecimento.");
      void carregarDados();
      return false;
    }
  };

  return {
    leads,
    carregando,
    conectadoRealtime,
    processandoAcaoFunil,
    carregarDados,
    moverStatus,
    reiniciarFunil,
    zerarBase,
    removerLead,
  };
}
