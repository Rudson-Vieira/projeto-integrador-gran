
const express = require('express');
const cors = require('cors');

// Importar rotas
const produtoRoutes = require('./src/routes/produtoRoutes');
const fornecedorRoutes = require('./src/routes/fornecedorRoutes');
const associacaoRoutes = require('./src/routes/associacaoRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota inicial
app.get('/', (req, res) => {
    res.status(200).json({
        mensagem: 'API do Projeto Integrador GRAN funcionando!'
    });
});

// Rotas da aplicação
app.use('/api/produtos', produtoRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/associacoes', associacaoRoutes);

// Tratamento de rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada.'
    });
});

// Tratamento de erros
app.use((erro, req, res, next) => {
    console.error('Erro na aplicação:', erro);

    res.status(500).json({
        erro: 'Erro interno do servidor.'
    });
});

// Inicializar servidor
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/`);
});
