-- Tabela de Classes de Ativos (Buckets)
CREATE TABLE public.investment_buckets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  target_percentage numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Tabela de Ativos Individuais
CREATE TABLE public.assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id uuid REFERENCES public.investment_buckets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  ticker text NOT NULL,
  name text,
  quantity numeric(18,8) NOT NULL DEFAULT 0,
  target_percentage_in_bucket numeric(5,2) DEFAULT 0,
  is_manual boolean DEFAULT false,
  manual_price numeric(15,2),
  last_price_fetch numeric(15,2),
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.investment_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Políticas para investment_buckets
CREATE POLICY "Users can view their own buckets"
ON public.investment_buckets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own buckets"
ON public.investment_buckets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buckets"
ON public.investment_buckets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buckets"
ON public.investment_buckets FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para assets
CREATE POLICY "Users can view their own assets"
ON public.assets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
ON public.assets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
ON public.assets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
ON public.assets FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at em assets
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();