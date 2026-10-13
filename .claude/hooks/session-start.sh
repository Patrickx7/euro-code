#!/bin/bash
# Prepara as sessões do Claude Code na nuvem: instala as dependências para que lint, typecheck,
# testes e e2e funcionem logo no começo. Não roda em máquinas locais.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# O Chromium já vem instalado na nuvem (PLAYWRIGHT_BROWSERS_PATH); nunca baixar outro.
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
npm install --no-audit --no-fund
