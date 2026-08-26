# Política de Segurança — Meridian Hub (Meridian Tech)

A **Meridian Tech** leva a segurança e a privacidade das informações dos seus usuários, clientes e dados de prospecção com o mais alto nível de rigor e prioridade. Este documento define as políticas de suporte, relato responsável de vulnerabilidades e diretrizes de segurança aplicadas no **Meridian Hub**.

---

## 🛡️ Versões Suportadas

Apenas as versões mais recentes da branch principal (`main`) e tags estáveis ativas recebem atualizações de segurança e correções críticas:

| Versão | Suportada | Notas |
| :--- | :---: | :--- |
| `2.x.x` (Atual) | ✅ Sim | Versão estável baseada na arquitetura Feature-Based e React 19 / TanStack Start |
| `1.x.x` (Legada) | ❌ Não | Descontinuada; migração obrigatória para a v2 |

---

## 🚨 Relato de Vulnerabilidades e Incidentes

Se você identificar qualquer vulnerabilidade de segurança, potencial falha de autorização (RLS), vazamento de segredos de API ou falha crítica no **Meridian Hub**, **NÃO abra uma issue pública**. Siga o procedimento de divulgação responsável abaixo:

1. **Canal Seguro de Contato**:
   - Envie um e-mail com detalhes para: **`security@meridiantech.com.br`**
   - Assunto: `[Vulnerabilidade de Segurança] - Meridian Hub - <Resumo>`

2. **Informações Desejadas no Relato**:
   - Descrição detalhada do vetor de ataque ou falha encontrada.
   - Passos passo a passo reproduzíveis (PoC / Proof of Concept).
   - Componentes ou rotas afetadas (ex: endpoints Supabase, storage local, tokens de autenticação).
   - Impacto potencial estimado (confidencialidade, integridade, disponibilidade).

3. **Tempo de Resposta**:
   - **Confirmação de recebimento**: até 24 horas úteis.
   - **Avaliação e triagem inicial**: até 48 horas úteis.
   - **Correção e emissão de patch**: conforme a criticidade (CVSS score).

---

## 🔒 Boas Práticas e Diretrizes de Segurança do Código

No desenvolvimento do Meridian Hub, seguimos estritamente os seguintes padrões:

### 1. Gestão de Segredos & Variáveis de Ambiente
- **Jamais comitar chaves secretas ou Service Role Keys** no repositório.
- Apenas variáveis prefixadas com `VITE_` são expostas ao bundle client-side (ex: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- Chaves privilegiadas como `SUPABASE_SERVICE_ROLE_KEY` devem residir estritamente no ambiente do servidor / Supabase Edge Functions.

### 2. Row Level Security (RLS) no Banco de Dados
- Todas as tabelas do PostgreSQL no Supabase (`leads`, `buscas`, `interacoes`, `transacoes_financeiras`, `profiles`, `user_roles`) possuem políticas ativas de RLS.
- O isolamento entre usuários e validação de papéis de acesso (`admin` vs `vendedor`) é executado a nível de banco via `auth.uid()`.

### 3. Validação e Sanitização de Entradas
- Todas as entradas recebidas via formulários, queries ou parâmetros de URL passam por sanitização rigorosa contra Cross-Site Scripting (XSS) e injeções.
- Regexes de sanitização de redes sociais e telefones garantem integridade dos dados antes da persistência.

### 4. Proteção contra Fraude e Autenticação Robusta
- Suporte a primeiro acesso obrigatório com definição de senha pessoal definitiva.
- Verificação de sessão assíncrona com interceptação no roteamento (`_authenticated/route.tsx`).
- Sessões geridas com tokens JWT padrão PKCE via Supabase Auth.

---

*Última atualização: Agosto de 2026 — Meridian Tech Information Security Team.*
