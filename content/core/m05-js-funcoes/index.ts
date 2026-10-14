import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-funcoes';
import * as l02 from './l02-arrow-escopo';
import * as l03 from './l03-lacos';
import * as l04 from './l04-arrays';
import * as l05 from './l05-metodos-objetos';

const parts = [l01, l02, l03, l04, l05];

const jobs: JobTemplate[] = [
  {
    id: 'core.m05.j01',
    moduleId: 'core.m05',
    title: 'Calculadora de gasolina da auto peças',
    briefMarkdown:
      'O Seu Expedito manda o motoboy para tudo que é canto e não faz ideia de quanto gasta. Ele quer uma ' +
      'função que calcule a gasolina de cada entrega.',
    client: {
      name: 'Auto Peças Parafuso Solto',
      contact: 'Seu Expedito',
      place: 'client-office',
      area: "Jardim D'Abril, Osasco",
    },
    seniority: 'estagiario',
    pay: 45,
    slaMinutes: 40,
    taskExerciseIds: ['core.m05.e01'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou show! Agora faz ele dizer quanto sobra de lucro depois da gasolina? É rapidinho, já tem ' +
          'até um código aí que o meu sobrinho começou.',
        extraExerciseId: 'core.m05.d01',
        extraPay: 0,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: [
        'Chegou! Pode sentar no banquinho, só cuidado com a mola.',
        'O computador é aquele ali, embaixo do pneu.',
      ],
      delivery: ['Beleza, garoto. Te pago em dinheiro ou em parafuso?'],
    },
  },
  {
    id: 'core.m05.j02',
    moduleId: 'core.m05',
    title: 'Poupança do forno novo',
    briefMarkdown:
      'O Seu Zé quer saber em quantos dias junta o dinheiro do forno novo e conferir as contas da ' +
      'promoção "cada dia um real a mais".',
    client: {
      name: 'Padaria Pão de Ontem',
      contact: 'Seu Zé',
      place: 'client-office',
      area: 'Centro, Osasco',
    },
    seniority: 'estagiario',
    pay: 60,
    slaMinutes: 60,
    taskExerciseIds: ['core.m05.e03', 'core.m05.d03'],
    chat: {
      arrival: ['Bom dia, filho! O wi-fi é "paodeontem123". O pão de queijo é de ontem, mas tá bom.'],
      delivery: ['Opa, então em 4 dias tem forno novo! Leva um sonho pra viagem.'],
    },
  },
  {
    id: 'core.m05.j03',
    moduleId: 'core.m05',
    title: 'Kanban da agência',
    briefMarkdown:
      'A Agência Pixel Torto organiza as tasks dos clientes numa lista que vive cheia de repetidas. A Bia ' +
      'quer um kanban que não aceite task duplicada e que mostre a lista do dia certinho.',
    client: {
      name: 'Agência Pixel Torto',
      contact: 'Bia',
      place: 'coworking',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'estagiario',
    pay: 80,
    slaMinutes: 70,
    taskExerciseIds: ['core.m05.e05', 'core.m05.e04'],
    twists: [
      {
        afterTask: 1,
        message:
          'Perfeito!! Ah, a tela da fila mostra "undefined" no lugar do último cliente. Olha rapidinho? ' +
          'Te pago um café.',
        extraExerciseId: 'core.m05.d04',
        extraPay: 5,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: ['Oi! Senta na mesa do puff, a cadeira boa é do diretor de arte.'],
      delivery: ['Amei! Vou postar um print com a legenda "inovação". Te marco!'],
    },
  },
  {
    id: 'core.m05.j04',
    moduleId: 'core.m05',
    title: 'Painel da cooperativa de freelas',
    briefMarkdown:
      'A Cooperativa Freela Unido quer um painel com o total do dia e a lista dos jobs que pelo menos ' +
      'pagam a gasolina. Ironia: eles mesmos estão te pagando pouco.',
    client: {
      name: 'Cooperativa Freela Unido',
      contact: 'Marcão',
      place: 'coworking',
      area: 'Km 18, Osasco',
    },
    seniority: 'estagiario',
    pay: 110,
    slaMinutes: 90,
    taskExerciseIds: ['core.m05.e06', 'core.m05.e07'],
    twists: [
      {
        afterTask: 1,
        message:
          'Show! Só mais uma coisinha: a busca de job por cliente tá voltando undefined. É rapidinho, é ' +
          'uma linha só (eu acho).',
        extraExerciseId: 'core.m05.d05',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: ['E aí, colega! A gente paga em visibilidade.', 'Brincadeira, tem pix também. E café coado.'],
      delivery: ['Ficou top! O pix cai em até 30 dias úteis. Ou 60.'],
    },
  },
];

const contentModule: ContentModule = {
  id: 'core.m05',
  track: 'core',
  order: 5,
  seniority: 'estagiario',
  title: 'JavaScript: funções, laços e listas',
  summary:
    'Funções e arrow functions, parâmetros padrão e escopo, laços (for, while, for...of), arrays e seus ' +
    'métodos (map, filter, reduce, find) e objetos simples: o kit para somar os jobs do dia sem calculadora.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default contentModule;
