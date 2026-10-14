import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-estrutura';
import * as l02 from './l02-textos-e-listas';
import * as l03 from './l03-links-e-imagens';
import * as l04 from './l04-semantica';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'core.m01.j01',
    moduleId: 'core.m01',
    title: 'A placa da padaria na internet',
    briefMarkdown:
      'O Seu Zé quer o site da padaria "igualzinho à placa da frente": o nome e o slogan. Só isso. Por enquanto.',
    client: {
      name: 'Padaria Pão de Ontem',
      contact: 'Seu Zé',
      place: 'client-office',
      area: 'Centro, Osasco',
    },
    seniority: 'estagiario',
    pay: 30,
    slaMinutes: 40,
    taskExerciseIds: ['core.m01.e01'],
    twists: [
      {
        afterTask: 0,
        message: 'Ficou uma beleza! Já que tá aí, põe o cardápio embaixo? É rapidinho, são só três coisas.',
        extraExerciseId: 'core.m01.e02',
        extraPay: 0,
        extraSlaMinutes: 10,
      },
    ],
    chat: {
      arrival: [
        'Bom dia! Senta aí, o wi-fi é "paodeontem123".',
        'Meu sobrinho disse que site é fácil, mas ele tá na academia.',
      ],
      delivery: ['Valeu, filho! Leva um pão de ontem pra viagem, é por conta da casa.'],
    },
  },
  {
    id: 'core.m01.j02',
    moduleId: 'core.m01',
    title: 'Aviso e agendamento da barbearia',
    briefMarkdown:
      'A Barbearia Navalha Cega quer o aviso de horário bem destacado e o passo a passo do agendamento numerado, porque "ninguém lê nada".',
    client: {
      name: 'Barbearia Navalha Cega',
      contact: 'Seu Nelson',
      place: 'client-office',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'estagiario',
    pay: 45,
    slaMinutes: 60,
    taskExerciseIds: ['core.m01.e03', 'core.m01.d02'],
    chat: {
      arrival: [
        'Chegou bem na hora! Quer dizer, o cliente das 14h ainda não chegou, então você é o das 14h.',
        'Se quiser, depois do serviço eu acerto esse cabelo aí. Sem compromisso.',
      ],
      delivery: ['Agora sim! Se alguém chegar 19h05, eu mostro a tela e pronto.'],
    },
  },
  {
    id: 'core.m01.j03',
    moduleId: 'core.m01',
    title: 'Vitrine e contatos do pet shop',
    briefMarkdown:
      'A Dona Cida quer a foto do banho com link para a agenda e os contatos funcionando no celular. "Os clientes são de idade, tem que ser num toque só."',
    client: {
      name: 'Pet Shop Au Au Osasco',
      contact: 'Dona Cida',
      place: 'client-office',
      area: 'Jardim das Flores, Osasco',
    },
    seniority: 'estagiario',
    pay: 55,
    slaMinutes: 70,
    taskExerciseIds: ['core.m01.e04', 'core.m01.e05'],
    chat: {
      arrival: ['Pode entrar, o Thor não morde. Quer dizer, morde pouco.'],
      delivery: ['Que lindo! Vou mandar o link no grupo da família agora mesmo.'],
    },
  },
  {
    id: 'core.m01.j04',
    moduleId: 'core.m01',
    title: 'Arrumar o site da auto peças',
    briefMarkdown:
      'O Seu Valdir diz que "o link do catálogo não clica" e que o sobrinho montou o site "tudo em caixinha". Precisa deixar organizado.',
    client: {
      name: 'Auto Peças Parafuso Solto',
      contact: 'Seu Valdir',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'estagiario',
    pay: 80,
    slaMinutes: 90,
    taskExerciseIds: ['core.m01.d03', 'core.m01.e06'],
    twists: [
      {
        afterTask: 1,
        message:
          'Opa, um cliente acabou de ligar dizendo que o botão de orçamento não funciona no teclado dele. Dá uma olhadinha? É rapidinho.',
        extraExerciseId: 'core.m01.d04',
        extraPay: 10,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chegou! Pegou muito trânsito na Raposo?',
        'O computador fica ali atrás do pneu. Cuidado com a graxa.',
      ],
      delivery: ['Ficou bom, hein! Se o carro der problema, a peça sai com desconto de estagiário.'],
    },
  },
];

const mod: ContentModule = {
  id: 'core.m01',
  track: 'core',
  order: 1,
  seniority: 'estagiario',
  title: 'HTML básico',
  summary:
    'O primeiro passo de todo freela: tags e atributos, títulos, listas, links, imagens e HTML semântico para montar a página dos primeiros clientes.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default mod;
