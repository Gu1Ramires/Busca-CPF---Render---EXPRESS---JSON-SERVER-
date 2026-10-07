// =============================================================
//  CRUD de Pessoas com Busca por CPF
//  Express (servidor das páginas) + JSON Server (banco db.json)
// =============================================================

const path = require('path');
const express = require('express');
const jsonServer = require('json-server');

// Instância do Express: é ela que sobe o servidor e serve as páginas HTML
const app = express();

// Porta: o Render informa a porta pela variável PORT; localmente usamos 3000
const porta = process.env.PORT || 3000;

// Roteador do JSON Server criado a partir do arquivo db.json
// Ele gera automaticamente as rotas GET, POST, PUT, PATCH e DELETE de /pessoas
const router = jsonServer.router(path.join(__dirname, 'db.json'));

// Middlewares padrão do JSON Server (logger, CORS, no-cache e leitura do corpo JSON)
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'public'),
  bodyParser: true
});

// 1) Express serve a pasta public (index.html, css, js e as pastas post/get/put/delete)
app.use(express.static(path.join(__dirname, 'public')));

// 2) Comunicação com o JSON Server: toda a API fica em /api
//    Ex.: GET /api/pessoas | GET /api/pessoas?cpf=123.456.789-00 | POST /api/pessoas
app.use('/api', middlewares, router);

// Rota principal: envia a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Qualquer rota inexistente volta para a página inicial
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
  console.log(`API do JSON Server em http://localhost:${porta}/api/pessoas`);
});
