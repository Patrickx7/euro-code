/**
 * Instâncias agrupadas por quadrado do terreno ("tiles"): cada tile vira um InstancedMesh próprio, que
 * o Three.js descarta quando sai da câmera, e que `DistanceCuller` esconde quando fica longe demais.
 */
import * as THREE from 'three';

interface Cell {
  matrices: number[];
  colors: number[];
}

export class InstanceTiles {
  private readonly cells = new Map<string, Cell>();

  constructor(private readonly tileSize: number) {}

  get count(): number {
    let total = 0;
    for (const cell of this.cells.values()) total += cell.matrices.length / 16;
    return total;
  }

  add(matrix: THREE.Matrix4, color: THREE.Color): void {
    const x = matrix.elements[12] ?? 0;
    const z = matrix.elements[14] ?? 0;
    const key = `${Math.floor(x / this.tileSize)}:${Math.floor(z / this.tileSize)}`;
    let cell = this.cells.get(key);
    if (!cell) {
      cell = { matrices: [], colors: [] };
      this.cells.set(key, cell);
    }
    cell.matrices.push(...matrix.elements);
    cell.colors.push(color.r, color.g, color.b);
  }

  /** Cria um InstancedMesh por tile, com a mesma geometria e material. */
  build(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    options: { castShadow: boolean; customDepthMaterial?: THREE.Material; withColor?: boolean },
  ): THREE.InstancedMesh[] {
    const meshes: THREE.InstancedMesh[] = [];
    for (const cell of this.cells.values()) {
      const count = cell.matrices.length / 16;
      const mesh = new THREE.InstancedMesh(geometry, material, count);
      mesh.instanceMatrix.array.set(cell.matrices);
      if (options.withColor ?? true) {
        mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cell.colors), 3);
      }
      mesh.castShadow = options.castShadow;
      mesh.receiveShadow = true;
      if (options.customDepthMaterial) mesh.customDepthMaterial = options.customDepthMaterial;
      mesh.computeBoundingSphere();
      meshes.push(mesh);
    }
    return meshes;
  }
}

/** Esconde objetos além de uma distância da câmera (a névoa já os apagaria). */
export class DistanceCuller {
  private readonly entries: { object: THREE.Object3D; center: THREE.Vector3; radius: number; max: number }[] =
    [];

  add(meshes: THREE.InstancedMesh[], maxDistance: number): void {
    for (const mesh of meshes) {
      const sphere = mesh.boundingSphere ?? new THREE.Sphere();
      this.entries.push({
        object: mesh,
        center: sphere.center.clone(),
        radius: sphere.radius,
        max: maxDistance,
      });
    }
  }

  update(camera: THREE.Vector3): void {
    for (const entry of this.entries) {
      entry.object.visible = entry.center.distanceTo(camera) - entry.radius < entry.max;
    }
  }
}
