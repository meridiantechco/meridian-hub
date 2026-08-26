# Identidade Visual & Design System — Meridian Hub

## 1. Conceito Visual

O **Meridian Hub** utiliza o tema **Obsidian & Neon Purple (Design System Preto, Branco e Roxo Neon)**, projetado para aplicações SaaS B2B de alto volume de informação, garantindo:

- Foco máximo em métricas, gráficos e dados comerciais.
- Alto contraste e excelente legibilidade em telas de alta resolução.
- Visual moderno, sofisticado e tecnológico.

---

## 2. Paleta de Cores e Tokens CSS

As variáveis fundamentais estão definidas em `src/styles.css`:

| Token | Cor Hex | Uso / Significado |
| :--- | :--- | :--- |
| `--background` | `#09090b` | Fundo principal da aplicação (Preto Profundo / Obsidian). |
| `--surface` | `#121215` | Fundo de painéis e tabelas. |
| `--card` | `#18181b` | Cards, modais e containers elevados. |
| `--primary` | `#9333ea` | Roxo Neon / Electric Purple (Ações principais, foco, KPIs). |
| `--primary-foreground`| `#ffffff` | Texto sobre botões primários. |
| `--foreground` | `#fafafa` | Tipografia principal (Branco Cristalino). |
| `--muted-foreground` | `#a1a1aa` | Textos secundários, legendas e rótulos. |
| `--border` | `#27272a` | Linhas de divisão e contornos de cards. |
| `--color-alerta` | `#f97316` | Laranja vibrante para oportunidades sem site. |
| `--color-sucesso` | `#10b981` | Verde esmeralda para fechamentos e receitas. |

---

## 3. Tipografia

- **Família Principal (Interface)**: `Geist Sans`, `Inter`, `-apple-system`, `sans-serif`.
- **Família de Dados e Códigos**: `JetBrains Mono`, `monospace` (utilizada em valores monetários, telefones e handles de Instagram).
- **Hierarquia de Títulos**:
  - H1 / Título da Página: `text-xl sm:text-2xl font-bold tracking-tight font-display text-foreground`
  - H2 / Seções de Cards: `text-base font-semibold text-foreground`
  - Rótulos / Labels: `text-xs font-semibold text-muted-foreground uppercase tracking-wider rotulo`
  - Dados / Números: `font-bold dado text-foreground`

---

## 4. Componentes e Densidade de Informação

- **Bordas e Elevação**: `border border-border/80 shadow-elev` com cantos arredondados (`rounded-xl` para containers e `rounded-lg` para botões).
- **Modos de Exibição**: Listagens comerciais e tabelas suportam alternância dinâmica entre **Tabela Compacta** e **Grade de Cards**.
- **Badges de Prioridade**:
  - 🟪 Alta: Fundo roxo translúcido com borda roxa brilhante.
  - 🟨 Média: Fundo âmbar translúcido com borda âmbar.
  - 🟦 Baixa: Fundo azul translúcido com borda azul.

---

*Meridian Tech — Design System & Experiência do Usuário.*
