import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type {
  CategoriaDespesa,
  CategoriaReceita,
  RecorrenciaTransacao,
  StatusTransacao,
  TransacaoFinanceira,
} from "../types";
import type { LeadItem } from "@/lib/leads-mock";

interface ModalNovaDespesaProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: (dados: Omit<TransacaoFinanceira, "id" | "tipo" | "criado_em">) => Promise<void>;
}

export function ModalNovaDespesa({ aberto, onOpenChange, onSalvar }: ModalNovaDespesaProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDespesa>("tecnologia");
  const [valor, setValor] = useState("");
  const [dataCompetencia, setDataCompetencia] = useState(new Date().toISOString().slice(0, 10));
  const [recorrencia, setRecorrencia] = useState<RecorrenciaTransacao>("mensal");
  const [status, setStatus] = useState<StatusTransacao>("pago");
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseFloat(valor.replace(",", "."));
    if (isNaN(numValor) || numValor <= 0) {
      toast.error("Informe um valor válido em reais.");
      return;
    }
    if (!titulo.trim()) {
      toast.error("Informe o título do gasto.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        valor: numValor,
        data_competencia: dataCompetencia,
        data_pagamento: status === "pago" ? dataCompetencia : null,
        recorrencia,
        status,
      });
      setTitulo("");
      setDescricao("");
      setValor("");
      onOpenChange(false);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <TrendingDown className="size-4 text-pink-400" />
            Cadastrar Novo Gasto / Despesa
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registre custos operacionais, APIs, infraestrutura ou despesas da sua agência
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="desp-titulo" className="text-xs font-semibold text-foreground">
              Descrição do Gasto *
            </Label>
            <Input
              id="desp-titulo"
              placeholder="Ex: Google Places API, WhatsApp Disparador, Servidores..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="desp-cat" className="text-xs font-semibold text-foreground">
                Categoria *
              </Label>
              <Select
                value={categoria}
                onValueChange={(val) => setCategoria(val as CategoriaDespesa)}
              >
                <SelectTrigger id="desp-cat" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnologia">🔌 Tecnologia & APIs</SelectItem>
                  <SelectItem value="marketing">📢 Marketing & Vendas</SelectItem>
                  <SelectItem value="equipe">👥 Equipe & Pessoal</SelectItem>
                  <SelectItem value="operacional">🏢 Custos Operacionais</SelectItem>
                  <SelectItem value="impostos">⚖️ Impostos & Taxas</SelectItem>
                  <SelectItem value="outros">📦 Outros Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desp-valor" className="text-xs font-semibold text-foreground">
                Valor (R$) *
              </Label>
              <Input
                id="desp-valor"
                placeholder="Ex: 250.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="text-xs h-9 bg-surface/50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="desp-data" className="text-xs font-semibold text-foreground">
                Data de Vencimento / Competência
              </Label>
              <Input
                id="desp-data"
                type="date"
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
                className="text-xs h-9 bg-surface/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desp-rec" className="text-xs font-semibold text-foreground">
                Recorrência
              </Label>
              <Select
                value={recorrencia}
                onValueChange={(val) => setRecorrencia(val as RecorrenciaTransacao)}
              >
                <SelectTrigger id="desp-rec" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontual">Pontual / Avulso</SelectItem>
                  <SelectItem value="mensal">Mensal (Recorrente)</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desp-status" className="text-xs font-semibold text-foreground">
              Situação do Pagamento
            </Label>
            <Select value={status} onValueChange={(val) => setStatus(val as StatusTransacao)}>
              <SelectTrigger id="desp-status" className="text-xs h-9 bg-surface/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">🟢 Pago / Liquidado</SelectItem>
                <SelectItem value="pendente">🟡 Pendente / A Pagar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={salvando}
              className="bg-pink-600 hover:bg-pink-500 text-white text-xs h-8 gap-1.5 font-semibold"
            >
              {salvando ? "Salvando..." : "Salvar Despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ModalNovaReceitaProps {
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  leadsDisponiveis: LeadItem[];
  onSalvar: (dados: Omit<TransacaoFinanceira, "id" | "tipo" | "criado_em">) => Promise<void>;
}

export function ModalNovaReceita({
  aberto,
  onOpenChange,
  leadsDisponiveis,
  onSalvar,
}: ModalNovaReceitaProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaReceita>("venda_site");
  const [valor, setValor] = useState("");
  const [leadSelecionadoId, setLeadSelecionadoId] = useState<string>("nenhum");
  const [leadNomeManual, setLeadNomeManual] = useState("");
  const [dataCompetencia, setDataCompetencia] = useState(new Date().toISOString().slice(0, 10));
  const [recorrencia, setRecorrencia] = useState<RecorrenciaTransacao>("pontual");
  const [status, setStatus] = useState<StatusTransacao>("pago");
  const [salvando, setSalvando] = useState(false);

  const handleLeadChange = (val: string) => {
    setLeadSelecionadoId(val);
    if (val !== "nenhum") {
      const alvo = leadsDisponiveis.find((l) => l.id === val);
      if (alvo) {
        setLeadNomeManual(alvo.nome);
        if (!titulo) {
          setTitulo(`Contrato de Site — ${alvo.nome}`);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseFloat(valor.replace(",", "."));
    if (isNaN(numValor) || numValor <= 0) {
      toast.error("Informe um valor válido em reais.");
      return;
    }
    if (!titulo.trim()) {
      toast.error("Informe o título da receita.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        valor: numValor,
        data_competencia: dataCompetencia,
        data_pagamento: status === "pago" ? dataCompetencia : null,
        recorrencia,
        status,
        lead_id: leadSelecionadoId !== "nenhum" ? leadSelecionadoId : null,
        lead_nome: leadNomeManual.trim() || null,
      });
      setTitulo("");
      setDescricao("");
      setValor("");
      setLeadSelecionadoId("nenhum");
      setLeadNomeManual("");
      onOpenChange(false);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-400" />
            Cadastrar Nova Receita / Fechamento
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registre contratos de sites, mensalidades de manutenção ou consultorias
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="rec-lead" className="text-xs font-semibold text-foreground">
              Vincular a Estabelecimento da Base (Opcional)
            </Label>
            <Select value={leadSelecionadoId} onValueChange={handleLeadChange}>
              <SelectTrigger id="rec-lead" className="text-xs h-9 bg-surface/50">
                <SelectValue placeholder="Selecione um lead (opcional)" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                <SelectItem value="nenhum">Nenhum (Receita Avulsa)</SelectItem>
                {leadsDisponiveis.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.nome} ({l.categoria || l.cidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rec-titulo" className="text-xs font-semibold text-foreground">
              Título da Receita / Serviço *
            </Label>
            <Input
              id="rec-titulo"
              placeholder="Ex: Criação de Site, Consultoria Google, Mensalidade..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="text-xs h-9 bg-surface/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rec-cat" className="text-xs font-semibold text-foreground">
                Categoria *
              </Label>
              <Select
                value={categoria}
                onValueChange={(val) => setCategoria(val as CategoriaReceita)}
              >
                <SelectTrigger id="rec-cat" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda_site">💻 Desenvolvimento de Site</SelectItem>
                  <SelectItem value="mensalidade">🔄 Mensalidade / Hospedagem</SelectItem>
                  <SelectItem value="consultoria">🔍 Consultoria Google Meu Negócio</SelectItem>
                  <SelectItem value="gestao_trafego">📢 Gestão de Tráfego / Anúncios</SelectItem>
                  <SelectItem value="outra_receita">💵 Outras Receitas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-valor" className="text-xs font-semibold text-foreground">
                Valor do Contrato (R$) *
              </Label>
              <Input
                id="rec-valor"
                placeholder="Ex: 2500.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="text-xs h-9 bg-surface/50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rec-data" className="text-xs font-semibold text-foreground">
                Data do Fechamento
              </Label>
              <Input
                id="rec-data"
                type="date"
                value={dataCompetencia}
                onChange={(e) => setDataCompetencia(e.target.value)}
                className="text-xs h-9 bg-surface/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-rec" className="text-xs font-semibold text-foreground">
                Recorrência
              </Label>
              <Select
                value={recorrencia}
                onValueChange={(val) => setRecorrencia(val as RecorrenciaTransacao)}
              >
                <SelectTrigger id="rec-rec" className="text-xs h-9 bg-surface/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pontual">Pontual / Projeto Único</SelectItem>
                  <SelectItem value="mensal">Mensalidade (MRR)</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rec-status" className="text-xs font-semibold text-foreground">
              Situação do Recebimento
            </Label>
            <Select value={status} onValueChange={(val) => setStatus(val as StatusTransacao)}>
              <SelectTrigger id="rec-status" className="text-xs h-9 bg-surface/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">🟢 Recebido / Liquidado</SelectItem>
                <SelectItem value="pendente">🟡 A Receber / Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={salvando}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1.5 font-semibold"
            >
              {salvando ? "Salvando..." : "Salvar Receita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
