export interface MensagemWhatsAppParams {
  telefone: string;
  nomeEmpresa: string;
  categoria?: string | null;
  cidadeOuBairro?: string | null;
  nomeVendedor?: string | null;
}

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
    ? `Meu nome é ${params.nomeVendedor}, sou especialista em presença digital.`
    : "Sou especialista em presença digital.";

  const segmento = params.categoria ? ` da área de ${params.categoria.toLowerCase()}` : "";
  const local = params.cidadeOuBairro ? ` em ${params.cidadeOuBairro}` : "";

  return `${saudacao} Tudo bem? Encontrei o perfil de ${params.nomeEmpresa}${segmento}${local} no Google e reparei que vocês ainda não possuem um site próprio ou página institucional oficial para converter quem pesquisa pelo negócio.

Criamos páginas modernas, rápidas e que posicionam no Google para atrair mais clientes diretamente para o WhatsApp de vocês.

Posso te enviar um modelo rápido de como ficaria o site da ${params.nomeEmpresa}?`;
}

export function gerarLinkWhatsApp(
  params: MensagemWhatsAppParams,
  mensagemCustomizada?: string,
): string {
  const telLimpo = limparTelefone(params.telefone);
  const texto = mensagemCustomizada ?? gerarMensagemPadrao(params);
  return `https://wa.me/${telLimpo}?text=${encodeURIComponent(texto)}`;
}
