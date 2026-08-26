# 🧭 Meridian Hub — Inteligência Comercial, Prospecção B2B & Gestão Financeira

> **Plataforma SaaS corporativa de alta performance desenvolvida pela Meridian Tech para prospecção ativa de empresas locais sem site próprio, abordagem multicanal integrada, CRM Kanban e controle integral de lucratividade real.**

---

## 📌 Visão Geral do Sistema

O **Meridian Hub** é a solução definitiva da **Meridian Tech** desenvolvida para agências digitais, consultorias e equipes de vendas B2B localizarem, qualificarem, abordarem e converterem estabelecimentos comerciais locais (*restaurantes, clínicas médicas/odontológicas, barbearias, petshops, escritórios de advocacia, oficinas mecânicas, academias, etc.*) que ainda **não possuem site próprio**.

Além de um motor de inteligência e varredura georreferenciada via **Google Places API** com **resolução 100% automática de perfis de Instagram**, o sistema conta com um **Módulo de Gestão Financeira** que permite auditar todos os custos da operação (APIs, infraestrutura, marketing, equipe, tributos) e apurar o **Lucro Líquido Real**, margem percentual e ROI em tempo real.

Tudo isso envelopado em uma identidade visual moderna baseada no Design System **Obsidian & Neon Purple (Preto Profundo, Branco Cristalino e Roxo Neon)**.

---

## 🏗️ Arquitetura Feature-Based

A base de código segue uma arquitetura modular orientada a funcionalidades (**Feature-Based Architecture**), garantindo separação de responsabilidades (SRP), alta coesão e baixo acoplamento:

```
src/
├── features/
│   ├── auth/                    # Autenticação, 1º Acesso e Recuperação de Senha
│   │   ├── components/          # AuthView, LoginForm, FirstAccessForm, RegisterForm, ForcePasswordForm
│   │   ├── hooks/               # useAuth
│   │   ├── types/               # AuthState, Credenciais, etc.
│   │   └── index.ts
│   │
│   ├── audit/                   # Auditoria & Histórico de Movimentações da Equipe
│   │   ├── services/            # auditService
│   │   ├── types/               # AtividadeUsuario, TipoAtividade
│   │   └── index.ts
│   │
│   ├── financial/               # Gestão Financeira & Apuração de Lucro Real
│   │   ├── components/          # FinancialView, FinancialKpis, FinancialCharts, TransactionsTable, TransactionModal
│   │   ├── hooks/               # useFinancial
│   │   ├── services/            # financialService
│   │   ├── types/               # TransacaoFinanceira, MetricasFinanceiras
│   │   └── index.ts
│   │
│   ├── dashboard/               # Painel Executivo Comercial Consolidado
│   │   ├── components/          # DashboardView, DashboardKpis, FinancialSummaryWidget, SegmentCharts, HotOpportunities
│   │   └── index.ts
│   │
│   ├── leads/                   # Base de Estabelecimentos & Enriquecimento de Dados
│   │   ├── components/          # LeadsView, LeadDetailsView, BadgePriority, BadgeStatus, WhatsAppModal
│   │   ├── hooks/               # useLeads
│   │   ├── services/            # leadsService
│   │   ├── utils/               # score, socialMedia, whatsapp
│   │   ├── types/               # LeadItem, BuscaItem, InteracaoItem
│   │   └── index.ts
│   │
│   ├── pipeline/                # Funil de Vendas Kanban Realtime
│   │   ├── components/          # PipelineView, PipelineColumn, PipelineCard
│   │   ├── hooks/               # usePipeline
│   │   ├── types/               # ColunaDef, COLUNAS_PIPELINE
│   │   └── index.ts
│   │
│   ├── prospecting/             # Scanner Geográfico Google Places & Histórico
│   │   ├── components/          # ProspectingView, ProspectingHistoryView, ProspectingForm, ProspectingResults
│   │   ├── hooks/               # useProspecting
│   │   ├── services/            # prospectingService
│   │   ├── types/               # LeadEncontrado, SUGESTOES_CATEGORIAS
│   │   └── index.ts
│   │
│   └── users/                   # Gestão de Equipe, Permissões & Produtividade
│       ├── components/          # UsersView, UserCreateModal, UserCredentialsModal, UserHistoryModal
│       ├── hooks/               # useUsers
│       ├── services/            # usersService
│       ├── types/               # UsuarioEquipe
│       └── index.ts
│
├── components/
│   ├── layout/                  # AppShell responsivo com busca global ⌘K
│   └── ui/                      # Componentes primitivos Radix UI / Tailwind
│
└── routes/                      # Thin Controllers (Rotas TanStack Router)
    ├── __root.tsx
    ├── auth.tsx
    ├── index.tsx
    └── _authenticated/
        ├── route.tsx
        ├── painel.tsx
        ├── nova-busca.tsx
        ├── buscas.tsx
        ├── leads.tsx
        ├── leads.$id.tsx
        ├── funil.tsx
        ├── financeiro.tsx
        └── usuarios.tsx
```

---

## 🚀 Principais Módulos & Funcionalidades

### 1. 🔍 Scanner de Estabelecimentos & Redes Sociais (`/nova-busca`)
- **Detecção Georreferenciada**: Varredura de estabelecimentos por nicho de mercado, cidade/bairro e raio delimitado em quilômetros.
- **Motor de Resolução Automática de Redes Sociais**: Mapeamento inteligente de perfis de Instagram (`@handle`) e Facebook a partir de agregadores de links e dados comerciais.
- **Filtro de Oportunidades**: Identificação instantânea de empresas sem site próprio vs. agregadores de redes sociais.
- **Modo de Contingência Contextual**: Fallback resiliente garantindo continuidade operacional mesmo em limites de cota da API.
- **Importação Granular**: Seleção em lote para envio direto à base e ao funil.

### 2. 💰 Gestão Financeira, Custos & Lucro Líquido (`/financeiro`)
- **Visão Executiva de Lucro Real**: Apuração automática do **Lucro Líquido** (`Receitas Totais - Gastos Totais`), margem percentual e ROI operacional.
- **Classificação de Despesas**: Custos categorizados em Tecnologia & APIs, Marketing & Vendas, Equipe & Pessoal, Custos Operacionais e Impostos & Taxas.
- **Gestão de Contratos**: Registro de serviços de criação de sites, planos MRR de manutenção, consultoria SEO local e tráfego pago.
- **Gráficos com Recharts**: Evolução do Fluxo de Caixa temporal e Gráfico Donut de composição percentual de despesas.
- **Exportação Contábil**: Download de relatório completo em CSV.

### 3. 🎯 Algoritmo de Score de Oportunidade Comercial (0 a 100)
Cada lead é classificado automaticamente:
- **Ausência de site próprio**: `+45 pontos`
- **Presença ativa em redes sociais**: `+15 pontos`
- **Volume de avaliações no Google**: Até `+20 pontos`
- **Nota média no Google Maps**: Até `+15 pontos`
- **Recência de detecção**: `+5 pontos`

*Classificação Visual:*
- 🟪 **Prioridade Alta** ($\ge 70$ pts)
- 🟨 **Prioridade Média** ($40 - 69$ pts)
- 🟦 **Prioridade Baixa** ($< 40$ pts)

### 4. 📊 Dashboard Executivo Comercial (`/painel`)
- KPIs consolidados, taxa de conversão em contratos e widget de lucro real.
- Gráficos analíticos de distribuição por segmento de mercado e saúde do funil de vendas.
- Lista de oportunidades mais quentes e feed de estabelecimentos recentes com botão de abordagem rápida por WhatsApp.

### 5. 🔄 Funil de Vendas Kanban Realtime (`/funil`)
- Pipeline em 5 estágios comerciais: `Novos` ➔ `Contatados` ➔ `Proposta Enviada` ➔ `Fechados (Ganhos)` ➔ `Recusados`.
- Arrasto e soltura (Drag & Drop) com sincronização em tempo real via **Supabase Realtime**.
- Lançamento automático de receita no financeiro ao mover para *Fechados*.

### 6. 👥 Gestão de Equipe, Auditoria & Produtividade (`/usuarios`)
- Controle de membros com papéis de **Administrador** e **Vendedor / SDR**.
- Geração de credenciais provisórias para convite e fluxo de primeiro acesso obrigatório.
- Linha do tempo completa de auditoria de movimentações e análise individual de conversão por vendedor.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias Utilizadas |
| :--- | :--- |
| **Framework & SSR** | React 19 + TanStack Start + TanStack Router |
| **Linguagem** | TypeScript (Strict Mode com `exactOptionalPropertyTypes: true`) |
| **Estilização & UI** | Tailwind CSS v4 + Radix UI + Lucide Icons + `tailwind-merge` + `cva` |
| **Gerenciamento de Estado** | TanStack Query (React Query) |
| **Gráficos & Visualização** | Recharts + D3 |
| **Backend & Banco de Dados**| Supabase (PostgreSQL, Auth PKCE, Realtime, Edge Functions, RLS) |
| **APIs Externas** | Google Places API (New Text Search) |

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com/RayanSantsz/prospector-hub.git
cd prospector-hub
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` ou `.env.local` na raiz:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-anonima
VITE_GOOGLE_PLACES_API_KEY=sua-chave-do-google-places
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:3000`.

---

## 🧪 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento com hot-reload.
- `npm run build`: Compila e gera o bundle de produção otimizado.
- `npm run preview`: Executa o preview local do build de produção.
- `npx tsc --noEmit`: Executa a checagem estrita de tipos do TypeScript.
- `npm run lint`: Executa a análise estática de código via ESLint.

---

## 📚 Governança & Documentação

- [🛡️ Política de Segurança (SECURITY.md)](./SECURITY.md)
- [🤝 Guia de Contribuição (CONTRIBUTING.md)](./CONTRIBUTING.md)
- [📜 Changelog Semântico (CHANGELOG.md)](./CHANGELOG.md)
- [🤝 Código de Conduta (CODE_OF_CONDUCT.md)](./CODE_OF_CONDUCT.md)
- [🏛️ Diretrizes de Arquitetura & Governança (.gemini/)](./.gemini/README.md)

---

## 🏢 Meridian Tech

O **Meridian Hub** é um produto proprietário desenvolvido pela **Meridian Tech**.  
Todos os direitos reservados © 2026.
