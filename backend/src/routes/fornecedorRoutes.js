
const express = require('express');
const router = express.Router();

const fornecedorController = require('../controllers/fornecedorController');

router.post('/', fornecedorController.criar);
router.get('/', fornecedorController.listar);
router.get('/:id', fornecedorController.buscarPorId);
router.put('/:id', fornecedorController.atualizar);
router.delete('/:id', fornecedorController.excluir);

module.exports = router;
