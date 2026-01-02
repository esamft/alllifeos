// Orçamento 2026
// Regra 40/20/40

export const BUDGET_CONSTANTS = {
  BASE_INCOME: 29000,
  
  // Percentuais
  INVESTMENT_PERCENTAGE: 40,
  ESSENTIALS_PERCENTAGE: 40,
  LIFESTYLE_PERCENTAGE: 20,
  
  // Valores calculados
  INVESTMENT_TARGET: 11600, // 40% de 29.000
  ESSENTIALS_CAP: 11575,    // 40% ajustado
  LIFESTYLE_CAP: 5825,      // 20%
  
  // Gastos Livres
  FREE_SPENDING_MONTHLY: 3725,
  FREE_SPENDING_WEEKLY: 930, // ~3725/4
  
  // Semáforo do Cartão - limites
  CREDIT_CARD_GREEN_LIMIT: 5000,
  CREDIT_CARD_YELLOW_LIMIT: 6000,
  CREDIT_CARD_RED_LIMIT: 7100,
} as const;

export type CategoryGroup = 'essenciais' | 'estilo_de_vida';

export const CATEGORY_GROUP_LABELS: Record<CategoryGroup, string> = {
  essenciais: 'Essenciais',
  estilo_de_vida: 'Estilo de Vida',
};

// Categorias pré-definidas para seed
export const DEFAULT_CATEGORIES: Array<{
  name: string;
  category_group: CategoryGroup;
  budget_limit: number;
}> = [
  // Essenciais
  { name: 'Moradia', category_group: 'essenciais', budget_limit: 5000 },
  { name: 'Transporte', category_group: 'essenciais', budget_limit: 2000 },
  { name: 'Alimentação', category_group: 'essenciais', budget_limit: 2500 },
  { name: 'Saúde', category_group: 'essenciais', budget_limit: 1500 },
  { name: 'Medicamentos Temporários', category_group: 'essenciais', budget_limit: 575 },
  
  // Estilo de Vida
  { name: 'Esporte/Casal', category_group: 'estilo_de_vida', budget_limit: 600 },
  { name: 'Manutenção Equipamentos', category_group: 'estilo_de_vida', budget_limit: 300 },
  { name: 'Suplementos/Nutri', category_group: 'estilo_de_vida', budget_limit: 500 },
  { name: 'Assinaturas/IAs', category_group: 'estilo_de_vida', budget_limit: 400 },
  { name: 'Gastos Livres', category_group: 'estilo_de_vida', budget_limit: 3725 },
  { name: 'Lazer', category_group: 'estilo_de_vida', budget_limit: 300 },
];
