# Freela na Estrada

Jogo de direção no navegador em que você é um **dev freelancer em Osasco e Cotia (SP)**. Você começa
como **estagiário**, com um carro caindo aos pedaços, aceitando jobs ruins ("dirigir 38 km para
centralizar uma div por R$ 35"), chega no cliente com o notebook e **coda as tasks de verdade**. Para
crescer, aprende **HTML, CSS, JavaScript, Node.js e TypeScript**.

> Status: **em desenvolvimento**. A fundação técnica (Fase 0) está pronta e há uma prévia visual do
> estilo do jogo. O `npm run dev` ainda mostra o protótipo antigo; o pivô para o conceito novo é o
> próximo passo. O plano detalhado está em [`PLANO.md`](PLANO.md) (em atualização para o conceito novo).

## O jogo

**O dia do dev**

1. De manhã, o app de freelas no celular mostra os jobs do dia: cliente, bairro, distância, pagamento e
   prazo.
2. Você monta a rota e dirige por Osasco e Cotia: trânsito, pedágios, blitz, posto e pneu careca.
3. No cliente, estaciona, entra com o notebook e abre o editor. Ali estão o kanban de tasks, o chat do
   cliente (que adora aumentar o escopo), o preview do site e os testes.
4. Entregou: recebe o pagamento e uma avaliação em estrelas.

**SLA e efetivação**

- Cada task tem um tempo-alvo. Entregar dentro do SLA, sem estourar o prazo do cliente, sobe sua
  reputação.
- Como estagiário, o desempenho no SLA pesa na chance de ser **efetivado** como Júnior. Ficar muito
  abaixo dificulta a efetivação.

**Senioridade e trilhas**

| Senioridade | O que estuda                  | Jobs típicos                                        |
| ----------- | ----------------------------- | --------------------------------------------------- |
| Estagiário  | HTML → CSS → JS               | centralizar div, trocar cor de botão, arrumar link  |
| Júnior      | escolhe **Front** ou **Back** | landing page, formulário / script Node, API simples |
| Pleno       | TypeScript                    | sistemas maiores, refatorações                      |
| Sênior      | libera a outra trilha         | jobs grandes, code review                           |
| Full Stack  | front + back + TS             | os melhores clientes                                |

**Nada vem de graça: tudo exige código ou perguntas**

| Situação        | Para seguir                                                         |
| --------------- | ------------------------------------------------------------------- |
| Abastecer       | resolver um exercício                                               |
| Pedágio e blitz | responder perguntas sobre o que estudou e os jobs recentes          |
| Sono e hotel    | responder perguntas no check-in                                     |
| Pane do carro   | chamar o mecânico (caro) ou corrigir um código com defeito (barato) |
| Promoção        | entrevista técnica                                                  |
| Carro novo      | dinheiro e um desafio de código                                     |

**Carros**

São modelos fictícios inspirados em carros brasileiros, sem nomes nem logos reais. Os nomes ainda são
provisórios.

| Inspirado em     | No jogo         | Senioridade  |
| ---------------- | --------------- | ------------ |
| Uno              | Quadradinho 1.0 | Estagiário   |
| Gol              | Bolinha         | Júnior       |
| Vectra           | Vetor           | Pleno        |
| Versa            | Verso           | Pleno/Sênior |
| BYD Dolphin Mini | Golfinho Mini   | Sênior       |
| BYD Song         | Canção          | Full Stack   |

**Personalização:** aparência do dev, carro (cor, rodas, adesivos, buzina), notebook (tema, fonte,
adesivos), nome, apelido e bio.

## Visual

O estilo é de "estrada aberta", com referência no Slow Roads:

- relevo com morros em camadas;
- névoa colorida;
- árvores com casca e folhas fotográficas (mata, pinus e eucalipto);
- terra vermelha na beira da estrada;
- crepúsculo roxo.

Tudo é feito em Three.js e roda no navegador. Os carros e o personagem serão modelados no Blender (por
script) e exportados em glTF.

Para ver a prévia:

```bash
npm install
npm run dev
# abra http://localhost:5173/preview/estilo.html            (fim de tarde, atrás do carro)
#      http://localhost:5173/preview/estilo.html?view=vista (vista do alto)
#      http://localhost:5173/preview/estilo.html?time=dusk  (crepúsculo)
#      http://localhost:5173/preview/estilo.html?view=dentro (de dentro do carro)
#      http://localhost:5173/preview/garagem.html?angulo=frente&cor=8fb0c4 (carro em estúdio; também tras, lado, dentro)
#      http://localhost:5173/preview/provador.html?cabelo=cacheado&roupa=camiseta&pele=6f4430 (o dev; veja as opções no topo de preview/provador.ts)
#      http://localhost:5173/preview/telas.html?tela=app    (também: notebook, criador)
```

Para gerar as imagens da prévia, rode `npx tsx preview/capture.ts <pasta> "estilo.html?view=vista"`.

Os carros são gerados por script no Blender (o Blender como módulo Python):

```bash
pip install bpy pillow
python tools/blender/quadradinho.py public/models/carros/quadradinho.glb
tools/blender/build-models.sh   # carro + personagem (baixa o pacote do Kenney)
```

## Desenvolvimento

```bash
npm install
npm run dev               # http://localhost:5173
npm run format:check
npm run lint
npm run typecheck
npm test                  # unidade (Vitest)
npm run validate:content  # regras do conteúdo didático
npm run e2e               # navegador (Playwright)
```

| Pasta                   | O que tem                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| `src/shared/`           | contratos entre os módulos e `balance.ts` (todos os números de balanceamento)                       |
| `src/core/`             | barramento de eventos, loop do jogo, save                                                           |
| `src/edu/runner/`       | executor de exercícios que imita o Node (fs, path, events, assert, timers) e checa tipos TypeScript |
| `src/edu/validation.ts` | regras de qualidade do conteúdo (`content/README.md` explica como escrever)                         |
| `preview/`              | prévias visuais (estrada, rua e telas) e o script de captura                                        |
| `tools/blender/`        | carros modelados por script no Blender, exportados em glTF para `public/models/`                    |

## Créditos

- Dados de mapa: © colaboradores do OpenStreetMap (ODbL).
- 3D: [Three.js](https://threejs.org) (MIT).
- Árvores e texturas de casca, folhas, grama e terra: [EZ-Tree](https://github.com/dgreenheck/ez-tree),
  de Daniel Greenheck (MIT).
- Personagem e carros do trânsito: [Kenney](https://www.kenney.nl) (CC0): Animated Characters 2 e Car Kit.
- Inspiração visual: Slow Roads. Nenhum código ou asset do jogo é usado.
