// Substitua pelas chaves do painel do seu Supabase (Project Settings > API)
const SUPABASE_URL = https://zhjidiawzfakvpqzzkgj.supabase.co/rest/v1/;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoamlkaWF3emZha3ZwcXp6a2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDI5MDEsImV4cCI6MjEwNzQ3ODkwMX0.tqYO9iEdw1_iOOpbkCHLOcr6h47GEp9EFJ_vmeGxGwk;

// Inicializa a biblioteca do Supabase (carregada via CDN no HTML)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
