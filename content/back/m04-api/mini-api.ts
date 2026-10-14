/**
 * "Express de bolso" usado nos exercícios do módulo back.m04 (vai em `extraFiles` como `mini-api.js`).
 * Não existe servidor HTTP no simulador: `await app.handle(req)` faz o papel de "chegou um pedido".
 */
export const MINI_API = `// mini-api.js: um "Express de bolso" para treinar sem servidor de verdade.
// app.get/post/put/delete(caminho, handler) registram rotas; app.use(fn) registra um middleware.
// await app.handle({ method, path, query, headers, body }) "recebe" um pedido e devolve { status, body }.

function casarRota(padrao, caminho) {
  const partesPadrao = padrao.split('/').filter(Boolean);
  const partesCaminho = caminho.split('/').filter(Boolean);
  if (partesPadrao.length !== partesCaminho.length) return null;
  const params = {};
  for (let i = 0; i < partesPadrao.length; i++) {
    if (partesPadrao[i].startsWith(':')) params[partesPadrao[i].slice(1)] = partesCaminho[i];
    else if (partesPadrao[i] !== partesCaminho[i]) return null;
  }
  return params;
}

function criarApp() {
  const camadas = [];
  const rota = (method) => (caminho, handler) => {
    camadas.push({ method, caminho, handler });
  };

  async function handle(pedido) {
    const req = {
      method: pedido.method || 'GET',
      path: pedido.path || '/',
      query: pedido.query || {},
      headers: pedido.headers || {},
      body: pedido.body,
      params: {},
    };
    const res = {
      statusCode: 200,
      body: undefined,
      enviado: false,
      status(codigo) {
        this.statusCode = codigo;
        return this;
      },
      json(dados) {
        this.body = dados;
        this.enviado = true;
        return this;
      },
      end() {
        this.body = null;
        this.enviado = true;
        return this;
      },
    };

    let indice = 0;
    let acabouAFila = false;
    const pendentes = [];

    async function rodarProxima() {
      const camada = camadas[indice++];
      if (!camada) {
        acabouAFila = true;
        return;
      }
      if (camada.method) {
        const params = camada.method === req.method ? casarRota(camada.caminho, req.path) : null;
        if (!params) return next();
        req.params = params;
      }
      await camada.handler(req, res, next);
    }

    function next() {
      const promessa = rodarProxima();
      promessa.catch(() => {}); // o erro não se perde: ele estoura no await lá embaixo
      pendentes.push(promessa);
      return promessa;
    }

    next();
    for (let k = 0; k < pendentes.length; k++) await pendentes[k];

    if (res.enviado) return { status: res.statusCode, body: res.body };
    if (acabouAFila) {
      return { status: 404, body: { erro: 'Rota não encontrada: ' + req.method + ' ' + req.path } };
    }
    return { status: 504, body: { erro: 'Ninguém respondeu (algum middleware esqueceu de chamar next?)' } };
  }

  return {
    use(handler) {
      camadas.push({ handler });
    },
    get: rota('GET'),
    post: rota('POST'),
    put: rota('PUT'),
    delete: rota('DELETE'),
    handle,
  };
}

module.exports = { criarApp };
`;
