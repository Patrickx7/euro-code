import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-formularios-html';
import * as l02 from './l02-validacao-nativa';
import * as l03 from './l03-validacao-js';
import * as l04 from './l04-mascaras-ux';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'front.m02.j01',
    moduleId: 'front.m02',
    title: 'Orçamento online da marmoraria',
    briefMarkdown:
      'A **Marmoraria Pedra Lascada** recebe pedidos de orçamento sem nome, sem telefone e "com a data escrita amanhã". O Seu Valdir quer um formulário decente. E, como ele também é sócio da **Vapt-Vupt Entregas**, quer arrumar o cadastro de entregadores, que aceita idade "-3".',
    client: {
      name: 'Marmoraria Pedra Lascada',
      contact: 'Seu Valdir',
      place: 'client-office',
      area: 'Jardim da Glória, Cotia',
    },
    seniority: 'junior',
    path: 'front',
    pay: 110,
    slaMinutes: 80,
    taskExerciseIds: ['front.m02.e01', 'front.m02.e03'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou bonito! Ah, meu cunhado tem uma barbearia e o agendamento dele perde o WhatsApp dos clientes. Dá uma olhadinha? É rapidinho, ele paga em corte.',
        extraExerciseId: 'front.m02.d01',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chega mais! Cuidado com o pó, aqui tudo é granito.',
        'Pedido bom é pedido com telefone. O último veio só com "pia bonita".',
      ],
      delivery: ['Agora sim, tudo com nome e telefone! Se precisar de uma soleira, faço preço de amigo.'],
    },
  },
  {
    id: 'front.m02.j02',
    moduleId: 'front.m02',
    title: 'Cadastro e contato com validação',
    briefMarkdown:
      'A **Academia Supino Torto** vai abrir matrícula online e quer validar tudo "antes de chegar no sistema", que é uma planilha. De quebra, o formulário de contato da imobiliária vizinha também precisa de um trato.',
    client: {
      name: 'Academia Supino Torto',
      contact: 'Professor Breno',
      place: 'client-office',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'junior',
    path: 'front',
    pay: 160,
    slaMinutes: 110,
    taskExerciseIds: ['front.m02.e06', 'front.m02.e05'],
    twists: [
      {
        afterTask: 1,
        message:
          'Monstro! Meu primo do Auto Center Bigode tá com um formulário que não agenda nunca. Te pago um açaí extra se arrumar agora.',
        extraExerciseId: 'front.m02.d03',
        extraPay: 30,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'Fala, campeão! Já tomou o pré-treino? Aqui a gente codifica no foco.',
        'Senha com menos de 8 caracteres é igual treino de 5 minutos: não conta.',
      ],
      delivery: ['Validou tudo! Agora só falta o pessoal vir treinar. Primeira semana é por minha conta.'],
    },
  },
  {
    id: 'front.m02.j03',
    moduleId: 'front.m02',
    title: 'Pedido de marmita com máscara',
    briefMarkdown:
      'A Vó Nena, da **Tempero da Vó Nena**, quer o pedido online "igual no app de comida": dados organizados para o sistema do neto, telefone formatado, CEP com tracinho e botão que só acende quando está tudo certo.',
    client: {
      name: 'Tempero da Vó Nena',
      contact: 'Vó Nena',
      place: 'home',
      area: 'Jardim D’Abril, Osasco',
    },
    seniority: 'junior',
    path: 'front',
    pay: 180,
    slaMinutes: 130,
    taskExerciseIds: ['front.m02.e02', 'front.m02.e07', 'front.m02.e08'],
    twists: [
      {
        afterTask: 1,
        message:
          'Meu filho, aquele seu app de cobrança me mandou uma conta de "R$ NaN". Isso é imposto novo? Não pago NaN reais, não! Arruma isso antes de terminar.',
        extraExerciseId: 'front.m02.d04',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Entra, entra! Senta que eu vou esquentar uma marmita pra você.',
        'O povo escreve o telefone de todo jeito. Tem um que manda "liga no fixo". Que fixo, criatura?',
      ],
      delivery: ['Que coisa mais linda, o botão acende! Leva duas marmitas, uma é de strogonoff.'],
    },
  },
  {
    id: 'front.m02.j04',
    moduleId: 'front.m02',
    title: 'Encomendas da doceria',
    briefMarkdown:
      'A **Doceria Glacê Torto** quer receber encomendas pelo site com mensagens de erro "carinhosas", nada daquele balãozinho seco do navegador.',
    client: {
      name: 'Doceria Glacê Torto',
      contact: 'Dona Neide',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'junior',
    path: 'front',
    pay: 80,
    slaMinutes: 60,
    taskExerciseIds: ['front.m02.e04'],
    twists: [
      {
        afterTask: 0,
        message:
          'Amei! Ah, a doceria patrocina a Corrida da Granja 5K e o formulário de inscrição confirma até inscrição vazia. Já temos 190 corredores sem nome. Dá um jeito? Pago em bolo e em dinheiro.',
        extraExerciseId: 'front.m02.d02',
        extraPay: 25,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Bem-vindo! Prova esse brigadeiro, é teste de receita nova.',
        'Aquele balãozinho do navegador é muito grosso. Quero mensagem educada, com "por favor" se der.',
      ],
      delivery: ['Perfeito! Agora até o erro é fofo. Leva um bolo de pote pro caminho.'],
    },
  },
];

const frontM02: ContentModule = {
  id: 'front.m02',
  track: 'front',
  order: 2,
  seniority: 'junior',
  title: 'Formulários e validação',
  summary:
    'Formulários que todo cliente pede: HTML com label e tipos certos, validação nativa do navegador, validação com JS no envio e máscaras que deixam telefone, CEP e dinheiro bonitos enquanto a pessoa digita.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default frontM02;
