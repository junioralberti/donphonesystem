<<<<<<< HEAD
import { supabase } from '@/lib/supabase';
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
  // where, // No longer filtering by userId
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
import type { Provider } from '@/lib/schemas/provider';

const TABLE_NAME = 'providers';

export const addProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ ...providerData }])
    .select()
    .single();

<<<<<<< HEAD
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
=======
export const addProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // const user = auth.currentUser;
  // if (!user) throw new Error("Usuário não autenticado.");

  const docRef = await addDoc(collection(db, PROVIDERS_COLLECTION), {
    ...providerData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getProviders = async (): Promise<Provider[]> => {
  // const user = auth.currentUser;
  // if (!user) return [];

  const q = query(
    collection(db, PROVIDERS_COLLECTION),
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(providerFromDoc);
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
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
