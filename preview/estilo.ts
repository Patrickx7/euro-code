/**
 * Prévia do estilo visual "estrada aberta" (referência: Slow Roads) aplicado à região de Cotia:
 * relevo procedural com morros em camadas, estrada sinuosa que acompanha o terreno, capim seco na
 * beira, pinus, eucaliptos e mata, guard-rail, névoa colorida forte e cores dessaturadas.
 * Não faz parte do jogo.
 *
 * Parâmetros na URL: ?view=chase|vista  &time=golden|dusk
 */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Tree } from '@dgreenheck/ez-tree';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { context2d, mulberry32, rand, speckle, toTexture } from './lib';

const params = new URLSearchParams(location.search);
const dusk = params.get('time') === 'dusk';
const view = params.get('view') ?? 'chase';

/** Paleta de cada horário: o "clima" vem quase todo da névoa e da gradação de cor. */
const MOOD = dusk
  ? {
      sunElevation: 1.5,
      sunAzimuth: 230,
      exposure: 0.9,
      haze: 0x9c8199,
      fogDensity: 0.0026,
      sunColor: 0xff9c7a,
      sunIntensity: 0.9,
      hemiSky: 0xc6a8c8,
      hemiGround: 0x4a3c48,
      hemiIntensity: 0.9,
      tint: [1.04, 0.95, 1.06],
      turbidity: 10,
      rayleigh: 3,
    }
  : {
      sunElevation: 7,
      sunAzimuth: 215,
      exposure: 0.55,
      haze: 0xd9ad90,
      fogDensity: 0.0019,
      sunColor: 0xffc79a,
      sunIntensity: 2.2,
      hemiSky: 0xf2d2bc,
      hemiGround: 0x5b4632,
      hemiIntensity: 0.8,
      tint: [1.06, 0.99, 0.92],
      turbidity: 12,
      rayleigh: 2.8,
    };

// ---------- ruído ----------

const noiseRand = mulberry32(2024);
const PERM = Array.from({ length: 1024 }, () => noiseRand());
function hash(ix: number, iz: number): number {
  return PERM[(((ix * 73856093) ^ (iz * 19349663)) >>> 0) % 1024] ?? 0;
}
const smooth = (t: number) => t * t * (3 - 2 * t);
function valueNoise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fz = smooth(z - iz);
  const a = hash(ix, iz);
  const b = hash(ix + 1, iz);
  const c = hash(ix, iz + 1);
  const d = hash(ix + 1, iz + 1);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}
function fbm(x: number, z: number, octaves = 5): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, z * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}
function baseHeight(x: number, z: number): number {
  const hills = fbm(x / 380, z / 380) * 170;
  const detail = fbm(x / 70 + 13, z / 70 - 7, 3) * 8;
  return hills + detail - 85;
}

// ---------- estrada ----------

const control: THREE.Vector3[] = [];
for (let i = -7; i <= 7; i++) {
  control.push(new THREE.Vector3(i * 130, 0, Math.sin(i * 1.25) * 140 + Math.sin(i * 2.7) * 55));
}
const path = new THREE.CatmullRomCurve3(control, false, 'catmullrom', 0.5);
const roadPoints = path.getSpacedPoints(1800);
const rawHeights = roadPoints.map((p) => baseHeight(p.x, p.z));
roadPoints.forEach((p, i) => {
  let sum = 0;
  let n = 0;
  for (let k = -45; k <= 45; k++) {
    const h = rawHeights[i + k];
    if (h !== undefined) {
      sum += h;
      n++;
    }
  }
  p.y = sum / n;
});
const ROAD_HALF = 3.5;

function nearestRoad(x: number, z: number): { dist: number; y: number; index: number } {
  let best = Infinity;
  let index = 0;
  for (let i = 0; i < roadPoints.length; i += 6) {
    const p = roadPoints[i];
    if (!p) continue;
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d < best) {
      best = d;
      index = i;
    }
  }
  for (let i = Math.max(0, index - 6); i < Math.min(roadPoints.length, index + 7); i++) {
    const p = roadPoints[i];
    if (!p) continue;
    const d = (p.x - x) ** 2 + (p.z - z) ** 2;
    if (d < best) {
      best = d;
      index = i;
    }
  }
  return { dist: Math.sqrt(best), y: roadPoints[index]?.y ?? 0, index };
}

function terrainHeight(x: number, z: number): number {
  const base = baseHeight(x, z);
  const { dist, y } = nearestRoad(x, z);
  // Embaixo da estrada o terreno fica um pouco abaixo (a pista tem "saia" até o chão).
  if (dist < ROAD_HALF + 1) return y - 0.45;
  if (dist < ROAD_HALF + 3.5) return y - 0.2;
  const t = Math.min(1, (dist - ROAD_HALF - 3.5) / 30);
  return THREE.MathUtils.lerp(y - 0.2, base, smooth(t));
}

// ---------- renderer, céu, luz e névoa ----------

const canvas = document.getElementById('c') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = MOOD.exposure;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  view === 'vista' ? 38 : 55,
  window.innerWidth / window.innerHeight,
  0.3,
  20000,
);

const sun = new THREE.Vector3().setFromSphericalCoords(
  1,
  THREE.MathUtils.degToRad(90 - MOOD.sunElevation),
  THREE.MathUtils.degToRad(MOOD.sunAzimuth),
);
const sky = new Sky();
sky.scale.setScalar(15000);
const uniforms = sky.material.uniforms;
uniforms.turbidity!.value = MOOD.turbidity;
uniforms.rayleigh!.value = MOOD.rayleigh;
uniforms.mieCoefficient!.value = 0.006;
uniforms.mieDirectionalG!.value = 0.86;
(uniforms.sunPosition!.value as THREE.Vector3).copy(sun);
scene.add(sky);

const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
const envSky = new Sky();
envSky.scale.setScalar(1000);
envSky.material.uniforms = sky.material.uniforms;
envScene.add(envSky);
scene.environment = pmrem.fromScene(envScene).texture;
scene.environmentIntensity = 0.7;

scene.fog = new THREE.FogExp2(MOOD.haze, view === 'vista' ? MOOD.fogDensity * 0.75 : MOOD.fogDensity);

const sunLight = new THREE.DirectionalLight(MOOD.sunColor, MOOD.sunIntensity);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(4096, 4096);
sunLight.shadow.bias = -0.0004;
sunLight.shadow.normalBias = 0.06;
Object.assign(sunLight.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 1, far: 800 });
scene.add(sunLight, sunLight.target);
scene.add(new THREE.HemisphereLight(MOOD.hemiSky, MOOD.hemiGround, MOOD.hemiIntensity));

// ---------- terreno ----------

const textureLoader = new THREE.TextureLoader();
function photo(file: string, color = true): THREE.Texture {
  const texture = textureLoader.load(new URL(`./assets/${file}`, import.meta.url).href);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  if (color) texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
const grassPhoto = photo('grass.jpg');
const dirtPhoto = photo('dirt_color.jpg');

/**
 * Terreno com textura fotográfica: grama e terra misturadas por vértice (atributo `dirt`) e tingidas
 * pela cor de vértice (capim seco, terra vermelha, pedra). Duas escalas de grama quebram a repetição.
 */
const terrainMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
terrainMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.grassMap = { value: grassPhoto };
  shader.uniforms.dirtMap = { value: dirtPhoto };
  shader.vertexShader = shader.vertexShader
    .replace(
      '#include <common>',
      '#include <common>\nattribute float dirt;\nvarying float vDirt;\nvarying vec3 vGround;',
    )
    .replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvDirt = dirt;\nvGround = (modelMatrix * vec4(position, 1.0)).xyz;',
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      '#include <common>',
      '#include <common>\nuniform sampler2D grassMap;\nuniform sampler2D dirtMap;\nvarying float vDirt;\nvarying vec3 vGround;',
    )
    .replace(
      '#include <map_fragment>',
      `
      vec3 grassNear = texture2D(grassMap, vGround.xz / 5.0).rgb;
      vec3 grassFar = texture2D(grassMap, vGround.xz / 37.0).rgb;
      vec3 dirtTex = texture2D(dirtMap, vGround.xz / 3.5).rgb;
      vec3 grass = mix(grassNear, grassFar, 0.35);
      diffuseColor.rgb *= mix(grass, dirtTex, clamp(vDirt, 0.0, 1.0)) * 2.2;
      `,
    );
};

const white = new THREE.Color(1, 1, 1);
const dryTint = new THREE.Color(1.25, 1.05, 0.72);
const redTint = new THREE.Color(1.45, 0.78, 0.55);
const rockTint = new THREE.Color(0.95, 0.9, 0.85);
const tmp = new THREE.Color();

function buildTerrain(
  size: number,
  segments: number,
  height: (x: number, z: number) => number,
  nearRoad: boolean,
) {
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  const dirt = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, height(x, z));
    const dry = fbm(x / 180 + 40, z / 180, 2);
    tmp.copy(white).lerp(dryTint, Math.min(1, Math.max(0, (dry - 0.35) * 2.2)));
    tmp.multiplyScalar(0.85 + fbm(x / 40, z / 40, 2) * 0.3);
    if (nearRoad) {
      const { dist } = nearestRoad(x, z);
      const shoulder = dist < ROAD_HALF + 3.5 ? 1 : Math.max(0, 1 - (dist - ROAD_HALF - 3.5) / 7);
      dirt[i] = shoulder;
      tmp.lerp(redTint, shoulder * 0.9);
    }
    colors.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const normals = geometry.getAttribute('normal');
  for (let i = 0; i < pos.count; i++) {
    const slope = 1 - normals.getY(i);
    if (slope > 0.16) {
      const k = Math.min(1, (slope - 0.16) * 3);
      dirt[i] = Math.max(dirt[i] ?? 0, k);
      tmp.fromArray(colors, i * 3).lerp(slope > 0.4 ? rockTint : redTint, k);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
  }
  geometry.setAttribute('dirt', new THREE.BufferAttribute(dirt, 1));
  const mesh = new THREE.Mesh(geometry, terrainMaterial);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
const TERRAIN = 1700;
buildTerrain(TERRAIN, 425, terrainHeight, true);
// Serras ao fundo: morros mais altos em camadas, que a névoa transforma em silhuetas.
buildTerrain(
  16000,
  220,
  (x, z) => {
    const r = Math.hypot(x, z);
    const ridge = smooth(Math.min(1, Math.max(0, (r - 900) / 3500)));
    return baseHeight(x, z) - 40 + ridge * fbm(x / 1400 + 5, z / 1400, 4) * 900;
  },
  false,
);

// ---------- malha da estrada (com "saia" até o chão) ----------

function roadTexture() {
  const [c2, c] = context2d(256, 512);
  c.fillStyle = '#3c3e44';
  c.fillRect(0, 0, 256, 512);
  speckle(c, 256, 12_000, 120, 25);
  c.fillStyle = 'rgba(25,25,28,0.35)';
  c.fillRect(40, 0, 40, 512);
  c.fillRect(176, 0, 40, 512);
  c.fillStyle = '#e9e5da';
  c.fillRect(8, 0, 7, 512);
  c.fillRect(241, 0, 7, 512);
  c.fillStyle = '#e2b12a';
  c.fillRect(119, 0, 6, 512);
  c.fillRect(131, 0, 6, 512);
  return toTexture(c2);
}
const vertices: number[] = [];
const uvs: number[] = [];
const index: number[] = [];
const offsets: [number, number, number][] = [
  [-(ROAD_HALF + 0.6), -0.5, -0.04],
  [-ROAD_HALF, 0.06, 0],
  [ROAD_HALF, 0.06, 1],
  [ROAD_HALF + 0.6, -0.5, 1.04],
];
let travelled = 0;
for (let i = 0; i < roadPoints.length; i++) {
  const p = roadPoints[i];
  const next = roadPoints[Math.min(i + 1, roadPoints.length - 1)];
  const prev = roadPoints[Math.max(i - 1, 0)];
  if (!p || !next || !prev) continue;
  const dir = next.clone().sub(prev).setY(0).normalize();
  const right = new THREE.Vector3(-dir.z, 0, dir.x);
  if (i > 0) travelled += p.distanceTo(prev);
  for (const [offset, dy, u] of offsets) {
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
const roadGeometry = new THREE.BufferGeometry();
roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
roadGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
roadGeometry.setIndex(index);
roadGeometry.computeVertexNormals();
const road = new THREE.Mesh(
  roadGeometry,
  new THREE.MeshStandardMaterial({ map: roadTexture(), roughness: 0.88, side: THREE.DoubleSide }),
);
road.receiveShadow = true;
scene.add(road);

function roadFrame(i: number) {
  const p = roadPoints[i] ?? new THREE.Vector3();
  const next = roadPoints[Math.min(i + 2, roadPoints.length - 1)] ?? p;
  const prev = roadPoints[Math.max(i - 2, 0)] ?? p;
  const forward = next.clone().sub(prev).normalize();
  const flat = forward.clone().setY(0).normalize();
  const right = new THREE.Vector3(-flat.z, 0, flat.x);
  return { p, forward, right };
}

// ---------- vegetação ----------

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
function crown(radius: number, seed: number) {
  const ico = new THREE.IcosahedronGeometry(radius, 3);
  ico.deleteAttribute('uv');
  ico.deleteAttribute('normal');
  const g = mergeVertices(ico);
  const p = g.getAttribute('position');
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = valueNoise(v.x * 1.3 + seed, v.z * 1.3 + v.y * 0.8 + seed);
    v.multiplyScalar(1 + (n - 0.5) * 0.45);
    if (v.y < 0) v.y *= 0.6;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

const broadleaf = mergeGeometries([
  colorize(new THREE.CylinderGeometry(0.22, 0.35, 4.5, 6).translate(0, 2.25, 0), 0x4a3b2c),
  colorize(crown(2.8, 1).translate(0, 5.6, 0), 0xffffff),
  colorize(crown(2.1, 2).translate(1.6, 5, 0.6), 0xffffff),
  colorize(crown(2, 3).translate(-1.4, 5.2, -0.8), 0xffffff),
]);
const eucalyptus = mergeGeometries([
  colorize(new THREE.CylinderGeometry(0.16, 0.26, 15, 6).translate(0, 7.5, 0), 0x9c968a),
  colorize(crown(2.6, 4).scale(1, 1.5, 1).translate(0, 16, 0), 0xffffff),
  colorize(crown(2, 5).scale(1, 1.4, 1).translate(1.2, 13.5, 0.4), 0xffffff),
  colorize(crown(1.9, 6).scale(1, 1.4, 1).translate(-1, 12.5, -0.6), 0xffffff),
]);
const pine = mergeGeometries([
  colorize(new THREE.CylinderGeometry(0.15, 0.3, 4, 6).translate(0, 2, 0), 0x4a3b2c),
  ...[0, 1, 2, 3].map((k) =>
    colorize(new THREE.ConeGeometry(3.2 - k * 0.65, 4.2, 10).translate(0, 4.5 + k * 2.6, 0), 0xffffff),
  ),
]);
const bush = mergeGeometries([colorize(crown(1, 9).scale(1.3, 0.8, 1.3).translate(0, 0.5, 0), 0xffffff)]);

const vegetationMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });

function scatter(
  geometry: THREE.BufferGeometry,
  count: number,
  accept: (x: number, z: number, dist: number) => boolean,
  palette: number[],
  scale: [number, number],
  area = TERRAIN * 0.95,
  shadows = true,
  material: THREE.Material = vegetationMaterial,
) {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const axis = new THREE.Vector3(0, 1, 0);
  const color = new THREE.Color();
  let placed = 0;
  for (let tries = 0; placed < count && tries < count * 30; tries++) {
    const x = (rand() - 0.5) * area;
    const z = (rand() - 0.5) * area;
    const { dist } = nearestRoad(x, z);
    if (dist < ROAD_HALF + 1.2 || !accept(x, z, dist)) continue;
    p.set(x, terrainHeight(x, z) - 0.2, z);
    q.setFromAxisAngle(axis, rand() * Math.PI * 2);
    const k = scale[0] + rand() * (scale[1] - scale[0]);
    s.set(k, k * (0.85 + rand() * 0.3), k);
    m.compose(p, q, s);
    mesh.setMatrixAt(placed, m);
    mesh.setColorAt(placed, color.set(palette[Math.floor(rand() * palette.length)] ?? 0x445533));
    placed++;
  }
  mesh.count = placed;
  mesh.castShadow = shadows;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

const carIndex = Math.floor(roadPoints.length * 0.5);
const { p: carPoint, forward, right } = roadFrame(carIndex);
const vistaEye = carPoint.clone().addScaledVector(forward, -70).addScaledVector(right, 55);
/** Na vista do alto, nada de árvores na frente da câmera. */
const clear = (x: number, z: number) => view !== 'vista' || Math.hypot(x - vistaEye.x, z - vistaEye.z) > 75;
const nearTrees = (dist: number) => dist > ROAD_HALF + 10;
const NEAR_RADIUS = 320;
const isNear = (x: number, z: number) => Math.hypot(x - carPoint.x, z - carPoint.z) < NEAR_RADIUS;
/** As árvores simples só aparecem longe, onde a névoa esconde os detalhes. */
const far = (x: number, z: number) => !isNear(x, z);
// Talhões de pinus e eucalipto, comuns entre Cotia e Caucaia do Alto.
scatter(
  pine,
  5000,
  (x, z, d) => clear(x, z) && far(x, z) && nearTrees(d) && fbm(x / 260 + 300, z / 260) > 0.55,
  [0x2c3b26, 0x33452b, 0x283622],
  [0.8, 1.3],
);
scatter(
  eucalyptus,
  1800,
  (x, z, d) => clear(x, z) && far(x, z) && nearTrees(d) && fbm(x / 240 + 100, z / 240 - 60) > 0.6,
  [0x48523f, 0x515c46, 0x434d3a],
  [0.8, 1.1],
);
// Mata em manchas e árvores soltas nas encostas.
scatter(
  broadleaf,
  6000,
  (x, z, d) => clear(x, z) && far(x, z) && nearTrees(d) && fbm(x / 200 - 50, z / 200 + 9) > 0.5,
  [0x34452a, 0x3d4f2e, 0x475a33],
  [0.7, 1.25],
);
scatter(
  broadleaf,
  900,
  (x, z, d) => clear(x, z) && far(x, z) && nearTrees(d) && rand() < 0.25,
  [0x3d4f2e, 0x4a5c35],
  [0.6, 1.1],
);
// Moitas.
scatter(
  bush,
  5000,
  (x, z, d) => clear(x, z) && far(x, z) && (d < 120 || rand() < 0.2),
  [0x3b4228, 0x464a2c, 0x343b25, 0x50502f],
  [0.5, 1.3],
  TERRAIN * 0.6,
  false,
);

// Árvores de verdade perto da estrada: casca e folhas fotográficas (ez-tree, licença MIT).
function variant(preset: string, seed: number, tweak?: (tree: Tree) => void): Tree {
  const tree = new Tree();
  tree.loadPreset(preset);
  tree.options.seed = seed;
  tweak?.(tree);
  tree.generate();
  return tree;
}

function plantForest(
  variants: Tree[],
  count: number,
  accept: (x: number, z: number, dist: number) => boolean,
  height: [number, number],
  leafTints: number[],
) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const axis = new THREE.Vector3(0, 1, 0);
  const color = new THREE.Color();
  for (const tree of variants) {
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
    const per = Math.ceil(count / variants.length);
    const trunks = new THREE.InstancedMesh(tree.branchesMesh.geometry, tree.branchesMesh.material, per);
    const crowns = new THREE.InstancedMesh(tree.leavesMesh.geometry, leaves, per);
    crowns.customDepthMaterial = leafDepth;
    let placed = 0;
    for (let tries = 0; placed < per && tries < per * 60; tries++) {
      const angle = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * NEAR_RADIUS;
      const x = carPoint.x + Math.cos(angle) * r;
      const z = carPoint.z + Math.sin(angle) * r;
      const { dist } = nearestRoad(x, z);
      if (dist < ROAD_HALF + 6 || !clear(x, z) || !accept(x, z, dist)) continue;
      p.set(x, terrainHeight(x, z) - 0.3, z);
      q.setFromAxisAngle(axis, rand() * Math.PI * 2);
      const k = (height[0] + rand() * (height[1] - height[0])) / treeHeight;
      s.set(k, k, k);
      m.compose(p, q, s);
      trunks.setMatrixAt(placed, m);
      crowns.setMatrixAt(placed, m);
      crowns.setColorAt(placed, color.set(leafTints[Math.floor(rand() * leafTints.length)] ?? 0xffffff));
      placed++;
    }
    trunks.count = crowns.count = placed;
    for (const mesh of [trunks, crowns]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  }
}

// Mata Atlântica: copas largas, verde escuro.
plantForest(
  [variant('Oak Medium', 11), variant('Ash Large', 12), variant('Ash Medium', 13), variant('Oak Large', 14)],
  260,
  (x, z) => fbm(x / 200 - 50, z / 200 + 9) > 0.45 || rand() < 0.12,
  [9, 16],
  [0x8fb06a, 0x7da05c, 0x9ab877, 0x6f9450],
);
// Pinus em talhões.
plantForest(
  [variant('Pine Large', 21), variant('Pine Medium', 22)],
  200,
  (x, z) => fbm(x / 260 + 300, z / 260) > 0.52,
  [14, 22],
  [0xffffff, 0xe6f0d8],
);
// Eucalipto: tronco alto e claro, copa só no alto, folhas verde-acinzentadas.
plantForest(
  [1, 2, 3].map((k) =>
    variant('Aspen Large', 30 + k, (tree) => {
      tree.options.bark.tint = 0xd9c8ae;
      tree.options.leaves.tint = 0xa9b894;
      tree.options.leaves.start = 0.5;
      tree.options.branch.children[0] = 7;
    }),
  ),
  160,
  (x, z) => fbm(x / 240 + 100, z / 240 - 60) > 0.55,
  [20, 28],
  [0x7d9a6a, 0x89a374, 0x728f62],
);
// Arbustos na beira da estrada.
plantForest(
  [variant('Bush 1', 41), variant('Bush 2', 42), variant('Bush 3', 43)],
  300,
  (_x, _z, d) => d < 60 || rand() < 0.15,
  [1.2, 2.6],
  [0x7da05c, 0x8fae66, 0x6f9450],
);

// Capim seco: cartões cruzados com textura de folhas finas (o detalhe que mais "vende" a beira da estrada).
function grassTexture() {
  const [c2, c] = context2d(256);
  c.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i++) {
    const x = 30 + rand() * 196;
    const h = 120 + rand() * 130;
    c.strokeStyle = `hsla(${36 + rand() * 22}, ${22 + rand() * 18}%, ${30 + rand() * 18}%, 0.95)`;
    c.lineWidth = 1.5 + rand() * 2;
    c.beginPath();
    c.moveTo(x, 256);
    c.quadraticCurveTo(x + (rand() - 0.5) * 30, 256 - h * 0.6, x + (rand() - 0.5) * 60, 256 - h);
    c.stroke();
  }
  return toTexture(c2);
}
const grassCard = mergeGeometries([
  new THREE.PlaneGeometry(1.6, 1.1).translate(0, 0.55, 0),
  new THREE.PlaneGeometry(1.6, 1.1).rotateY(Math.PI / 2).translate(0, 0.55, 0),
]);
const grassMaterial = new THREE.MeshStandardMaterial({
  map: grassTexture(),
  alphaTest: 0.6,
  side: THREE.DoubleSide,
  roughness: 1,
});
scatter(
  grassCard,
  40_000,
  (x, z, d) => clear(x, z) && (d < 30 || rand() < 0.04),
  [0xffffff, 0xc9d6a0, 0x9fc07a, 0x8db56c, 0xd8ccb0],
  [0.7, 1.4],
  TERRAIN * 0.5,
  false,
  grassMaterial,
);

// ---------- guard-rail, postes e placa ----------

const metal = new THREE.MeshStandardMaterial({ color: 0xb8bcc0, metalness: 0.7, roughness: 0.35 });
const railPoints: THREE.Vector3[] = [];
for (let i = carIndex - 150; i < carIndex + 260; i += 2) {
  const { p, right } = roadFrame(i);
  const point = p.clone().addScaledVector(right, -(ROAD_HALF + 0.9));
  point.y = p.y + 0.55;
  railPoints.push(point);
  if (i % 8 === 0) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), metal);
    post.position.copy(point).setY(p.y + 0.2);
    post.castShadow = true;
    scene.add(post);
  }
}
const beamShape = new THREE.Shape();
beamShape.moveTo(-0.16, -0.02);
beamShape.lineTo(0.16, -0.02);
beamShape.lineTo(0.16, 0.02);
beamShape.lineTo(-0.16, 0.02);
beamShape.closePath();
const beam = new THREE.Mesh(
  new THREE.ExtrudeGeometry(beamShape, {
    steps: railPoints.length * 2,
    bevelEnabled: false,
    extrudePath: new THREE.CatmullRomCurve3(railPoints),
  }),
  metal,
);
beam.castShadow = true;
scene.add(beam);

const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x7b766d, roughness: 0.95 });
const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x1c1a1a });
const tops: THREE.Vector3[] = [];
for (let i = 0; i < roadPoints.length; i += 26) {
  const { p, right } = roadFrame(i);
  const base = p.clone().addScaledVector(right, ROAD_HALF + 5.5);
  base.y = terrainHeight(base.x, base.z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 9, 7), poleMaterial);
  pole.position.copy(base).setY(base.y + 4.5);
  pole.castShadow = true;
  scene.add(pole);
  tops.push(base.clone().setY(base.y + 8.6));
}
for (let i = 0; i < tops.length - 1; i++) {
  const a = tops[i];
  const b = tops[i + 1];
  if (!a || !b) continue;
  const points = Array.from({ length: 14 }, (_, k) => {
    const t = k / 13;
    return a
      .clone()
      .lerp(b, t)
      .setY(a.y + (b.y - a.y) * t - Math.sin(Math.PI * t) * 1.1);
  });
  scene.add(
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 0.022, 3), wireMaterial),
  );
}

function curveSignTexture() {
  const [c2, c] = context2d(256);
  c.clearRect(0, 0, 256, 256);
  c.translate(128, 128);
  c.rotate(Math.PI / 4);
  c.fillStyle = '#f0c419';
  c.fillRect(-82, -82, 164, 164);
  c.strokeStyle = '#111';
  c.lineWidth = 10;
  c.strokeRect(-74, -74, 148, 148);
  c.rotate(-Math.PI / 4);
  c.strokeStyle = '#111';
  c.lineWidth = 16;
  c.beginPath();
  c.moveTo(10, 60);
  c.lineTo(10, 0);
  c.quadraticCurveTo(10, -30, -25, -30);
  c.stroke();
  c.fillStyle = '#111';
  c.beginPath();
  c.moveTo(-50, -30);
  c.lineTo(-20, -55);
  c.lineTo(-20, -5);
  c.fill();
  return toTexture(c2);
}
{
  const { p, right, forward } = roadFrame(carIndex + 32);
  const base = p.clone().addScaledVector(right, ROAD_HALF + 1.6);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), metal);
  post.position.copy(base).setY(p.y + 1.2);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.1),
    new THREE.MeshStandardMaterial({ map: curveSignTexture(), alphaTest: 0.5, roughness: 0.4 }),
  );
  sign.position.copy(base).setY(p.y + 2.35);
  sign.lookAt(sign.position.clone().addScaledVector(forward, -1));
  post.castShadow = sign.castShadow = true;
  scene.add(post, sign);
}

// ---------- o carro e as câmeras ----------

const carUp = new THREE.Vector3().crossVectors(right, forward).normalize();
// O carro do estagiário, modelado no Blender (tools/blender/quadradinho.py).
const car = new THREE.Group();
let carReady = false;
new GLTFLoader().load(new URL('../public/models/carros/quadradinho.glb', import.meta.url).href, (gltf) => {
  gltf.scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = (
      Array.isArray(object.material) ? object.material : [object.material]
    ) as THREE.MeshStandardMaterial[];
    for (const m of materials) {
      if (m.name === 'Glass' || m.name === 'Lens') {
        m.transparent = true;
        m.opacity = m.name === 'Lens' ? 0.25 : 0.4;
        m.depthWrite = false;
      }
      if (m.name === 'Paint') m.color.set(0x8fb0c4);
      // A luz do céu (IBL) não sabe que o carro tem teto: por dentro ela precisa ser bem mais fraca.
      if (['Interior', 'InteriorLight', 'Seat', 'Gauges'].includes(m.name)) m.envMapIntensity = 0.15;
      if (dusk && m.name === 'Headlight') m.emissiveIntensity = 6;
      if (dusk && (m.name === 'Taillight' || m.name === 'Indicator'))
        m.emissiveIntensity = m.name === 'Taillight' ? 2.5 : 0;
    }
  });
  car.add(gltf.scene);
  carReady = true;
});
if (dusk) {
  for (const side of [-1, 1]) {
    const beam = new THREE.SpotLight(0xfff0d0, 40, 35, 0.45, 0.6, 1.5);
    beam.position.set(1.9, 0.65, side * 0.47);
    beam.target.position.set(14, 0, side * 0.9);
    car.add(beam, beam.target);
  }
}
car.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(forward, carUp, right));
car.position
  .copy(carPoint)
  .addScaledVector(right, 1.75)
  .setY(carPoint.y + 0.06);
scene.add(car);

if (view === 'dentro') {
  // Banco do motorista (lado esquerdo = -Z no espaço do carro), como a câmera de cabine do Slow Roads.
  car.updateMatrixWorld(true);
  camera.near = 0.03;
  camera.fov = 68;
  camera.updateProjectionMatrix();
  camera.position.copy(car.localToWorld(new THREE.Vector3(-0.12, 1.13, -0.36)));
  camera.lookAt(car.localToWorld(new THREE.Vector3(12, 0.75, -0.2)));
} else if (view === 'vista') {
  // Do alto, a estrada serpenteando pelo vale (como a terceira captura de referência).
  const eye = vistaEye.clone();
  eye.y = Math.max(terrainHeight(eye.x, eye.z), car.position.y) + 48;
  camera.position.copy(eye);
  camera.lookAt(car.position.clone().addScaledVector(forward, 70));
} else {
  camera.position.copy(car.position).addScaledVector(forward, -7.2).addScaledVector(carUp, 2.4);
  camera.lookAt(car.position.clone().addScaledVector(forward, 24).addScaledVector(carUp, 1.1));
}
sunLight.position.copy(car.position).addScaledVector(sun, 400);
sunLight.target.position.copy(car.position).addScaledVector(forward, 30);

// ---------- pós-processamento: bloom leve + gradação de cor ----------

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 0.78 },
    tint: { value: new THREE.Vector3(...MOOD.tint) },
    vignette: { value: 0.35 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float saturation;
    uniform vec3 tint;
    uniform float vignette;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      color.rgb = mix(vec3(luma), color.rgb, saturation) * tint;
      // Pretos levantados: o contraste baixo do estilo.
      color.rgb = color.rgb * 0.92 + 0.035;
      float d = distance(vUv, vec2(0.5));
      color.rgb *= 1.0 - vignette * smoothstep(0.35, 0.85, d);
      gl_FragColor = color;
    }
  `,
};

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(
  new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    dusk ? 0.5 : 0.15,
    0.7,
    dusk ? 0.75 : 0.9,
  ),
);
composer.addPass(new OutputPass());
composer.addPass(new ShaderPass(GradeShader));
composer.addPass(new SMAAPass());

let texturesReady = false;
THREE.DefaultLoadingManager.onLoad = () => (texturesReady = true);
setTimeout(() => (texturesReady = true), 15_000);
function render() {
  composer.render();
  if (texturesReady && carReady) document.body.dataset.ready = '1';
  else requestAnimationFrame(render);
}
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  composer.setSize(window.innerWidth, window.innerHeight);
  render();
});
render();
