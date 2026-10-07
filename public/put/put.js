// =============================================================
//  PUT (Update) — busca pelo CPF e atualiza o cadastro
//  Rotas: GET /api/pessoas?cpf=...  ->  PUT /api/pessoas/:id
// =============================================================

const formBusca = document.getElementById('form-busca');
const campoBusca = document.getElementById('cpf-busca');
const alertaBusca = document.getElementById('alerta-busca');

const formEdicao = document.getElementById('form-edicao');
const camposEdicao = document.getElementById('campos-edicao');
const alerta = document.getElementById('alerta');

// Limpa e bloqueia o formulário de edição
function limparEdicao() {
  formEdicao.reset();
  formEdicao.elements.id.value = '';
  camposEdicao.disabled = true;
}

// 1) Busca a pessoa pelo CPF e preenche o formulário
async function buscarDados(cpf) {
  esconderAlerta(alertaBusca);
  esconderAlerta(alerta);
  limparEdicao();

  if (!cpfCompleto(cpf)) {
    mostrarAlerta(alertaBusca, 'error', 'Digite o CPF completo (11 dígitos).');
    return;
  }

  try {
    const pessoa = await buscarPorCPF(cpf);
    if (!pessoa) {
      mostrarAlerta(alertaBusca, 'error',
        `Pessoa não encontrada para o CPF ${escaparHTML(formatarCPF(cpf))}. <a href="/post/">Cadastrar</a>`);
      return;
    }

    preencherFormulario(formEdicao, pessoa);
    formEdicao.elements.id.value = pessoa.id;
    camposEdicao.disabled = false;
    mostrarAlerta(alertaBusca, 'success',
      `Cadastro de ${escaparHTML(pessoa.nome)} ${escaparHTML(pessoa.sobrenome)} carregado. Altere os campos abaixo.`);
    formEdicao.elements.nome.focus();
  } catch (erro) {
    mostrarAlerta(alertaBusca, 'error', 'Falha ao conectar com o servidor.');
  }
}

formBusca.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscarDados(campoBusca.value);
});

// 2) Envia o registro atualizado com PUT
formEdicao.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  esconderAlerta(alerta);
  if (!formEdicao.reportValidity()) return;

  const id = formEdicao.elements.id.value;
  const pessoa = lerFormulario(formEdicao);

  if (!cpfCompleto(pessoa.cpf)) {
    mostrarAlerta(alerta, 'error', 'Informe um CPF com 11 dígitos.');
    return;
  }

  const botao = formEdicao.querySelector('[type="submit"]');
  botao.disabled = true;

  try {
    // Se o CPF foi alterado, ele não pode pertencer a outra pessoa
    const dono = await buscarPorCPF(pessoa.cpf);
    if (dono && String(dono.id) !== String(id)) {
      mostrarAlerta(alerta, 'error',
        `O CPF ${escaparHTML(pessoa.cpf)} já pertence a ${escaparHTML(dono.nome)} ${escaparHTML(dono.sobrenome)}.`);
      return;
    }

    const resposta = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pessoa)
    });

    if (!resposta.ok) throw new Error('Erro ao atualizar.');
    const atualizada = await resposta.json();

    limparEdicao();
    campoBusca.value = '';
    esconderAlerta(alertaBusca);
    mostrarAlerta(alerta, 'success',
      `Cadastro de ${escaparHTML(atualizada.nome)} ${escaparHTML(atualizada.sobrenome)} atualizado. ` +
      `<a href="/get/?cpf=${encodeURIComponent(atualizada.cpf)}">Ver na lista</a>`);
  } catch (erro) {
    mostrarAlerta(alerta, 'error', 'Não foi possível salvar. Tente novamente.');
  } finally {
    botao.disabled = false;
  }
});

document.getElementById('btn-cancelar').addEventListener('click', () => {
  limparEdicao();
  esconderAlerta(alerta);
  esconderAlerta(alertaBusca);
  campoBusca.value = '';
  campoBusca.focus();
});

// Veio da página de listagem com ?cpf=...? Já busca o cadastro.
const cpfURL = parametroURL('cpf');
if (cpfURL) {
  campoBusca.value = formatarCPF(cpfURL);
  buscarDados(cpfURL);
}
