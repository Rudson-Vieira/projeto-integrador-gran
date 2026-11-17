
const db = require('../database/database');

// Cadastrar produto
exports.criar = (req, res) => {
    try {
        const { nome, descricao, preco, codigo_barras } = req.body;

        if (!nome || preco === undefined || !codigo_barras) {
            return res.status(400).json({
                erro: 'Nome, preço e código de barras são obrigatórios.'
            });
        }

        if (!Number.isFinite(preco) || preco < 0) {
            return res.status(400).json({
                erro: 'O preço deve ser um número válido e não negativo.'
            });
        }

        const resultado = db.prepare(`
            INSERT INTO produtos (nome, descricao, preco, codigo_barras)
            VALUES (?, ?, ?, ?)
        `).run(nome.trim(), descricao || null, preco, codigo_barras.trim());

        const produto = db.prepare(
            'SELECT * FROM produtos WHERE id = ?'
        ).get(resultado.lastInsertRowid);

        return res.status(201).json(produto);

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Já existe um produto com esse código de barras.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao cadastrar produto.'
        });
    }
};

// Listar todos os produtos
exports.listar = (req, res) => {
    try {
        const produtos = db.prepare(
            'SELECT * FROM produtos ORDER BY id DESC'
        ).all();

        return res.status(200).json(produtos);

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao consultar produtos.'
        });
    }
};

// Consultar produto por ID
exports.buscarPorId = (req, res) => {
    try {
        const produto = db.prepare(
            'SELECT * FROM produtos WHERE id = ?'
        ).get(req.params.id);

        if (!produto) {
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        return res.status(200).json(produto);

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao consultar produto.'
        });
    }
};

// Atualizar produto
exports.atualizar = (req, res) => {
    try {
        const { nome, descricao, preco, codigo_barras } = req.body;
        const { id } = req.params;

        if (!nome || preco === undefined || !codigo_barras) {
            return res.status(400).json({
                erro: 'Nome, preço e código de barras são obrigatórios.'
            });
        }

        if (!Number.isFinite(preco) || preco < 0) {
            return res.status(400).json({
                erro: 'O preço deve ser um número válido e não negativo.'
            });
        }

        const resultado = db.prepare(`
            UPDATE produtos
            SET nome = ?, descricao = ?, preco = ?, codigo_barras = ?
            WHERE id = ?
        `).run(nome.trim(), descricao || null, preco,
            codigo_barras.trim(), id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        const produto = db.prepare(
            'SELECT * FROM produtos WHERE id = ?'
        ).get(id);

        return res.status(200).json(produto);

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Já existe outro produto com esse código de barras.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao atualizar produto.'
        });
    }
};

// Excluir produto
exports.excluir = (req, res) => {
    try {
        const resultado = db.prepare(
            'DELETE FROM produtos WHERE id = ?'
        ).run(req.params.id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Produto excluído com sucesso.'
        });

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao excluir produto.'
        });
    }
};
