#!/bin/bash
# Gera os modelos 3D com o Blender (como módulo Python: `pip install bpy pillow`) e comprime com meshopt.
#   PYTHON=/caminho/do/python-com-bpy tools/blender/build-models.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
PY="${PYTHON:-python3}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

build() {
  local script="$1" out="$2"
  "$PY" "tools/blender/$script" "$TMP/raw.glb"
  mkdir -p "$(dirname "$out")"
  npx --yes @gltf-transform/cli@4.5.1 optimize "$TMP/raw.glb" "$out" --compress meshopt --texture-compress false --simplify-error 0.0004
}

build quadradinho.py public/models/carros/quadradinho.glb
build personagem.py public/models/personagem/dev.glb
