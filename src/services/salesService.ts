import { supabase } from '@/lib/supabase';

export type PaymentMethod = "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "PIX";

export interface CartItemInput {
  name: string;
  quantity: number;
  price: number;
}

export interface SaleInput {
  clientName: string | null;
  items: CartItemInput[];
  paymentMethod: PaymentMethod | null;
  totalAmount: number;
}

export interface Sale extends SaleInput {
  id: string;
  createdAt: Date;
}

const SALES_TABLE = 'sales';

export const addSale = async (saleData: SaleInput): Promise<string> => {
  const { data, error } = await supabase
    .from(SALES_TABLE)
    .insert({
      ...saleData,
      createdAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao adicionar venda:', error);
    throw new Error('Erro ao adicionar venda');
  }

  return data.id;
};

export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from(SALES_TABLE)
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Erro ao buscar vendas:', error);
    throw new Error('Erro ao buscar vendas');
  }

  return data.map((sale: any) => ({
    ...sale,
    createdAt: sale.createdAt ? new Date(sale.createdAt) : new Date(),
  }));
};
