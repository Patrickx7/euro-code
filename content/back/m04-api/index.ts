import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-http';
import * as l02 from './l02-rotas';
import * as l03 from './l03-validacao';
import * as l04 from './l04-erros-middleware';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'back.m04.j01',
    moduleId: 'back.m04',
    title: 'API de delivery da pastelaria',
    briefMarkdown:
      'A Pastelaria Massa Fina cansou de anotar pedido de WhatsApp em guardanapo. O sobrinho do dono vai fazer ' +
      'o app; você faz a **API**: listar, criar, buscar e apagar pedidos. O sobrinho já avisou que "o app tá ' +
      '90% pronto", o que significa que ele ainda não começou.',
    client: {
      name: 'Pastelaria Massa Fina',
      contact: 'Seu Tadashi',
      place: 'client-office',
      area: 'Km 18, Osasco',
    },
    seniority: 'junior',
    path: 'back',
    pay: 160,
    slaMinutes: 120,
    taskExerciseIds: ['back.m04.e01', 'back.m04.e03'],
    twists: [
      {
        afterTask: 1,
        message:
          'Ficou show! Só mais um endpoint: o motoboy quer filtrar os pedidos por bairro. E o freela de antes ' +
          'deixou a busca por id quebrada, aproveita e dá uma olhada? É rapidinho.',
        extraExerciseId: 'back.m04.d02',
        extraPay: 20,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'Senta aí no banquinho. Pastel de carne ou de queijo pra começar o trabalho?',
        'O sobrinho falou que precisa de "uma API REST". Eu só quero que o pedido não suma.',
      ],
      delivery: ['Pedido entrando sozinho no sistema! Pix caindo, e tem caldo de cana por conta da casa.'],
    },
  },
  {
    id: 'back.m04.j02',
    moduleId: 'back.m04',
    title: 'Validação no app de fretes',
    briefMarkdown:
      'A Leva-e-Traz Fretes recebe pedidos com quantidade "três", bairro em branco e um cliente que jura que o ' +
      'frete custa R$ 0,01. Você precisa **validar** tudo que chega na API antes de salvar.',
    client: {
      name: 'Leva-e-Traz Fretes',
      contact: 'Seu Arnaldo',
      place: 'client-office',
      area: 'Centro, Carapicuíba',
    },
    seniority: 'junior',
    path: 'back',
    pay: 140,
    slaMinutes: 100,
    taskExerciseIds: ['back.m04.e04', 'back.m04.e05'],
    twists: [
      {
        afterTask: 1,
        message:
          'Opa, o contador achou um frete de 40 caixas que saiu por quarenta centavos. Isso é coisa do sistema ' +
          'ou do meu primo? Vê aí rapidinho, sem custo, né? Somos parceiros.',
        extraExerciseId: 'back.m04.d03',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chegou! Estaciona atrás do caminhão-baú, que esse aí não sai daqui hoje.',
        'Meu primo disse que "o app já valida". O app é ele olhando o celular.',
      ],
      delivery: ['Agora o sistema reclama antes de aceitar besteira. Igual à minha sogra. Valeu!'],
    },
  },
  {
    id: 'back.m04.j03',
    moduleId: 'back.m04',
    title: 'Porteiro e airbag na API da academia',
    briefMarkdown:
      'A Academia Supino Reto tem uma API de check-in que qualquer um acessa sem senha, e que, quando quebra, ' +
      'mostra o erro inteiro na tela do aluno. Coloque um **middleware de token** e um **tratamento de erros** ' +
      'decente antes que alguém faça check-in pelo vizinho.',
    client: {
      name: 'Academia Supino Reto',
      contact: 'Professor Juca',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'junior',
    path: 'back',
    pay: 180,
    slaMinutes: 120,
    taskExerciseIds: ['back.m04.e06', 'back.m04.e07'],
    chat: {
      arrival: [
        'Bem-vindo! Se quiser, aproveita e faz uma série de agachamento entre um commit e outro.',
        'Ontem a tela do check-in mostrou uma tal de "stack". Achei que era exercício novo.',
      ],
      delivery: ['Agora só entra quem tem token! Igual a catraca. Toma um shake de whey de brinde.'],
    },
  },
  {
    id: 'back.m04.j04',
    moduleId: 'back.m04',
    title: 'Hamburgueria com API fofoqueira',
    briefMarkdown:
      'A Hamburgueria Pão & Prensa contratou um sistema barato que responde "sucesso" para tudo, trava no log ' +
      'e conta a senha do banco para quem pedir o relatório. Arrume a casa e ensine o roteador a ler o id do ' +
      'pedido direito.',
    client: {
      name: 'Hamburgueria Pão & Prensa',
      contact: 'Dona Rose',
      place: 'client-office',
      area: 'Alphaville, Barueri',
    },
    seniority: 'junior',
    path: 'back',
    pay: 210,
    slaMinutes: 150,
    taskExerciseIds: ['back.m04.d01', 'back.m04.e02', 'back.m04.d04'],
    chat: {
      arrival: [
        'Oi, querido! O sistema diz "Sucesso!" até quando o lanche não existe. Simpático, mas mentiroso.',
        'O moço que fez sumiu. Deixou um bilhete escrito "não mexe no middleware".',
      ],
      delivery: ['Agora o sistema só fala o que deve. Leva um smash de bacon pra estrada!'],
    },
  },
];

const apiModule: ContentModule = {
  id: 'back.m04',
  track: 'back',
  order: 4,
  seniority: 'junior',
  title: 'APIs: rotas, validação e erros',
  summary:
    'Como funciona o HTTP (métodos, status e JSON), roteador com parâmetros e query string, CRUD em memória, ' +
    'validação que não confia no cliente, tratamento de erros sem vazar detalhes e middlewares de log e token.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default apiModule;
