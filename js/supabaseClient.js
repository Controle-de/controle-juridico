const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI';

// Garante que pega a função createClient da CDN
const { createClient } = window.supabase || {};

if (!createClient) {
  console.error('Biblioteca do Supabase ainda não foi carregada.');
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
