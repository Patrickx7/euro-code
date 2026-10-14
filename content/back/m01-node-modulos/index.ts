import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-node-scripts';
import * as l02 from './l02-commonjs';
import * as l03 from './l03-esm';
import * as l04 from './l04-linha-de-comando';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'back.m01.j01',
    moduleId: 'back.m01',
    title: 'Checklist de deploy da loja de açaí',
    briefMarkdown:
      'O site de delivery do Açaí do Grau já caiu duas vezes em deploy de sexta à noite. A Kel quer um ' +
      'script que confira o checklist antes de subir e grite (no stderr) o que está faltando.',
    client: {
      name: 'Açaí do Grau',
      contact: 'Kel',
      place: 'client-office',
      area: 'Km 18, Osasco',
    },
    seniority: 'junior',
    path: 'back',
    pay: 70,
    slaMinutes: 50,
    taskExerciseIds: ['back.m01.e01'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou top! Ah, tem um validador de horas que o meu sobrinho fez que sai sem falar nada. Olha ' +
          'rapidinho? É uma linha, ele disse.',
        extraExerciseId: 'back.m01.d01',
        extraPay: 0,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: ['Oi! Senta aí, o servidor é aquele notebook do lado do freezer.', 'Não encosta no freezer.'],
      delivery: [
        'Agora o deploy só sobe se tiver tudo ok? Vou dormir tranquila na sexta. Leva um açaí de 500!',
      ],
    },
  },
  {
    id: 'back.m01.j02',
    moduleId: 'back.m01',
    title: 'Desmontar o tudo.js da distribuidora',
    briefMarkdown:
      'A Distribuidora Água na Porta tem um sistema de recibos e orçamentos num arquivo só, de 3 mil ' +
      'linhas, feito pelo sobrinho do dono. O Seu Valdir quer separar em módulos e, de quebra, fazer o ' +
      'recibo voltar a funcionar.',
    client: {
      name: 'Distribuidora Água na Porta',
      contact: 'Seu Valdir',
      place: 'client-office',
      area: 'Vila Dirce, Carapicuíba',
    },
    seniority: 'junior',
    path: 'back',
    pay: 120,
    slaMinutes: 80,
    taskExerciseIds: ['back.m01.d02', 'back.m01.e02'],
    chat: {
      arrival: [
        'Chegou o doutor do computador! O sistema é aquele ali, o arquivo chama tudo.js.',
        'Tudo mesmo. Até a lista de aniversário da família tá lá dentro.',
      ],
      delivery: ['Módulo, é? Bonito. Vou mostrar pro meu sobrinho, ele vai ficar bravo.'],
    },
  },
  {
    id: 'back.m01.j03',
    moduleId: 'back.m01',
    title: 'Migração da cotação de frete para ESM',
    briefMarkdown:
      'A Transportadora Leva e Traz contratou uma agência que "modernizou" o projeto para ESM e sumiu. ' +
      'Metade parou de funcionar. A Pri precisa da cotação de frete e do recibo de volta antes da reunião ' +
      'com o investidor.',
    client: {
      name: 'Transportadora Leva e Traz',
      contact: 'Pri',
      place: 'coworking',
      area: 'Alphaville, Barueri',
    },
    seniority: 'junior',
    path: 'back',
    pay: 150,
    slaMinutes: 100,
    taskExerciseIds: ['back.m01.e03', 'back.m01.d03'],
    twists: [
      {
        afterTask: 1,
        message:
          'Salvou! Último pedido, juro: o script que soma as horas dos motoristas diz que o Robson trabalhou ' +
          '32 horas hoje. Ele trabalhou 5. Dá uma olhada?',
        extraExerciseId: 'back.m01.d04',
        extraPay: 20,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: ['Oi! A reunião é em duas horas. Sem pressão. Muita pressão.'],
      delivery: ['Funcionou na frente do investidor! Vou dizer que foi IA. Brincadeira, o pix já foi.'],
    },
  },
  {
    id: 'back.m01.j04',
    moduleId: 'back.m01',
    title: 'Orçamento no terminal do estúdio',
    briefMarkdown:
      'O Estúdio Foto Clique cobra por hora ou por diária e vive errando o orçamento de cabeça. O Tavinho ' +
      'quer digitar `node orcamento.js 2 dias` e ter o valor na hora, com o preço da hora configurável.',
    client: {
      name: 'Estúdio Foto Clique',
      contact: 'Tavinho',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'junior',
    path: 'back',
    pay: 180,
    slaMinutes: 120,
    taskExerciseIds: ['back.m01.e04'],
    chat: {
      arrival: [
        'Fala! Cuidado com o fundo infinito, acabei de pintar.',
        'O terminal é aquela tela preta, né?',
      ],
      delivery: ['Que chique, orçamento por linha de comando. Vou cobrar mais caro só por isso.'],
    },
  },
];

const contentModule: ContentModule = {
  id: 'back.m01',
  track: 'back',
  order: 1,
  seniority: 'junior',
  title: 'Node.js: scripts, módulos e process',
  summary:
    'JavaScript fora do navegador: rodar scripts com o Node, stdout e stderr, código de saída, módulos ' +
    'CommonJS (require e module.exports) e ES (import e export) e scripts de linha de comando com ' +
    'process.argv e process.env.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default contentModule;
