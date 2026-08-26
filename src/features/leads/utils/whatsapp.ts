import type { MensagemWhatsAppParams } from "../types";

export function limparTelefone(telefone: string): string {
  const apenasNumeros = telefone.replace(/\D/g, "");
  if (apenasNumeros.startsWith("55")) {
    return apenasNumeros;
  }
  if (apenasNumeros.length >= 10 && apenasNumeros.length <= 11) {
    return `55${apenasNumeros}`;
  }
  return apenasNumeros;
}

export function gerarMensagemPadrao(params: MensagemWhatsAppParams): string {
  const saudacao = "Olá!";
  const apresentacao = params.nomeVendedor
    ? `Meu nome é ${params.nomeVendedor}, sou especialista em presença digital da Meridian Tech.`
    : "Sou especialista em presença digital da Meridian Tech.";

  const segmento = params.categoria ? ` da área de ${params.categoria.toLowerCase()}` : "";
  const local = params.cidadeOuBairro ? ` em ${params.cidadeOuBairro}` : "";
  const instaLimpo = params.instagram ? params.instagram.replace(/^@/, "").trim() : null;
  const mencaoInsta = instaLimpo
    ? ` Acompanhei o Instagram de vocês (@${instaLimpo}) e achei o trabalho muito bacana!`
    : "";

  return `${saudacao} Tudo bem? Encontrei o perfil de ${params.nomeEmpresa}${segmento}${local} no Google.${mencaoInsta}

Reparei que vocês ainda não possuem um site próprio ou página institucional oficial para quem pesquisa pelo negócio no Google ou no Instagram.

Criamos páginas modernas, rápidas e que posicionam no Google para atrair mais clientes diretamente para o WhatsApp de vocês.

Posso te enviar uma prévia rápida sem compromisso de como ficaria a página oficial da ${params.nomeEmpresa}?`;
}

export function gerarLinkWhatsApp(
  params: MensagemWhatsAppParams,
  mensagemCustomizada?: string,
): string {
  const telLimpo = limparTelefone(params.telefone);
  const texto = mensagemCustomizada ?? gerarMensagemPadrao(params);
  return `https://wa.me/${telLimpo}?text=${encodeURIComponent(texto)}`;
}
