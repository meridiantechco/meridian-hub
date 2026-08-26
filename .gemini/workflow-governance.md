# Governança & Fluxo de Desenvolvimento — Meridian Hub

## 1. Ciclo de Vida de Demandas

Toda demanda de desenvolvimento no **Meridian Hub** passa pelas seguintes fases:

```
Planejamento / Refinamento
        ↓
Criação da Branch (feat/ | fix/ | refactor/)
        ↓
Implementação Feature-Based em src/features/
        ↓
Validação de Tipos (npx tsc --noEmit)
        ↓
Build de Produção (npm run build)
        ↓
Abertura de Pull Request com Template Padronizado
        ↓
Code Review & Merge na branch principal
```

---

## 2. Padrão de Commits

Seguimos a especificação do **Conventional Commits**:

- `feat(<escopo>)`: Nova funcionalidade para o usuário.
- `fix(<escopo>)`: Correção de bug ou falha de comportamento.
- `refactor(<escopo>)`: Alteração de código que não adiciona recurso nem corrige bug (ex: reestruturação de pastas, extração de hooks).
- `docs(<escopo>)`: Atualizações de documentação, manuais ou comentários.
- `style(<escopo>)`: Alterações de formatação visual, Tailwind ou tokens de cor.
- `chore(<escopo>)`: Atualização de dependências, scripts do package.json ou configurações de build.

*Exemplo*: `feat(financial): implementar calculo de margem liquida percentual`

---

## 3. Checklist Obrigatório de Pré-Merge

Antes de qualquer merge na branch `main`:

1. Executar `npx tsc --noEmit` e obter código de saída 0 (zero erros).
2. Executar `npm run build` e validar a geração do bundle Nitro / SSR.
3. Verificar a ausência de segredos ou chaves sensíveis comitadas.
4. Garantir que as rotas em `src/routes/` atuam apenas como thin controllers.

---

*Meridian Tech — Governança e Processos de Engenharia.*
