import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-console';
import * as l02 from './l02-variaveis';
import * as l03 from './l03-operadores';
import * as l04 from './l04-comparacao';
import * as l05 from './l05-decisoes';

const parts = [l01, l02, l03, l04, l05];

const jobs: JobTemplate[] = [
  {
    id: 'core.m04.j01',
    moduleId: 'core.m04',
    title: 'O totem da padaria',
    briefMarkdown:
      'O Seu Zé comprou um totem "de última geração" (usado, sem caixa) e quer mensagens de boas-vindas nele. Ele garante que é coisa de cinco minutos.',
    client: {
      name: 'Padaria Pão de Ontem',
      contact: 'Seu Zé',
      place: 'client-office',
      area: 'Centro, Osasco',
    },
    seniority: 'estagiario',
    pay: 35,
    slaMinutes: 40,
    taskExerciseIds: ['core.m04.e01'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou lindo! Ah, e o site de encomendas tá dizendo que 2 centos mais 1 cento dá 21. Dá uma olhadinha? É rapidinho.',
        extraExerciseId: 'core.m04.d03',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chegou, filho! O totem tá ali do lado da máquina de café.',
        'A senha do wi-fi é "paodeontem123". Não conta pra ninguém.',
      ],
      delivery: ['Que beleza! Pagamento no Pix e um pão na chapa por conta da casa.'],
    },
  },
  {
    id: 'core.m04.j02',
    moduleId: 'core.m04',
    title: 'A ficha de serviço da oficina',
    briefMarkdown:
      'A Dona Cida quer uma ficha de serviço no sistema da oficina e descobriu que o sistema libera carro de quem não pagou. Ela quer as duas coisas resolvidas "antes do almoço".',
    client: {
      name: 'Oficina Ronco Bravo',
      contact: 'Dona Cida',
      place: 'client-office',
      area: 'Jardim Piratininga, Osasco',
    },
    seniority: 'estagiario',
    pay: 60,
    slaMinutes: 60,
    taskExerciseIds: ['core.m04.e02', 'core.m04.d04'],
    chat: {
      arrival: [
        'Pode estacionar aí. Esse barulho no seu carro, aliás, é a junta do cabeçote.',
        'O computador fica no escritório, cuidado com a graxa no teclado.',
      ],
      delivery: ['Agora sim, ninguém sai daqui sem pagar. Nem você, se trouxer o carro pra arrumar.'],
    },
  },
  {
    id: 'core.m04.j03',
    moduleId: 'core.m04',
    title: 'Calculadora de orçamento do coworking',
    briefMarkdown:
      'A Thaís administra um coworking e quer mostrar aos freelas que alugam mesa como calcular orçamento e quando o SLA estourou. Ironicamente, o prazo é apertado.',
    client: {
      name: 'Coworking Cadeira Bamba',
      contact: 'Thaís',
      place: 'coworking',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'estagiario',
    pay: 90,
    slaMinutes: 80,
    taskExerciseIds: ['core.m04.e03', 'core.m04.e05'],
    twists: [
      {
        afterTask: 1,
        message: 'Perfeito! Já que você está aqui, coloca também a taxa por bairro? É só um switchzinho.',
        extraExerciseId: 'core.m04.e07',
        extraPay: 15,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Bem-vindo! Escolhe qualquer mesa, menos a cadeira do canto. Ela faz jus ao nome.',
        'O café é liberado. O bom é pago.',
      ],
      delivery: ['Show! Vou divulgar no grupo dos freelas. Pagamento cai em até 30 dias úteis, tá?'],
    },
  },
  {
    id: 'core.m04.j04',
    moduleId: 'core.m04',
    title: 'O caixa do pet shop',
    briefMarkdown:
      'O contador de banhos do pet shop quebra todo dia, e o caixa cobra taxa de quem paga com Pix. O Rogério já levou duas reclamações e uma mordida.',
    client: {
      name: 'Pet Shop Au Au Miau',
      contact: 'Rogério',
      place: 'client-office',
      area: 'Centro, Carapicuíba',
    },
    seniority: 'estagiario',
    pay: 70,
    slaMinutes: 70,
    taskExerciseIds: ['core.m04.d02', 'core.m04.d05'],
    twists: [
      {
        afterTask: 1,
        message:
          'Arrumou o Pix? Show! Agora faz o sistema responder a nota que o cliente dá no app? É rapidinho, prometo.',
        extraExerciseId: 'core.m04.e06',
        extraPay: 0,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: ['Entra rápido que o Thor tá solto! Ele é manso... quase sempre.'],
      delivery: ['Valeu! Toma um cupom de banho grátis. Serve pra cachorro, mas de repente...'],
    },
  },
];

const contentModule: ContentModule = {
  id: 'core.m04',
  track: 'core',
  order: 4,
  seniority: 'estagiario',
  title: 'JavaScript: primeiros passos',
  summary:
    'Do primeiro console.log às primeiras decisões: variáveis, tipos, contas, template strings, comparações, truthy/falsy, if/else e switch, tudo calculando orçamento de freela.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default contentModule;
