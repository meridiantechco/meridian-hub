# 📋 Descrição do Pull Request — Meridian Hub

Por favor, inclua um resumo detalhado das alterações realizadas, a motivação técnica/negócio e os módulos afetados.

---

## 🎯 Tipo de Alteração

- [ ] 🚀 **Nova funcionalidade** (`feat`)
- [ ] 🐞 **Correção de bug** (`fix`)
- [ ] 🔧 **Refatoração / Arquitetura** (`refactor` — SRP, Clean Architecture, extração de hooks)
- [ ] 🎨 **Identidade Visual / UI / UX** (`style` — tokens de design, acessibilidade, ajustes visuais)
- [ ] 🗄️ **Banco de Dados / Supabase** (`db` — migrações SQL, políticas RLS, RPCs)
- [ ] 📝 **Documentação** (`docs` — atualizações em manuais ou guias)
- [ ] ⚙️ **Infraestrutura / Build** (`chore` — Vite, dependências, scripts, CI)

---

## 🏛️ Conformidade Arquitetural Feature-Based

- [ ] **Feature-Based**: O código novo reside no módulo correspondente (`src/features/<feature-name>`).
- [ ] **Rotas Finas (*Thin Controllers*)**: As rotas em `src/routes/` delegam a renderização para `<FeatureView />`.
- [ ] **SOLID & SRP**: Componentes, hooks e services possuem responsabilidade única bem definida.
- [ ] **Design System**: Respeita o padrão visual (Preto Profundo, Branco Cristalino e Roxo Neon).
- [ ] **Supabase & RLS**: Toda nova tabela/consulta respeita as diretrizes de Row Level Security.
- [ ] **TypeScript Estrito**: Tipagem 100% válida em `npx tsc --noEmit`.

---

## 🧪 Validações & Testes Executados

- [ ] **Ambiente Local**: Executado `npm run dev` e validado o funcionamento.
- [ ] **Type Check**: Executado `npx tsc --noEmit` com 0 erros.
- [ ] **Build de Produção**: Executado `npm run build` com sucesso.
- [ ] **Linter**: Executado `npm run lint` sem erros impeditivos.

---

## 📸 Evidências / Screenshots

_Insira capturas de tela demonstrando o resultado das alterações quando aplicável._

---

## 📌 Issues Relacionadas

Closes #
