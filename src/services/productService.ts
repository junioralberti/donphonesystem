import { supabase } from '@/utils/supabaseClient'
import type { Product } from '@/lib/schemas/product'

// Buscar todos os produtos
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }) // Corrigido: campo correto

  if (error) throw new Error(error.message)
  return data as Product[]
}

// Adicionar um novo produto
export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...product }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Atualizar um produto existente
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
) {
  const { error } = await supabase
    .from('products')
    .update({ ...updates })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// Excluir um produto
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
