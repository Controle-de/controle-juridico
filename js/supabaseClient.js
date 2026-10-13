const SUPABASE_URL = 'https://zhjidiawzfakvpqzzkgj.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_8r-0y1zS8pSsSUmOsQzzhA_Om68ICDk';

// Garante que pega a função createClient da CDN
const { createClient } = window.supabase || {};

if (!createClient) {
  console.error('Biblioteca do Supabase ainda não foi carregada.');
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
