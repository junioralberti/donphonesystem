import { supabase } from '@/lib/supabase';

<<<<<<< HEAD
const SETTINGS_TABLE = 'systemSettings';
const ESTABLISHMENT_DOC_ID = 'establishmentDetails';
const LOGO_STORAGE_PATH = 'app_logo.png'; // Nome do arquivo no bucket
const BUCKET_NAME = 'establishment-logo'; // Nome do bucket correto
=======
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, type DocumentData } from 'firebase/firestore';
// Firebase Storage imports (ref, uploadBytes, getDownloadURL, deleteObject) are no longer needed here.
import { db } from '@/lib/firebase'; 

const SETTINGS_COLLECTION = 'systemSettings';
const ESTABLISHMENT_DOC_ID = 'establishmentDetails';
// LOGO_STORAGE_PATH is no longer needed here.
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464

export interface EstablishmentSettings {
  businessName?: string;
  businessAddress?: string;
  businessCnpj?: string;
  businessPhone?: string;
  businessEmail?: string;
<<<<<<< HEAD
  logoUrl?: string;
  updatedAt?: Date;
}

const settingsFromRow = (data: any): EstablishmentSettings => {
=======
  logoUrl?: string; // Kept in interface as it might exist in Firestore, but not actively managed by this service anymore for setting.
  updatedAt?: Timestamp;
}

const settingsFromDocData = (data: DocumentData | undefined): EstablishmentSettings | null => {
  if (!data) {
    return null;
  }
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
  return {
    businessName: data.businessName || "",
    businessAddress: data.businessAddress || "",
    businessCnpj: data.businessCnpj || "",
    businessPhone: data.businessPhone || "",
    businessEmail: data.businessEmail || "",
<<<<<<< HEAD
    logoUrl: data.logoUrl || "",
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
=======
    logoUrl: data.logoUrl || "", // Will read if exists
    updatedAt: data.updatedAt,
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
  };
};

export const getEstablishmentSettings = async (): Promise<EstablishmentSettings | null> => {
  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select('*')
    .eq('id', ESTABLISHMENT_DOC_ID)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar configurações:', error);
    throw new Error('Erro ao buscar configurações');
  }
<<<<<<< HEAD

  return data ? settingsFromRow(data) : null;
=======
  return null;
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
};

export const saveEstablishmentSettings = async (
  settingsData: Omit<EstablishmentSettings, 'updatedAt' | 'logoUrl'>
  // logoFile parameter removed
): Promise<EstablishmentSettings> => {
<<<<<<< HEAD
  let newLogoUrl: string | undefined;
  const now = new Date().toISOString();

  const currentSettings = await getEstablishmentSettings();

  if (logoFile) {
    // Upload da nova logo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(LOGO_STORAGE_PATH, logoFile, { upsert: true });

    if (uploadError) {
      console.error('Erro ao enviar nova logo:', uploadError);
      throw new Error('Erro ao enviar nova logo');
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(LOGO_STORAGE_PATH);
      
    newLogoUrl = urlData?.publicUrl;
  } else if (logoFile === null && currentSettings?.logoUrl && !currentSettings.logoUrl.includes('placehold.co')) {
    // Remoção da logo
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([LOGO_STORAGE_PATH]);

    if (deleteError && deleteError.message !== 'The resource was not found') {
      console.warn('Erro ao deletar logo anterior:', deleteError);
    }

    newLogoUrl = '';
  }

  const dataToSave = {
    id: ESTABLISHMENT_DOC_ID,
=======
  console.log("Attempting to save establishment settings (logo management removed).");
  const docRef = doc(db, SETTINGS_COLLECTION, ESTABLISHMENT_DOC_ID);

  // Logic for handling logoFile, currentLogoUrl, logoStorageRef, upload, delete is removed.
  // The logoUrl field will not be explicitly set or modified in Firestore by this function.
  // If it exists, it remains; if not, it's not added.

  const dataToSave: Partial<EstablishmentSettings> = {
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
    ...settingsData,
    logoUrl: newLogoUrl ?? currentSettings?.logoUrl ?? '',
    updatedAt: now,
  };
<<<<<<< HEAD

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
=======
  // dataToSave.logoUrl is NOT set here.

  console.log("Data to be saved in Firestore (logoUrl not managed here):", dataToSave);
  try {
    await setDoc(docRef, dataToSave, { merge: true }); // merge: true will keep existing logoUrl if present
    console.log("Establishment settings saved successfully to Firestore.");
  } catch (firestoreError) {
    console.error("Error saving settings to Firestore:", firestoreError);
    throw new Error(`Falha ao salvar configurações no banco de dados: ${firestoreError.message || 'Erro desconhecido no Firestore.'}`);
  }
  
  const savedDataSnap = await getDoc(docRef);
  const fullSavedData = settingsFromDocData(savedDataSnap.data());
  console.log("Full settings data after save (logoUrl reflects what's in DB):", fullSavedData);
  
  return fullSavedData || { 
    businessName: settingsData.businessName ?? "",
    businessAddress: settingsData.businessAddress ?? "",
    businessCnpj: settingsData.businessCnpj ?? "",
    businessPhone: settingsData.businessPhone ?? "",
    businessEmail: settingsData.businessEmail ?? "",
    logoUrl: (await getDoc(docRef)).data()?.logoUrl || "", // Read back whatever logoUrl is in DB
  };
};

    
>>>>>>> 7555a0d60242d9430cf4cedade4356d18cf23464
