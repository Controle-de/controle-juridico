document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-documento');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerText = 'A guardar...';

      try {
        const fileInput = document.getElementById('arquivo');
        const file = fileInput.files[0];
        let filePath = null;

        if (file) {
          const ext = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          filePath = `anexos/${fileName}`;

          const { error: uploadError } = await window.db.storage
            .from('documentos-juridicos')
            .upload(filePath, file);

          if (uploadError) throw uploadError;
        }

        const novoRegisto = {
          tipo: document.getElementById('tipo').value,
          numero_identificador: document.getElementById('numero').value,
          origem_remetente: document.getElementById('origem').value,
          prazo_fatal: document.getElementById('prazo').value || null,
          assunto: document.getElementById('assunto').value,
          arquivo_url: filePath,
          status: 'Pendente'
        };

        const { error: insertError } = await window.db
          .from('documentos')
          .insert([novoRegisto]);

        if (insertError) throw insertError;

        alert('Documento guardado com sucesso!');
        form.reset();
        carregarTabela();
      } catch (err) {
        console.error('Erro na gravação:', err);
        alert('Erro ao guardar: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = 'Cadastrar Documento';
      }
    });
  }

  carregarTabela();
});

async function carregarTabela() {
  const tbody = document.getElementById('corpo-tabela');
  if (!tbody) return;

  try {
    const { data: docs, error } = await window.db
      .from('documentos')
      .select('*')
      .order('prazo_fatal', { ascending: true, nullsFirst: false });

    if (error) throw error;

    tbody.innerHTML = '';
    if (!docs || docs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum documento encontrado.</td></tr>';
      return;
    }

    docs.forEach(doc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${doc.tipo}</strong><br><small>${doc.numero_identificador}</small></td>
        <td>${doc.origem_remetente}</td>
        <td>${doc.assunto}</td>
        <td>${doc.prazo_fatal ? new Date(doc.prazo_fatal).toLocaleDateString('pt-BR') : 'Sem prazo'}</td>
        <td><span class="badge">${doc.status}</span></td>
        <td>
          ${doc.arquivo_url ? `<button onclick="abrirArquivo('${doc.arquivo_url}')">Ver Anexo</button>` : 'Sem anexo'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao listar:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Erro ao carregar dados: ${err.message}</td></tr>`;
  }
}

window.abrirArquivo = async function(caminho) {
  try {
    const { data, error } = await window.db.storage
      .from('documentos-juridicos')
      .createSignedUrl(caminho, 300);

    if (error) throw error;
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  } catch (err) {
    alert('Erro ao abrir anexo: ' + err.message);
  }
};
