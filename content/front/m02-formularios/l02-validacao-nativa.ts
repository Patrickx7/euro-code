import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { ENVIAR } from './test-helpers';

export const lesson: Lesson = {
  id: 'front.m02.l02',
  moduleId: 'front.m02',
  order: 2,
  title: 'Validação nativa: o navegador trabalhando por você',
  concepts: [
    'required',
    'min/max',
    'minlength/maxlength',
    'pattern',
    ':invalid e :valid',
    'checkValidity()',
    'validity',
    'novalidate',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Antes de escrever uma linha de JS, saiba que o navegador já valida muita coisa sozinho. Basta pedir no HTML:

| Atributo | O que exige | Exemplo |
| --- | --- | --- |
| \`required\` | campo preenchido | \`<input name="nome" required>\` |
| \`type="email"\` | algo com cara de e-mail | \`fulano@exemplo.example\` |
| \`min\` / \`max\` | faixa de números (ou datas) | \`<input type="number" min="18" max="70">\` |
| \`minlength\` / \`maxlength\` | tamanho do texto | \`<input minlength="8">\` |
| \`pattern\` | um formato (expressão regular) | \`pattern="[0-9]{5}-[0-9]{3}"\` para CEP |

O \`pattern\` precisa casar com o valor **inteiro**: \`[0-9]{5}-[0-9]{3}\` aceita \`06010-000\` e recusa \`06010000\`. E um campo vazio sem \`required\` passa em tudo: "não preenchido" não é "errado".

Se algum campo está inválido, clicar em enviar **não envia**: o navegador mostra um balãozinho no primeiro campo com problema.`,
    },
    {
      kind: 'text',
      markdown: `## Estilo e JS para campos inválidos

No CSS, \`:invalid\` e \`:valid\` pegam campos pelo estado atual:

\`\`\`css
input:invalid { border-color: #c0392b; }
\`\`\`

Detalhe: um campo \`required\` vazio já nasce \`:invalid\`, então a página abre toda vermelha. A pseudo-classe \`:user-invalid\` só pinta depois que a pessoa mexeu no campo, que é mais educado.

No JS:

- \`form.checkValidity()\` devolve \`true\` se **todos** os campos estão válidos (\`campo.checkValidity()\` testa um só);
- \`form.reportValidity()\` faz o mesmo e ainda mostra os balõezinhos;
- \`campo.validity\` diz **qual** é o problema: \`valueMissing\` (vazio e obrigatório), \`typeMismatch\` (e-mail torto), \`patternMismatch\`, \`rangeUnderflow\` (abaixo do \`min\`), \`rangeOverflow\` (acima do \`max\`), \`tooShort\`... e \`valid\`, que é \`true\` quando está tudo certo.

Quer as regras do HTML, mas com as **suas** mensagens? Coloque \`novalidate\` no \`<form>\`: o navegador para de bloquear o envio e de mostrar balões, mas \`validity\` e \`checkValidity()\` continuam funcionando.

E lembre: validação no navegador é para ajudar quem preenche. Quem quer burlar abre o DevTools e apaga o \`required\`. O servidor sempre valida de novo.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<style>
  input:invalid { border-color: #c0392b; }
</style>

<form id="cadastro">
  <label for="cep">CEP</label>
  <input id="cep" name="cep" required pattern="[0-9]{5}-[0-9]{3}" placeholder="00000-000">

  <label for="idade">Idade</label>
  <input id="idade" name="idade" type="number" min="18" max="70">

  <button type="submit">Cadastrar</button>
</form>

<script>
  const cep = document.querySelector('#cep');
  cep.value = '06010000';
  console.log(cep.validity.patternMismatch); // true: faltou o hífen
  cep.value = '06010-000';
  console.log(cep.checkValidity()); // true
</script>`,
      explanation:
        'O `pattern` cuida do formato, o `required` de não deixar vazio e o `min`/`max` da faixa. O `validity` conta o motivo.',
    },
  ],
  checkQuestionIds: ['front.m02.q09', 'front.m02.q10'],
  exerciseIds: ['front.m02.e03', 'front.m02.e04'],
  debugExerciseIds: ['front.m02.d02'],
};

const ENTREGADOR_STARTER_HTML = `<h2>Seja entregador: Vapt-Vupt Entregas</h2>
<form id="entregador">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" type="text">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email">
  <label for="cep">CEP</label>
  <input id="cep" name="cep" placeholder="00000-000">
  <label for="idade">Idade</label>
  <input id="idade" name="idade" type="number">
  <button type="submit">Quero entregar</button>
</form>`;

const ENTREGADOR_SOLUTION_HTML = `<h2>Seja entregador: Vapt-Vupt Entregas</h2>
<form id="entregador">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" type="text" required>
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>
  <label for="cep">CEP</label>
  <input id="cep" name="cep" placeholder="00000-000" required pattern="[0-9]{5}-[0-9]{3}">
  <label for="idade">Idade</label>
  <input id="idade" name="idade" type="number" required min="18" max="70">
  <button type="submit">Quero entregar</button>
</form>`;

const ENTREGADOR_STARTER_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 6px; max-width: 320px; }
input { border: 2px solid #999; padding: 6px; }`;

const ENTREGADOR_SOLUTION_CSS = `${ENTREGADOR_STARTER_CSS}
input:invalid { border-color: #c0392b; }`;

const MENSAGENS_HTML = `<h2>Encomenda de bolo: Doceria Glacê Torto</h2>
<form id="encomenda" novalidate>
  <label for="nome">Nome</label>
  <input id="nome" name="nome" required>
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>
  <label for="cep">CEP</label>
  <input id="cep" name="cep" pattern="[0-9]{5}-[0-9]{3}">
  <label for="andares">Andares do bolo</label>
  <input id="andares" name="andares" type="number" min="1" max="5">
  <button type="submit">Encomendar</button>
</form>`;

const MENSAGENS_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 4px; max-width: 300px; }`;

const CORRIDA_HTML = `<h2>Corrida da Granja 5K</h2>
<form id="inscricao" novalidate>
  <label for="nome">Nome</label>
  <input id="nome" name="nome" required>
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required>
  <button type="submit">Inscrever</button>
</form>
<p id="status"></p>`;

const CORRIDA_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 4px; max-width: 300px; }`;

export const exercises: Exercise[] = [
  {
    id: 'front.m02.e03',
    lessonId: 'front.m02.l02',
    kind: 'implement',
    title: 'Cadastro de entregadores',
    promptMarkdown: `A **Vapt-Vupt Entregas** recebe cadastros com CEP "perto do posto", idade "-3" e e-mail vazio. Ponha o navegador para trabalhar, **só com HTML e CSS**:

1. \`nome\`, \`email\`, \`cep\` e \`idade\` são obrigatórios;
2. o CEP segue o formato \`00000-000\` (use \`pattern\`);
3. a idade vai de **18** a **70**;
4. no CSS, campo inválido ganha borda \`#c0392b\` (use \`:invalid\`).`,
    language: 'web',
    starterFiles: { html: ENTREGADOR_STARTER_HTML, css: ENTREGADOR_STARTER_CSS, js: '' },
    solutionFiles: { html: ENTREGADOR_SOLUTION_HTML, css: ENTREGADOR_SOLUTION_CSS, js: '' },
    editableFiles: ['html', 'css'],
    tests: [
      {
        description: 'os quatro campos são obrigatórios',
        code: `['nome', 'email', 'cep', 'idade'].forEach(function (id) {
  const campo = document.querySelector('#' + id);
  campo.value = '';
  assert.ok(campo.validity.valueMissing, 'O campo #' + id + ' vazio deveria ser inválido (required).');
});`,
      },
      {
        description: 'o e-mail precisa ter cara de e-mail',
        code: `const email = document.querySelector('#email');
email.value = 'joao';
assert.ok(email.validity.typeMismatch, '"joao" não é um e-mail.');
email.value = 'joao@exemplo.example';
assert.ok(email.validity.valid, '"joao@exemplo.example" deveria ser aceito.');`,
      },
      {
        description: 'o CEP segue o formato 00000-000',
        code: `const cep = document.querySelector('#cep');
cep.value = '06010000';
assert.ok(cep.validity.patternMismatch, '"06010000" (sem hífen) deveria ser recusado. Use pattern.');
cep.value = '0601-000';
assert.ok(cep.validity.patternMismatch, '"0601-000" deveria ser recusado.');
cep.value = '06010-000';
assert.ok(cep.validity.valid, '"06010-000" deveria ser aceito.');`,
      },
      {
        description: 'a idade vai de 18 a 70',
        code: `const idade = document.querySelector('#idade');
idade.value = '17';
assert.ok(idade.validity.rangeUnderflow, '17 anos deveria ser recusado (min).');
idade.value = '71';
assert.ok(idade.validity.rangeOverflow, '71 anos deveria ser recusado (max).');
idade.value = '18';
assert.ok(idade.validity.valid, '18 anos deveria ser aceito.');`,
      },
      {
        description: 'com tudo certo, o formulário é válido',
        code: `document.querySelector('#nome').value = 'Joana';
document.querySelector('#email').value = 'joana@exemplo.example';
document.querySelector('#cep').value = '06700-100';
document.querySelector('#idade').value = '35';
assert.ok(document.querySelector('#entregador').checkValidity(), 'Com tudo preenchido certo, checkValidity() deveria dar true.');
document.querySelector('#cep').value = '6700';
assert.ok(!document.querySelector('#entregador').checkValidity(), 'Com o CEP errado, o formulário deveria ser inválido.');`,
      },
      {
        description: 'campo inválido fica com a borda vermelha; válido, não',
        code: `const cep = document.querySelector('#cep');
cep.value = '';
assert.strictEqual(style('#cep').borderTopColor, 'rgb(192, 57, 43)', 'Campo inválido deveria ter borda #c0392b. Use input:invalid.');
cep.value = '06700-100';
assert.notStrictEqual(style('#cep').borderTopColor, 'rgb(192, 57, 43)', 'Campo válido não deveria ficar vermelho.');`,
      },
    ],
    hints: [
      'Os atributos vão direto no `<input>`: `required`, `pattern="[0-9]{5}-[0-9]{3}"`, `min="18"`, `max="70"`.',
      'No CSS: `input:invalid { border-color: #c0392b; }`.',
    ],
    followUpQuestionIds: ['front.m02.f07', 'front.m02.f08'],
    difficulty: 1,
  },
  {
    id: 'front.m02.e04',
    lessonId: 'front.m02.l02',
    kind: 'implement',
    title: 'Mensagens que a doceira entende',
    promptMarkdown: `A Dona Neide, da **Doceria Glacê Torto**, achou os balõezinhos do navegador "muito secos". O formulário já tem \`novalidate\` e as regras no HTML. Falta o texto.

Escreva a função \`mensagemDoCampo(campo)\`, que olha o \`campo.validity\` e devolve:

| Problema | Mensagem |
| --- | --- |
| \`valueMissing\` | \`Preencha este campo.\` |
| \`typeMismatch\` | \`Digite um e-mail válido.\` |
| \`patternMismatch\` | \`Use o formato 00000-000.\` |
| \`rangeUnderflow\` | \`O mínimo é 1.\` (use o \`campo.min\`) |
| \`rangeOverflow\` | \`O máximo é 5.\` (use o \`campo.max\`) |
| tudo certo | \`''\` (texto vazio) |

Os testes preenchem os campos e chamam a sua função.`,
    language: 'web',
    starterFiles: {
      html: MENSAGENS_HTML,
      css: MENSAGENS_CSS,
      js: `function mensagemDoCampo(campo) {
  // olhe campo.validity e devolva a mensagem certa
  return '';
}
`,
    },
    solutionFiles: {
      html: MENSAGENS_HTML,
      css: MENSAGENS_CSS,
      js: `function mensagemDoCampo(campo) {
  const v = campo.validity;
  if (v.valueMissing) return 'Preencha este campo.';
  if (v.typeMismatch) return 'Digite um e-mail válido.';
  if (v.patternMismatch) return 'Use o formato 00000-000.';
  if (v.rangeUnderflow) return 'O mínimo é ' + campo.min + '.';
  if (v.rangeOverflow) return 'O máximo é ' + campo.max + '.';
  return '';
}
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'campo obrigatório vazio',
        code: `const nome = document.querySelector('#nome');
nome.value = '';
assert.strictEqual(mensagemDoCampo(nome), 'Preencha este campo.');`,
      },
      {
        description: 'e-mail vazio pede para preencher; e-mail torto pede um válido',
        code: `const email = document.querySelector('#email');
email.value = '';
assert.strictEqual(mensagemDoCampo(email), 'Preencha este campo.');
email.value = 'neide.doces';
assert.strictEqual(mensagemDoCampo(email), 'Digite um e-mail válido.');`,
      },
      {
        description: 'CEP fora do formato',
        code: `const cep = document.querySelector('#cep');
cep.value = '06700100';
assert.strictEqual(mensagemDoCampo(cep), 'Use o formato 00000-000.');`,
      },
      {
        description: 'andares abaixo do mínimo e acima do máximo',
        code: `const andares = document.querySelector('#andares');
andares.value = '0';
assert.strictEqual(mensagemDoCampo(andares), 'O mínimo é 1.');
andares.value = '9';
assert.strictEqual(mensagemDoCampo(andares), 'O máximo é 5.');`,
      },
      {
        description: 'campos válidos devolvem texto vazio',
        code: `const campos = { nome: 'Neide', email: 'neide@exemplo.example', cep: '06700-100', andares: '3' };
for (const id in campos) {
  const campo = document.querySelector('#' + id);
  campo.value = campos[id];
  assert.strictEqual(mensagemDoCampo(campo), '', 'O campo #' + id + ' está válido; a mensagem deveria ser vazia.');
}`,
      },
    ],
    hints: [
      'Guarde `const v = campo.validity;` e teste um problema de cada vez com `if (v.valueMissing) return ...`.',
      "Para a faixa: `return 'O mínimo é ' + campo.min + '.';`. O `campo.min` é o texto do atributo `min`.",
    ],
    followUpQuestionIds: ['front.m02.f09', 'front.m02.f10'],
    difficulty: 2,
  },
  {
    id: 'front.m02.d02',
    lessonId: 'front.m02.l02',
    kind: 'debug',
    title: 'A inscrição que confirma qualquer coisa',
    promptMarkdown: `A **Corrida da Granja 5K** abriu inscrições e recebeu 214 inscrições confirmadas... 190 delas sem nome nem e-mail. O formulário diz "Inscrição confirmada!" até com tudo vazio.

Conserte o script: com campos inválidos, \`#status\` deve mostrar \`Confira os campos em vermelho.\`; com tudo certo, \`Inscrição confirmada!\`.`,
    language: 'web',
    starterFiles: {
      html: CORRIDA_HTML,
      css: CORRIDA_CSS,
      js: `const form = document.querySelector('#inscricao');
const status = document.querySelector('#status');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (form.checkValidity) {
    status.textContent = 'Inscrição confirmada!';
  } else {
    status.textContent = 'Confira os campos em vermelho.';
  }
});
`,
    },
    solutionFiles: {
      html: CORRIDA_HTML,
      css: CORRIDA_CSS,
      js: `const form = document.querySelector('#inscricao');
const status = document.querySelector('#status');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (form.checkValidity()) {
    status.textContent = 'Inscrição confirmada!';
  } else {
    status.textContent = 'Confira os campos em vermelho.';
  }
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'com tudo vazio, pede para conferir os campos',
        code: `${ENVIAR}enviar();
assert.strictEqual(document.querySelector('#status').textContent, 'Confira os campos em vermelho.');`,
      },
      {
        description: 'com e-mail inválido, também pede para conferir',
        code: `${ENVIAR}document.querySelector('#nome').value = 'Marina';
document.querySelector('#email').value = 'marina';
enviar();
assert.strictEqual(document.querySelector('#status').textContent, 'Confira os campos em vermelho.');`,
      },
      {
        description: 'com tudo certo, confirma a inscrição',
        code: `${ENVIAR}document.querySelector('#nome').value = 'Marina';
document.querySelector('#email').value = 'marina@exemplo.example';
enviar();
assert.strictEqual(document.querySelector('#status').textContent, 'Inscrição confirmada!');`,
      },
    ],
    hints: [
      'O que `form.checkValidity` (sem parênteses) vale dentro de um `if`? É a função em si, não o resultado dela.',
      'Para **chamar** a função e usar o resultado, coloque `()`.',
    ],
    followUpQuestionIds: ['front.m02.f11', 'front.m02.f12'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m02.q09',
    lessonIds: ['front.m02.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual atributo impede que o formulário seja enviado com o campo vazio?',
    options: ['`required`', '`pattern`', '`placeholder`', '`name`'],
    answerIndex: 0,
    explanation: 'Com `required`, campo vazio é inválido (`validity.valueMissing`).',
    difficulty: 1,
  },
  {
    id: 'front.m02.q10',
    lessonIds: ['front.m02.l02'],
    kind: 'true-false',
    prompt:
      'Com `pattern="[0-9]{5}-[0-9]{3}"`, o valor `06010-000 ap 12` é aceito, porque começa com um CEP.',
    answer: false,
    explanation: 'O `pattern` precisa casar com o valor inteiro, do começo ao fim.',
    difficulty: 2,
  },
  // ---- gerais ----
  {
    id: 'front.m02.q11',
    lessonIds: ['front.m02.l02'],
    kind: 'multiple-choice',
    prompt:
      'Num `<input type="number" min="1" max="10">`, o usuário digitou 15. Qual propriedade de `validity` fica `true`?',
    options: ['`rangeOverflow`', '`rangeUnderflow`', '`tooLong`', '`patternMismatch`'],
    answerIndex: 0,
    explanation: 'Acima do `max` é `rangeOverflow`; abaixo do `min`, `rangeUnderflow`.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q12',
    lessonIds: ['front.m02.l02'],
    kind: 'fill-blank',
    prompt: 'Complete o CSS para pintar de vermelho os campos que estão inválidos.',
    code: 'input:___ { border-color: #c0392b; }',
    acceptedAnswers: ['invalid', 'user-invalid'],
    explanation: '`:invalid` pega campos inválidos agora; `:user-invalid`, só depois que a pessoa mexeu.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q13',
    lessonIds: ['front.m02.l02'],
    kind: 'multiple-choice',
    prompt: 'O que o atributo `novalidate` no `<form>` faz?',
    options: [
      'O navegador para de bloquear o envio e de mostrar balões, mas `validity` continua funcionando',
      'Apaga todos os `required` da página',
      'Faz o formulário nunca ser enviado',
      'Liga a validação do servidor',
    ],
    answerIndex: 0,
    explanation: 'É o jeito de usar as regras do HTML com mensagens e visual próprios, feitos no JS.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q14',
    lessonIds: ['front.m02.l02'],
    kind: 'true-false',
    prompt: 'Com `required` e `pattern` no HTML, o servidor não precisa mais validar os dados.',
    answer: false,
    explanation:
      'Qualquer um apaga atributos no DevTools ou manda dados direto para o servidor. Ele sempre valida de novo.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q15',
    lessonIds: ['front.m02.l02'],
    kind: 'multiple-choice',
    prompt: 'Um `<input name="apelido" minlength="3">` (sem `required`) está vazio. Ele é válido?',
    options: [
      'Sim: vazio sem `required` passa nas outras regras',
      'Não: vazio tem menos de 3 caracteres',
      'Só se tiver `pattern`',
      'Depende do navegador',
    ],
    answerIndex: 0,
    explanation:
      'Regras como `minlength` e `pattern` só valem quando há algo escrito. Para exigir, use `required`.',
    difficulty: 3,
  },
  {
    id: 'front.m02.q16',
    lessonIds: ['front.m02.l02'],
    kind: 'multiple-choice',
    prompt: 'Qual a diferença entre `form.checkValidity()` e `form.reportValidity()`?',
    options: [
      'Os dois dizem se está tudo válido; o `report` também mostra os balões de erro',
      '`checkValidity` valida no servidor',
      '`reportValidity` manda um e-mail com os erros',
      'Nenhuma, são nomes antigos e novos da mesma coisa',
    ],
    answerIndex: 0,
    explanation: '`checkValidity()` só responde `true`/`false`; `reportValidity()` também avisa a pessoa.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m02.f07',
    lessonIds: ['front.m02.l02'],
    exerciseId: 'front.m02.e03',
    kind: 'multiple-choice',
    prompt: 'No cadastro da Vapt-Vupt, alguém digita o CEP `06700100`. O que acontece?',
    options: [
      'O campo fica inválido (`patternMismatch`) e o envio é bloqueado',
      'O navegador coloca o hífen sozinho',
      'O CEP é aceito, porque tem 8 números',
      'O campo é apagado',
    ],
    answerIndex: 0,
    explanation:
      'O `pattern` exige o hífen. Colocar o hífen sozinho é trabalho de máscara, que vem na lição 4.',
    difficulty: 1,
  },
  {
    id: 'front.m02.f08',
    lessonIds: ['front.m02.l02'],
    exerciseId: 'front.m02.e03',
    kind: 'true-false',
    prompt:
      'No seu cadastro, os campos obrigatórios já aparecem com a borda vermelha assim que a página abre.',
    answer: true,
    explanation:
      'Campo `required` vazio já é `:invalid`. Se o cliente reclamar, troque por `:user-invalid`, que espera a pessoa mexer.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f09',
    lessonIds: ['front.m02.l02'],
    exerciseId: 'front.m02.e04',
    kind: 'multiple-choice',
    prompt:
      'Na sua `mensagemDoCampo`, o e-mail está **vazio** (e é `required` e `type="email"`). Qual mensagem sai?',
    options: [
      'Preencha este campo.',
      'Digite um e-mail válido.',
      "'' (vazio)",
      'As duas, uma depois da outra',
    ],
    answerIndex: 0,
    explanation: 'Vazio dá `valueMissing`, não `typeMismatch`. E o primeiro `if` que bate já faz o `return`.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f10',
    lessonIds: ['front.m02.l02'],
    exerciseId: 'front.m02.e04',
    kind: 'true-false',
    prompt:
      'Se a Dona Neide mudar para `max="8"` no HTML, a sua função passa a dizer "O máximo é 8." sem mudar o JS.',
    answer: true,
    explanation: 'Você leu o limite de `campo.max` em vez de escrever 5 fixo no código.',
    difficulty: 1,
  },
  {
    id: 'front.m02.f11',
    lessonIds: ['front.m02.l02'],
    exerciseId: 'front.m02.d02',
    kind: 'multiple-choice',
    prompt: 'Na corrida, por que `if (form.checkValidity)` sempre confirmava a inscrição?',
    options: [
      'Sem `()`, a função não é chamada; a própria função é um valor "verdadeiro"',
      'Porque o formulário tinha `novalidate`',
      'Porque `checkValidity` só funciona no servidor',
      'Porque faltava `required` nos campos',
    ],
    answerIndex: 0,
    explanation: 'Toda função é *truthy*. Só com `checkValidity()` você recebe o `true`/`false` de verdade.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f12',
    lessonIds: ['front.m02.l02'],
    exerciseId: 'front.m02.d02',
    kind: 'true-false',
    prompt:
      'No formulário da corrida, mesmo com `novalidate`, o `form.checkValidity()` ainda respeita o `required` e o `type="email"`.',
    answer: true,
    explanation:
      '`novalidate` só desliga o bloqueio automático do envio; as regras continuam valendo para o JS.',
    difficulty: 2,
  },
];
