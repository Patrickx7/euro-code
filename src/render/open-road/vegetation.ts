/**
 * Vegetação: árvores fotográficas (EZ-Tree, MIT) perto da estrada, árvores simples no resto do
 * terreno e capim seco no acostamento. Pinus e eucalipto em talhões, como entre Cotia e Caucaia do Alto.
 */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Tree } from '@dgreenheck/ez-tree';
import { dryGrassTexture } from './canvas-textures';
import { noise, terrainHeight } from './landscape';
import { ROAD_HALF_WIDTH, type RoadLoop } from './road';
import { InstanceTiles, type DistanceCuller } from './tiles';

/** Até onde (a partir da beira da estrada) vão as árvores fotográficas. */
const PHOTO_TREE_BAND = 140;
const pineStand = (x: number, z: number) => noise.fbm(x / 260 + 300, z / 260) > 0.52;
const eucalyptusStand = (x: number, z: number) => noise.fbm(x / 240 + 100, z / 240 - 60) > 0.55;
const woods = (x: number, z: number) => noise.fbm(x / 200 - 50, z / 200 + 9) > 0.45;

interface Placement {
  road: RoadLoop;
  random: () => number;
  scene: THREE.Scene;
  culler: DistanceCuller;
}

function colorize(geometry: THREE.BufferGeometry, color: number): THREE.BufferGeometry {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  const c = new THREE.Color(color);
  const count = g.getAttribute('position').count;
  const data = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) data.set([c.r, c.g, c.b], i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(data, 3));
  g.deleteAttribute('uv');
  return g;
}

/** Copa lisa e irregular (vértices fundidos antes de deformar, para não ficar facetada). */
function crown(radius: number, seed: number): THREE.BufferGeometry {
  const ico = new THREE.IcosahedronGeometry(radius, 3);
  ico.deleteAttribute('uv');
  ico.deleteAttribute('normal');
  const g = mergeVertices(ico);
  const p = g.getAttribute('position');
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = noise.value(v.x * 1.3 + seed, v.z * 1.3 + v.y * 0.8 + seed);
    v.multiplyScalar(1 + (n - 0.5) * 0.45);
    if (v.y < 0) v.y *= 0.6;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function simpleTreeGeometries() {
  const merged = (parts: THREE.BufferGeometry[]) => {
    const geometry = mergeGeometries(parts);
    if (!geometry) throw new Error('Falha ao montar a geometria das árvores.');
    return geometry;
  };
  return {
    broadleaf: merged([
      colorize(new THREE.CylinderGeometry(0.22, 0.35, 4.5, 6).translate(0, 2.25, 0), 0x4a3b2c),
      colorize(crown(2.8, 1).translate(0, 5.6, 0), 0xffffff),
      colorize(crown(2.1, 2).translate(1.6, 5, 0.6), 0xffffff),
      colorize(crown(2, 3).translate(-1.4, 5.2, -0.8), 0xffffff),
    ]),
    eucalyptus: merged([
      colorize(new THREE.CylinderGeometry(0.16, 0.26, 15, 6).translate(0, 7.5, 0), 0x9c968a),
      colorize(crown(2.6, 4).scale(1, 1.5, 1).translate(0, 16, 0), 0xffffff),
      colorize(crown(2, 5).scale(1, 1.4, 1).translate(1.2, 13.5, 0.4), 0xffffff),
      colorize(crown(1.9, 6).scale(1, 1.4, 1).translate(-1, 12.5, -0.6), 0xffffff),
    ]),
    pine: merged([
      colorize(new THREE.CylinderGeometry(0.15, 0.3, 4, 6).translate(0, 2, 0), 0x4a3b2c),
      ...[0, 1, 2, 3].map((k) =>
        colorize(new THREE.ConeGeometry(3.2 - k * 0.65, 4.2, 10).translate(0, 4.5 + k * 2.6, 0), 0xffffff),
      ),
    ]),
  };
}

const matrix = new THREE.Matrix4();
const quaternion = new THREE.Quaternion();
const scale = new THREE.Vector3();
const position = new THREE.Vector3();
const yAxis = new THREE.Vector3(0, 1, 0);
const color = new THREE.Color();

function compose(x: number, y: number, z: number, size: number, random: () => number): THREE.Matrix4 {
  position.set(x, y, z);
  quaternion.setFromAxisAngle(yAxis, random() * Math.PI * 2);
  scale.set(size, size * (0.85 + random() * 0.3), size);
  return matrix.compose(position, quaternion, scale);
}

const pickColor = (palette: number[], random: () => number) =>
  color.set(palette[Math.floor(random() * palette.length)] ?? 0x445533);

/** Um ponto aleatório numa faixa ao lado da estrada (distância lateral entre `min` e `max`). */
function besideRoad(road: RoadLoop, min: number, max: number, random: () => number): THREE.Vector3 {
  const frame = road.frameAt(random() * road.length);
  const side = random() < 0.5 ? -1 : 1;
  const offset = min + random() * (max - min);
  return frame.position.clone().addScaledVector(frame.right, side * offset);
}

/** Árvores simples por todo o terreno (e na beira da estrada quando não há árvores fotográficas). */
export function plantSimpleTrees(
  ctx: Placement,
  total: number,
  terrainSize: number,
  nearRoadToo: boolean,
): void {
  const { road, random } = ctx;
  const geometries = simpleTreeGeometries();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
  const kinds = [
    {
      geometry: geometries.pine,
      palette: [0x2c3b26, 0x33452b, 0x283622],
      stand: pineStand,
      size: [0.8, 1.3],
    },
    {
      geometry: geometries.eucalyptus,
      palette: [0x48523f, 0x515c46, 0x434d3a],
      stand: eucalyptusStand,
      size: [0.8, 1.1],
    },
    {
      geometry: geometries.broadleaf,
      palette: [0x34452a, 0x3d4f2e, 0x475a33],
      stand: woods,
      size: [0.7, 1.25],
    },
  ] as const;
  const minDistance = nearRoadToo ? ROAD_HALF_WIDTH + 8 : PHOTO_TREE_BAND;
  for (const kind of kinds) {
    const tiles = new InstanceTiles(400);
    const wanted = Math.round(total / kinds.length);
    for (let tries = 0; tiles.count < wanted && tries < wanted * 30; tries++) {
      const x = (random() - 0.5) * terrainSize * 0.95;
      const z = (random() - 0.5) * terrainSize * 0.95;
      // Árvores soltas fora dos talhões, em menor quantidade.
      if (!kind.stand(x, z) && random() > 0.08) continue;
      const { dist } = road.nearest(x, z);
      if (dist < minDistance) continue;
      const size = kind.size[0] + random() * (kind.size[1] - kind.size[0]);
      tiles.add(
        compose(x, terrainHeight(road, x, z) - 0.2, z, size, random),
        pickColor([...kind.palette], random),
      );
    }
    const meshes = tiles.build(kind.geometry, material, { castShadow: true });
    ctx.scene.add(...meshes);
    ctx.culler.add(meshes, 3000);
  }
}

type TreeClass = typeof Tree;

function createPhotoTree(
  TreeImpl: TreeClass,
  preset: string,
  seed: number,
  tweak?: (tree: Tree) => void,
): Tree {
  const tree = new TreeImpl();
  tree.loadPreset(preset);
  tree.options.seed = seed;
  tweak?.(tree);
  tree.generate();
  return tree;
}

/**
 * Árvores com casca e folhas fotográficas, numa faixa ao longo da estrada. A biblioteca traz as
 * texturas embutidas (~4 MB), então só é baixada quando a qualidade usa essas árvores.
 */
export async function plantPhotoTrees(ctx: Placement, total: number): Promise<void> {
  const { Tree: TreeImpl } = await import('@dgreenheck/ez-tree');
  const photoTree = (preset: string, seed: number, tweak?: (tree: Tree) => void) =>
    createPhotoTree(TreeImpl, preset, seed, tweak);
  const { road, random } = ctx;
  const groups: {
    variants: Tree[];
    share: number;
    accept: (x: number, z: number, dist: number) => boolean;
    height: [number, number];
    tints: number[];
  }[] = [
    {
      // Mata Atlântica: copas largas, verde escuro.
      variants: [photoTree('Oak Medium', 11), photoTree('Ash Large', 12), photoTree('Oak Large', 14)],
      share: 0.4,
      accept: (x, z) => woods(x, z) || random() < 0.12,
      height: [9, 16],
      tints: [0x8fb06a, 0x7da05c, 0x9ab877, 0x6f9450],
    },
    {
      variants: [photoTree('Pine Large', 21), photoTree('Pine Medium', 22)],
      share: 0.25,
      accept: (x, z) => pineStand(x, z),
      height: [14, 22],
      tints: [0xffffff, 0xe6f0d8],
    },
    {
      // Eucalipto: tronco alto e claro, copa só no alto, folhas verde-acinzentadas.
      variants: [1, 2].map((k) =>
        photoTree('Aspen Large', 30 + k, (tree) => {
          tree.options.bark.tint = 0xd9c8ae;
          tree.options.leaves.tint = 0xa9b894;
          tree.options.leaves.start = 0.5;
          tree.options.branch.children[0] = 7;
        }),
      ),
      share: 0.2,
      accept: (x, z) => eucalyptusStand(x, z),
      height: [20, 28],
      tints: [0x7d9a6a, 0x89a374, 0x728f62],
    },
    {
      // Arbustos colados no acostamento.
      variants: [photoTree('Bush 1', 41), photoTree('Bush 2', 42)],
      share: 0.15,
      accept: (_x, _z, dist) => dist < 40 || random() < 0.2,
      height: [1.2, 2.6],
      tints: [0x7da05c, 0x8fae66, 0x6f9450],
    },
  ];
  for (const group of groups) {
    const per = Math.round((total * group.share) / group.variants.length);
    for (const tree of group.variants) {
      const box = new THREE.Box3().setFromObject(tree);
      const treeHeight = Math.max(0.01, box.max.y - box.min.y);
      const leafSource = tree.leavesMesh.material as THREE.MeshPhongMaterial;
      const leaves = new THREE.MeshStandardMaterial({
        map: leafSource.map,
        alphaTest: leafSource.alphaTest,
        side: THREE.DoubleSide,
        roughness: 0.75,
      });
      const leafDepth = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: leafSource.map,
        alphaTest: leafSource.alphaTest,
      });
      const tiles = new InstanceTiles(300);
      for (let tries = 0; tiles.count < per && tries < per * 60; tries++) {
        const p = besideRoad(road, ROAD_HALF_WIDTH + 6, PHOTO_TREE_BAND, random);
        const { dist } = road.nearest(p.x, p.z);
        if (dist < ROAD_HALF_WIDTH + 6 || !group.accept(p.x, p.z, dist)) continue;
        const size = (group.height[0] + random() * (group.height[1] - group.height[0])) / treeHeight;
        position.set(p.x, terrainHeight(road, p.x, p.z) - 0.3, p.z);
        quaternion.setFromAxisAngle(yAxis, random() * Math.PI * 2);
        scale.setScalar(size);
        tiles.add(matrix.compose(position, quaternion, scale), pickColor(group.tints, random));
      }
      const trunks = tiles.build(tree.branchesMesh.geometry, tree.branchesMesh.material as THREE.Material, {
        castShadow: true,
        withColor: false,
      });
      const crowns = tiles.build(tree.leavesMesh.geometry, leaves, {
        castShadow: true,
        customDepthMaterial: leafDepth,
      });
      ctx.scene.add(...trunks, ...crowns);
      ctx.culler.add([...trunks, ...crowns], 520);
    }
  }
}

/** Capim seco: cartões cruzados com folhas finas (o detalhe que mais "vende" a beira da estrada). */
export function plantGrass(ctx: Placement, total: number): void {
  const { road, random } = ctx;
  const card = mergeGeometries([
    new THREE.PlaneGeometry(1.6, 1.1).translate(0, 0.55, 0),
    new THREE.PlaneGeometry(1.6, 1.1).rotateY(Math.PI / 2).translate(0, 0.55, 0),
  ]);
  if (!card) return;
  const material = new THREE.MeshStandardMaterial({
    map: dryGrassTexture(random),
    alphaTest: 0.6,
    side: THREE.DoubleSide,
    roughness: 1,
  });
  const tiles = new InstanceTiles(120);
  const palette = [0xffffff, 0xc9d6a0, 0x9fc07a, 0x8db56c, 0xd8ccb0];
  for (let i = 0; i < total; i++) {
    // Mais denso perto da pista, rareando para longe.
    const p = besideRoad(road, ROAD_HALF_WIDTH + 1.2, ROAD_HALF_WIDTH + 1.2 + 32 * random() ** 1.5, random);
    const size = 0.7 + random() * 0.7;
    tiles.add(
      compose(p.x, terrainHeight(road, p.x, p.z) - 0.2, p.z, size, random),
      pickColor(palette, random),
    );
  }
  const meshes = tiles.build(card, material, { castShadow: false });
  ctx.scene.add(...meshes);
  ctx.culler.add(meshes, 170);
}
