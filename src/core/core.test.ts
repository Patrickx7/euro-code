import { describe, expect, it, vi } from 'vitest';
import type { GameEvents } from '../shared/events';
import { createNewSave } from '../shared/save';
import { EventBus } from './event-bus';
import { GameLoop, type FrameScheduler } from './game-loop';
import { parseSave, SAVE_KEY, SaveFormatError, SaveManager, type KeyValueStorage } from './save-manager';

describe('EventBus', () => {
  it('entrega o payload para os ouvintes e permite cancelar', () => {
    const bus = new EventBus<GameEvents>();
    const handler = vi.fn();
    const off = bus.on('toll:enter', handler);
    bus.emit('toll:enter', { tollId: 'castello-km18' });
    off();
    bus.emit('toll:enter', { tollId: 'outro' });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ tollId: 'castello-km18' });
    expect(bus.listenerCount('toll:enter')).toBe(0);
  });

  it('once dispara uma única vez', () => {
    const bus = new EventBus<GameEvents>();
    const handler = vi.fn();
    bus.once('level:up', handler);
    bus.emit('level:up', { level: 2 });
    bus.emit('level:up', { level: 3 });
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe('GameLoop', () => {
  const manualScheduler: FrameScheduler = { request: () => 1, cancel: () => undefined };

  it('executa passos fixos conforme o tempo decorrido', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ update, render }, 0.1, 0.25, manualScheduler);
    loop.tick(0);
    loop.tick(250);
    expect(update).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(expect.closeTo(0.5, 5));
  });

  it('limita o tempo de um quadro muito longo', () => {
    const update = vi.fn();
    const loop = new GameLoop({ update, render: vi.fn() }, 0.1, 0.25, manualScheduler);
    loop.tick(0);
    loop.tick(10_000);
    expect(update).toHaveBeenCalledTimes(2);
  });
});

class MemoryStorage implements KeyValueStorage {
  readonly data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

describe('SaveManager', () => {
  const fixedNow = () => new Date('2026-01-01T12:00:00Z');

  it('cria um jogo novo quando não há save', () => {
    const manager = new SaveManager(new MemoryStorage(), fixedNow);
    const save = manager.loadOrCreate();
    expect(save.level).toBe(1);
    expect(save.trucks).toHaveLength(1);
  });

  it('grava e lê o mesmo save', () => {
    const storage = new MemoryStorage();
    const manager = new SaveManager(storage, fixedNow);
    const save = createNewSave(fixedNow());
    save.money = 1234;
    expect(manager.write(save)).toBe(true);
    expect(manager.load()?.money).toBe(1234);
  });

  it('ignora um save corrompido no armazenamento', () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, '{quebrado');
    expect(new SaveManager(storage, fixedNow).load()).toBeNull();
  });

  it('não quebra quando o armazenamento falha', () => {
    const failing: KeyValueStorage = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('cota cheia');
      },
      removeItem: () => {
        throw new Error('bloqueado');
      },
    };
    const manager = new SaveManager(failing, fixedNow);
    expect(manager.load()).toBeNull();
    expect(manager.write(createNewSave())).toBe(false);
    expect(() => manager.clear()).not.toThrow();
  });

  it('exporta e importa um save', () => {
    const manager = new SaveManager(new MemoryStorage(), fixedNow);
    const save = createNewSave();
    save.xp = 42;
    expect(manager.importJson(manager.exportJson(save)).xp).toBe(42);
  });

  it('rejeita arquivos que não são saves', () => {
    expect(() => parseSave('[]')).toThrow(SaveFormatError);
    expect(() => parseSave('{"version": 99}')).toThrow(/não suportada/);
    expect(() => parseSave('não é json')).toThrow(/JSON/);
  });
});
