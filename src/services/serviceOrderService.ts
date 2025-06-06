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
