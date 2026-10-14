import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-objeto-evento';
import * as l02 from './l02-delegacao';
import * as l03 from './l03-estado-render';
import * as l04 from './l04-componentes';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'front.m01.j01',
    moduleId: 'front.m01',
    title: 'Pedidos e chat da pizzaria',
    briefMarkdown:
      'A **Pizzaria Forno Frio** recebe pedidos de buffet para festas pelo site. O Giba quer uma lista para aceitar os pedidos e um chat "pra falar com o cliente sem ficar no telefone".',
    client: {
      name: 'Pizzaria Forno Frio',
      contact: 'Giba',
      place: 'client-office',
      area: 'Centro, Osasco',
    },
    seniority: 'junior',
    path: 'front',
    pay: 120,
    slaMinutes: 90,
    taskExerciseIds: ['front.m01.e03', 'front.m01.e02'],
    twists: [
      {
        afterTask: 1,
        message:
          'Opa, já que você tá aí: no editor do cardápio, o botão de negrito só funciona se clicar no cantinho. É rapidinho, né?',
        extraExerciseId: 'front.m01.d01',
        extraPay: 0,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: [
        'Chegou! Senta aí perto do forno, que é o único lugar quente da pizzaria.',
        'Hoje os pedidos chegam por e-mail, mensagem no celular, recado no guardanapo... quero tudo num lugar só.',
      ],
      delivery: ['Aceitei três festas sem levantar da cadeira! Leva uma brotinho de calabresa, é por conta.'],
    },
  },
  {
    id: 'front.m01.j02',
    moduleId: 'front.m01',
    title: 'Site do haras com abas e FAQ',
    briefMarkdown:
      'O **Haras Galope Manso** quer separar as aulas, os passeios e a hospedagem em abas, e consertar o FAQ, que "abre e não fecha mais, igual porteira velha".',
    client: {
      name: 'Haras Galope Manso',
      contact: 'Dona Lurdes',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'junior',
    path: 'front',
    pay: 150,
    slaMinutes: 100,
    taskExerciseIds: ['front.m01.e07', 'front.m01.d04'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou uma beleza! Agora coloca um botão "Agendar aula" que abre uma janelinha por cima? Daquelas com o fundo escurinho. Pago um extra.',
        extraExerciseId: 'front.m01.e08',
        extraPay: 40,
        extraSlaMinutes: 25,
      },
    ],
    chat: {
      arrival: [
        'Bem-vindo! Pode estacionar do lado do estábulo, só cuidado onde pisa.',
        'O site foi feito pelo meu genro em 2015. Ele mudou pra Portugal e levou a senha junto.',
      ],
      delivery: [
        'Abre, fecha, abre, fecha... que maravilha! Volta no fim de semana pra dar uma volta no Trovão.',
      ],
    },
  },
  {
    id: 'front.m01.j03',
    moduleId: 'front.m01',
    title: 'Painel de jobs do coworking',
    briefMarkdown:
      'O **Coworking Cafeína Infinita** divulga jobs para os membros freelas. A Bruna quer um painel com filtro por cidade, uma lista de tasks e o histórico de orçamentos, que hoje "duplica sozinho".',
    client: {
      name: 'Coworking Cafeína Infinita',
      contact: 'Bruna (operações)',
      place: 'coworking',
      area: 'Alphaville, Barueri',
    },
    seniority: 'junior',
    path: 'front',
    pay: 200,
    slaMinutes: 140,
    taskExerciseIds: ['front.m01.e06', 'front.m01.e05', 'front.m01.d03'],
    chat: {
      arrival: [
        'Oi! Pega um crachá de visitante e um café. O café é infinito, o wi-fi nem tanto.',
        'O painel atual é uma planilha impressa colada na geladeira. A gente quer evoluir.',
      ],
      delivery: [
        'Filtrou por Cotia e apareceu só Cotia! Vou mandar no grupo dos membros. Te pago dia 10, sem falta (provavelmente).',
      ],
    },
  },
  {
    id: 'front.m01.j04',
    moduleId: 'front.m01',
    title: 'Encomendas da doceria',
    briefMarkdown:
      'A **Doceria Açúcar Mascavo** quer que os clientes deem estrelas para os doces e escrevam uma descrição curta da encomenda, com contador de caracteres "pra ninguém mandar testamento".',
    client: {
      name: 'Doceria Açúcar Mascavo',
      contact: 'Cris',
      place: 'home',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'junior',
    path: 'front',
    pay: 90,
    slaMinutes: 60,
    taskExerciseIds: ['front.m01.e04', 'front.m01.e01'],
    twists: [
      {
        afterTask: 1,
        message:
          'Ah, e a página de montar o kit festa está somando estranho: deu R$ 0300150 num pedido. Olha isso pra mim?',
        extraExerciseId: 'front.m01.d02',
        extraPay: 25,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Entra, entra! Não repara a bagunça, é semana de Páscoa.',
        'Prova esse brigadeiro enquanto o notebook liga. Ele demora uns cinco minutinhos.',
      ],
      delivery: ['Cinco estrelas pra você! Literalmente, acabei de testar no site.'],
    },
  },
];

const frontM01: ContentModule = {
  id: 'front.m01',
  track: 'front',
  order: 1,
  seniority: 'junior',
  title: 'DOM de verdade: eventos e componentes',
  summary:
    'O objeto do evento, delegação com dataset, estado com render() e os componentes de todo site de cliente: abas, modal e acordeão, com hidden e ARIA.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default frontM01;
