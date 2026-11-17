
import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:3000/api';

function App() {
  const [aba, setAba] = useState('produtos');
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const [produto, setProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    codigo_barras: ''
  });
  const [fornecedor, setFornecedor] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    contato: ''
  });

  const [produtoEditando, setProdutoEditando] = useState(null);
  const [fornecedorEditando, setFornecedorEditando] = useState(null);

  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [filtroAssociacao, setFiltroAssociacao] = useState('produto');

  async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(`${API}${url}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers
      }
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      throw new Error(dados.erro || dados.mensagem || 'Não foi possível realizar a operação.');
    }

    return dados;
  }

  async function carregarProdutos() {
    const dados = await requisicao('/produtos');
    setProdutos(Array.isArray(dados) ? dados : dados.produtos || []);
  }

  async function carregarFornecedores() {
    const dados = await requisicao('/fornecedores');
    setFornecedores(Array.isArray(dados) ? dados : dados.fornecedores || []);
  }

  async function carregarDados() {
    try {
      await Promise.all([carregarProdutos(), carregarFornecedores()]);
      setErro('');
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function avisar(texto) {
    setMensagem(texto);
    setErro('');
    setTimeout(() => setMensagem(''), 4000);
  }

  async function salvarProduto(e) {
    e.preventDefault();

    try {
      const dados = {
        ...produto,
        preco: Number(produto.preco)
      };

      if (produtoEditando) {
        await requisicao(`/produtos/${produtoEditando}`, {
          method: 'PUT',
          body: JSON.stringify(dados)
        });
        avisar('Produto atualizado com sucesso!');
      } else {
        await requisicao('/produtos', {
          method: 'POST',
          body: JSON.stringify(dados)
        });
        avisar('Produto cadastrado com sucesso!');
      }

      setProduto({ nome: '', descricao: '', preco: '', codigo_barras: '' });
      setProdutoEditando(null);
      await carregarProdutos();
    } catch (e) {
      setErro(e.message);
    }
  }

  function editarProduto(item) {
    setProduto({
      nome: item.nome || '',
      descricao: item.descricao || '',
      preco: item.preco ?? '',
      codigo_barras: item.codigo_barras || ''
    });
    setProdutoEditando(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluirProduto(id) {
    if (!window.confirm('Deseja realmente excluir este produto?')) return;

    try {
      await requisicao(`/produtos/${id}`, { method: 'DELETE' });
      avisar('Produto excluído com sucesso!');
      await carregarProdutos();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function salvarFornecedor(e) {
    e.preventDefault();

    try {
      if (fornecedorEditando) {
        await requisicao(`/fornecedores/${fornecedorEditando}`, {
          method: 'PUT',
          body: JSON.stringify(fornecedor)
        });
        avisar('Fornecedor atualizado com sucesso!');
      } else {
        await requisicao('/fornecedores', {
          method: 'POST',
          body: JSON.stringify(fornecedor)
        });
        avisar('Fornecedor cadastrado com sucesso!');
      }

      setFornecedor({ nome: '', cnpj: '', endereco: '', contato: '' });
      setFornecedorEditando(null);
      await carregarFornecedores();
    } catch (e) {
      setErro(e.message);
    }
  }

  function editarFornecedor(item) {
    setFornecedor({
      nome: item.nome || '',
      cnpj: item.cnpj || '',
      endereco: item.endereco || '',
      contato: item.contato || ''
    });
    setFornecedorEditando(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluirFornecedor(id) {
    if (!window.confirm('Deseja realmente excluir este fornecedor?')) return;

    try {
      await requisicao(`/fornecedores/${id}`, { method: 'DELETE' });
      avisar('Fornecedor excluído com sucesso!');
      await carregarFornecedores();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function associar() {
    if (!produtoSelecionado || !fornecedorSelecionado) {
      setErro('Selecione um produto e um fornecedor.');
      return;
    }

    try {
      await requisicao('/associacoes', {
        method: 'POST',
        body: JSON.stringify({
          produto_id: Number(produtoSelecionado),
          fornecedor_id: Number(fornecedorSelecionado)
        })
      });

      avisar('Associação realizada com sucesso!');
      consultarAssociacoes();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function consultarAssociacoes() {
    if (filtroAssociacao === 'produto' && !produtoSelecionado) {
      setErro('Selecione um produto para consultar.');
      return;
    }

    if (filtroAssociacao === 'fornecedor' && !fornecedorSelecionado) {
      setErro('Selecione um fornecedor para consultar.');
      return;
    }

    try {
      const url = filtroAssociacao === 'produto'
        ? `/associacoes/produto/${produtoSelecionado}`
        : `/associacoes/fornecedor/${fornecedorSelecionado}`;

      const dados = await requisicao(url);
      setAssociacoes(Array.isArray(dados) ? dados : []);
      setErro('');
    } catch (e) {
      setErro(e.message);
    }
  }

  async function desassociar(produtoId, fornecedorId) {
    if (!window.confirm('Deseja remover esta associação?')) return;

    try {
      await requisicao(`/associacoes/${produtoId}/${fornecedorId}`, {
        method: 'DELETE'
      });
      avisar('Associação removida com sucesso!');
      consultarAssociacoes();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div className="app">
      <header className="topo">
        <div className="topo-conteudo">
          <div>
            <span className="marca">PROJETO INTEGRADOR</span>
            <h1>Gestão de Produtos e Fornecedores</h1>
            <p>Sistema de gerenciamento e associação de cadastros</p>
          </div>
          <div className="identificacao">GRAN</div>
        </div>
      </header>

      <main className="container">
        <nav className="menu">
          <button className={aba === 'produtos' ? 'ativo' : ''} onClick={() => setAba('produtos')}>
            Produtos
          </button>
          <button className={aba === 'fornecedores' ? 'ativo' : ''} onClick={() => setAba('fornecedores')}>
            Fornecedores
          </button>
          <button className={aba === 'associacoes' ? 'ativo' : ''} onClick={() => setAba('associacoes')}>
            Associações
          </button>
        </nav>

        {mensagem && <div className="alerta sucesso">{mensagem}</div>}
        {erro && <div className="alerta erro">{erro}</div>}

        {aba === 'produtos' && (
          <section>
            <div className="titulo-secao">
              <div>
                <h2>Cadastro de Produtos</h2>
                <p>Cadastre, consulte, edite e exclua produtos.</p>
              </div>
              <span className="contador">{produtos.length} produto(s)</span>
            </div>

            <form className="formulario" onSubmit={salvarProduto}>
              <h3>{produtoEditando ? 'Editar produto' : 'Novo produto'}</h3>
              <div className="grade-form">
                <label>Nome do produto
                  <input required value={produto.nome} onChange={e => setProduto({ ...produto, nome: e.target.value })} placeholder="Ex.: Notebook Dell" />
                </label>
                <label>Descrição
                  <input value={produto.descricao} onChange={e => setProduto({ ...produto, descricao: e.target.value })} placeholder="Descrição do produto" />
                </label>
                <label>Preço
                  <input required type="number" min="0" step="0.01" value={produto.preco} onChange={e => setProduto({ ...produto, preco: e.target.value })} placeholder="0,00" />
                </label>
                <label>Código de barras
                  <input required value={produto.codigo_barras} onChange={e => setProduto({ ...produto, codigo_barras: e.target.value })} placeholder="Código de barras" />
                </label>
              </div>
              <div className="acoes-form">
                <button className="botao primario" type="submit">{produtoEditando ? 'Salvar alterações' : 'Cadastrar produto'}</button>
                {produtoEditando && <button className="botao secundario" type="button" onClick={() => { setProdutoEditando(null); setProduto({ nome: '', descricao: '', preco: '', codigo_barras: '' }); }}>Cancelar</button>}
              </div>
            </form>

            <div className="tabela-container">
              <h3>Produtos cadastrados</h3>
              <table>
                <thead>
                  <tr><th>Nome</th><th>Descrição</th><th>Preço</th><th>Código de barras</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {produtos.map(item => (
                    <tr key={item.id}>
                      <td>{item.nome}</td>
                      <td>{item.descricao || '-'}</td>
                      <td>{Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td>{item.codigo_barras}</td>
                      <td className="acoes">
                        <button className="botao pequeno secundario" onClick={() => editarProduto(item)}>Editar</button>
                        <button className="botao pequeno perigo" onClick={() => excluirProduto(item.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                  {produtos.length === 0 && <tr><td colSpan="5" className="vazio">Nenhum produto cadastrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {aba === 'fornecedores' && (
          <section>
            <div className="titulo-secao">
              <div>
                <h2>Cadastro de Fornecedores</h2>
                <p>Gerencie os dados dos fornecedores.</p>
              </div>
              <span className="contador">{fornecedores.length} fornecedor(es)</span>
            </div>

            <form className="formulario" onSubmit={salvarFornecedor}>
              <h3>{fornecedorEditando ? 'Editar fornecedor' : 'Novo fornecedor'}</h3>
              <div className="grade-form">
                <label>Nome do fornecedor
                  <input required value={fornecedor.nome} onChange={e => setFornecedor({ ...fornecedor, nome: e.target.value })} placeholder="Nome do fornecedor" />
                </label>
                <label>CNPJ
                  <input required value={fornecedor.cnpj} onChange={e => setFornecedor({ ...fornecedor, cnpj: e.target.value })} placeholder="CNPJ" />
                </label>
                <label>Endereço
                  <input value={fornecedor.endereco} onChange={e => setFornecedor({ ...fornecedor, endereco: e.target.value })} placeholder="Endereço" />
                </label>
                <label>Contato
                  <input value={fornecedor.contato} onChange={e => setFornecedor({ ...fornecedor, contato: e.target.value })} placeholder="Telefone ou e-mail" />
                </label>
              </div>
              <div className="acoes-form">
                <button className="botao primario" type="submit">{fornecedorEditando ? 'Salvar alterações' : 'Cadastrar fornecedor'}</button>
                {fornecedorEditando && <button className="botao secundario" type="button" onClick={() => { setFornecedorEditando(null); setFornecedor({ nome: '', cnpj: '', endereco: '', contato: '' }); }}>Cancelar</button>}
              </div>
            </form>

            <div className="tabela-container">
              <h3>Fornecedores cadastrados</h3>
              <table>
                <thead>
                  <tr><th>Nome</th><th>CNPJ</th><th>Endereço</th><th>Contato</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {fornecedores.map(item => (
                    <tr key={item.id}>
                      <td>{item.nome}</td>
                      <td>{item.cnpj}</td>
                      <td>{item.endereco || '-'}</td>
                      <td>{item.contato || '-'}</td>
                      <td className="acoes">
                        <button className="botao pequeno secundario" onClick={() => editarFornecedor(item)}>Editar</button>
                        <button className="botao pequeno perigo" onClick={() => excluirFornecedor(item.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                  {fornecedores.length === 0 && <tr><td colSpan="5" className="vazio">Nenhum fornecedor cadastrado.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {aba === 'associacoes' && (
          <section>
            <div className="titulo-secao">
              <div>
                <h2>Associação de Produtos e Fornecedores</h2>
                <p>Vincule produtos aos seus respectivos fornecedores.</p>
              </div>
            </div>

            <div className="formulario">
              <h3>Nova associação</h3>
              <div className="grade-form">
                <label>Produto
                  <select value={produtoSelecionado} onChange={e => setProdutoSelecionado(e.target.value)}>
                    <option value="">Selecione um produto</option>
                    {produtos.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>
                </label>
                <label>Fornecedor
                  <select value={fornecedorSelecionado} onChange={e => setFornecedorSelecionado(e.target.value)}>
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>
                </label>
              </div>
              <div className="acoes-form">
                <button className="botao primario" onClick={associar}>Associar produto e fornecedor</button>
              </div>
            </div>

            <div className="formulario consulta">
              <h3>Consultar associações</h3>
              <div className="grade-form">
                <label>Consultar por
                  <select value={filtroAssociacao} onChange={e => { setFiltroAssociacao(e.target.value); setAssociacoes([]); }}>
                    <option value="produto">Produto</option>
                    <option value="fornecedor">Fornecedor</option>
                  </select>
                </label>
                <div className="campo-consulta">
                  <label>{filtroAssociacao === 'produto' ? 'Produto' : 'Fornecedor'}
                    {filtroAssociacao === 'produto' ? (
                      <select value={produtoSelecionado} onChange={e => setProdutoSelecionado(e.target.value)}>
                        <option value="">Selecione um produto</option>
                        {produtos.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
                      </select>
                    ) : (
                      <select value={fornecedorSelecionado} onChange={e => setFornecedorSelecionado(e.target.value)}>
                        <option value="">Selecione um fornecedor</option>
                        {fornecedores.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
                      </select>
                    )}
                  </label>
                </div>
              </div>
              <button className="botao secundario" onClick={consultarAssociacoes}>Consultar</button>

              <div className="lista-associacoes">
                {associacoes.map(item => (
                  <div className="item-associacao" key={`${item.produto_id || produtoSelecionado}-${item.fornecedor_id || fornecedorSelecionado}-${item.id || item.nome}`}>
                    <div>
                      <strong>{item.nome}</strong>
                      <span>{filtroAssociacao === 'produto' ? 'Fornecedor associado' : 'Produto associado'}</span>
                    </div>
                    <button
                      className="botao pequeno perigo"
                      onClick={() => desassociar(
                        filtroAssociacao === 'produto' ? Number(produtoSelecionado) : Number(item.id),
                        filtroAssociacao === 'produto' ? Number(item.id) : Number(fornecedorSelecionado)
                      )}
                    >
                      Desassociar
                    </button>
                  </div>
                ))}
                {associacoes.length === 0 && <p className="vazio">Nenhuma associação exibida. Selecione um registro e clique em Consultar.</p>}
              </div>
            </div>
          </section>
        )}

        <footer>Projeto Integrador GRAN · Gestão de Produtos e Fornecedores</footer>
      </main>
    </div>
  );
}

export default App;
