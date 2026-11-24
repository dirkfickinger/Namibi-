// Instellingen voor gedeelde reizen (Supabase).
//
// De URL en de "anon"/"publishable" sleutel zijn bedoeld om openbaar in de app te staan:
// ze geven alleen toegang binnen de regels (Row Level Security) van supabase/schema.sql.
// Zet hier NOOIT de "service_role"/"secret" sleutel neer.
//
// Laat beide leeg om gedeelde reizen uit te schakelen.
export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';
export const BACKEND = 'supabase';
