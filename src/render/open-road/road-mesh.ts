/** Malha da pista, com uma "saia" inclinada dos dois lados até o chão. */
import * as THREE from 'three';
import { ROAD_HALF_WIDTH, type RoadLoop } from './road';

export function buildRoadMesh(road: RoadLoop, map: THREE.Texture): THREE.Mesh {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  // [deslocamento lateral, altura, coordenada u da textura]
  const profile: [number, number, number][] = [
    [-(ROAD_HALF_WIDTH + 0.6), -0.5, -0.04],
    [-ROAD_HALF_WIDTH, 0.06, 0],
    [ROAD_HALF_WIDTH, 0.06, 1],
    [ROAD_HALF_WIDTH + 0.6, -0.5, 1.04],
  ];
  const n = road.points.length;
  let travelled = 0;
  // Um ponto a mais no fim fecha o circuito (repete o primeiro, com a textura continuando).
  for (let i = 0; i <= n; i++) {
    const p = road.point(i);
    if (i > 0) travelled += p.distanceTo(road.point(i - 1));
    const dir = road
      .point(i + 1)
      .clone()
      .sub(road.point(i - 1))
      .setY(0)
      .normalize();
    const right = new THREE.Vector3(-dir.z, 0, dir.x);
    for (const [offset, dy, u] of profile) {
      const v = p.clone().addScaledVector(right, offset);
      vertices.push(v.x, v.y + dy, v.z);
      uvs.push(u, travelled / 16);
    }
    if (i > 0) {
      const a = (i - 1) * 4;
      const b = i * 4;
      for (let k = 0; k < 3; k++) index.push(a + k, b + k, a + k + 1, a + k + 1, b + k, b + k + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ map, roughness: 0.88, side: THREE.DoubleSide }),
  );
  mesh.receiveShadow = true;
  return mesh;
}
