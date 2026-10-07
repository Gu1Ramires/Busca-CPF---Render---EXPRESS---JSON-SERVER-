// =============================================================
//  DELETE (Delete) — busca pelo CPF e exclui o cadastro
//  Rotas: GET /api/pessoas?cpf=...  ->  DELETE /api/pessoas/:id
// =============================================================

const formBusca = document.getElementById('form-busca');
const campoBusca = document.getElementById('cpf-busca');
const alertaBusca = document.getElementById('alerta-busca');

const ficha = document.getElementById('ficha');
const fichaDados = document.getElementById('ficha-dados');
const btnExcluir = document.getElementById('btn-excluir');
const alerta = document.getElementById('alerta');

// Pessoa encontrada na busca (aguardando confirmação)
let pessoaSelecionada = null;

function esconderFicha() {
  pessoaSelecionada = null;
  ficha.classList.add('hidden');
  fichaDados.innerHTML = '';
}

// Mostra os dados da pessoa antes de excluir
function mostrarFicha(p) {
  const itens = [
    ['ID', p.id],
    ['Nome', `${p.nome} ${p.sobrenome}`],
    ['CPF', p.cpf],
    ['RG', p.rg],
    ['Idade', p.idade],
    ['E-mail', p.email],
    ['Telefone', p.telefone],
    ['Endereço', `${p.rua} — ${p.bairro}`],
    ['Cidade / UF', `${p.cidade} / ${p.estado}`]
  ];
  fichaDados.innerHTML = itens
    .map(([rotulo, valor]) => `<div><dt>${rotulo}</dt><dd>${escaparHTML(valor)}</dd></div>`)
    .join('');
  ficha.classList.remove('hidden');
}

// 1) Busca pelo CPF
async function buscarDados(cpf) {
  esconderAlerta(alertaBusca);
  esconderAlerta(alerta);
  esconderFicha();

  if (!cpfCompleto(cpf)) {
    mostrarAlerta(alertaBusca, 'error', 'Digite o CPF completo (11 dígitos).');
    return;
  }

  try {
    const pessoa = await buscarPorCPF(cpf);
    if (!pessoa) {
      mostrarAlerta(alertaBusca, 'error',
        `Pessoa não encontrada para o CPF ${escaparHTML(formatarCPF(cpf))}.`);
      return;
    }
    pessoaSelecionada = pessoa;
    mostrarFicha(pessoa);
  } catch (erro) {
    mostrarAlerta(alertaBusca, 'error', 'Falha ao conectar com o servidor.');
  }
}

formBusca.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscarDados(campoBusca.value);
});

// 2) Confirma e envia o DELETE
btnExcluir.addEventListener('click', async () => {
  if (!pessoaSelecionada) return;
  btnExcluir.disabled = true;

  try {
    const resposta = await fetch(`${API}/${pessoaSelecionada.id}`, { method: 'DELETE' });
    if (!resposta.ok) throw new Error('Erro ao excluir.');

    const nome = `${pessoaSelecionada.nome} ${pessoaSelecionada.sobrenome}`;
    const cpf = pessoaSelecionada.cpf;
    esconderFicha();
    campoBusca.value = '';
    history.replaceState(null, '', '/delete/');
    mostrarAlerta(alerta, 'success',
      `${escaparHTML(nome)} (CPF ${escaparHTML(cpf)}) foi excluído(a). <a href="/get/">Ver lista</a>`);
  } catch (erro) {
    mostrarAlerta(alerta, 'error', 'Não foi possível excluir. Tente novamente.');
  } finally {
    btnExcluir.disabled = false;
  }
});

document.getElementById('btn-cancelar').addEventListener('click', () => {
  esconderFicha();
  campoBusca.value = '';
  campoBusca.focus();
});

// Veio da listagem com ?cpf=...? Já busca o cadastro.
const cpfURL = parametroURL('cpf');
if (cpfURL) {
  campoBusca.value = formatarCPF(cpfURL);
  buscarDados(cpfURL);
}
