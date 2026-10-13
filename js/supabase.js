// Substitua pelas suas credenciais do painel do Supabase
const URL_SUPABASE = 'https://zhjidiawzfakvpqzzkgj.supabase.co';
const CHAVE_ANON = 'sb_publishable_8r-0y1zS8pSsSUmOsQzzhA_Om68ICDk';

// Inicializa o cliente na variável global db
window.db = window.supabase.createClient(URL_SUPABASE, CHAVE_ANON);
