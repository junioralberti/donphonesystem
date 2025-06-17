// src/services/salesService.ts

<<<<<<< HEAD
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
=======
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  getDocs,
  query,
  orderBy,
  where, // Keep for status/date filtering
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Sale, SaleInput, SaleStatus, PaymentMethod, CartItemInput } from '@/lib/schemas/sale';

export type { PaymentMethod, CartItemInput, SaleInput, Sale, SaleStatus };
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464

const TABLE = 'sales';

<<<<<<< HEAD
/**
 * Adiciona uma nova venda e retorna o ID
 */
export async function addSale(saleData: SaleInput): Promise<string> {
  const timestamp = new Date().toISOString(); // insere timestamp corretamente no Postgres :contentReference[oaicite:1]{index=1}
  :contentReference[oaicite:2]{index=2}
    .from(TABLE)
    :contentReference[oaicite:3]{index=3}
    .select('id')
    .single();

  if (error) {
    :contentReference[oaicite:4]{index=4}
    :contentReference[oaicite:5]{index=5}
  }

  :contentReference[oaicite:6]{index=6}
}

/**
 * :contentReference[oaicite:7]{index=7}
 */
:contentReference[oaicite:8]{index=8}
  :contentReference[oaicite:9]{index=9}
    .from(TABLE)
    .select('*')
    :contentReference[oaicite:10]{index=10}

  if (error) {
    :contentReference[oaicite:11]{index=11}
    :contentReference[oaicite:12]{index=12}
  }

  :contentReference[oaicite:13]{index=13}
    ...sale,
    :contentReference[oaicite:14]{index=14}
  }));
}

/**
 * :contentReference[oaicite:15]{index=15}
 */
:contentReference[oaicite:16]{index=16}
  :contentReference[oaicite:17]{index=17}
  :contentReference[oaicite:18]{index=18}
  :contentReference[oaicite:19]{index=19}
  :contentReference[oaicite:20]{index=20}

  :contentReference[oaicite:21]{index=21}
    .from(TABLE)
    .select('*')
    :contentReference[oaicite:22]{index=22}
    :contentReference[oaicite:23]{index=23}
    :contentReference[oaicite:24]{index=24}

  if (error) {
    :contentReference[oaicite:25]{index=25}
    :contentReference[oaicite:26]{index=26}
  }

  :contentReference[oaicite:27]{index=27}
    ...sale,
    :contentReference[oaicite:28]{index=28}
  }));
}

/**
 * :contentReference[oaicite:29]{index=29}
 */
:contentReference[oaicite:30]{index=30}
  :contentReference[oaicite:31]{index=31}
    .from(TABLE)
    .select('totalAmount');

  if (error) {
    :contentReference[oaicite:32]{index=32}
    :contentReference[oaicite:33]{index=33}
  }

  :contentReference[oaicite:34]{index=34}
    :contentReference[oaicite:35]{index=35}
}
=======
const saleFromDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Sale => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    clientName: data.clientName || null,
    items: data.items || [],
    paymentMethod: data.paymentMethod || null,
    totalAmount: data.totalAmount || 0,
    createdAt: (data.createdAt instanceof Timestamp) ? data.createdAt.toDate() : (data.createdAt || new Date()),
    status: data.status || "Concluída",
    cancellationReason: data.cancellationReason || null,
    cancelledAt: data.cancelledAt instanceof Timestamp ? data.cancelledAt.toDate() : (data.cancelledAt || null),
  };
};

export const addSale = async (saleData: SaleInput): Promise<string> => {
  // const user = auth.currentUser;
  // if (!user) throw new Error("Usuário não autenticado.");

  const docRef = await addDoc(collection(db, SALES_COLLECTION), {
    ...saleData,
    status: "Concluída",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(), // Add updatedAt for consistency
  });
  return docRef.id; 
};

export const getSales = async (): Promise<Sale[]> => {
  // const user = auth.currentUser;
  // if (!user) return [];

  const q = query(
    collection(db, SALES_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(saleFromDoc);
};

export const cancelSale = async (saleId: string, reason: string): Promise<void> => {
  const saleRef = doc(db, SALES_COLLECTION, saleId);
  await updateDoc(saleRef, {
    status: "Cancelada",
    cancellationReason: reason,
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // TODO: Implementar lógica para reverter o estoque dos produtos vendidos.
};


export const getSalesByDateRange = async (startDate: Date, endDate: Date): Promise<Sale[]> => {
  // const user = auth.currentUser;
  // if (!user) return [];

  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999));

  const q = query(
    collection(db, SALES_COLLECTION),
    where('createdAt', '>=', startTimestamp),
    where('createdAt', '<=', endTimestamp),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(saleFromDoc);
};

export const getTotalSalesRevenue = async (): Promise<number> => {
  // const user = auth.currentUser;
  // if (!user) return 0;

  const q = query(
    collection(db, SALES_COLLECTION),
    where('status', '==', 'Concluída')
  );
  const querySnapshot = await getDocs(q);
  let totalRevenue = 0;
  querySnapshot.forEach((docSnap) => {
    totalRevenue += (docSnap.data().totalAmount as number) || 0;
  });
  return totalRevenue;
};
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
