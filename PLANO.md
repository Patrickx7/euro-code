# Euro Code — Plano do Projeto

Simulador de caminhão no estilo *Euro Truck Simulator*, ambientado em **Osasco e Cotia (SP)**, em que o
jogador aprende **JavaScript com Node.js e migra até TypeScript** para manter o caminhão rodando:

| Ação no jogo | O que o jogador precisa fazer |
|---|---|
| Abastecer no posto | Estudar a lição da vez e resolver o exercício de código |
| Passar no pedágio | Responder corretamente perguntas sobre o que já estudou |
| Subir de nível | Passar na "Prova de Habilitação" do módulo atual |
| Comprar caminhão novo | Vencer o desafio técnico da concessionária |
| Ser parado numa blitz | Responder perguntas sobre os exercícios que acabou de fazer (errou = multa e pontos na CNH) |
| Dormir no hotel quando bater o sono | Responder perguntas para conseguir fazer o check-in |
| Consertar pane na estrada | Chamar o mecânico (caro) ou resolver um exercício de depuração (barato) |

O mundo também tem **trânsito com IA**, **pneus que gastam**, **desgaste mecânico com falhas**
(engasgos, motor apagando, pane total) e **polícia orientando o trânsito** quando o caminhão quebra num
lugar perigoso.

> **Nota legal:** "Euro Truck Simulator" é marca da SCS Software. O jogo será **inspirado** nele
> (mecânicas, sensação de dirigir, economia de fretes), mas com nome, código, modelos, sons e marcas
> **próprios**. Nada de assets, logos ou nomes de caminhões/empresas reais. Os dados do mapa vêm do
> OpenStreetMap (licença ODbL) e exigem o crédito "© colaboradores do OpenStreetMap" na tela.

---

## 1. Decisões técnicas

| Tema | Decisão | Motivo |
|---|---|---|
| Plataforma | Navegador (desktop), publicado no GitHub Pages | Zero instalação; dá para testar com o Chromium/Playwright das sessões na nuvem |
| Linguagem | TypeScript estrito | O próprio projeto vira referência do que o jogador aprende |
| Build | Vite | Rápido, simples, bom suporte a Web Workers |
| 3D | Three.js | Maduro, leve, ótimo para estradas geradas proceduralmente |
| Física | Física "arcade" própria (modelo de bicicleta + reboque articulado) | Mais controlável e leve que uma engine completa; dá para trocar por Rapier depois |
| Editor de código no jogo | CodeMirror 6 | Leve, com suporte a JS/TS |
| Execução do código do jogador | Web Worker isolado, com timeout, e "simulador de Node" (`console`, `process`, `require`/`module.exports`, `fs` em memória, `path`, `events`) | Roda 100% no navegador, sem servidor; mata loops infinitos |
| Checagem de TypeScript | Pacote `typescript` dentro do Worker (type-check real + transpile) | Erros de tipo idênticos aos do `tsc` |
| Persistência | `localStorage` + exportar/importar save em JSON | Sem backend |
| Testes | Vitest (unidade e conteúdo) + Playwright (ponta a ponta) | Cada sessão na nuvem valida o próprio trabalho |
| CI/CD | GitHub Actions: lint, typecheck, testes, validação do conteúdo, deploy no Pages | |
| Idioma | Interface e conteúdo em PT-BR; identificadores de código em inglês | |

---

## 2. Mecânicas de jogo

### 2.1 Dirigir (o "feeling" do ETS)
- Câmeras: cabine (com retrovisores), externa orbital e superior.
- Controles: teclado, gamepad e volante (Gamepad API); câmbio automático no MVP, manual depois.
- Reboque articulado com engate/desengate, ré com reboque, peso da carga afetando aceleração e frenagem.
- Setas, faróis, freio motor, limitador de velocidade, painel com velocímetro, conta-giros e combustível.
- Dano simples (colisões reduzem o pagamento do frete) e multas (excesso de velocidade, sinal vermelho).
- Escala comprimida (~1:4 nas rodovias, cidades mais próximas de 1:2) para viagens de 5 a 10 minutos.

### 2.2 Fretes e economia
- Mercado de fretes em empresas **fictícias** localizadas em pontos reais (centros de distribuição na
  Castello Branco, indústrias em Osasco, chácaras/hortifrúti em Caucaia do Alto, comércio na Granja Viana etc.).
- Pagamento = distância × tipo de carga × prazo − danos − multas.
- GPS com rota calculada (A* no grafo de ruas) e minimapa.
- Garagem inicial em Osasco; caminhão inicial modesto (tanque pequeno, pouca potência).

### 2.3 Combustível → exercícios de JavaScript/TypeScript
1. O tanque esvazia conforme distância, carga e estilo de direção.
2. No posto, abre-se o "terminal do frentista" (visual de terminal, `$ node bomba.js`).
3. **Primeiro a aula:** texto curto do conceito, exemplos executáveis ("rodar" mostra a saída) e 1–2
   perguntas rápidas de checagem.
4. **Depois o exercício:** o jogador escreve código; testes automáticos validam.
5. Passou → tanque cheio. Dicas custam dinheiro do jogo. Pode tentar quantas vezes quiser.
6. **Anti-travamento:** se o combustível acabar na estrada, o guincho leva ao posto mais próximo
   (cobra taxa), e lá o exercício continua sendo exigido. Exercícios já resolvidos podem ser
   "reabastecidos" de novo com uma variação para revisão, se o jogador quiser praticar.

### 2.4 Pedágio → perguntas
- Ao entrar na praça, a cancela só abre com resposta correta.
- Perguntas vêm **somente de lições já estudadas**, com repetição espaçada (as que o jogador errou
  voltam mais vezes).
- Erro: paga tarifa extra e recebe outra pergunta. Explicação da resposta certa sempre exibida.
- Tipos: múltipla escolha, "qual a saída deste código?", completar lacuna, verdadeiro/falso.

### 2.5 Subir de nível → Prova de Habilitação
- XP vem dos fretes. Ao atingir o XP, o nível só sobe após a prova (ex.: 8 perguntas + 1 exercício)
  feita num "Centro de Formação de Condutores" no mapa.
- Requisito: todas as lições do módulo atual concluídas nos postos.
- Recompensa: libera o próximo módulo do currículo, cargas mais pesadas e rotas novas (mais rodovias
  com pedágio).

### 2.6 Comprar caminhão → desafio da concessionária
- Cada caminhão (modelos fictícios) tem preço, potência, tanque, consumo e capacidade de reboque.
- Além do dinheiro, a compra exige um desafio (exercício maior, que integra vários conceitos do nível
  exigido pelo caminhão).

### 2.7 Relógio do jogo
- O tempo do jogo corre acelerado: **1 minuto real = 10 minutos no jogo** (ajustável).
- O relógio controla o sono, os prazos de entrega, o ciclo de dia e noite e o horário de funcionamento
  das oficinas.

### 2.8 Trânsito
- Carros, ônibus, motos e outros caminhões controlados por IA, que seguem faixa, mudam de faixa, respeitam
  semáforos (extraídos do OSM), preferenciais e limites de velocidade.
- Densidade varia por horário (pico de manhã e no fim da tarde na Castello e na Raposo).
- Os veículos só existem num raio ao redor do jogador: surgem e somem fora da vista, para manter o desempenho.
- A IA reage ao jogador e a obstáculos: freia, buzina, desvia de faixa bloqueada.
- Colisão com veículo da IA gera dano, multa e possível chegada da polícia.

### 2.9 Blitz policial e penalidades
- Blitz em pontos fixos e aleatórios (mais comuns à noite e nas saídas das rodovias). O policial sinaliza e
  o jogador deve parar no acostamento; fugir gera multa pesada e perseguição curta.
- **Perguntas da blitz:** sobre os **exercícios resolvidos mais recentemente** ("o que seu código retorna
  se…?", "por que esse `reduce` começa com 0?"). Cada exercício tem perguntas de acompanhamento próprias.
- A blitz também confere: nível de sono, pneus carecas, excesso de peso e caminhão com defeito.
- **Errar = penalidade:** multa em dinheiro do jogo e **pontos na CNH**; a lição ligada à pergunta vai para
  revisão prioritária (volta nos pedágios e postos).
- **CNH suspensa (20 pontos):** o jogador só volta a dirigir depois do **curso de reciclagem**, refazendo
  os exercícios e perguntas que errou. Os pontos expiram com o tempo de jogo sem infrações.
- Infrações de trânsito (velocidade, sinal vermelho, colisão) também somam pontos.

### 2.10 Sono e hotel
- Uma barra de **cansaço** sobe com as horas dirigindo (mais rápido de madrugada).
- Aos 70%: aviso e GPS sugere o hotel mais próximo. Aos 90%: efeitos de sono (tela escurece nas bordas,
  piscadas, o volante "puxa"). Aos 100%: risco de **microssono** (perda de controle por instantes) e o
  caminhão fica limitado a 40 km/h até o jogador dormir.
- **Dormir só no hotel** (hotéis e motéis do OSM, mais pontos de parada nas rodovias). No check-in, o
  recepcionista faz perguntas; acertou, dorme e zera o cansaço; errou, paga diária extra e recebe outra pergunta.
- **Anti-travamento:** se o hotel estiver longe demais, um táxi leva o jogador até o hotel mais próximo
  (cobra taxa, o caminhão fica estacionado).

### 2.11 Pneus e desgaste mecânico
- **Pneus:** desgaste por eixo, conforme distância, carga, frenagens e curvas fortes. Pneu gasto reduz a
  aderência e aumenta a distância de frenagem; pneu careca pode **furar**. Troca na borracharia (ou estepe
  na estrada, com tempo de jogo gasto).
- **Componentes:** motor, transmissão, freios e parte elétrica têm "saúde" de 0 a 100%, que cai com a
  quilometragem e o abuso (giro alto, freio contínuo em descida, colisões). Revisão periódica na oficina
  restaura a saúde.
- **Falhas progressivas** conforme a saúde cai:
  1. **Engasgos:** perda de potência momentânea, luz no painel;
  2. **Motor apaga:** é preciso dar partida de novo (pode falhar algumas vezes);
  3. **Pane total:** o caminhão para de vez.
- **Conserto:** chamar o mecânico (caro e demorado) ou consertar sozinho resolvendo um **exercício de
  depuração**: um código "quebrado" do sistema do caminhão para o jogador corrigir.

### 2.12 Pane em local perigoso
- Se o caminhão parar numa faixa de rodovia, em cruzamento ou em curva, uma viatura chega, coloca cones e um
  policial orienta o trânsito, desviando os veículos da IA para outra faixa.
- Pane em lugar perigoso sem pisca-alerta ligado gera multa.
- Pane no acostamento ou em área de estacionamento não chama a polícia.

### 2.13 Mapa de progressão (níveis × currículo)

| Nível | Módulo liberado | Caminhão típico |
|---|---|---|
| 1 | M1 Primeiros passos com Node | Toco leve |
| 2 | M2 Operadores e controle de fluxo | |
| 3 | M3 Funções | Truck |
| 4 | M4 Arrays e objetos | |
| 5 | M5 Módulos (CommonJS → ESM) | Cavalo 4x2 |
| 6 | M6 Programação assíncrona | |
| 7 | M7 Núcleo do Node | |
| 8 | M8 Classes e POO | Cavalo 6x2 |
| 9 | M9 Introdução ao TypeScript | |
| 10 | M10 Tipando objetos e funções | |
| 11 | M11 Uniões e narrowing | Cavalo 6x4 |
| 12 | M12 Genéricos | |
| 13 | M13 Utility types e tipos avançados | |
| 14 | M14 Projeto final: migrar o sistema de fretes de JS para TS | Topo de linha |

---

## 3. Currículo

Cada módulo tem 4–6 lições; cada lição tem: **conceito → exemplos executáveis → checagem rápida →
exercício(s)**. Cada exercício tem **perguntas de acompanhamento** (usadas na blitz) e cada lição tem um
**exercício de depuração** (usado nos consertos). Total estimado: ~70 lições, ~90 exercícios, ~70
exercícios de depuração, ~600 perguntas.

### Trilha 1 — JavaScript com Node.js
- **M1 Primeiros passos:** o que é Node/runtime, rodar um script, `console.log`, comentários, `let`/`const`,
  tipos primitivos, template strings.
- **M2 Operadores e controle:** aritméticos, `===` vs `==`, lógicos, truthy/falsy, `if`/`else`, `switch`,
  ternário, `for`/`while`.
- **M3 Funções:** declaração vs arrow, parâmetros padrão, retorno, escopo, closures, callbacks.
- **M4 Arrays e objetos:** acesso, desestruturação, spread/rest, `map`/`filter`/`reduce`/`find`/`some`/`every`,
  `Object.keys/entries`, JSON.
- **M5 Módulos:** `require`/`module.exports`, `import`/`export`, `package.json` e npm (conceitual).
- **M6 Assíncrono:** event loop, `setTimeout`, callbacks, Promises, `async`/`await`, `try/catch`, `Promise.all`.
- **M7 Núcleo do Node:** `fs/promises`, `path`, `process.argv`/`env`, `EventEmitter`, erros, noção de streams.
- **M8 Classes e POO:** `class`, construtor, métodos, herança, getters/setters, campos `#privados`, `instanceof`.

### Trilha 2 — TypeScript
- **M9 Por que TypeScript:** anotações, inferência, primitivos, arrays e tuplas, `any` vs `unknown`, `tsc` e `tsconfig`.
- **M10 Objetos e funções:** `type` vs `interface`, opcionais, `readonly`, assinaturas de função, sobrecarga.
- **M11 Uniões e narrowing:** tipos literais, guards (`typeof`, `in`, `instanceof`), uniões discriminadas,
  `never` e checagem exaustiva.
- **M12 Genéricos:** funções e interfaces genéricas, restrições (`extends`), `keyof`, acesso indexado.
- **M13 Avançado:** `Partial`, `Pick`, `Omit`, `Record`, `ReturnType`, mapped types, `as const`, `satisfies`.
- **M14 Projeto final:** tipar um `EventEmitter`, funções assíncronas tipadas, ESM com tipos e migrar o
  "sistema de fretes" (escrito em JS ao longo da trilha 1) para TypeScript.

Os exercícios usam o universo do jogo (calcular frete, consumo, rota, tarifa de pedágio), então o
jogador "constrói" partes do sistema do próprio caminhão.

---

## 4. Mapa de Osasco e Cotia

- **Fonte:** OpenStreetMap. Script `tools/map/` baixa o recorte (Overpass API ou extrato da Geofabrik),
  simplifica e gera `public/map/*.json` versionado no repositório (o jogo não depende de rede).
- **Recorte aproximado:** lat −23,47 a −23,72 / lon −47,05 a −46,73. Osasco e Cotia **não são vizinhas**:
  o recorte inclui o corredor de Carapicuíba/Barueri/Jandira para ligá-las de forma realista.
- **Vias principais:** Rod. Castello Branco (SP‑280), Rod. Raposo Tavares (SP‑270), Rodoanel Mário Covas
  trecho Oeste (SP‑021), Av. dos Autonomistas, Estrada de Caucaia e as principais avenidas dos centros.
  Ruas residenciais só no entorno dos pontos de interesse (para manter o desempenho).
- **Pedágios:** extraídos das tags `barrier=toll_booth` do OSM; se faltar algum, posicionado manualmente
  sobre a rodovia.
- **Postos:** a partir de `amenity=fuel`, filtrados para uma quantidade jogável.
- **Hotéis, oficinas e borracharias:** de `tourism=hotel|motel`, `shop=car_repair` e `shop=tyres`;
  complementados à mão onde faltar.
- **Semáforos:** de `highway=traffic_signals`, usados pelo trânsito.
- **Pontos de blitz:** definidos à mão (saídas de rodovia, avenidas principais) e sorteados no jogo.
- **Geração 3D:** faixas de estrada a partir das polilinhas (largura por tipo de via), cruzamentos
  simplificados, prédios extrudados a partir dos contornos do OSM, terreno com relevo suave, carregamento
  por blocos (chunks) conforme o caminhão anda.

> ⚠️ **Rede:** nesta sessão na nuvem, `overpass-api.de` e `download.geofabrik.de` estão **bloqueados**
> pela política de rede do ambiente (o npm funciona). Antes da Fase 1, edite o ambiente em
> claude.ai/code → menu do ambiente → *Edit* → *Network access* e adicione esses dois domínios em
> *Allowed domains* (mantendo "Allow package managers" marcado). Passo a passo:
> https://code.claude.com/docs/en/cloud-environments#network-access
> Alternativa: baixar o recorte no seu computador e commitar o arquivo em `tools/map/raw/`.

---

## 5. Arquitetura

```
src/
  core/        loop do jogo, event bus, save/load, configurações
  shared/      contratos (tipos) usados por todos os módulos ← definidos na Fase 0
  world/       carregamento do mapa, geração de estradas/prédios, chunks, GPS (A*)
  vehicle/     física do caminhão e reboque, controles, câmeras, consumo, pneus, saúde dos componentes, falhas
  traffic/     IA de trânsito, semáforos, spawn/despawn, desvio de obstáculos, viaturas e policial orientando
  gameplay/    fretes, economia, postos, pedágios, níveis, concessionária, relógio, sono/hotel,
               blitz/CNH/penalidades, oficina/borracharia/guincho
  edu/         motor educacional: sandbox (Worker), simulador de Node, checagem TS, corretor, repetição espaçada
  ui/          HUD, menus, modais de aula/exercício/pergunta, editor (CodeMirror)
  audio/       motor, ambiente, efeitos
content/
  node/        m01…m08 — lições, exercícios e perguntas (arquivos .ts tipados)
  typescript/  m09…m14
public/map/    dados do mapa já processados
tools/map/     pipeline OSM → JSON
tests/e2e/     Playwright
```

### 5.1 Contratos (criados na Fase 0, para que as trilhas rodem em paralelo)

```ts
// src/shared/content.ts
export interface Lesson {
  id: string;                 // "node.m01.l02"
  moduleId: string;           // "node.m01"
  order: number;
  title: string;
  concepts: string[];
  sections: Array<
    | { kind: 'text'; markdown: string }
    | { kind: 'example'; code: string; language: 'js' | 'ts'; explanation?: string }
  >;
  checkQuestionIds: string[]; // checagem rápida antes do exercício
  exerciseIds: string[];
  debugExerciseIds: string[]; // usados nos consertos de pane
}

export interface Exercise {
  id: string;
  lessonId: string;
  kind: 'implement' | 'debug'; // debug: starterCode é um código com defeito para corrigir
  title: string;
  promptMarkdown: string;
  language: 'js' | 'ts';
  moduleSystem: 'commonjs' | 'esm';
  starterCode: string;
  solution: string;           // a CI garante que passa em todos os testes
  tests: Array<{ description: string; code: string }>; // roda após o código do jogador, com `assert`
  hints: string[];
  followUpQuestionIds: string[]; // perguntas sobre este exercício, usadas na blitz
  difficulty: 1 | 2 | 3;
}

export interface Question {
  id: string;
  lessonIds: string[];        // só aparece no pedágio depois dessas lições
  exerciseId?: string;        // preenchido nas perguntas de acompanhamento (blitz)
  kind: 'multiple-choice' | 'predict-output' | 'fill-blank' | 'true-false';
  prompt: string;
  code?: string;
  options?: string[];
  answer: string | number;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

// src/shared/map.ts
export type RoadKind = 'motorway' | 'trunk' | 'primary' | 'secondary' | 'tertiary' | 'residential' | 'service';
export interface MapData {
  meta: { bbox: [number, number, number, number]; scale: number; attribution: string };
  nodes: Array<{ id: string; x: number; z: number; y: number }>;
  roads: Array<{ id: string; nodeIds: string[]; kind: RoadKind; name?: string; ref?: string;
                 lanes: number; oneway: boolean; maxSpeedKmh: number }>;
  tolls: Array<{ id: string; roadId: string; nodeId: string; name: string; price: number }>;
  pois: Array<{ id: string; kind: 'fuel' | 'company' | 'dealer' | 'garage' | 'exam-center'
                | 'hotel' | 'mechanic' | 'tire-shop' | 'police-checkpoint';
                name: string; nodeId: string }>;
  trafficSignals: Array<{ id: string; nodeId: string }>;
  buildingChunks: string[];   // arquivos separados, carregados sob demanda
}

// src/shared/vehicle.ts
export type ComponentId = 'engine' | 'transmission' | 'brakes' | 'electrical';
export interface VehicleCondition {
  tires: Array<{ axle: number; wear: number; punctured: boolean }>; // wear 0 (novo) a 1 (careca)
  components: Record<ComponentId, number>;                          // saúde 0 a 1
  activeFault: null | { kind: 'sputter' | 'stall' | 'breakdown'; component: ComponentId };
}

// src/shared/player.ts
export interface DriverState {
  fatigue: number;            // 0 a 1
  licensePoints: number;      // CNH; >= 20 suspende
  licenseSuspended: boolean;
  recentExerciseIds: string[]; // base das perguntas da blitz
}

export type Penalty =
  | { kind: 'fine'; amount: number; reason: string }
  | { kind: 'license-points'; points: number; reason: string }
  | { kind: 'review'; lessonId: string };
```

Regras de qualidade do conteúdo (verificadas na CI):
- a `solution` de cada exercício passa em todos os testes; o `starterCode` falha em pelo menos um;
- exercícios TS também passam no type-check; testes podem usar `// @ts-expect-error` para exigir erro de tipo;
- toda pergunta referencia lições existentes; múltipla escolha tem `answer` válido;
- todo exercício de depuração tem `starterCode` falhando e `solution` passando, como os demais;
- todo exercício tem pelo menos 2 perguntas de acompanhamento;
- toda lição tem pelo menos 1 exercício, 1 exercício de depuração e 1 pergunta de checagem.

---

## 6. Fases para as sessões na nuvem

Cada fase = **uma sessão em claude.ai/code** neste repositório, terminando com um PR. Depois da Fase 0,
várias fases rodam **em paralelo**, cada uma em sua própria sessão.

```
Fase 0 (fundação) ──┬── Fase 1 Mapa ──────────────┬── Fase 6 Trânsito ──────────┐
                    ├── Fase 2 Caminhão ──────────┤                            │
                    ├── Fase 3 Motor educ. ───────┴── Fase 7 Gameplay núcleo ──┴── Fase 8 Sistemas de estrada
                    ├── Fase 4a–4d Conteúdo Node                                       │
                    └── Fase 5a–5c Conteúdo TS                    Fase 9 UI/áudio/ambiente ── Fase 10 Integração
```

| Fase | Sessões | Depende de | Entregáveis | Pronto quando |
|---|---|---|---|---|
| **0 Fundação** | 1 | — | Vite + TS estrito + Three.js, ESLint/Prettier, Vitest, Playwright, CI, deploy no Pages, hook de início de sessão (instala dependências), contratos de `src/shared/`, event bus, save, cena placeholder, script `validate:content` | `npm run lint && npm run typecheck && npm test && npm run e2e` passam; página publicada |
| **1 Mapa** | 1–2 | 0 + liberar rede | Pipeline OSM → JSON, malha de estradas, prédios, terreno, chunks, A*, minimapa, crédito OSM, hotéis/oficinas/borracharias/semáforos/pontos de blitz | Dá para "voar" pelo mapa; teste do A* entre Osasco e Caucaia do Alto |
| **2 Caminhão** | 2 | 0 | Física do caminhão + reboque, câmeras, controles (teclado/gamepad/volante), consumo, dano, desgaste de pneus (aderência, furo, estepe), saúde dos componentes e falhas (engasgo, motor apagando, pane), pisca-alerta | Dirigir numa pista de teste, engatar reboque, dar ré; testes de física, desgaste e falhas |
| **3 Motor educacional** | 1–2 | 0 | Worker com timeout, simulador de Node, CommonJS e ESM, checagem TS, corretor com `assert`, exercícios de depuração, perguntas de acompanhamento, repetição espaçada com revisão prioritária, modal de aula/exercício com CodeMirror | Exercícios de exemplo de JS e TS corrigidos corretamente; loop infinito é interrompido |
| **4a–4d Conteúdo Node** | 4 (M1–2, M3–4, M5–6, M7–8) | 0 | Lições, exercícios, exercícios de depuração, perguntas de checagem e de acompanhamento | `validate:content` passa |
| **5a–5c Conteúdo TS** | 3 (M9–10, M11–12, M13–14) | 0 | Idem, + projeto final | `validate:content` passa |
| **6 Trânsito** | 2 | 1, 2 | IA de veículos no grafo de ruas, semáforos, preferenciais, densidade por horário, spawn/despawn ao redor do jogador, reação a obstáculos e faixas bloqueadas, colisões, viaturas e policial orientando o trânsito | 150+ veículos a 60 fps; trânsito desvia de um caminhão parado na Castello |
| **7 Gameplay núcleo** | 2 | 1, 2, 3 | Relógio do jogo, fretes, economia, postos ↔ exercícios, pedágios ↔ perguntas, prova de nível, concessionária, guincho | Ciclo completo: aceitar frete → dirigir → abastecer → pedágio → entregar → subir de nível |
| **8 Sistemas de estrada** | 2 | 6, 7 | Blitz (parada, perguntas de acompanhamento, vistorias), CNH com pontos, suspensão e curso de reciclagem, cansaço e hotel com perguntas, táxi até o hotel, borracharia, oficina, conserto por exercício de depuração, polícia em pane perigosa | Testes e2e: ser parado na blitz e errar → multa e pontos; dormir no hotel; pane na rodovia → viatura e desvio |
| **9 UI, áudio e ambiente** | 1–2 | 7, 8 | HUD (cansaço, pneus, luzes de defeito, CNH), menus, configurações, tutorial, sons (motor, buzinas, sirene), ciclo dia/noite, acessibilidade | Jogável do menu ao fim do módulo 1 sem console aberto |
| **10 Integração e polimento** | 1–2 | todas | Balanceamento (frequência de blitz, falhas e sono), desempenho (60 fps em notebook comum), testes e2e do ciclo completo, deploy | Release v1.0 publicado |
| **11 Extras (opcional)** | — | 10 | Chuva, rádio, câmbio manual, conquistas, perseguição policial elaborada | — |

**Total estimado:** ~22–26 sessões, das quais até 10 podem rodar ao mesmo tempo logo após a Fase 0
(Fases 1, 2, 3, 4a–4d e 5a–5c).

### 6.1 Prompts prontos para colar em cada sessão

Todos começam igual:

> Leia `PLANO.md` e `CLAUDE.md`. Execute a **Fase X** descrita no plano. Siga os contratos de
> `src/shared/`. Antes de abrir o PR, rode lint, typecheck, testes e (se aplicável) `validate:content`
> e e2e. Abra um PR para o branch padrão com um resumo do que foi feito e do que ficou pendente.

Complementos por fase:
- **Fase 0:** "Configure também o hook SessionStart para instalar dependências nas sessões na nuvem e o
  workflow de deploy no GitHub Pages."
- **Fase 1:** "Os domínios do OSM já estão liberados na rede do ambiente. Versione os JSON gerados em `public/map/`."
- **Fase 2:** "Use uma pista de teste própria (sem depender do mapa real). Implemente as seções 2.1 e 2.11."
- **Fase 3:** "Inclua 2 lições de exemplo (uma JS, uma TS) só para teste; o conteúdo real vem das Fases 4 e 5."
- **Fases 4x/5x:** "Escreva o conteúdo dos módulos Mx–My. Lições curtas, didáticas, em PT-BR, com
  exemplos do universo do jogo. Mínimo por lição: 1 exercício, 1 exercício de depuração, 6 perguntas e
  2 perguntas de acompanhamento por exercício."
- **Fase 6:** "Implemente a seção 2.8 e a parte de trânsito da seção 2.12."
- **Fase 7:** "Integre mapa, caminhão e motor educacional; implemente as seções 2.2 a 2.7."
- **Fase 8:** "Implemente as seções 2.9 a 2.12 em cima do trânsito e do gameplay núcleo."

### 6.2 Como aproveitar bem os créditos da nuvem
- **Uma fase por sessão**, com escopo fechado: sessões menores erram menos e custam menos para corrigir.
- **Paralelize** as Fases 1–5 assim que a Fase 0 for mesclada; o conteúdo (4a–5c) é o trabalho mais
  paralelizável. As Fases 6 e 7 também podem rodar juntas.
- O `CLAUDE.md` e os contratos evitam que cada sessão gaste tempo redescobrindo o projeto.
- Os testes e o `validate:content` permitem que cada sessão prove que o trabalho funciona antes do PR,
  sem idas e voltas.
- Peça para a sessão **acompanhar o PR** (CI e revisões) e corrigir sozinha até ficar verde.
- Mescle os PRs em ordem (0 → 1/2/3 → 4/5 → 6/7 → 8 → 9 → 10) para evitar conflitos.

---

## 7. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Rede da nuvem bloqueia o OSM | Liberar os domínios ou commitar o extrato bruto |
| Desempenho do mapa real no navegador | Filtrar vias, chunks, LOD, prédios instanciados |
| Desempenho do trânsito | Veículos só num raio ao redor do jogador, modelos instanciados, IA simplificada longe da câmera |
| Excesso de punição deixar o jogo frustrante | Todas as frequências (blitz, falhas, sono, perguntas) em um arquivo de balanceamento; "modo instrutor" nas configurações para aliviar; avisos antecipados antes de cada penalidade |
| Jogador travado (sem combustível, CNH suspensa, pane, sono) | Guincho, táxi até o hotel, curso de reciclagem, conserto por exercício; tentativas ilimitadas e dicas pagas |
| Conteúdo com erro | CI valida solução × testes, starter falhando, referências entre lições, exercícios e perguntas |
| Código do jogador travar o jogo | Worker isolado com timeout e reinício |
| Escopo "idêntico ao ETS" grande demais | MVP nas Fases 0–10; extras na Fase 11 |
