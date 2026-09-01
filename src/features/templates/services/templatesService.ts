import type { TemplateMensagem, CategoriaTemplate } from "../types";

const STORAGE_KEY = "meridian_templates_mensagens_v1";

export const templatesService = {
  async listarTemplates(): Promise<TemplateMensagem[]> {
    if (typeof window === "undefined") return [];

    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        return JSON.parse(salvo) as TemplateMensagem[];
      } catch {
        // fallback
      }
    }

    const iniciais: TemplateMensagem[] = [
      {
        id: "tpl-1",
        titulo: "Primeiro Contato — Oportunidade de Captação Web",
        categoria: "primeiro_contato",
        canal: "whatsapp",
        texto:
          "Olá, {nome}! Tudo bem? Me chamo {responsavel}. Estive acompanhando o excelente trabalho do {empresa} no segmento de {segmento} e notei que vocês ainda não possuem um portal web próprio para captação direta de clientes e agendamentos. Desenvolvemos uma demonstração visual focada no seu público. Teria 5 minutos para ver como ficou?",
        variaveisSuportadas: ["{nome}", "{empresa}", "{segmento}", "{responsavel}"],
      },
      {
        id: "tpl-2",
        titulo: "Follow-up de Proposta Comercial",
        categoria: "follow_up",
        canal: "whatsapp",
        texto:
          "Olá, {nome}! Como estão as coisas no {empresa}? Passando para saber se você conseguiu dar uma olhada na proposta de desenvolvimento que te enviei. Ficou alguma dúvida técnica ou sobre os prazos de entrega?",
        variaveisSuportadas: ["{nome}", "{empresa}"],
      },
      {
        id: "tpl-3",
        titulo: "Pós-Reunião — Resumo & Próximos Passos",
        categoria: "pos_reuniao",
        canal: "whatsapp",
        texto:
          "Olá, {nome}! Foi ótimo conversar com você hoje sobre o novo projeto do {empresa}. Conforme alinhamos, já estruturei a minuta com os pontos prioritários de design e captação para o seu nicho. Segue o link para validação final:",
        variaveisSuportadas: ["{nome}", "{empresa}"],
      },
      {
        id: "tpl-4",
        titulo: "Reativação de Conta em Espera",
        categoria: "reativacao",
        canal: "whatsapp",
        texto:
          "Olá, {nome}! Tudo bem? Há alguns meses conversamos sobre a modernização digital do {empresa}. Lançamos recentemente novos recursos de agendamento automático e SEO local para {segmento}. Gostaria de ver as novidades?",
        variaveisSuportadas: ["{nome}", "{empresa}", "{segmento}"],
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciais));
    return iniciais;
  },

  interpolar(texto: string, dados: { nome?: string; empresa?: string; segmento?: string; responsavel?: string }): string {
    return texto
      .replace(/{nome}/g, dados.nome || "Decisor")
      .replace(/{empresa}/g, dados.empresa || "sua empresa")
      .replace(/{segmento}/g, dados.segmento || "comércio local")
      .replace(/{responsavel}/g, dados.responsavel || "da equipe comercial");
  },

  async salvarTemplate(tpl: Omit<TemplateMensagem, "id" | "variaveisSuportadas">): Promise<TemplateMensagem> {
    const lista = await this.listarTemplates();
    const novo: TemplateMensagem = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      variaveisSuportadas: ["{nome}", "{empresa}", "{segmento}", "{responsavel}"],
    };
    const atualizada = [novo, ...lista];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizada));
    return novo;
  },

  async atualizarTemplate(id: string, campos: Partial<TemplateMensagem>): Promise<TemplateMensagem | null> {
    const lista = await this.listarTemplates();
    const idx = lista.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    lista[idx] = { ...lista[idx], ...campos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return lista[idx];
  },

  async excluirTemplate(id: string): Promise<boolean> {
    const lista = await this.listarTemplates();
    const filtrada = lista.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrada));
    return true;
  },
};
