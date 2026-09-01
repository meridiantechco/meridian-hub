import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WhatsAppModal, type LeadItem } from "@/features/leads";
import { prospectaService } from "@/lib/prospecta-service";
import { financialService, type MetricasFinanceiras } from "@/features/financial";

import { DashboardHeader } from "./DashboardHeader";
import { DashboardKpis } from "./DashboardKpis";
import { AttentionPanel } from "./AttentionPanel";
import { CommercialPerformanceChart } from "./CommercialPerformanceChart";
import { FunnelOverview } from "./FunnelOverview";
import { FinancialSummaryWidget } from "./FinancialSummaryWidget";
import { RecentLeadsTable } from "./RecentLeadsTable";
import { DashboardSkeleton } from "./DashboardSkeleton";

export function DashboardView() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [metricasFin, setMetricasFin] = useState<MetricasFinanceiras | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [listaLeads, listaTx] = await Promise.all([
        prospectaService.listarLeads(),
        financialService.listarTransacoes(),
      ]);
      setLeads(listaLeads);
      setMetricasFin(financialService.calcularMetricas(listaTx));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const totalLeads = leads.length;
  const leadsSemSite = leads.filter((l) => !l.tem_site).length;
  const percSemSite = totalLeads > 0 ? Math.round((leadsSemSite / totalLeads) * 100) : 0;
  const scoreMedio =
    totalLeads > 0 ? Math.round(leads.reduce((acc, l) => acc + l.score, 0) / totalLeads) : 0;
  const fechados = leads.filter((l) => l.status === "fechado").length;
  const taxaConversao = totalLeads > 0 ? ((fechados / totalLeads) * 100).toFixed(1) : "0.0";

  const leadsRecentes = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
      .slice(0, 5);
  }, [leads]);

  const dadosCategorias = useMemo(() => {
    const contagem: Record<string, { total: number; semSite: number }> = {};
    leads.forEach((l) => {
      const cat = l.categoria || "Outros";
      if (!contagem[cat]) contagem[cat] = { total: 0, semSite: 0 };
      contagem[cat].total += 1;
      if (!l.tem_site) contagem[cat].semSite += 1;
    });

    return Object.entries(contagem)
      .map(([nome, val]) => ({
        categoria: nome.length > 14 ? `${nome.slice(0, 12)}...` : nome,
        categoriaCompleta: nome,
        total: val.total,
        semSite: val.semSite,
      }))
      .sort((a, b) => b.semSite - a.semSite)
      .slice(0, 6);
  }, [leads]);

  const dadosFunil = useMemo(() => {
    const etapas = [
      { status: "novo", name: "Novos Mapeados", cor: "oklch(0.62 0.23 295)" },
      { status: "contatado", name: "Contatados", cor: "oklch(0.72 0.18 75)" },
      { status: "proposta", name: "Propostas Ativas", cor: "oklch(0.65 0.18 245)" },
      { status: "fechado", name: "Fechados", cor: "oklch(0.75 0.16 160)" },
      { status: "recusado", name: "Recusados", cor: "oklch(0.60 0.22 25)" },
    ];

    return etapas.map((e) => ({
      name: e.name,
      status: e.status,
      quantidade: leads.filter((l) => l.status === e.status).length,
      cor: e.cor,
    }));
  }, [leads]);

  const handleAbordar = (lead: LeadItem) => {
    setLeadParaWhatsApp(lead);
    setModalWhatsAppAberto(true);
  };

  return (
    <AppShell
      titulo="Dashboard"
      descricao="Visão geral da operação comercial, pipeline de vendas e indicadores de mercado"
    >
      {carregando && leads.length === 0 ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* 1. HEADER DO DASHBOARD */}
          <DashboardHeader
            carregando={carregando}
            onAtualizar={carregarDados}
            totalLeads={totalLeads}
            fechados={fechados}
          />

          {/* 2. KPIS PRINCIPAIS */}
          <DashboardKpis
            totalLeads={totalLeads}
            leadsSemSite={leadsSemSite}
            percSemSite={percSemSite}
            scoreMedio={scoreMedio}
            taxaConversao={taxaConversao}
            fechados={fechados}
          />

          {/* 3. SEÇÃO: REQUER SUA ATENÇÃO */}
          <AttentionPanel leads={leads} onAbordar={handleAbordar} />

          {/* 4. BENTO GRID: PERFORMANCE COMERCIAL & FUNIL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CommercialPerformanceChart dadosCategorias={dadosCategorias} />
            </div>
            <div className="lg:col-span-1">
              <FunnelOverview dadosFunil={dadosFunil} totalLeads={totalLeads} />
            </div>
          </div>

          {/* 5. GESTÃO FINANCEIRA & PULSE WIDGET */}
          <FinancialSummaryWidget metricas={metricasFin} />

          {/* 6. ATIVIDADE RECENTE (TOP 5) */}
          <RecentLeadsTable leads={leadsRecentes} onAbordar={handleAbordar} />
        </div>
      )}

      {/* MODAL WHATSAPP INTEGRADO */}
      <WhatsAppModal
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />
    </AppShell>
  );
}
