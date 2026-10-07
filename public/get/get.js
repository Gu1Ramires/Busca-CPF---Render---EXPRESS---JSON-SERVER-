// =============================================================
//  GET (Read) — lista todas as pessoas e busca por CPF
//  Rotas: GET /api/pessoas  |  GET /api/pessoas?cpf=...
// =============================================================

const tabela = document.getElementById('tabela-corpo');
const contador = document.getElementById('contador');
const alerta = document.getElementById('alerta');
const formBusca = document.getElementById('form-busca');
const campoBusca = document.getElementById('cpf-busca');

// Monta uma linha da tabela para cada pessoa
function desenharTabela(pessoas) {
  if (!pessoas.length) {
    tabela.innerHTML = '<tr><td colspan="8" class="empty">Nenhum registro encontrado.</td></tr>';
    return;
  }

  tabela.innerHTML = pessoas.map((p) => {
    const cpf = encodeURIComponent(p.cpf);
    return `<tr>
      <td class="mono">${escaparHTML(p.id)}</td>
      <td><strong>${escaparHTML(p.nome)} ${escaparHTML(p.sobrenome)}</strong></td>
      <td class="mono">${escaparHTML(p.cpf)}<span class="muted">RG ${escaparHTML(p.rg)}</span></td>
      <td>${escaparHTML(p.idade)}</td>
      <td>${escaparHTML(p.email)}<span class="muted">${escaparHTML(p.telefone)}</span></td>
      <td>${escaparHTML(p.rua)}<span class="muted">${escaparHTML(p.bairro)}</span></td>
      <td>${escaparHTML(p.cidade)}<span class="muted">${escaparHTML(p.estado)}</span></td>
      <td class="actions-cell">
        <a class="btn btn-ghost btn-sm" href="/put/?cpf=${cpf}">Editar</a>
        <a class="btn btn-ghost btn-sm" href="/delete/?cpf=${cpf}">Excluir</a>
      </td>
    </tr>`;
  }).join('');
}

function atualizarContador(qtd, filtro) {
  contador.innerHTML = filtro
    ? `<strong>${qtd}</strong> resultado(s) para ${escaparHTML(filtro)}`
    : `<strong>${qtd}</strong> registro(s) no banco`;
}

// GET de todos os registros
async function listarTodos() {
  esconderAlerta(alerta);
  try {
    const resposta = await fetch(API);
    const pessoas = await resposta.json();
    desenharTabela(pessoas);
    atualizarContador(pessoas.length);
  } catch (erro) {
    tabela.innerHTML = '<tr><td colspan="8" class="empty">Não foi possível carregar os dados.</td></tr>';
    mostrarAlerta(alerta, 'error', 'Falha ao conectar com o servidor.');
  }
}

// GET filtrando pelo CPF
async function listarPorCPF(cpf) {
  esconderAlerta(alerta);
  const cpfFormatado = formatarCPF(cpf);

  if (!cpfCompleto(cpfFormatado)) {
    mostrarAlerta(alerta, 'error', 'Digite o CPF completo (11 dígitos) para buscar.');
    return;
  }

  try {
    const pessoa = await buscarPorCPF(cpfFormatado);
    const resultado = pessoa ? [pessoa] : [];
    desenharTabela(resultado);
    atualizarContador(resultado.length, cpfFormatado);
    if (!pessoa) {
      mostrarAlerta(alerta, 'info',
        `Nenhuma pessoa com o CPF ${escaparHTML(cpfFormatado)}. <a href="/post/">Cadastrar agora</a>`);
    }
  } catch (erro) {
    mostrarAlerta(alerta, 'error', 'Falha ao conectar com o servidor.');
  }
}

formBusca.addEventListener('submit', (evento) => {
  evento.preventDefault();
  listarPorCPF(campoBusca.value);
});

document.getElementById('btn-todos').addEventListener('click', () => {
  campoBusca.value = '';
  history.replaceState(null, '', '/get/');
  listarTodos();
});

// Se a página foi aberta com ?cpf=..., já faz a busca
const cpfURL = parametroURL('cpf');
if (cpfURL) {
  campoBusca.value = formatarCPF(cpfURL);
  listarPorCPF(cpfURL);
} else {
  listarTodos();
}
