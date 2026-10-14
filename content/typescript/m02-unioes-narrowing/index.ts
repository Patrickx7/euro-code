import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-interfaces';
import * as l02 from './l02-unioes-narrowing';
import * as l03 from './l03-unioes-discriminadas';
import * as l04 from './l04-type-guards';
import * as l05 from './l05-classes';

const parts = [l01, l02, l03, l04, l05];

const jobs: JobTemplate[] = [
  {
    id: 'typescript.m02.j01',
    moduleId: 'typescript.m02',
    title: 'Sistema de orçamentos da gráfica',
    briefMarkdown:
      'A Gráfica Impressão Borrada calcula orçamento numa planilha que "só o Valdir entende". Monte as ' +
      'cobranças em TypeScript: um contrato `Cobranca` com classes por hora e preço fechado, e depois um ' +
      'molde abstrato de serviço para o sistema novo.',
    client: {
      name: 'Gráfica Impressão Borrada',
      contact: 'Seu Valdir',
      place: 'client-office',
      area: 'Centro, Osasco',
    },
    seniority: 'pleno',
    pay: 160,
    slaMinutes: 110,
    taskExerciseIds: ['typescript.m02.e02', 'typescript.m02.e10'],
    twists: [
      {
        afterTask: 1,
        message:
          'Ficou ótimo! Só que o meu sobrinho mexeu no orçamento pela tela e deu desconto de 100% pra ele ' +
          'mesmo. Dá pra trancar isso? É coisa rápida.',
        extraExerciseId: 'typescript.m02.d05',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Entra, entra! Cuidado que a impressora puxa gravata.',
        'A planilha tem 47 abas. Ninguém sabe o que a aba "NÃO MEXER (2)" faz.',
      ],
      delivery: ['Orçamento que fecha a conta sozinho! A planilha pode descansar em paz. Pix enviado.'],
    },
  },
  {
    id: 'typescript.m02.j02',
    moduleId: 'typescript.m02',
    title: 'Status dos pedidos da marmitaria',
    briefMarkdown:
      'O painel da Marmitaria Panela Cheia aceita qualquer texto como status e já apareceu pedido ' +
      '"quase saindo". Feche os status numa união de literais e conserte o prazo das entregas "pra hoje", ' +
      'que estão sumindo do painel.',
    client: {
      name: 'Marmitaria Panela Cheia',
      contact: 'Dona Neide',
      place: 'client-office',
      area: 'Rochdale, Osasco',
    },
    seniority: 'pleno',
    pay: 120,
    slaMinutes: 75,
    taskExerciseIds: ['typescript.m02.e03', 'typescript.m02.d02'],
    chat: {
      arrival: [
        'Chegou na hora do almoço, hein? Pega uma marmita e senta ali no banquinho.',
        'O motoboy marcou um pedido como "fui". Fui pra onde, meu filho?',
      ],
      delivery: ['Agora o painel só aceita status de verdade. O motoboy ficou até triste. Pix na conta!'],
    },
  },
  {
    id: 'typescript.m02.j03',
    moduleId: 'typescript.m02',
    title: 'Checkout da bicicletaria',
    briefMarkdown:
      'A Bicicletaria Pedal Torto vende online e o checkout aceita "pix parcelado em 12x". Modele o ' +
      'pagamento como **união discriminada**, calcule as taxas e monte as notificações do app com um ' +
      '`switch` exaustivo. O dono jura que não vai inventar nenhuma forma de pagamento nova.',
    client: {
      name: 'Bicicletaria Pedal Torto',
      contact: 'Rafa',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'pleno',
    pay: 220,
    slaMinutes: 140,
    taskExerciseIds: ['typescript.m02.e05', 'typescript.m02.e06'],
    twists: [
      {
        afterTask: 1,
        message:
          'Então... um cliente pediu boleto e eu já coloquei no sistema. Mas o boleto tá saindo sem taxa. ' +
          'Eu sei que falei que não ia inventar nada. Pago um extra!',
        extraExerciseId: 'typescript.m02.d03',
        extraPay: 40,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'E aí! Encosta a bike... ah, você veio de carro. Respeito.',
        'Ontem venderam uma speed em "pix parcelado em 12x". Até agora tô tentando entender.',
      ],
      delivery: ['Pix, cartão, dinheiro e boleto, tudo certinho. Prometo que é a última forma de pagamento.'],
    },
  },
  {
    id: 'typescript.m02.j04',
    moduleId: 'typescript.m02',
    title: 'Integração com a API que manda lixo',
    briefMarkdown:
      'A startup Agiliza Já consome uma API de parceiros que devolve "um JSON criativo": valor como texto, ' +
      'campo faltando, `null` no meio da lista. Escreva os type guards e a leitura segura da resposta, e ' +
      'conserte o guard dos contatos que derruba a tela de clientes.',
    client: {
      name: 'Agiliza Já',
      contact: 'Bruno, o CTO de 23 anos',
      place: 'coworking',
      area: 'Alphaville, Barueri',
    },
    seniority: 'pleno',
    pay: 260,
    slaMinutes: 170,
    taskExerciseIds: ['typescript.m02.e07', 'typescript.m02.e08', 'typescript.m02.d04'],
    chat: {
      arrival: [
        'Fala, dev! Café de graça, kombucha de graça, prazo é que não é de graça.',
        'A API do parceiro é ótima. Quando responde. Do jeito que quer.',
      ],
      delivery: [
        'Zero tela branca em produção hoje! Vou colocar isso no pitch pros investidores. Pix enviado.',
      ],
    },
  },
];

const unionsModule: ContentModule = {
  id: 'typescript.m02',
  track: 'typescript',
  order: 2,
  seniority: 'pleno',
  title: 'Modelando o domínio: interfaces, uniões e narrowing',
  summary:
    'Interfaces, extends, interseção e implements; uniões de literais e narrowing com typeof, in, ' +
    'instanceof e Array.isArray; uniões discriminadas com switch exaustivo e assertNever; type guards ' +
    'para validar JSON de API; e classes com private, readonly, parâmetros de propriedade e abstract.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default unionsModule;
