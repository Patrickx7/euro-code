/** Postes de luz com fiação ao longo da estrada. */
import * as THREE from 'three';
import { terrainHeight } from './landscape';
import { ROAD_HALF_WIDTH, type RoadLoop } from './road';

export function buildPowerLine(road: RoadLoop): THREE.Group {
  const group = new THREE.Group();
  const poleGeometry = new THREE.CylinderGeometry(0.11, 0.16, 9, 7);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x7b766d, roughness: 0.95 });
  const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x1c1a1a });
  const spacing = 40;
  const count = Math.floor(road.length / spacing);
  const poles = new THREE.InstancedMesh(poleGeometry, poleMaterial, count);
  const tops: THREE.Vector3[] = [];
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const frame = road.frameAt(i * spacing);
    const base = frame.position.clone().addScaledVector(frame.right, ROAD_HALF_WIDTH + 5.5);
    base.y = terrainHeight(road, base.x, base.z);
    poles.setMatrixAt(i, m.makeTranslation(base.x, base.y + 4.5, base.z));
    tops.push(base.setY(base.y + 8.6));
  }
  poles.castShadow = true;
  poles.computeBoundingSphere();
  group.add(poles);

  const wirePoints: number[] = [];
  for (let i = 0; i < tops.length; i++) {
    const a = tops[i];
    const b = tops[(i + 1) % tops.length];
    if (!a || !b) continue;
    // Catenária aproximada: o fio "barriga" entre os postes.
    for (let k = 0; k < 12; k++) {
      for (const t of [k / 12, (k + 1) / 12]) {
        const p = a.clone().lerp(b, t);
        wirePoints.push(p.x, p.y - Math.sin(Math.PI * t) * 1.1, p.z);
      }
    }
  }
  const wires = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(wirePoints, 3)),
    wireMaterial,
  );
  group.add(wires);
  return group;
}
