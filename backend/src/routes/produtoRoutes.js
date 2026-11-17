
const express = require('express');
const router = express.Router();

const produtoController = require('../controllers/produtoController');

// Cadastrar produto
router.post('/', produtoController.criar);

// Listar produtos
router.get('/', produtoController.listar);

// Consultar produto por ID
router.get('/:id', produtoController.buscarPorId);

// Atualizar produto
router.put('/:id', produtoController.atualizar);

// Excluir produto
router.delete('/:id', produtoController.excluir);

module.exports = router;
