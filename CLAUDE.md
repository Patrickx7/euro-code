# Freela na Estrada

Jogo de direção no navegador em Osasco/Cotia: o jogador é um dev freelancer que dirige até os clientes
e resolve as tasks em HTML, CSS, JavaScript, Node.js e TypeScript, subindo de estagiário a full stack.
Abastecer, pedágio, blitz, hotel, conserto, promoção e compra de carro exigem código ou perguntas.
O plano completo, as fases e os contratos estão em `PLANO.md`; leia antes de começar.

## Convenções

- Interface e conteúdo didático em PT-BR; identificadores de código em inglês.
- TypeScript estrito em todo o código do jogo. Sem `any` fora de testes.
- Os tipos em `src/shared/` são o contrato entre módulos; mudá-los exige atualizar todos os usos no mesmo PR.
- Conteúdo didático fica em `content/<trilha>/<mNN-slug>/index.ts`, exportando um `ContentModule`
  (lições, exercícios, perguntas e jobs). Guia em `content/README.md`.
- Nada de nomes, logos ou modelos de marcas reais (carros, empresas, apps), nem do Euro Truck Simulator
  ou do Slow Roads. Carros e clientes são fictícios (`CarModel.inspiredBy` nunca aparece no jogo).
- Dados do mapa vêm do OpenStreetMap: manter o crédito "© colaboradores do OpenStreetMap" visível no jogo.
- Assets de terceiros só com licença clara e crédito no README (os do HanabLS ainda precisam de autorização).

## Antes de abrir um PR

Rode: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`,
`npm run validate:content` e, se mexeu em fluxo de jogo ou UI, `npm run e2e`.
O Chromium já vem instalado nas sessões na nuvem; não rode `playwright install`.

## Mapa do código

- `src/shared/`: contratos (conteúdo, jobs, perfil/carreira, carro, mapa, motorista, save, eventos) e `balance.ts` com todos os números de balanceamento.
- `src/core/`: `EventBus` tipado, `GameLoop` de passo fixo, `SaveManager` (localStorage com exportar/importar).
- `src/edu/runner/`: executor de exercícios JS/TS que imita o Node (`fs` em memória, `path`, `events`, `assert`, timers, CommonJS/ESM) e checa tipos TypeScript de verdade.
- `src/edu/web/`: runtime dos exercícios web (HTML/CSS/DOM), injetado na página do exercício; `tools/web-runner.ts` roda no Chromium para o validador e os testes.
- `src/edu/validation.ts` + `tools/validate-content.ts`: regras de qualidade do conteúdo, dos jobs e das trilhas.
- `src/gameplay/career.ts`: SLA, estrelas, reputação, chance de promoção e escolha de trilha (funções puras).
- `src/render/open-road/`: cena no estilo Slow Roads (relevo, estrada em circuito, vegetação em tiles, céu, névoa, pós-processamento) com presets de qualidade (`?qualidade=baixa|media|alta`). O circuito é provisório: o mapa real entra na Fase 1 e a física na Fase 3. `src/render/car.ts` carrega os carros glTF.
- `src/edu/questions.ts`: correção das perguntas (normaliza código e saída).
- `preview/`: prévias visuais (estrada estilo Slow Roads, garagem, provador do personagem, telas) e `capture.ts`.
- `tools/blender/`: modelos gerados por script no Blender (`bpy`). Otimize glTF com `--palette false --join-named false` para manter os nomes de materiais e rodas.
- Para ver o jogo rodando: `npm run dev`. Nas sessões na nuvem o WebGL roda por software (FPS baixo é esperado; use `?qualidade=baixa`, como o e2e).
