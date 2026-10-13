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
Rode (scripts criados na Fase 0): `npm run lint`, `npm run typecheck`, `npm test`,
`npm run validate:content` e, se mexeu em fluxo de jogo ou UI, `npm run e2e`.
O Chromium já vem instalado nas sessões na nuvem; não rode `playwright install`.
