// Substitua pelas chaves do painel do seu Supabase (Project Settings > API)
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_PUBLICA';

// Inicializa a biblioteca do Supabase (carregada via CDN no HTML)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
