# Créditos dos carros

| Arquivo           | No jogo         | Origem                                                                           | Licença                      |
| ----------------- | --------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| `quadradinho.glb` | Quadradinho 1.0 | Modelado pelo projeto (`tools/blender/quadradinho.py`)                           | do projeto                   |
| `quadradao.glb`   | Quadradão       | "Brazilian Car - Gol quadrado", de HanabLS: https://hanabls.itch.io/gol-quadrado | **não declarada** pelo autor |
| `safira.glb`      | Safira          | "Brazilian Car - Opala", de HanabLS: https://hanabls.itch.io/braziliancars-opala | **não declarada** pelo autor |

Os modelos do HanabLS foram baixados gratuitamente ("name your own price") e convertidos com
`tools/blender/importar_carro.py` (escala, orientação, cores dos pneus). Como a página não traz licença,
antes de publicar o jogo é preciso pedir autorização ao autor ou trocar esses modelos.

Comandos usados na conversão:

```bash
python tools/blender/importar_carro.py -- golQuadrado.fbx texture-gol.png 3.81 -Y public/models/carros/quadradao.glb
python tools/blender/importar_carro.py -- Opala.fbx texture-gol.png 4.57 -Y public/models/carros/safira.glb \
  "Cilindro.001:0.95,0.93>0.94,0.94;Cilindro.001:0.2,0.92>0.31,0.94;..."  # o mesmo para Cilindro.002 a .004
```
