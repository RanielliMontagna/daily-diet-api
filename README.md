# Daily Diet Api

## 🚧 Status do Projeto - Em desenvolvimento 🚧

## 📖 Sobre

O Daily Diet Api é uma API RESTful que tem como objetivo auxiliar no controle de dieta diária de um usuário.

## 📏 Regras da aplicação

- Deve ser possível criar um usuário
- Deve ser possível identificar o usuário entre as requisições
- Deve ser possível registrar uma refeição feita, com as seguintes informações:
    - Nome
    - Descrição
    - Data e Hora
    - Está dentro ou não da dieta
    - Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- Deve ser possível apagar uma refeição
- Deve ser possível listar todas as refeições de um usuário
- Deve ser possível visualizar uma única refeição
- Deve ser possível recuperar as métricas de um usuário
    - Quantidade total de refeições registradas
    - Quantidade total de refeições dentro da dieta
    - Quantidade total de refeições fora da dieta
    - Melhor sequência por dia de refeições dentro da dieta
- O usuário só pode visualizar, editar e apagar as refeições o qual ele criou

## 🚀 Tecnologias

- [NodeJS](https://nodejs.org/en/) - Interpretador de JavaScript assíncrono com código aberto orientado a eventos.
- [Fastify](https://www.fastify.io/) - Um framework web rápido e de baixo acoplamento para Node.js.
- [Knex](http://knexjs.org/) - Um construtor de consultas SQL para Postgres, MSSQL, MySQL, MariaDB, SQLite3, Oracle, e Amazon Redshift.
- [Sqlite3](https://www.sqlite.org/index.html) - Um banco de dados SQL embutido.
- [Typescript](https://www.typescriptlang.org/) - Um superconjunto de JavaScript que adiciona tipagem estática e alguns outros recursos a linguagem.

## 📦 Instalação

```bash
# Clone o repositório
$ git clone

# Entre na pasta do projeto
$ cd daily-diet-api

# Instale as dependências
$ yarn ou npm install

# Execute as migrations
$ yarn knex:migrate ou npm run knex:migrate

# Inicie o servidor
$ yarn dev ou npm run dev

# O servidor inciará por padrão na porta:3333 - acesse http://localhost:3333
```

#### 🖊️ Autor - [@raniellimontagna](https://www.github.com/raniellimontagna)

