import { supabase } from '@/lib/supabase';
import type { Provider } from '@/lib/schemas/provider';

const PROVIDERS_TABLE = 'providers';

export const addProvider = async (
  providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const { data, error } = await supabase
    .from(PROVIDERS_TABLE)
    .insert([
      {
        ...providerData,
      },
    ])
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
};

export const getProviders = async (): Promise<Provider[]> => {
  const { data, error } = await supabase
    .from(PROVIDERS_TABLE)
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Provider[];
};

export const updateProvider = async (
  id: string,
  providerData: Partial<Omit<Provider, 'id' | 'createdAt'>>
): Promise<void> => {
  const { error } = await supabase
    .from(PROVIDERS_TABLE)
    .update({
      ...providerData,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const deleteProvider = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(PROVIDERS_TABLE)
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};
