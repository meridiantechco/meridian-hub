# Changelog — Meridian Hub

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.0.0] — 2026-08-26

### 🚀 Grandes Mudanças & Refatoração Arquitetural
- **Reestruturação Feature-Based Completa**: Reorganização estrutural de 100% da base de código em módulos isolados por domínio de negócio dentro de `src/features/`:
  - `src/features/auth/`: Módulo de autenticação, recuperação de senha e primeiro acesso obrigatório.
  - `src/features/audit/`: Serviço unificado de auditoria, rastreabilidade de ações e métricas agregadas.
  - `src/features/financial/`: Gestão financeira, apuração de lucro líquido real, ROI, controle de MRR/ARR, gráficos temporais e modais de receitas/despesas.
  - `src/features/dashboard/`: Painel executivo comercial integrado com KPIs, widget de lucratividade, gráficos analíticos e oportunidades quentes.
  - `src/features/leads/`: Base de estabelecimentos comerciais, enriquecimento automático de redes sociais, algoritmo de score (0 a 100) e ficha de detalhes.
  - `src/features/pipeline/`: Funil de vendas visual Kanban com movimentação drag & drop e sincronização Supabase Realtime.
  - `src/features/prospecting/`: Scanner de mineração georreferenciada via Google Places API com resolução automática de perfis de Instagram e histórico de varreduras.
  - `src/features/users/`: Gestão de equipe de vendas, concessão de papéis administrativos, geração de credenciais provisórias e análise de produtividade individual por SDR.

- **Rotas Finas (*Thin Controllers*)**: Simplificação de todas as rotas em `src/routes/` para controladores enxutos que delegam a renderização para suas respectivas `<FeatureView />`.
- **Rebranding Completo para Meridian Hub (Meridian Tech)**:
  - Atualização de identidade visual, metadados, títulos de página e cabeçalhos em toda a aplicação.
  - Remoção total e definitiva de scripts, interceptadores de erros e bibliotecas residuais ligadas à marca legada Lovable.

### 🛡️ Governança & Qualidade
- Criação dos documentos de governança: `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md` e `CODE_OF_CONDUCT.md`.
- Configuração de pipeline CI no GitHub Actions (`.github/workflows/ci.yml`) para validação automatizada de tipagem TypeScript e build de produção.
- `0` erros de tipagem estrita no TypeScript com `exactOptionalPropertyTypes: true`.

---

## [1.2.0] — 2026-08-15

### Adicionado
- **Módulo Financeiro & Lucratividade**: Criação da gestão de despesas operacionais (APIs, infraestrutura, marketing, equipe, tributos) e apuração de lucro real.
- **Gráficos Recharts**: Visualização de fluxo de caixa e composição percentual de gastos em gráfico Donut.
- **Gestão de Equipe & Auditoria**: Painel de membros com registro de movimentações e controle de permissões.

---

## [1.1.0] — 2026-08-01

### Adicionado
- **Integração Google Places API**: Varredura inteligente de estabelecimentos comerciais por raio e categoria.
- **Resolução Automática de Instagram**: Detecção de perfis comerciais a partir de URLs de bio aggregators e sanitização inteligente.
- **Funil de Vendas Kanban**: Estrutura visual com 5 estágios comerciais e integração via Supabase.

---

## [1.0.0] — 2026-07-15

### Adicionado
- Lançamento inicial da plataforma de inteligência de vendas e detecção de estabelecimentos comerciais sem site próprio.
- Autenticação e isolamento com Supabase Auth e PostgreSQL RLS.
- Interface escura com Tailwind CSS e Design System Obsidian & Purple Neon.
