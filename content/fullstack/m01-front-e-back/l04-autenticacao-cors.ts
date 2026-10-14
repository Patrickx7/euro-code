import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { MINI_API } from './mini-api';

export const lesson: Lesson = {
  id: 'fullstack.m01.l04',
  moduleId: 'fullstack.m01',
  order: 4,
  title: 'Autenticação simples e CORS',
  concepts: [
    'token no cabeçalho Authorization (Bearer)',
    '401 (quem é você?) e 403 (sei quem é, mas não pode)',
    'cookies e tokens (conceitual)',
    'senha nunca em texto puro: hash com sal (conceitual)',
    'não devolver dados sensíveis (DTO público)',
    'CORS: por que o navegador bloqueia',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Até aqui, qualquer um podia chamar qualquer rota. Para o painel de faturamento do cliente, isso não serve. O fluxo mais simples de **autenticação** é:

1. o usuário faz **login** (\`POST /api/login\` com e-mail e senha);
2. o back confere a senha e devolve um **token**: um texto comprido e impossível de adivinhar, tipo um crachá;
3. o front guarda o token e o manda em **toda** requisição, no cabeçalho \`Authorization: Bearer <token>\`;
4. o back lê o cabeçalho, descobre de quem é o token e decide se deixa passar.

## 401 ou 403?

Os dois são "não", mas por motivos diferentes, e o front reage diferente a cada um:

- **401 Unauthorized**: "não sei quem você é". Sem token, token inválido ou expirado. O front manda para o **login**.
- **403 Forbidden**: "sei quem você é, mas você **não pode**". O caixa tentando ver o faturamento. Fazer login de novo não resolve; o front mostra "sem permissão".`,
    },
    {
      kind: 'example',
      language: 'ts',
      code: `function usuarioDaRequisicao(req: Requisicao): Usuario | null {
  const cabecalho = req.headers.authorization; // "Bearer tok-abc123"
  if (!cabecalho || !cabecalho.startsWith('Bearer ')) return null;
  const token = cabecalho.slice('Bearer '.length);
  return sessoes[token] ?? null;
}

app.get('/api/relatorios', (req) => {
  const usuario = usuarioDaRequisicao(req);
  if (!usuario) return { status: 401, body: { erro: 'Faça login' } };
  if (usuario.papel !== 'gerente') return { status: 403, body: { erro: 'Sem permissão' } };
  return { status: 200, body: gerarRelatorio() };
});`,
      explanation:
        'Primeiro a pergunta "quem é você?" (401), depois "você pode?" (403). A ordem importa: sem saber quem é, não dá para checar permissão.',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<script>
  async function buscarRelatorios(token) {
    const resposta = await fetch('/api/relatorios', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (resposta.status === 401) return irParaLogin();
    if (resposta.status === 403) return avisar('Você não tem permissão para isso.');
    return resposta.json();
  }
</script>`,
      explanation: 'O front manda o crachá em toda requisição e trata o 401 e o 403 de jeitos diferentes.',
    },
    {
      kind: 'text',
      markdown: `## Cookie ou token no cabeçalho? (conceitual)

- **Cookie de sessão**: o back manda o cookie e o **navegador envia sozinho** em toda requisição para aquele site. Com a marcação \`HttpOnly\`, o JavaScript da página nem consegue lê-lo (bom contra roubo por script malicioso), mas, como vai sozinho, exige cuidado contra um site malicioso que faça requisições "em seu nome" (o tal do CSRF).
- **Token no cabeçalho**: só vai quando o **seu código** coloca no \`Authorization\`. Comum em apps e APIs. Se ficar guardado onde o JavaScript lê (como \`localStorage\`), um script malicioso injetado na página também lê.

Não existe opção mágica: cada uma tem seu cuidado. O importante é saber **por onde o crachá viaja**.

## Senha nunca em texto puro

O banco **nunca** guarda a senha como o usuário digitou. Guarda um **hash**: o resultado de uma função de mão única (dá para calcular, não dá para desfazer). No login, o back calcula o hash da senha digitada e compara com o guardado. Cada usuário ganha um **sal** (um texto aleatório misturado antes do hash), para duas senhas iguais não gerarem hashes iguais. Use funções feitas para senha, como **bcrypt** ou **argon2**, nunca uma invenção sua.

E o hash também **não sai** do back: a resposta usa um DTO público, sem \`senhaHash\`. Lembre que o tipo não apaga campos em tempo de execução: \`const publico: UsuarioPublico = usuario\` compila e manda tudo junto. Monte o objeto campo a campo.

## CORS: o navegador de guarda

O site está em \`https://painel.bolhadesabao.example\` e a API em \`https://api.bolhadesabao.example\`. São **origens** diferentes. Por segurança, o navegador **não deixa** o JavaScript de uma origem ler a resposta de outra, a menos que o servidor autorize com o cabeçalho \`Access-Control-Allow-Origin\`. Para pedidos "não simples" (POST com JSON, cabeçalho \`Authorization\`), o navegador ainda manda antes um pedido \`OPTIONS\` perguntando se pode (o *preflight*).

Pontos que evitam briga:

- o erro de CORS aparece no **console do navegador**, mas o conserto é no **back** (autorizar a origem do site);
- sua ferramenta de testar API e o terminal **não** fazem checagem de CORS. Por isso "aqui funciona" não prova nada;
- CORS protege o **usuário do navegador**, não o servidor: quem chama a API de fora do navegador ignora o CORS. Autenticação e validação continuam obrigatórias.`,
    },
  ],
  checkQuestionIds: ['fullstack.m01.q27', 'fullstack.m01.q28'],
  exerciseIds: ['fullstack.m01.e08', 'fullstack.m01.e09'],
  debugExerciseIds: ['fullstack.m01.d04'],
};

// ---------- e08: catraca da API da lavanderia (TS, back) ----------

const CONTRATO_LAVANDERIA = `// contrato.ts da lavanderia
export type Papel = 'gerente' | 'atendente';

export interface Usuario {
  id: number;
  nome: string;
  papel: Papel;
}

export interface Faturamento {
  mes: string;
  total: number;
}
`;

const LAVANDERIA_TOPO = `import { criarApp, type Requisicao } from './mini-api';
import type { Faturamento, Usuario } from './contrato';

// Tokens de quem fez login (no mundo real, viriam do banco ou de um token assinado)
const sessoes: Record<string, Usuario> = {
  'tok-ana-7f3k': { id: 1, nome: 'Ana', papel: 'gerente' },
  'tok-beto-9x2m': { id: 2, nome: 'Beto', papel: 'atendente' },
};

const faturamento: Faturamento = { mes: '2026-04', total: 18450.9 };
`;

// ---------- e09: painel da lavanderia (web, front) ----------

const PAINEL_HTML = `<h1>Lavanderia Bolha de Sabão: painel</h1>
<button id="ver">Ver faturamento</button>
<p id="painel"></p>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela é o back-end da lavanderia.
  // GET /api/faturamento com "Authorization: Bearer <token>"
  // 200 → { mes, total }   401 → token ausente/inválido   403 → usuário sem permissão
  window.__chamadas = [];
  window.fetch = async (url, opcoes = {}) => {
    const cabecalho = new Headers(opcoes.headers).get('authorization');
    window.__chamadas.push({ url: String(url), authorization: cabecalho });
    await new Promise((r) => setTimeout(r, 20));
    const responder = (status, dados) => ({ ok: status >= 200 && status < 300, status, json: async () => dados });
    if (url !== '/api/faturamento') return responder(404, { erro: 'Rota não encontrada' });
    const sessoes = { 'tok-ana-7f3k': 'gerente', 'tok-beto-9x2m': 'atendente' };
    const token = cabecalho && cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
    if (!token || !sessoes[token]) return responder(401, { erro: 'Faça login' });
    if (sessoes[token] !== 'gerente') return responder(403, { erro: 'Só gerente vê o faturamento' });
    return responder(200, { mes: '2026-04', total: 18450.9 });
  };
</script>`;

const PAINEL_CSS = `body { font-family: sans-serif; }`;

const PAINEL_TOPO = `// Quem fez login (o token veio do POST /api/login)
const sessao = { nome: 'Ana', token: 'tok-ana-7f3k' };
const painel = document.querySelector('#painel');
`;

const PAINEL_FIM = `
document.querySelector('#ver').addEventListener('click', buscarFaturamento);
`;

// ---------- d04: perfil de usuário (TS, back) ----------

const CONTRATO_PERFIL = `// contrato.ts da lavanderia (cadastro de clientes)
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senhaHash: string; // NUNCA sai do back
}

// O que pode ir para o front
export type UsuarioPublico = Omit<Usuario, 'senhaHash'>;
`;

const PERFIL_TOPO = `import { criarApp } from './mini-api';
import type { Usuario, UsuarioPublico } from './contrato';

const usuarios: Usuario[] = [
  { id: 1, nome: 'Dona Neide', email: 'neide@exemplo.com', senhaHash: 'b1c9$e8f02a7d55c3' },
  { id: 2, nome: 'Seu Arlindo', email: 'arlindo@exemplo.com', senhaHash: '7a2d$0c4be91f3a6e' },
];

// token → id do usuário que fez login
const sessoes: Record<string, number> = { 'tok-neide': 1, 'tok-arlindo': 2 };

function idDaSessao(authorization: string | undefined): number | null {
  if (!authorization || !authorization.startsWith('Bearer ')) return null;
  return sessoes[authorization.slice(7)] ?? null;
}

const app = criarApp();
`;

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m01.e08',
    lessonId: 'fullstack.m01.l04',
    kind: 'implement',
    title: 'A catraca da API',
    promptMarkdown: `A **Lavanderia Bolha de Sabão** (Alphaville, Barueri) tem um painel com o faturamento do mês, e hoje qualquer um que descobre o endereço vê tudo. Coloque uma catraca no back:

1. \`usuarioDaRequisicao(req: Requisicao): Usuario | null\`: lê \`req.headers.authorization\` (o mini-api deixa os nomes de cabeçalho em minúsculas). Só aceita o formato \`Bearer <token>\`; devolve o usuário de \`sessoes[token]\`, ou \`null\` se não houver cabeçalho, se o formato estiver errado ou se o token não existir.
2. A rota \`GET /api/faturamento\`:
   - sem usuário → **401** e \`{ erro: 'Faça login' }\`;
   - usuário que não é \`'gerente'\` → **403** e \`{ erro: 'Só gerente vê o faturamento' }\`;
   - gerente → **200** com o \`faturamento\`.`,
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'mini-api.ts': MINI_API, 'contrato.ts': CONTRATO_LAVANDERIA },
    starterCode: `${LAVANDERIA_TOPO}
function usuarioDaRequisicao(req: Requisicao): Usuario | null {
  // seu código aqui
  return null;
}

const app = criarApp();

app.get('/api/faturamento', (req) => {
  return { status: 200, body: faturamento }; // qualquer um entra!
});
`,
    solution: `${LAVANDERIA_TOPO}
function usuarioDaRequisicao(req: Requisicao): Usuario | null {
  const cabecalho = req.headers.authorization;
  if (!cabecalho || !cabecalho.startsWith('Bearer ')) return null;
  const token = cabecalho.slice('Bearer '.length);
  return sessoes[token] ?? null;
}

const app = criarApp();

app.get('/api/faturamento', (req) => {
  const usuario = usuarioDaRequisicao(req);
  if (!usuario) return { status: 401, body: { erro: 'Faça login' } };
  if (usuario.papel !== 'gerente') return { status: 403, body: { erro: 'Só gerente vê o faturamento' } };
  return { status: 200, body: faturamento };
});
`,
    tests: [
      {
        description: 'usuarioDaRequisicao acha o usuário pelo token Bearer',
        code: `const req: Requisicao = {
  method: 'GET',
  path: '/',
  params: {},
  headers: { authorization: 'Bearer tok-beto-9x2m' },
  body: undefined,
};
assert.deepStrictEqual(usuarioDaRequisicao(req), { id: 2, nome: 'Beto', papel: 'atendente' });`,
      },
      {
        description: 'sem cabeçalho, sem "Bearer " ou com token falso, devolve null',
        code: `const casos: Record<string, string>[] = [{}, { authorization: 'tok-ana-7f3k' }, { authorization: 'Bearer tok-chutado' }];
for (const headers of casos) {
  const req: Requisicao = { method: 'GET', path: '/', params: {}, headers, body: undefined };
  assert.strictEqual(usuarioDaRequisicao(req), null, 'Deveria ser null para ' + JSON.stringify(headers));
}`,
      },
      {
        description: 'sem login, a rota responde 401',
        code: `const r = await app.handle({ method: 'GET', path: '/api/faturamento' });
assert.strictEqual(r.status, 401);
assert.deepStrictEqual(r.body, { erro: 'Faça login' });`,
      },
      {
        description: 'atendente logado recebe 403',
        code: `const r = await app.handle({
  method: 'GET',
  path: '/api/faturamento',
  headers: { Authorization: 'Bearer tok-beto-9x2m' },
});
assert.strictEqual(r.status, 403);
assert.deepStrictEqual(r.body, { erro: 'Só gerente vê o faturamento' });`,
      },
      {
        description: 'gerente logada vê o faturamento',
        code: `const r = await app.handle({
  method: 'GET',
  path: '/api/faturamento',
  headers: { Authorization: 'Bearer tok-ana-7f3k' },
});
assert.strictEqual(r.status, 200);
assert.deepStrictEqual(r.body, { mes: '2026-04', total: 18450.9 });`,
      },
    ],
    hints: [
      "Confira `cabecalho.startsWith('Bearer ')` e pegue o resto com `cabecalho.slice('Bearer '.length)`.",
      '`sessoes[token] ?? null` devolve o usuário ou `null` quando o token não existe.',
      'Na rota, a ordem é: sem usuário → 401; depois, papel diferente de gerente → 403; senão, 200.',
    ],
    followUpQuestionIds: ['fullstack.m01.f21', 'fullstack.m01.f22'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.e09',
    lessonId: 'fullstack.m01.l04',
    kind: 'implement',
    title: 'Mandando o crachá',
    promptMarkdown: `Agora o painel (front) da **Bolha de Sabão**. Quem fez login está em \`sessao\` (com o \`token\`). Escreva a função **async** \`buscarFaturamento()\`:

1. faça \`GET /api/faturamento\` mandando o cabeçalho \`Authorization: Bearer <token>\` com o token de \`sessao\`;
2. **200**: \`#painel\` mostra \`Faturamento de 2026-04: R$ 18450.90\` (o \`mes\` e o \`total\` com duas casas, via \`toFixed(2)\`);
3. **401**: \`#painel\` mostra \`Sua sessão expirou. Entre de novo.\` e o \`sessao.token\` vira \`null\` (o crachá não vale mais);
4. **403**: \`#painel\` mostra \`Você não tem permissão para ver o faturamento.\` (o token continua: a pessoa só não pode ver **isso**).`,
    language: 'web',
    starterFiles: {
      html: PAINEL_HTML,
      css: PAINEL_CSS,
      js: `${PAINEL_TOPO}
async function buscarFaturamento() {
  // seu código aqui
}
${PAINEL_FIM}`,
    },
    solutionFiles: {
      html: PAINEL_HTML,
      css: PAINEL_CSS,
      js: `${PAINEL_TOPO}
async function buscarFaturamento() {
  const resposta = await fetch('/api/faturamento', {
    headers: { Authorization: 'Bearer ' + sessao.token },
  });
  if (resposta.status === 401) {
    sessao.token = null;
    painel.textContent = 'Sua sessão expirou. Entre de novo.';
    return;
  }
  if (resposta.status === 403) {
    painel.textContent = 'Você não tem permissão para ver o faturamento.';
    return;
  }
  const dados = await resposta.json();
  painel.textContent = 'Faturamento de ' + dados.mes + ': R$ ' + dados.total.toFixed(2);
}
${PAINEL_FIM}`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'manda o token no cabeçalho Authorization',
        code: `await buscarFaturamento();
const chamada = window.__chamadas[window.__chamadas.length - 1];
assert.ok(chamada, 'O fetch não foi chamado.');
assert.strictEqual(chamada.url, '/api/faturamento');
assert.strictEqual(chamada.authorization, 'Bearer tok-ana-7f3k');`,
      },
      {
        description: 'gerente vê o faturamento formatado',
        code: `await buscarFaturamento();
assert.strictEqual(document.querySelector('#painel').textContent, 'Faturamento de 2026-04: R$ 18450.90');`,
      },
      {
        description: '403: avisa que não tem permissão e mantém o token',
        code: `sessao.token = 'tok-beto-9x2m';
await buscarFaturamento();
assert.strictEqual(document.querySelector('#painel').textContent, 'Você não tem permissão para ver o faturamento.');
assert.strictEqual(sessao.token, 'tok-beto-9x2m', 'Com 403 o login continua valendo.');`,
      },
      {
        description: '401: pede login de novo e descarta o token',
        code: `sessao.token = 'tok-vencido';
await buscarFaturamento();
assert.strictEqual(document.querySelector('#painel').textContent, 'Sua sessão expirou. Entre de novo.');
assert.strictEqual(sessao.token, null, 'Com 401 o token não vale mais: troque por null.');`,
      },
    ],
    hints: [
      "O cabeçalho vai no segundo argumento: `fetch(url, { headers: { Authorization: 'Bearer ' + sessao.token } })`.",
      'Trate `resposta.status === 401` e `=== 403` antes de ler os dados.',
      '`dados.total.toFixed(2)` transforma `18450.9` em `"18450.90"`.',
    ],
    followUpQuestionIds: ['fullstack.m01.f23', 'fullstack.m01.f24'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.d04',
    lessonId: 'fullstack.m01.l04',
    kind: 'debug',
    title: 'Porteiro trocado e hash vazando',
    promptMarkdown: `A rota \`GET /api/usuarios/:id\` da **Bolha de Sabão** mostra o perfil do cliente. Cada um só pode ver o **próprio** perfil. A auditoria (o primo do dono, que "manja de segurança") achou dois problemas:

1. sem login, a rota responde 403; vendo o perfil de **outra** pessoa, responde 401. Está trocado: sem login é **401**, perfil alheio é **403**;
2. a resposta manda o \`senhaHash\` para o navegador. O contrato diz que só sai o \`UsuarioPublico\` (\`id\`, \`nome\`, \`email\`).

Conserte a rota.`,
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'mini-api.ts': MINI_API, 'contrato.ts': CONTRATO_PERFIL },
    starterCode: `${PERFIL_TOPO}
app.get('/api/usuarios/:id', (req) => {
  const idLogado = idDaSessao(req.headers.authorization);
  if (idLogado === null) return { status: 403, body: { erro: 'Acesso negado' } };
  const id = Number(req.params.id);
  if (idLogado !== id) return { status: 401, body: { erro: 'Faça login' } };
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return { status: 404, body: { erro: 'Usuário não encontrado' } };
  const publico: UsuarioPublico = usuario; // o tipo garante que só vai o público... certo?
  return { status: 200, body: publico };
});
`,
    solution: `${PERFIL_TOPO}
app.get('/api/usuarios/:id', (req) => {
  const idLogado = idDaSessao(req.headers.authorization);
  if (idLogado === null) return { status: 401, body: { erro: 'Faça login' } };
  const id = Number(req.params.id);
  if (idLogado !== id) return { status: 403, body: { erro: 'Acesso negado' } };
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return { status: 404, body: { erro: 'Usuário não encontrado' } };
  const publico: UsuarioPublico = { id: usuario.id, nome: usuario.nome, email: usuario.email };
  return { status: 200, body: publico };
});
`,
    tests: [
      {
        description: 'sem login: 401',
        code: `const r = await app.handle({ method: 'GET', path: '/api/usuarios/1' });
assert.strictEqual(r.status, 401);
assert.deepStrictEqual(r.body, { erro: 'Faça login' });`,
      },
      {
        description: 'logado, mas pedindo o perfil de outra pessoa: 403',
        code: `const r = await app.handle({
  method: 'GET',
  path: '/api/usuarios/1',
  headers: { Authorization: 'Bearer tok-arlindo' },
});
assert.strictEqual(r.status, 403);
assert.deepStrictEqual(r.body, { erro: 'Acesso negado' });`,
      },
      {
        description: 'o próprio perfil vem sem o senhaHash',
        code: `const r = await app.handle({
  method: 'GET',
  path: '/api/usuarios/1',
  headers: { Authorization: 'Bearer tok-neide' },
});
assert.strictEqual(r.status, 200);
assert.deepStrictEqual(r.body, { id: 1, nome: 'Dona Neide', email: 'neide@exemplo.com' });`,
      },
    ],
    hints: [
      'Troque os status: `idLogado === null` é "não sei quem você é" (401); id diferente é "não pode" (403).',
      'Atribuir `usuario` a uma variável do tipo `UsuarioPublico` não apaga o `senhaHash` em tempo de execução. Monte `{ id, nome, email }` à mão.',
    ],
    followUpQuestionIds: ['fullstack.m01.f25', 'fullstack.m01.f26'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'fullstack.m01.q27',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'multiple-choice',
    prompt:
      'A atendente, logada, tenta abrir o relatório de faturamento, que só o gerente pode ver. Qual status a API deve responder?',
    options: ['403', '401', '404', '400'],
    answerIndex: 0,
    explanation:
      'A API sabe quem ela é (o token é válido), mas ela não tem permissão: 403. O 401 é para quem não se identificou.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q28',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'true-false',
    prompt:
      'O banco deve guardar a senha do usuário exatamente como ele digitou, para o login poder comparar.',
    answer: false,
    explanation:
      'Guarda-se o **hash** (com sal). No login, o back calcula o hash da senha digitada e compara com o guardado.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'fullstack.m01.q29',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'fill-blank',
    prompt: 'Complete o cabeçalho que leva o token para a API.',
    code: `fetch('/api/pedidos', {
  headers: { Authorization: '___ ' + token },
});`,
    acceptedAnswers: ['Bearer'],
    explanation: 'O formato combinado é `Authorization: Bearer <token>` ("portador" do crachá).',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q30',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'multiple-choice',
    prompt:
      'O console do navegador mostra um erro de CORS ao chamar `https://api.lavanderia.example` a partir de `https://painel.lavanderia.example`. Onde fica o conserto?',
    options: [
      'No back: autorizar a origem do painel com o cabeçalho `Access-Control-Allow-Origin`',
      'No front: trocar `fetch` por outra função',
      'No navegador do cliente: desligar a segurança',
      'Em lugar nenhum: CORS é bug do navegador',
    ],
    answerIndex: 0,
    explanation:
      'O navegador bloqueia a leitura porque o servidor não autorizou aquela origem. Quem autoriza é o back.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q31',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'true-false',
    prompt:
      'Com o CORS bem configurado, a API está protegida de qualquer acesso indevido, e dá para dispensar a checagem do token.',
    answer: false,
    explanation:
      'CORS é uma regra que o **navegador** aplica. Um script no terminal ignora o CORS. Autenticação e validação continuam no back.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q32',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'Para que serve o **sal** no hash de senhas?',
    options: [
      'Para que duas pessoas com a mesma senha não tenham o mesmo hash guardado',
      'Para dar para desfazer o hash depois',
      'Para a senha ficar mais curta',
      'Para o navegador conseguir ler a senha',
    ],
    answerIndex: 0,
    explanation:
      'O sal é um texto aleatório por usuário, misturado antes do hash. Senhas iguais viram hashes diferentes, o que atrapalha muito quem roubou o banco.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q33',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'multiple-choice',
    prompt:
      'Qual a principal diferença prática entre um cookie de sessão e um token no cabeçalho `Authorization`?',
    options: [
      'O cookie o navegador envia sozinho; o token no cabeçalho só vai quando o seu código coloca',
      'O cookie é sempre mais seguro, em qualquer situação',
      'O token no cabeçalho não pode ser usado em apps',
      'Não há diferença nenhuma',
    ],
    answerIndex: 0,
    explanation:
      'Por isso cada um tem seu cuidado: cookie exige proteção contra pedidos forjados (CSRF); token guardado no `localStorage` fica exposto a scripts injetados (XSS).',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q34',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'predict-output',
    prompt: 'O back separa o tipo e o token do cabeçalho. O que este código imprime?',
    code: `const cabecalho = 'Bearer tok-ana-7f3k';
const [tipo, token] = cabecalho.split(' ');
console.log(tipo);
console.log(token);
console.log(cabecalho.startsWith('Bearer '));`,
    expectedOutput: 'Bearer\ntok-ana-7f3k\ntrue',
    explanation: "`split(' ')` quebra no espaço; a desestruturação pega as duas partes.",
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q35',
    lessonIds: ['fullstack.m01.l04'],
    kind: 'multiple-choice',
    prompt: 'O front recebeu **401** ao buscar os pedidos. Qual a reação mais adequada?',
    options: [
      'Descartar o token e mandar o usuário fazer login de novo',
      'Mostrar "Você não tem permissão" e manter o token',
      'Repetir o pedido 3 vezes',
      'Mostrar "Servidor fora do ar"',
    ],
    answerIndex: 0,
    explanation:
      '401 significa que o crachá não vale (ausente, inválido ou expirado). Repetir com o mesmo token não ajuda.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'fullstack.m01.f21',
    lessonIds: ['fullstack.m01.l04'],
    exerciseId: 'fullstack.m01.e08',
    kind: 'multiple-choice',
    prompt: 'Na sua rota `/api/faturamento`, por que o teste do 401 vem antes do 403?',
    options: [
      'Porque sem saber quem é o usuário não dá para conferir o papel dele',
      'Porque 401 é um número menor',
      'Porque o 403 nunca acontece',
      'Tanto faz a ordem',
    ],
    answerIndex: 0,
    explanation: 'Primeiro "quem é você?", depois "você pode?". Sem usuário, `usuario.papel` nem existe.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f22',
    lessonIds: ['fullstack.m01.l04'],
    exerciseId: 'fullstack.m01.e08',
    kind: 'multiple-choice',
    prompt:
      "No seu `usuarioDaRequisicao`, o que acontece com o cabeçalho `'tok-ana-7f3k'` (sem o `Bearer `)?",
    options: [
      'Devolve `null`, porque o formato não é `Bearer <token>`',
      'Devolve a Ana, porque o token existe',
      'Lança um erro e a rota responde 500',
      'Devolve o Beto',
    ],
    answerIndex: 0,
    explanation: "O `startsWith('Bearer ')` barra o formato errado antes de procurar o token.",
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f23',
    lessonIds: ['fullstack.m01.l04'],
    exerciseId: 'fullstack.m01.e09',
    kind: 'true-false',
    prompt: 'No seu `buscarFaturamento`, quando a API responde 403, o token é descartado.',
    answer: false,
    explanation:
      'Com 403 o login continua válido: a pessoa só não pode ver aquilo. Quem descarta o token é o 401.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f24',
    lessonIds: ['fullstack.m01.l04'],
    exerciseId: 'fullstack.m01.e09',
    kind: 'multiple-choice',
    prompt: 'No seu `buscarFaturamento`, onde o token viaja?',
    options: [
      'No cabeçalho `Authorization`, no formato `Bearer <token>`',
      'No endereço, como `?token=...`',
      'No corpo do GET, em JSON',
      'Num cookie que o navegador cria sozinho',
    ],
    answerIndex: 0,
    explanation: 'O token vai no cabeçalho, que você monta no segundo argumento do `fetch`.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f25',
    lessonIds: ['fullstack.m01.l04'],
    exerciseId: 'fullstack.m01.d04',
    kind: 'multiple-choice',
    prompt:
      'Por que `const publico: UsuarioPublico = usuario;` compilava e mesmo assim vazava o `senhaHash`?',
    options: [
      'Porque o tipo só restringe o que o código pode ler; o objeto continua com todos os campos em tempo de execução',
      'Porque `Omit` não funciona com interfaces',
      'Porque o JSON acrescenta o `senhaHash` sozinho',
      'Porque o TypeScript estava desligado',
    ],
    answerIndex: 0,
    explanation:
      'Um objeto com campos a mais é compatível com um tipo menor. Os tipos somem ao rodar; para tirar o campo, monte outro objeto.',
    difficulty: 3,
  },
  {
    id: 'fullstack.m01.f26',
    lessonIds: ['fullstack.m01.l04'],
    exerciseId: 'fullstack.m01.d04',
    kind: 'multiple-choice',
    prompt:
      'Na rota consertada, o Seu Arlindo (logado) pede `/api/usuarios/1`, o perfil da Dona Neide. Qual a resposta?',
    options: [
      '403 Acesso negado',
      '401 Faça login',
      '200 com o perfil da Dona Neide',
      '404 Usuário não encontrado',
    ],
    answerIndex: 0,
    explanation: 'Ele se identificou (não é 401), mas o perfil não é dele: 403.',
    difficulty: 1,
  },
];
