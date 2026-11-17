
const db = require('../database/database');

// Cadastrar fornecedor
exports.criar = (req, res) => {
    try {
        const { nome, cnpj, endereco, contato } = req.body;

        if (!nome || !cnpj || !endereco || !contato) {
            return res.status(400).json({
                erro: 'Todos os campos são obrigatórios.'
            });
        }

        const resultado = db.prepare(`
            INSERT INTO fornecedores (nome, cnpj, endereco, contato)
            VALUES (?, ?, ?, ?)
        `).run(
            nome.trim(),
            cnpj.trim(),
            endereco.trim(),
            contato.trim()
        );

        const fornecedor = db.prepare(
            'SELECT * FROM fornecedores WHERE id = ?'
        ).get(resultado.lastInsertRowid);

        return res.status(201).json(fornecedor);

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Já existe um fornecedor com esse CNPJ.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao cadastrar fornecedor.'
        });
    }
};

// Listar fornecedores
exports.listar = (req, res) => {
    try {
        const fornecedores = db.prepare(
            'SELECT * FROM fornecedores ORDER BY id DESC'
        ).all();

        return res.status(200).json(fornecedores);

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao consultar fornecedores.'
        });
    }
};

// Buscar fornecedor por ID
exports.buscarPorId = (req, res) => {
    try {
        const fornecedor = db.prepare(
            'SELECT * FROM fornecedores WHERE id = ?'
        ).get(req.params.id);

        if (!fornecedor) {
            return res.status(404).json({
                erro: 'Fornecedor não encontrado.'
            });
        }

        return res.status(200).json(fornecedor);

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao consultar fornecedor.'
        });
    }
};

// Atualizar fornecedor
exports.atualizar = (req, res) => {
    try {
        const { nome, cnpj, endereco, contato } = req.body;
        const { id } = req.params;

        if (!nome || !cnpj || !endereco || !contato) {
            return res.status(400).json({
                erro: 'Todos os campos são obrigatórios.'
            });
        }

        const resultado = db.prepare(`
            UPDATE fornecedores
            SET nome = ?, cnpj = ?, endereco = ?, contato = ?
            WHERE id = ?
        `).run(
            nome.trim(),
            cnpj.trim(),
            endereco.trim(),
            contato.trim(),
            id
        );

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Fornecedor não encontrado.'
            });
        }

        const fornecedor = db.prepare(
            'SELECT * FROM fornecedores WHERE id = ?'
        ).get(id);

        return res.status(200).json(fornecedor);

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Já existe outro fornecedor com esse CNPJ.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao atualizar fornecedor.'
        });
    }
};

// Excluir fornecedor
exports.excluir = (req, res) => {
    try {
        const resultado = db.prepare(
            'DELETE FROM fornecedores WHERE id = ?'
        ).run(req.params.id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Fornecedor não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Fornecedor excluído com sucesso.'
        });

    } catch (erro) {
        return res.status(500).json({
            erro: 'Erro ao excluir fornecedor.'
        });
    }
};
