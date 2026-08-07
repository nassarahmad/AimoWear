import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function getProductsFromSupabase() {
  if (!supabase) return null;

  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) {
    console.warn("Supabase products query failed", error.message);
    return null;
  }

  return data;
}
