# Freela na Estrada: Plano do Projeto

> **Status:** Fundação (Fase 0) e pivô de conceito (Fase 0b) prontos. Há uma prévia visual no estilo
> Slow Roads, o carro do estagiário (Quadradinho) modelado no Blender, o personagem (Kenney) com
> animações e os carros do trânsito. Próximas fases: 1 a 6, que podem rodar em paralelo.

Jogo de direção no navegador, ambientado em **Osasco e Cotia (SP)**. O protagonista é um **dev
freelancer**: dirige até os clientes, chega com o notebook e **coda as tasks de verdade**. Começa como
**estagiário**, com um carro caindo aos pedaços e jobs ruins ("dirigir 38 km para centralizar uma div
por R$ 35"), e evolui até **full stack** aprendendo HTML, CSS, JavaScript, Node.js e TypeScript.

| Situação no jogo       | O que o jogador precisa fazer                                                    |
| ---------------------- | -------------------------------------------------------------------------------- |
| Atender um cliente     | Resolver as tasks do job (exercícios) dentro do SLA                              |
| Abastecer no posto     | Resolver um exercício da lição atual                                             |
| Passar no pedágio      | Responder perguntas sobre o que já estudou                                       |
| Ser parado numa blitz  | Responder perguntas sobre os jobs e exercícios recentes (errou = multa e pontos) |
| Dormir (casa ou hotel) | Responder perguntas no check-in do hotel                                         |
| Consertar pane         | Chamar o mecânico (caro) ou corrigir um código com defeito (barato)              |
| Subir de senioridade   | Ter jobs suficientes, ser chamado (chance depende do SLA) e passar na entrevista |
| Comprar carro novo     | Dinheiro, senioridade mínima e um desafio de código na concessionária            |

> **Nota legal:** sem nomes, logos ou modelos de marcas reais (carros, empresas, apps). Os carros são
> fictícios, "inspirados em" modelos brasileiros. Nada do Euro Truck Simulator nem do Slow Roads (só
> inspiração). Dados do mapa: OpenStreetMap (ODbL), com "© colaboradores do OpenStreetMap" visível.

---

## 1. Decisões técnicas

| Tema                          | Decisão                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| Plataforma                    | Navegador (desktop), publicado no GitHub Pages                                                       |
| Linguagem                     | TypeScript estrito                                                                                   |
| Build                         | Vite                                                                                                 |
| 3D                            | Three.js "turbinado": céu e névoa coloridos, PBR, sombras, pós-processamento, modelos glTF (meshopt) |
| Modelos 3D                    | Blender por script (`tools/blender/`), packs CC0 (Kenney) e modelos de terceiros com crédito         |
| Física                        | Rapier (veículo por raycast), na Fase 3                                                              |
| Editor no notebook            | CodeMirror 6                                                                                         |
| Exercícios JS/TS              | Web Worker com "simulador de Node" (`src/edu/runner/`) e checagem real de tipos                      |
| Exercícios web (HTML/CSS/DOM) | Página isolada (iframe no jogo, Chromium no validador) com o runtime de testes `src/edu/web/`        |
| Persistência                  | `localStorage` + exportar/importar save em JSON                                                      |
| Testes                        | Vitest (unidade e conteúdo) + Playwright (ponta a ponta)                                             |
| Idioma                        | Interface e conteúdo em PT-BR; identificadores de código em inglês                                   |

---

## 2. O jogo

### 2.1 O dia do dev

1. **Manhã:** o app de freelas no celular (fictício) mostra os jobs do dia (`BALANCE.career.jobsPerDay`):
   cliente, bairro, distância, pagamento, SLA e senioridade exigida.
2. **Rota:** o jogador aceita jobs e dirige por Osasco e Cotia: trânsito, pedágios, blitz, posto, pneu.
3. **Chegada:** cena curta (estaciona, sai com o notebook, entra e senta). A câmera fecha no notebook.
4. **Notebook:** kanban com as tasks do job, chat do cliente, editor, preview do site/terminal e testes.
   O relógio do SLA começa a contar na chegada.
5. **Imprevistos** (`JobTwist`): no meio do job o cliente pede mais uma coisa ("é rapidinho"), às vezes
   sem pagar a mais. Vira uma task extra no kanban.
6. **Entrega:** pagamento (`jobPay`), avaliação em estrelas pelo SLA (`starsForSla`) e reputação.
7. **Noite:** voltar para casa ou dormir num hotel. O cansaço sobe com as horas dirigindo.

### 2.2 SLA, avaliação e efetivação

- `slaRatio = tempo gasto / SLA do job` (1 = no limite). Estrelas por faixa em `BALANCE.career.slaStars`.
- A média de estrelas é a reputação (aparece no perfil e destrava clientes melhores).
- Os últimos `slaWindow` jobs definem a **chance de ser chamado para a entrevista** do próximo degrau
  (`promotionChance`): base de 60% com SLA no limite; cada 10% de atraso médio derruba 15 pontos, cada
  10% adiantado sobe 15. Mínimo de jobs por degrau em `jobsForPromotion`.
- Regras puras e testadas em `src/gameplay/career.ts`.

### 2.3 Senioridade e trilhas

| Senioridade | Trilha estudada                       | Jobs típicos                                        | Carro típico      |
| ----------- | ------------------------------------- | --------------------------------------------------- | ----------------- |
| Estagiário  | **core**: HTML → CSS → JS             | centralizar div, trocar cor de botão, arrumar link  | Quadradinho 1.0   |
| Júnior      | escolhe **front** ou **back**         | landing page, formulário / script Node, API simples | Quadradão 1.6     |
| Pleno       | **typescript**                        | sistemas maiores, refatorações, tipar código legado | Safira 4.1, Vetor |
| Sênior      | libera a outra trilha (front ou back) | jobs grandes, code review, "apagar incêndio"        | Verso, Golfinho   |
| Full Stack  | **fullstack**: junta tudo             | os melhores clientes                                | Canção Híbrido    |

- A escolha front/back acontece na efetivação para Júnior (`promote(career, 'front' | 'back')`).
- `TRACK_PREREQUISITES` (em `src/shared/content.ts`) define o que cada trilha pode cobrar: front e back
  são ramos alternativos, então só o full stack cobra os dois.

### 2.4 Mecânicas de estrada (todas exigem código ou perguntas)

- **Combustível:** o tanque esvazia conforme distância e estilo de direção. No posto, a lição da vez e
  um exercício. Acabou na estrada: guincho até o posto (cobra taxa), e o exercício continua exigido.
- **Pedágio:** a cancela só abre com resposta certa. Perguntas só de lições já estudadas, com repetição
  espaçada. Errou: tarifa extra e outra pergunta, sempre com explicação.
- **Blitz:** em pontos fixos e aleatórios. Perguntas de acompanhamento sobre os **exercícios e jobs
  recentes** ("na sua função, o que acontece se...?"). Errou: multa e pontos na CNH; a lição volta para
  revisão. CNH suspensa (20 pontos): curso de reciclagem refazendo o que errou.
- **Sono:** a barra de cansaço sobe com as horas dirigindo. Aos 70% aviso; aos 90% efeitos visuais; aos
  100% microssono e limite de velocidade. Dormir em casa (de graça, se estiver perto) ou num hotel, com
  perguntas no check-in.
- **Pneus e mecânica:** pneus gastam (aderência, furo, estepe); motor, câmbio, freios e elétrica perdem
  saúde. Falhas progressivas: engasgo → motor apaga → pane. Conserto: mecânico caro ou **exercício de
  depuração** (barato). O Quadradinho já começa com 55% de conservação.
- **Pane em local perigoso:** viatura chega, põe cones e o policial orienta o trânsito.
- **Trânsito:** carros com IA (Kenney Car Kit por enquanto), semáforos do OSM, densidade por horário.
- **Relógio:** 1 minuto real = 10 minutos de jogo (`BALANCE.clock`). Controla SLA, sono e dia/noite.

### 2.5 Carros

Catálogo em `src/shared/vehicle.ts` (`CAR_MODELS`). Nomes fictícios; o campo `inspiredBy` é só para a
equipe e nunca aparece no jogo.

| No jogo         | Inspirado em     | Preço   | Senioridade | Modelo 3D                                  |
| --------------- | ---------------- | ------- | ----------- | ------------------------------------------ |
| Quadradinho 1.0 | Uno              | inicial | Estagiário  | `quadradinho.glb` (Blender, por script)    |
| Quadradão 1.6   | Gol quadrado     | 9.000   | Júnior      | `quadradao.glb` (HanabLS, ver CREDITOS.md) |
| Safira 4.1      | Opala            | 28.000  | Pleno       | `safira.glb` (HanabLS, ver CREDITOS.md)    |
| Vetor 2.0       | Vectra           | —       | Pleno       | a fazer                                    |
| Verso 1.6       | Versa            | —       | Sênior      | a fazer                                    |
| Golfinho Mini   | BYD Dolphin Mini | —       | Sênior      | a fazer                                    |
| Canção Híbrido  | BYD Song         | —       | Full Stack  | a fazer                                    |

> ⚠️ Os modelos do HanabLS não declaram licença. Antes de publicar o jogo, pedir autorização ao autor ou
> trocar por modelos próprios.

Convenção dos glTF: frente em +X, materiais com nome fixo (`Paint` recebe a cor personalizada, `Glass`,
`Lens`...), rodas `Wheel_FL/FR/RL/RR` com origem no cubo. Ao otimizar com `gltf-transform`, use
`--palette false --join-named false` para não perder esses nomes.

### 2.6 Personalização

- **Dev:** skin do personagem (Kenney Animated Characters 2, CC0; skins em
  `public/models/personagem/skins/`), nome, apelido, bio.
- **Carro:** cor, rodas, adesivos, buzina (`CarCustomization`).
- **Notebook:** tema, fonte, wallpaper, adesivos (`NotebookSetup`).

### 2.7 Visual

Referência: Slow Roads. Estrada aberta, morros em camadas, névoa colorida, árvores fotográficas
(EZ-Tree), terra vermelha na beira, golden hour e crepúsculo roxo. As prévias ficam em `preview/`
(`estilo.html`, `garagem.html`, `provador.html`, `telas.html`).

---

## 3. Currículo

Cada lição: **conceito → exemplos executáveis → checagem rápida → exercício(s)**. Cada exercício tem
perguntas de acompanhamento (blitz); cada lição tem um exercício de depuração (consertos). Os **jobs**
de cada módulo usam o que ele ensina.

| Trilha       | Módulos (sugestão)                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`       | m01 HTML básico · m02 CSS: seletores, cores, box model · m03 CSS: flexbox e grid · m04 JS: variáveis, tipos, operadores · m05 JS: controle e funções · m06 JS: arrays, objetos e DOM básico |
| `front`      | m01 DOM e eventos · m02 formulários e validação · m03 layout responsivo e acessibilidade · m04 fetch, async/await e APIs                                                                    |
| `back`       | m01 Node: módulos, `process`, `fs` · m02 assíncrono e eventos · m03 HTTP e APIs (conceitual + simulado) · m04 dados: JSON, validação, erros                                                 |
| `typescript` | m01 tipos básicos e inferência · m02 objetos, uniões e narrowing · m03 genéricos e utility types                                                                                            |
| `fullstack`  | m01 front + back conversando (contratos tipados) · m02 projeto final: o sistema de jobs do próprio jogo                                                                                     |

Exercícios web (`language: 'web'`) cobrem HTML, CSS e DOM: o validador abre a página no Chromium e roda
os testes dentro dela, com `box(seletor)`, `style(seletor)`, `click`, `wait` e `assert.near` para medidas.

---

## 4. Mapa de Osasco e Cotia

- **Fonte:** OpenStreetMap. Pipeline em `tools/map/` gera `public/map/*.json` versionado (o jogo não
  depende de rede). A rede do ambiente na nuvem já está liberada.
- **Recorte:** lat −23,47 a −23,72 / lon −47,05 a −46,73, incluindo o corredor
  Carapicuíba/Barueri/Jandira que liga Osasco a Cotia.
- **Vias:** Castello Branco, Raposo Tavares, Rodoanel Oeste, Av. dos Autonomistas, Estrada de Caucaia e
  avenidas centrais; ruas residenciais só perto dos pontos de interesse.
- **Pontos (`PoiKind`):** postos, escritórios de clientes, coworkings, a casa do dev, concessionárias,
  centro de entrevistas, hotéis, oficinas, borracharias, pontos de blitz. Pedágios e semáforos do OSM.
- **Clientes:** negócios fictícios em pontos reais (padaria no centro de Osasco, imobiliária na Granja
  Viana, chácara em Caucaia do Alto...).

---

## 5. Arquitetura

```
src/
  shared/    contratos: content, jobs, profile, vehicle, map, player, save, events, balance
  core/      EventBus, GameLoop, SaveManager
  edu/       runner/ (simulador de Node + TS), web/ (runtime dos exercícios web), validation.ts
  gameplay/  regras puras: career.ts (SLA, estrelas, promoção); depois jobs, economia, estrada
  render/    cena Three.js (hoje: protótipo com o Quadradinho)
  world/ vehicle/ traffic/ ui/ audio/   (fases seguintes)
content/<trilha>/<mNN-slug>/index.ts    módulos do currículo (ContentModule com lições, exercícios, perguntas e jobs)
public/models/                          carros, personagem, trânsito (glTF)
tools/                                  validador de conteúdo, web runner, Blender, skins
preview/                                prévias visuais e captura de tela
```

### 5.1 Contratos principais

- `ContentModule { id: 'core.m01', track, order (dentro da trilha), seniority, lessons, exercises, questions, jobs }`
- `Exercise = CodeExercise (language 'js' | 'ts') | WebExercise (language 'web', starterFiles, solutionFiles, editableFiles, viewport)`
- `JobTemplate { id: 'core.m01.j01', client, seniority, path?, pay, slaMinutes, taskExerciseIds, twists?, chat }`
- `SaveData { profile, career, cars, activeCarIndex, notebook, driver, education, completedJobIds, ... }`
- Eventos `job:accepted | arrived | task-done | scope-change | delivered` e `promotion:interview | result`.

### 5.2 Regras de qualidade do conteúdo (`npm run validate:content`)

- solução passa em todos os testes; código inicial falha em pelo menos um (JS/TS no simulador, web no Chromium);
- perguntas "qual a saída?" conferidas no simulador e no Node real;
- referências (lições, exercícios, perguntas, tasks dos jobs) só para o que o jogador já estudou:
  mesma trilha com ordem menor ou igual, ou trilha pré-requisito (`TRACK_PREREQUISITES`);
- jobs: id `<módulo>.jNN`, pagamento e SLA positivos, pelo menos 1 task, imprevistos válidos, chat com
  falas de chegada e de entrega, senioridade não menor que a do módulo;
- mínimos por lição: 1 exercício, 1 de depuração, 1 pergunta de checagem, 6 perguntas gerais; 2
  perguntas de acompanhamento por exercício.

---

## 6. Fases

Cada fase = uma sessão em claude.ai/code neste repositório, terminando com um PR. Várias rodam em
paralelo.

| Fase               | Conteúdo                                                                                                                     | Depende de |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **0 Fundação** ✅  | Vite, TS, Three.js, lint, testes, CI, contratos, runner de exercícios                                                        | —          |
| **0b Pivô** ✅     | Conceito Freela na Estrada, contratos novos, exercícios web, regras de carreira, carro no protótipo                          | 0          |
| **1 Mapa**         | Pipeline OSM, estradas, prédios, terreno, chunks, A*, minimapa, crédito OSM, pontos de interesse                             | 0b         |
| **2 Visual**       | Estilo Slow Roads no jogo (céu, névoa, terreno, árvores EZ-Tree), presets de qualidade, carregamento glTF, tela de créditos  | 0b         |
| **3 Carro**        | Física Rapier, câmeras (perseguição, cabine), controles, consumo, desgaste, falhas, pisca-alerta                             | 0b         |
| **4 Personagem**   | Criador do dev (skins Kenney), animações (andar, sentar, digitar), cena de chegada no cliente                                | 2          |
| **5 Notebook**     | CodeMirror, kanban, chat do cliente, preview web em iframe (mesmo runtime de `src/edu/web/`), terminal Node em Worker, temas | 0b         |
| **6a–6e Conteúdo** | core (2 sessões), front, back, typescript, fullstack, com jobs                                                               | 0b         |
| **7 Trânsito**     | IA, semáforos, polícia orientando o trânsito em pane perigosa                                                                | 1, 3       |
| **8 Gameplay**     | Dia, app de jobs, SLA, pagamento, reputação, promoção e entrevista, posto, pedágio, concessionária, personalização           | 1, 3, 5    |
| **9 Estrada**      | Blitz, CNH, sono (casa/hotel), pane e oficina                                                                                | 7, 8       |
| **10 UI e áudio**  | HUD, menus, celular, dia/noite, sons                                                                                         | 8, 9       |
| **11 Integração**  | Balanceamento, desempenho, e2e do ciclo completo, release                                                                    | todas      |

### 6.1 Prompt base para cada sessão

> Leia `PLANO.md` e `CLAUDE.md`. Execute a **Fase X** do plano, seguindo os contratos de `src/shared/`.
> Antes do PR rode format:check, lint, typecheck, test, validate:content e (se mexeu em jogo/UI) e2e.

Complementos:

- **6x Conteúdo:** "Escreva os módulos da trilha X. Lições curtas em PT-BR, com exemplos do universo
  do dev freelancer. Mínimo por lição: 1 exercício, 1 de depuração, 6 perguntas, 2 de acompanhamento por
  exercício. Cada módulo com 2 a 4 jobs. Para HTML/CSS/DOM use exercícios web."
- **8 Gameplay:** "Use `src/gameplay/career.ts` para SLA, estrelas e promoção."

---

## 7. Riscos

| Risco                                     | Mitigação                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| Licença dos modelos de terceiros          | Só CC0/CC-BY com crédito; HanabLS precisa de autorização antes de publicar                  |
| Desempenho (mapa, trânsito, árvores)      | Chunks, LOD, instancing, meshopt; orçamento de ~50 MB de assets (o Pages não serve Git LFS) |
| Punição demais deixar o jogo frustrante   | Tudo em `balance.ts`; avisos antes das penalidades; tentativas ilimitadas e dicas pagas     |
| Jogador travado (sem gasolina, CNH, pane) | Guincho, táxi, reciclagem, conserto por exercício                                           |
| Conteúdo com erro                         | CI valida solução × testes, starter falhando, referências e regras de trilha                |
| Código do jogador travar o jogo           | Worker/iframe isolados com timeout                                                          |
| Realismo gráfico                          | Nível "bom para navegador", não AAA; o estilo Slow Roads esconde bem as limitações          |
