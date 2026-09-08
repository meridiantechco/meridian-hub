import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Zap,
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Building2,
  Wallet,
  ChevronRight,
  PiggyBank,
  FileText,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Copy,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { WhatsAppModal, type LeadItem } from "@/features/leads";
import { prospectaService } from "@/lib/prospecta-service";
import { financialService, type MetricasFinanceiras } from "@/features/financial";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [metricasFin, setMetricasFin] = useState<MetricasFinanceiras | null>(null);
  const [carregando, setCarregando] = useState(true);

  // WhatsApp 1-Click Modal
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
  const fechados = leads.filter((l) => l.status === "fechado").length;
  const contatados = leads.filter((l) => l.status === "contatado").length;
  const propostas = leads.filter((l) => l.status === "proposta").length;
  const novos = leads.filter((l) => l.status === "novo").length;
  const taxaConversao = totalLeads > 0 ? ((fechados / totalLeads) * 100).toFixed(1) : "0.0";

  // Leads prioritários com atalho 1-click para WhatsApp
  const leadsFocoWhatsApp = useMemo(() => {
    return leads
      .filter((l) => !l.tem_site || l.score >= 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [leads]);

  const handleAbordar = (lead: LeadItem) => {
    setLeadParaWhatsApp(lead);
    setModalWhatsAppAberto(true);
  };

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const saldoLiquido = metricasFin?.lucroLiquido ?? 0;
  const faturamentoTotal = metricasFin?.receitaTotal ?? 0;

  return (
    <AppShell
      titulo="Dashboard"
      descricao="Visão geral e privativa da sua operação comercial, funil de conversão e faturamento"
      acoes={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={carregando}
            className="h-9 px-4 text-xs rounded-full gap-2 border-border/80 cursor-pointer hover:bg-secondary/60 transition-all"
          >
            <RefreshCw className={cn("size-3.5", carregando && "animate-spin")} />
            <span>Atualizar</span>
          </Button>

          <Button
            size="sm"
            asChild
            className="h-9 px-4 text-xs rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <Link to="/templates">
              <FileText className="size-3.5" />
              <span>Ver Scripts</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 sm:space-y-8 w-full">
        {/* LINHA 1: 4 BENTO CARDS EXECUTIVOS EXPANDIDOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* CARD 1: TOTAL CARTEIRA */}
          <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Minha Carteira
              </span>
              <div className="size-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Building2 className="size-5" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-black font-display tracking-tight text-foreground">
                {totalLeads}
              </p>
              <p className="text-xs text-muted-foreground">Estabelecimentos monitorados</p>
            </div>

            <Link
              to="/leads"
              className="inline-flex items-center justify-between w-full text-xs font-bold text-foreground hover:text-primary transition-colors pt-3 border-t border-border/60 group"
            >
              <span>Acessar Meus Clientes</span>
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* CARD 2: ALVOS SEM SITE PRÓPRIO (FOCO DE ALTA CONVERSÃO) */}
          <div className="rounded-3xl border border-primary/30 bg-card/85 backdrop-blur-sm p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4 ring-1 ring-primary/20 hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Alvos Sem Site
              </span>
              <div className="size-11 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center">
                <Zap className="size-5 fill-current" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl sm:text-5xl font-black font-display tracking-tight text-primary">
                  {leadsSemSite}
                </p>
                <span className="text-xs font-mono font-bold text-primary/80">
                  [{percSemSite}% da carteira]
                </span>
              </div>

              {/* Barra Cápsula */}
              <div className="w-full h-2.5 rounded-full bg-secondary/80 overflow-hidden flex">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${percSemSite}%` }}
                />
              </div>
            </div>

            <Link
              to="/leads"
              className="inline-flex items-center justify-between w-full text-xs font-bold text-primary hover:underline transition-colors pt-3 border-t border-border/60 group"
            >
              <span>Ver Oportunidades Sem Site</span>
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* CARD 3: FATURAMENTO TOTAL */}
          <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Receita Faturada
              </span>
              <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="size-5" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black font-display tracking-tight text-emerald-400 dado">
                {formatarMoeda(faturamentoTotal)}
              </p>
              <p className="text-xs text-muted-foreground">Contratos fechados e mensalidades</p>
            </div>

            <Link
              to="/financeiro"
              className="inline-flex items-center justify-between w-full text-xs font-bold text-foreground hover:text-emerald-400 transition-colors pt-3 border-t border-border/60 group"
            >
              <span>Fluxo Financeiro</span>
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* CARD 4: LUCRO LÍQUIDO REAL */}
          <div className="rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Lucro Líquido
              </span>
              <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <PiggyBank className="size-5" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black font-display tracking-tight text-emerald-400 dado">
                {formatarMoeda(saldoLiquido)}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Taxa Conversão:</span>
                <span className="font-bold text-emerald-400 font-mono">{taxaConversao}%</span>
              </div>
            </div>

            <Link
              to="/financeiro"
              className="inline-flex items-center justify-between w-full text-xs font-bold text-foreground hover:text-emerald-400 transition-colors pt-3 border-t border-border/60 group"
            >
              <span>Demonstrativo DRE</span>
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* LINHA 2: FUNIL DE CONVERSÃO COMERCIAL + ATALHOS WHATSAPP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* FUNIL DE CONVERSÃO EXPANDIDO (8 Colunas) */}
          <div className="lg:col-span-7 xl:col-span-8 rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-foreground font-display tracking-tight">
                  Meu Funil de Conversão Comercial
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Progresso e distribuição das oportunidades em cada estágio comercial
                </p>
              </div>

              <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                {fechados} Fechamentos
              </span>
            </div>

            {/* Segmentos do Funil em Cards de Cápsula Grandes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Etapa 1: Novos */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface/60 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Novos
                  </span>
                  <span className="size-2.5 rounded-full bg-purple-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
                  {novos}
                </p>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full transition-all duration-300"
                    style={{ width: totalLeads > 0 ? `${(novos / totalLeads) * 100}%` : "0%" }}
                  />
                </div>
                <p className="text-[10.5px] text-muted-foreground">Aguardando abordagem</p>
              </div>

              {/* Etapa 2: Contatados */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface/60 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Contatados
                  </span>
                  <span className="size-2.5 rounded-full bg-amber-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
                  {contatados}
                </p>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: totalLeads > 0 ? `${(contatados / totalLeads) * 100}%` : "0%" }}
                  />
                </div>
                <p className="text-[10.5px] text-muted-foreground">Conversa iniciada</p>
              </div>

              {/* Etapa 3: Propostas */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface/60 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Propostas
                  </span>
                  <span className="size-2.5 rounded-full bg-blue-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
                  {propostas}
                </p>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-300"
                    style={{ width: totalLeads > 0 ? `${(propostas / totalLeads) * 100}%` : "0%" }}
                  />
                </div>
                <p className="text-[10.5px] text-muted-foreground">Proposta enviada</p>
              </div>

              {/* Etapa 4: Fechados */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface/60 border border-emerald-500/30 space-y-2.5 ring-1 ring-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Contratos
                  </span>
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold font-display text-emerald-400">
                  {fechados}
                </p>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: totalLeads > 0 ? `${(fechados / totalLeads) * 100}%` : "0%" }}
                  />
                </div>
                <p className="text-[10.5px] text-emerald-400 font-medium">Negócios fechados</p>
              </div>
            </div>

            {/* Barra Cápsula Contínua Integrada */}
            <div className="space-y-2 pt-3 border-t border-border/60">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Eficiência de Fechamento do Funil
                </span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {taxaConversao}% de conversão
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-secondary/80 overflow-hidden flex gap-1 p-0.5">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all duration-500"
                  style={{ width: totalLeads > 0 ? `${(novos / totalLeads) * 100}%` : "25%" }}
                  title="Novos"
                />
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: totalLeads > 0 ? `${(contatados / totalLeads) * 100}%` : "25%" }}
                  title="Contatados"
                />
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: totalLeads > 0 ? `${(propostas / totalLeads) * 100}%` : "25%" }}
                  title="Propostas"
                />
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: totalLeads > 0 ? `${(fechados / totalLeads) * 100}%` : "25%" }}
                  title="Fechados"
                />
              </div>
            </div>
          </div>

          {/* ATALHOS / WHATSAPP 1-CLIQUE EXPANDIDO (4 Colunas) */}
          <div className="lg:col-span-5 xl:col-span-4 rounded-3xl border border-border/70 bg-card/85 backdrop-blur-sm p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base text-foreground font-display">
                  Atalhos de Abordagem
                </h3>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  WhatsApp 1-Clique
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Oportunidades de alta conversão para contato imediato
              </p>
            </div>

            {/* Lista dos leads de foco */}
            <div className="space-y-2.5">
              {leadsFocoWhatsApp.length === 0 ? (
                <div className="py-10 text-center space-y-2.5 bg-surface/40 rounded-2xl border border-border/50 p-4">
                  <p className="text-xs text-muted-foreground">
                    Nenhum cliente mapeado na carteira ainda.
                  </p>
                  <Link
                    to="/nova-busca"
                    className="inline-flex text-xs text-primary hover:underline font-bold"
                  >
                    Buscar empresas no Maps &rarr;
                  </Link>
                </div>
              ) : (
                leadsFocoWhatsApp.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface/60 border border-border/70 hover:border-emerald-500/40 hover:bg-surface transition-all gap-2"
                  >
                    <div className="min-w-0 flex-1 pr-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                          {lead.nome}
                        </p>
                        {!lead.tem_site && (
                          <span className="shrink-0 text-[9px] font-bold text-primary px-1.5 py-0.5 rounded-full bg-primary/15 border border-primary/25">
                            Sem site
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="size-2.5 shrink-0" />
                        {lead.bairro || lead.cidade || "Local"} · {lead.categoria}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAbordar(lead)}
                      className="h-8 px-3.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shrink-0 cursor-pointer shadow-xs transition-all hover:scale-105 active:scale-95"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>Abordar</span>
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/leads"
              className="inline-flex items-center justify-between w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors pt-3 border-t border-border/60"
            >
              <span>Ver todos os clientes na carteira</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* LINHA 3: CENTRAL DE SCRIPTS, TEMPLATES & SUPORTE COMERCIAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CARD TEMPLATES & SCRIPTS */}
          <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-sm border border-border/70 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Templates & Scripts</h4>
                  <p className="text-xs text-muted-foreground">Modelos de alta conversão</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Acesse roteiros validados para primeiro contato, proposta e follow-up no WhatsApp com
              interpolação dinâmica do nome da empresa.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-full text-xs font-semibold h-8.5 border-border/80 hover:bg-secondary/80"
            >
              <Link to="/templates">
                <span>Abrir Biblioteca de Scripts</span>
                <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* CARD TÁTICA SEM SITE */}
          <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-sm border border-border/70 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Foco: Sem Site Próprio</h4>
                  <p className="text-xs text-muted-foreground">Estratégia de abordagem</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Empresas bem avaliadas no Google que dependem apenas de redes sociais fecham até 3x
              mais rápido ao receberem uma prévia exclusiva de landing page.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-full text-xs font-semibold h-8.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Link to="/leads">
                <span>Filtrar Leads Sem Site</span>
                <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* CARD FLUXO FINANCEIRO */}
          <div className="p-6 rounded-3xl bg-card/85 backdrop-blur-sm border border-border/70 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Registro de Fechamentos</h4>
                  <p className="text-xs text-muted-foreground">Controle de receitas e MRR</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao concluir um contrato, lance a receita na hora para atualizar automaticamente seus
              indicadores de lucro líquido e ticket médio da operação.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-full text-xs font-semibold h-8.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Link to="/financeiro">
                <span>Lançar Nova Receita</span>
                <ChevronRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

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
