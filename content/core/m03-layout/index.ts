import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-centralizar';
import * as l02 from './l02-flex-linhas';
import * as l03 from './l03-grid';
import * as l04 from './l04-responsivo';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'core.m03.j01',
    moduleId: 'core.m03',
    title: 'Centralizar a div da pousada',
    briefMarkdown:
      'A Pousada Recanto do Wi-Fi Fraco, lá em Caucaia do Alto, quer o banner da promoção **bem no meio da tela**. ' +
      'São 38 km de estrada para centralizar uma div. O pagamento cobre a gasolina, se você não ligar o ar.',
    client: {
      name: 'Pousada Recanto do Wi-Fi Fraco',
      contact: 'Dona Cida',
      place: 'client-office',
      area: 'Caucaia do Alto, Cotia',
    },
    seniority: 'estagiario',
    pay: 30,
    slaMinutes: 40,
    taskExerciseIds: ['core.m03.e01'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou lindo! Já que você tá aqui, centraliza também a plaquinha de "ABERTO"? O meu sobrinho começou mas não terminou. É rapidinho.',
        extraExerciseId: 'core.m03.d01',
        extraPay: 0,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: [
        'Chegou! Achou fácil? Aqui o GPS desiste no último quilômetro.',
        'O wi-fi pega melhor perto da galinha. Não pergunta.',
      ],
      delivery: ['No meio certinho! Toma, e leva um pote de doce de leite pra estrada.'],
    },
  },
  {
    id: 'core.m03.j02',
    moduleId: 'core.m03',
    title: 'Menu e vitrine da auto peças',
    briefMarkdown:
      'A Auto Peças Parafuso Solto quer o menu do site numa linha só e a vitrine da imobiliária do cunhado, que divide o mesmo site (não pergunte), ' +
      'com os cards quebrando linha direito.',
    client: {
      name: 'Auto Peças Parafuso Solto',
      contact: 'Seu Valdir',
      place: 'client-office',
      area: 'Presidente Altino, Osasco',
    },
    seniority: 'estagiario',
    pay: 60,
    slaMinutes: 75,
    taskExerciseIds: ['core.m03.e02', 'core.m03.d02'],
    chat: {
      arrival: ['Senta aí do lado da caixa de câmbio. O site é igual parafuso: tem que ficar tudo alinhado.'],
      delivery: ['Agora sim, parece site de gente grande! Pix tá caindo, confere aí.'],
    },
  },
  {
    id: 'core.m03.j03',
    moduleId: 'core.m03',
    title: 'Cardápio em grade da pastelaria',
    briefMarkdown:
      'A Pastelaria Pastel de Vento quer o cardápio em **3 colunas** no site. O pagamento é em dinheiro e, segundo o dono, "em pastel também, se quiser".',
    client: {
      name: 'Pastelaria Pastel de Vento',
      contact: 'Seu Hideo',
      place: 'client-office',
      area: 'Km 18, Osasco',
    },
    seniority: 'estagiario',
    pay: 45,
    slaMinutes: 50,
    taskExerciseIds: ['core.m03.e03'],
    twists: [
      {
        afterTask: 0,
        message:
          'Opa, aproveitando: o painel de pedidos lá de trás ficou com o menu esticado na tela toda. Dá uma olhada? É coisinha.',
        extraExerciseId: 'core.m03.d03',
        extraPay: 10,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: ['Chegou na hora do movimento! Fica naquela mesa do canto, longe do óleo.'],
      delivery: ['Ficou bonito igual pastel bem fechado. Toma o seu e um caldo de cana por conta da casa.'],
    },
  },
  {
    id: 'core.m03.j04',
    moduleId: 'core.m03',
    title: 'Site da autoescola no celular',
    briefMarkdown:
      'A Autoescola Baliza Perfeita reclama que o site "quebra no celular". Conserte o menu e deixe os planos lado a lado nas telas grandes, ' +
      'mas empilhados no celular. Mobile first, como manda o figurino.',
    client: {
      name: 'Autoescola Baliza Perfeita',
      contact: 'Instrutor Gérson',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'estagiario',
    pay: 90,
    slaMinutes: 90,
    taskExerciseIds: ['core.m03.d04', 'core.m03.e04'],
    twists: [
      {
        afterTask: 1,
        message:
          'Perfeito! Só uma última coisa: a promoção do Dia dos Pais tem que ficar no meio da tela, bem centralizada. É rapidinho, né?',
        extraExerciseId: 'core.m03.e01',
        extraPay: 5,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: [
        'Estacionou de primeira? Aqui a gente repara.',
        'Meus alunos olham tudo no celular, entre uma aula e outra. No meu computador tá perfeito!',
      ],
      delivery: ['Abri no celular e ficou certinho! Se quiser, faço desconto na aula de baliza.'],
    },
  },
];

const layoutModule: ContentModule = {
  id: 'core.m03',
  track: 'core',
  order: 3,
  seniority: 'estagiario',
  title: 'Layout com CSS',
  summary:
    'Flexbox para centralizar (sim, a div) e montar menus e cards, grid para cardápios e painéis, e media queries mobile first para o site não quebrar no celular do cliente.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default layoutModule;
