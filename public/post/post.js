// =============================================================
//  POST (Create) — cadastra uma nova pessoa
//  Rota: POST /api/pessoas
// =============================================================

const formCadastro = document.getElementById('form-cadastro');
const alerta = document.getElementById('alerta');

formCadastro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  esconderAlerta(alerta);

  // Validação nativa do HTML (campos obrigatórios, e-mail, etc.)
  if (!formCadastro.reportValidity()) return;

  const pessoa = lerFormulario(formCadastro);

  if (!cpfCompleto(pessoa.cpf)) {
    mostrarAlerta(alerta, 'error', 'Informe um CPF com 11 dígitos.');
    return;
  }

  const botao = formCadastro.querySelector('[type="submit"]');
  botao.disabled = true;

  try {
    // O CPF é a chave de busca: não pode existir dois cadastros iguais
    const existente = await buscarPorCPF(pessoa.cpf);
    if (existente) {
      mostrarAlerta(alerta, 'error',
        `Já existe um cadastro com o CPF ${escaparHTML(pessoa.cpf)} (${escaparHTML(existente.nome)}). ` +
        `<a href="/put/?cpf=${encodeURIComponent(pessoa.cpf)}">Editar esse cadastro</a>`);
      return;
    }

    // Envia os dados para o JSON Server
    const resposta = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pessoa)
    });

    if (!resposta.ok) throw new Error('Erro ao cadastrar.');
    const criada = await resposta.json();

    // Limpa o formulário e mostra links para as outras páginas
    formCadastro.reset();
    mostrarAlerta(alerta, 'success',
      `${escaparHTML(criada.nome)} ${escaparHTML(criada.sobrenome)} cadastrado(a) com o ID ${criada.id}. ` +
      `<a href="/get/?cpf=${encodeURIComponent(criada.cpf)}">Ver na lista</a> · ` +
      `<a href="/put/?cpf=${encodeURIComponent(criada.cpf)}">Editar</a>`);
  } catch (erro) {
    mostrarAlerta(alerta, 'error', 'Não foi possível cadastrar. Verifique se o servidor está no ar e tente novamente.');
  } finally {
    botao.disabled = false;
  }
});

formCadastro.addEventListener('reset', () => esconderAlerta(alerta));
