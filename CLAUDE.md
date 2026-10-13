# Euro Code

Simulador de caminhão (inspirado em Euro Truck Simulator) em Osasco/Cotia, onde abastecer, passar em
pedágios, subir de nível e comprar caminhões exige aprender JavaScript (Node.js) e depois TypeScript.
O plano completo, as fases e os contratos estão em `PLANO.md` — leia antes de começar.

## Convenções

- Interface e conteúdo didático em PT-BR; identificadores de código em inglês.
- TypeScript estrito em todo o código do jogo. Sem `any` fora de testes.
- Os tipos em `src/shared/` são o contrato entre módulos; mudá-los exige atualizar todos os usos no mesmo PR.
- Conteúdo didático fica em `content/` como arquivos `.ts` que exportam objetos tipados (`Lesson`,
  `Exercise`, `Question`).
- Nada de nomes, logos, modelos ou sons do Euro Truck Simulator, nem de marcas reais de caminhões ou
  empresas. Empresas do jogo são fictícias.
- Dados do mapa vêm do OpenStreetMap: manter o crédito "© colaboradores do OpenStreetMap" visível no jogo.

## Antes de abrir um PR

Rode: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`,
`npm run validate:content` e, se mexeu em fluxo de jogo ou UI, `npm run e2e`.
O Chromium já vem instalado nas sessões na nuvem; não rode `playwright install`.

## Mapa do código

- `src/shared/`: contratos (conteúdo, mapa, caminhão, motorista, save, eventos) e `balance.ts` com todos os números de balanceamento.
- `src/core/`: `EventBus` tipado, `GameLoop` de passo fixo, `SaveManager` (localStorage com exportar/importar).
- `src/edu/runner/`: executor de exercícios que imita o Node (`fs` em memória, `path`, `events`, `assert`, timers, CommonJS/ESM) e checa tipos TypeScript de verdade.
- `src/edu/validation.ts` + `tools/validate-content.ts`: regras de qualidade do conteúdo. Guia de escrita em `content/README.md`.
- `src/render/`: cena Three.js. Hoje é um protótipo; o mapa real entra na Fase 1 e o caminhão com física na Fase 2.
- Para ver o jogo rodando: `npm run dev`. Nas sessões na nuvem o WebGL roda por software (FPS baixo é esperado).
