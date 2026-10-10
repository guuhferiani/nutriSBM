-- ============================================================
-- Banco de Dados: App Nutri SBM (Neon PostgreSQL)
-- Prompt 1 — Base do projeto + Neon completo
-- ============================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Função auxiliar de autenticação / identificação do Nutricionista
CREATE OR REPLACE FUNCTION public.current_nutricionista_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_claims text;
  v_sub text;
BEGIN
  -- 1. Try PostgREST JWT claims JSON
  v_claims := current_setting('request.jwt.claims', true);
  IF v_claims IS NOT NULL AND v_claims <> '' THEN
    BEGIN
      v_sub := (v_claims::jsonb ->> 'sub');
      IF v_sub IS NOT NULL AND v_sub <> '' THEN
        RETURN v_sub::uuid;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- 2. Try direct claim setting
  v_sub := current_setting('request.jwt.claim.sub', true);
  IF v_sub IS NOT NULL AND v_sub <> '' THEN
    RETURN v_sub::uuid;
  END IF;

  -- 3. Try app.current_user_id setting
  v_sub := current_setting('app.current_user_id', true);
  IF v_sub IS NOT NULL AND v_sub <> '' THEN
    RETURN v_sub::uuid;
  END IF;

  RETURN NULL;
END;
$$;

-- 3. Tabela nutricionistas
CREATE TABLE IF NOT EXISTS public.nutricionistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Tabela pacientes
CREATE TABLE IF NOT EXISTS public.pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutricionista_id uuid NOT NULL REFERENCES public.nutricionistas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  data_nascimento date,
  sexo text,
  whatsapp text,
  email text,
  peso_inicial numeric,
  altura numeric,
  objetivos text[],
  objetivo_texto text,
  nivel_atividade text,
  patologias text[],
  restricoes_alimentares text[],
  alergias text[],
  medicamentos text,
  suplementos text,
  refeicoes_por_dia integer,
  horario_acorda text,
  horario_dorme text,
  litros_agua numeric,
  atividade_fisica boolean,
  atividade_fisica_descricao text,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Tabela consultas
CREATE TABLE IF NOT EXISTS public.consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_consulta date NOT NULL,
  peso numeric,
  cintura numeric,
  quadril numeric,
  percentual_gordura numeric,
  observacoes text,
  proximo_retorno date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 6. Tabela planos_alimentares
CREATE TABLE IF NOT EXISTS public.planos_alimentares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  conteudo jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 7. Índices de performance para chaves estrangeiras
CREATE INDEX IF NOT EXISTS idx_pacientes_nutricionista_id ON public.pacientes(nutricionista_id);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente_id ON public.consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_planos_alimentares_paciente_id ON public.planos_alimentares(paciente_id);

-- 8. Ativação do Row Level Security (RLS)
ALTER TABLE public.nutricionistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_alimentares ENABLE ROW LEVEL SECURITY;

-- 9. Políticas de RLS para o perfil autenticado (Nutricionista)
DROP POLICY IF EXISTS nutricionistas_policy ON public.nutricionistas;
CREATE POLICY nutricionistas_policy ON public.nutricionistas
  FOR ALL
  TO authenticated
  USING (id = public.current_nutricionista_id())
  WITH CHECK (id = public.current_nutricionista_id());

DROP POLICY IF EXISTS pacientes_policy ON public.pacientes;
CREATE POLICY pacientes_policy ON public.pacientes
  FOR ALL
  TO authenticated
  USING (nutricionista_id = public.current_nutricionista_id())
  WITH CHECK (nutricionista_id = public.current_nutricionista_id());

DROP POLICY IF EXISTS consultas_policy ON public.consultas;
CREATE POLICY consultas_policy ON public.consultas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pacientes p
      WHERE p.id = consultas.paciente_id
        AND p.nutricionista_id = public.current_nutricionista_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pacientes p
      WHERE p.id = consultas.paciente_id
        AND p.nutricionista_id = public.current_nutricionista_id()
    )
  );

DROP POLICY IF EXISTS planos_alimentares_policy ON public.planos_alimentares;
CREATE POLICY planos_alimentares_policy ON public.planos_alimentares
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pacientes p
      WHERE p.id = planos_alimentares.paciente_id
        AND p.nutricionista_id = public.current_nutricionista_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pacientes p
      WHERE p.id = planos_alimentares.paciente_id
        AND p.nutricionista_id = public.current_nutricionista_id()
    )
  );

-- 10. Sincronização automática com neon_auth.user (Better Auth)
CREATE OR REPLACE FUNCTION public.handle_new_neon_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.nutricionistas (id, nome, email, created_at)
  VALUES (NEW.id, COALESCE(NEW.name, 'Nutricionista'), NEW.email, COALESCE(NEW."createdAt", now()))
  ON CONFLICT (id) DO UPDATE
  SET nome = EXCLUDED.nome, email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_neon_auth_user_created ON neon_auth.user;
CREATE TRIGGER on_neon_auth_user_created
  AFTER INSERT ON neon_auth.user
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_neon_user();

-- 11. Permissões de esquema para papéis da API
GRANT USAGE ON SCHEMA public TO authenticated, anonymous;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;
