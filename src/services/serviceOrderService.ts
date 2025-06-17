import { supabase } from '@/lib/supabase';

export type ServiceOrderStatus = "Aberta" | "Em andamento" | "Aguardando peça" | "Concluída" | "Entregue" | "Cancelada";
export type DeviceType = "Celular" | "Notebook" | "Tablet" | "Placa" | "Outro";

export interface SoldProductItemInput {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceOrderInput {
  deliveryForecastDate: string | null;
  status: ServiceOrderStatus;
  responsibleTechnicianName: string | null;
  clientName: string;
  clientCpfCnpj: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  deviceType: DeviceType | null;
  deviceBrandModel: string;
  deviceImeiSerial: string | null;
  deviceColor: string | null;
  deviceAccessories: string | null;
  problemReportedByClient: string;
  technicalDiagnosis: string | null;
  internalObservations: string | null;
  servicesPerformedDescription: string | null;
  partsUsedDescription: string | null;
  serviceManualValue: number;
  additionalSoldProducts: SoldProductItemInput[];
  grandTotalValue: number;
}

export interface ServiceOrder extends ServiceOrderInput {
  id: string;
  osNumber: string;
  openingDate: Date;
  updatedAt?: Date;
}

const SERVICE_ORDERS_TABLE = 'serviceOrders';

const generateOsNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const sequence = Date.now().toString().slice(-6);
  return `OS-${year}${month}-${sequence}`;
};

export const addServiceOrder = async (orderData: ServiceOrderInput): Promise<string> => {
  const osNumber = await generateOsNumber();
  const { data, error } = await supabase
    .from(SERVICE_ORDERS_TABLE)
    .insert({
      ...orderData,
      osNumber,
      openingDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao adicionar ordem de serviço:', error);
    throw new Error('Erro ao adicionar ordem de serviço');
  }

  return osNumber;
};

export const getServiceOrders = async (): Promise<ServiceOrder[]> => {
  const { data, error } = await supabase
    .from(SERVICE_ORDERS_TABLE)
    .select('*')
    .order('openingDate', { ascending: false });

  if (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    throw new Error('Erro ao buscar ordens de serviço');
  }

  return data.map((order: any) => ({
    ...order,
    openingDate: order.openingDate ? new Date(order.openingDate) : new Date(),
    updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
  }));
};

export const updateServiceOrder = async (
  id: string,
  orderData: Partial<Omit<ServiceOrder, 'id' | 'osNumber' | 'openingDate'>>
): Promise<void> => {
  const { error } = await supabase
    .from(SERVICE_ORDERS_TABLE)
    .update({
      ...orderData,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    throw new Error('Erro ao atualizar ordem de serviço');
  }
};

export const deleteServiceOrder = async (id: string): Promise<string> => {
  const { error } = await supabase
    .from(SERVICE_ORDERS_TABLE)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar ordem de serviço:', error);
    throw new Error('Erro ao deletar ordem de serviço');
  }

  return id;
};

//
// 🧾 Funções de Relatórios com Supabase
//

// 1. Buscar OSs por intervalo de datas e status
export const getServiceOrdersByDateRangeAndStatus = async (
  startDate?: Date,
  endDate?: Date,
  status?: ServiceOrderStatus | "Todos"
): Promise<ServiceOrder[]> => {
  let queryBuilder = supabase.from(SERVICE_ORDERS_TABLE).select('*');

  if (startDate) {
    queryBuilder = queryBuilder.gte('openingDate', startDate.toISOString());
  }

  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    queryBuilder = queryBuilder.lte('openingDate', endOfDay.toISOString());
  }

  if (status && status !== "Todos") {
    queryBuilder = queryBuilder.eq('status', status);
  }

  queryBuilder = queryBuilder.order('openingDate', { ascending: false });

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Erro ao buscar ordens de serviço por data e status:', error);
    throw new Error('Erro ao gerar relatório de ordens de serviço');
  }

  return (data as any[]).map(order => ({
    ...order,
    openingDate: new Date(order.openingDate),
    updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
  }));
};

// 2. Contar OSs por status específico
export const getServiceOrdersCountByStatus = async (status: ServiceOrderStatus): Promise<number> => {
  const { count, error } = await supabase
    .from(SERVICE_ORDERS_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('status', status);

  if (error) {
    console.error('Erro ao contar ordens de serviço por status:', error);
    throw new Error('Erro ao contar ordens de serviço');
  }

  return count ?? 0;
};

// 3. Somar valor total das OSs concluídas ou entregues
export const getTotalCompletedServiceOrdersRevenue = async (): Promise<number> => {
  const { data, error } = await supabase
    .from(SERVICE_ORDERS_TABLE)
    .select('grandTotalValue')
    .in('status', ['Concluída', 'Entregue']);

  if (error) {
    console.error('Erro ao calcular receita de ordens concluídas:', error);
    throw new Error('Erro ao calcular receita');
  }

  return (data as any[]).reduce((sum, order) => sum + (order.grandTotalValue || 0), 0);
};
