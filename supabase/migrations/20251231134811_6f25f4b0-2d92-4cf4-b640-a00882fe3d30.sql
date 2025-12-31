-- Habilita extensão para UUIDs
create extension if not exists "uuid-ossp";

-- 1. Tabela de Categorias (Tetos de Gastos)
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  budget_limit numeric(10,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Transações (Gastos)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric(10,2) not null,
  date date not null,
  category_id uuid references public.categories,
  transaction_type text check (transaction_type in ('pix', 'credit_card', 'debit_card')),
  installment_current int default 1,
  installment_total int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- Políticas de Acesso para Categories
create policy "Users can view their own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert their own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete their own categories" on public.categories for delete using (auth.uid() = user_id);

-- Políticas de Acesso para Transactions
create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own transactions" on public.transactions for delete using (auth.uid() = user_id);