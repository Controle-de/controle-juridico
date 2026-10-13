// Substitua pelas suas credenciais do painel do Supabase
const URL_SUPABASE = 'https://zhjidiawzfakvpqzzkgj.supabase.co';
const CHAVE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoamlkaWF3emZha3ZwcXp6a2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDI5MDEsImV4cCI6MjEwNzQ3ODkwMX0.tqYO9iEdw1_iOOpbkCHLOcr6h47GEp9EFJ_vmeGxGwk';

// Inicializa o cliente na variável global db
window.db = window.supabase.createClient(URL_SUPABASE, CHAVE_ANON);
