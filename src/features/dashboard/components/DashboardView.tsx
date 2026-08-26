import { Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModalMensagemWhatsApp } from "@/components/prospecta/ModalMensagemWhatsApp";
import { Button } from "@/components/ui/button";
import { prospectaService } from "@/lib/prospecta-service";
import { financialService, type MetricasFinanceiras } from "@/features/financial";
import type { LeadItem } from "@/lib/leads-mock";
import { RefreshCw, Search } from "lucide-react";
import { DashboardKpis } from "./DashboardKpis";
import { FinancialSummaryWidget } from "./FinancialSummaryWidget";
import { SegmentCharts } from "./SegmentCharts";
import { HotOpportunities } from "./HotOpportunities";
import { RecentLeadsTable } from "./RecentLeadsTable";

export function DashboardView() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [metricasFin, setMetricasFin] = useState<MetricasFinanceiras | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [leadParaWhatsApp, setLeadParaWhatsApp] = useState<LeadItem | null>(null);
  const [modalWhatsAppAberto, setModalWhatsAppAberto] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    const [listaLeads, listaTx] = await Promise.all([
      prospectaService.listarLeads(),
      financialService.listarTransacoes(),
    ]);
    setLeads(listaLeads);
    setMetricasFin(financialService.calcularMetricas(listaTx));
    setCarregando(false);
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

  const leadsMaisQuentes = useMemo(() => {
    return [...leads]
      .filter((l) => l.status === "novo" && !l.tem_site)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [leads]);

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
      { status: "novo", nome: "Novos", cor: "#c084fc" },
      { status: "contatado", nome: "Contatados", cor: "#f59e0b" },
      { status: "proposta", nome: "Propostas", cor: "#a855f7" },
      { status: "fechado", nome: "Fechados", cor: "#34d399" },
      { status: "recusado", nome: "Recusados", cor: "#f43f5e" },
    ];

    return etapas.map((e) => ({
      name: e.nome,
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
      titulo="Painel Comercial"
      descricao="Monitoramento de estabelecimentos minerados, oportunidades sem site, lucratividade real e taxas de conversão da Meridian Tech"
      acoes={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={carregando}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${carregando ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            asChild
            size="sm"
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            <Link to="/nova-busca">
              <Search className="size-3.5" />
              Detectar Estabelecimentos
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <DashboardKpis
          totalLeads={totalLeads}
          leadsSemSite={leadsSemSite}
          percSemSite={percSemSite}
          scoreMedio={scoreMedio}
          taxaConversao={taxaConversao}
          fechados={fechados}
        />

        <FinancialSummaryWidget metricas={metricasFin} />

        <SegmentCharts
          dadosCategorias={dadosCategorias}
          dadosFunil={dadosFunil}
          totalLeads={totalLeads}
        />

        <HotOpportunities leads={leadsMaisQuentes} onAbordar={handleAbordar} />

        <RecentLeadsTable leads={leadsRecentes} onAbordar={handleAbordar} />
      </div>

      <ModalMensagemWhatsApp
        lead={leadParaWhatsApp}
        aberto={modalWhatsAppAberto}
        onOpenChange={setModalWhatsAppAberto}
        onMensagemEnviada={carregarDados}
      />
    </AppShell>
  );
}
