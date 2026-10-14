import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-assincrono';
import * as l02 from './l02-promises';
import * as l03 from './l03-async-await';
import * as l04 from './l04-fetch-json';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'front.m04.j01',
    moduleId: 'front.m04',
    title: 'Cardápio online da lanchonete',
    briefMarkdown:
      'A **Lanchonete Bom Bocado** finalmente tem uma API (o sobrinho do dono fez num fim de semana). O Seu Jair quer o cardápio do site vindo de lá e o total do pedido calculado "sem o cliente ficar esperando".',
    client: {
      name: 'Lanchonete Bom Bocado',
      contact: 'Seu Jair',
      place: 'client-office',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'junior',
    path: 'front',
    pay: 160,
    slaMinutes: 110,
    taskExerciseIds: ['front.m04.e04', 'front.m04.e07'],
    twists: [
      {
        afterTask: 1,
        message:
          'Ficou top! Ó, meu cunhado do mercadinho aqui do lado tem um site do fiado que mostra "R$ [object Promise]". Dá uma olhadinha? É rapidinho, ele te paga em coxinha.',
        extraExerciseId: 'front.m04.d03',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chegou na hora do almoço, hein! Senta aí no balcão.',
        'A API às vezes cai quando liga a fritadeira. Não sei se tem a ver.',
      ],
      delivery: [
        'Atualizei o preço do X-Salada na API e mudou no site sozinho! Isso é inteligência artificial?',
      ],
    },
  },
  {
    id: 'front.m04.j02',
    moduleId: 'front.m04',
    title: 'Orçamento pelo site da funilaria',
    briefMarkdown:
      'A **Funilaria Amassadinho** quer parar de receber orçamento por foto borrada no zap. O Seu Valdir precisa do formulário enviando para a API e do resumo do pedido, que hoje mostra "R$ undefined".',
    client: {
      name: 'Funilaria Amassadinho',
      contact: 'Seu Valdir',
      place: 'client-office',
      area: 'Vila Dirce, Carapicuíba',
    },
    seniority: 'junior',
    path: 'front',
    pay: 180,
    slaMinutes: 120,
    taskExerciseIds: ['front.m04.d02', 'front.m04.e08'],
    chat: {
      arrival: [
        'Opa, chega mais! Cuidado com a tinta fresca no capô ali.',
        'O Marcão já ligou três vezes perguntando do orçamento do parachoque.',
      ],
      delivery: [
        'Chegou o orçamento #42 aqui no sistema! Quer que eu dê uma polida no seu retrovisor? Por conta da casa.',
      ],
    },
  },
  {
    id: 'front.m04.j03',
    moduleId: 'front.m04',
    title: 'Agenda do salão que não fica em branco',
    briefMarkdown:
      'A Kelly, do **Studio Franja Reta**, diz que a agenda online "some do nada" e que as clientes ligam perguntando se o salão fechou. Ela quer um aviso de carregando, uma mensagem quando o servidor cai e um resumo por cliente.',
    client: {
      name: 'Studio Franja Reta',
      contact: 'Kelly',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'junior',
    path: 'front',
    pay: 140,
    slaMinutes: 90,
    taskExerciseIds: ['front.m04.e06', 'front.m04.e05'],
    chat: {
      arrival: [
        'Oi, amor! Pode sentar na cadeira 3, a do secador quebrado.',
        'O servidor fica no armário junto com a chapinha. Quando liga as duas, cai tudo.',
      ],
      delivery: [
        'Agora aparece "Carregando..." em vez de branco! As clientes vão parar de me ligar. Quer fazer uma franja?',
      ],
    },
  },
  {
    id: 'front.m04.j04',
    moduleId: 'front.m04',
    title: 'Ficha dos pets e lembretes da clínica',
    briefMarkdown:
      'A Dra. Paula, da **Clínica Veterinária Rabo Feliz**, quer a ficha do pet funcionando no site (hoje aparece "undefined" no lugar do Thor) e lembretes de vacina para os tutores.',
    client: {
      name: 'Clínica Veterinária Rabo Feliz',
      contact: 'Dra. Paula',
      place: 'client-office',
      area: 'Jardim Belval, Barueri',
    },
    seniority: 'junior',
    path: 'front',
    pay: 120,
    slaMinutes: 80,
    taskExerciseIds: ['front.m04.d04', 'front.m04.e01'],
    twists: [
      {
        afterTask: 0,
        message:
          'Perfeito! Aproveitando que você está aqui: o sistema também precisa achar o tutor pelo número da ficha. Tem que avisar quando não achar, tá? Pago um extra.',
        extraExerciseId: 'front.m04.e02',
        extraPay: 25,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'Bem-vindo! Não liga pro latido, é o Thor pedindo a ficha dele.',
        'O último dev disse que o problema era "assíncrono". Achei que era doença de gato.',
      ],
      delivery: ['A ficha do Thor apareceu! Ele abanou o rabo, então está aprovado.'],
    },
  },
];

const frontM04: ContentModule = {
  id: 'front.m04',
  track: 'front',
  order: 4,
  seniority: 'junior',
  title: 'Dados da internet: Promises, async/await e fetch',
  summary:
    'Por que o código não espera: setTimeout e callbacks, Promises (then, catch, Promise.all), async/await com try/catch, estados de carregando e erro na tela, e fetch para buscar e enviar JSON para APIs.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default frontM04;
