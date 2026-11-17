
const express = require('express');
const router = express.Router();

const associacaoController = require('../controllers/associacaoController');

// Associar produto a fornecedor
router.post('/', associacaoController.associar);

// Desassociar produto e fornecedor
router.delete('/:produto_id/:fornecedor_id', associacaoController.desassociar);

// Consultar fornecedores de um produto
router.get('/produto/:produto_id', associacaoController.listarPorProduto);

// Consultar produtos de um fornecedor
router.get('/fornecedor/:fornecedor_id', associacaoController.listarPorFornecedor);

module.exports = router;
