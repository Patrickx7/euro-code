/** Implementação do `EventEmitter` do módulo `events` do Node (subconjunto usado nas aulas). */

type Listener = (...args: unknown[]) => void;

interface Entry {
  listener: Listener;
  once: boolean;
}

export class EventEmitter {
  static defaultMaxListeners = 10;
  private readonly events = new Map<string | symbol, Entry[]>();

  private add(name: string | symbol, listener: Listener, once: boolean, prepend: boolean): this {
    if (typeof listener !== 'function') {
      throw new TypeError('The "listener" argument must be of type function.');
    }
    const list = this.events.get(name) ?? [];
    if (prepend) list.unshift({ listener, once });
    else list.push({ listener, once });
    this.events.set(name, list);
    return this;
  }

  on(name: string | symbol, listener: Listener): this {
    return this.add(name, listener, false, false);
  }

  addListener(name: string | symbol, listener: Listener): this {
    return this.on(name, listener);
  }

  prependListener(name: string | symbol, listener: Listener): this {
    return this.add(name, listener, false, true);
  }

  once(name: string | symbol, listener: Listener): this {
    return this.add(name, listener, true, false);
  }

  off(name: string | symbol, listener: Listener): this {
    const list = this.events.get(name);
    if (!list) return this;
    const index = list.map((e) => e.listener).lastIndexOf(listener);
    if (index >= 0) list.splice(index, 1);
    if (list.length === 0) this.events.delete(name);
    return this;
  }

  removeListener(name: string | symbol, listener: Listener): this {
    return this.off(name, listener);
  }

  removeAllListeners(name?: string | symbol): this {
    if (name === undefined) this.events.clear();
    else this.events.delete(name);
    return this;
  }

  emit(name: string | symbol, ...args: unknown[]): boolean {
    const list = this.events.get(name);
    if (!list || list.length === 0) {
      if (name === 'error') {
        const err = args[0];
        throw err instanceof Error ? err : new Error(`Unhandled error. (${String(err)})`);
      }
      return false;
    }
    for (const entry of [...list]) {
      if (entry.once) this.off(name, entry.listener);
      entry.listener.apply(this, args);
    }
    return true;
  }

  listenerCount(name: string | symbol): number {
    return this.events.get(name)?.length ?? 0;
  }

  listeners(name: string | symbol): Listener[] {
    return (this.events.get(name) ?? []).map((e) => e.listener);
  }

  eventNames(): (string | symbol)[] {
    return [...this.events.keys()];
  }

  setMaxListeners(_n: number): this {
    return this;
  }

  getMaxListeners(): number {
    return EventEmitter.defaultMaxListeners;
  }
}

/** `events.once(emissor, nome)`: Promise resolvida com os argumentos do próximo evento. */
export function once(emitter: EventEmitter, name: string | symbol): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const onError = (err: unknown) => {
      emitter.off(name, onEvent);
      reject(err instanceof Error ? err : new Error(String(err)));
    };
    const onEvent = (...args: unknown[]) => {
      if (name !== 'error') emitter.off('error', onError);
      resolve(args);
    };
    emitter.once(name, onEvent);
    if (name !== 'error') emitter.once('error', onError);
  });
}

/** Objeto exportado por `require('events')`: o próprio construtor, como no Node. */
export function createEventsModule(): typeof EventEmitter & {
  EventEmitter: typeof EventEmitter;
  once: typeof once;
} {
  return Object.assign(EventEmitter, { EventEmitter, once });
}
