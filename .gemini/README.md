# 🧭 Diretrizes & Governança do Repositório — Meridian Hub (Meridian Tech)

> **LEITURA OBRIGATÓRIA ANTES DE QUALQUER IMPLEMENTAÇÃO**  
> Todo desenvolvedor (humano ou agente autônomo de IA) deve ler e seguir rigorosamente as diretrizes contidas nesta pasta (`.gemini/`) antes de propor, criar ou alterar qualquer arquivo neste projeto.

---

## 📌 Visão Geral & Propósito

O **Meridian Hub** é uma plataforma SaaS de alta performance para prospecção ativa de empresas locais, abordagem multicanal, CRM Kanban, controle integral de custos e apuração de lucro líquido real da **Meridian Tech**. O projeto prima por:

- **Alta manutenibilidade e escalabilidade** via arquitetura modular baseada em funcionalidades (**Feature-Based Architecture**).
- **Código desacoplado e testável**, seguindo princípios de **Clean Architecture**, **SOLID** e **Single Responsibility Principle (SRP)**.
- **Identidade visual moderna**, de alta densidade de informação, baseada em **Preto Profundo, Branco Cristalino e Roxo Neon**.
- **Segurança robusta**, com tipagem estrita (`TypeScript`), proteção em tempo de execução e controle de acesso granular (`Supabase RLS`).

---

## 📚 Mapa da Documentação da Governança

Esta pasta contém 5 pilares fundamentais de documentação:

| Documento | Descrição | Quando Consultar |
| :--- | :--- | :--- |
| [`architecture-guidelines.md`](./architecture-guidelines.md) | **Arquitetura & Design Patterns**<br>Estrutura Feature-Based, Clean Architecture, SOLID, SRP, fluxo de dados e separação de camadas. | Antes de criar novos módulos, rotas, serviços ou refatorar componentes. |
| [`database-guidelines.md`](./database-guidelines.md) | **Banco de Dados & Modelagem Supabase**<br>Padrões obrigatórios de nomenclatura em PT-BR para tabelas/colunas, RLS, triggers e RPCs. | Antes de criar, alterar ou migrar tabelas, colunas e regras de banco. |
| [`visual-identity.md`](./visual-identity.md) | **Identidade Visual & Design System**<br>Paleta de cores (Preto, Branco, Roxo Neon), tipografia, espaçamento e componentes. | Ao criar ou estilizar telas, layouts, cards, botões ou componentes visuais. |
| [`code-standards.md`](./code-standards.md) | **Padrões de Código & Boas Práticas**<br>Clean Code, tipagem estrita com TypeScript, custom hooks, tratamento de erros e segurança. | Durante a escrita de código diária, revisões de PRs e refatorações. |
| [`workflow-governance.md`](./workflow-governance.md) | **Governança & Fluxo Contínuo**<br>Git flow, conventional commits, checklist de PRs, testes e regras de desenvolvimento contínuo. | Antes de abrir branch, realizar commits e submeter Pull Requests. |

---

## ⚡ Regras de Ouro (Core Principles)

1. **Feature-Based First**: Código específico de uma funcionalidade reside exclusivamente na sua pasta de feature (`src/features/<feature-name>`). As rotas em `src/routes/` devem ser estritamente *Thin Controllers*.
2. **Single Responsibility Principle (SRP)**: Uma função, componente ou módulo deve ter uma única razão para mudar. Componentes visuais não lidam diretamente com requisições HTTP complexas; use hooks dedicados e serviços desacoplados.
3. **Nomenclatura de Banco em Português**: Toda tabela, coluna, enum e função de banco deve ser nomeada prioritariamente em Português do Brasil (`snake_case`), conforme [`database-guidelines.md`](./database-guidelines.md).
4. **Tipagem Estrita Obrigatória**: Nunca use `any`. Todo payload externo (API, formulários, localStorage) deve possuir interfaces e tipagens estritas.
5. **Consistência Visual**: Respeite os tokens do Design System definidos em [`visual-identity.md`](./visual-identity.md) e `src/styles.css`. Fundo preto profundo (`--background: #09090b`), texto branco e acentos em roxo neon (`--primary: #9333ea`).
6. **Segurança por Padrão**: Toda interação com banco de dados via Supabase deve respeitar e exigir políticas de Row Level Security (RLS). Nenhuma credencial ou chave sensível de backend deve ser exposta no client.

---

## 🛠️ Stack Tecnológica

- **Framework Frontend & SSR**: React 19 + TanStack Start / TanStack Router
- **Linguagem**: TypeScript (Strict Mode com `exactOptionalPropertyTypes: true`)
- **Estilização**: Tailwind CSS v4 + Radix UI + Lucide Icons + Class Variance Authority (`cva`)
- **Gerenciamento de Estado do Servidor**: TanStack Query (React Query)
- **Visualização de Dados**: Recharts
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)

---

*Governança mantida pelo time de engenharia e arquitetura da Meridian Tech.*
