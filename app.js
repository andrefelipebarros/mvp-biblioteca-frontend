// JS puro, sem framework nenhum (era isso que pediu o enunciado)
const API_PADRAO = 'http://127.0.0.1:5000/api';
let apiUrl = localStorage.getItem('biblioteca_api_url') || API_PADRAO;

let livros = [];
let reservas = [];

// atalho pra nao ficar escrevendo document.getElementById toda hora
function pegar(id) {
  return document.getElementById(id);
}

function mostrarMensagem(texto) {
  const mensagem = pegar('mensagem');
  mensagem.textContent = texto;
  mensagem.style.display = 'block';

  setTimeout(function () {
    mensagem.style.display = 'none';
  }, 3000);
}

function limparTexto(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function chamarApi(caminho, opcoes = {}) {
  const resposta = await fetch(apiUrl + caminho, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...opcoes
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro na comunicação com a API.');
  }

  return dados;
}

function abrirPagina(nomePagina) {
  const paginas = document.querySelectorAll('.pagina');
  const botoes = document.querySelectorAll('.menu');

  paginas.forEach(function (pagina) {
    pagina.classList.remove('ativa');
  });

  botoes.forEach(function (botao) {
    botao.classList.remove('ativo');
  });

  pegar(nomePagina).classList.add('ativa');
  document.querySelector('[data-pagina="' + nomePagina + '"]').classList.add('ativo');

  if (nomePagina === 'dashboard') {
    carregarResumo();
  }

  if (nomePagina === 'livros') {
    carregarLivros();
  }

  if (nomePagina === 'reservas') {
    carregarTelaReservas();
  }
}

async function verificarApi() {
  const status = pegar('apiStatus');

  try {
    const dados = await chamarApi('/health');
    status.textContent = dados.mensagem;
    status.className = 'online';
  } catch (erro) {
    status.textContent = 'API offline';
    status.className = 'offline';
  }
}

function criarListaSimples(id, objeto) {
  const area = pegar(id);
  const chaves = Object.keys(objeto || {});

  if (chaves.length === 0) {
    area.innerHTML = '<p>Nenhum dado encontrado.</p>';
    return;
  }

  area.innerHTML = chaves.map(function (chave) {
    return `
      <div class="linha-lista">
        <span>${limparTexto(chave)}</span>
        <strong>${objeto[chave]}</strong>
      </div>
    `;
  }).join('');
}

async function carregarResumo() {
  try {
    const dados = await chamarApi('/estatisticas');

    pegar('totalLivros').textContent = dados.total_livros;
    pegar('totalReservas').textContent = dados.total_reservas;
    pegar('totalDisponiveis').textContent = dados.livros_por_status.disponivel || 0;

    criarListaSimples('listaStatus', dados.livros_por_status);
    criarListaSimples('listaCategorias', dados.livros_por_categoria);
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

async function carregarLivros() {
  try {
    const busca = pegar('filtroBusca').value.trim();
    const status = pegar('filtroStatus').value;
    const categoria = pegar('filtroCategoria').value.trim();

    const parametros = new URLSearchParams();

    if (busca) {
      parametros.append('busca', busca);
    }

    if (status) {
      parametros.append('status', status);
    }

    if (categoria) {
      parametros.append('categoria', categoria);
    }

    const query = parametros.toString() ? '?' + parametros.toString() : '';
    livros = await chamarApi('/livros' + query);

    mostrarLivros();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

function mostrarLivros() {
  const area = pegar('listaLivros');

  if (livros.length === 0) {
    area.innerHTML = '<p>Nenhum livro encontrado.</p>';
    return;
  }

  area.innerHTML = livros.map(function (livro) {
    return `
      <div class="card-livro">
        <h3>${limparTexto(livro.titulo)}</h3>
        <p><strong>Autor:</strong> ${limparTexto(livro.autor)}</p>
        <p><strong>Categoria:</strong> ${limparTexto(livro.categoria)}</p>
        <p><strong>Status:</strong> ${limparTexto(livro.status)}</p>

        <div class="acoes">
          <button onclick="verDetalhes(${livro.id})">Detalhes</button>
          <button onclick="editarLivro(${livro.id})">Editar</button>
          <button class="perigo" onclick="excluirLivro(${livro.id})">Excluir</button>
        </div>
      </div>
    `;
  }).join('');
}

async function verDetalhes(id) {
  try {
    const livro = await chamarApi('/livros/' + id);

    alert(
      'Título: ' + livro.titulo + '\n' +
      'Autor: ' + livro.autor + '\n' +
      'Categoria: ' + livro.categoria + '\n' +
      'Status: ' + livro.status
    );
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

async function editarLivro(id) {
  try {
    const livro = await chamarApi('/livros/' + id);

    const novoTitulo = prompt('Título:', livro.titulo);
    const novoAutor = prompt('Autor:', livro.autor);
    const novaCategoria = prompt('Categoria:', livro.categoria);
    const novoStatus = prompt('Status: disponivel, emprestado ou reservado', livro.status);

    if (!novoTitulo || !novoAutor || !novaCategoria || !novoStatus) {
      mostrarMensagem('Edição cancelada.');
      return;
    }

    await chamarApi('/livros/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        titulo: novoTitulo,
        autor: novoAutor,
        categoria: novaCategoria,
        status: novoStatus
      })
    });

    mostrarMensagem('Livro atualizado.');
    carregarLivros();
    carregarResumo();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

async function excluirLivro(id) {
  const confirmar = confirm('Deseja excluir este livro?');

  if (!confirmar) {
    return;
  }

  try {
    await chamarApi('/livros/' + id, { method: 'DELETE' });
    mostrarMensagem('Livro excluído.');
    carregarLivros();
    carregarResumo();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

async function cadastrarLivro(evento) {
  evento.preventDefault();

  const novoLivro = {
    titulo: pegar('titulo').value.trim(),
    autor: pegar('autor').value.trim(),
    categoria: pegar('categoria').value.trim(),
    status: pegar('statusLivro').value
  };

  try {
    await chamarApi('/livros', {
      method: 'POST',
      body: JSON.stringify(novoLivro)
    });

    pegar('formLivro').reset();
    mostrarMensagem('Livro cadastrado.');
    abrirPagina('livros');
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

async function carregarTelaReservas() {
  await carregarLivrosParaReserva();
  await carregarReservas();
}

async function carregarLivrosParaReserva() {
  try {
    livros = await chamarApi('/livros');
    const livrosDisponiveis = livros.filter(function (livro) {
      return livro.status === 'disponivel';
    });

    if (livrosDisponiveis.length === 0) {
      pegar('livroReserva').innerHTML = '<option value="">Nenhum livro disponível</option>';
      return;
    }

    pegar('livroReserva').innerHTML = livrosDisponiveis.map(function (livro) {
      return `<option value="${livro.id}">${limparTexto(livro.titulo)}</option>`;
    }).join('');
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

async function carregarReservas() {
  try {
    reservas = await chamarApi('/reservas');
    mostrarReservas();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

function mostrarReservas() {
  const area = pegar('listaReservas');

  if (reservas.length === 0) {
    area.innerHTML = '<p>Nenhuma reserva cadastrada.</p>';
    return;
  }

  area.innerHTML = reservas.map(function (reserva) {
    let botaoCancelar = '';

    if (reserva.status === 'ativa') {
      botaoCancelar = `<button class="perigo" onclick="cancelarReserva(${reserva.id})">Cancelar</button>`;
    }

    return `
      <div class="item-reserva">
        <p><strong>Livro:</strong> ${limparTexto(reserva.titulo_livro)}</p>
        <p><strong>Usuário:</strong> ${limparTexto(reserva.usuario_nome)}</p>
        <p><strong>E-mail:</strong> ${limparTexto(reserva.usuario_email)}</p>
        <p><strong>Status:</strong> ${limparTexto(reserva.status)}</p>
        <div class="acoes">${botaoCancelar}</div>
      </div>
    `;
  }).join('');
}

async function criarReserva(evento) {
  evento.preventDefault();

  const reserva = {
    livro_id: Number(pegar('livroReserva').value),
    usuario_nome: pegar('usuarioNome').value.trim(),
    usuario_email: pegar('usuarioEmail').value.trim()
  };

  try {
    await chamarApi('/reservas', {
      method: 'POST',
      body: JSON.stringify(reserva)
    });

    pegar('formReserva').reset();
    mostrarMensagem('Reserva criada.');
    carregarTelaReservas();
    carregarResumo();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

async function cancelarReserva(id) {
  try {
    await chamarApi('/reservas/' + id + '/cancelar', { method: 'PATCH' });
    mostrarMensagem('Reserva cancelada.');
    carregarTelaReservas();
    carregarResumo();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

function salvarConfiguracao(evento) {
  evento.preventDefault();

  const novaUrl = pegar('apiUrl').value.trim().replace(/\/$/, '');
  apiUrl = novaUrl || API_PADRAO;

  localStorage.setItem('biblioteca_api_url', apiUrl);
  mostrarMensagem('Configuração salva.');
  verificarApi();
}

function iniciar() {
  pegar('apiUrl').value = apiUrl;

  document.querySelectorAll('.menu').forEach(function (botao) {
    botao.addEventListener('click', function () {
      abrirPagina(botao.dataset.pagina);
    });
  });

  pegar('btnAtualizarResumo').addEventListener('click', carregarResumo);
  pegar('btnCarregarLivros').addEventListener('click', carregarLivros);
  pegar('btnCarregarReservas').addEventListener('click', carregarTelaReservas);
  pegar('formLivro').addEventListener('submit', cadastrarLivro);
  pegar('formReserva').addEventListener('submit', criarReserva);
  pegar('formFiltros').addEventListener('submit', function (evento) {
    evento.preventDefault();
    carregarLivros();
  });
  pegar('formConfig').addEventListener('submit', salvarConfiguracao);

  verificarApi();
  carregarResumo();
}

iniciar();
