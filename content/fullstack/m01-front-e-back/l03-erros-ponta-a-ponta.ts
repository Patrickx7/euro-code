import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { MINI_API } from './mini-api';

export const lesson: Lesson = {
  id: 'fullstack.m01.l03',
  moduleId: 'fullstack.m01',
  order: 3,
  title: 'Erros de ponta a ponta',
  concepts: [
    '400 com lista de erros por campo',
    '409 (conflito) e 500 (erro do servidor)',
    'mostrar cada erro no campo certo',
    'aria-invalid e limpar erros antigos',
    'estado de carregando (botão desabilitado)',
    'retry só quando faz sentido',
    'mensagens amigáveis',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Um erro bem tratado atravessa o sistema inteiro: o back descobre o problema, descreve direitinho, e o front mostra no lugar certo, com palavras que o cliente entende. Um erro mal tratado vira o famoso **"Algo deu errado"**, e o cliente liga para você num domingo.

## O back: dizer **o que** e **onde**

Na trilha de back você respondia \`400 { erros: ['e-mail inválido'] }\`. Para o front colocar cada mensagem embaixo do campo certo, falta dizer **qual campo**:

\`\`\`json
{ "erros": [
  { "campo": "email", "mensagem": "E-mail inválido" },
  { "campo": "idade", "mensagem": "Precisa ter 18 anos ou mais" }
] }
\`\`\`

Os status também são parte da conversa:

- **400**: o pedido veio com dados errados (o usuário corrige e tenta de novo);
- **409**: conflito com o que já existe (e-mail já cadastrado, horário já ocupado);
- **500**: o servidor quebrou. Responda uma mensagem genérica e **nunca** mande a pilha de erro (\`stack\`) para o navegador: ela é para o seu log, não para o cliente.`,
    },
    {
      kind: 'example',
      language: 'ts',
      code: `import type { ErroCampo } from './contrato';

function validarCadastro(body: unknown): ErroCampo[] {
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const erros: ErroCampo[] = [];
  if (typeof b.nome !== 'string' || b.nome.trim() === '') erros.push({ campo: 'nome', mensagem: 'Informe o nome' });
  if (typeof b.email !== 'string' || !b.email.includes('@')) erros.push({ campo: 'email', mensagem: 'E-mail inválido' });
  return erros;
}

app.post('/api/cadastros', (req) => {
  const erros = validarCadastro(req.body);
  if (erros.length > 0) return { status: 400, body: { erros } };
  // ...
});`,
      explanation:
        'A validação junta **todos** os problemas, cada um com seu campo. O front recebe tudo de uma vez, em vez de descobrir um erro por envio.',
    },
    {
      kind: 'text',
      markdown: `## O front: cada erro no seu campo

Do lado da página, o caminho é:

1. **Limpe os erros antigos** antes de cada envio (senão o "Informe o nome" fica lá mesmo depois de o nome ser preenchido);
2. para cada \`{ campo, mensagem }\`, ponha a mensagem no \`<span id="erro-email">\` do campo e marque o input com \`aria-invalid="true"\` (o leitor de tela avisa que o campo está com problema);
3. separe os casos pelo **status**: 400 é para mostrar nos campos; 5xx ou falha de rede é para uma mensagem amigável geral.

## Carregando e tentando de novo

- **Carregando**: mostre "Enviando..." e **desabilite o botão** enquanto espera. Senão o cliente aflito clica cinco vezes e você ganha cinco pedidos iguais.
- **Retry**: tentar de novo só faz sentido quando o problema pode ser passageiro: **falha de rede** (o \`fetch\` rejeitou) ou **5xx**. Um **400** vai falhar igual na segunda vez; repetir é teimosia. E sempre com **limite** de tentativas.
- **Mensagem amigável**: "A agenda está fora do ar. Tente de novo em instantes." é melhor que "Error: 503 Service Unavailable". O detalhe técnico vai para o \`console.error\`, para você.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<form id="form">
  <input id="email" aria-describedby="erro-email">
  <span class="erro" id="erro-email"></span>
  <button id="enviar">Enviar</button>
</form>

<script>
  function mostrarErros(erros) {
    document.querySelectorAll('.erro').forEach((span) => (span.textContent = ''));
    document.querySelectorAll('input').forEach((input) => input.removeAttribute('aria-invalid'));
    for (const erro of erros) {
      document.querySelector('#erro-' + erro.campo).textContent = erro.mensagem;
      document.querySelector('#' + erro.campo).setAttribute('aria-invalid', 'true');
    }
  }

  async function buscarComRetry(url, tentativas) {
    for (let i = 1; i <= tentativas; i++) {
      try {
        const resposta = await fetch(url);
        if (resposta.status < 500) return resposta; // sucesso ou erro "definitivo": não repete
      } catch (e) {
        console.error('Tentativa ' + i + ' falhou', e); // falha de rede: tenta de novo
      }
    }
    return null; // desistiu
  }
</script>`,
      explanation:
        '`mostrarErros` limpa tudo e depois marca só o que veio. `buscarComRetry` repete em falha de rede ou 5xx, até um limite, e devolve na hora respostas 2xx e 4xx.',
    },
  ],
  checkQuestionIds: ['fullstack.m01.q18', 'fullstack.m01.q19'],
  exerciseIds: ['fullstack.m01.e05', 'fullstack.m01.e06', 'fullstack.m01.e07'],
  debugExerciseIds: ['fullstack.m01.d03'],
};

// ---------- e05: matrícula da autoescola (TS, back) ----------

const CONTRATO_AUTOESCOLA = `// contrato.ts da autoescola (back e front importam daqui)
export type Categoria = 'A' | 'B';

export interface Matricula {
  id: number;
  nome: string;
  email: string;
  idade: number;
  categoria: Categoria;
}

export type NovaMatricula = Omit<Matricula, 'id'>;

export interface ErroCampo {
  campo: string;
  mensagem: string;
}

export interface RespostaErro {
  erros: ErroCampo[];
}
`;

const MATRICULA_TOPO = `import { criarApp } from './mini-api';
import type { ErroCampo, Matricula, NovaMatricula } from './contrato';

const matriculas: Matricula[] = [
  { id: 1, nome: 'Dona Cida', email: 'cida@exemplo.com', idade: 64, categoria: 'B' },
];
`;

// ---------- e06: front da matrícula (web) ----------

const MATRICULA_HTML = `<h1>Autoescola Baliza Perfeita</h1>
<form id="form" novalidate>
  <label>Nome <input id="nome" aria-describedby="erro-nome"></label>
  <span class="erro" id="erro-nome"></span>
  <label>E-mail <input id="email" aria-describedby="erro-email"></label>
  <span class="erro" id="erro-email"></span>
  <label>Idade <input id="idade" type="number" aria-describedby="erro-idade"></label>
  <span class="erro" id="erro-idade"></span>
  <button>Matricular</button>
</form>
<p id="resultado"></p>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela é o back-end da autoescola.
  // POST /api/matriculas  { nome, email, idade }
  // 201 → { id, nome, email, idade }    400/409 → { erros: [{ campo, mensagem }] }
  window.__chamadas = [];
  window.fetch = async (url, opcoes = {}) => {
    window.__chamadas.push({ url: String(url), opcoes });
    await new Promise((r) => setTimeout(r, 20));
    const responder = (status, dados) => ({ ok: status >= 200 && status < 300, status, json: async () => dados });
    if (url !== '/api/matriculas' || opcoes.method !== 'POST') return responder(404, { erro: 'Rota não encontrada' });
    const b = JSON.parse(opcoes.body);
    const erros = [];
    if (typeof b.nome !== 'string' || b.nome.trim() === '') erros.push({ campo: 'nome', mensagem: 'Informe o nome' });
    if (typeof b.email !== 'string' || !b.email.includes('@')) erros.push({ campo: 'email', mensagem: 'E-mail inválido' });
    if (!Number.isInteger(b.idade) || b.idade < 18) erros.push({ campo: 'idade', mensagem: 'Precisa ter 18 anos ou mais' });
    if (erros.length > 0) return responder(400, { erros });
    if (b.email === 'cida@exemplo.com') return responder(409, { erros: [{ campo: 'email', mensagem: 'E-mail já matriculado' }] });
    return responder(201, { id: 2, nome: b.nome, email: b.email, idade: b.idade });
  };
</script>`;

const MATRICULA_CSS = `body { font-family: sans-serif; }
label { display: block; margin-top: 8px; }
.erro { color: rgb(180, 0, 0); font-size: 14px; }`;

const MATRICULA_LISTENER = `
document.querySelector('#form').addEventListener('submit', (evento) => {
  evento.preventDefault();
  enviarMatricula();
});
`;

const MATRICULA_ENVIO = `const resultado = document.querySelector('#resultado');

async function enviarMatricula() {
  resultado.textContent = '';
  const corpo = {
    nome: document.querySelector('#nome').value,
    email: document.querySelector('#email').value,
    idade: Number(document.querySelector('#idade').value),
  };
  const resposta = await fetch('/api/matriculas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  const dados = await resposta.json();
  if (resposta.ok) {
    mostrarErros([]);
    resultado.textContent = 'Matrícula #' + dados.id + ' feita! Bem-vindo(a), ' + dados.nome + '.';
  } else {
    mostrarErros(dados.erros);
  }
}
`;

// ---------- e07: horários da clínica (web) ----------

const HORARIOS_HTML = `<h1>Clínica Odonto Sorriso de Cotia</h1>
<button id="recarregar">Ver horários livres</button>
<p id="aviso" role="status"></p>
<ul id="horarios"></ul>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela finge um servidor instável.
  // window.__falhas: quantas vezes seguidas o servidor falha antes de responder
  // (alternando entre "sem rede" e 503). window.__statusFixo: força um status (ex.: 404).
  window.__chamadas = [];
  window.__falhas = 0;
  window.__statusFixo = null;
  window.fetch = async (url) => {
    window.__chamadas.push({ url: String(url) });
    await new Promise((r) => setTimeout(r, 30));
    const responder = (status, dados) => ({ ok: status >= 200 && status < 300, status, json: async () => dados });
    if (window.__statusFixo) return responder(window.__statusFixo, { erro: 'Erro ' + window.__statusFixo });
    if (window.__falhas > 0) {
      window.__falhas--;
      if (window.__falhas % 2 === 0) throw new TypeError('Failed to fetch');
      return responder(503, { erro: 'Serviço indisponível' });
    }
    if (url !== '/api/horarios') return responder(404, { erro: 'Rota não encontrada' });
    return responder(200, ['08:00', '10:30', '15:00']);
  };
</script>`;

const HORARIOS_CSS = `body { font-family: sans-serif; }`;

const HORARIOS_TOPO = `const lista = document.querySelector('#horarios');
const aviso = document.querySelector('#aviso');
const botao = document.querySelector('#recarregar');
`;

const HORARIOS_FIM = `
botao.addEventListener('click', carregarHorarios);
`;

// ---------- d03: agendamento de aula prática (web) ----------

const AULA_HTML = `<h1>Autoescola Baliza Perfeita: aula prática</h1>
<form id="form" novalidate>
  <label>Aluno <input id="aluno" value="Rita"></label>
  <span class="erro" id="erro-aluno"></span>
  <label>Data <input id="data" value="2026-05-20"></label>
  <span class="erro" id="erro-data"></span>
  <label>Horário <input id="horario" value="07:00"></label>
  <span class="erro" id="erro-horario"></span>
  <button>Agendar</button>
</form>
<p id="msg"></p>

<script>
  // API falsa (o jogo roda sem internet). Não mexa: ela é o back-end da autoescola.
  // POST /api/aulas { aluno, data, horario }
  // 201 → { id }   400 → { erros: [{ campo, mensagem }] }   500 quando window.__servidorCaiu = true
  window.__chamadas = [];
  window.__servidorCaiu = false;
  window.fetch = async (url, opcoes = {}) => {
    window.__chamadas.push({ url: String(url), opcoes });
    await new Promise((r) => setTimeout(r, 20));
    const responder = (status, dados) => ({ ok: status >= 200 && status < 300, status, json: async () => dados });
    if (window.__servidorCaiu) return responder(500, { erro: 'Erro interno no servidor' });
    const b = JSON.parse(opcoes.body);
    const erros = [];
    if (!b.aluno || b.aluno.trim() === '') erros.push({ campo: 'aluno', mensagem: 'Informe o aluno' });
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(b.data)) erros.push({ campo: 'data', mensagem: 'Data no formato AAAA-MM-DD' });
    const hora = Number(String(b.horario).slice(0, 2));
    if (!(hora >= 8 && hora <= 18)) erros.push({ campo: 'horario', mensagem: 'Aulas entre 08:00 e 18:00' });
    if (erros.length > 0) return responder(400, { erros });
    return responder(201, { id: 31 });
  };
</script>`;

const AULA_CSS = `body { font-family: sans-serif; }
label { display: block; margin-top: 8px; }
.erro { color: rgb(180, 0, 0); }`;

const AULA_LISTENER = `
document.querySelector('#form').addEventListener('submit', (evento) => {
  evento.preventDefault();
  agendarAula();
});
`;

export const exercises: Exercise[] = [
  {
    id: 'fullstack.m01.e05',
    lessonId: 'fullstack.m01.l03',
    kind: 'implement',
    title: 'Erros com endereço certo',
    promptMarkdown: `A **Autoescola Baliza Perfeita** (Jardim Belval, Barueri) quer matrícula pelo site. Você começa pelo back. O \`contrato.ts\` está aberto ao lado.

1. Escreva \`validarMatricula(body: unknown): ErroCampo[]\`, que devolve **todos** os erros, nesta ordem (array vazio se estiver tudo certo; corpo que não é objeto conta como vazio):
   - \`nome\` texto não vazio → \`{ campo: 'nome', mensagem: 'Informe o nome' }\`
   - \`email\` texto com \`@\` → \`{ campo: 'email', mensagem: 'E-mail inválido' }\`
   - \`idade\` número inteiro de 18 para cima → \`{ campo: 'idade', mensagem: 'Precisa ter 18 anos ou mais' }\`
   - \`categoria\` \`'A'\` ou \`'B'\` → \`{ campo: 'categoria', mensagem: 'Escolha a categoria A ou B' }\`
2. Complete a rota \`POST /api/matriculas\`:
   - com erros → **400** e \`{ erros }\`;
   - e-mail que já está em \`matriculas\` → **409** e \`{ erros: [{ campo: 'email', mensagem: 'E-mail já matriculado' }] }\`;
   - tudo certo → guarda e responde **201** com a matrícula (\`id\` = quantidade atual + 1; monte campo a campo).`,
    language: 'ts',
    moduleSystem: 'esm',
    extraFiles: { 'mini-api.ts': MINI_API, 'contrato.ts': CONTRATO_AUTOESCOLA },
    starterCode: `${MATRICULA_TOPO}
function validarMatricula(body: unknown): ErroCampo[] {
  const erros: ErroCampo[] = [];
  // seu código aqui
  return erros;
}

const app = criarApp();

app.post('/api/matriculas', (req) => {
  // seu código aqui: 400 com os erros, 409 se o e-mail já existe, 201 com a matrícula nova
  return { status: 501, body: { erro: 'Ainda não fiz' } };
});
`,
    solution: `${MATRICULA_TOPO}
function validarMatricula(body: unknown): ErroCampo[] {
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const erros: ErroCampo[] = [];
  if (typeof b.nome !== 'string' || b.nome.trim() === '') {
    erros.push({ campo: 'nome', mensagem: 'Informe o nome' });
  }
  if (typeof b.email !== 'string' || !b.email.includes('@')) {
    erros.push({ campo: 'email', mensagem: 'E-mail inválido' });
  }
  if (typeof b.idade !== 'number' || !Number.isInteger(b.idade) || b.idade < 18) {
    erros.push({ campo: 'idade', mensagem: 'Precisa ter 18 anos ou mais' });
  }
  if (b.categoria !== 'A' && b.categoria !== 'B') {
    erros.push({ campo: 'categoria', mensagem: 'Escolha a categoria A ou B' });
  }
  return erros;
}

const app = criarApp();

app.post('/api/matriculas', (req) => {
  const erros = validarMatricula(req.body);
  if (erros.length > 0) return { status: 400, body: { erros } };
  const dados = req.body as NovaMatricula; // seguro: acabamos de validar
  if (matriculas.some((m) => m.email === dados.email)) {
    return { status: 409, body: { erros: [{ campo: 'email', mensagem: 'E-mail já matriculado' }] } };
  }
  const nova: Matricula = {
    id: matriculas.length + 1,
    nome: dados.nome,
    email: dados.email,
    idade: dados.idade,
    categoria: dados.categoria,
  };
  matriculas.push(nova);
  return { status: 201, body: nova };
});
`,
    tests: [
      {
        description: 'matrícula válida não tem erros',
        code: `assert.deepStrictEqual(
  validarMatricula({ nome: 'Rita', email: 'rita@exemplo.com', idade: 19, categoria: 'B' }),
  [],
);`,
      },
      {
        description: 'corpo vazio tem os quatro erros, cada um com seu campo',
        code: `assert.deepStrictEqual(validarMatricula({}), [
  { campo: 'nome', mensagem: 'Informe o nome' },
  { campo: 'email', mensagem: 'E-mail inválido' },
  { campo: 'idade', mensagem: 'Precisa ter 18 anos ou mais' },
  { campo: 'categoria', mensagem: 'Escolha a categoria A ou B' },
]);
assert.strictEqual(validarMatricula(null).length, 4);`,
      },
      {
        description: 'idade 17, 18.5 e "20" (texto) são recusadas',
        code: `for (const idade of [17, 18.5, '20']) {
  const erros = validarMatricula({ nome: 'Rita', email: 'rita@exemplo.com', idade, categoria: 'A' });
  assert.deepStrictEqual(erros, [{ campo: 'idade', mensagem: 'Precisa ter 18 anos ou mais' }], 'idade ' + idade);
}`,
      },
      {
        description: 'a rota responde 400 com a lista de erros',
        code: `const r = await app.handle({ method: 'POST', path: '/api/matriculas', body: { nome: 'Rita', email: 'rita' } });
assert.strictEqual(r.status, 400);
assert.deepStrictEqual(r.body, {
  erros: [
    { campo: 'email', mensagem: 'E-mail inválido' },
    { campo: 'idade', mensagem: 'Precisa ter 18 anos ou mais' },
    { campo: 'categoria', mensagem: 'Escolha a categoria A ou B' },
  ],
});`,
      },
      {
        description: 'e-mail repetido responde 409 no campo email',
        code: `const r = await app.handle({
  method: 'POST',
  path: '/api/matriculas',
  body: { nome: 'Cida de novo', email: 'cida@exemplo.com', idade: 64, categoria: 'A' },
});
assert.strictEqual(r.status, 409);
assert.deepStrictEqual(r.body, { erros: [{ campo: 'email', mensagem: 'E-mail já matriculado' }] });`,
      },
      {
        description: 'matrícula válida responde 201 e fica guardada',
        code: `const r = await app.handle({
  method: 'POST',
  path: '/api/matriculas',
  body: { nome: 'Rita', email: 'rita@exemplo.com', idade: 19, categoria: 'B', desconto: 100 },
});
assert.strictEqual(r.status, 201);
assert.deepStrictEqual(r.body, { id: 2, nome: 'Rita', email: 'rita@exemplo.com', idade: 19, categoria: 'B' });
assert.strictEqual(matriculas.length, 2);`,
      },
    ],
    hints: [
      "Comece com `const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;`.",
      'Cada regra é um `if` que faz `erros.push({ campo, mensagem })`, sem `return` no meio, para juntar todos.',
      'Na rota: valide primeiro (400), depois procure o e-mail com `matriculas.some(...)` (409) e só então crie (201).',
    ],
    followUpQuestionIds: ['fullstack.m01.f13', 'fullstack.m01.f14'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.e06',
    lessonId: 'fullstack.m01.l03',
    kind: 'implement',
    title: 'Cada erro no seu campo',
    promptMarkdown: `Agora o front da **Baliza Perfeita**. O envio já está pronto: \`enviarMatricula()\` faz o POST e, quando a API responde 400 ou 409, chama \`mostrarErros(dados.erros)\` (e \`mostrarErros([])\` quando dá certo). Só falta essa função.

Escreva \`mostrarErros(erros)\`, que recebe a lista \`[{ campo, mensagem }]\` do back e:

1. **limpa** os erros antigos: esvazia todos os \`.erro\` e tira o atributo \`aria-invalid\` de todos os inputs;
2. para cada erro, coloca a \`mensagem\` no \`#erro-<campo>\` (ex.: \`#erro-email\`) e marca o input \`#<campo>\` com \`aria-invalid="true"\`.`,
    language: 'web',
    starterFiles: {
      html: MATRICULA_HTML,
      css: MATRICULA_CSS,
      js: `function mostrarErros(erros) {
  // seu código aqui
}

${MATRICULA_ENVIO}${MATRICULA_LISTENER}`,
    },
    solutionFiles: {
      html: MATRICULA_HTML,
      css: MATRICULA_CSS,
      js: `function mostrarErros(erros) {
  document.querySelectorAll('.erro').forEach((span) => {
    span.textContent = '';
  });
  document.querySelectorAll('input').forEach((input) => {
    input.removeAttribute('aria-invalid');
  });
  for (const erro of erros) {
    document.querySelector('#erro-' + erro.campo).textContent = erro.mensagem;
    document.querySelector('#' + erro.campo).setAttribute('aria-invalid', 'true');
  }
}

${MATRICULA_ENVIO}${MATRICULA_LISTENER}`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'cada mensagem vai para o span do seu campo',
        code: `mostrarErros([
  { campo: 'email', mensagem: 'E-mail inválido' },
  { campo: 'idade', mensagem: 'Precisa ter 18 anos ou mais' },
]);
assert.strictEqual(document.querySelector('#erro-email').textContent, 'E-mail inválido');
assert.strictEqual(document.querySelector('#erro-idade').textContent, 'Precisa ter 18 anos ou mais');
assert.strictEqual(document.querySelector('#erro-nome').textContent, '');`,
      },
      {
        description: 'os campos com erro ganham aria-invalid="true"',
        code: `mostrarErros([{ campo: 'nome', mensagem: 'Informe o nome' }]);
assert.strictEqual(document.querySelector('#nome').getAttribute('aria-invalid'), 'true');`,
      },
      {
        description: 'erros antigos somem a cada chamada',
        code: `mostrarErros([{ campo: 'nome', mensagem: 'Informe o nome' }]);
mostrarErros([{ campo: 'idade', mensagem: 'Precisa ter 18 anos ou mais' }]);
assert.strictEqual(document.querySelector('#erro-nome').textContent, '', 'O erro antigo do nome ficou na tela.');
assert.strictEqual(document.querySelector('#nome').hasAttribute('aria-invalid'), false);
assert.strictEqual(document.querySelector('#idade').getAttribute('aria-invalid'), 'true');
mostrarErros([]);
assert.strictEqual(document.querySelector('#erro-idade').textContent, '');`,
      },
      {
        description: 'de ponta a ponta: o 400 do back aparece nos campos',
        code: `document.querySelector('#nome').value = '';
document.querySelector('#email').value = 'rita.com';
document.querySelector('#idade').value = '19';
await enviarMatricula();
assert.strictEqual(document.querySelector('#erro-nome').textContent, 'Informe o nome');
assert.strictEqual(document.querySelector('#erro-email').textContent, 'E-mail inválido');
assert.strictEqual(document.querySelector('#erro-idade').textContent, '');`,
      },
      {
        description: 'de ponta a ponta: o 409 marca o e-mail, e o sucesso limpa tudo',
        code: `document.querySelector('#nome').value = 'Cida';
document.querySelector('#email').value = 'cida@exemplo.com';
document.querySelector('#idade').value = '64';
await enviarMatricula();
assert.strictEqual(document.querySelector('#erro-email').textContent, 'E-mail já matriculado');
document.querySelector('#nome').value = 'Rita';
document.querySelector('#email').value = 'rita@exemplo.com';
document.querySelector('#idade').value = '19';
await enviarMatricula();
assert.strictEqual(document.querySelector('#erro-email').textContent, '');
assert.strictEqual(document.querySelector('#email').hasAttribute('aria-invalid'), false);
assert.strictEqual(document.querySelector('#resultado').textContent, 'Matrícula #2 feita! Bem-vindo(a), Rita.');`,
      },
    ],
    hints: [
      "Para limpar: `document.querySelectorAll('.erro').forEach((span) => { span.textContent = ''; });` e o mesmo com `input.removeAttribute('aria-invalid')`.",
      "Monte o seletor com o campo: `document.querySelector('#erro-' + erro.campo)`.",
      "`input.setAttribute('aria-invalid', 'true')` marca o campo para o leitor de tela.",
    ],
    followUpQuestionIds: ['fullstack.m01.f15', 'fullstack.m01.f16'],
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.e07',
    lessonId: 'fullstack.m01.l03',
    kind: 'implement',
    title: 'Carregando, tentando de novo',
    promptMarkdown: `O servidor da **Clínica Odonto Sorriso de Cotia** é instável (o sobrinho hospedou no computador da recepção). Escreva a função **async** \`carregarHorarios()\`, chamada pelo botão \`#recarregar\`:

1. ao começar: \`#aviso\` mostra \`Carregando...\`, o botão fica **desabilitado** e a lista \`#horarios\` é esvaziada;
2. faça \`GET /api/horarios\` com até **3 tentativas**: tente de novo só se o \`fetch\` **rejeitar** (falha de rede) ou o status for **500 ou mais**. Qualquer outra resposta (2xx ou 4xx) encerra as tentativas;
3. se conseguiu (resposta ok): um \`<li>\` por horário do array e \`#aviso\` vazio;
4. se não conseguiu: \`#aviso\` mostra \`A agenda está fora do ar. Tente de novo em instantes.\`;
5. no fim, em qualquer caso, o botão volta a ficar habilitado.`,
    language: 'web',
    starterFiles: {
      html: HORARIOS_HTML,
      css: HORARIOS_CSS,
      js: `${HORARIOS_TOPO}
async function carregarHorarios() {
  // seu código aqui
}
${HORARIOS_FIM}`,
    },
    solutionFiles: {
      html: HORARIOS_HTML,
      css: HORARIOS_CSS,
      js: `${HORARIOS_TOPO}
async function carregarHorarios() {
  aviso.textContent = 'Carregando...';
  botao.disabled = true;
  lista.innerHTML = '';
  let resposta = null;
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      resposta = await fetch('/api/horarios');
      if (resposta.status < 500) break; // sucesso ou erro definitivo: não adianta repetir
    } catch (erro) {
      resposta = null; // falha de rede: tenta de novo
      console.error('Tentativa ' + tentativa + ' falhou:', erro);
    }
  }
  botao.disabled = false;
  if (!resposta || !resposta.ok) {
    aviso.textContent = 'A agenda está fora do ar. Tente de novo em instantes.';
    return;
  }
  const horarios = await resposta.json();
  aviso.textContent = '';
  for (const horario of horarios) {
    const li = document.createElement('li');
    li.textContent = horario;
    lista.appendChild(li);
  }
}
${HORARIOS_FIM}`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'enquanto carrega: "Carregando..." e botão desabilitado; depois, botão de volta',
        code: `const espera = carregarHorarios();
assert.strictEqual(document.querySelector('#aviso').textContent, 'Carregando...');
assert.strictEqual(document.querySelector('#recarregar').disabled, true, 'Desabilite o botão enquanto carrega.');
await espera;
assert.strictEqual(document.querySelector('#recarregar').disabled, false, 'O botão precisa voltar no fim.');`,
      },
      {
        description: 'servidor bom: mostra os horários e limpa o aviso',
        code: `window.__chamadas = [];
await carregarHorarios();
const itens = [...document.querySelectorAll('#horarios li')].map((li) => li.textContent);
assert.deepStrictEqual(itens, ['08:00', '10:30', '15:00']);
assert.strictEqual(document.querySelector('#aviso').textContent, '');
assert.strictEqual(window.__chamadas.length, 1);`,
      },
      {
        description: 'falhou 2 vezes (rede e 503): tenta de novo e consegue na 3ª',
        code: `window.__chamadas = [];
window.__falhas = 2;
await carregarHorarios();
assert.strictEqual(window.__chamadas.length, 3, 'Esperava 3 tentativas.');
assert.strictEqual(document.querySelectorAll('#horarios li').length, 3);`,
      },
      {
        description: 'falha sem parar: desiste depois de 3 tentativas com mensagem amigável',
        code: `window.__chamadas = [];
window.__falhas = 10;
try {
  await carregarHorarios();
} finally {
  window.__falhas = 0;
}
assert.strictEqual(window.__chamadas.length, 3, 'Esperava exatamente 3 tentativas.');
assert.strictEqual(document.querySelector('#aviso').textContent, 'A agenda está fora do ar. Tente de novo em instantes.');
assert.strictEqual(document.querySelectorAll('#horarios li').length, 0);
assert.strictEqual(document.querySelector('#recarregar').disabled, false);`,
      },
      {
        description: 'erro 404 não é repetido (não adianta insistir)',
        code: `window.__chamadas = [];
window.__statusFixo = 404;
try {
  await carregarHorarios();
} finally {
  window.__statusFixo = null;
}
assert.strictEqual(window.__chamadas.length, 1, 'Um 4xx vai falhar igual: não tente de novo.');
assert.strictEqual(document.querySelector('#aviso').textContent, 'A agenda está fora do ar. Tente de novo em instantes.');`,
      },
    ],
    hints: [
      'Use um `for` de 1 a 3 com `try/catch` dentro: o `catch` pega a falha de rede.',
      'Dentro do `try`, se `resposta.status < 500`, use `break`: sucesso ou 4xx não se repetem.',
      'Depois do laço, reabilite o botão e decida: sem resposta ou `!resposta.ok` → mensagem amigável; senão, desenhe a lista.',
    ],
    followUpQuestionIds: ['fullstack.m01.f17', 'fullstack.m01.f18'],
    difficulty: 3,
  },
  {
    id: 'fullstack.m01.d03',
    lessonId: 'fullstack.m01.l03',
    kind: 'debug',
    title: 'O front que culpava o back',
    promptMarkdown: `Na tela de agendar aula prática da **Baliza Perfeita**, qualquer problema mostra \`Ops! Nosso servidor caiu. Tente mais tarde.\`, até quando o aluno só digitou o horário errado. Os alunos ligam reclamando do "servidor", e o "você do back" está ofendido.

Conserte \`agendarAula()\`:

- no começo de cada envio, limpe os \`.erro\` e o \`#msg\`;
- **400**: mostre cada erro no \`#erro-<campo>\` (o back manda \`{ erros: [{ campo, mensagem }] }\`), sem mensagem geral;
- outros erros (5xx): aí sim, \`#msg\` com \`Ops! Nosso servidor caiu. Tente mais tarde.\`;
- sucesso: \`#msg\` com \`Aula #31 agendada!\`.`,
    language: 'web',
    starterFiles: {
      html: AULA_HTML,
      css: AULA_CSS,
      js: `const msg = document.querySelector('#msg');

async function agendarAula() {
  const corpo = {
    aluno: document.querySelector('#aluno').value,
    data: document.querySelector('#data').value,
    horario: document.querySelector('#horario').value,
  };
  const resposta = await fetch('/api/aulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    msg.textContent = 'Ops! Nosso servidor caiu. Tente mais tarde.';
    return;
  }
  msg.textContent = 'Aula #' + dados.id + ' agendada!';
}
${AULA_LISTENER}`,
    },
    solutionFiles: {
      html: AULA_HTML,
      css: AULA_CSS,
      js: `const msg = document.querySelector('#msg');

async function agendarAula() {
  document.querySelectorAll('.erro').forEach((span) => {
    span.textContent = '';
  });
  msg.textContent = '';
  const corpo = {
    aluno: document.querySelector('#aluno').value,
    data: document.querySelector('#data').value,
    horario: document.querySelector('#horario').value,
  };
  const resposta = await fetch('/api/aulas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  const dados = await resposta.json();
  if (resposta.status === 400) {
    for (const erro of dados.erros) {
      document.querySelector('#erro-' + erro.campo).textContent = erro.mensagem;
    }
    return;
  }
  if (!resposta.ok) {
    msg.textContent = 'Ops! Nosso servidor caiu. Tente mais tarde.';
    return;
  }
  msg.textContent = 'Aula #' + dados.id + ' agendada!';
}
${AULA_LISTENER}`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'horário fora do expediente: erro no campo, sem culpar o servidor',
        code: `await agendarAula();
assert.strictEqual(document.querySelector('#erro-horario').textContent, 'Aulas entre 08:00 e 18:00');
assert.strictEqual(document.querySelector('#msg').textContent, '', 'Erro 400 não é culpa do servidor.');`,
      },
      {
        description: 'servidor fora do ar (500): mensagem geral amigável',
        code: `window.__servidorCaiu = true;
try {
  await agendarAula();
} finally {
  window.__servidorCaiu = false;
}
assert.strictEqual(document.querySelector('#msg').textContent, 'Ops! Nosso servidor caiu. Tente mais tarde.');`,
      },
      {
        description: 'depois de corrigir, os erros antigos somem e a aula é agendada',
        code: `document.querySelector('#horario').value = '07:00';
await agendarAula();
document.querySelector('#horario').value = '09:00';
await agendarAula();
assert.strictEqual(document.querySelector('#erro-horario').textContent, '', 'O erro antigo ficou na tela.');
assert.strictEqual(document.querySelector('#msg').textContent, 'Aula #31 agendada!');`,
      },
    ],
    hints: [
      'Separe os casos pelo status: `if (resposta.status === 400) { ... }` antes do `if (!resposta.ok)`.',
      "Os erros vêm em `dados.erros`; cada um vai para `document.querySelector('#erro-' + erro.campo)`.",
      'Limpe os `.erro` e o `#msg` logo no começo da função.',
    ],
    followUpQuestionIds: ['fullstack.m01.f19', 'fullstack.m01.f20'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'fullstack.m01.q18',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Por que cada erro do 400 vem com `campo`, além da `mensagem`?',
    options: [
      'Para o front mostrar cada mensagem embaixo do input certo',
      'Para o back saber onde salvar o erro',
      'Porque o JSON exige duas chaves por objeto',
      'Para o navegador traduzir a mensagem',
    ],
    answerIndex: 0,
    explanation:
      'Com o `campo`, o front monta `#erro-email` e marca o input certo. Só com a mensagem, ele teria que adivinhar.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q19',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'true-false',
    prompt:
      'Se a API respondeu 400, vale a pena o front repetir o mesmo pedido automaticamente algumas vezes.',
    answer: false,
    explanation:
      'Um 400 diz que os dados estão errados: o mesmo pedido vai falhar igual. Retry é para falha de rede e 5xx, que podem ser passageiros.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'fullstack.m01.q20',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'O aluno tenta se matricular com um e-mail que já está cadastrado. Qual status combina melhor?',
    options: ['409 (conflito)', '201 (criado)', '500 (erro do servidor)', '404 (não encontrado)'],
    answerIndex: 0,
    explanation: 'O pedido em si está bem formado, mas conflita com o que já existe. É o caso do 409.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q21',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'true-false',
    prompt:
      'Quando o servidor quebra (500), é boa prática mandar a pilha do erro (`stack`) na resposta para o front mostrar.',
    answer: false,
    explanation:
      'A pilha expõe detalhes internos e não ajuda o cliente. Mande uma mensagem genérica e registre os detalhes no log do servidor.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q22',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Por que desabilitar o botão de enviar enquanto a requisição está em andamento?',
    options: [
      'Para o cliente aflito não clicar várias vezes e criar pedidos repetidos',
      'Para a requisição ficar mais rápida',
      'Porque o `fetch` cancela se o botão estiver habilitado',
      'Para esconder o botão do leitor de tela',
    ],
    answerIndex: 0,
    explanation:
      'Cada clique seria um POST novo. Botão desabilitado + "Enviando..." deixa claro que é só esperar.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q23',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para avisar o leitor de tela que o campo está com erro.',
    code: `input.setAttribute('aria-___', 'true');`,
    acceptedAnswers: ['invalid'],
    explanation:
      '`aria-invalid="true"` marca o campo como inválido; junto com `aria-describedby`, o leitor de tela lê a mensagem.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.q24',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'predict-output',
    prompt: 'O front organiza os erros do back por campo. O que este código imprime?',
    code: `const erros = [
  { campo: 'email', mensagem: 'E-mail inválido' },
  { campo: 'idade', mensagem: 'Menor de idade' },
];
const porCampo = {};
for (const erro of erros) porCampo[erro.campo] = erro.mensagem;
console.log(Object.keys(porCampo).join(','));
console.log(porCampo.idade);`,
    expectedOutput: 'email,idade\nMenor de idade',
    explanation:
      'Cada erro vira uma chave (o campo) com a mensagem como valor. Fácil de consultar ao desenhar o formulário.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q25',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Qual mensagem é melhor para o cliente quando a API está fora do ar?',
    options: [
      '"A agenda está fora do ar. Tente de novo em instantes."',
      '"Error: 503 Service Unavailable at fetchHorarios (app.js:42)"',
      '"undefined"',
      '"Erro do back-end, fale com o dev do back"',
    ],
    answerIndex: 0,
    explanation:
      'Diga o que aconteceu e o que fazer, em palavras simples. O detalhe técnico vai para o `console.error`.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.q26',
    lessonIds: ['fullstack.m01.l03'],
    kind: 'multiple-choice',
    prompt: 'Num retry automático, por que limitar o número de tentativas?',
    options: [
      'Para não ficar repetindo para sempre (e martelando um servidor que já está sofrendo)',
      'Porque o navegador só deixa fazer 3 requisições por página',
      'Porque a segunda tentativa sempre funciona',
      'Para economizar memória do `fetch`',
    ],
    answerIndex: 0,
    explanation: 'Sem limite, uma queda vira um laço infinito de pedidos. Desista com uma mensagem amigável.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'fullstack.m01.f13',
    lessonIds: ['fullstack.m01.l03'],
    exerciseId: 'fullstack.m01.e05',
    kind: 'multiple-choice',
    prompt: 'Na sua rota de matrícula, por que validar (400) **antes** de procurar o e-mail repetido (409)?',
    options: [
      'Porque só faz sentido comparar o e-mail depois de saber que ele é um texto válido',
      'Porque o 409 é mais importante que o 400',
      'Porque o `some` não funciona com arrays vazios',
      'Tanto faz a ordem: sempre dá o mesmo status',
    ],
    answerIndex: 0,
    explanation:
      'Com dados inválidos, o 400 já explica o problema. O conflito só é checado para um pedido bem formado.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f14',
    lessonIds: ['fullstack.m01.l03'],
    exerciseId: 'fullstack.m01.e05',
    kind: 'true-false',
    prompt:
      'No seu `validarMatricula`, um corpo `{}` devolve os quatro erros de uma vez, em vez de parar no primeiro.',
    answer: true,
    explanation:
      'Cada `if` só faz `push`. O front recebe tudo de uma vez e o aluno corrige o formulário num envio só.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f15',
    lessonIds: ['fullstack.m01.l03'],
    exerciseId: 'fullstack.m01.e06',
    kind: 'multiple-choice',
    prompt: 'No seu `mostrarErros`, o que acontecia se você não limpasse os erros antigos?',
    options: [
      'Um "Informe o nome" ficaria na tela mesmo depois de o nome ser preenchido',
      'O `fetch` falharia',
      'Os erros novos não apareceriam',
      'Nada: o navegador limpa sozinho',
    ],
    answerIndex: 0,
    explanation:
      'Cada resposta descreve o estado atual. Sem limpar, a tela mistura erros de envios diferentes.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f16',
    lessonIds: ['fullstack.m01.l03'],
    exerciseId: 'fullstack.m01.e06',
    kind: 'multiple-choice',
    prompt:
      'No seu `mostrarErros`, para o erro `{ campo: \'email\', ... }`, qual elemento recebe `aria-invalid="true"`?',
    options: ['O input `#email`', 'O span `#erro-email`', 'O formulário inteiro', 'O botão de enviar'],
    answerIndex: 0,
    explanation:
      'Quem está inválido é o campo. O span só mostra o texto, ligado ao input pelo `aria-describedby`.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f17',
    lessonIds: ['fullstack.m01.l03'],
    exerciseId: 'fullstack.m01.e07',
    kind: 'multiple-choice',
    prompt: 'No seu `carregarHorarios`, como a falha de rede chega até o seu código?',
    options: [
      'O `fetch` rejeita, e o `catch` dentro do laço pega e deixa tentar de novo',
      'O `fetch` resolve com status 0',
      'O `resposta.json()` devolve `null`',
      'O navegador recarrega a página',
    ],
    answerIndex: 0,
    explanation:
      'Sem resposta nenhuma, o `fetch` rejeita. Já um 503 chega como resposta normal, com `status` 503.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f18',
    lessonIds: ['fullstack.m01.l03'],
    exerciseId: 'fullstack.m01.e07',
    kind: 'true-false',
    prompt: 'No seu `carregarHorarios`, uma resposta 404 encerra as tentativas logo na primeira vez.',
    answer: true,
    explanation: 'O `if (resposta.status < 500) break;` sai do laço: 404 não melhora insistindo.',
    difficulty: 2,
  },
  {
    id: 'fullstack.m01.f19',
    lessonIds: ['fullstack.m01.l03'],
    exerciseId: 'fullstack.m01.d03',
    kind: 'multiple-choice',
    prompt: 'No `agendarAula` com defeito, por que um horário errado mostrava "servidor caiu"?',
    options: [
      'Porque todo `!resposta.ok` (inclusive o 400) caía na mesma mensagem de servidor fora do ar',
      'Porque o servidor estava mesmo fora do ar',
      'Porque o `fetch` rejeita com 400',
      'Porque faltava `JSON.stringify` no corpo',
    ],
    answerIndex: 0,
    explanation: '`ok` é falso para 4xx e 5xx. É preciso separar pelo `status` para culpar o lado certo.',
    difficulty: 1,
  },
  {
    id: 'fullstack.m01.f20',
    lessonIds: ['fullstack.m01.l03'],
    exerciseId: 'fullstack.m01.d03',
    kind: 'multiple-choice',
    prompt: 'No seu `agendarAula` consertado, qual `if` precisa vir primeiro?',
    options: [
      '`if (resposta.status === 400)`, antes do `if (!resposta.ok)`',
      '`if (!resposta.ok)`, antes do `if (resposta.status === 400)`',
      'Tanto faz a ordem',
      'Nenhum: basta um `try/catch`',
    ],
    answerIndex: 0,
    explanation:
      'O 400 também tem `ok` falso. Se o `!resposta.ok` viesse antes, ele pegaria o 400 e mostraria a mensagem errada.',
    difficulty: 2,
  },
];
