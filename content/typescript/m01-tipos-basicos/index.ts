import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-por-que-typescript';
import * as l02 from './l02-primitivos-arrays';
import * as l03 from './l03-funcoes';
import * as l04 from './l04-objetos';
import * as l05 from './l05-null-undefined';

const parts = [l01, l02, l03, l04, l05];

const jobs: JobTemplate[] = [
  {
    id: 'typescript.m01.j01',
    moduleId: 'typescript.m01',
    title: 'Calculadora de orçamento em TypeScript',
    briefMarkdown:
      'A Marcenaria Serragem Fina tem uma calculadora de orçamento em JavaScript que o sobrinho do dono ' +
      'escreveu "num fim de semana". Ela já cobrou R$ 12.015 de frete. Migre para TypeScript e faça os ' +
      'tipos barrarem texto onde deveria ter número.',
    client: {
      name: 'Marcenaria Serragem Fina',
      contact: 'Seu Osvaldo',
      place: 'client-office',
      area: 'Jardim Mutinga, Osasco',
    },
    seniority: 'pleno',
    pay: 100,
    slaMinutes: 80,
    taskExerciseIds: ['typescript.m01.e01', 'typescript.m01.d01'],
    twists: [
      {
        afterTask: 1,
        message:
          'Ficou uma beleza! Já que você tá aí, migra só mais um arquivo pra TypeScript? É o das formas de ' +
          'pagamento, pequenininho. Umas 400 linhas.',
        extraExerciseId: 'typescript.m01.e04',
        extraPay: 30,
        extraSlaMinutes: 25,
      },
    ],
    chat: {
      arrival: [
        'Chegou o pleno! Cuidado com a serragem, ela entra até no teclado.',
        'Meu sobrinho disse que TypeScript é "JavaScript de terno". Vamos ver se é isso mesmo.',
      ],
      delivery: [
        'Tentei digitar "três" no campo de horas e o sistema não deixou. Que maravilha! Pix enviado.',
      ],
    },
  },
  {
    id: 'typescript.m01.j02',
    moduleId: 'typescript.m01',
    title: 'Caixa do pastel sem any',
    briefMarkdown:
      'A Pastelaria Vento Recheado fecha o caixa com um script cheio de `any`, e o total do dia às vezes ' +
      'sai com sete dígitos. Tipe as funções do caixa, crie o resumo do dia e trate os valores que vêm da ' +
      'planilha (que tem de tudo, até célula escrito "pagou depois").',
    client: {
      name: 'Pastelaria Vento Recheado',
      contact: 'Dona Neide',
      place: 'client-office',
      area: 'Centro, Carapicuíba',
    },
    seniority: 'pleno',
    pay: 150,
    slaMinutes: 120,
    taskExerciseIds: ['typescript.m01.d02', 'typescript.m01.e02', 'typescript.m01.e03'],
    chat: {
      arrival: [
        'Oi, querido! Pega um pastel de vento enquanto liga o computador. É o da casa.',
        'Ontem o caixa disse que a gente faturou R$ 352.015. Bem que eu queria.',
      ],
      delivery: ['Fechou certinho, até o centavo! Hoje eu durmo tranquila. Pagamento feito.'],
    },
  },
  {
    id: 'typescript.m01.j03',
    moduleId: 'typescript.m01',
    title: 'Cadastro tipado da transportadora',
    briefMarkdown:
      'A Transportadora Vai Que Chega quer o faturamento por bairro e um cadastro de clientes em que o CNPJ ' +
      'pare de mudar sozinho. O cardápio do refeitório também está bugado, mas "isso é bônus".',
    client: {
      name: 'Transportadora Vai Que Chega',
      contact: 'Rafael',
      place: 'coworking',
      area: 'Alphaville, Barueri',
    },
    seniority: 'pleno',
    pay: 200,
    slaMinutes: 150,
    taskExerciseIds: ['typescript.m01.e06', 'typescript.m01.e07', 'typescript.m01.d04'],
    twists: [
      {
        afterTask: 0,
        message:
          'O relatório por bairro ficou ótimo! Só que o diretor quer ver "R$ 35,00" e não "35". Faz um ' +
          'formatador rapidinho?',
        extraExerciseId: 'typescript.m01.e05',
        extraPay: 25,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'Bem-vindo ao coworking! A sala de reunião é aquela com o pufe em formato de caminhão.',
        'Nosso sistema é 100% TypeScript. Quer dizer, tem uns `any` aqui e ali. Uns 300.',
      ],
      delivery: ['O CNPJ não mudou nenhuma vez hoje. Recorde da empresa! Transferência feita.'],
    },
  },
  {
    id: 'typescript.m01.j04',
    moduleId: 'typescript.m01',
    title: 'Delivery que só quebra em produção',
    briefMarkdown:
      'O app de pedidos da Marmitaria Tempero da Vó Zilda quebra com cliente sem apelido e cobra taxa de ' +
      'entrega errada do vizinho. "Na máquina do outro dev funcionava." Use o strict null do TypeScript ' +
      'para achar cada `undefined` antes do cliente.',
    client: {
      name: 'Marmitaria Tempero da Vó Zilda',
      contact: 'Dona Zilda',
      place: 'home',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'pleno',
    pay: 170,
    slaMinutes: 110,
    taskExerciseIds: ['typescript.m01.d05', 'typescript.m01.e08'],
    twists: [
      {
        afterTask: 1,
        message:
          'Uma última coisinha: o cálculo da hora extra do motoboy dá "NaN". Ele acha que é um bônus novo.',
        extraExerciseId: 'typescript.m01.d03',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Entra, meu filho! Senta na mesa da cozinha, o wi-fi pega melhor perto da panela de pressão.',
        'O app quebrou de novo na hora do almoço. O Seu Jorge ligou bravo, ele nem tem apelido!',
      ],
      delivery: [
        'O Seu Jorge foi saudado pelo nome e o Bonfim não pagou frete. Leva uma marmita! Pix enviado.',
      ],
    },
  },
];

const tiposBasicos: ContentModule = {
  id: 'typescript.m01',
  track: 'typescript',
  order: 1,
  seniority: 'pleno',
  title: 'TypeScript: tipos básicos e inferência',
  summary:
    'Por que TypeScript, anotações e inferência; primitivos, arrays, tuplas, literais e o perigo do any; ' +
    'funções tipadas (opcionais, padrão, void, never, tipos de função); objetos com type, readonly e ' +
    'Record; e strict null com ?., ?? e narrowing.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default tiposBasicos;
