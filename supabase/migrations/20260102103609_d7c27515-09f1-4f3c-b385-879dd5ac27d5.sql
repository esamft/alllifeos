
-- Add category_group column to categories table
ALTER TABLE public.categories 
ADD COLUMN category_group text CHECK (category_group IN ('essenciais', 'estilo_de_vida'));

-- Create budget_config table for storing budget parameters
CREATE TABLE public.budget_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  base_income numeric NOT NULL DEFAULT 29000,
  investment_percentage numeric NOT NULL DEFAULT 40,
  essentials_percentage numeric NOT NULL DEFAULT 40,
  lifestyle_percentage numeric NOT NULL DEFAULT 20,
  free_spending_amount numeric NOT NULL DEFAULT 3725,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on budget_config
ALTER TABLE public.budget_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budget_config
CREATE POLICY "Users can view their own budget config"
ON public.budget_config
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget config"
ON public.budget_config
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget config"
ON public.budget_config
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget config"
ON public.budget_config
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_budget_config_updated_at
BEFORE UPDATE ON public.budget_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
