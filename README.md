# 📌 Descrição da Aplicação
Esta aplicação consiste em uma API RESTful para gerenciar prioridades de forma simples e intuitiva para a Phonevox Group.

Atualmente, a equipe de suporte precisa acessar o servidor via SSH, navegar até o diretório de configuração de prioridades, localizar a linha desejada, copiar e colar a entrada anterior, alterar o nome do tronco e, por fim, executar um dialplan reload.

## 🎯 Objetivo
Automatizar esse processo, eliminando a necessidade de edições manuais, tornando-o mais rápido e menos propenso a erros.

## 🔹 Código Original
```bash
same => n,ExecIf($["${COMPANY}"="ID-CONTRATO-EMPRESA"]?Set(QUEUE_PRIO=5))
```

## 🔹 Nova Implementação
```bash
same => n,NoOp(-- INICIANDO BUSCA DE PRIORIDADE --)
same => n,AGI(script.php) ; Um script PHP que faz uma requisição e define uma variável no Asterisk.
same => n,ExecIf($["${RES_PRIORITY}"=""]?Set(QUEUE_PRIO=1):Set(QUEUE_PRIO=${RES_PRIORITY}))
```
✅ Com essa abordagem, a prioridade será definida dinamicamente por meio de uma requisição à API, tornando o sistema mais flexível e fácil de manter.

## 🚀 Instalação e Configuração
Para replicar este código no servidor, siga os passos abaixo:

Primeiramente crie a tabela que será utilizada para armazenar as prioridades que serão geradas pela API
Acesse seu mysql e dentro do database asterisk, crie a tabela:
```msysql
CREATE TABLE priorities_api (
    id           CHAR(36) NOT NULL PRIMARY KEY,  -- UUIDv7 com 36 caracteres
    trunk        VARCHAR(255) NOT NULL UNIQUE,   -- Garante que o trunk seja único
    priority     INT NOT NULL DEFAULT 1,         -- Valor padrão de 1 para prioridade
    start_date   DATETIME NOT NULL,              -- Data e hora de início
    end_date     DATETIME NULL,                  -- Data e hora de término (pode ser nula)
    created_date DATETIME NOT NULL               -- Data e hora de criação
);
```

## 1️ Clone o repositório
`git clone https://github.com/rafaelRizzo/api-priority-asterisk`

## 2️ Instale as dependências
`npm install`

## 2️ Instale as dependências
`npx prisma generate`

## 3️ Configure o .env do projeto e execute:
`npm run dev`

# ⚠️ IMPORTANTE: NÃO EXECUTE prisma migrate ou prisma push!
O banco de dados já está em produção e não queremos modificar sua estrutura, apenas complementá-lo com nossa aplicação.

# ℹ️ Observação Técnica
Os campos de data não foram configurados com CURRENT_TIMESTAMP devido à versão antiga do banco de dados.
Para manter baixa latência na leitura e inserção, as operações serão executadas no mesmo servidor onde o script está rodando.
O código será responsável por inserir manualmente as datas conforme necessário.

