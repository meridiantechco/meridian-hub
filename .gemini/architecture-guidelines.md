# Diretrizes de Arquitetura & Design Patterns — Meridian Hub

## 1. Visão Geral da Arquitetura Feature-Based

O **Meridian Hub** adota a arquitetura orientada a funcionalidades (**Feature-Based Architecture**), combinada com princípios de **Clean Architecture** e **SOLID (especialmente SRP - Single Responsibility Principle)**.

```
src/
├── features/
│   ├── auth/                    # Autenticação, 1º Acesso e Recuperação
│   ├── audit/                   # Auditoria & Histórico de Movimentações
│   ├── financial/               # Gestão Financeira & Lucratividade Real
│   ├── dashboard/               # Painel Comercial Consolidado
│   ├── leads/                   # Base de Estabelecimentos & Enriquecimento
│   ├── pipeline/                # Funil de Vendas Kanban Realtime
│   ├── prospecting/             # Detecção Geográfica & Mineração
│   └── users/                   # Gestão de Equipe, Permissões & Produtividade
│
├── components/
│   ├── layout/                  # AppShell e componentes estruturais globais
│   └── ui/                      # Componentes primitivos de UI
│
└── routes/                      # Thin Controllers (Rotas TanStack Router)
```

---

## 2. Anatomia de uma Feature

Cada feature em `src/features/<nome>/` possui estrutura padronizada:

| Subpasta / Arquivo | Responsabilidade |
| :--- | :--- |
| `components/` | Componentes visuais React específicos da funcionalidade. |
| `hooks/` | Custom hooks encapsulando estado, efeitos e integrações. |
| `services/` | Comunicação com Supabase, Edge Functions e APIs externas. |
| `utils/` | Algoritmos, parsers, formatadores e regras de negócio puras. |
| `types/` | Interfaces, types e DTOs estritos do TypeScript. |
| `index.ts` | Barrel export público com o contrato exposto pelo módulo. |

---

## 3. Regras para Rotas (*Thin Controllers*)

As rotas em `src/routes/_authenticated/` devem ter no máximo 20 a 30 linhas:
1. Exportar `Route = createFileRoute(...)`.
2. Declarar `head` com metadados e título institucional.
3. Declarar `component` apontando diretamente para a `<FeatureView />` exportada de `src/features/<dominio>`.

Nenhuma rota deve conter estados locais extensos, lógica de cálculo ou requisições assíncronas embutidas.

---

## 4. Comunicação e Desacoplamento

1. **Features Independentes**: Uma feature não deve acessar arquivos internos privados de outra feature diretamente. Use o `index.ts` público da feature desejada (ex: `import { leadsService } from "@/features/leads"`).
2. **Componentes Globais Reutilizáveis**: Componentes compartilhados por 2 ou mais features sem domínio específico residem em `src/components/layout/` ou `src/components/ui/`.
3. **Persistência Híbrida**: Todo serviço deve implementar comunicação primária com Supabase e suporte resiliente para storage local quando aplicável.

---

*Meridian Tech — Arquitetura de Software e Engenharia.*
