/** Posto de gasolina e praça de pedágio na beira do circuito (modelos simples, nomes fictícios). */
import * as THREE from 'three';
import { context2d, toTexture } from './canvas-textures';
import { ROAD_HALF_WIDTH, type RoadLoop } from './road';

function signTexture(lines: string[], background: string, color: string): THREE.Texture {
  const [canvas, c] = context2d(512, 256);
  c.fillStyle = background;
  c.fillRect(0, 0, 512, 256);
  c.fillStyle = color;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  lines.forEach((line, i) => {
    c.font = i === 0 ? 'bold 72px system-ui, sans-serif' : 'bold 44px system-ui, sans-serif';
    c.fillText(line, 256, (256 / (lines.length + 1)) * (i + 1), 480);
  });
  return toTexture(canvas);
}

const box = (w: number, h: number, d: number, color: number, roughness = 0.7) =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness }));

/** Grupo alinhado à estrada: +X = sentido da pista, +Z = lado direito. */
function anchored(road: RoadLoop, distance: number): THREE.Group {
  const frame = road.frameAt(distance);
  const group = new THREE.Group();
  const flat = frame.forward.clone().setY(0).normalize();
  group.quaternion.setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(flat, new THREE.Vector3(0, 1, 0), frame.right),
  );
  group.position.copy(frame.position);
  return group;
}

/** Posto "Tanque Cheio": pátio, cobertura, duas bombas e a placa com o preço. */
export function buildGasStation(road: RoadLoop, distance: number, pricePerLiter: number) {
  const group = anchored(road, distance);
  const lateral = ROAD_HALF_WIDTH + 9;
  const pad = box(26, 1.2, 14, 0x55575c, 0.95);
  pad.position.set(0, -0.54, lateral);
  pad.receiveShadow = true;
  const roof = box(16, 0.6, 9, 0xe8e4da);
  roof.position.set(0, 5.4, lateral);
  const stripe = box(16.1, 0.35, 9.1, 0x1f8a4c);
  stripe.position.set(0, 5.3, lateral);
  group.add(pad, roof, stripe);
  for (const x of [-6, 6]) {
    for (const z of [-3.2, 3.2]) {
      const pillar = box(0.4, 5.2, 0.4, 0xd9d4c7);
      pillar.position.set(x, 2.6, lateral + z);
      group.add(pillar);
    }
  }
  for (const x of [-3, 3]) {
    const pump = box(0.9, 1.7, 0.6, 0x1f8a4c);
    pump.position.set(x, 0.85, lateral);
    const screen = box(0.6, 0.35, 0.62, 0x111111);
    screen.position.set(x, 1.35, lateral);
    group.add(pump, screen);
  }
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2),
    new THREE.MeshStandardMaterial({
      map: signTexture(
        ['TANQUE CHEIO', `Gasolina R$ ${pricePerLiter.toFixed(2).replace('.', ',')}`],
        '#1f8a4c',
        '#ffffff',
      ),
      side: THREE.DoubleSide,
    }),
  );
  sign.position.set(-10, 6, ROAD_HALF_WIDTH + 2.5);
  sign.rotation.y = Math.PI / 2;
  const post = box(0.25, 5, 0.25, 0x888888);
  post.position.set(-10, 2.5, ROAD_HALF_WIDTH + 2.5);
  group.add(sign, post);
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) o.castShadow = true;
  });
  // As bombas ficam entre as duas ilhas: é ali que o carro para.
  group.updateMatrixWorld(true);
  const stopPoint = new THREE.Vector3(0, 0, lateral - 1.8).applyMatrix4(group.matrixWorld);
  return { group, stopPoint };
}

/** Praça de pedágio com cobertura sobre a pista, cabine e cancela na faixa da direita. */
export function buildTollPlaza(road: RoadLoop, distance: number) {
  const group = anchored(road, distance);
  const canopy = box(5, 0.6, ROAD_HALF_WIDTH * 2 + 6, 0xf2f0ea);
  canopy.position.set(0, 6, 0);
  const band = box(5.05, 0.4, ROAD_HALF_WIDTH * 2 + 6.05, 0xf5c518);
  band.position.set(0, 5.8, 0);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 1.6),
    new THREE.MeshStandardMaterial({
      map: signTexture(['PEDÁGIO'], '#f5c518', '#111111'),
      side: THREE.DoubleSide,
    }),
  );
  label.position.set(-2.55, 5.6, 0);
  label.rotation.y = -Math.PI / 2;
  group.add(canopy, band, label);
  for (const z of [-(ROAD_HALF_WIDTH + 2.5), ROAD_HALF_WIDTH + 2.5]) {
    const pillar = box(0.6, 6, 0.6, 0xd0ccc0);
    pillar.position.set(0, 3, z);
    group.add(pillar);
  }
  const booth = box(2.2, 2.6, 1.6, 0xe8e4da);
  booth.position.set(1.5, 1.3, ROAD_HALF_WIDTH + 1.4);
  const window_ = box(1.6, 0.9, 1.62, 0x6fa8c8);
  window_.position.set(1.5, 1.7, ROAD_HALF_WIDTH + 1.4);
  group.add(booth, window_);
  // Cancela: o braço gira em torno do poste perto da cabine.
  const pivot = new THREE.Group();
  pivot.position.set(-0.6, 1.1, ROAD_HALF_WIDTH + 0.4);
  const armLength = ROAD_HALF_WIDTH + 0.2;
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, armLength),
    new THREE.MeshStandardMaterial({ color: 0xe23b2e, roughness: 0.5 }),
  );
  arm.position.z = -armLength / 2;
  pivot.add(arm);
  const pole = box(0.3, 1.2, 0.3, 0x333333);
  pole.position.set(-0.6, 0.6, ROAD_HALF_WIDTH + 0.4);
  group.add(pivot, pole);
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) o.castShadow = true;
  });
  let openness = 0;
  let target = 0;
  return {
    group,
    setOpen(open: boolean) {
      target = open ? 1 : 0;
    },
    update(dt: number) {
      openness += Math.sign(target - openness) * Math.min(Math.abs(target - openness), dt * 1.5);
      pivot.rotation.x = openness * (Math.PI / 2) * 0.95;
    },
  };
}
