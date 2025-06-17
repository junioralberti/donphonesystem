<<<<<<< HEAD
import { supabase } from '@/lib/supabase';
=======

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
import type { User, UserRole } from '@/lib/schemas/user';

const USERS_TABLE = 'users';

<<<<<<< HEAD
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
=======
// Tipo para dados que realmente serão salvos no Firestore (sem senhas).
type StorableUserData = Omit<User, 'id' | 'password' | 'confirmPassword' | 'createdAt' | 'updatedAt'>;

const userFromDoc = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData): User => {
  const data = docSnap.data ? docSnap.data() : docSnap; // Handle both snapshot and direct data
  return {
    id: docSnap.id,
    name: data.name || '',
    email: data.email || '',
    role: data.role || 'user',
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
  };
};

export const addUser = async (userData: User): Promise<string> => {
  if (!userData.email || !userData.password) {
    throw new Error('E-mail e senha são obrigatórios para criar um usuário no Firebase Auth.');
  }

  // 1. Criar usuário no Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
  const uid = userCredential.user.uid;

  // 2. Preparar dados para salvar no Firestore (sem senha)
  const storableData: StorableUserData & { createdAt: any; updatedAt: any } = {
    name: userData.name,
    email: userData.email,
    role: userData.role || 'user', // Default to 'user' if not provided
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // 3. Salvar dados do usuário no Firestore usando o UID do Auth como ID do documento
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(userDocRef, storableData);

  return uid; // Retorna o UID do usuário criado
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
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

export const getUserById = async (userId: string): Promise<User | null> => {
  if (!userId) return null;
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    // Pass docSnap (QueryDocumentSnapshot-like) instead of docSnap.data() to userFromDoc
    return userFromDoc(docSnap as QueryDocumentSnapshot<DocumentData>);
  }
  return null;
};

export const updateUser = async (id: string, userData: Partial<StorableUserData>): Promise<void> => {
<<<<<<< HEAD
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
=======
  const userRef = doc(db, USERS_COLLECTION, id);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, id);
  // Nota: Excluir um usuário aqui APENAS remove o registro do Firestore.
  // A exclusão do Firebase Authentication deve ser tratada separadamente se necessário.
  // Para este sistema, a conta Auth permanece, mas o usuário não terá 'role' e não poderá logar com sucesso na lógica atual.
  await deleteDoc(userRef);
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
};
