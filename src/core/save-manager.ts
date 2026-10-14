import { createNewSave, SAVE_VERSION, type SaveData } from '../shared/save';

/** Subconjunto de `Storage`, para poder trocar o `localStorage` nos testes. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const SAVE_KEY = 'euro-code:save';

export class SaveFormatError extends Error {
  override name = 'SaveFormatError';
}

/** Lê e valida um save em JSON (do armazenamento ou de um arquivo importado). */
export function parseSave(json: string): SaveData {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new SaveFormatError('O arquivo de save não é um JSON válido.');
  }
  if (typeof data !== 'object' || data === null || !('version' in data)) {
    throw new SaveFormatError('O arquivo não parece ser um save do Euro Code.');
  }
  if (data.version !== SAVE_VERSION) {
    // Quando SAVE_VERSION mudar, as migrações entram aqui.
    throw new SaveFormatError(`Versão de save não suportada: ${String(data.version)}.`);
  }
  const save = data as SaveData;
  if (
    typeof save.money !== 'number' ||
    typeof save.career !== 'object' ||
    !Array.isArray(save.cars) ||
    typeof save.education !== 'object'
  ) {
    throw new SaveFormatError('O save está incompleto ou corrompido.');
  }
  return save;
}

/**
 * Salva e carrega o jogo. O armazenamento do navegador pode falhar (modo anônimo, cota cheia,
 * bloqueio de cookies), então nenhum método lança exceção por causa dele.
 */
export class SaveManager {
  constructor(
    private readonly storage: KeyValueStorage | null = safeLocalStorage(),
    private readonly now: () => Date = () => new Date(),
  ) {}

  load(): SaveData | null {
    try {
      const json = this.storage?.getItem(SAVE_KEY);
      return json ? parseSave(json) : null;
    } catch {
      return null;
    }
  }

  loadOrCreate(): SaveData {
    return this.load() ?? createNewSave(this.now());
  }

  /** Retorna `false` se o armazenamento não estiver disponível. */
  write(save: SaveData): boolean {
    save.savedAt = this.now().toISOString();
    try {
      if (!this.storage) return false;
      this.storage.setItem(SAVE_KEY, JSON.stringify(save));
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    try {
      this.storage?.removeItem(SAVE_KEY);
    } catch {
      // Sem armazenamento, não há o que limpar.
    }
  }

  exportJson(save: SaveData): string {
    return JSON.stringify(save, null, 2);
  }

  importJson(json: string): SaveData {
    const save = parseSave(json);
    this.write(save);
    return save;
  }
}

function safeLocalStorage(): KeyValueStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
