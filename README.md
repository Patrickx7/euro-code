# Euro Code

Simulador de caminhão em **Osasco e Cotia (SP)** em que, para seguir viagem, você aprende **JavaScript com Node.js e depois TypeScript**: abastecer, passar em pedágios, enfrentar blitz, dormir em hotéis, consertar o caminhão, subir de nível e comprar caminhões novos exige estudar e resolver exercícios.

Inspirado em simuladores de caminhão como o Euro Truck Simulator, mas com marca, modelos e empresas próprios. O plano completo está em [`PLANO.md`](PLANO.md).

## Como rodar

```bash
npm install
npm run dev          # jogo em http://localhost:5173
```

## Verificações

```bash
npm run format:check
npm run lint
npm run typecheck
npm test               # unidade (Vitest)
npm run validate:content   # regras do conteúdo didático
npm run e2e            # navegador (Playwright)
```

## Créditos

Dados de mapa: © colaboradores do OpenStreetMap (ODbL). Três.js para o 3D.
