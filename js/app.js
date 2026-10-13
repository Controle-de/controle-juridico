let tiposDisponiveis = [];

// Funções para controle direto do modal na tela
window.abrirModalTipos = function() {
  const modal = document.getElementById('modal-tipos');
  if (modal) {
    modal.style.display = 'flex';
    renderizarListaTiposModal();
  }
};

window.fecharModalTipos = function() {
  const modal = document.getElementById('modal-tipos');
  if (modal) modal.style.display = 'none';
};

window.adicionarNovoTipo = async function() {
  const input = document.getElementById('novo-tipo-nome');
  const nome = input ? input.value.trim() : '';
  if (!nome) return alert('Digite o nome do novo tipo.');

  try {
    const { error } = await window.db
      .from('tipos_documentos')
      .insert([{ nome }]);

    if (error) throw error;

    input.value = '';
    await carregarTipos();
    renderizarListaTiposModal();
  } catch (err) {
    alert('Erro ao adicionar tipo: ' + err.message);
  }
};

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
      modalTipos.style.display = 'none';
    });
  }

  if (btnAdicionarTipo) {
    btnAdicionarTipo.addEventListener('click', async () => {
      const nome = novoTipoInput.value.trim();
      if (!nome) return alert('Digite o nome do tipo.');

      try {
        const { error } = await window.db
          .from('tipos_documentos')
          .insert([{ nome }]);

        if (error) throw error;

        novoTipoInput.value = '';
        await carregarTipos();
        renderizarListaTiposModal();
      } catch (err) {
        alert('Erro ao adicionar tipo: ' + err.message);
      }
    });
  }

  // Cadastro de Documentos
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerText = 'A guardar...';

      try {
        const fileInput = document.getElementById('arquivo');
        const file = fileInput.files[0];
         filePath = null;

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
          assunto: document.getElementById('assunto').value,
          arquivo_url: filePath,
          status: 'Registrado'
        };

        const { error: insertError } = await window.db
          .from('documentos')
          .insert([novoRegisto]);

        if (insertError) throw insertError;

        alert('Documento guardado com sucesso!');
        form.reset();
        carregarTabela();
      } catch (err) {
        console.error('Erro ao guardar:', err);
        alert('Erro ao guardar: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = 'Cadastrar Documento';
      }
    });
  }

  // Carregamentos iniciais
  carregarTipos();
  carregarTabela();
});

// Busca os tipos do banco e preenche o select
async function carregarTipos() {
  const selectTipo = document.getElementById('tipo');
  if (!selectTipo) return;

  try {
    const { data, error } = await window.db
      .from('tipos_documentos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;

    tiposDisponiveis = data || [];
    selectTipo.innerHTML = '<option value="">Selecione o tipo</option>';

    tiposDisponiveis.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.nome;
      opt.textContent = item.nome;
      selectTipo.appendChild(opt);
    });
  } catch (err) {
    console.error('Erro ao carregar tipos:', err);
  }
}

// Renderiza a lista com botão de exclusão dentro do modal
function renderizarListaTiposModal() {
  const lista = document.getElementById('lista-tipos');
  if (!lista) return;

  lista.innerHTML = '';
  tiposDisponiveis.forEach(item => {
    const li = document.createElement('li');
    li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9;';
    li.innerHTML = `
      <span>${item.nome}</span>
      <button onclick="excluirTipo('${item.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.9rem;">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

// Função para excluir tipo
window.excluirTipo = async function(id) {
  if (!confirm('Deseja realmente remover esta opção?')) return;
  try {
    const { error } = await window.db
      .from('tipos_documentos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await carregarTipos();
    renderizarListaTiposModal();
  } catch (err) {
    alert('Erro ao remover: ' + err.message);
  }
};

// Carrega os documentos cadastrados
async function carregarTabela() {
  const tbody = document.getElementById('corpo-tabela');
  if (!tbody) return;

  try {
    const { data: docs, error } = await window.db
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    tbody.innerHTML = '';
    if (!docs || docs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum documento encontrado.</td></tr>';
      return;
    }

    docs.forEach(doc => {
      const dataFormatada = doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="badge">${doc.tipo}</span><br><small style="color:#64748b;">${doc.numero_identificador}</small></td>
        <td>${doc.origem_remetente}</td>
        <td>${doc.assunto}</td>
        <td>${dataFormatada}</td>
        <td><span class="badge" style="background:#dcfce7; color:#15803d;">${doc.status || 'Registrado'}</span></td>
        <td>
          ${doc.arquivo_url ? `<button onclick="abrirArquivo('${doc.arquivo_url}')">Ver Anexo</button>` : 'Sem anexo'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Erro ao listar:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Erro: ${err.message}</td></tr>`;
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
