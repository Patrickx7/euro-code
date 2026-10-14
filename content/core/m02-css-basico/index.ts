import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-seletores';
import * as l02 from './l02-cores-textos';
import * as l03 from './l03-box-model';
import * as l04 from './l04-display-unidades';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'core.m02.j01',
    moduleId: 'core.m02',
    title: 'Cardápio com cara de site',
    briefMarkdown:
      'O Seu Zé quer o cardápio da padaria "colorido igual ao da TV": título azul, promoção em vermelho e o resto discreto.',
    client: {
      name: 'Padaria Pão de Ontem',
      contact: 'Seu Zé',
      place: 'client-office',
      area: 'Centro, Osasco',
    },
    seniority: 'estagiario',
    pay: 35,
    slaMinutes: 40,
    taskExerciseIds: ['core.m02.e01'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou bonito! Ó, meu cunhado Betão tem uma lanchonete e o site dele tá todo torto. Dá uma olhadinha? É rapidinho.',
        extraExerciseId: 'core.m02.d02',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: ['Bom dia! Senta aí, o wi-fi é "paodeontem123". O sonho é de ontem, mas tá bom.'],
      delivery: ['Valeu, filho! O pagamento é em dinheiro e em pão. Mais pão.'],
    },
  },
  {
    id: 'core.m02.j02',
    moduleId: 'core.m02',
    title: 'Preços e card da auto peças',
    briefMarkdown:
      'O último estagiário sumiu e deixou o CSS pela metade. Primeiro consertar os preços, depois montar o card de produto.',
    client: {
      name: 'Auto Peças Parafuso Solto',
      contact: 'Dona Rose',
      place: 'client-office',
      area: 'Km 18, Osasco',
    },
    seniority: 'estagiario',
    pay: 70,
    slaMinutes: 75,
    taskExerciseIds: ['core.m02.d01', 'core.m02.e03'],
    chat: {
      arrival: ['Chegou o novo! O outro disse que ia "dar um pulinho no posto" faz três semanas.'],
      delivery: ['Agora sim, parece loja de verdade. Se quiser, te pago metade em parafuso.'],
    },
  },
  {
    id: 'core.m02.j03',
    moduleId: 'core.m02',
    title: 'Placa digital do pet shop',
    briefMarkdown:
      'A Dona Cida quer uma placa digital para a TV da recepção: azul, branca e amarela, "que nem a coleira do Thor".',
    client: {
      name: 'Pet Shop Au Au Osasco',
      contact: 'Dona Cida',
      place: 'home',
      area: 'Presidente Altino, Osasco',
    },
    seniority: 'estagiario',
    pay: 45,
    slaMinutes: 45,
    taskExerciseIds: ['core.m02.e02'],
    chat: {
      arrival: ['Entra, entra! Não liga pro Thor, ele só late pra quem tem notebook.'],
      delivery: ['Que lindeza! O Thor aprovou: abanou o rabo pro monitor.'],
    },
  },
  {
    id: 'core.m02.j04',
    moduleId: 'core.m02',
    title: 'Site moderno da oficina',
    briefMarkdown:
      'O Seu Tião quer o site da oficina "moderno igual ao do concorrente": menu lado a lado e uma capa ocupando a tela toda.',
    client: {
      name: 'Oficina do Seu Tião',
      contact: 'Seu Tião',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'estagiario',
    pay: 90,
    slaMinutes: 90,
    taskExerciseIds: ['core.m02.e04'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ih, meu sobrinho mexeu no banner enquanto você tava no banheiro. Agora ficou pequenininho. Arruma aí, é rapidinho.',
        extraExerciseId: 'core.m02.d04',
        extraPay: 10,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: ['Fala, garoto! Seu carro tá fazendo um barulho estranho, hein. Depois a gente vê isso.'],
      delivery: ['Ficou show! Como agradecimento, o barulho do seu carro eu olho com desconto.'],
    },
  },
];

const cssBasico: ContentModule = {
  id: 'core.m02',
  track: 'core',
  order: 2,
  seniority: 'estagiario',
  title: 'CSS básico',
  summary:
    'Deixe as páginas apresentáveis: seletores e cascata, cores e textos, box model, display e unidades de medida.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default cssBasico;
