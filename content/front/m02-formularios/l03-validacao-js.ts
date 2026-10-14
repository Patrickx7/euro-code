import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { ENVIAR } from './test-helpers';

export const lesson: Lesson = {
  id: 'front.m02.l03',
  moduleId: 'front.m02',
  order: 3,
  title: 'Validação com JS na hora do envio',
  concepts: [
    'evento submit',
    'preventDefault',
    'ler e limpar valores',
    'mensagem de erro perto do campo',
    'limpar erros antigos',
    'função de validação',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `O navegador valida o básico, mas o cliente sempre quer mais: "a confirmação de senha tem que bater", "a mensagem de erro tem que ser **embaixo** do campo, em vermelho, igual no site do concorrente". Hora do JS.

## O evento submit

Escute o \`submit\` do **formulário**, não o clique do botão: assim o Enter no teclado também conta.

\`\`\`js
form.addEventListener('submit', function (event) {
  event.preventDefault(); // não recarrega a página
  // ... validar
});
\`\`\`

Por padrão, enviar um formulário **recarrega a página** (ou vai para o endereço do \`action\`), e tudo que o JS fez some. \`event.preventDefault()\` cancela esse comportamento padrão e deixa o JS no comando. Com \`novalidate\` no \`<form>\`, o \`submit\` dispara mesmo com campos vazios e quem decide é você.`,
    },
    {
      kind: 'text',
      markdown: `## O roteiro de toda validação

1. **Limpe os erros antigos**: apague as mensagens e tire a classe de erro de todo campo. Senão, o erro de ontem fica na tela mesmo depois de corrigido.
2. **Leia os valores** dentro do \`submit\`, com \`.trim()\` (espaço não é nome).
3. **Teste cada regra**; para cada problema, escreva a mensagem num elemento **perto do campo** (um \`<small class="erro">\` logo abaixo) e marque o campo com uma classe, tipo \`invalido\`.
4. **Só se não houve erro**, siga em frente: mostre "enviado!", mande os dados...

Separar a regra numa **função de validação** deixa tudo mais fácil de testar: ela recebe os dados e devolve os erros, sem mexer na tela.

\`\`\`js
function validar(dados) {
  const erros = {};
  if (dados.nome.trim() === '') erros.nome = 'Informe o nome.';
  return erros; // {} = tudo certo
}
\`\`\`

\`Object.keys(erros).length === 0\` diz se o objeto está vazio, ou seja, se passou.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<form id="contato" novalidate>
  <label for="nome">Nome</label>
  <input id="nome" name="nome">
  <small class="erro" id="erro-nome"></small>
  <button type="submit">Enviar</button>
</form>
<p id="status"></p>

<script>
  const form = document.querySelector('#contato');
  const nome = document.querySelector('#nome');
  const erroNome = document.querySelector('#erro-nome');
  const status = document.querySelector('#status');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    // 1. limpa
    erroNome.textContent = '';
    nome.classList.remove('invalido');
    status.textContent = '';
    // 2 e 3. lê e testa
    if (nome.value.trim() === '') {
      erroNome.textContent = 'Informe seu nome.';
      nome.classList.add('invalido');
      return; // 4. com erro, para aqui
    }
    status.textContent = 'Enviado!';
  });
</script>`,
      explanation:
        'Limpar no começo garante que, ao corrigir o campo e enviar de novo, a mensagem antiga some. O `return` encerra a função antes do "Enviado!".',
    },
  ],
  checkQuestionIds: ['front.m02.q17', 'front.m02.q18'],
  exerciseIds: ['front.m02.e05', 'front.m02.e06'],
  debugExerciseIds: ['front.m02.d03'],
};

const CONTATO_HTML = `<h2>Fale com a Imobiliária Chave Torta</h2>
<form id="contato" novalidate>
  <label for="nome">Nome</label>
  <input id="nome" name="nome">
  <small class="erro" id="erro-nome"></small>
  <label for="email">E-mail</label>
  <input id="email" name="email">
  <small class="erro" id="erro-email"></small>
  <button type="submit">Quero visitar</button>
</form>
<p id="status"></p>`;

const CONTATO_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 4px; max-width: 320px; }
.erro { color: #c0392b; min-height: 1em; }
.invalido { border: 2px solid #c0392b; }`;

const CADASTRO_HTML = `<h2>Crie sua conta: Academia Supino Torto</h2>
<form id="cadastro" novalidate>
  <label for="nome">Nome</label>
  <input id="nome" name="nome">
  <small class="erro" id="erro-nome"></small>
  <label for="email">E-mail</label>
  <input id="email" name="email">
  <small class="erro" id="erro-email"></small>
  <label for="senha">Senha</label>
  <input id="senha" name="senha" type="password">
  <small class="erro" id="erro-senha"></small>
  <label for="confirmacao">Confirme a senha</label>
  <input id="confirmacao" name="confirmacao" type="password">
  <small class="erro" id="erro-confirmacao"></small>
  <button type="submit">Criar conta</button>
</form>
<p id="status"></p>`;

const CADASTRO_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 4px; max-width: 320px; }
.erro { color: #c0392b; min-height: 1em; }`;

const CADASTRO_WIRING = `
// Este trecho já estava pronto: mostra na tela os erros que validarCadastro devolve.
form.addEventListener('submit', function (event) {
  event.preventDefault();
  const dados = Object.fromEntries(new FormData(form));
  const erros = validarCadastro(dados);
  form.querySelectorAll('.erro').forEach(function (el) {
    el.textContent = '';
  });
  for (const campo in erros) {
    document.querySelector('#erro-' + campo).textContent = erros[campo];
  }
  const ok = Object.keys(erros).length === 0;
  document.querySelector('#status').textContent = ok ? 'Conta criada! Bora treinar.' : '';
});
`;

const OFICINA_HTML = `<h2>Agendar revisão: Auto Center Bigode</h2>
<form id="revisao" novalidate>
  <label for="placa">Placa</label>
  <input id="placa" name="placa">
  <small class="erro" id="erro-placa"></small>
  <label for="km">Quilometragem</label>
  <input id="km" name="km" type="number">
  <small class="erro" id="erro-km"></small>
  <button type="submit">Agendar</button>
</form>
<p id="status"></p>`;

const OFICINA_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 4px; max-width: 320px; }
.erro { color: #c0392b; }
.invalido { border: 2px solid #c0392b; }`;

export const exercises: Exercise[] = [
  {
    id: 'front.m02.e05',
    lessonId: 'front.m02.l03',
    kind: 'implement',
    title: 'Contato da imobiliária',
    promptMarkdown: `A **Imobiliária Chave Torta** recebe 30 contatos por dia "sem nome e com e-mail \`asdf\`". Faça a validação no \`submit\` do \`#contato\` (que já tem \`novalidate\`):

1. cancele o envio padrão com \`event.preventDefault()\`;
2. limpe os erros antigos: \`#erro-nome\`, \`#erro-email\` e \`#status\` vazios, e nenhum campo com a classe \`invalido\`;
3. nome vazio (ou só espaços): \`#erro-nome\` mostra \`Informe seu nome.\` e \`#nome\` ganha a classe \`invalido\`;
4. e-mail sem \`@\`: \`#erro-email\` mostra \`Digite um e-mail válido.\` e \`#email\` ganha a classe \`invalido\`;
5. sem nenhum erro: \`#status\` mostra \`Recebemos seu contato! Um corretor liga em até 1 dia útil.\``,
    language: 'web',
    starterFiles: {
      html: CONTATO_HTML,
      css: CONTATO_CSS,
      js: `const form = document.querySelector('#contato');
const nome = document.querySelector('#nome');
const email = document.querySelector('#email');
const erroNome = document.querySelector('#erro-nome');
const erroEmail = document.querySelector('#erro-email');
const status = document.querySelector('#status');

form.addEventListener('submit', function (event) {
  // seu código aqui
});
`,
    },
    solutionFiles: {
      html: CONTATO_HTML,
      css: CONTATO_CSS,
      js: `const form = document.querySelector('#contato');
const nome = document.querySelector('#nome');
const email = document.querySelector('#email');
const erroNome = document.querySelector('#erro-nome');
const erroEmail = document.querySelector('#erro-email');
const status = document.querySelector('#status');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  erroNome.textContent = '';
  erroEmail.textContent = '';
  status.textContent = '';
  nome.classList.remove('invalido');
  email.classList.remove('invalido');

  let temErro = false;
  if (nome.value.trim() === '') {
    erroNome.textContent = 'Informe seu nome.';
    nome.classList.add('invalido');
    temErro = true;
  }
  if (!email.value.includes('@')) {
    erroEmail.textContent = 'Digite um e-mail válido.';
    email.classList.add('invalido');
    temErro = true;
  }
  if (!temErro) {
    status.textContent = 'Recebemos seu contato! Um corretor liga em até 1 dia útil.';
  }
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'o envio padrão é cancelado com preventDefault',
        code: `${ENVIAR}const envio = enviar();
assert.ok(envio.disparou, 'O submit deveria disparar (o form tem novalidate).');
assert.ok(envio.prevenido, 'Chame event.preventDefault() no submit.');`,
      },
      {
        description: 'com tudo vazio, os dois erros aparecem e os campos ficam marcados',
        code: `${ENVIAR}enviar();
assert.strictEqual(document.querySelector('#erro-nome').textContent, 'Informe seu nome.');
assert.strictEqual(document.querySelector('#erro-email').textContent, 'Digite um e-mail válido.');
assert.ok(document.querySelector('#nome').classList.contains('invalido'), '#nome deveria ter a classe invalido.');
assert.ok(document.querySelector('#email').classList.contains('invalido'), '#email deveria ter a classe invalido.');
assert.strictEqual(document.querySelector('#status').textContent, '', 'Com erro, #status fica vazio.');`,
      },
      {
        description: 'corrigindo só o nome, o erro do nome some e o do e-mail fica',
        code: `${ENVIAR}document.querySelector('#nome').value = 'Bia';
document.querySelector('#email').value = 'bia';
enviar();
assert.strictEqual(document.querySelector('#erro-nome').textContent, '', 'O erro do nome deveria sumir. Você limpa os erros antes de validar?');
assert.ok(!document.querySelector('#nome').classList.contains('invalido'), '#nome não deveria mais ter a classe invalido.');
assert.strictEqual(document.querySelector('#erro-email').textContent, 'Digite um e-mail válido.');`,
      },
      {
        description: 'com tudo certo, nenhum erro e a mensagem de sucesso aparece',
        code: `${ENVIAR}document.querySelector('#email').value = 'bia@exemplo.example';
enviar();
assert.strictEqual(document.querySelector('#erro-nome').textContent, '');
assert.strictEqual(document.querySelector('#erro-email').textContent, '');
assert.strictEqual(document.querySelectorAll('.invalido').length, 0, 'Nenhum campo deveria ficar com a classe invalido.');
assert.strictEqual(document.querySelector('#status').textContent, 'Recebemos seu contato! Um corretor liga em até 1 dia útil.');`,
      },
      {
        description: 'nome só com espaços não vale',
        code: `${ENVIAR}document.querySelector('#nome').value = '    ';
enviar();
assert.strictEqual(document.querySelector('#erro-nome').textContent, 'Informe seu nome.', 'Use trim() antes de checar se está vazio.');
assert.strictEqual(document.querySelector('#status').textContent, '', 'A mensagem de sucesso antiga deveria sumir.');`,
      },
    ],
    hints: [
      "Comece com `event.preventDefault();` e depois zere tudo: `textContent = ''` nas mensagens e `classList.remove('invalido')` nos campos.",
      'Use uma variável `let temErro = false;` e mude para `true` em cada `if` que achar problema. No fim, `if (!temErro)` mostra o sucesso.',
    ],
    followUpQuestionIds: ['front.m02.f13', 'front.m02.f14'],
    difficulty: 2,
  },
  {
    id: 'front.m02.e06',
    lessonId: 'front.m02.l03',
    kind: 'implement',
    title: 'Função de validação do cadastro',
    promptMarkdown: `A **Academia Supino Torto** quer cadastro online. A parte que mostra os erros na tela já está pronta; falta a regra.

Escreva \`validarCadastro(dados)\`. Ela recebe \`{ nome, email, senha, confirmacao }\` (textos) e **devolve um objeto de erros**, só com os campos que têm problema:

| Campo | Regra | Mensagem |
| --- | --- | --- |
| \`nome\` | não pode ser vazio (ignore espaços) | \`Informe o nome.\` |
| \`email\` | precisa ter \`@\` e, **depois** do \`@\`, um \`.\` | \`E-mail inválido.\` |
| \`senha\` | pelo menos 8 caracteres | \`A senha precisa de 8 caracteres ou mais.\` |
| \`confirmacao\` | igual à senha | \`As senhas não conferem.\` |

Tudo certo? Devolva \`{}\`. Os testes chamam a função com vários dados.`,
    language: 'web',
    starterFiles: {
      html: CADASTRO_HTML,
      css: CADASTRO_CSS,
      js: `const form = document.querySelector('#cadastro');

function validarCadastro(dados) {
  const erros = {};
  // suas regras aqui
  return erros;
}
${CADASTRO_WIRING}`,
    },
    solutionFiles: {
      html: CADASTRO_HTML,
      css: CADASTRO_CSS,
      js: `const form = document.querySelector('#cadastro');

function validarCadastro(dados) {
  const erros = {};
  if (dados.nome.trim() === '') {
    erros.nome = 'Informe o nome.';
  }
  const arroba = dados.email.indexOf('@');
  if (arroba < 1 || !dados.email.slice(arroba + 1).includes('.')) {
    erros.email = 'E-mail inválido.';
  }
  if (dados.senha.length < 8) {
    erros.senha = 'A senha precisa de 8 caracteres ou mais.';
  }
  if (dados.confirmacao !== dados.senha) {
    erros.confirmacao = 'As senhas não conferem.';
  }
  return erros;
}
${CADASTRO_WIRING}`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'dados certos devolvem {}',
        code: `assert.deepStrictEqual(
  validarCadastro({ nome: 'Duda', email: 'duda@exemplo.example', senha: 'supino123', confirmacao: 'supino123' }),
  {},
);`,
      },
      {
        description: 'nome vazio ou só com espaços',
        code: `const base = { email: 'duda@exemplo.example', senha: 'supino123', confirmacao: 'supino123' };
assert.deepStrictEqual(validarCadastro(Object.assign({ nome: '' }, base)), { nome: 'Informe o nome.' });
assert.deepStrictEqual(validarCadastro(Object.assign({ nome: '   ' }, base)), { nome: 'Informe o nome.' });`,
      },
      {
        description: 'e-mail sem @ ou sem ponto depois do @',
        code: `const base = { nome: 'Duda', senha: 'supino123', confirmacao: 'supino123' };
['duda', 'duda.exemplo', 'duda@exemplo', ''].forEach(function (email) {
  assert.deepStrictEqual(validarCadastro(Object.assign({ email: email }, base)), { email: 'E-mail inválido.' }, '"' + email + '" deveria ser recusado.');
});
assert.deepStrictEqual(validarCadastro(Object.assign({ email: 'd@x.example' }, base)), {});`,
      },
      {
        description: 'senha curta e confirmação diferente',
        code: `assert.deepStrictEqual(
  validarCadastro({ nome: 'Duda', email: 'duda@exemplo.example', senha: '1234567', confirmacao: '1234567' }),
  { senha: 'A senha precisa de 8 caracteres ou mais.' },
);
assert.deepStrictEqual(
  validarCadastro({ nome: 'Duda', email: 'duda@exemplo.example', senha: 'supino123', confirmacao: 'supino321' }),
  { confirmacao: 'As senhas não conferem.' },
);`,
      },
      {
        description: 'vários erros de uma vez',
        code: `const erros = validarCadastro({ nome: '', email: 'x', senha: '123', confirmacao: '' });
assert.deepStrictEqual(Object.keys(erros).sort(), ['confirmacao', 'email', 'nome', 'senha']);`,
      },
      {
        description: 'no formulário, os erros aparecem embaixo dos campos',
        code: `${ENVIAR}document.querySelector('#nome').value = 'Duda';
document.querySelector('#email').value = 'duda';
document.querySelector('#senha').value = 'supino123';
document.querySelector('#confirmacao').value = 'supino123';
enviar();
assert.strictEqual(document.querySelector('#erro-email').textContent, 'E-mail inválido.');
assert.strictEqual(document.querySelector('#status').textContent, '');`,
      },
    ],
    hints: [
      "Um `if` por regra; em cada um, `erros.campo = 'mensagem';`. Não crie a chave quando está tudo certo.",
      "Para o e-mail: `const arroba = dados.email.indexOf('@');` (dá -1 se não tem) e depois `dados.email.slice(arroba + 1).includes('.')`.",
    ],
    followUpQuestionIds: ['front.m02.f15', 'front.m02.f16'],
    difficulty: 2,
  },
  {
    id: 'front.m02.d03',
    lessonId: 'front.m02.l03',
    kind: 'debug',
    title: 'O erro que não vai embora',
    promptMarkdown: `O Bigode, do **Auto Center Bigode**, liga bravo: "o cliente esqueceu a placa, aí preencheu, mas o site continua dizendo **Informe a placa** e não agenda nunca!".

Conserte o script: depois que o cliente corrige os campos e envia de novo, os erros e as classes \`invalido\` antigos precisam sumir e \`#status\` deve mostrar \`Revisão agendada!\`.`,
    language: 'web',
    starterFiles: {
      html: OFICINA_HTML,
      css: OFICINA_CSS,
      js: `const form = document.querySelector('#revisao');
const placa = document.querySelector('#placa');
const km = document.querySelector('#km');
const erroPlaca = document.querySelector('#erro-placa');
const erroKm = document.querySelector('#erro-km');
const status = document.querySelector('#status');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (placa.value.trim() === '') {
    erroPlaca.textContent = 'Informe a placa.';
    placa.classList.add('invalido');
  }
  if (km.value === '') {
    erroKm.textContent = 'Informe a quilometragem.';
    km.classList.add('invalido');
  }
  if (erroPlaca.textContent === '' && erroKm.textContent === '') {
    status.textContent = 'Revisão agendada!';
  }
});
`,
    },
    solutionFiles: {
      html: OFICINA_HTML,
      css: OFICINA_CSS,
      js: `const form = document.querySelector('#revisao');
const placa = document.querySelector('#placa');
const km = document.querySelector('#km');
const erroPlaca = document.querySelector('#erro-placa');
const erroKm = document.querySelector('#erro-km');
const status = document.querySelector('#status');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  erroPlaca.textContent = '';
  erroKm.textContent = '';
  status.textContent = '';
  placa.classList.remove('invalido');
  km.classList.remove('invalido');

  if (placa.value.trim() === '') {
    erroPlaca.textContent = 'Informe a placa.';
    placa.classList.add('invalido');
  }
  if (km.value === '') {
    erroKm.textContent = 'Informe a quilometragem.';
    km.classList.add('invalido');
  }
  if (erroPlaca.textContent === '' && erroKm.textContent === '') {
    status.textContent = 'Revisão agendada!';
  }
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'com tudo vazio, os dois erros aparecem',
        code: `${ENVIAR}enviar();
assert.strictEqual(document.querySelector('#erro-placa').textContent, 'Informe a placa.');
assert.strictEqual(document.querySelector('#erro-km').textContent, 'Informe a quilometragem.');`,
      },
      {
        description: 'corrigindo a placa, o erro dela some',
        code: `${ENVIAR}document.querySelector('#placa').value = 'BIG-0D3';
enviar();
assert.strictEqual(document.querySelector('#erro-placa').textContent, '', 'A placa foi preenchida; o erro dela deveria sumir.');
assert.ok(!document.querySelector('#placa').classList.contains('invalido'), '#placa não deveria mais ter a classe invalido.');
assert.strictEqual(document.querySelector('#erro-km').textContent, 'Informe a quilometragem.');`,
      },
      {
        description: 'com tudo preenchido, agenda a revisão',
        code: `${ENVIAR}document.querySelector('#km').value = '84000';
enviar();
assert.strictEqual(document.querySelectorAll('.invalido').length, 0, 'Nenhum campo deveria ficar com a classe invalido.');
assert.strictEqual(document.querySelector('#status').textContent, 'Revisão agendada!');`,
      },
      {
        description: 'apagar a placa depois de agendar tira a mensagem de sucesso',
        code: `${ENVIAR}document.querySelector('#placa').value = '';
enviar();
assert.strictEqual(document.querySelector('#erro-placa').textContent, 'Informe a placa.');
assert.strictEqual(document.querySelector('#status').textContent, '', 'Com erro, o "Revisão agendada!" antigo deveria sumir.');`,
      },
    ],
    hints: [
      'Envie uma vez com tudo vazio e depois preencha. Em que momento o texto `Informe a placa.` volta a ficar vazio?',
      'Antes dos `if`, zere as mensagens e o `#status` e tire a classe `invalido` dos dois campos.',
    ],
    followUpQuestionIds: ['front.m02.f17', 'front.m02.f18'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m02.q17',
    lessonIds: ['front.m02.l03'],
    kind: 'multiple-choice',
    prompt: 'O que `event.preventDefault()` faz dentro do `submit` de um formulário?',
    options: [
      'Cancela o envio padrão, que recarregaria a página',
      'Apaga todos os campos',
      'Valida os campos com as regras do HTML',
      'Impede que outros scripts leiam o formulário',
    ],
    answerIndex: 0,
    explanation: 'Sem ele, o navegador envia e recarrega a página, e tudo que o JS mostrou some.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q18',
    lessonIds: ['front.m02.l03'],
    kind: 'true-false',
    prompt:
      'É melhor escutar o `submit` do formulário do que o `click` do botão, porque o Enter dentro de um campo também envia.',
    answer: true,
    explanation:
      'O `submit` dispara pelo botão e pelo Enter. O `click` do botão deixa o Enter passar sem validação.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'front.m02.q19',
    lessonIds: ['front.m02.l03'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function validar(dados) {
  const erros = {};
  if (dados.nome.trim() === '') erros.nome = 'Informe o nome.';
  if (dados.idade < 18) erros.idade = 'Só maiores de 18.';
  return erros;
}
const erros = validar({ nome: '  ', idade: 30 });
console.log(Object.keys(erros).length);
console.log(erros.nome);
console.log(erros.idade);`,
    expectedOutput: '1\nInforme o nome.\nundefined',
    explanation:
      'Só o nome falhou (`trim` deixa vazio). A chave `idade` nem foi criada, então dá `undefined`.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q20',
    lessonIds: ['front.m02.l03'],
    kind: 'multiple-choice',
    prompt: 'Onde é melhor mostrar a mensagem "Informe o CEP."?',
    options: [
      'Logo embaixo do campo de CEP',
      'Num `alert()` com todos os erros juntos',
      'No topo da página, em letras pequenas',
      'No console, para não incomodar',
    ],
    answerIndex: 0,
    explanation:
      'Perto do campo, a pessoa entende na hora o que corrigir. `alert` some e ela tem que decorar.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q21',
    lessonIds: ['front.m02.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para descobrir se o objeto `erros` está vazio (nenhum erro).',
    code: 'const ok = Object.___(erros).length === 0;',
    acceptedAnswers: ['keys', 'values', 'entries'],
    explanation: '`Object.keys(erros)` lista as chaves; zero chaves = nenhum erro.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q22',
    lessonIds: ['front.m02.l03'],
    kind: 'multiple-choice',
    prompt:
      'O cliente corrige o e-mail e envia de novo, mas "E-mail inválido." continua na tela. Qual a causa mais provável?',
    options: [
      'A validação não limpa os erros antigos antes de testar de novo',
      'Faltou `novalidate` no formulário',
      'O `preventDefault` apaga o valor do campo',
      'O navegador guarda mensagens de erro em cache',
    ],
    answerIndex: 0,
    explanation:
      'Se você só escreve o erro e nunca apaga, ele fica lá para sempre. Limpe tudo no começo do `submit`.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q23',
    lessonIds: ['front.m02.l03'],
    kind: 'predict-output',
    prompt: 'Simulando a checagem de e-mail da lição, o que este código imprime?',
    code: `function emailOk(email) {
  const arroba = email.indexOf('@');
  return arroba > 0 && email.slice(arroba + 1).includes('.');
}
console.log(emailOk('ana@exemplo.example'));
console.log(emailOk('ana.silva@exemplo'));
console.log(emailOk('@exemplo.example'));`,
    expectedOutput: 'true\nfalse\nfalse',
    explanation:
      'O segundo tem ponto, mas só **antes** do `@`. O terceiro começa com `@` (`indexOf` dá 0), então não tem nome antes.',
    difficulty: 3,
  },
  {
    id: 'front.m02.q24',
    lessonIds: ['front.m02.l03', 'front.m02.l02'],
    kind: 'true-false',
    prompt:
      'Num `<form novalidate>`, clicar em enviar dispara o `submit` mesmo com um campo `required` vazio.',
    answer: true,
    explanation: 'O `novalidate` tira o bloqueio do navegador; quem decide se segue ou não é o seu JS.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m02.f13',
    lessonIds: ['front.m02.l03'],
    exerciseId: 'front.m02.e05',
    kind: 'multiple-choice',
    prompt: 'No contato da imobiliária, o cliente digita só espaços no nome. O que a sua validação faz?',
    options: [
      'Mostra "Informe seu nome.", porque o `trim()` deixa o texto vazio',
      'Aceita, porque o campo não está vazio',
      'Apaga os espaços e envia',
      'Dá erro no JavaScript',
    ],
    answerIndex: 0,
    explanation: "`'    '.trim()` é `''`. Espaço não é nome.",
    difficulty: 1,
  },
  {
    id: 'front.m02.f14',
    lessonIds: ['front.m02.l03'],
    exerciseId: 'front.m02.e05',
    kind: 'true-false',
    prompt:
      'Se você tirar o `event.preventDefault()` do seu código, a mensagem de sucesso aparece e some, porque a página recarrega.',
    answer: true,
    explanation: 'O envio padrão recarrega a página e tudo que o JS escreveu se perde.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f15',
    lessonIds: ['front.m02.l03'],
    exerciseId: 'front.m02.e06',
    kind: 'multiple-choice',
    prompt:
      'Com a sua `validarCadastro`, o que devolve `{ nome: "Duda", email: "duda@exemplo.example", senha: "123", confirmacao: "123" }`?',
    options: [
      "`{ senha: 'A senha precisa de 8 caracteres ou mais.' }`",
      '`{}`',
      "`{ senha: '...', confirmacao: '...' }`",
      '`false`',
    ],
    answerIndex: 0,
    explanation: 'Só a senha é curta. A confirmação é igual a ela, então não gera erro.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f16',
    lessonIds: ['front.m02.l03'],
    exerciseId: 'front.m02.e06',
    kind: 'true-false',
    prompt:
      'A sua `validarCadastro` não mexe na tela, então dá para testá-la só chamando com objetos, sem formulário.',
    answer: true,
    explanation: 'Foi o que os testes fizeram. Regra separada da tela é mais fácil de testar e reaproveitar.',
    difficulty: 1,
  },
  {
    id: 'front.m02.f17',
    lessonIds: ['front.m02.l03'],
    exerciseId: 'front.m02.d03',
    kind: 'multiple-choice',
    prompt:
      'No Auto Center Bigode, por que a revisão nunca era agendada depois de um primeiro envio com erro?',
    options: [
      'A mensagem de erro antiga nunca era apagada, então o `if` final via um erro que já não existia',
      'O `preventDefault` bloqueava o agendamento',
      'O campo `km` era `type="number"`',
      'O `trim()` apagava a placa',
    ],
    answerIndex: 0,
    explanation: 'O código só escrevia erros; nada limpava. A última checagem lia o texto antigo.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f18',
    lessonIds: ['front.m02.l03'],
    exerciseId: 'front.m02.d03',
    kind: 'true-false',
    prompt:
      'No conserto da oficina, a limpeza dos erros precisa vir **antes** dos `if` que testam os campos.',
    answer: true,
    explanation: 'Se limpar depois, você apaga os erros que acabou de achar.',
    difficulty: 1,
  },
];
