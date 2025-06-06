import { supabase } from '@/lib/supabase';
import type { Provider } from '@/lib/schemas/provider';

const TABLE_NAME = 'providers';

export const addProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ ...providerData }])
    .select()
    .single();

  if (error) throw error;
  return data?.id ?? null;
};

export const getProviders = async (): Promise<Provider[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const updateProvider = async (id: string, providerData: Partial<Omit<Provider, 'id' | 'createdAt'>>): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ ...providerData })
    .eq('id', id);

  if (error) throw error;
};

export const deleteProvider = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
};
