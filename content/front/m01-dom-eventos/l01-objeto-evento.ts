import type { Exercise, Lesson, Question } from '../../../src/shared/content';

export const lesson: Lesson = {
  id: 'front.m01.l01',
  moduleId: 'front.m01',
  order: 1,
  title: 'O objeto do evento',
  concepts: [
    'objeto event',
    'event.target',
    'event.currentTarget',
    'input e change',
    'keydown e event.key',
    'submit',
    'preventDefault',
  ],
  sections: [
    {
      kind: 'text',
      markdown: `Parabéns pela efetivação! Agora que você é **Júnior**, o cliente não quer mais "um botão que muda a cor". Quer formulário que valida, atalho de teclado, chat que não recarrega a página... Tudo isso começa num detalhe que você talvez nem tenha notado: a função do \`addEventListener\` **recebe um argumento**.

\`\`\`js
botao.addEventListener('click', function (event) {
  console.log(event.type); // 'click'
});
\`\`\`

Esse \`event\` (muita gente chama de \`e\` ou \`evento\`) é um objeto que o navegador monta a cada evento, com tudo o que aconteceu:

- \`event.type\`: o nome do evento (\`'click'\`, \`'input'\`...);
- \`event.target\`: o elemento **onde o evento começou** (o que foi clicado ou digitado de verdade);
- \`event.currentTarget\`: o elemento **onde está o ouvinte** (aquele em que você chamou \`addEventListener\`);
- \`event.key\`: nos eventos de teclado, a tecla (\`'Enter'\`, \`'Escape'\`, \`'a'\`...).

## target × currentTarget

Os dois parecem iguais até o dia em que o botão tem coisa dentro:

\`\`\`html
<button id="salvar"><span class="icone">💾</span> Salvar</button>
\`\`\`

Clicou bem em cima do ícone? O \`target\` é o \`<span>\`, mas o \`currentTarget\` continua sendo o \`<button>\`. Se o seu código precisa do botão, use \`currentTarget\`.`,
    },
    {
      kind: 'text',
      markdown: `## Eventos que você vai usar todo dia

| Evento | Quando dispara |
| --- | --- |
| \`input\` | a cada mudança no valor do campo (cada letra digitada) |
| \`change\` | quando a mudança é "confirmada": sair do campo, escolher no \`<select>\`, marcar um checkbox |
| \`keydown\` | quando uma tecla é apertada; veja qual em \`event.key\` |
| \`submit\` | quando um \`<form>\` é enviado: clique no botão de enviar **ou** Enter dentro de um campo |

O \`submit\` é ouvido **no \`<form>\`**, não no botão. Assim o Enter também funciona, de graça.

## preventDefault: "navegador, deixa comigo"

Alguns eventos têm um **comportamento padrão**: enviar um formulário recarrega a página (ou vai para outra), clicar num link navega. Quando o seu JS vai cuidar de tudo, cancele o padrão:

\`\`\`js
form.addEventListener('submit', function (event) {
  event.preventDefault(); // sem isso, a página recarrega e o que o JS fez some
  // ...ler os campos, mostrar a mensagem...
});
\`\`\`

Esquecer o \`preventDefault\` é aquele bug em que "pisca e some tudo". Todo júnior já perdeu uma tarde nele.`,
    },
    {
      kind: 'example',
      language: 'html',
      code: `<input id="cep" placeholder="CEP do cliente">
<p id="eco"></p>

<script>
  const eco = document.querySelector('#eco');

  document.querySelector('#cep').addEventListener('input', function (event) {
    eco.textContent = 'Digitado até agora: ' + event.target.value;
  });

  document.querySelector('#cep').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      eco.textContent = 'Buscando o CEP ' + event.target.value + '...';
    }
  });
</script>`,
      explanation:
        'O `input` roda a cada letra; o `keydown` olha `event.key` para reagir só ao Enter. Nos dois, `event.target` é o próprio campo.',
    },
    {
      kind: 'example',
      language: 'html',
      code: `<form id="contato">
  <input id="nome" placeholder="Seu nome">
  <button type="submit">Enviar</button>
</form>
<p id="resposta"></p>

<script>
  document.querySelector('#contato').addEventListener('submit', function (event) {
    event.preventDefault();
    const nome = document.querySelector('#nome').value.trim();
    document.querySelector('#resposta').textContent = 'Valeu, ' + nome + '! Respondo em até 48 horas (úteis).';
  });
</script>`,
      explanation:
        'O ouvinte fica no `<form>`, então clique no botão e Enter no campo caem no mesmo lugar. O `preventDefault` impede a página de recarregar.',
    },
  ],
  checkQuestionIds: ['front.m01.q01', 'front.m01.q02'],
  exerciseIds: ['front.m01.e01', 'front.m01.e02'],
  debugExerciseIds: ['front.m01.d01'],
};

const BIO_HTML = `<label for="bio">Bio do seu perfil de freela</label>
<textarea id="bio" rows="4"></textarea>
<p><span id="restantes">140</span> caracteres restantes</p>`;

const BIO_CSS = `body { font-family: sans-serif; }
textarea { display: block; width: 320px; }
.alerta { color: rgb(200, 0, 0); font-weight: bold; }`;

const CHAT_HTML = `<h2>Chat com o cliente</h2>
<ul id="mensagens"></ul>
<form id="form-chat">
  <input id="mensagem" placeholder="Escreva para o cliente" autocomplete="off">
  <button type="submit">Enviar</button>
</form>
<p id="erro"></p>`;

const CHAT_CSS = `body { font-family: sans-serif; }
#mensagens li { background: rgb(220, 248, 198); margin: 4px 0; padding: 6px 10px; border-radius: 8px; list-style: none; }
#erro { color: rgb(200, 0, 0); }`;

const FERRAMENTAS_HTML = `<div class="ferramentas">
  <button class="ferramenta" id="negrito"><span class="icone">B</span> <span class="rotulo">Negrito</span></button>
  <button class="ferramenta" id="italico"><span class="icone">I</span> <span class="rotulo">Itálico</span></button>
  <button class="ferramenta" id="sublinhado"><span class="icone">U</span> <span class="rotulo">Sublinhado</span></button>
</div>
<p>Ferramenta ativa: <strong id="status">nenhuma</strong></p>`;

const FERRAMENTAS_CSS = `body { font-family: sans-serif; }
.ferramenta { padding: 6px 12px; }
.ferramenta.ativa { background: rgb(40, 90, 200); color: white; }`;

export const exercises: Exercise[] = [
  {
    id: 'front.m01.e01',
    lessonId: 'front.m01.l01',
    kind: 'implement',
    title: 'Contador da bio',
    promptMarkdown: `A plataforma de freelas só aceita bios de até **140 caracteres**. Você vai mostrar quantos ainda cabem enquanto a pessoa digita.

No evento \`input\` do \`#bio\`:

1. calcule \`140 - (tamanho do texto digitado)\`, usando \`event.target.value\`;
2. mostre o resultado em \`#restantes\`;
3. se passar do limite (resultado negativo), coloque a classe \`alerta\` em \`#restantes\`; se voltar para dentro do limite, tire a classe.`,
    language: 'web',
    starterFiles: {
      html: BIO_HTML,
      css: BIO_CSS,
      js: `const LIMITE = 140;
const restantes = document.querySelector('#restantes');

document.querySelector('#bio').addEventListener('input', function (event) {
  // seu código aqui
});
`,
    },
    solutionFiles: {
      html: BIO_HTML,
      css: BIO_CSS,
      js: `const LIMITE = 140;
const restantes = document.querySelector('#restantes');

document.querySelector('#bio').addEventListener('input', function (event) {
  const falta = LIMITE - event.target.value.length;
  restantes.textContent = falta;
  if (falta < 0) {
    restantes.classList.add('alerta');
  } else {
    restantes.classList.remove('alerta');
  }
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'antes de digitar, mostra 140 sem alerta',
        code: `assert.strictEqual(document.querySelector('#restantes').textContent, '140');
assert.ok(!document.querySelector('#restantes').classList.contains('alerta'), 'Sem texto, não deveria ter alerta.');`,
      },
      {
        description: 'digitar "Faço sites rapidinho" mostra 120',
        code: `const bio = document.querySelector('#bio');
bio.value = 'Faço sites rapidinho';
bio.dispatchEvent(new Event('input', { bubbles: true }));
assert.strictEqual(document.querySelector('#restantes').textContent, '120', 'O texto tem 20 caracteres: deveriam restar 120.');`,
      },
      {
        description: 'passar do limite mostra o número negativo com a classe alerta',
        code: `const bio = document.querySelector('#bio');
bio.value = 'a'.repeat(150);
bio.dispatchEvent(new Event('input', { bubbles: true }));
assert.strictEqual(document.querySelector('#restantes').textContent, '-10', 'Com 150 caracteres, deveria mostrar -10.');
assert.ok(document.querySelector('#restantes').classList.contains('alerta'), 'Passou do limite: faltou a classe "alerta".');`,
      },
      {
        description: 'voltar para dentro do limite tira o alerta',
        code: `const bio = document.querySelector('#bio');
bio.value = 'ok';
bio.dispatchEvent(new Event('input', { bubbles: true }));
assert.strictEqual(document.querySelector('#restantes').textContent, '138');
assert.ok(!document.querySelector('#restantes').classList.contains('alerta'), 'Voltou para dentro do limite: a classe "alerta" deveria sair.');`,
      },
    ],
    hints: [
      '`event.target` é o próprio `<textarea>`; o texto está em `event.target.value` e o tamanho em `.length`.',
      "Use um `if` com `classList.add` e `classList.remove`. (Ou, de bônus: `classList.toggle('alerta', falta < 0)`.)",
    ],
    followUpQuestionIds: ['front.m01.f01', 'front.m01.f02'],
    difficulty: 1,
  },
  {
    id: 'front.m01.e02',
    lessonId: 'front.m01.l01',
    kind: 'implement',
    title: 'Chat com o cliente',
    promptMarkdown: `O cliente quer um chat no site. "Igual daqueles apps, sabe?" Faça a versão mínima:

1. No \`submit\` do \`#form-chat\`, chame \`event.preventDefault()\` (a página **não** pode recarregar).
2. Leia o texto de \`#mensagem\` com \`.trim()\`. Se estiver vazio, escreva \`Escreva alguma coisa.\` em \`#erro\` e pare por aí.
3. Senão, crie um \`<li>\` com o texto dentro de \`#mensagens\`, limpe o campo e limpe o \`#erro\`.
4. Apertar **Escape** dentro de \`#mensagem\` (evento \`keydown\`) apaga o que estava digitado.`,
    language: 'web',
    starterFiles: {
      html: CHAT_HTML,
      css: CHAT_CSS,
      js: `const form = document.querySelector('#form-chat');
const campo = document.querySelector('#mensagem');
const mensagens = document.querySelector('#mensagens');
const erro = document.querySelector('#erro');

// seu código aqui
`,
    },
    solutionFiles: {
      html: CHAT_HTML,
      css: CHAT_CSS,
      js: `const form = document.querySelector('#form-chat');
const campo = document.querySelector('#mensagem');
const mensagens = document.querySelector('#mensagens');
const erro = document.querySelector('#erro');

form.addEventListener('submit', function (event) {
  event.preventDefault();
  const texto = campo.value.trim();
  if (texto === '') {
    erro.textContent = 'Escreva alguma coisa.';
    return;
  }
  const item = document.createElement('li');
  item.textContent = texto;
  mensagens.append(item);
  campo.value = '';
  erro.textContent = '';
});

campo.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    campo.value = '';
  }
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'enviar o formulário não recarrega a página',
        code: `document.querySelector('#mensagem').value = 'Bom dia! Chego em 20 minutos.';
const envio = new Event('submit', { bubbles: true, cancelable: true });
document.querySelector('#form-chat').dispatchEvent(envio);
assert.ok(envio.defaultPrevented, 'O envio recarregaria a página: faltou event.preventDefault() no submit do formulário.');`,
      },
      {
        description: 'a mensagem enviada aparece na lista e o campo é limpo',
        code: `const itens = document.querySelectorAll('#mensagens li');
assert.strictEqual(itens.length, 1, 'Deveria haver 1 mensagem na lista.');
assert.strictEqual(itens[0].textContent, 'Bom dia! Chego em 20 minutos.');
assert.strictEqual(document.querySelector('#mensagem').value, '', 'Depois de enviar, o campo deveria ficar vazio.');`,
      },
      {
        description: 'mensagem só com espaços mostra erro e não entra na lista',
        code: `document.querySelector('#mensagem').value = '   ';
document.querySelector('#form-chat').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
assert.strictEqual(document.querySelectorAll('#mensagens li').length, 1, 'Mensagem vazia não deveria entrar na lista.');
assert.strictEqual(document.querySelector('#erro').textContent, 'Escreva alguma coisa.');`,
      },
      {
        description: 'uma mensagem válida depois do erro limpa o #erro',
        code: `document.querySelector('#mensagem').value = '  O orçamento sai hoje.  ';
document.querySelector('#form-chat').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
const itens = document.querySelectorAll('#mensagens li');
assert.strictEqual(itens.length, 2);
assert.strictEqual(itens[1].textContent, 'O orçamento sai hoje.', 'Use .trim() para tirar os espaços das pontas.');
assert.strictEqual(document.querySelector('#erro').textContent, '', 'Depois de enviar certo, o erro deveria sumir.');`,
      },
      {
        description: 'Escape apaga o que está digitado',
        code: `const campo = document.querySelector('#mensagem');
campo.value = 'Pode ser na sexta? Ou no sábado? Ou';
campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
assert.strictEqual(campo.value, '', 'Escape deveria limpar o campo.');`,
      },
      {
        description: 'outras teclas não apagam nada',
        code: `const campo = document.querySelector('#mensagem');
campo.value = 'Combinado';
campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
assert.strictEqual(campo.value, 'Combinado', 'Só o Escape deveria limpar o campo.');`,
      },
    ],
    hints: [
      "O ouvinte do envio vai no formulário: `form.addEventListener('submit', function (event) { ... })`.",
      'A primeira linha dentro do submit é `event.preventDefault();`. Para o caso vazio, use `return` depois de escrever o erro.',
      "Para o Escape: `campo.addEventListener('keydown', ...)` e compare `event.key === 'Escape'`.",
    ],
    followUpQuestionIds: ['front.m01.f03', 'front.m01.f04'],
    difficulty: 2,
  },
  {
    id: 'front.m01.d01',
    lessonId: 'front.m01.l01',
    kind: 'debug',
    title: 'A barra de ferramentas teimosa',
    promptMarkdown: `O editor de cardápio de um cliente tem uma barra com **Negrito**, **Itálico** e **Sublinhado**. Clicando na borda do botão, funciona. Clicando bem em cima da palavra ou da letra, a ferramenta não fica ativa e o status mostra vazio.

Conserte para que o clique em **qualquer parte** do botão deixe aquele \`.ferramenta\` com a classe \`ativa\` e mostre o \`id\` dele em \`#status\`.`,
    language: 'web',
    starterFiles: {
      html: FERRAMENTAS_HTML,
      css: FERRAMENTAS_CSS,
      js: `const botoes = document.querySelectorAll('.ferramenta');
const status = document.querySelector('#status');

botoes.forEach(function (botao) {
  botao.addEventListener('click', function (event) {
    botoes.forEach(function (b) {
      b.classList.remove('ativa');
    });
    event.target.classList.add('ativa');
    status.textContent = event.target.id;
  });
});
`,
    },
    solutionFiles: {
      html: FERRAMENTAS_HTML,
      css: FERRAMENTAS_CSS,
      js: `const botoes = document.querySelectorAll('.ferramenta');
const status = document.querySelector('#status');

botoes.forEach(function (botao) {
  botao.addEventListener('click', function (event) {
    botoes.forEach(function (b) {
      b.classList.remove('ativa');
    });
    event.currentTarget.classList.add('ativa');
    status.textContent = event.currentTarget.id;
  });
});
`,
    },
    editableFiles: ['js'],
    tests: [
      {
        description: 'clicar na palavra "Negrito" ativa o botão de negrito',
        code: `click('#negrito .rotulo');
assert.ok(document.querySelector('#negrito').classList.contains('ativa'), 'O botão #negrito deveria ficar com a classe "ativa".');
assert.strictEqual(document.querySelector('#status').textContent, 'negrito');`,
      },
      {
        description: 'clicar na letra "I" ativa o itálico e desativa o negrito',
        code: `click('#italico .icone');
assert.ok(document.querySelector('#italico').classList.contains('ativa'), 'O botão #italico deveria ficar ativo.');
assert.ok(!document.querySelector('#negrito').classList.contains('ativa'), 'O negrito deveria sair de ativo.');
assert.strictEqual(document.querySelector('#status').textContent, 'italico');`,
      },
      {
        description: 'nenhum <span> de dentro ganha a classe ativa',
        code: `assert.strictEqual(document.querySelectorAll('span.ativa').length, 0, 'A classe foi parar num <span>, não no botão.');`,
      },
      {
        description: 'clicar no próprio botão também funciona',
        code: `click('#sublinhado');
assert.ok(document.querySelector('#sublinhado').classList.contains('ativa'));
assert.strictEqual(document.querySelector('#status').textContent, 'sublinhado');`,
      },
    ],
    hints: [
      'Quando você clica no texto, quem é o `event.target`: o `<button>` ou o `<span>` de dentro dele?',
      'O ouvinte está no botão. A propriedade que sempre aponta para o elemento do ouvinte é `event.currentTarget`.',
    ],
    followUpQuestionIds: ['front.m01.f05', 'front.m01.f06'],
    difficulty: 2,
  },
];

export const questions: Question[] = [
  // ---- checagem ----
  {
    id: 'front.m01.q01',
    lessonIds: ['front.m01.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para o formulário não recarregar a página ao ser enviado.',
    code: "form.addEventListener('submit', function (event) {\n  event.___();\n  // ...\n});",
    acceptedAnswers: ['preventDefault'],
    explanation:
      '`event.preventDefault()` cancela o comportamento padrão do evento, que no `submit` é enviar e recarregar.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q02',
    lessonIds: ['front.m01.l01'],
    kind: 'multiple-choice',
    code: '<button id="salvar"><span class="icone">💾</span> Salvar</button>',
    prompt:
      'O ouvinte de clique está no `#salvar`. O usuário clica bem em cima do ícone. Quem são `event.target` e `event.currentTarget`?',
    options: [
      '`target` é o `<span>`; `currentTarget` é o `<button>`',
      '`target` é o `<button>`; `currentTarget` é o `<span>`',
      'Os dois são o `<button>`',
      'Os dois são o `<span>`',
    ],
    answerIndex: 0,
    explanation:
      '`target` é onde o clique começou (o ícone). `currentTarget` é onde o ouvinte foi registrado (o botão).',
    difficulty: 2,
  },
  // ---- gerais ----
  {
    id: 'front.m01.q03',
    lessonIds: ['front.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Num campo de texto, qual a diferença entre os eventos `input` e `change`?',
    options: [
      '`input` dispara a cada letra; `change` quando a pessoa termina e sai do campo',
      '`change` dispara a cada letra; `input` só ao sair do campo',
      'Nenhuma, são nomes diferentes para o mesmo evento',
      '`input` só existe em `<textarea>`',
    ],
    answerIndex: 0,
    explanation:
      '`input` acompanha a digitação em tempo real. `change` espera a mudança ser confirmada (sair do campo, escolher no select).',
    difficulty: 1,
  },
  {
    id: 'front.m01.q04',
    lessonIds: ['front.m01.l01'],
    kind: 'true-false',
    prompt:
      'O evento `submit` é ouvido no `<form>` e também dispara quando o usuário aperta Enter dentro de um campo do formulário.',
    answer: true,
    explanation:
      'Por isso é melhor ouvir o `submit` do form do que o `click` do botão: o Enter funciona de graça.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q05',
    lessonIds: ['front.m01.l01'],
    kind: 'multiple-choice',
    prompt: 'Dentro de um ouvinte de `keydown`, como saber se a tecla apertada foi o Enter?',
    options: [
      "`event.key === 'Enter'`",
      "`event.type === 'Enter'`",
      "`event.target === 'Enter'`",
      "`event.value === 'Enter'`",
    ],
    answerIndex: 0,
    explanation: '`event.key` traz o nome da tecla. `event.type` seria `"keydown"`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q06',
    lessonIds: ['front.m01.l01'],
    kind: 'true-false',
    prompt:
      'Sem `preventDefault`, enviar um `<form>` faz o navegador recarregar (ou trocar) a página, e o que o JavaScript tinha mostrado some.',
    answer: true,
    explanation:
      'Esse é o comportamento padrão do envio. O `preventDefault` cancela e deixa o JS no controle.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q07',
    lessonIds: ['front.m01.l01'],
    kind: 'fill-blank',
    prompt: 'Complete para mostrar no console o que foi digitado no campo.',
    code: "campo.addEventListener('input', function (event) {\n  console.log(event.___.value);\n});",
    acceptedAnswers: ['target', 'currentTarget'],
    explanation:
      'O ouvinte está no próprio campo, então `event.target` e `event.currentTarget` apontam para ele. O texto está em `.value`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.q08',
    lessonIds: ['front.m01.l01'],
    kind: 'multiple-choice',
    code: "function registrar(event) {\n  console.log(event.type);\n}\ncampo.addEventListener('input', registrar);\ncampo.addEventListener('keydown', registrar);",
    prompt: 'O usuário aperta a tecla "a" no campo. O que aparece no console, em ordem?',
    options: ['`keydown` e depois `input`', 'Só `input`', '`a` e depois `a`', '`registrar` duas vezes'],
    answerIndex: 0,
    explanation:
      'Apertar a tecla dispara `keydown`; quando a letra entra no campo, dispara `input`. `event.type` diz qual dos dois chamou a função.',
    difficulty: 2,
  },
  // ---- acompanhamento ----
  {
    id: 'front.m01.f01',
    lessonIds: ['front.m01.l01'],
    exerciseId: 'front.m01.e01',
    kind: 'multiple-choice',
    prompt: 'No contador da bio, por que usar o evento `input` e não `change`?',
    options: [
      'Porque `input` atualiza a cada letra; com `change` o número só mudaria ao sair do campo',
      'Porque `change` não funciona em `<textarea>`',
      'Porque `input` é mais rápido de digitar',
      'Tanto faz, os dois atualizam a cada letra',
    ],
    answerIndex: 0,
    explanation: 'Um contador de caracteres precisa reagir em tempo real, e quem faz isso é o `input`.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f02',
    lessonIds: ['front.m01.l01'],
    exerciseId: 'front.m01.e01',
    kind: 'true-false',
    prompt: 'No seu contador, `event.target` é o próprio `#bio`, porque foi nele que a digitação aconteceu.',
    answer: true,
    explanation:
      'O evento começou no `<textarea>`, então ele é o `target` (e também o `currentTarget`, já que o ouvinte está nele).',
    difficulty: 1,
  },
  {
    id: 'front.m01.f03',
    lessonIds: ['front.m01.l01'],
    exerciseId: 'front.m01.e02',
    kind: 'multiple-choice',
    prompt: 'No seu chat, o que aconteceria se você tirasse o `event.preventDefault()`?',
    options: [
      'O navegador enviaria o formulário e recarregaria a página, sumindo com as mensagens',
      'A mensagem apareceria duas vezes',
      'O botão Enviar pararia de responder',
      'Nada, ele é só um enfeite',
    ],
    answerIndex: 0,
    explanation:
      'O padrão do `submit` é enviar e recarregar. Seu JS cria o `<li>`, mas a página nova chega sem ele.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f04',
    lessonIds: ['front.m01.l01'],
    exerciseId: 'front.m01.e02',
    kind: 'fill-blank',
    prompt: 'Complete a condição do seu chat que limpa o campo com a tecla Escape.',
    code: "campo.addEventListener('keydown', function (event) {\n  if (event.key === '___') {\n    campo.value = '';\n  }\n});",
    acceptedAnswers: ['Escape'],
    explanation: 'O nome da tecla Esc em `event.key` é `"Escape"`, com E maiúsculo.',
    difficulty: 1,
  },
  {
    id: 'front.m01.f05',
    lessonIds: ['front.m01.l01'],
    exerciseId: 'front.m01.d01',
    kind: 'multiple-choice',
    prompt: 'No código com defeito, quem era o `event.target` quando você clicava na palavra "Negrito"?',
    options: [
      'O `<span class="rotulo">`, que não tem `id`',
      'O botão `#negrito`',
      'A `<div class="ferramentas">`',
      'O `document`',
    ],
    answerIndex: 0,
    explanation:
      'O clique começou no `<span>`. Por isso a classe ia para ele e o status ficava vazio (o span não tem `id`).',
    difficulty: 2,
  },
  {
    id: 'front.m01.f06',
    lessonIds: ['front.m01.l01'],
    exerciseId: 'front.m01.d01',
    kind: 'true-false',
    prompt:
      'Na correção, `event.currentTarget` sempre aponta para o botão em que você chamou `addEventListener`, não importa em que parte dele o clique caiu.',
    answer: true,
    explanation:
      '`currentTarget` é o dono do ouvinte. Por isso ele resolve o problema dos elementos de dentro.',
    difficulty: 1,
  },
];
