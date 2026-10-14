import type { ContentModule } from '../../../src/shared/content';
import type { JobTemplate } from '../../../src/shared/jobs';
import * as l01 from './l01-genericos-funcoes';
import * as l02 from './l02-tipos-classes-genericos';
import * as l03 from './l03-keyof-typeof';
import * as l04 from './l04-tipos-utilitarios';
import * as l05 from './l05-eventos-tipados';

const parts = [l01, l02, l03, l04, l05];

const jobs: JobTemplate[] = [
  {
    id: 'typescript.m03.j01',
    moduleId: 'typescript.m03',
    title: 'Faxina na biblioteca do primo',
    briefMarkdown:
      'A Distribuidora Parafuso Solto tem uma "biblioteca interna" escrita pelo primo do dono: tudo `any`, ' +
      'funções copiadas para cada tipo e um relatório que quebra toda segunda. Troque os `any` por ' +
      '**genéricos** de verdade, sem mudar o comportamento.',
    client: {
      name: 'Distribuidora Parafuso Solto',
      contact: 'Seu Edivaldo',
      place: 'client-office',
      area: 'Vila Yara, Osasco',
    },
    seniority: 'pleno',
    pay: 160,
    slaMinutes: 120,
    taskExerciseIds: ['typescript.m03.e01', 'typescript.m03.e02', 'typescript.m03.e05'],
    twists: [
      {
        afterTask: 1,
        message:
          'Opa, o primo ficou sabendo e mandou um "ajuste" dele na função de remover pedido. Agora o ' +
          'pedido some com o total junto. Dá uma olhada? Ele disse que é coisa de cinco minutos.',
        extraExerciseId: 'typescript.m03.d01',
        extraPay: 30,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Chegou! O computador do escritório é aquele com o adesivo "NÃO DESLIGAR".',
        'O primo escreveu tudo num fim de semana. Ele diz que tipo é "frescura de dev".',
      ],
      delivery: ['Rodou o relatório e não deu undefined nenhum! Não conta pro primo. Pix enviado.'],
    },
  },
  {
    id: 'typescript.m03.j02',
    moduleId: 'typescript.m03',
    title: 'Fila de entregas da marmitaria',
    briefMarkdown:
      'A Marmitaria Panela de Pressão quer organizar as entregas: uma **fila** de verdade (o primeiro ' +
      'pedido sai primeiro, que novidade) e um tipo `Resultado<T>` para parar de espalhar `try/catch` ' +
      'pelo sistema.',
    client: {
      name: 'Marmitaria Panela de Pressão',
      contact: 'Dona Neide',
      place: 'client-office',
      area: 'Quitaúna, Osasco',
    },
    seniority: 'pleno',
    pay: 190,
    slaMinutes: 140,
    taskExerciseIds: ['typescript.m03.e04', 'typescript.m03.e03'],
    twists: [
      {
        afterTask: 0,
        message:
          'A fila ficou ótima! Só que a cache de CEP vive devolvendo `unknown` e o menino colocou ' +
          '`as string` em tudo. É rapidinho, né?',
        extraExerciseId: 'typescript.m03.d02',
        extraPay: 0,
        extraSlaMinutes: 15,
      },
    ],
    chat: {
      arrival: [
        'Senta aí! Já almoçou? Tem marmita de feijoada sobrando.',
        'Os motoboys estão brigando porque quem chega primeiro sai por último.',
      ],
      delivery: ['Primeiro que chega, primeiro que sai! Os motoboys fizeram as pazes. Leva uma marmita.'],
    },
  },
  {
    id: 'typescript.m03.j03',
    moduleId: 'typescript.m03',
    title: 'API de produtos do pet shop',
    briefMarkdown:
      'O Pet Shop Late Mas Não Morde está tirando o cadastro de produtos da planilha. Monte os **DTOs** ' +
      'de criar e atualizar com tipos utilitários, conserte o tipo do usuário público (que está ' +
      'vazando só a senha) e faça a contagem de pedidos por status.',
    client: {
      name: 'Pet Shop Late Mas Não Morde',
      contact: 'Dona Cida',
      place: 'client-office',
      area: 'Jardim Belval, Barueri',
    },
    seniority: 'pleno',
    pay: 240,
    slaMinutes: 170,
    taskExerciseIds: ['typescript.m03.e07', 'typescript.m03.d04', 'typescript.m03.e08'],
    twists: [
      {
        afterTask: 0,
        message:
          'Adorei! Agora a moça do caixa quer mudar só o preço sem mexer no resto do produto, e sem ' +
          'estragar o original. Cabe aí no orçamento?',
        extraExerciseId: 'typescript.m03.e06',
        extraPay: 40,
        extraSlaMinutes: 25,
      },
    ],
    chat: {
      arrival: [
        'Pode entrar, o Thor não morde. Late, mas não morde.',
        'A planilha tem 4 abas chamadas "produtos_FINAL", "produtos_FINAL2" e "NAO_MEXER".',
      ],
      delivery: ['Cadastrou a ração sem o id inventado pelo estagiário! O Thor aprovou. Pix enviado.'],
    },
  },
  {
    id: 'typescript.m03.j04',
    moduleId: 'typescript.m03',
    title: 'Painel de pedidos do açaí',
    briefMarkdown:
      'O painel do Açaí Congela Cérebro perde pedidos porque alguém emite `pedido:nvo` em vez de ' +
      '`pedido:novo`. Tipe o **barramento de eventos**, conserte a tabela de rotas da API com `satisfies` ' +
      'e trave os status com `as const`.',
    client: {
      name: 'Açaí Congela Cérebro',
      contact: 'Renan',
      place: 'coworking',
      area: 'Granja Viana, Cotia',
    },
    seniority: 'pleno',
    pay: 270,
    slaMinutes: 180,
    taskExerciseIds: ['typescript.m03.e09', 'typescript.m03.d05', 'typescript.m03.d03'],
    chat: {
      arrival: [
        'E aí! Trabalho aqui no coworking, a loja é logo ali. Quer um açaí de 700 ml? É por conta.',
        'Ontem a gente perdeu um pedido de 12 açaís por causa de uma letra. Uma letra!',
      ],
      delivery: ['Errou o nome do evento, o editor fica vermelho na hora. Nunca mais perco pedido. Valeu!'],
    },
  },
];

const genericsModule: ContentModule = {
  id: 'typescript.m03',
  track: 'typescript',
  order: 3,
  seniority: 'pleno',
  title: 'Genéricos e tipos utilitários',
  summary:
    'Código que serve para vários tipos sem perder a checagem: funções, tipos e classes genéricas, ' +
    'restrições com extends, keyof e T[K], typeof e as const, tipos utilitários (Partial, Omit, Record, ' +
    'ReturnType...) para DTOs, e um barramento de eventos tipado com satisfies.',
  lessons: parts.map((p) => p.lesson),
  exercises: parts.flatMap((p) => p.exercises),
  questions: parts.flatMap((p) => p.questions),
  jobs,
};

export default genericsModule;
