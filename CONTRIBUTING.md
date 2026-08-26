# Guia de Contribuição — Meridian Hub (Meridian Tech)

Obrigado pelo seu interesse em contribuir com o **Meridian Hub**! Este projeto segue padrões rigorosos de engenharia de software para garantir escalabilidade, estabilidade, manutenibilidade e alta qualidade de código.

---

## 🏗️ 1. Arquitetura Feature-Based

O código-fonte da aplicação reside em `src/` e segue estritamente a arquitetura **Feature-Based**:

```
src/
├── features/
│   ├── <nome-da-feature>/
│   │   ├── components/       # Componentes React específicos do domínio
│   │   ├── hooks/            # Custom hooks com estado e efeitos da feature
│   │   ├── services/         # Camada de comunicação com APIs e Supabase
│   │   ├── utils/            # Utilitários e helpers de domínio
│   │   ├── types/            # Tipos e interfaces TypeScript específicos
│   │   └── index.ts          # Barrel export público do módulo
│
├── components/               # Componentes compartilhados / UI Primitives
│   ├── layout/               # AppShell, navegação e barras de ferramentas
│   └── ui/                   # Primitivos base (Radix UI + Tailwind)
│
└── routes/                   # Thin Controllers (TanStack Router)
    └── ...                   # Apenas define metadados e renderiza <FeatureView />
```

### Regras de Ouro:
1. **Rotas Finas (*Thin Controllers*)**: Arquivos dentro de `src/routes/` NÃO devem conter lógica de negócio, chamadas diretas de banco de dados ou formulários complexos. Devem apenas invocar a View exportada de `src/features/<dominio>/`.
2. **Encapsulamento**: Cada feature deve expor publicamente apenas o que é necessário através do seu `index.ts`.
3. **Single Responsibility Principle (SRP)**: Separe responsabilidade de visualização (UI), estado (Hooks), lógica remota (Services) e estruturas (Types).

---

## 🛠️ 2. Configuração do Ambiente de Desenvolvimento

### Pré-requisitos
- **Node.js**: `v20.x` ou superior (recomendado `v22.x`)
- **NPM**: `v10.x` ou superior (ou `Bun` / `pnpm`)

### Instalação e Execução
```bash
# 1. Clone o repositório
git clone https://github.com/RayanSantsz/prospector-hub.git
cd prospector-hub

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local  # Ajuste com suas credenciais do Supabase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

---

## 📋 3. Fluxo de Trabalho Git (Git Workflow)

1. **Crie uma branch a partir da `main`**:
   - `feat/nome-da-feature` — Para novas funcionalidades
   - `fix/descricao-do-bug` — Para correção de bugs
   - `refactor/descricao` — Para refatorações arquiteturais
   - `docs/descricao` — Para atualizações de documentação

2. **Convenção de Commits (Conventional Commits)**:
   Os commits devem seguir o padrão padronizado:
   - `feat(leads): adicionar filtro por raio geográfico`
   - `fix(pipeline): corrigir drag and drop no mobile`
   - `refactor(financial): modularizar componentes de gráficos`
   - `docs(governance): atualizar guia de segurança e changelog`
   - `test(audit): adicionar cobertura para serviço de logging`

---

## 🧪 4. Validação e Qualidade de Código

Antes de abrir um Pull Request, certifique-se de executar e validar os seguintes comandos:

```bash
# 1. Checagem de tipos estrita do TypeScript (0 erros obrigatório)
npx tsc --noEmit

# 2. Linter de código
npm run lint

# 3. Build de produção do TanStack Start / Vite
npm run build
```

---

## 🚀 5. Checklist para Pull Requests (PR)

Ao abrir um PR, certifique-se de cumprir todos os itens abaixo:
- [ ] O código segue a estrutura **Feature-Based** em `src/features/<dominio>/`.
- [ ] O commit segue a convenção de **Conventional Commits**.
- [ ] A checagem de tipos (`npx tsc --noEmit`) passa sem nenhum erro ou warning ignorado.
- [ ] O build de produção (`npm run build`) gera o bundle com código de saída 0.
- [ ] Toda a documentação relacionada e comentários no código foram mantidos ou atualizados.
- [ ] Nenhuma credencial privada ou chave de API de desenvolvimento foi exposta.
- [ ] As respostas e textos voltados ao usuário final estão em **Português do Brasil**.

---

*Meridian Tech — Excelência em Engenharia e Inteligência de Vendas B2B.*
