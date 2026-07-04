# Biblioteca Inteligente (front-end)

Front-end do projeto **MVP Biblioteca Inteligente**, desenvolvido com HTML, CSS e JavaScript puro, sem uso de frameworks como React, Angular ou Vue.

A aplicação funciona como uma SPA simples, permitindo navegar entre as telas de resumo, livros, cadastro, reservas e configuração da API sem recarregar a página.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- Fetch API
- LocalStorage

## Funcionalidades

- Dashboard com resumo do acervo
- Listagem de livros em cards
- Filtro de livros por busca, status e categoria
- Cadastro de novos livros
- Visualização de detalhes de um livro
- Edição de livros
- Exclusão de livros
- Criação de reservas
- Cancelamento de reservas
- Configuração da URL da API pelo próprio front-end

## Estrutura dos arquivos

```text
frontend/
├── index.html
├── style.css
├── app.js
└── README.md
````

## Como rodar

Antes de abrir o front-end, deixe o back-end rodando.

No back-end, a API deve estar disponível em:

```text
http://127.0.0.1:5000/api
```

Depois, basta abrir o arquivo:

```text
index.html
```

diretamente no navegador.

Não é necessário instalar dependências, configurar servidor local ou usar extensões.

## Configuração da API

Por padrão, o front-end chama a API em:

```text
http://127.0.0.1:5000/api
```

Caso a API esteja rodando em outro endereço, acesse a tela **Configuração** dentro da aplicação e altere a URL da API.

A URL configurada fica salva no `localStorage` do navegador.

## Rotas da API utilizadas

O front-end realiza chamadas para as principais rotas do back-end:

* `GET /api/health`
* `GET /api/estatisticas`
* `GET /api/livros`
* `GET /api/livros/{id}`
* `POST /api/livros`
* `PUT /api/livros/{id}`
* `DELETE /api/livros/{id}`
* `GET /api/reservas`
* `POST /api/reservas`
* `PATCH /api/reservas/{id}/cancelar`

## Telas da aplicação

### Início

Mostra um resumo geral do sistema, incluindo:

* Total de livros cadastrados
* Total de reservas
* Total de livros disponíveis
* Livros por status
* Livros por categoria

### Livros

Exibe os livros cadastrados em formato de cards.

Também permite filtrar os livros por:

* Texto de busca
* Status
* Categoria

### Cadastrar

Tela com formulário para cadastrar novos livros informando:

* Título
* Autor
* Categoria
* Status

### Reservas

Tela para criar uma reserva de livro disponível e listar as reservas já cadastradas.

Também permite cancelar uma reserva ativa.

### Configuração

Tela usada para alterar a URL da API, caso seja necessário.

## Observação

Este front-end foi desenvolvido com JavaScript puro para atender ao requisito do projeto, que solicita uma SPA sem o uso de frameworks JavaScript baseados em SPA.

A aplicação deve ser executada abrindo o `index.html` diretamente no navegador.
