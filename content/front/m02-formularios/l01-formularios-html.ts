import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m02.l01',
  moduleId: 'front.m02',
  order: 1,
  title: 'Formulários em HTML: o básico bem feito',
  concepts: [
    'form',
    'label for/id',
    'tipos de input',
    'select',
    'textarea',
    'atributo name',
    'form.elements',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Todo cliente quer "um formulariozinho de contato". É rapidinho, até a hora em que o celular não mostra o teclado de números, o leitor de tela não sabe o que é cada campo e os dados chegam sem nome. Formulário bem feito começa no HTML.

## A estrutura

- \`<form>\` agrupa os campos. Ao apertar Enter ou clicar no botão de envio, o formulário é **enviado**.
- \`<button type="submit">\` envia. Um \`<button>\` dentro de um form já é \`submit\` por padrão; para um botão que não envia (tipo "Limpar"), use \`type="button"\`.
- \`<label for="email">\` liga o texto ao campo com \`id="email"\`. Clicar no texto foca o campo e o leitor de tela fala "E-mail" quando o campo recebe foco. Outra forma: colocar o campo **dentro** do \`<label>\`.
- \`name="email"\` é o nome do dado. Sem \`name\`, o campo **não vai junto** quando o formulário é enviado.`,
    },
    {
      kind: 'text',
      markdown: `## O tipo certo para cada dado

| Tipo | Para quê | Bônus |
| --- | --- | --- |
| \`type="email"\` | e-mail | teclado com @ no celular |
| \`type="tel"\` | telefone | teclado numérico |
| \`type="number"\` | quantidade, idade | setinhas, \`min\`/\`max\` |
| \`type="date"\` | datas | calendário; o \`value\` vem como \`"2026-10-14"\` |

Para escolher entre opções fixas, use \`<select name="servico">\` com \`<option value="...">\`. Para texto longo, \`<textarea name="mensagem">\` (ela tem tag de fechamento e o texto inicial vai entre as tags).

## Lendo os campos pelo name

No JS, \`form.elements\` dá acesso aos campos pelo \`name\`: \`form.elements.email.value\`. E \`new FormData(form)\` junta tudo que tem \`name\`: \`Object.fromEntries(new FormData(form))\` vira um objeto \`{ nome: '...', email: '...' }\`.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<form id="contato">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" type="text">

  <label for="email">E-mail</label>
  <input id="email" name="email" type="email">

  <label for="servico">Serviço</label>
  <select id="servico" name="servico">
    <option value="site">Site</option>
    <option value="loja">Loja virtual</option>
    <option value="rapidinho">"É rapidinho"</option>
  </select>

  <label for="mensagem">Mensagem</label>
  <textarea id="mensagem" name="mensagem"></textarea>

  <button type="submit">Pedir orçamento</button>
</form>`,
      explanation:
        'Cada campo tem um `label` ligado pelo `id` e um `name`, que é como o dado é chamado no envio.',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<form id="pedido">
  <label>Sabor <input name="sabor" value="Frango"></label>
  <label>Quantidade <input name="qtd" type="number" value="2"></label>
</form>

<script>
  const form = document.querySelector('#pedido');
  console.log(form.elements.sabor.value); // "Frango"
  console.log(Object.fromEntries(new FormData(form))); // { sabor: "Frango", qtd: "2" }
</script>`,
      explanation:
        'Aqui o campo está dentro do `label`, então nem precisa de `for`. Repare: `qtd` vem como texto, igual a qualquer `value`.',
    },
  ],
  checkQuestionIds: ['front.m02.q01', 'front.m02.q02'],
  exerciseIds: ['front.m02.e01', 'front.m02.e02'],
  debugExerciseIds: ['front.m02.d01'],
};

const MARMORARIA_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 6px; max-width: 360px; }
label { font-weight: bold; }`;

const MARMORARIA_STARTER_HTML = `<h2>Orçamento: Marmoraria Pedra Lascada</h2>
<form id="orcamento">
  Nome
  <input placeholder="Seu nome">
  E-mail
  <input placeholder="voce@exemplo.example">
  Telefone
  <input placeholder="(11) 90000-0000">
  Data da visita
  <input placeholder="dd/mm/aaaa">
  Peça
  <input placeholder="pia, bancada ou soleira">
  Detalhes
  <input placeholder="Medidas, cor da pedra...">
  <button>Pedir orçamento</button>
</form>`;

const MARMORARIA_SOLUTION_HTML = `<h2>Orçamento: Marmoraria Pedra Lascada</h2>
<form id="orcamento">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" type="text" placeholder="Seu nome">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" placeholder="voce@exemplo.example">
  <label for="telefone">Telefone</label>
  <input id="telefone" name="telefone" type="tel" placeholder="(11) 90000-0000">
  <label for="data">Data da visita</label>
  <input id="data" name="data" type="date">
  <label for="peca">Peça</label>
  <select id="peca" name="peca">
    <option value="pia">Pia</option>
    <option value="bancada">Bancada</option>
    <option value="soleira">Soleira</option>
  </select>
  <label for="detalhes">Detalhes</label>
  <textarea id="detalhes" name="detalhes" placeholder="Medidas, cor da pedra..."></textarea>
  <button type="submit">Pedir orçamento</button>
</form>`;

const PEDIDO_HTML = `<h2>Marmitas da Vó Nena</h2>
<form id="pedido">
  <label for="cliente">Nome</label>
  <input id="cliente" name="cliente" value="Rafa">
  <label for="prato">Prato</label>
  <select id="prato" name="prato">
    <option value="feijoada">Feijoada</option>
    <option value="strogonoff">Strogonoff</option>
    <option value="virado">Virado à paulista</option>
  </select>
  <label for="quantidade">Quantidade</label>
  <input id="quantidade" name="quantidade" type="number" value="1">
  <label for="obs">Observação</label>
  <textarea id="obs" name="obs"></textarea>
</form>`;

const PEDIDO_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 4px; max-width: 300px; }`;

const AGENDA_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 6px; max-width: 320px; }`;

const AGENDA_STARTER_HTML = `<h2>Agendar corte: Barbearia Navalha Cega</h2>
<form id="agenda">
  <label for="nome">Nome</label>
  <input id="nome-cliente" name="nome" type="text">
  <label for="whats">WhatsApp</label>
  <input id="whats" type="tel">
  <label for="horario">Horário</label>
  <select id="horario" name="horario">
    <option value="09:00">9h</option>
    <option value="14:00">14h</option>
    <option value="18:00">18h</option>
  </select>
  <button type="submit">Agendar</button>
</form>`;

const AGENDA_SOLUTION_HTML = `<h2>Agendar corte: Barbearia Navalha Cega</h2>
<form id="agenda">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" type="text">
  <label for="whats">WhatsApp</label>
  <input id="whats" name="whats" type="tel">
  <label for="horario">Horário</label>
  <select id="horario" name="horario">
    <option value="09:00">9h</option>
    <option value="14:00">14h</option>
    <option value="18:00">18h</option>
  </select>
  <button type="submit">Agendar</button>
</form>`;

export const exercises: Exercise[] = [
  {
    id: 'front.m02.e01',
    lessonId: 'front.m02.l01',
    kind: 'implement',
    title: 'Orçamento da marmoraria',
    promptMarkdown: `A **Marmoraria Pedra Lascada** tem um formulário feito "pelo sobrinho": tudo é \`<input>\` de texto, sem \`label\` e sem \`name\`. Os pedidos chegam vazios e ninguém sabe por quê.

Arrume o HTML do \`#orcamento\`:

1. cada texto vira um \`<label>\` ligado ao seu campo (\`for\` + \`id\`);
2. os campos ganham \`name\` e o tipo certo: \`nome\` (\`text\`), \`email\` (\`email\`), \`telefone\` (\`tel\`), \`data\` (\`date\`);
3. \`peca\` vira um \`<select>\` com as opções \`pia\`, \`bancada\` e \`soleira\`;
4. \`detalhes\` vira uma \`<textarea>\`;
5. o botão fica explicitamente \`type="submit"\`.`,
    language: 'web',
    starterFiles: { html: MARMORARIA_STARTER_HTML, css: MARMORARIA_CSS, js: '' },
    solutionFiles: { html: MARMORARIA_SOLUTION_HTML, css: MARMORARIA_CSS, js: '' },
    editableFiles: ['html'],
    tests: [
      {
        description: 'nome, email, telefone e data existem com o tipo certo',
        code: `const form = document.querySelector('#orcamento');
const esperado = { nome: 'text', email: 'email', telefone: 'tel', data: 'date' };
for (const nome of Object.keys(esperado)) {
  const campo = form.elements[nome];
  assert.ok(campo, 'Não achei um campo com name="' + nome + '".');
  assert.strictEqual(campo.type, esperado[nome], 'O campo "' + nome + '" deveria ser type="' + esperado[nome] + '".');
}`,
      },
      {
        description: 'peca é um select com pia, bancada e soleira',
        code: `const peca = document.querySelector('#orcamento').elements.peca;
assert.ok(peca, 'Não achei um campo com name="peca".');
assert.strictEqual(peca.tagName, 'SELECT', 'peca deveria ser um <select>.');
const valores = Array.from(peca.options).map(function (o) { return o.value; });
assert.deepStrictEqual(valores, ['pia', 'bancada', 'soleira']);`,
      },
      {
        description: 'detalhes é uma textarea',
        code: `const detalhes = document.querySelector('#orcamento').elements.detalhes;
assert.ok(detalhes, 'Não achei um campo com name="detalhes".');
assert.strictEqual(detalhes.tagName, 'TEXTAREA', 'detalhes deveria ser uma <textarea>.');`,
      },
      {
        description: 'todo campo tem um label ligado a ele',
        code: `const campos = document.querySelectorAll('#orcamento input, #orcamento select, #orcamento textarea');
assert.strictEqual(campos.length, 6, 'O formulário deveria ter 6 campos.');
campos.forEach(function (campo) {
  assert.ok(campo.labels && campo.labels.length > 0, 'O campo "' + (campo.name || campo.outerHTML) + '" está sem <label> ligado (for + id).');
});`,
      },
      {
        description: 'o botão é do tipo submit, de forma explícita',
        code: `const botao = document.querySelector('#orcamento button');
assert.strictEqual(botao.getAttribute('type'), 'submit', 'Escreva type="submit" no botão.');`,
      },
    ],
    hints: [
      'Para cada campo: `<label for="email">E-mail</label>` e logo depois `<input id="email" name="email" type="email">`.',
      'O `<select>` leva três `<option value="...">` dentro. A `<textarea>` precisa de `</textarea>`.',
    ],
    followUpQuestionIds: ['front.m02.f01', 'front.m02.f02'],
    difficulty: 1,
  },
  {
    id: 'front.m02.e02',
    lessonId: 'front.m02.l01',
    kind: 'implement',
    title: 'Lendo o pedido da marmita',
    promptMarkdown: `A Vó Nena quer receber o pedido "num formato que o sistema do meu neto entenda". Escreva a função \`lerPedido()\` que lê o formulário \`#pedido\` e **devolve** um objeto assim:

\`\`\`js
{ cliente: 'Rafa', prato: 'feijoada', quantidade: 1, obs: '' }
\`\`\`

- \`cliente\` e \`obs\` sem espaços sobrando nas pontas (\`trim\`);
- \`quantidade\` como **número**, não texto.

Use \`form.elements\` com os \`name\` dos campos. Os testes vão preencher o formulário e chamar a sua função.`,
    language: 'web',
    starterFiles: {
      html: PEDIDO_HTML,
      css: PEDIDO_CSS,
      js: `const form = document.querySelector('#pedido');

function lerPedido() {
  // devolva { cliente, prato, quantidade, obs }
}
`,
    },
    solutionFiles: {
      html: PEDIDO_HTML,
      css: PEDIDO_CSS,
      js: `const form = document.querySelector('#pedido');

function lerPedido() {
  const campos = form.elements;
  return {
    cliente: campos.cliente.value.trim(),
    prato: campos.prato.value,
    quantidade: Number(campos.quantidade.value),
    obs: campos.obs.value.trim(),
  };
}
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'com o formulário como veio, devolve o pedido padrão',
        code: `assert.strictEqual(typeof lerPedido, 'function', 'Crie a função lerPedido().');
assert.deepStrictEqual(lerPedido(), { cliente: 'Rafa', prato: 'feijoada', quantidade: 1, obs: '' });`,
      },
      {
        description: 'lê o que foi preenchido, com trim e quantidade numérica',
        code: `const campos = document.querySelector('#pedido').elements;
campos.cliente.value = '  Dona Lurdes  ';
campos.prato.value = 'virado';
campos.quantidade.value = '3';
campos.obs.value = ' sem cebola ';
const pedido = lerPedido();
assert.deepStrictEqual(pedido, { cliente: 'Dona Lurdes', prato: 'virado', quantidade: 3, obs: 'sem cebola' });`,
      },
      {
        description: 'a quantidade é do tipo number',
        code: `document.querySelector('#quantidade').value = '12';
assert.strictEqual(typeof lerPedido().quantidade, 'number', 'Converta a quantidade com Number(...).');
assert.strictEqual(lerPedido().quantidade, 12);`,
      },
    ],
    hints: [
      '`form.elements.prato.value` dá o `value` da opção escolhida no `<select>`.',
      'Monte o objeto com `return { cliente: ..., prato: ..., quantidade: Number(...), obs: ... };`.',
    ],
    followUpQuestionIds: ['front.m02.f03', 'front.m02.f04'],
    difficulty: 2,
  },
  {
    id: 'front.m02.d01',
    lessonId: 'front.m02.l01',
    kind: 'debug',
    title: 'O agendamento que perde o WhatsApp',
    promptMarkdown: `O Seu Jair, da **Barbearia Navalha Cega**, reclama de duas coisas:

1. clicar no texto "Nome" não leva o cursor para o campo (e o leitor de tela do cliente cego dele não fala o nome do campo);
2. os agendamentos chegam **sem o WhatsApp**.

Conserte o HTML do \`#agenda\`. Não troque os textos nem os \`name\` que já estão certos.`,
    language: 'web',
    starterFiles: { html: AGENDA_STARTER_HTML, css: AGENDA_CSS, js: '' },
    solutionFiles: { html: AGENDA_SOLUTION_HTML, css: AGENDA_CSS, js: '' },
    editableFiles: ['html'],
    tests: [
      {
        description: 'todo campo tem um label ligado a ele',
        code: `document.querySelectorAll('#agenda input, #agenda select').forEach(function (campo) {
  assert.ok(campo.labels.length > 0, 'O campo "' + campo.id + '" não tem um <label> ligado. O for do label bate com o id do campo?');
});`,
      },
      {
        description: 'o envio leva nome, whats e horario',
        code: `const form = document.querySelector('#agenda');
form.elements.nome.value = 'Jair';
document.querySelector('#whats').value = '11988887777';
const dados = Object.fromEntries(new FormData(form));
assert.deepStrictEqual(Object.keys(dados), ['nome', 'whats', 'horario'], 'Todo campo que vai no envio precisa de um name.');
assert.strictEqual(dados.whats, '11988887777');`,
      },
    ],
    hints: [
      'Compare o `for` de cada `<label>` com o `id` do campo logo abaixo. Eles precisam ser iguais.',
      'Campo sem `name` não entra no `FormData` nem no envio. Qual campo está sem?',
    ],
    followUpQuestionIds: ['front.m02.f05', 'front.m02.f06'],
    difficulty: 1,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m02.q01',
    lessonIds: ['front.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'O que liga `<label for="cep">CEP</label>` a um campo?',
    options: [
      'Um campo com `id="cep"`',
      'Um campo com `name="cep"`',
      'Um campo com `class="cep"`',
      'O campo que vier logo depois, qualquer que seja',
    ],
    answerIndex: 0,
    explanation: 'O `for` do label aponta para o `id` do campo. O `name` é o nome do dado no envio.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q02',
    lessonIds: ['front.m02.l01'],
    kind: 'true-false',
    prompt: 'Um campo sem o atributo `name` não vai junto quando o formulário é enviado.',
    answer: true,
    explanation: 'Só campos com `name` entram no envio e no `FormData`. Sem `name`, o dado se perde.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'front.m02.q03',
    lessonIds: ['front.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'Qual tipo de `<input>` faz o celular mostrar o teclado numérico para um telefone?',
    options: ['`type="tel"`', '`type="text"`', '`type="phone"`', '`type="celular"`'],
    answerIndex: 0,
    explanation: '`type="tel"` existe justamente para telefones. `phone` e `celular` não são tipos válidos.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q04',
    lessonIds: ['front.m02.l01'],
    kind: 'fill-blank',
    prompt: 'Complete o botão para que ele **não** envie o formulário (é só um "Limpar campos").',
    code: '<button type="___">Limpar campos</button>',
    acceptedAnswers: ['button'],
    explanation:
      'Dentro de um `<form>`, todo `<button>` é `submit` por padrão. `type="button"` desliga isso.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q05',
    lessonIds: ['front.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'O usuário escolheu 14/10/2026 num `<input type="date">`. O que vem em `campo.value`?',
    options: ['`"2026-10-14"`', '`"14/10/2026"`', 'Um objeto `Date`', 'O número de dias desde 1970'],
    answerIndex: 0,
    explanation:
      'O navegador mostra no formato local, mas o `value` é sempre texto no formato ano-mês-dia (`AAAA-MM-DD`).',
    difficulty: 2,
  },
  {
    id: 'front.m02.q06',
    lessonIds: ['front.m02.l01'],
    kind: 'multiple-choice',
    prompt: 'Para o cliente escrever um texto longo ("conte sobre seu projeto"), qual elemento usar?',
    options: [
      '`<textarea>`',
      '`<input type="long">`',
      '`<input type="text" rows="5">`',
      '`<p contenteditable>`',
    ],
    answerIndex: 0,
    explanation: '`<textarea>` aceita várias linhas. Ela tem tag de fechamento: `<textarea></textarea>`.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q07',
    lessonIds: ['front.m02.l01'],
    kind: 'true-false',
    prompt: 'Colocar o `<input>` dentro do `<label>` também liga os dois, mesmo sem `for` e `id`.',
    answer: true,
    explanation: 'É a outra forma de ligar: `<label>Nome <input name="nome"></label>`.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q08',
    lessonIds: ['front.m02.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para ler o campo de `name="email"` do formulário `form`.',
    code: 'const email = form.___.email.value;',
    acceptedAnswers: ['elements'],
    explanation: '`form.elements` reúne os campos do formulário, acessíveis pelo `name`.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m02.f01',
    lessonIds: ['front.m02.l01'],
    exerciseId: 'front.m02.e01',
    kind: 'multiple-choice',
    prompt: 'No formulário da marmoraria, o que acontece quando o cliente clica no texto "E-mail"?',
    options: [
      'O cursor vai para o campo de e-mail, porque o label está ligado a ele',
      'O formulário é enviado',
      'Nada: label é só texto',
      'Abre o programa de e-mail do computador',
    ],
    answerIndex: 0,
    explanation: 'Com `for="email"` e `id="email"`, clicar no label foca o campo.',
    difficulty: 1,
  },
  {
    id: 'front.m02.f02',
    lessonIds: ['front.m02.l01'],
    exerciseId: 'front.m02.e01',
    kind: 'true-false',
    prompt:
      'No seu `<select name="peca">`, quando o cliente escolhe "Bancada", o dado enviado é o `value` da opção (`bancada`).',
    answer: true,
    explanation: 'O que vai no envio é o `value` do `<option>` escolhido, não o texto que aparece.',
    difficulty: 1,
  },
  {
    id: 'front.m02.f03',
    lessonIds: ['front.m02.l01'],
    exerciseId: 'front.m02.e02',
    kind: 'multiple-choice',
    prompt: 'Na sua `lerPedido()`, sem o `Number(...)`, o que viria em `quantidade` com o campo em 3?',
    options: ["A string '3'", 'O número 3', '`undefined`', '`NaN`'],
    answerIndex: 0,
    explanation: 'Todo `value` é texto, inclusive em `type="number"`. Por isso a conversão.',
    difficulty: 1,
  },
  {
    id: 'front.m02.f04',
    lessonIds: ['front.m02.l01'],
    exerciseId: 'front.m02.e02',
    kind: 'multiple-choice',
    prompt: 'Na sua `lerPedido()`, o que permite escrever `form.elements.prato`?',
    options: [
      'O `name="prato"` do `<select>`',
      'O texto "Prato" do label',
      'A classe `prato` do campo',
      'A ordem do campo no formulário',
    ],
    answerIndex: 0,
    explanation:
      '`form.elements` acha os campos pelo `name` (ou pelo `id`). Aqui os dois são `prato`, mas é o `name` que vai no envio.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f05',
    lessonIds: ['front.m02.l01'],
    exerciseId: 'front.m02.d01',
    kind: 'multiple-choice',
    prompt: 'Na barbearia, por que o WhatsApp não chegava nos agendamentos?',
    options: [
      'O campo não tinha `name`',
      'O campo era `type="tel"`',
      'O label estava antes do campo',
      'O `<select>` apagava o campo',
    ],
    answerIndex: 0,
    explanation: 'Sem `name`, o campo fica fora do envio e do `FormData`.',
    difficulty: 1,
  },
  {
    id: 'front.m02.f06',
    lessonIds: ['front.m02.l01'],
    exerciseId: 'front.m02.d01',
    kind: 'true-false',
    prompt:
      'Na barbearia, o label "Nome" não funcionava porque o `for="nome"` apontava para um `id` que não existia.',
    answer: true,
    explanation: 'O campo tinha `id="nome-cliente"`. O `for` e o `id` precisam ser idênticos.',
    difficulty: 1,
  },
];
