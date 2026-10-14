"""
Gera a skin do dev a partir da skin "skaterMaleA" do Kenney (CC0): moletom roxo com </>, calça jeans
e tênis escuros. As regiões seguem o mapa UV do modelo characterMedium.

    python tools/skins/dev-skin.py public/models/personagem/skins/skaterMaleA.png public/models/personagem/skins/devMale.png
"""

import sys

from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
img = Image.open(SRC).convert("RGBA")
d = ImageDraw.Draw(img)

HOODIE = (98, 70, 160)
HOODIE_DARK = (78, 54, 130)
JEANS = (52, 74, 112)
JEANS_DARK = (40, 58, 90)
SHOE = (58, 62, 72)
PRINT = (245, 185, 66)

# Tronco e mangas (bloco inferior esquerdo): moletom liso, punho e barra mais escuros.
d.rectangle([0, 490, 610, 1024], fill=HOODIE)
for x0, x1 in ((0, 150), (490, 610)):  # mangas
    d.rectangle([x0, 980, x1, 1024], fill=HOODIE_DARK)  # punho
d.rectangle([150, 990, 490, 1024], fill=HOODIE_DARK)  # barra
d.rectangle([150, 490, 490, 520], fill=HOODIE_DARK)  # gola

# Estampa </> no peito.
font = None
for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"):
    try:
        font = ImageFont.truetype(path, 64)
        break
    except OSError:
        pass
d.text((320, 845), "</>", fill=PRINT, font=font, anchor="mm")  # no lugar da caveira original

# Calça (bloco inferior direito): jeans liso com costuras.
d.rectangle([611, 764, 1024, 1024], fill=JEANS)
for y in (800, 990):
    d.line([611, y, 1024, y], fill=JEANS_DARK, width=6)

# Tênis: troca o verde por cinza escuro, mantendo sola e cadarço brancos.
px = img.load()
for y in range(140, 480):
    for x in range(650, 810):
        r, g, b, a = px[x, y]
        if g > r + 40 and g > b:  # tons de verde
            shade = (g - 150) / 100
            px[x, y] = (int(SHOE[0] * (1 + shade * 0.3)), int(SHOE[1] * (1 + shade * 0.3)), int(SHOE[2] * (1 + shade * 0.3)), a)

img.save(OUT)
print("OK", OUT)
