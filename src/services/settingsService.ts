import { supabase } from '@/lib/supabase';

const SETTINGS_TABLE = 'systemSettings';
const ESTABLISHMENT_DOC_ID = 'establishmentDetails';
const LOGO_STORAGE_PATH = 'establishment-logo/app_logo.png'; // nome fixo no bucket

export interface EstablishmentSettings {
  businessName?: string;
  businessAddress?: string;
  businessCnpj?: string;
  businessPhone?: string;
  businessEmail?: string;
  logoUrl?: string;
  updatedAt?: Date;
}

const settingsFromRow = (data: any): EstablishmentSettings => {
  return {
    businessName: data.businessName || "",
    businessAddress: data.businessAddress || "",
    businessCnpj: data.businessCnpj || "",
    businessPhone: data.businessPhone || "",
    businessEmail: data.businessEmail || "",
    logoUrl: data.logoUrl || "",
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  };
};

export const getEstablishmentSettings = async (): Promise<EstablishmentSettings | null> => {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select('*')
    .eq('id', ESTABLISHMENT_DOC_ID)
    .single();

  if (error && error.code !== 'PGRST116') { // 116 = no rows returned
    console.error('Erro ao buscar configurações:', error);
    throw new Error('Erro ao buscar configurações');
  }

  return data ? settingsFromRow(data) : null;
};

export const saveEstablishmentSettings = async (
  settingsData: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>,
  logoFile?: File | null
): Promise<EstablishmentSettings> => {
  let newLogoUrl: string | undefined;
  const now = new Date().toISOString();

  const currentSettings = await getEstablishmentSettings();

  if (logoFile) {
    // Upload da nova logo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public') // certifique-se que este bucket existe e é público
      .upload(LOGO_STORAGE_PATH, logoFile, { upsert: true });

    if (uploadError) {
      console.error('Erro ao enviar nova logo:', uploadError);
      throw new Error('Erro ao enviar nova logo');
    }

    const { data: urlData } = supabase.storage.from('public').getPublicUrl(LOGO_STORAGE_PATH);
    newLogoUrl = urlData?.publicUrl;
  } else if (logoFile === null && currentSettings?.logoUrl && !currentSettings.logoUrl.includes('placehold.co')) {
    // Remoção da logo
    const { error: deleteError } = await supabase.storage
      .from('public')
      .remove([LOGO_STORAGE_PATH]);

    if (deleteError && deleteError.message !== 'The resource was not found') {
      console.warn('Erro ao deletar logo anterior:', deleteError);
    }

    newLogoUrl = '';
  }

  const dataToSave = {
    id: ESTABLISHMENT_DOC_ID,
    ...settingsData,
    logoUrl: newLogoUrl ?? currentSettings?.logoUrl ?? '',
    updatedAt: now,
  };

  const { error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert(dataToSave, { onConflict: 'id' });

  if (error) {
    console.error('Erro ao salvar configurações:', error);
    throw new Error('Erro ao salvar configurações');
  }

  return {
    ...settingsData,
    logoUrl: dataToSave.logoUrl,
  };
};
