import { supabase } from '@/lib/supabase';
import type { User, UserRole } from '@/lib/schemas/user';

const USERS_TABLE = 'users';

// Dados salvos (sem senha ou confirmação)
type StorableUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password' | 'confirmPassword'>;

const userFromRow = (row: any): User => ({
  id: row.id,
  name: row.name || '',
  email: row.email || '',
  role: row.role || 'user',
  createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
  updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
});

export const addUser = async (userData: StorableUserData): Promise<string> => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert([{ 
      ...userData, 
      createdAt: now,
      updatedAt: now,
    }])
    .select('id') // retorna apenas o ID
    .single();

  if (error) {
    console.error('Erro ao adicionar usuário:', error);
    throw new Error('Erro ao adicionar usuário');
  }

  return data.id;
};

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error('Erro ao buscar usuários');
  }

  return data.map(userFromRow);
};

export const updateUser = async (id: string, userData: Partial<StorableUserData>): Promise<void> => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from(USERS_TABLE)
    .update({
      ...userData,
      updatedAt: now,
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error('Erro ao atualizar usuário');
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(USERS_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar usuário:', error);
    throw new Error('Erro ao deletar usuário');
  }
};
