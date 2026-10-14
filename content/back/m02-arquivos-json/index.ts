import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-ler-escrever';
import * as l02 from './l02-path-pastas';
import * as l03 from './l03-json';
import * as l04 from './l04-promises-csv';

const parts = [l01, l02, l03, l04];

const jobs: JobTemplate[] = [
  {
    id: 'back.m02.j01',
    moduleId: 'back.m02',
    title: 'Fiado digital da mercearia',
    briefMarkdown:
      'O Seu Bené quer aposentar o caderninho de fiado, que já sobreviveu a três enchentes e a um ' +
      'café derramado. Um script que anota e lê o fiado num arquivo de texto resolve. "Banco de dados é ' +
      'coisa de banco, aqui é mercearia."',
    client: {
      name: 'Mercearia Fiado Só Amanhã',
      contact: 'Seu Bené',
      place: 'client-office',
      area: 'Quitaúna, Osasco',
    },
    seniority: 'junior',
    path: 'back',
    pay: 70,
    slaMinutes: 50,
    taskExerciseIds: ['back.m02.e01'],
    twists: [
      {
        afterTask: 0,
        message:
          'Ficou bom demais! O Ditão do lava-rápido aqui do lado viu e pediu pra você dar uma olhada na tabela ' +
          'de preços dele, que só mostra o último serviço. Eu disse que você faz rapidinho.',
        extraExerciseId: 'back.m02.d01',
        extraPay: 20,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chegou! O computador é aquele embaixo das bananas. Liga no tranco.',
        'O caderninho tá aqui, mas não abre a página 12 que tá colada.',
      ],
      delivery: ['Agora sim! Pode passar no caixa: hoje o seu é por conta da casa. Amanhã é fiado.'],
    },
  },
  {
    id: 'back.m02.j02',
    moduleId: 'back.m02',
    title: 'Faxina nas pastas da contabilidade',
    briefMarkdown:
      'O Escritório Contábil Balanço Fechado tem uma pasta com 4 mil arquivos, entre planilhas, fotos do ' +
      'gato e "backup do backup". O Dr. Anselmo quer um script que ache só as planilhas e outro que guarde ' +
      'o backup por ano e mês, do jeito certo.',
    client: {
      name: 'Escritório Contábil Balanço Fechado',
      contact: 'Dr. Anselmo',
      place: 'client-office',
      area: 'Alphaville, Barueri',
    },
    seniority: 'junior',
    path: 'back',
    pay: 120,
    slaMinutes: 80,
    taskExerciseIds: ['back.m02.e02', 'back.m02.d02'],
    chat: {
      arrival: [
        'Bem-vindo. Crachá de visitante no peito, por favor. E não toque na pasta 2019, ninguém sabe o que tem lá.',
      ],
      delivery: ['Organizado como um balancete. Nota fiscal você emite, né? Brincadeira. Emite sim.'],
    },
  },
  {
    id: 'back.m02.j03',
    moduleId: 'back.m02',
    title: 'O cardápio em JSON da marmitaria',
    briefMarkdown:
      'O "sistema" da Marmitaria da Tia Nena é um `cardapio.json` e um `config.json` que ela edita no bloco ' +
      'de notas. Desde que ela deixou uma vírgula sobrando, nada funciona. Conserte a leitura da config e ' +
      'faça o script que adiciona pratos sem estragar o arquivo.',
    client: {
      name: 'Marmitaria da Tia Nena',
      contact: 'Tia Nena',
      place: 'client-office',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'junior',
    path: 'back',
    pay: 110,
    slaMinutes: 75,
    taskExerciseIds: ['back.m02.d03', 'back.m02.e03'],
    twists: [
      {
        afterTask: 1,
        message:
          'Meu sobrinho fez um aplicativo de pedidos no fim de semana, mas às vezes chega pedido sem nome, sem ' +
          'marmita, ou umas letras estranhas. Dá pra conferir o pedido antes de entrar? Te pago em marmita também.',
        extraExerciseId: 'back.m02.e04',
        extraPay: 30,
        extraSlaMinutes: 20,
      },
    ],
    chat: {
      arrival: [
        'Entra, entra! Eu só mexi numa vírgula, juro. Depois disso o computador ficou bravo.',
        'Senta ali longe do fogão que o notebook esquenta.',
      ],
      delivery: ['Funcionou! Leva uma feijoada pra estrada. É de quarta, mas hoje é sexta, tá ótima ainda.'],
    },
  },
  {
    id: 'back.m02.j04',
    moduleId: 'back.m02',
    title: 'Relatório de vendas da açaiteria',
    briefMarkdown:
      'A Açaiteria Roxo de Fome tem três lojas (Granja Viana, Centro de Cotia e Caucaia do Alto), cada uma ' +
      'exportando as vendas num CSV da planilha. O Seu Jair soma tudo na calculadora todo domingo à noite. ' +
      'Ele quer um relatório automático. "Pode usar inteligência artificial, mas tem que bater com a ' +
      'calculadora."',
    client: {
      name: 'Açaiteria Roxo de Fome',
      contact: 'Seu Jair',
      place: 'client-office',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'junior',
    path: 'back',
    pay: 190,
    slaMinutes: 130,
    taskExerciseIds: ['back.m02.e05', 'back.m02.e06'],
    twists: [
      {
        afterTask: 0,
        message:
          'Opa, antes de continuar: o contador de pedidos que o freela anterior deixou dá um tal de ' +
          '"split is not a function". Ele jurou que funcionava na máquina dele. Olha pra mim?',
        extraExerciseId: 'back.m02.d04',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chegou na hora! Quer um açaí? Com granola, leite em pó e paçoca, que é o certo.',
        'As planilhas tão aí. A da Caucaia ficou vazia esse mês porque a máquina de açaí quebrou.',
      ],
      delivery: ['Bateu com a calculadora no centavo! Domingo que vem eu vou é dormir.'],
    },
  },
];

const arquivosModule: ContentModule = {
  id: 'back.m02',
  track: 'back',
  order: 2,
  seniority: 'junior',
  title: 'Arquivos e dados: fs, path e JSON',
  summary:
    'Ler e gravar arquivos com fs (e não morrer de ENOENT), montar caminhos e pastas com path, transformar o ' +
    '"banco de dados" JSON do cliente em objetos e de volta, e processar o CSV de vendas com fs/promises e ' +
    'async/await até virar relatório.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default arquivosModule;
