import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-event-loop-callbacks';
import * as l02 from './l02-promises';
import * as l03 from './l03-async-await';
import * as l04 from './l04-eventemitter';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'back.m03.j01',
    moduleId: 'back.m03',
    title: 'API de estoque do depósito',
    briefMarkdown:
      'O Depósito Tijolo Torto quer consultar o estoque pelo sistema novo. Primeiro no estilo Node, com ' +
      'callback; depois numa versão com Promise, porque o sobrinho do dono "só sabe Promise". ' +
      'A API deles demora, mas pelo menos é honesta sobre isso.',
    client: {
      name: 'Depósito Tijolo Torto',
      contact: 'Seu Arlindo',
      place: 'client-office',
      area: 'Vila Dirce, Carapicuíba',
    },
    seniority: 'junior',
    path: 'back',
    pay: 90,
    slaMinutes: 75,
    taskExerciseIds: ['back.m03.e01', 'back.m03.e02'],
    chat: {
      arrival: [
        'Chegou! Cuidado com o saco de cimento na porta, ele tá aí desde 2019.',
        'O sistema antigo era um caderno. Esse aqui pelo menos não molha.',
      ],
      delivery: ['Consultou 3000 tijolos em 20 milissegundos! O caderno levava a tarde. Pix enviado.'],
    },
  },
  {
    id: 'back.m03.j02',
    moduleId: 'back.m03',
    title: 'Frete mais barato da loja de móveis',
    briefMarkdown:
      'A Móveis Montados Pela Metade cota o frete em várias transportadoras, uma de cada vez, e o cliente ' +
      'desiste no meio. Faça as cotações rodarem **em paralelo** e coloque um **timeout** na API de CEP, ' +
      'que às vezes simplesmente some.',
    client: {
      name: 'Móveis Montados Pela Metade',
      contact: 'Dona Rosângela',
      place: 'client-office',
      area: 'Jardim Belval, Barueri',
    },
    seniority: 'junior',
    path: 'back',
    pay: 150,
    slaMinutes: 110,
    taskExerciseIds: ['back.m03.e04', 'back.m03.e03'],
    twists: [
      {
        afterTask: 1,
        message:
          'Que maravilha! Ah, e os SMS de "saiu para entrega" que o estagiário fez saem todos zerados. ' +
          'Dá uma olhadinha? É coisa rápida.',
        extraExerciseId: 'back.m03.d03',
        extraPay: 20,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'Pode sentar naquele sofá. Só não encosta, ele ainda não tem os parafusos.',
        'Hoje o site levou 40 segundos para cotar um frete. A cliente comprou na loja do lado.',
      ],
      delivery: ['Cotou tudo de uma vez! Agora só falta alguém montar o sofá. Pagamento caindo aí.'],
    },
  },
  {
    id: 'back.m03.j03',
    moduleId: 'back.m03',
    title: 'Impressora de comandas temperamental',
    briefMarkdown:
      'A impressora de comandas da Pizzaria Borda Recheada de Bug falha "quando ela quer". Coloque um ' +
      '**retry** no envio e conserte o cálculo do total do pedido, que de vez em quando vira `undefined` ' +
      'e trava o caixa no meio da sexta-feira.',
    client: {
      name: 'Pizzaria Borda Recheada de Bug',
      contact: 'Seu Vicente',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'junior',
    path: 'back',
    pay: 120,
    slaMinutes: 90,
    taskExerciseIds: ['back.m03.e05', 'back.m03.d02'],
    chat: {
      arrival: [
        'Bem-vindo! A impressora tá ali. Fala baixo perto dela, ela é sensível.',
        'Já tentei desligar e ligar. Já tentei rezar. Agora é com você.',
      ],
      delivery: ['Três tentativas e saiu a comanda! Leva uma brotinho de calabresa pra estrada.'],
    },
  },
  {
    id: 'back.m03.j04',
    moduleId: 'back.m03',
    title: 'Painel de pedidos da padaria',
    briefMarkdown:
      'A Padaria Fermento Lento quer um painel que mostra os pedidos **na hora**: chegou pedido, aparece; ' +
      'ficou pronto, avisa. Monte a fila com `EventEmitter` e faça o painel parar de apitar depois que a ' +
      'padaria fecha.',
    client: {
      name: 'Padaria Fermento Lento',
      contact: 'Dona Fátima',
      place: 'client-office',
      area: 'Centro, Osasco',
    },
    seniority: 'junior',
    path: 'back',
    pay: 170,
    slaMinutes: 120,
    taskExerciseIds: ['back.m03.e06', 'back.m03.d04', 'back.m03.e07'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou lindo! Só uma coisinha: a comanda da chapa quebra quando o número do pedido tá errado. ' +
          'É rapidinho, né?',
        extraExerciseId: 'back.m03.d01',
        extraPay: 0,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: [
        'Bom dia! Pega um pão na chapa, o painel pode esperar cinco minutos.',
        'O painel apita a noite inteira. O vigia já pediu demissão duas vezes.',
      ],
      delivery: ['Pedido novo, pedido pronto e silêncio à noite. O vigia agradece! Pix enviado.'],
    },
  },
];

const asyncModule: ContentModule = {
  id: 'back.m03',
  track: 'back',
  order: 3,
  seniority: 'junior',
  title: 'Assíncrono no Node: Promises, async/await e eventos',
  summary:
    'Como o Node não fica esperando: event loop e callbacks, Promises (then/catch, all, allSettled, race), ' +
    'async/await com retry e paralelismo, e EventEmitter para filas de pedidos que avisam na hora.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default asyncModule;
