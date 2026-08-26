import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/prospecta/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { usuariosService, type UsuarioEquipe } from "@/lib/usuarios-service";
import {
  auditoriaService,
  type AtividadeUsuario,
  type TipoAtividade,
} from "@/lib/auditoria-service";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Shield,
  User,
  CheckCircle2,
  Mail,
  Calendar,
  KeyRound,
  Copy,
  Check,
  Activity,
  MessageSquare,
  Kanban,
  Radar,
  Flame,
  Award,
  Clock,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Building2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestão de Usuários & Auditoria — Prospecta" },
      {
        name: "description",
        content: "Administração de equipe comercial e análise completa de movimentações",
      },
    ],
  }),
  component: PaginaUsuarios,
});

const ICONES_ATIVIDADE: Record<TipoAtividade, any> = {
  whatsapp: MessageSquare,
  mudanca_status: Kanban,
  mineracao: Radar,
  novo_lead: Building2,
  edicao_lead: Activity,
  interacao: MessageSquare,
  usuario_criado: UserPlus,
  usuario_papel: Shield,
  primeiro_acesso: KeyRound,
  financeiro: Wallet,
  login: ShieldCheck,
};

const CORES_ATIVIDADE: Record<TipoAtividade, string> = {
  whatsapp: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  mudanca_status: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  mineracao: "text-primary bg-primary/10 border-primary/30",
  novo_lead: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  edicao_lead: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  interacao: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  usuario_criado: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  usuario_papel: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  primeiro_acesso: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  financeiro: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  login: "text-muted-foreground bg-secondary border-border",
};

export function PaginaUsuarios() {
  const { ehAdmin, user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioEquipe[]>([]);
  const [atividades, setAtividades] = useState<AtividadeUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [abaAtiva, setAbaAtiva] = useState<"equipe" | "auditoria" | "metricas">("equipe");

  // Modal de Criação de Usuário
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoPapel, setNovoPapel] = useState<"admin" | "vendedor">("vendedor");
  const [senhaGerada, setSenhaGerada] = useState("");
  const [salvandoUsuario, setSalvandoUsuario] = useState(false);

  // Modal de Convite Gerado
  const [modalConviteAberto, setModalConviteAberto] = useState(false);
  const [textoConvite, setTextoConvite] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Modal de Histórico Individual do Usuário
  const [usuarioSelecionadoHistorico, setUsuarioSelecionadoHistorico] =
    useState<UsuarioEquipe | null>(null);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);

  // Filtros da Timeline de Auditoria
  const [filtroUsuarioAuditoria, setFiltroUsuarioAuditoria] = useState<string>("todos");
  const [filtroTipoAuditoria, setFiltroTipoAuditoria] = useState<string>("todos");

  const carregarDados = async () => {
    setCarregando(true);
    const [listaUsers, listaAtividades] = await Promise.all([
      usuariosService.listarUsuarios(),
      auditoriaService.listarAtividades(),
    ]);

    setUsuarios(listaUsers);
    setAtividades(listaAtividades);
    setCarregando(false);
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const abrirModalCriar = () => {
    setNovoNome("");
    setNovoEmail("");
    setNovoPapel("vendedor");
    setSenhaGerada(`Prospecta@${Math.floor(1000 + Math.random() * 9000)}`);
    setModalCriarAberto(true);
  };

  const criarUsuarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSalvandoUsuario(true);
    try {
      const res = await usuariosService.criarNovoUsuario({
        nome: novoNome.trim(),
        email: novoEmail.trim(),
        papel: novoPapel,
        senhaProvisoria: senhaGerada,
      });

      setUsuarios((prev) => [res.usuario, ...prev.filter((u) => u.email !== res.usuario.email)]);
      setTextoConvite(res.credenciaisTexto);
      setModalCriarAberto(false);
      setModalConviteAberto(true);

      // Recarregar atividades
      void auditoriaService.listarAtividades().then(setAtividades);

      toast.success(`Usuário ${novoNome} cadastrado com sucesso!`);
    } catch (err: any) {
      toast.error("Falha ao criar usuário", { description: err?.message || String(err) });
    } finally {
      setSalvandoUsuario(false);
    }
  };

  const copiarConvite = async () => {
    try {
      await navigator.clipboard.writeText(textoConvite);
      setCopiado(true);
      toast.success("Credenciais de primeiro acesso copiadas!");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const alterarPapel = async (userId: string, papel: "admin" | "vendedor") => {
    await usuariosService.alterarPapel(userId, papel);
    setUsuarios((prev) => prev.map((u) => (u.id === userId ? { ...u, papel } : u)));
    void auditoriaService.listarAtividades().then(setAtividades);
    toast.success("Função do usuário atualizada!");
  };

  const abrirHistoricoIndividual = (u: UsuarioEquipe) => {
    setUsuarioSelecionadoHistorico(u);
    setModalHistoricoAberto(true);
  };

  // Métricas Globais da Equipe
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.papel === "admin").length;
  const totalVendedores = usuarios.filter((u) => u.papel === "vendedor").length;
  const totalWhatsApp = atividades.filter((a) => a.tipo === "whatsapp").length;
  const totalStatusMovidos = atividades.filter((a) => a.tipo === "mudanca_status").length;
  const totalFechados = atividades.filter((a) => a.metadados?.["novo_status"] === "fechado").length;

  // Atividades filtradas para a timeline
  const atividadesFiltradas = useMemo(() => {
    return atividades.filter((a) => {
      if (
        filtroUsuarioAuditoria !== "todos" &&
        a.usuario_id !== filtroUsuarioAuditoria &&
        a.usuario_email !== filtroUsuarioAuditoria
      ) {
        return false;
      }
      if (filtroTipoAuditoria !== "todos" && a.tipo !== filtroTipoAuditoria) {
        return false;
      }
      return true;
    });
  }, [atividades, filtroUsuarioAuditoria, filtroTipoAuditoria]);

  // Atividades do usuário selecionado no modal
  const atividadesUsuarioSelecionado = useMemo(() => {
    if (!usuarioSelecionadoHistorico) return [];
    return atividades.filter(
      (a) =>
        a.usuario_id === usuarioSelecionadoHistorico.id ||
        a.usuario_email.toLowerCase() === usuarioSelecionadoHistorico.email.toLowerCase(),
    );
  }, [atividades, usuarioSelecionadoHistorico]);

  return (
    <AppShell
      titulo="Gestão de Equipe & Auditoria"
      descricao="Controle de acessos, cadastro de usuários com primeiro acesso e análise completa de movimentações"
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
            onClick={abrirModalCriar}
            size="sm"
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            <UserPlus className="size-3.5" />
            Adicionar Usuário
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {/* CARDS DE INDICADORES DE ATIVIDADE DA EQUIPE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px]">Equipe Comercial</p>
              <p className="text-2xl font-bold font-display dado mt-0.5 text-foreground">
                {totalUsuarios}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({totalVendedores} SDRs)
                </span>
              </p>
            </div>
            <div className="size-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-emerald-400">Abordagens WhatsApp</p>
              <p className="text-2xl font-bold font-display text-emerald-400 dado mt-0.5">
                {totalWhatsApp}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-purple-400">Movimentações no Funil</p>
              <p className="text-2xl font-bold font-display text-purple-400 dado mt-0.5">
                {totalStatusMovidos}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Kanban className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-sm flex items-center justify-between ring-1 ring-emerald-500/30">
            <div>
              <p className="rotulo text-[10px] text-emerald-400">Contratos Fechados</p>
              <p className="text-2xl font-bold font-display text-emerald-400 dado mt-0.5">
                {totalFechados}
              </p>
            </div>
            <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Award className="size-4" />
            </div>
          </div>
        </div>

        {/* ABAS PRINCIPAIS */}
        <Tabs value={abaAtiva} onValueChange={(val) => setAbaAtiva(val as any)} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
            <TabsList className="bg-secondary/70 p-1">
              <TabsTrigger value="equipe" className="text-xs font-semibold gap-1.5">
                <Users className="size-3.5" />
                Membros da Equipe ({usuarios.length})
              </TabsTrigger>
              <TabsTrigger value="auditoria" className="text-xs font-semibold gap-1.5">
                <Activity className="size-3.5" />
                Histórico de Movimentações ({atividades.length})
              </TabsTrigger>
              <TabsTrigger value="metricas" className="text-xs font-semibold gap-1.5">
                <TrendingUp className="size-3.5" />
                Produtividade por Vendedor
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ========================================================================= */}
          {/* ABA 1: MEMBROS DA EQUIPE & PERFORMANCE INDIVIDUAL */}
          {/* ========================================================================= */}
          <TabsContent value="equipe" className="space-y-4 pt-4">
            <Card className="bg-card border-border shadow-elev overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/70 bg-surface/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" />
                      Membros e Vendedores Cadastrados
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Gerencie acessos, papéis administrativos e consulte o volume de atividade
                      individual
                    </CardDescription>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <span className="size-2 rounded-full bg-emerald-400" /> Ativo
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      <span className="size-2 rounded-full bg-amber-400" /> 1º Acesso Pendente
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {usuarios.map((u) => {
                    const resumo = auditoriaService.obterResumoPorUsuario(u.id);

                    return (
                      <div
                        key={u.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 gap-4 hover:bg-secondary/20 transition-colors"
                      >
                        {/* Info Usuário */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold font-display shrink-0 mt-0.5">
                            {u.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {u.nome}
                              </span>

                              {u.papel === "admin" ? (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                  <Shield className="size-2.5" /> Administrador
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                                  <User className="size-2.5" /> Vendedor / SDR
                                </span>
                              )}

                              {u.status === "pendente_primeiro_acesso" && (
                                <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                                  <KeyRound className="size-2.5" /> 1º Acesso Pendente
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 dado">
                              <Mail className="size-3" /> {u.email}
                            </p>
                          </div>
                        </div>

                        {/* Indicadores de Movimentações */}
                        <div className="flex items-center gap-4 text-xs border-y lg:border-y-0 lg:border-x border-border/60 py-2 lg:py-0 px-0 lg:px-4 flex-wrap">
                          <div className="text-center">
                            <p className="rotulo text-[9px]">WhatsApp</p>
                            <p className="font-bold text-sm text-emerald-400 dado">
                              {resumo.totalWhatsApp}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="rotulo text-[9px]">Movimentações</p>
                            <p className="font-bold text-sm text-purple-400 dado">
                              {resumo.totalMudancasStatus}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="rotulo text-[9px]">Fechados</p>
                            <p className="font-bold text-sm text-emerald-400 dado">
                              {resumo.totalFechados}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="rotulo text-[9px]">Total Ações</p>
                            <p className="font-bold text-sm text-foreground dado">
                              {resumo.totalAcoes}
                            </p>
                          </div>
                        </div>

                        {/* Ações do Admin */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Botão Ver Movimentações */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirHistoricoIndividual(u)}
                            className="h-8 text-xs gap-1.5 border-border hover:border-primary/50"
                          >
                            <Activity className="size-3.5 text-primary" />
                            <span>Movimentações</span>
                          </Button>

                          {/* Seletor de Papel */}
                          <Select
                            value={u.papel}
                            onValueChange={(val) => alterarPapel(u.id, val as "admin" | "vendedor")}
                          >
                            <SelectTrigger className="h-8 w-28 text-xs bg-surface/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vendedor">Vendedor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}

                  {usuarios.length === 0 && (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      Nenhum usuário cadastrado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* ABA 2: LINHA DO TEMPO DE MOVIMENTAÇÕES (AUDITORIA GLOBAL) */}
          {/* ========================================================================= */}
          <TabsContent value="auditoria" className="space-y-4 pt-4">
            <Card className="bg-card border-border shadow-elev">
              <CardHeader className="pb-3 border-b border-border/70 bg-surface/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Activity className="size-4 text-primary" />
                      Feed de Movimentações da Equipe
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Registro cronológico detalhado de todas as ações comerciais e operacionais
                    </CardDescription>
                  </div>

                  {/* Filtros da Auditoria */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select
                      value={filtroUsuarioAuditoria}
                      onValueChange={setFiltroUsuarioAuditoria}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs bg-surface/50">
                        <SelectValue placeholder="Membro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os membros</SelectItem>
                        {usuarios.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filtroTipoAuditoria} onValueChange={setFiltroTipoAuditoria}>
                      <SelectTrigger className="h-8 w-36 text-xs bg-surface/50">
                        <SelectValue placeholder="Tipo de Ação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as ações</SelectItem>
                        <SelectItem value="whatsapp">Abordagem WhatsApp</SelectItem>
                        <SelectItem value="mudanca_status">Movimentação Funil</SelectItem>
                        <SelectItem value="mineracao">Mineração de Leads</SelectItem>
                        <SelectItem value="usuario_criado">Criação de Usuário</SelectItem>
                        <SelectItem value="primeiro_acesso">Primeiro Acesso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {atividadesFiltradas.map((act) => {
                    const Icone = ICONES_ATIVIDADE[act.tipo] || Activity;
                    const corClasse =
                      CORES_ATIVIDADE[act.tipo] || "text-primary bg-primary/10 border-primary/30";

                    return (
                      <div
                        key={act.id}
                        className="flex items-start gap-3.5 p-4 hover:bg-secondary/20 transition-colors"
                      >
                        <div
                          className={cn(
                            "size-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5",
                            corClasse,
                          )}
                        >
                          <Icone className="size-4" />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                              {act.titulo}
                            </h4>
                            <span className="text-[11px] text-muted-foreground shrink-0 dado flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(act.criado_em).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              · {new Date(act.criado_em).toLocaleDateString("pt-BR")}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {act.descricao}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground flex-wrap">
                            <span className="font-medium text-foreground flex items-center gap-1">
                              <User className="size-3 text-primary" />
                              {act.usuario_nome}
                            </span>
                            {act.lead_nome && (
                              <span className="text-primary flex items-center gap-1">
                                <Building2 className="size-3" />
                                {act.lead_nome}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {atividadesFiltradas.length === 0 && (
                    <div className="p-12 text-center text-xs text-muted-foreground">
                      Nenhuma atividade encontrada com os filtros selecionados.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* ABA 3: MÉTRICAS DE PERFORMANCE POR VENDEDOR */}
          {/* ========================================================================= */}
          <TabsContent value="metricas" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usuarios.map((u) => {
                const resumo = auditoriaService.obterResumoPorUsuario(u.id);
                const taxaConversao =
                  resumo.totalWhatsApp > 0
                    ? ((resumo.totalFechados / resumo.totalWhatsApp) * 100).toFixed(1)
                    : "0.0";

                return (
                  <Card key={u.id} className="bg-card border-border shadow-elev">
                    <CardHeader className="pb-3 border-b border-border/70 bg-surface/20">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <CardTitle className="text-sm font-semibold">{u.nome}</CardTitle>
                          <CardDescription className="text-[11px] truncate">
                            {u.email}
                          </CardDescription>
                        </div>
                        <span className="text-[10px] font-bold uppercase rotulo px-2 py-0.5 rounded bg-secondary">
                          {u.papel}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-lg bg-surface/50 border border-border/60">
                          <p className="rotulo text-[9px]">WhatsApp</p>
                          <p className="text-lg font-bold text-emerald-400 dado mt-0.5">
                            {resumo.totalWhatsApp}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface/50 border border-border/60">
                          <p className="rotulo text-[9px]">Status Movidos</p>
                          <p className="text-lg font-bold text-purple-400 dado mt-0.5">
                            {resumo.totalMudancasStatus}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface/50 border border-border/60">
                          <p className="rotulo text-[9px]">Fechados</p>
                          <p className="text-lg font-bold text-emerald-400 dado mt-0.5">
                            {resumo.totalFechados}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-surface/50 border border-border/60">
                          <p className="rotulo text-[9px]">Conversão</p>
                          <p className="text-lg font-bold text-primary dado mt-0.5">
                            {taxaConversao}%
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirHistoricoIndividual(u)}
                        className="w-full h-8 text-xs gap-1.5"
                      >
                        <Activity className="size-3.5 text-primary" />
                        Ver Linha do Tempo Completa
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADICIONAR NOVO USUÁRIO */}
      {/* ========================================================================= */}
      <Dialog open={modalCriarAberto} onOpenChange={setModalCriarAberto}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              Cadastrar Novo Membro da Equipe
            </DialogTitle>
            <DialogDescription className="text-xs">
              O novo usuário receberá uma senha provisória e, no primeiro acesso, será obrigado a
              cadastrar sua senha pessoal definitiva.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={criarUsuarioSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-xs font-semibold">
                Nome Completo *
              </Label>
              <Input
                id="nome"
                placeholder="Ex: João da Silva"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                required
                className="text-xs h-9 bg-surface/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                E-mail Profissional *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="joao.vendas@empresa.com"
                value={novoEmail}
                onChange={(e) => setNovoEmail(e.target.value)}
                required
                className="text-xs h-9 bg-surface/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="papel" className="text-xs font-semibold">
                Função / Nível de Acesso *
              </Label>
              <Select value={novoPapel} onValueChange={(val) => setNovoPapel(val as any)}>
                <SelectTrigger className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">
                    Vendedor / Consultor SDR (Acesso ao Funil e Leads)
                  </SelectItem>
                  <SelectItem value="admin">
                    Administrador (Acesso Total e Gestão de Equipe)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="senha"
                className="text-xs font-semibold flex items-center justify-between"
              >
                <span>Senha Inicial Provisória</span>
                <span className="text-[10px] text-muted-foreground">Gerada automaticamente</span>
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="senha"
                  value={senhaGerada}
                  onChange={(e) => setSenhaGerada(e.target.value)}
                  className="text-xs h-9 pl-9 font-mono bg-surface/50 text-primary font-semibold"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModalCriarAberto(false)}
                className="text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvandoUsuario || !novoNome.trim() || !novoEmail.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
              >
                {salvandoUsuario ? "Cadastrando..." : "Cadastrar e Gerar Convite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: CONVITE DE PRIMEIRO ACESSO GERADO */}
      {/* ========================================================================= */}
      <Dialog open={modalConviteAberto} onOpenChange={setModalConviteAberto}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="size-4" />
              Usuário Cadastrado com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-xs">
              Copie a mensagem abaixo e envie para o novo membro via WhatsApp ou E-mail. Ele
              precisará cadastrar sua senha definitiva no primeiro login.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-surface/70 border border-border text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">
              {textoConvite}
            </div>

            <Button
              type="button"
              onClick={copiarConvite}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 gap-2 font-semibold"
            >
              {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copiado ? "Copiado com Sucesso!" : "Copiar Credenciais de Primeiro Acesso"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: ANÁLISE COMPLETA DE MOVIMENTAÇÕES DO USUÁRIO */}
      {/* ========================================================================= */}
      <Dialog open={modalHistoricoAberto} onOpenChange={setModalHistoricoAberto}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold font-display">
                {usuarioSelecionadoHistorico?.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Histórico de {usuarioSelecionadoHistorico?.nome}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {usuarioSelecionadoHistorico?.email} ·{" "}
                  {usuarioSelecionadoHistorico?.papel.toUpperCase()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 p-1 space-y-3">
            {atividadesUsuarioSelecionado.map((act) => {
              const Icone = ICONES_ATIVIDADE[act.tipo] || Activity;
              const corClasse =
                CORES_ATIVIDADE[act.tipo] || "text-primary bg-primary/10 border-primary/30";

              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface/40 border border-border/70"
                >
                  <div
                    className={cn(
                      "size-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5",
                      corClasse,
                    )}
                  >
                    <Icone className="size-3.5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-semibold text-xs text-foreground">{act.titulo}</h5>
                      <span className="text-[10px] text-muted-foreground dado">
                        {new Date(act.criado_em).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {new Date(act.criado_em).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{act.descricao}</p>
                  </div>
                </div>
              );
            })}

            {atividadesUsuarioSelecionado.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Nenhuma movimentação registrada para este usuário até o momento.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
