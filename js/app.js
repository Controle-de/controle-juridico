let tiposDisponiveis = [];
let todosOsDocumentos = [];
let tipoAtivo = 'TODOS';

// 1. Controle de Cores
function aplicarCorSalva() {
  const corSalva = localStorage.getItem('tema_cor_primaria') || '#1e3a8a';
  document.documentElement.style.setProperty('--primary', corSalva);
}

window.mudarCorTema = function(cor) {
  document.documentElement.style.setProperty('--primary', cor);
  localStorage.setItem('tema_cor_primaria', cor);
};

// 2. Fluxo de Autenticação (Login / Sessão / Logout)
async function verificarSessao() {
  const { data: { session } } = await window.db.auth.getSession();
  alternarVisao(session);

  // Escuta login e logout em tempo real
  window.db.auth.onAuthStateChange((_event, session) => {
    alternarVisao(session);
  });
}

function alternarVisao(session) {
  const secaoLogin = document.getElementById('secao-login');
  const secaoSistema = document.getElementById('secao-sistema');

  if (session) {
    if (secaoLogin) secaoLogin.style.display = 'none';
    if (secaoSistema) secaoSistema.style.display = 'block';
    carregarTipos();
    carregarDocumentos();
  } else {
    if (secaoLogin) secaoLogin.style.display = 'flex';
    if (secaoSistema) secaoSistema.style.display = 'none';
  }
}

window.fazerLogout = async function() {
  await window.db.auth.signOut();
};

// 3. Inicialização e Eventos
document.addEventListener('DOMContentLoaded', () => {
  aplicarCorSalva();
  verificarSessao();

  // Envio do Login
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-login');
      btn.disabled = true;
      btn.innerText = 'Verificando...';

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-senha').value;

      try {
        const { error } = await window.db.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } catch (err) {
        alert('Falha ao entrar: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = 'Entrar no Sistema';
      }
    });
  }

  // Cadastro de Documentos
  const formDoc = document.getElementById('form-documento');
  if (formDoc) {
    formDoc.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = formDoc.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerText = 'Guardando...';

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
          assunto: document.getElementById('assunto').value,
          arquivo_url: filePath
        };

        const { error: insertError } = await window.db
          .from('documentos')
          .insert([novoRegisto]);

        if (insertError) throw insertError;

        alert('Documento cadastrado com sucesso!');
        formDoc.reset();
        await carregarDocumentos();
      } catch (err) {
        console.error('Erro ao guardar:', err);
        alert('Erro ao guardar: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerText = 'Cadastrar Documento';
      }
    });
  }
});

// 4. Tipos e Abas
async function carregarTipos() {
  const selectTipo = document.getElementById('tipo');
  const selectEditTipo = document.getElementById('edit-tipo');

  try {
    const { data, error } = await window.db
      .from('tipos_documentos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;

    tiposDisponiveis = data || [];

    if (selectTipo) {
      selectTipo.innerHTML = '<option value="">Selecione o tipo</option>';
      tiposDisponiveis.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.nome;
        opt.textContent = item.nome;
        selectTipo.appendChild(opt);
      });
    }

    if (selectEditTipo) {
      selectEditTipo.innerHTML = '';
      tiposDisponiveis.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.nome;
        opt.textContent = item.nome;
        selectEditTipo.appendChild(opt);
      });
    }

    renderizarAbas();
  } catch (err) {
    console.error('Erro ao carregar tipos:', err);
  }
}

function renderizarAbas() {
  const container = document.getElementById('abas-tipos');
  if (!container) return;

  container.innerHTML = '';

  const btnTodos = document.createElement('button');
  btnTodos.className = `tab-btn ${tipoAtivo === 'TODOS' ? 'active' : ''}`;
  btnTodos.innerText = '📁 Todos';
  btnTodos.onclick = () => alternarAba('TODOS');
  container.appendChild(btnTodos);

  tiposDisponiveis.forEach(t => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${tipoAtivo === t.nome ? 'active' : ''}`;
    btn.innerText = t.nome;
    btn.onclick = () => alternarAba(t.nome);
    container.appendChild(btn);
  });
}

function alternarAba(tipo) {
  tipoAtivo = tipo;
  renderizarAbas();
  renderizarTabela();
}

window.renderizarListaTiposModal = function() {
  const lista = document.getElementById('lista-tipos');
  if (!lista) return;

  lista.innerHTML = '';
  tiposDisponiveis.forEach(item => {
    const li = document.createElement('li');
    li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9;';
    li.innerHTML = `
      <span>${item.nome}</span>
      <button onclick="excluirTipo('${item.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Excluir</button>
    `;
    lista.appendChild(li);
  });
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

window.excluirTipo = async function(id) {
  if (!confirm('Deseja excluir este tipo?')) return;
  try {
    const { error } = await window.db
      .from('tipos_documentos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await carregarTipos();
    renderizarListaTiposModal();
  } catch (err) {
    alert('Erro ao excluir: ' + err.message);
  }
};

// 5. Carregar e Renderizar Documentos
async function carregarDocumentos() {
  const tbody = document.getElementById('corpo-tabela');
  if (!tbody) return;

  try {
    const { data: docs, error } = await window.db
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    todosOsDocumentos = docs || [];
    renderizarTabela();
  } catch (err) {
    console.error('Erro ao listar:', err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Erro: ${err.message}</td></tr>`;
  }
}

function renderizarTabela() {
  const tbody = document.getElementById('corpo-tabela');
  if (!tbody) return;

  const docsFiltrados = tipoAtivo === 'TODOS'
    ? todosOsDocumentos
    : todosOsDocumentos.filter(d => d.tipo === tipoAtivo);

  tbody.innerHTML = '';
  if (docsFiltrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b;">Nenhum documento na categoria "${tipoAtivo}".</td></tr>`;
    return;
  }

  docsFiltrados.forEach(doc => {
    const dataCriacao = doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${doc.tipo}</strong><br><small style="color:#64748b;">${doc.numero_identificador}</small></td>
      <td>${doc.origem_remetente}</td>
      <td>${doc.assunto}</td>
      <td>${dataCriacao}</td>
      <td>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${doc.arquivo_url ? `<button class="btn-acao btn-anexo" onclick="abrirArquivo('${doc.arquivo_url}')">Anexo</button>` : ''}
          <button class="btn-acao btn-editar" onclick="abrirModalEdicao('${doc.id}')">Editar</button>
          <button class="btn-acao btn-excluir" onclick="excluirDocumento('${doc.id}', '${doc.arquivo_url || ''}')">Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 6. Edição e Exclusão de Documentos
window.abrirModalEdicao = function(id) {
  const doc = todosOsDocumentos.find(d => d.id === id);
  if (!doc) return;

  document.getElementById('edit-doc-id').value = doc.id;
  document.getElementById('edit-tipo').value = doc.tipo;
  document.getElementById('edit-numero').value = doc.numero_identificador;
  document.getElementById('edit-origem').value = doc.origem_remetente;
  document.getElementById('edit-assunto').value = doc.assunto;

  document.getElementById('modal-editar-doc').style.display = 'flex';
};

window.salvarEdicaoDocumento = async function() {
  const id = document.getElementById('edit-doc-id').value;
  const updates = {
    tipo: document.getElementById('edit-tipo').value,
    numero_identificador: document.getElementById('edit-numero').value,
    origem_remetente: document.getElementById('edit-origem').value,
    assunto: document.getElementById('edit-assunto').value
  };

  try {
    const { error } = await window.db
      .from('documentos')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    document.getElementById('modal-editar-doc').style.display = 'none';
    alert('Documento atualizado com sucesso!');
    await carregarDocumentos();
  } catch (err) {
    alert('Erro ao atualizar: ' + err.message);
  }
};

window.excluirDocumento = async function(id, arquivoUrl) {
  if (!confirm('Deseja realmente excluir este documento? Essa ação não pode ser desfeita.')) return;

  try {
    const { error: dbError } = await window.db
      .from('documentos')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    if (arquivoUrl) {
      await window.db.storage
        .from('documentos-juridicos')
        .remove([arquivoUrl]);
    }

    alert('Documento excluído com sucesso!');
    await carregarDocumentos();
  } catch (err) {
    alert('Erro ao excluir: ' + err.message);
  }
};

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
