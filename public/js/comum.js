// =============================================================
//  Funções utilitárias compartilhadas por todas as páginas
//  (as operações do CRUD ficam em post/, get/, put/ e delete/)
// =============================================================

// Endereço da API do JSON Server (mesmo domínio do site)
const API = '/api/pessoas';

// Campos de cada registro (na ordem dos formulários)
const CAMPOS = [
  'cpf', 'nome', 'sobrenome', 'email', 'idade', 'telefone',
  'rua', 'bairro', 'cidade', 'estado', 'rg'
];

// ---------- Máscaras ----------

// Deixa só os números de um texto
function somenteNumeros(valor) {
  return String(valor || '').replace(/\D/g, '');
}

// 12345678900 -> 123.456.789-00
function formatarCPF(valor) {
  const n = somenteNumeros(valor).slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// 62999998888 -> (62) 99999-8888 | 6232221111 -> (62) 3222-1111
function formatarTelefone(valor) {
  const n = somenteNumeros(valor).slice(0, 11);
  if (n.length <= 2) return n.length ? `(${n}` : '';
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

// CPF completo = 11 dígitos
function cpfCompleto(valor) {
  return somenteNumeros(valor).length === 11;
}

// Aplica as máscaras automaticamente em inputs com data-mask
function aplicarMascaras() {
  document.querySelectorAll('[data-mask="cpf"]').forEach((input) => {
    input.addEventListener('input', () => { input.value = formatarCPF(input.value); });
  });
  document.querySelectorAll('[data-mask="telefone"]').forEach((input) => {
    input.addEventListener('input', () => { input.value = formatarTelefone(input.value); });
  });
}

// ---------- Formulário <-> objeto ----------

// Lê os campos do formulário e monta o objeto pessoa
function lerFormulario(form) {
  const pessoa = {};
  CAMPOS.forEach((campo) => {
    const valor = form.elements[campo].value.trim();
    pessoa[campo] = campo === 'idade' ? Number(valor) : valor;
  });
  pessoa.email = pessoa.email.toLowerCase();
  return pessoa;
}

// Preenche o formulário com os dados de uma pessoa
function preencherFormulario(form, pessoa) {
  CAMPOS.forEach((campo) => {
    if (form.elements[campo]) form.elements[campo].value = pessoa[campo] ?? '';
  });
}

// ---------- Busca por CPF (usada em GET, PUT e DELETE) ----------

// GET /api/pessoas?cpf=123.456.789-00 -> retorna a pessoa ou null
async function buscarPorCPF(cpf) {
  const resposta = await fetch(`${API}?cpf=${encodeURIComponent(formatarCPF(cpf))}`);
  if (!resposta.ok) throw new Error('Falha ao consultar o servidor.');
  const lista = await resposta.json();
  return lista.length ? lista[0] : null;
}

// ---------- Mensagens na tela ----------

function mostrarAlerta(elemento, tipo, html) {
  elemento.className = `alert ${tipo} show`;
  elemento.innerHTML = html;
}

function esconderAlerta(elemento) {
  elemento.className = 'alert';
  elemento.innerHTML = '';
}

// Evita que um texto digitado vire HTML na tela
function escaparHTML(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Lê um parâmetro da URL (ex.: /put/?cpf=123.456.789-00)
function parametroURL(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

document.addEventListener('DOMContentLoaded', aplicarMascaras);
