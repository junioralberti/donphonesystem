import supabase from '@/utils/supabaseClient'
import type { Client } from '@/lib/schemas/client'

const TABLE_NAME = 'clientes'

export const addClient = async (
  clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ ...clientData }])
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar cliente:', error)
    return null
  }

  return data?.id ?? null
}

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar clientes:', error)
    return []
  }

  return data as Client[]
}

export const updateClient = async (
  id: string,
  clientData: Partial<Omit<Client, 'id' | 'createdAt'>>
): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ ...clientData })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar cliente:', error)
    return false
  }

  return true
}

export const deleteClient = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar cliente:', error)
    return false
  }

  return true
}
