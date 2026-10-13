// 1. Fazer upload do arquivo PDF/Word para o bucket
async function uploadDocumento(arquivo) {
  const extensao = arquivo.name.split('.').pop();
  const nomeUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extensao}`;
  const caminho = `anexos/${nomeUnico}`;

  const { data, error } = await supabase.storage
    .from('documentos-juridicos')
    .upload(caminho, arquivo);

  if (error) throw error;
  return caminho;
}

// 2. Inserir os dados na tabela 'documentos'
async function cadastrarDocumento(dados) {
  const { data, error } = await supabase
    .from('documentos')
    .insert([dados]);

  if (error) throw error;
  return data;
}

// 3. Buscar os documentos com ordenação por prazo
async function listarDocumentos() {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .order('prazo_fatal', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

// 4. Gerar link temporário para visualizar/baixar o arquivo seguro
async function obterLinkArquivo(caminho) {
  const { data, error } = await supabase.storage
    .from('documentos-juridicos')
    .createSignedUrl(caminho, 300); // 5 minutos de validade

  if (error) throw error;
  return data.signedUrl;
}
