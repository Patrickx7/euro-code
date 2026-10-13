# Euro Code — Plano do Projeto

Simulador de caminhão no estilo *Euro Truck Simulator*, ambientado em **Osasco e Cotia (SP)**, em que o
jogador aprende **JavaScript com Node.js e migra até TypeScript** para manter o caminhão rodando:

| Ação no jogo | O que o jogador precisa fazer |
|---|---|
| Abastecer no posto | Estudar a lição da vez e resolver o exercício de código |
| Passar no pedágio | Responder corretamente perguntas sobre o que já estudou |
| Subir de nível | Passar na "Prova de Habilitação" do módulo atual |
| Comprar caminhão novo | Vencer o desafio técnico da concessionária |

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

### 2.7 Mapa de progressão (níveis × currículo)

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
exercício(s)**. Total estimado: ~70 lições, ~90 exercícios, ~400 perguntas.

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
  vehicle/     física do caminhão e reboque, controles, câmeras, consumo
  gameplay/    fretes, economia, postos, pedágios, níveis, concessionária, multas
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
}

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  promptMarkdown: string;
  language: 'js' | 'ts';
  moduleSystem: 'commonjs' | 'esm';
  starterCode: string;
  solution: string;           // a CI garante que passa em todos os testes
  tests: Array<{ description: string; code: string }>; // roda após o código do jogador, com `assert`
  hints: string[];
  difficulty: 1 | 2 | 3;
}

export interface Question {
  id: string;
  lessonIds: string[];        // só aparece no pedágio depois dessas lições
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
  pois: Array<{ id: string; kind: 'fuel' | 'company' | 'dealer' | 'garage' | 'exam-center';
                name: string; nodeId: string }>;
  buildingChunks: string[];   // arquivos separados, carregados sob demanda
}
```

Regras de qualidade do conteúdo (verificadas na CI):
- a `solution` de cada exercício passa em todos os testes; o `starterCode` falha em pelo menos um;
- exercícios TS também passam no type-check; testes podem usar `// @ts-expect-error` para exigir erro de tipo;
- toda pergunta referencia lições existentes; múltipla escolha tem `answer` válido;
- toda lição tem pelo menos 1 exercício e 1 pergunta de checagem.

---

## 6. Fases para as sessões na nuvem

Cada fase = **uma sessão em claude.ai/code** neste repositório, terminando com um PR. Depois da Fase 0,
várias fases rodam **em paralelo**, cada uma em sua própria sessão.

```
Fase 0 (fundação) ──┬── Fase 1 Mapa ───────────┐
                    ├── Fase 2 Caminhão ───────┤
                    ├── Fase 3 Motor educ. ────┼── Fase 6 Gameplay ── Fase 7 UI/Áudio ── Fase 8 Integração
                    ├── Fase 4a–4d Conteúdo Node ┤
                    └── Fase 5a–5c Conteúdo TS ──┘
```

| Fase | Sessões | Depende de | Entregáveis | Pronto quando |
|---|---|---|---|---|
| **0 Fundação** | 1 | — | Vite + TS estrito + Three.js, ESLint/Prettier, Vitest, Playwright, CI, deploy no Pages, hook de início de sessão (instala dependências), contratos de `src/shared/`, event bus, save, cena placeholder, script `validate:content` | `npm run lint && npm run typecheck && npm test && npm run e2e` passam; página publicada |
| **1 Mapa** | 1–2 | 0 + liberar rede | Pipeline OSM → JSON, malha de estradas, prédios, terreno, chunks, A*, minimapa, crédito OSM | Dá para "voar" pelo mapa; teste do A* entre Osasco e Caucaia do Alto |
| **2 Caminhão** | 1–2 | 0 | Física do caminhão + reboque, câmeras, controles (teclado/gamepad/volante), consumo, dano | Dirigir numa pista de teste, engatar reboque, dar ré; testes de física |
| **3 Motor educacional** | 1–2 | 0 | Worker com timeout, simulador de Node, CommonJS e ESM, checagem TS, corretor com `assert`, repetição espaçada, modal de aula/exercício com CodeMirror | Exercícios de exemplo de JS e TS corrigidos corretamente; loop infinito é interrompido |
| **4a–4d Conteúdo Node** | 4 (M1–2, M3–4, M5–6, M7–8) | 0 | Lições, exercícios e perguntas | `validate:content` passa |
| **5a–5c Conteúdo TS** | 3 (M9–10, M11–12, M13–14) | 0 | Idem, + projeto final | `validate:content` passa |
| **6 Gameplay** | 2 | 1, 2, 3 | Fretes, economia, postos ↔ exercícios, pedágios ↔ perguntas, prova de nível, concessionária, guincho, multas | Ciclo completo: aceitar frete → dirigir → abastecer → pedágio → entregar → subir de nível |
| **7 UI e áudio** | 1 | 6 | HUD, menus, configurações, tutorial inicial, sons, acessibilidade (tamanho de fonte, contraste) | Jogável do menu ao fim do módulo 1 sem console aberto |
| **8 Integração e polimento** | 1–2 | todas | Balanceamento, desempenho (60 fps em notebook comum), testes e2e do ciclo completo, deploy | Release v1.0 publicado |
| **9 Extras (opcional)** | — | 8 | Dia/noite, chuva, tráfego com IA, rádio, câmbio manual, conquistas | — |

**Total estimado:** ~16–20 sessões, das quais até 9 podem rodar ao mesmo tempo logo após a Fase 0.

### 6.1 Prompts prontos para colar em cada sessão

Todos começam igual:

> Leia `PLANO.md` e `CLAUDE.md`. Execute a **Fase X** descrita no plano. Siga os contratos de
> `src/shared/`. Antes de abrir o PR, rode lint, typecheck, testes e (se aplicável) `validate:content`
> e e2e. Abra um PR para o branch padrão com um resumo do que foi feito e do que ficou pendente.

Complementos por fase:
- **Fase 0:** "Configure também o hook SessionStart para instalar dependências nas sessões na nuvem e o
  workflow de deploy no GitHub Pages."
- **Fase 1:** "Os domínios do OSM já estão liberados na rede do ambiente. Versione os JSON gerados em `public/map/`."
- **Fase 2:** "Use uma pista de teste própria (sem depender do mapa real)."
- **Fase 3:** "Inclua 2 lições de exemplo (uma JS, uma TS) só para teste; o conteúdo real vem das Fases 4 e 5."
- **Fases 4x/5x:** "Escreva o conteúdo dos módulos Mx–My. Lições curtas, didáticas, em PT-BR, com
  exemplos do universo do jogo. Mínimo por lição: 1 exercício e 6 perguntas."
- **Fase 6:** "Integre mapa, caminhão e motor educacional; implemente as regras da seção 2."

### 6.2 Como aproveitar bem os créditos da nuvem
- **Uma fase por sessão**, com escopo fechado: sessões menores erram menos e custam menos para corrigir.
- **Paralelize** as Fases 1–5 assim que a Fase 0 for mesclada; o conteúdo (4a–5c) é o trabalho mais
  paralelizável.
- O `CLAUDE.md` e os contratos evitam que cada sessão gaste tempo redescobrindo o projeto.
- Os testes e o `validate:content` permitem que cada sessão prove que o trabalho funciona antes do PR,
  sem idas e voltas.
- Peça para a sessão **acompanhar o PR** (CI e revisões) e corrigir sozinha até ficar verde.
- Mescle os PRs em ordem (0 → 1/2/3 → 4/5 → 6 → 7 → 8) para evitar conflitos.

---

## 7. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Rede da nuvem bloqueia o OSM | Liberar os domínios ou commitar o extrato bruto |
| Desempenho do mapa real no navegador | Filtrar vias, chunks, LOD, prédios instanciados |
| Jogador travado sem combustível | Guincho + dicas pagas + tentativas ilimitadas |
| Conteúdo com erro | CI valida solução × testes, starter falhando, referências entre lições e perguntas |
| Código do jogador travar o jogo | Worker isolado com timeout e reinício |
| Escopo "idêntico ao ETS" grande demais | MVP nas Fases 0–8; extras na Fase 9 |
