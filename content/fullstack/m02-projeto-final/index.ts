import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-modelagem';
import * as l02 from './l02-regras';
import * as l03 from './l03-modulos';
import * as l04 from './l04-eventos';
import * as l05 from './l05-qualidade';

const parts = [l01, l02, l03, l04, l05];

const jobs: JobTemplate[] = [
  {
    id: 'fullstack.m02.j01',
    moduleId: 'fullstack.m02',
    title: 'Os tipos do app de bicos',
    briefMarkdown:
      'A startup Corre Aí Bicos faz um app que manda freelas para clientes da região. O banco já tem job ' +
      'pedindo senioridade "gerente" e job "entregue" sem estrelas. Você precisa **modelar os tipos** antes que ' +
      'o app mande alguém centralizar uma div em Pirapora.',
    client: {
      name: 'Corre Aí Bicos',
      contact: 'Thaís, a CTO de 23 anos',
      place: 'coworking',
      area: 'Alphaville, Barueri',
    },
    seniority: 'senior',
    pay: 300,
    slaMinutes: 180,
    taskExerciseIds: ['fullstack.m02.e01', 'fullstack.m02.e02'],
    twists: [
      {
        afterTask: 1,
        message:
          'Ficou lindo! Ah, o investidor pediu um status "pausado" pra quando o dev para pra almoçar. Já subi, ' +
          'mas o painel mostra 0 minuto pra todo job pausado. Dá uma olhadinha?',
        extraExerciseId: 'fullstack.m02.d01',
        extraPay: 40,
        extraSlaMinutes: 30,
      },
    ],
    chat: {
      arrival: [
        'Oi! Pega um kombucha e senta no pufe. A gente é ágil: o requisito muda enquanto você lê esta frase.',
        'Nosso backlog tem um card chamado "tipar tudo". Ele está lá desde 2021.',
      ],
      delivery: ['Agora o banco nem aceita "gerente"! Vou postar no LinkedIn que a gente é type-safe.'],
    },
  },
  {
    id: 'fullstack.m02.j02',
    moduleId: 'fullstack.m02',
    title: 'As estrelas da cooperativa',
    briefMarkdown:
      'A Cooperativa Dev Raiz distribui jobs entre os cooperados e paga conforme a senioridade e as estrelas. ' +
      'Hoje o cálculo está numa planilha com 14 abas e uma macro que ninguém entende. Transforme as regras em ' +
      '**funções puras e testáveis** e descubra por que o ranking embaralha o histórico.',
    client: {
      name: 'Cooperativa Dev Raiz',
      contact: 'Seu Wilson',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'senior',
    pay: 280,
    slaMinutes: 200,
    taskExerciseIds: ['fullstack.m02.e03', 'fullstack.m02.e04', 'fullstack.m02.d02'],
    chat: {
      arrival: [
        'Chegou bem? Aqui é tudo cooperativo: o café, o wi-fi e a culpa quando o deploy quebra.',
        'A planilha tem uma célula escrita "NÃO MEXER". Faz três anos que ninguém mexe. Nem sabe o que ela faz.',
      ],
      delivery: ['Agora o pagamento bate com o que a gente combina! Vou aposentar a planilha com honras.'],
    },
  },
  {
    id: 'fullstack.m02.j03',
    moduleId: 'fullstack.m02',
    title: 'Serviço de jobs com notificação',
    briefMarkdown:
      'A Bico Certo tem o app, os tipos e as regras, mas o "back-end" é um arquivo de 3 mil linhas que faz ' +
      'tudo. Separe o **serviço** do **repositório**, injete as dependências e ligue as **notificações** por ' +
      'eventos, para o dev saber que o job foi aceito antes de pegar a Castello.',
    client: {
      name: 'Bico Certo',
      contact: 'Rafa',
      place: 'coworking',
      area: 'Centro, Osasco',
    },
    seniority: 'senior',
    pay: 420,
    slaMinutes: 240,
    taskExerciseIds: ['fullstack.m02.e05', 'fullstack.m02.e07'],
    twists: [
      {
        afterTask: 0,
        message:
          'Show! Trocamos o repositório de memória pelo de arquivo JSON e... os jobs aceitos aparecem duas vezes ' +
          'no painel. Isso é bug ou é feature de "job em dobro"?',
        extraExerciseId: 'fullstack.m02.d03',
        extraPay: 0,
        extraSlaMinutes: 20,
      },
      {
        afterTask: 1,
        message:
          'As notificações estão chegando! Só que agora o badge do painel derruba o app quando alguém aceita um ' +
          'job. É rapidinho, né?',
        extraExerciseId: 'fullstack.m02.d04',
        extraPay: 30,
        extraSlaMinutes: 25,
      },
    ],
    chat: {
      arrival: [
        'E aí! O arquivo principal se chama `tudo-final-v3-agora-vai.ts`. Boa sorte.',
        'Se o celular vibrar sem parar, é a notificação que a gente testou em produção ontem.',
      ],
      delivery: [
        'Serviço separado, repositório trocável e notificação funcionando. Parece até empresa grande!',
      ],
    },
  },
  {
    id: 'fullstack.m02.j04',
    moduleId: 'fullstack.m02',
    title: 'O app que te manda pra estrada',
    briefMarkdown:
      'O estúdio que faz **este jogo** quer reescrever o sistema de jobs. Sim: o mesmo sistema que te mandou ' +
      'centralizar uma div a 38 km de casa. Tipar o barramento de eventos, trocar exceções por `Result` e ' +
      'migrar o cálculo legado de pagamento sem mudar um centavo. Se o Pix vier `NaN`, a culpa é sua.',
    client: {
      name: 'Estúdio Rodoanel Games',
      contact: 'Ju, a tech lead',
      place: 'client-office',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'fullstack',
    pay: 500,
    slaMinutes: 300,
    taskExerciseIds: ['fullstack.m02.e06', 'fullstack.m02.e08', 'fullstack.m02.d05'],
    chat: {
      arrival: [
        'Bem-vindo! Estacionou o caminhão? Foi a gente que programou o freio. Desculpa.',
        'Pode mexer no sistema de jobs, só não aceita nenhum job enquanto mexe. Fica meio filosófico.',
      ],
      delivery: [
        'Tudo verde nos testes! A partir de hoje, cada job que você pegar passa pelo código que você escreveu.',
      ],
    },
  },
];

const projetoFinal: ContentModule = {
  id: 'fullstack.m02',
  track: 'fullstack',
  order: 2,
  seniority: 'senior',
  title: 'Projeto final: o sistema de jobs do próprio jogo',
  summary:
    'Constrói, passo a passo, uma versão simplificada do sistema de jobs deste jogo em TypeScript: modelagem com ' +
    'uniões discriminadas e tipos derivados, regras puras de SLA, estrelas e pagamento, módulos com repositório ' +
    'e injeção de dependência, barramento de eventos tipado, Result e refatoração de código legado.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default projetoFinal;
