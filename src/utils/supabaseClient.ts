// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente do Supabase não estão definidas.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
