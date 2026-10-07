# CRUD CPF — Express + JSON Server no Render

CRUD de pessoas com **busca por CPF**, feito com Node.js, Express e JSON Server.
Cada operação HTTP tem sua própria página e seu próprio script.

## Estrutura

```
crud-cpf-render/
├── server.js          # Express serve as páginas + JSON Server em /api
├── db.json            # banco de dados (coleção "pessoas")
├── package.json       # "start": "node server.js"
├── Dockerfile         # usado pelo Render (igual ao da apresentação)
└── public/
    ├── index.html     # página inicial com links para as 4 operações
    ├── css/style.css  # estilo de todas as páginas
    ├── js/comum.js    # funções compartilhadas (máscaras, busca por CPF, alertas)
    ├── post/          # POST   – index.html + post.js   (cadastrar)
    ├── get/           # GET    – index.html + get.js    (listar / buscar)
    ├── put/           # PUT    – index.html + put.js    (editar)
    └── delete/        # DELETE – index.html + delete.js (excluir)
```

Campos de cada registro: `cpf`, `nome`, `sobrenome`, `email`, `idade`, `telefone`,
`rua`, `bairro`, `cidade`, `estado`, `rg` (+ `id` gerado pelo JSON Server).

## Rotas da API

| Método | Rota                         | Uso                         |
|--------|------------------------------|-----------------------------|
| GET    | `/api/pessoas`               | lista todos                 |
| GET    | `/api/pessoas?cpf=000.000.000-00` | busca por CPF          |
| POST   | `/api/pessoas`               | cadastra                    |
| PUT    | `/api/pessoas/:id`           | atualiza                    |
| DELETE | `/api/pessoas/:id`           | exclui                      |

As páginas se comunicam entre si: na listagem, os botões **Editar** e **Excluir**
abrem `/put/?cpf=...` e `/delete/?cpf=...` já com a busca feita.

## Rodar localmente

```bash
npm install
node server.js
```

Acesse http://localhost:3000

> **Importante:** o `package.json` fixa `json-server` na versão **0.17.4**.
> Um `npm install json-server` sem versão instala a 1.0 (beta), que não tem
> `jsonServer.create()` / `jsonServer.router()` e quebra o servidor.

## Publicar no GitHub

1. Crie um repositório público (ex.: `crud-cpf-render`), sem README.
2. Envie os arquivos (pelo botão **Add file → Upload files** ou pelo terminal):

```bash
git init
git add .
git commit -m "CRUD com busca por CPF"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/crud-cpf-render.git
git push -u origin main
```

A pasta `node_modules` **não** vai para o GitHub (está no `.gitignore`).

## Deploy no Render

1. Em https://render.com → **New → Web Service** → escolha o repositório.
2. O Render detecta o `Dockerfile` (Language: **Docker**), igual à apresentação.
   - Se preferir sem Docker: Language **Node**, Build Command `npm install`,
     Start Command `node server.js`.
3. Instance Type: **Free** → **Deploy Web Service**.
4. Quando aparecer *Live*, o link público fica no topo (ex.: `https://crud-cpf-render.onrender.com`).

O servidor usa `process.env.PORT`, então funciona com a porta que o Render definir.

> No plano gratuito o disco é temporário: os registros criados voltam ao
> conteúdo original do `db.json` quando o serviço reinicia ou "dorme" por
> inatividade. O primeiro acesso depois de um tempo parado pode levar ~1 min.
