import type { Exercise, Lesson, Question } from '../../../src/shared/content';
import { DIGITAR, ENVIAR } from './test-helpers';

export const lesson: Lesson = {
  id: 'front.m02.l04',
  moduleId: 'front.m02',
  order: 4,
  title: 'Máscaras e UX: formulário que ajuda',
  concepts: [
    'evento input',
    'só dígitos com replace',
    'máscara de telefone e CEP',
    'moeda em reais',
    'botão desabilitado até ficar válido',
    'mensagem de sucesso e reset',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Validar é dizer "tá errado". Máscara é **não deixar errar**: a pessoa digita \`11987654321\` e o campo mostra \`(11) 98765-4321\` sozinho. O cliente acha mágica; você sabe que é um \`replace\` e uns \`slice\`.

## O evento input

O \`input\` dispara a **cada tecla** (e também ao colar). É ele que a máscara escuta:

\`\`\`js
campo.addEventListener('input', function () {
  campo.value = formatarTelefone(campo.value);
});
\`\`\`

## Receita de toda máscara

1. **Jogue fora** tudo que não é dígito: \`valor.replace(/\\D/g, '')\`. O \`\\D\` é "qualquer coisa que não é dígito" e o \`g\` é "todas as vezes".
2. **Corte** no tamanho máximo: \`.slice(0, 11)\`.
3. **Monte** o texto com os pedaços: \`'(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7)\`.

O passo 1 é o segredo: como o valor que chega já tem parênteses e hífen da máscara anterior, você sempre recomeça só dos dígitos. Deixe a máscara numa **função pura** (texto entra, texto sai): fica fácil de testar sem tela.`,
    },
    {
      kind: 'text',
      markdown: `## Dinheiro

Máscara de valor estilo app de banco: os dígitos são **centavos**. \`1\` vira \`R$ 0,01\`, \`1234\` vira \`R$ 12,34\`. Converta os dígitos com \`Number\`, divida por 100 e formate em português:

\`\`\`js
(1234.5).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // "1.234,50"
\`\`\`

## Detalhes que o cliente nota (sem saber o nome)

- **Botão desabilitado** até o formulário estar válido: a cada \`input\`, faça \`botao.disabled = !form.checkValidity();\`. Botão \`disabled\` não envia.
- **Mensagem de sucesso** clara depois do envio, e \`form.reset()\` para limpar os campos.
- \`inputmode="numeric"\` no campo mostra o teclado de números no celular, sem as setinhas do \`type="number"\`.
- Não exagere: máscara que briga com quem digita (cursor pulando, não deixa apagar) irrita mais que formulário sem máscara.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<label for="cep">CEP</label>
<input id="cep" inputmode="numeric" maxlength="9" placeholder="00000-000">

<script>
  function formatarCep(valor) {
    const d = valor.replace(/\\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return d.slice(0, 5) + '-' + d.slice(5);
  }

  const cep = document.querySelector('#cep');
  cep.addEventListener('input', function () {
    cep.value = formatarCep(cep.value);
  });
</script>`,
      explanation:
        'Até 5 dígitos, nada a fazer. A partir do 6º, entra o hífen. Como a função recomeça dos dígitos, digitar ou apagar funciona igual.',
    },
  ],
  checkQuestionIds: ['front.m02.q25', 'front.m02.q26'],
  exerciseIds: ['front.m02.e07', 'front.m02.e08'],
  debugExerciseIds: ['front.m02.d04'],
};

const TELEFONE_HTML = `<h2>Peça sua marmita: Tempero da Vó Nena</h2>
<label for="telefone">WhatsApp</label>
<input id="telefone" name="telefone" type="tel" placeholder="(11) 90000-0000">`;

const TELEFONE_CSS = `body { font-family: sans-serif; }
input { font-size: 18px; padding: 6px; }`;

const ENTREGA_HTML = `<h2>Entrega: Tempero da Vó Nena</h2>
<form id="entrega">
  <label for="nome">Nome</label>
  <input id="nome" name="nome" required>
  <label for="cep">CEP</label>
  <input id="cep" name="cep" inputmode="numeric" required pattern="[0-9]{5}-[0-9]{3}" placeholder="00000-000">
  <button id="enviar" type="submit" disabled>Confirmar pedido</button>
</form>
<p id="sucesso" hidden></p>`;

const ENTREGA_CSS = `body { font-family: sans-serif; }
form { display: grid; gap: 6px; max-width: 300px; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
#sucesso { color: #1e8449; font-weight: bold; }`;

const MOEDA_HTML = `<h2>Cobrar cliente: app do freela</h2>
<label for="valor">Valor do job</label>
<input id="valor" inputmode="numeric" value="R$ 0,00">`;

const MOEDA_CSS = `body { font-family: sans-serif; }
input { font-size: 22px; padding: 6px; width: 220px; }`;

const MOEDA_WIRING = `
const campo = document.querySelector('#valor');
campo.addEventListener('input', function () {
  campo.value = formatarMoeda(campo.value);
});
`;

export const exercises: Exercise[] = [
  {
    id: 'front.m02.e07',
    lessonId: 'front.m02.l04',
    kind: 'implement',
    title: 'Máscara de WhatsApp',
    promptMarkdown: `Os pedidos da **Tempero da Vó Nena** chegam com telefone "11 9 8765 4321", "(11)987654321" e "liga no fixo". Faça uma máscara de celular.

1. Escreva \`formatarTelefone(valor)\`, que pega só os dígitos (no máximo 11) e devolve:

| Dígitos | Resultado |
| --- | --- |
| nenhum | \`''\` |
| 1 ou 2 | \`(1\`, \`(11\` |
| 3 a 7 | \`(11) 9\`... \`(11) 98765\` |
| 8 a 11 | \`(11) 98765-4\`... \`(11) 98765-4321\` |

2. A cada \`input\` no \`#telefone\`, troque o valor do campo pelo valor formatado.

Os testes chamam a sua função e também "digitam" no campo.`,
    language: 'web',
    starterFiles: {
      html: TELEFONE_HTML,
      css: TELEFONE_CSS,
      js: `const telefone = document.querySelector('#telefone');

function formatarTelefone(valor) {
  // 1. só dígitos, no máximo 11
  // 2. monte o texto conforme a quantidade de dígitos
  return valor;
}

// a cada input, aplique a máscara no campo
`,
    },
    solutionFiles: {
      html: TELEFONE_HTML,
      css: TELEFONE_CSS,
      js: `const telefone = document.querySelector('#telefone');

function formatarTelefone(valor) {
  const d = valor.replace(/\\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return '(' + d;
  if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
}

telefone.addEventListener('input', function () {
  telefone.value = formatarTelefone(telefone.value);
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'número completo vira (11) 98765-4321',
        code: `assert.strictEqual(formatarTelefone('11987654321'), '(11) 98765-4321');`,
      },
      {
        description: 'formata pela metade, enquanto a pessoa digita',
        code: `assert.strictEqual(formatarTelefone(''), '');
assert.strictEqual(formatarTelefone('1'), '(1');
assert.strictEqual(formatarTelefone('11'), '(11');
assert.strictEqual(formatarTelefone('119'), '(11) 9');
assert.strictEqual(formatarTelefone('1198765'), '(11) 98765');
assert.strictEqual(formatarTelefone('11987654'), '(11) 98765-4');`,
      },
      {
        description: 'ignora o que não é dígito e corta em 11 dígitos',
        code: `assert.strictEqual(formatarTelefone('11 9 8765 4321'), '(11) 98765-4321');
assert.strictEqual(formatarTelefone('(11) 98765-43219999'), '(11) 98765-4321');
assert.strictEqual(formatarTelefone('liga no fixo'), '');`,
      },
      {
        description: 'aplicar a máscara de novo num valor já formatado não estraga',
        code: `assert.strictEqual(formatarTelefone('(11) 98765-432'), '(11) 98765-432');
assert.strictEqual(formatarTelefone('(11) 98765-4321'), '(11) 98765-4321');`,
      },
      {
        description: 'digitando no campo, a máscara aparece',
        code: `${DIGITAR}assert.strictEqual(digitar('#telefone', '11987654321').value, '(11) 98765-4321', 'Escute o evento input no #telefone.');
assert.strictEqual(digitar('#telefone', '(11) 98765-43210').value, '(11) 98765-4321');`,
      },
    ],
    hints: [
      "`const d = valor.replace(/\\D/g, '').slice(0, 11);` deixa só os dígitos. Depois, um `if` para cada faixa de tamanho.",
      "Com 8 ou mais dígitos: `'(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7)`.",
    ],
    followUpQuestionIds: ['front.m02.f19', 'front.m02.f20'],
    difficulty: 2,
  },
  {
    id: 'front.m02.e08',
    lessonId: 'front.m02.l04',
    kind: 'implement',
    title: 'Pedido com CEP e botão esperto',
    promptMarkdown: `Agora a Vó Nena quer que o botão "Confirmar pedido" fique apagadinho até estar tudo certo ("igual no app de comida do meu neto").

1. Escreva \`formatarCep(valor)\`: só dígitos, no máximo 8, com hífen depois do 5º (\`06010000\` vira \`06010-000\`; \`0601\` fica \`0601\`).
2. A cada \`input\` no formulário \`#entrega\`: aplique a máscara no \`#cep\` e deixe o \`#enviar\` desabilitado enquanto o formulário for inválido (o HTML já tem \`required\` e \`pattern\`).
3. No \`submit\`: cancele o envio padrão, mostre o \`#sucesso\` (tire o \`hidden\`) com o texto \`Pedido confirmado! Chega em até 40 minutos.\`, limpe o formulário com \`form.reset()\` e desabilite o botão de novo.`,
    language: 'web',
    starterFiles: {
      html: ENTREGA_HTML,
      css: ENTREGA_CSS,
      js: `const form = document.querySelector('#entrega');
const cep = document.querySelector('#cep');
const botao = document.querySelector('#enviar');
const sucesso = document.querySelector('#sucesso');

function formatarCep(valor) {
  return valor;
}

// input: máscara no CEP + botão habilitado só com o formulário válido

// submit: mensagem de sucesso, reset e botão desabilitado
`,
    },
    solutionFiles: {
      html: ENTREGA_HTML,
      css: ENTREGA_CSS,
      js: `const form = document.querySelector('#entrega');
const cep = document.querySelector('#cep');
const botao = document.querySelector('#enviar');
const sucesso = document.querySelector('#sucesso');

function formatarCep(valor) {
  const d = valor.replace(/\\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return d.slice(0, 5) + '-' + d.slice(5);
}

form.addEventListener('input', function () {
  cep.value = formatarCep(cep.value);
  botao.disabled = !form.checkValidity();
});

form.addEventListener('submit', function (event) {
  event.preventDefault();
  sucesso.hidden = false;
  sucesso.textContent = 'Pedido confirmado! Chega em até 40 minutos.';
  form.reset();
  botao.disabled = true;
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'formatarCep coloca o hífen depois do 5º dígito',
        code: `assert.strictEqual(formatarCep('06010000'), '06010-000');
assert.strictEqual(formatarCep('0601'), '0601');
assert.strictEqual(formatarCep('06010'), '06010');
assert.strictEqual(formatarCep('060100'), '06010-0');
assert.strictEqual(formatarCep('06010-000'), '06010-000');
assert.strictEqual(formatarCep('06.010-00099'), '06010-000');`,
      },
      {
        description: 'o botão começa desabilitado',
        code: `assert.ok(document.querySelector('#enviar').disabled, 'Com o formulário vazio, #enviar deveria estar desabilitado.');`,
      },
      {
        description: 'digitando nome e CEP, a máscara entra e o botão habilita',
        code: `${DIGITAR}digitar('#nome', 'Léo');
assert.ok(document.querySelector('#enviar').disabled, 'Só com o nome, o botão continua desabilitado.');
assert.strictEqual(digitar('#cep', '06700100').value, '06700-100', 'A máscara do CEP deveria rodar a cada input.');
assert.ok(!document.querySelector('#enviar').disabled, 'Com tudo válido, #enviar deveria estar habilitado.');`,
      },
      {
        description: 'apagando o nome, o botão desabilita de novo',
        code: `${DIGITAR}digitar('#nome', '');
assert.ok(document.querySelector('#enviar').disabled, 'Sem nome, o formulário é inválido: botão desabilitado.');
digitar('#nome', 'Léo');
assert.ok(!document.querySelector('#enviar').disabled);`,
      },
      {
        description: 'ao enviar, mostra o sucesso, limpa e desabilita o botão',
        code: `${ENVIAR}const envio = enviar();
assert.ok(envio.disparou, 'O botão habilitado deveria enviar o formulário.');
assert.ok(envio.prevenido, 'Chame event.preventDefault() no submit.');
const sucesso = document.querySelector('#sucesso');
assert.ok(!sucesso.hidden, 'Tire o hidden do #sucesso.');
assert.strictEqual(sucesso.textContent, 'Pedido confirmado! Chega em até 40 minutos.');
assert.strictEqual(document.querySelector('#nome').value, '', 'Use form.reset() para limpar os campos.');
assert.strictEqual(document.querySelector('#cep').value, '');
assert.ok(document.querySelector('#enviar').disabled, 'Depois do envio, o botão volta a ficar desabilitado.');`,
      },
    ],
    hints: [
      "Um único `form.addEventListener('input', ...)` pega a digitação de qualquer campo, porque o evento sobe até o formulário.",
      'Dentro dele: `cep.value = formatarCep(cep.value);` e `botao.disabled = !form.checkValidity();`.',
    ],
    followUpQuestionIds: ['front.m02.f21', 'front.m02.f22'],
    difficulty: 3,
  },
  {
    id: 'front.m02.d04',
    lessonId: 'front.m02.l04',
    kind: 'debug',
    title: 'R$ NaN',
    promptMarkdown: `Você fez uma máscara de dinheiro para o seu app de cobrança. O primeiro dígito funciona: digita \`5\`, aparece \`R$ 0,05\`. No segundo dígito, o campo vira **R$ NaN**. O cliente já perguntou se "NaN" é alguma taxa nova.

Conserte \`formatarMoeda(valor)\`: ela recebe o que está no campo (com ou sem \`R$\`, vírgula e ponto) e trata os dígitos como centavos. \`'R$ 0,051'\` deve virar \`R$ 0,51\`.`,
    language: 'web',
    starterFiles: {
      html: MOEDA_HTML,
      css: MOEDA_CSS,
      js: `function formatarMoeda(valor) {
  const centavos = Number(valor);
  const reais = centavos / 100;
  return 'R$ ' + reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
${MOEDA_WIRING}`,
    },
    solutionFiles: {
      html: MOEDA_HTML,
      css: MOEDA_CSS,
      js: `function formatarMoeda(valor) {
  const centavos = Number(valor.replace(/\\D/g, ''));
  const reais = centavos / 100;
  return 'R$ ' + reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
${MOEDA_WIRING}`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'só dígitos: 5 vira R$ 0,05',
        code: `assert.strictEqual(formatarMoeda('5'), 'R$ 0,05');`,
      },
      {
        description: 'valor que já tem máscara continua funcionando',
        code: `assert.strictEqual(formatarMoeda('R$ 0,051'), 'R$ 0,51');
assert.strictEqual(formatarMoeda('R$ 1.234,567'), 'R$ 12.345,67');
assert.strictEqual(formatarMoeda('R$ 0,0'), 'R$ 0,00');`,
      },
      {
        description: 'digitando 1, 5 e 0 no campo, chega a R$ 1,50',
        code: `${DIGITAR}const campo = document.querySelector('#valor');
digitar('#valor', campo.value + '1');
assert.strictEqual(campo.value, 'R$ 0,01');
digitar('#valor', campo.value + '5');
assert.strictEqual(campo.value, 'R$ 0,15');
digitar('#valor', campo.value + '0');
assert.strictEqual(campo.value, 'R$ 1,50');`,
      },
    ],
    hints: [
      "Experimente no console: `Number('R$ 0,051')`. O `Number` só entende texto que é número puro.",
      "Antes de converter, jogue fora tudo que não é dígito: `valor.replace(/\\D/g, '')`.",
    ],
    followUpQuestionIds: ['front.m02.f23', 'front.m02.f24'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m02.q25',
    lessonIds: ['front.m02.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual evento dispara a cada tecla digitada num campo, ideal para aplicar uma máscara?',
    options: ['`input`', '`submit`', '`click`', '`load`'],
    answerIndex: 0,
    explanation: '`input` dispara a cada mudança no valor, inclusive ao colar.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q26',
    lessonIds: ['front.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `const digitado = '(11) 98765-4321';
const d = digitado.replace(/\\D/g, '');
console.log(d);
console.log(d.length);`,
    expectedOutput: '11987654321\n11',
    explanation: '`\\D` pega tudo que não é dígito e o `g` troca todas as ocorrências por nada.',
    difficulty: 1,
  },
  // ---- gerais ----
  {
    id: 'front.m02.q27',
    lessonIds: ['front.m02.l04'],
    kind: 'predict-output',
    prompt: 'O que este código imprime?',
    code: `function formatarCep(valor) {
  const d = valor.replace(/\\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return d.slice(0, 5) + '-' + d.slice(5);
}
console.log(formatarCep('06454'));
console.log(formatarCep('064540'));
console.log(formatarCep('06454-000 fundos'));`,
    expectedOutput: '06454\n06454-0\n06454-000',
    explanation:
      'Até 5 dígitos, sem hífen. Depois, hífen após o 5º. Letras e espaços são descartados e o `slice` corta em 8.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q28',
    lessonIds: ['front.m02.l04'],
    kind: 'fill-blank',
    prompt: 'Complete para deixar o botão desabilitado enquanto o formulário estiver inválido.',
    code: 'botao.___ = !form.checkValidity();',
    acceptedAnswers: ['disabled'],
    explanation:
      '`disabled = true` desliga o botão; `!form.checkValidity()` é `true` quando algo está errado.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q29',
    lessonIds: ['front.m02.l04'],
    kind: 'true-false',
    prompt: 'Clicar num `<button type="submit" disabled>` envia o formulário normalmente.',
    answer: false,
    explanation: 'Botão desabilitado não reage ao clique e não envia nada.',
    difficulty: 1,
  },
  {
    id: 'front.m02.q30',
    lessonIds: ['front.m02.l04'],
    kind: 'multiple-choice',
    prompt:
      'Por que a máscara começa jogando fora tudo que não é dígito, mesmo que a pessoa só digite números?',
    options: [
      'Porque o valor que chega já tem os parênteses e hífens que a própria máscara colocou antes',
      'Porque o `input` sempre manda letras junto',
      'Para o campo ficar mais rápido',
      'Porque `slice` não funciona com números',
    ],
    answerIndex: 0,
    explanation:
      'A cada tecla, o campo tem o texto formatado + o dígito novo. Recomeçar dos dígitos evita bagunça.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q31',
    lessonIds: ['front.m02.l04'],
    kind: 'multiple-choice',
    prompt: 'Qual destas é uma máscara que **atrapalha** quem preenche?',
    options: [
      'Uma que não deixa apagar o hífen e joga o cursor para o fim a cada tecla',
      'Uma que coloca o hífen do CEP depois do 5º dígito',
      'Uma que aceita o telefone colado com espaços',
      'Uma que mostra o valor em R$ com vírgula',
    ],
    answerIndex: 0,
    explanation: 'Máscara boa ajuda sem brigar. Se o usuário luta com o campo, é melhor nem ter máscara.',
    difficulty: 2,
  },
  {
    id: 'front.m02.q32',
    lessonIds: ['front.m02.l04', 'front.m02.l03'],
    kind: 'fill-blank',
    prompt: 'Complete para limpar todos os campos do formulário depois do envio bem-sucedido.',
    code: 'form.___();',
    acceptedAnswers: ['reset'],
    explanation: '`form.reset()` volta todos os campos para o valor inicial do HTML.',
    difficulty: 1,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m02.f19',
    lessonIds: ['front.m02.l04'],
    exerciseId: 'front.m02.e07',
    kind: 'multiple-choice',
    prompt: 'Com a sua `formatarTelefone`, quanto dá `formatarTelefone("1198")`?',
    options: ['`(11) 98`', '`(11) 98-`', '`(1198`', '`11 98`'],
    answerIndex: 0,
    explanation: 'São 4 dígitos: faixa de 3 a 7, então parênteses no DDD e o resto depois do espaço.',
    difficulty: 1,
  },
  {
    id: 'front.m02.f20',
    lessonIds: ['front.m02.l04'],
    exerciseId: 'front.m02.e07',
    kind: 'true-false',
    prompt:
      'Na sua máscara de WhatsApp, colar "11 9 8765 4321" no campo também resulta em `(11) 98765-4321`.',
    answer: true,
    explanation: "Colar também dispara `input`, e os espaços somem no `replace(/\\D/g, '')`.",
    difficulty: 1,
  },
  {
    id: 'front.m02.f21',
    lessonIds: ['front.m02.l04'],
    exerciseId: 'front.m02.e08',
    kind: 'multiple-choice',
    prompt:
      'No pedido da Vó Nena, como um único listener de `input` no `<form>` percebe a digitação no `#nome` e no `#cep`?',
    options: [
      'O evento `input` sobe (borbulha) do campo até o formulário',
      'O formulário copia os listeners para cada campo',
      'Não percebe: precisa de um listener por campo',
      'O `checkValidity()` dispara o evento',
    ],
    answerIndex: 0,
    explanation: 'O `input` borbulha: dispara no campo e depois nos "pais", até o `<form>`.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f22',
    lessonIds: ['front.m02.l04'],
    exerciseId: 'front.m02.e08',
    kind: 'true-false',
    prompt:
      'No seu pedido, o botão só habilita com o CEP completo porque o `pattern` do HTML exige `00000-000` e o `checkValidity()` respeita isso.',
    answer: true,
    explanation:
      'Você não reescreveu a regra no JS: aproveitou `required` e `pattern` via `checkValidity()`.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f23',
    lessonIds: ['front.m02.l04'],
    exerciseId: 'front.m02.d04',
    kind: 'multiple-choice',
    prompt: 'No app de cobrança, por que aparecia `R$ NaN` a partir do segundo dígito?',
    options: [
      "`Number('R$ 0,051')` dá `NaN`: o valor já tinha `R$` e vírgula da máscara anterior",
      'O `toLocaleString` não conhece o real',
      'Dividir por 100 dá `NaN`',
      'O campo tinha `inputmode="numeric"`',
    ],
    answerIndex: 0,
    explanation:
      'No primeiro dígito o campo tinha só "5". Depois, já tinha a máscara, e o `Number` não entende `R$`.',
    difficulty: 2,
  },
  {
    id: 'front.m02.f24',
    lessonIds: ['front.m02.l04'],
    exerciseId: 'front.m02.d04',
    kind: 'multiple-choice',
    prompt: 'Com a sua `formatarMoeda` consertada, quanto dá `formatarMoeda("R$ 12,345")`?',
    options: ['`R$ 123,45`', '`R$ 12,34`', '`R$ 12.345,00`', '`R$ NaN`'],
    answerIndex: 0,
    explanation: 'Os dígitos são 12345 centavos, ou seja, R$ 123,45.',
    difficulty: 2,
  },
];
