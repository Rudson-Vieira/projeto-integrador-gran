
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(
    path.join(__dirname, '../../database.sqlite')
);

// Ativar integridade referencial
db.pragma('foreign_keys = ON');

// Criar tabelas
db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco REAL NOT NULL CHECK (preco >= 0),
        codigo_barras TEXT NOT NULL UNIQUE,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cnpj TEXT NOT NULL UNIQUE,
        endereco TEXT NOT NULL,
        contato TEXT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS produto_fornecedor (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER NOT NULL,
        fornecedor_id INTEGER NOT NULL,

        FOREIGN KEY (produto_id)
            REFERENCES produtos(id) ON DELETE CASCADE,

        FOREIGN KEY (fornecedor_id)
            REFERENCES fornecedores(id) ON DELETE CASCADE,

        UNIQUE (produto_id, fornecedor_id)
    );

    CREATE INDEX IF NOT EXISTS idx_associacao_produto
    ON produto_fornecedor(produto_id);

    CREATE INDEX IF NOT EXISTS idx_associacao_fornecedor
    ON produto_fornecedor(fornecedor_id);
`);

console.log('Banco de dados SQLite inicializado!');

module.exports = db;
