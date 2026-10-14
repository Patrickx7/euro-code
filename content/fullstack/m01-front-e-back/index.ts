import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-caminho-requisicao';
import * as l02 from './l02-tipos-compartilhados';
import * as l03 from './l03-erros-ponta-a-ponta';
import * as l04 from './l04-autenticacao-cors';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'fullstack.m01.j01',
    moduleId: 'fullstack.m01',
    title: 'Pedido de marmita do formulário à cozinha',
    briefMarkdown:
      'A Marmitaria Panela Cheia tem um back-end pronto (feito por um freela que sumiu) e um site que não ' +
      'conversa com ele. Ligue o **formulário** à **API** seguindo o contrato. O motoboy também reclama que a ' +
      'lista de entregas "não carrega nunca".',
    client: {
      name: 'Marmitaria Panela Cheia',
      contact: 'Dona Lurdes',
      place: 'client-office',
      area: 'Centro, Carapicuíba',
    },
    seniority: 'senior',
    pay: 220,
    slaMinutes: 150,
    taskExerciseIds: ['fullstack.m01.e02'],
    twists: [
      {
        afterTask: 0,
        message:
          'Os pedidos estão chegando! Agora o Kleber, do delivery, diz que a página de entregas dele fica em branco. ' +
          'Ele jura que é culpa da "API nova". Dá uma olhada?',
        extraExerciseId: 'fullstack.m01.d01',
        extraPay: 40,
        extraSlaMinutes: 30,
      },
    ],
    chat: {
      arrival: [
        'Entra, entra! Cuidado que o chão tá molhado, acabei de lavar as panelas.',
        'O moço de antes falou que o back "tá 100%". O site também tá 100%. Juntos, dá zero.',
      ],
      delivery: ['Pedido entrando direto na cozinha! Leva uma marmita de feijoada pra estrada, filho.'],
    },
  },
  {
    id: 'fullstack.m01.j02',
    moduleId: 'fullstack.m01',
    title: 'Contrato da oficina',
    briefMarkdown:
      'O Auto Center Rebimboca vai ganhar um painel web novo, e o dono quer que "o site e o sistema falem a ' +
      'mesma língua". Escreva o **contrato.ts** que o front e o back vão compartilhar e conserte a rota de ' +
      'orçamentos, que manda tudo com o nome errado.',
    client: {
      name: 'Auto Center Rebimboca',
      contact: 'Seu Nivaldo',
      place: 'client-office',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'senior',
    pay: 260,
    slaMinutes: 170,
    taskExerciseIds: ['fullstack.m01.e03', 'fullstack.m01.d02'],
    twists: [
      {
        afterTask: 1,
        message:
          'Ficou top! Ah, meu cunhado tem uma transportadora aqui do lado e precisa de uma "v2" na API dele sem ' +
          'quebrar o app dos motoristas. Falei que você resolve rapidinho. De graça, né? É família.',
        extraExerciseId: 'fullstack.m01.e01',
        extraPay: 0,
        extraSlaMinutes: 25,
      },
    ],
    chat: {
      arrival: [
        'Fala, chefe! Estaciona ali do lado do elevador, que o carro do cliente não sai de lá desde 2019.',
        'O painel antigo mostra "undefined - R$ NaN" em todo orçamento. Achei que era código de peça.',
      ],
      delivery: ['Agora o painel mostra o nome do cliente certinho! Quer que eu dê uma olhada no seu óleo?'],
    },
  },
  {
    id: 'fullstack.m01.j03',
    moduleId: 'fullstack.m01',
    title: 'Matrícula sem mistério na autoescola',
    briefMarkdown:
      'Na Autoescola Baliza Perfeita, o formulário de matrícula responde "Algo deu errado" para tudo: idade, ' +
      'e-mail repetido, nome vazio. Faça o **back** dizer o que está errado em cada campo e o **front** mostrar ' +
      'cada erro no lugar certo.',
    client: {
      name: 'Autoescola Baliza Perfeita',
      contact: 'Instrutora Sandra',
      place: 'client-office',
      area: 'Jardim Belval, Barueri',
    },
    seniority: 'senior',
    pay: 300,
    slaMinutes: 190,
    taskExerciseIds: ['fullstack.m01.e05', 'fullstack.m01.e06'],
    twists: [
      {
        afterTask: 1,
        message:
          'Maravilha! Só mais uma: a tela de agendar aula prática diz que o servidor caiu toda vez que alguém ' +
          'escolhe 7 da manhã. Os alunos já estão rezando pelo servidor.',
        extraExerciseId: 'fullstack.m01.d03',
        extraPay: 50,
        extraSlaMinutes: 30,
      },
    ],
    chat: {
      arrival: [
        'Bom dia! Pode estacionar na vaga de baliza, se conseguir. Ninguém consegue.',
        'Um aluno preencheu a idade como "dezoito" e o sistema respondeu "Algo deu errado". Errado tá ele, né?',
      ],
      delivery: ['Agora o site fala igual a mim: firme, mas educado. Passou de primeira!'],
    },
  },
  {
    id: 'fullstack.m01.j04',
    moduleId: 'fullstack.m01',
    title: 'Crachá no painel da lavanderia',
    briefMarkdown:
      'O painel da Lavanderia Bolha de Sabão mostra o faturamento para qualquer um que descobre o endereço, e o ' +
      'perfil do cliente devolve até o hash da senha. Coloque **autenticação** no back, faça o **front** mandar o ' +
      'token e tratar 401 e 403, e tape o vazamento.',
    client: {
      name: 'Lavanderia Bolha de Sabão',
      contact: 'Dona Ana',
      place: 'client-office',
      area: 'Alphaville, Barueri',
    },
    seniority: 'senior',
    pay: 380,
    slaMinutes: 230,
    taskExerciseIds: ['fullstack.m01.e08', 'fullstack.m01.e09', 'fullstack.m01.d04'],
    chat: {
      arrival: [
        'Oi! Fica à vontade, só não senta na pilha de toalhas que é do hotel.',
        'O Beto, do balcão, viu o faturamento e pediu aumento. Preciso disso fechado pra ontem.',
      ],
      delivery: [
        'Agora só eu vejo o faturamento! O Beto ficou triste, mas as toalhas estão cheirosas. Valeu!',
      ],
    },
  },
];

const frontEBackModule: ContentModule = {
  id: 'fullstack.m01',
  track: 'fullstack',
  order: 1,
  seniority: 'senior',
  title: 'Front e back conversando',
  summary:
    'O caminho completo de uma requisição (formulário, fetch, rota, validação, resposta e tela), contratos de ' +
    'API e versionamento, tipos compartilhados em TypeScript com DTOs, erros de ponta a ponta com loading e ' +
    'retry, e autenticação simples com token, 401/403, hash de senha e CORS.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default frontEBackModule;
