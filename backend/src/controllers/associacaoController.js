
const db = require('../database/database');

// Associar produto a fornecedor
exports.associar = (req, res) => {
    try {
        const { produto_id, fornecedor_id } = req.body;

        if (!Number.isInteger(produto_id) || !Number.isInteger(fornecedor_id)) {
            return res.status(400).json({
                erro: 'Informe os IDs válidos do produto e fornecedor.'
            });
        }

        const produto = db.prepare(
            'SELECT id FROM produtos WHERE id = ?'
        ).get(produto_id);

        if (!produto) {
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        const fornecedor = db.prepare(
            'SELECT id FROM fornecedores WHERE id = ?'
        ).get(fornecedor_id);

        if (!fornecedor) {
            return res.status(404).json({
                erro: 'Fornecedor não encontrado.'
            });
        }

        db.prepare(`
            INSERT INTO produto_fornecedor (produto_id, fornecedor_id)
            VALUES (?, ?)
        `).run(produto_id, fornecedor_id);

        return res.status(201).json({
            mensagem: 'Produto associado ao fornecedor com sucesso.'
        });

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Este produto já está associado a este fornecedor.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao associar produto ao fornecedor.'
        });
    }
};

// Desassociar produto e fornecedor
exports.desassociar = (req, res) => {
    try {
        const { produto_id, fornecedor_id } = req.params;

        const resultado = db.prepare(`
            DELETE FROM produto_fornecedor
            WHERE produto_id = ? AND fornecedor_id = ?
        `).run(produto_id, fornecedor_id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Associação não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Associação removida com sucesso.'
        });

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao remover associação.'
        });
    }
};

// Consultar fornecedores de um produto
exports.listarPorProduto = (req, res) => {
    try {
        const fornecedores = db.prepare(`
            SELECT f.*
            FROM fornecedores f
            INNER JOIN produto_fornecedor pf
            ON f.id = pf.fornecedor_id
            WHERE pf.produto_id = ?
        `).all(req.params.produto_id);

        return res.status(200).json(fornecedores);

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao consultar fornecedores do produto.'
        });
    }
};

// Consultar produtos de um fornecedor
exports.listarPorFornecedor = (req, res) => {
    try {
        const produtos = db.prepare(`
            SELECT p.*
            FROM produtos p
            INNER JOIN produto_fornecedor pf
            ON p.id = pf.produto_id
            WHERE pf.fornecedor_id = ?
        `).all(req.params.fornecedor_id);

        return res.status(200).json(produtos);

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao consultar produtos do fornecedor.'
        });
    }
};
