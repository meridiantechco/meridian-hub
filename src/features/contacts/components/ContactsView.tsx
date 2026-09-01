import { Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Mail,
  Building2,
  Trash2,
  Pencil,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { contactsService } from "../services/contactsService";
import { ContactModal } from "./ContactModal";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { TableSkeleton, MetricCardsSkeleton } from "@/components/ui/skeletons";
import type { ContatoItem } from "../types";

export function ContactsView() {
  const [contatos, setContatos] = useState<ContatoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  // Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [contatoEditando, setContatoEditando] = useState<ContatoItem | null>(null);
  const [contatoParaExcluir, setContatoParaExcluir] = useState<ContatoItem | null>(null);
  const [excluindoContato, setExcluindoContato] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await contactsService.listarContatos();
      setContatos(lista);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregarDados();
  }, []);

  const totalComWhatsApp = useMemo(
    () => contatos.filter((c) => Boolean(c.whatsapp || c.telefone)).length,
    [contatos],
  );

  const totalComEmail = useMemo(
    () => contatos.filter((c) => Boolean(c.email)).length,
    [contatos],
  );

  const totalEmpresasVinculadas = useMemo(() => {
    const s = new Set(contatos.map((c) => c.empresa_nome));
    return s.size;
  }, [contatos]);

  const contatosFiltrados = useMemo(() => {
    return contatos.filter((c) => {
      if (busca.trim()) {
        const t = busca.toLowerCase();
        const nome = c.nome.toLowerCase();
        const emp = c.empresa_nome.toLowerCase();
        const cargo = c.cargo.toLowerCase();
        const email = (c.email || "").toLowerCase();
        if (!nome.includes(t) && !emp.includes(t) && !cargo.includes(t) && !email.includes(t)) {
          return false;
        }
      }
      return true;
    });
  }, [contatos, busca]);

  const handleSalvar = async (dados: Omit<ContatoItem, "id" | "criado_em">) => {
    if (contatoEditando) {
      await contactsService.atualizarContato(contatoEditando.id, dados);
    } else {
      await contactsService.salvarContato(dados);
    }
    await carregarDados();
  };

  const abrirWhatsApp = (telefone: string) => {
    const numLimpo = telefone.replace(/\D/g, "");
    const ddi = numLimpo.length <= 11 ? `55${numLimpo}` : numLimpo;
    window.open(`https://wa.me/${ddi}`, "_blank", "noopener,noreferrer");
  };

  return (
    <AppShell
      titulo="Contatos & Tomadores de Decisão"
      descricao="Diretório de proprietários, diretores e contatos-chave vinculados a contas comerciais"
      acoes={
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setContatoEditando(null);
              setModalAberto(true);
            }}
            size="sm"
            className="h-8.5 px-3.5 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Novo Contato</span>
          </Button>
        </div>
      }
    >
      {carregando && contatos.length === 0 ? (
        <div className="space-y-4 max-w-6xl animate-fade-in">
          <MetricCardsSkeleton quantidade={4} colunas="grid-cols-2 sm:grid-cols-4" />
          <TableSkeleton colunas={6} linhas={6} mostrarFiltros={true} />
        </div>
      ) : (
        <div className="space-y-4 max-w-6xl animate-fade-in">
          {/* CARDS RESUMO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
              <div>
                <p className="rotulo text-[10px]">Total de Contatos</p>
                <p className="text-2xl font-bold font-display dado mt-0.5 text-foreground">
                  {contatos.length}
                </p>
              </div>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-emerald-400">Com WhatsApp Direto</p>
              <p className="text-2xl font-bold font-display text-emerald-400 dado mt-0.5">
                {totalComWhatsApp}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px] text-primary">Com E-mail Corporativo</p>
              <p className="text-2xl font-bold font-display text-primary dado mt-0.5">
                {totalComEmail}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Mail className="size-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex items-center justify-between">
            <div>
              <p className="rotulo text-[10px]">Contas Vinculadas</p>
              <p className="text-2xl font-bold font-display dado mt-0.5 text-foreground">
                {totalEmpresasVinculadas}
              </p>
            </div>
            <div className="size-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
          </div>
        </div>

        {/* TABELA DE CONTATOS COM TOOLBAR INTEGRADA */}
        <Card className="bg-card border-border/80 shadow-elev overflow-hidden">
          {/* TOOLBAR INTEGRADA */}
          <div className="p-3.5 border-b border-border/60 bg-surface/30 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cargo, empresa ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-8 text-xs h-8.5 bg-surface/50 border-border/70"
              />
            </div>
            <span className="text-xs text-muted-foreground dado font-mono shrink-0">
              {contatosFiltrados.length} {contatosFiltrados.length === 1 ? "contato" : "contatos"}
            </span>
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/70 text-muted-foreground uppercase text-[10px] rotulo tracking-wider whitespace-nowrap">
                    <th className="p-3 pl-4">Contato / Nome</th>
                    <th className="p-3">Cargo</th>
                    <th className="p-3">Empresa Associada</th>
                    <th className="p-3">Telefone / WhatsApp</th>
                    <th className="p-3">E-mail</th>
                    <th className="p-3 pr-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {contatosFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="p-3 pl-4 font-semibold text-foreground text-xs">
                        {c.nome}
                      </td>

                      <td className="p-3 text-muted-foreground text-xs">{c.cargo}</td>

                      <td className="p-3">
                        {c.empresa_id ? (
                          <Link
                            to="/companies/$id"
                            params={{ id: c.empresa_id }}
                            className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                          >
                            <Building2 className="size-3" />
                            <span>{c.empresa_nome}</span>
                          </Link>
                        ) : (
                          <span className="text-foreground">{c.empresa_nome}</span>
                        )}
                      </td>

                      <td className="p-3 font-mono text-muted-foreground text-xs">
                        {c.telefone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="size-3 text-primary" />
                            <span>{c.telefone}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="p-3 text-muted-foreground text-xs">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="hover:text-primary transition-colors inline-flex items-center gap-1"
                          >
                            <Mail className="size-3 text-muted-foreground" />
                            <span>{c.email}</span>
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.telefone && (
                            <Button
                              size="sm"
                              onClick={() => abrirWhatsApp(c.telefone!)}
                              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] gap-1 font-semibold shadow-xs"
                            >
                              <MessageSquare className="size-3" />
                              WhatsApp
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setContatoEditando(c);
                              setModalAberto(true);
                            }}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Editar contato"
                          >
                            <Pencil className="size-3.5" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setContatoParaExcluir(c)}
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Remover contato"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {contatosFiltrados.length === 0 && !carregando && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center space-y-2">
                        <Users className="size-8 text-muted-foreground/40 mx-auto" />
                        <p className="text-sm font-semibold text-foreground">
                          Nenhum contato cadastrado
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Clique em "Novo Contato" para adicionar os primeiros tomadores de decisão.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* DIÁLOGO DE EXCLUSÃO DE CONTATO */}
      <ConfirmDeleteDialog
        open={Boolean(contatoParaExcluir)}
        onOpenChange={(open) => !open && setContatoParaExcluir(null)}
        titulo="Remover Contato?"
        descricao="Este contato será removido permanentemente da base de decisores."
        itemNome={contatoParaExcluir ? `${contatoParaExcluir.nome} (${contatoParaExcluir.cargo} - ${contatoParaExcluir.empresa_nome})` : undefined}
        carregando={excluindoContato}
        onConfirmar={async () => {
          if (!contatoParaExcluir) return;
          setExcluindoContato(true);
          try {
            await contactsService.excluirContato(contatoParaExcluir.id);
            toast.success("Contato removido com sucesso!");
            await carregarDados();
            setContatoParaExcluir(null);
          } finally {
            setExcluindoContato(false);
          }
        }}
      />

      {/* MODAL ADICIONAR / EDITAR CONTATO */}
      <ContactModal
        aberto={modalAberto}
        onOpenChange={setModalAberto}
        contatoParaEditar={contatoEditando}
        onSalvar={handleSalvar}
      />
    </AppShell>
  );
}
