#!/bin/bash
# Gera os modelos 3D com o Blender (como módulo Python: `pip install bpy pillow`).
#   PYTHON=/caminho/do/python-com-bpy tools/blender/build-models.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
PY="${PYTHON:-python3}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Carro do estagiário: modelado por script e comprimido com meshopt.
"$PY" tools/blender/quadradinho.py "$TMP/raw.glb"
npx --yes @gltf-transform/cli@4.5.1 optimize "$TMP/raw.glb" public/models/carros/quadradinho.glb \
  --compress meshopt --texture-compress false --simplify-error 0.0004

# Personagem: "Animated Characters 2" do Kenney (CC0), convertido com as animações.
curl -sSL -o "$TMP/ac2.zip" https://opengameart.org/sites/default/files/kenney_animated-characters-2.zip
unzip -q "$TMP/ac2.zip" -d "$TMP/ac2"
"$PY" tools/blender/kenney_personagem.py "$TMP/ac2" public/models/personagem/dev.glb
mkdir -p public/models/personagem/skins
cp "$TMP"/ac2/Skins/*.png public/models/personagem/skins/
"$PY" tools/skins/dev-skin.py public/models/personagem/skins/skaterMaleA.png public/models/personagem/skins/devMale.png
