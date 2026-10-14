import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-layout-fluido';
import * as l02 from './l02-componentes';
import * as l03 from './l03-acessibilidade';
import * as l04 from './l04-aria-contraste';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'front.m03.j01',
    moduleId: 'front.m03',
    title: 'A confeitaria que vaza do celular',
    briefMarkdown:
      'A Confeitaria Glacê Torto abriu o site no celular e a foto do bolo "saiu pra fora da tela". No computador, tudo grudado na esquerda. ' +
      'Deixe a página fluida, sem largura fixa.',
    client: {
      name: 'Confeitaria Glacê Torto',
      contact: 'Dona Neide',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'junior',
    path: 'front',
    pay: 90,
    slaMinutes: 60,
    taskExerciseIds: ['front.m03.e01'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ai, que lindo! Só que o título agora tá GRITANDO no celular. Meu sobrinho mexeu ontem. É rapidinho, né?',
        extraExerciseId: 'front.m03.d01',
        extraPay: 15,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'Chegou bem na hora do bolo sair do forno. Cuidado que o chão é inclinado, igual os bolos.',
        'Testa no meu celular, que é o que os clientes usam. A tela é rachada, mas funciona.',
      ],
      delivery: ['Agora sim, cabe tudo na tela! Leva uma fatia, a que ficou mais torta.'],
    },
  },
  {
    id: 'front.m03.j02',
    moduleId: 'front.m03',
    title: 'Menu e vitrine do pet shop',
    briefMarkdown:
      'O Pet Shop Latido Feliz tem um menu hambúrguer que não abre e uma vitrine que vira palitinho no celular. ' +
      'O Seu Rubens quer tudo funcionando "igual nesses aplicativos de entrega".',
    client: {
      name: 'Pet Shop Latido Feliz',
      contact: 'Seu Rubens',
      place: 'client-office',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'junior',
    path: 'front',
    pay: 120,
    slaMinutes: 90,
    taskExerciseIds: ['front.m03.d02', 'front.m03.e02'],
    chat: {
      arrival: [
        'Pode sentar ali, só tira o gato do teclado. Ele acha que é dono do notebook.',
        'O menu tem um ícone de hambúrguer. Eu cliquei e não veio hambúrguer nenhum. Nem o menu.',
      ],
      delivery: ['Abriu de primeira! O gato aprovou: deitou em cima do Pix pra você.'],
    },
  },
  {
    id: 'front.m03.j03',
    moduleId: 'front.m03',
    title: 'Site acessível da marcenaria',
    briefMarkdown:
      'Um cliente cego reclamou que não conseguiu pedir orçamento no site da Marcenaria Cupim Zero, e outro, que usa só o teclado, ' +
      'disse que "o site some quando aperta Tab". Conserte o formulário e o foco.',
    client: {
      name: 'Marcenaria Cupim Zero',
      contact: 'Seu Arlindo',
      place: 'client-office',
      area: 'Jardim da Glória, Cotia',
    },
    seniority: 'junior',
    path: 'front',
    pay: 150,
    slaMinutes: 110,
    taskExerciseIds: ['front.m03.e03', 'front.m03.d03'],
    twists: [
      {
        afterTask: 1,
        message:
          'Já que você entende de teclado: a janelinha da queima de estoque não fecha com o Esc. Meu cliente ficou preso nela. É coisa de cinco minutinhos.',
        extraExerciseId: 'front.m03.e06',
        extraPay: 0,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'Bem-vindo! Não repara no pó de serra, é decoração.',
        'O designer disse que o contorno azul era feio. Agora o feio é o cliente reclamando.',
      ],
      delivery: ['Ficou firme igual armário de ipê. Quando quiser uma estante, é só falar.'],
    },
  },
  {
    id: 'front.m03.j04',
    moduleId: 'front.m03',
    title: 'Carrinho e filtros da marmitaria',
    briefMarkdown:
      'A Marmitaria Tempero da Vó lançou o pedido pelo site. O leitor de tela não sabe o que são os botões do carrinho, ' +
      'e o botão "Filtros" não abre de jeito nenhum. Entrega antes do almoço, que é quando chovem pedidos.',
    client: {
      name: 'Marmitaria Tempero da Vó',
      contact: 'Dona Zulmira',
      place: 'client-office',
      area: 'Jardim Belval, Barueri',
    },
    seniority: 'junior',
    path: 'front',
    pay: 170,
    slaMinutes: 120,
    taskExerciseIds: ['front.m03.e04', 'front.m03.d04'],
    twists: [
      {
        afterTask: 1,
        message:
          'Minha neta quer laranja no amarelo, "pra dar fome". Eu não consigo ler nada. Dá pra provar com número quem tem razão?',
        extraExerciseId: 'front.m03.e05',
        extraPay: 25,
        extraSlaMinutes: 30,
      },
    ],
    chat: {
      arrival: [
        'Chegou na hora da feijoada! Come primeiro, trabalha depois. Não aceito não como resposta.',
        'O site é bonito, mas meu cliente que não enxerga disse que ele "fala tudo errado".',
      ],
      delivery: ['Agora até o leitor de tela pede feijoada! Toma uma marmita pra viagem, com farofa extra.'],
    },
  },
];

const responsiveAccessibleModule: ContentModule = {
  id: 'front.m03',
  track: 'front',
  order: 3,
  seniority: 'junior',
  title: 'Responsivo e acessível',
  summary:
    'Layout fluido com rem, max-width e clamp(), componentes que se ajustam (grade auto-fit e menu hambúrguer), e um site que funciona para todo mundo: alt, labels, foco visível, teclado, ARIA e contraste.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default responsiveAccessibleModule;
