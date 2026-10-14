/**
 * "Express de bolso" tipado, usado nos exercícios TypeScript do módulo fullstack.m01 (vai em `extraFiles`
 * como `mini-api.ts`). Não existe servidor HTTP no simulador: `await app.handle(pedido)` faz o papel de
 * "chegou uma requisição". O corpo vai e volta como texto JSON, igual na rede de verdade.
 */
export const MINI_API = `// mini-api.ts: um "Express de bolso" tipado para treinar sem servidor de verdade.
// app.get/post/put/delete(caminho, handler) registram rotas. Diferente do Express, o handler
// DEVOLVE a resposta: return { status: 201, body: { ... } }.
// await app.handle({ method, path, headers, body }) "recebe" um pedido e devolve { status, body, headers }.
// Os cabeçalhos chegam no handler com o nome em minúsculas (req.headers.authorization).

export type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface Requisicao {
  method: Metodo;
  path: string;
  params: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
}

export interface Resposta<T = unknown> {
  status: number;
  body: T;
  headers?: Record<string, string>;
}

export type Handler = (req: Requisicao) => Resposta | Promise<Resposta>;

export interface PedidoHttp {
  method: Metodo;
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
}

function casarRota(padrao: string, caminho: string): Record<string, string> | null {
  const partesPadrao = padrao.split('/').filter(Boolean);
  const partesCaminho = caminho.split('/').filter(Boolean);
  if (partesPadrao.length !== partesCaminho.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < partesPadrao.length; i++) {
    const p = partesPadrao[i] ?? '';
    const c = partesCaminho[i] ?? '';
    if (p.startsWith(':')) params[p.slice(1)] = c;
    else if (p !== c) return null;
  }
  return params;
}

// Na rede só passa texto: o que não sobrevive a JSON.stringify/JSON.parse não chega do outro lado.
function viajarPelaRede(dados: unknown): unknown {
  return dados === undefined ? undefined : JSON.parse(JSON.stringify(dados));
}

export function criarApp() {
  const rotas: { method: Metodo; caminho: string; handler: Handler }[] = [];
  const registrar =
    (method: Metodo) =>
    (caminho: string, handler: Handler): void => {
      rotas.push({ method, caminho, handler });
    };

  async function handle(pedido: PedidoHttp): Promise<Resposta> {
    const headers: Record<string, string> = {};
    for (const [nome, valor] of Object.entries(pedido.headers ?? {})) headers[nome.toLowerCase()] = valor;
    for (const rota of rotas) {
      if (rota.method !== pedido.method) continue;
      const params = casarRota(rota.caminho, pedido.path);
      if (!params) continue;
      const req: Requisicao = {
        method: pedido.method,
        path: pedido.path,
        params,
        headers,
        body: viajarPelaRede(pedido.body),
      };
      try {
        const res = await rota.handler(req);
        return { status: res.status, body: viajarPelaRede(res.body), headers: res.headers ?? {} };
      } catch (erro) {
        console.error('O handler quebrou: ' + String(erro));
        return { status: 500, body: { erro: 'Erro interno no servidor' }, headers: {} };
      }
    }
    return {
      status: 404,
      body: { erro: 'Rota não encontrada: ' + pedido.method + ' ' + pedido.path },
      headers: {},
    };
  }

  return {
    get: registrar('GET'),
    post: registrar('POST'),
    put: registrar('PUT'),
    delete: registrar('DELETE'),
    handle,
  };
}
`;
