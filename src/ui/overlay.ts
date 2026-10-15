/** Uma tela por vez por cima do jogo (celular, notebook, posto, pedágio). Enquanto aberta, o carro fica parado. */
export type OverlayKind = 'notebook' | 'dialog';

export class Overlay {
  private current: { owner: string; kind: OverlayKind } | null = null;

  constructor(
    readonly root: HTMLElement,
    private readonly onChange: (open: boolean) => void,
  ) {}

  get isOpen(): boolean {
    return this.current !== null;
  }

  get kind(): OverlayKind | null {
    return this.current?.kind ?? null;
  }

  owns(owner: string): boolean {
    return this.current?.owner === owner;
  }

  /** `false` se outra tela já está aberta. */
  open(owner: string, kind: OverlayKind): boolean {
    if (this.current && this.current.owner !== owner) return false;
    const wasOpen = this.current !== null;
    this.current = { owner, kind };
    if (!wasOpen) this.onChange(true);
    return true;
  }

  close(owner: string): void {
    if (!this.owns(owner)) return;
    this.root.replaceChildren();
    this.current = null;
    this.onChange(false);
  }
}
