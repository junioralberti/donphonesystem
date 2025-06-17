import { supabase } from '@/utils/supabaseClient'

<<<<<<< HEAD
=======
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  // where, // No longer filtering by userId here
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Client } from '@/lib/schemas/client';
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464

import type { Client } from '@/lib/schemas/client'

// Certifique-se de que o nome está EXATAMENTE igual ao da tabela no Supabase
const TABLE_NAME = 'clients' // ou 'clientes', se for esse o nome real da tabela

<<<<<<< HEAD
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
    .order('name', { ascending: true }) // Corrigido: usa 'name' se for o nome correto
=======
export const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // const user = auth.currentUser; // User context might still be needed if rules depend on isAuthenticated
  // if (!user) throw new Error("Usuário não autenticado."); // Keep if actions require auth

  const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
    ...clientData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getClients = async (): Promise<Client[]> => {
  // const user = auth.currentUser; // Not needed if not filtering by userId
  // if (!user) return []; 

  const q = query(
    collection(db, CLIENTS_COLLECTION),
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(clientFromDoc);
};
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464

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
