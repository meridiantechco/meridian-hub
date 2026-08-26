# Padrões de Código & Boas Práticas — Meridian Hub

## 1. Clean Code & Princípios de Engenharia

1. **Single Responsibility Principle (SRP)**:
   - Componentes React devem ser pequenos e dedicados à renderização visual e interação direta.
   - Efeitos colaterais, sincronizações e cálculos pesados devem ser extraídos para Custom Hooks (`useLeads`, `useFinancial`, `usePipeline`, etc.).
   - Requisições HTTP e persistência devem residir exclusivamente na pasta `services/`.

2. **TypeScript Estrito**:
   - O projeto utiliza `"exactOptionalPropertyTypes": true`.
   - Propriedades opcionais que podem receber `undefined` explicitamente devem ser declaradas como `prop?: Tipo | undefined;`.
   - **Proibição absoluta de `any`**. Use generics, union types ou interfaces estritas.

3. **Nomenclatura e Clareza**:
   - Componentes: `PascalCase` (ex: `FinancialKpis.tsx`, `BadgePriority.tsx`).
   - Hooks: `camelCase` com prefixo `use` (ex: `useFinancial.ts`, `useProspecting.ts`).
   - Serviços: `camelCase` (ex: `leadsService.ts`, `financialService.ts`).
   - Idioma do domínio: Nomes técnicos claros e alinhados ao domínio da aplicação. Textos exibidos ao usuário final estritamente em **Português do Brasil**.

---

## 2. Padrões React 19 & Hooks

1. **Estado Local vs. Compartilhado**:
   - Prefira manter o estado o mais próximo possível de onde ele é consumido.
   - Utilize `useMemo` para listas filtradas ou ordenadas com múltiplos critérios.
   - Utilize `useCallback` para funções passadas a componentes filhos com renderização otimizada.

2. **Feedback ao Usuário**:
   - Todas as ações assíncronas devem exibir estados de carregamento (spinner `Loader2`) e botões desabilitados.
   - Todas as mutações com sucesso ou erro devem emitir notificações visuais via `sonner` (`toast.success`, `toast.error`, `toast.info`).

---

## 3. Integração com Supabase & Resiliência

1. **Tratamento de Erros e Contingência**:
   - Chamadas ao Supabase devem ser envolvidas em blocos `try/catch`.
   - Em caso de indisponibilidade momentânea ou falta de credenciais, os serviços devem operar em modo fallback (storage local compartilhado), garantindo que a aplicação nunca quebre em branco.

2. **Auditoria Obrigatória**:
   - Toda alteração crítica de status no funil, cadastro de membros, alteração de permissões ou mineração em lote deve invocar `auditoriaService.registrarAtividade(...)`.

---

*Meridian Tech — Padrões de Código e Qualidade.*
