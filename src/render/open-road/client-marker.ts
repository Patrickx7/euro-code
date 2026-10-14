/** Marcador do cliente: um feixe de luz na beira da estrada com o nome do negócio por cima. */
import * as THREE from 'three';
import { context2d, toTexture } from './canvas-textures';

function labelTexture(text: string): THREE.Texture {
  const [canvas, c] = context2d(512, 128);
  c.clearRect(0, 0, 512, 128);
  c.fillStyle = 'rgba(12, 18, 28, 0.85)';
  c.beginPath();
  c.roundRect(4, 4, 504, 120, 24);
  c.fill();
  c.fillStyle = '#f5c518';
  c.font = 'bold 44px system-ui, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text.length > 22 ? `${text.slice(0, 21)}…` : text, 256, 66, 480);
  return toTexture(canvas);
}

export class ClientMarker {
  readonly group = new THREE.Group();
  private label: THREE.Sprite | null = null;
  private elapsed = 0;

  constructor() {
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 40, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xf5c518,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    );
    beam.position.y = 20;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.8, 48).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xf5c518, transparent: true, opacity: 0.8, depthWrite: false }),
    );
    ring.position.y = 0.15;
    this.group.add(beam, ring);
    this.group.visible = false;
  }

  show(position: THREE.Vector3, name: string): void {
    if (this.label) {
      this.group.remove(this.label);
      this.label.material.map?.dispose();
      this.label.material.dispose();
    }
    this.label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: labelTexture(name), depthTest: false, fog: false }),
    );
    this.label.scale.set(12, 3, 1);
    this.label.position.y = 9;
    this.label.renderOrder = 10;
    this.group.add(this.label);
    this.group.position.copy(position);
    this.group.visible = true;
  }

  hide(): void {
    this.group.visible = false;
  }

  update(dt: number): void {
    this.elapsed += dt;
    if (this.label) this.label.position.y = 9 + Math.sin(this.elapsed * 2) * 0.4;
  }
}
