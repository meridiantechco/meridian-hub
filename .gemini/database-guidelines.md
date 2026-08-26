# 🗄️ Diretrizes de Banco de Dados & Modelagem PostgreSQL — Meridian Hub

> **LEITURA OBRIGATÓRIA PARA CRIAÇÃO E MANUTENÇÃO DE TABELAS NO SUPABASE**  
> Todo desenvolvedor e agente deve seguir estritamente este guia ao criar tabelas, colunas, enums, funções RPC e políticas RLS no banco de dados da aplicação.

---

## 1. Regra de Ouro: Nomenclatura Prioritariamente em Português (PT-BR)

Todas as tabelas, colunas, enums, constraints, índices e funções de banco de dados devem adotar **prioritariamente o Português do Brasil**, utilizando a convenção `snake_case`.

| Elemento | Padrão / Convenção | Exemplos Corretos | Exemplos Proibidos ❌ |
| :--- | :--- | :--- | :--- |
| **Tabelas** | `snake_case`, substantivo claro (geralmente plural) | `leads`, `buscas`, `interacoes`, `transacoes_financeiras`, `auditoria_atividades`, `perfis` | `financial_transactions`, `activity_logs`, `search_history` |
| **Colunas** | `snake_case`, termos em português | `nome`, `categoria`, `endereco`, `bairro`, `cidade`, `estado`, `valor`, `data_competencia` | `first_name`, `address_line`, `due_date`, `amount` |
| **Timestamps** | `criado_em` e `atualizado_em` | `criado_em TIMESTAMPTZ`, `atualizado_em TIMESTAMPTZ` | `created_at`, `updated_at` |
| **Chaves Estrangeiras** | `<entidade_singular>_id` | `lead_id`, `usuario_id`, `responsavel_id` | `fk_lead`, `user_uuid`, `owner_id` |
| **Booleans** | `tem_<atributo>`, `eh_<atributo>` ou adjetivo direto | `tem_site`, `ativo`, `primeiro_acesso_pendente` | `has_website`, `is_active` |
| **Enums** | Nome em `snake_case` com valores em português | `lead_status ('novo', 'contatado', 'fechado')`, `tipo_transacao ('receita', 'despesa')` | `lead_status ('new', 'contacted', 'closed')` |

> [!NOTE]
> As únicas exceções permitidas para nomes em inglês são estruturas nativas do ecossistema Supabase/PostgreSQL (ex: schema `auth.users`, tipos PostGIS como `DOUBLE PRECISION`, `UUID`, `JSONB`).

---

## 2. Estrutura Padrão Obrigatória de Tabelas

Toda tabela criada deve possuir a seguinte estrutura básica padronizada:

```sql
CREATE TABLE public.minha_tabela (
  -- Identificador UUID primário gerado automaticamente
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Colunas de negócio em português
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,

  -- Chaves estrangeiras padronizadas
  usuario_id UUID REFERENCES auth.users ON DELETE SET NULL,

  -- Timestamps com fuso horário
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permissões base
GRANT SELECT, INSERT, UPDATE, DELETE ON public.minha_tabela TO authenticated;
GRANT ALL ON public.minha_tabela TO service_role;

-- Habilitação obrigatória de RLS
ALTER TABLE public.minha_tabela ENABLE ROW LEVEL SECURITY;

-- Trigger automático para manter atualizado_em
DROP TRIGGER IF EXISTS minha_tabela_updated_at ON public.minha_tabela;
CREATE TRIGGER minha_tabela_updated_at BEFORE UPDATE ON public.minha_tabela
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 3. Segurança & Políticas de Row Level Security (RLS)

O Row Level Security (**RLS**) é **obrigatório** em todas as tabelas. Nenhuma tabela em `public` deve existir sem RLS ativado.

### Hierarquia de Papéis:
- **`admin`**: Acesso completo de leitura, inserção, edição e exclusão.
- **`vendedor`**: Acesso restrito aos próprios registros (`usuario_id = auth.uid()`) ou registros sem responsável atribuído (`responsavel_id IS NULL`).

### Padrão de Políticas:
```sql
-- Leitura
DROP POLICY IF EXISTS "minha_tabela_select" ON public.minha_tabela;
CREATE POLICY "minha_tabela_select" ON public.minha_tabela FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid());

-- Inserção
DROP POLICY IF EXISTS "minha_tabela_insert" ON public.minha_tabela;
CREATE POLICY "minha_tabela_insert" ON public.minha_tabela FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid());

-- Atualização
DROP POLICY IF EXISTS "minha_tabela_update" ON public.minha_tabela;
CREATE POLICY "minha_tabela_update" ON public.minha_tabela FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR usuario_id = auth.uid());

-- Exclusão (geralmente restrita a admin)
DROP POLICY IF EXISTS "minha_tabela_delete" ON public.minha_tabela;
CREATE POLICY "minha_tabela_delete" ON public.minha_tabela FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

---

## 4. Triggers e Funções RPC

1. **Nomes de Funções**: Em português, descritivos da ação (ex: `calcular_score_lead`, `buscar_leads_bounds`, `handle_new_user`).
2. **Segurança em Funções**: Declarar explicitamente `SECURITY DEFINER` e fixar o `search_path`:
   ```sql
   CREATE OR REPLACE FUNCTION public.minha_funcao()
   RETURNS TRIGGER
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   BEGIN
     -- Lógica
     RETURN NEW;
   END;
   $$;
   ```

---

## 5. Sincronização TypeScript Obrigatória

Após qualquer criação ou alteração de tabela/coluna no banco:

1. **Atualizar [`src/integrations/supabase/types.ts`](../src/integrations/supabase/types.ts)**:
   - Declarar os tipos estritos em `Database["public"]["Tables"]` com as seções `Row`, `Insert`, `Update` e `Relationships`.
   - Adicionar os enums em `Database["public"]["Enums"]` e `Constants`.
2. **Atualizar os tipos da Feature** em `src/features/<modulo>/types/index.ts` usando `Tables<"nome_da_tabela">`.
3. **Remover qualquer dado mockado**: Toda persistência deve ocorrer exclusivamente via Supabase client.

---

*Meridian Tech — Padrões de Banco de Dados & Engenharia de Dados.*
