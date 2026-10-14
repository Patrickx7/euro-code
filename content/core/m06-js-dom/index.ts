import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-dom';
import * as l02 from './l02-classes';
import * as l03 from './l03-eventos';
import * as l04 from './l04-criar-elementos';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'core.m06.j01',
    moduleId: 'core.m06',
    title: 'Site da padaria com menu de celular',
    briefMarkdown:
      'O site da **Padaria Pão de Ontem** é "muito parado", diz o Seu Zé. Ele quer a promoção em destaque e um menu que abre e fecha no celular.',
    client: {
      name: 'Padaria Pão de Ontem',
      contact: 'Seu Zé',
      place: 'client-office',
      area: 'Centro, Osasco',
    },
    seniority: 'estagiario',
    pay: 90,
    slaMinutes: 70,
    taskExerciseIds: ['core.m06.e03', 'core.m06.e06'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou lindo! Aproveita e coloca os doces do dia numa lista que eu mudo toda manhã? É rapidinho, coisa de 5 minutinhos.',
        extraExerciseId: 'core.m06.e07',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chegou! Senta ali do lado do forno, que o wi-fi pega melhor.',
        'O sobrinho da minha mulher fez o site, mas ele agora só mexe com "cripto".',
      ],
      delivery: ['Abriu e fechou o menu! Parece mágica. Leva um sonho pra viagem, por conta da casa.'],
    },
  },
  {
    id: 'core.m06.j02',
    moduleId: 'core.m06',
    title: 'Agendamento do pet shop',
    briefMarkdown:
      'A Dona Cida, do **Pet Shop Au Au Osasco**, quer a foto do banho e tosa no site, o telefone clicável, o botão de agendar funcionando e um "modo noturno, igual do celular do meu neto".',
    client: {
      name: 'Pet Shop Au Au Osasco',
      contact: 'Dona Cida',
      place: 'client-office',
      area: 'Bela Vista, Osasco',
    },
    seniority: 'estagiario',
    pay: 70,
    slaMinutes: 50,
    taskExerciseIds: ['core.m06.e04', 'core.m06.d02'],
    chat: {
      arrival: [
        'Oi, querido! Cuidado com o Thor, ele não morde. Quer dizer, morde pouco.',
        'Te mandei tudo por áudio, mas resumindo: é foto, telefone, botão e o tal do modo noturno.',
      ],
      delivery: ['Que coisa mais linda! Vou mostrar pro grupo da família. Te pago na sexta, tá?'],
    },
  },
  {
    id: 'core.m06.j03',
    moduleId: 'core.m06',
    title: 'Painel de tasks da agência',
    briefMarkdown:
      'A **Agência Pixel Torto** quer um painel interno: status do cliente, resumo das tasks e um contador de tasks feitas no dia. "Para medir a produtividade", segundo o Thiago do growth.',
    client: {
      name: 'Agência Pixel Torto',
      contact: 'Thiago (growth)',
      place: 'coworking',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'estagiario',
    pay: 130,
    slaMinutes: 100,
    taskExerciseIds: ['core.m06.e01', 'core.m06.e02', 'core.m06.e05'],
    twists: [
      {
        afterTask: 1,
        message:
          'Opa, rapidinho: o botão "Aceitar job" do nosso app está aceitando sozinho. Já aceitou 3 freelas que a gente nem queria. Dá uma olhada?',
        extraExerciseId: 'core.m06.d03',
        extraPay: 20,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: [
        'Bem-vindo à Pixel Torto! Café é livre, cadeira é por ordem de chegada.',
        'A gente é uma agência data-driven. Por isso precisamos do painel: hoje os dados ficam num post-it.',
      ],
      delivery: ['Sensacional. Vou apresentar no daily como se fosse ideia minha. Brincadeira. (Não é.)'],
    },
  },
  {
    id: 'core.m06.j04',
    moduleId: 'core.m06',
    title: 'Orçamento online da auto elétrica',
    briefMarkdown:
      'A **Auto Elétrica Faísca** cansou de fazer orçamento no papel de pão. Quer uma calculadora no site e uma lista para anotar os serviços pedidos.',
    client: {
      name: 'Auto Elétrica Faísca',
      contact: 'Marcão',
      place: 'client-office',
      area: 'Vila Dirce, Carapicuíba',
    },
    seniority: 'estagiario',
    pay: 110,
    slaMinutes: 80,
    taskExerciseIds: ['core.m06.e08', 'core.m06.d04'],
    twists: [
      {
        afterTask: 0,
        message:
          'Show! Ah, tem um orçamento antigo no site que mostra "8020" no total. É rapidinho arrumar, né? Não vou pagar extra que é coisa pequena.',
        extraExerciseId: 'core.m06.d01',
        extraPay: 0,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: [
        'E aí, parceiro! Seu carro tá fazendo um barulho esquisito, viu? Depois a gente vê isso.',
        'O computador é aquele ali, só não encosta no fio azul.',
      ],
      delivery: ['Calculou certinho! Se quiser, dou uma olhada no seu alternador. Cobro baratinho.'],
    },
  },
];

const coreM06: ContentModule = {
  id: 'core.m06',
  track: 'core',
  order: 6,
  seniority: 'estagiario',
  title: 'JavaScript na página (DOM)',
  summary:
    'O JS sai do console e mexe na página: achar elementos, mudar texto, estilo e classes, reagir a cliques, criar listas a partir de arrays e ler formulários.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default coreM06;
