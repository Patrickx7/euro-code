/**
 * Prévia do visual realista do Freela na Estrada (não faz parte do jogo).
 * Mostra o caminho da Fase 2: céu físico, iluminação baseada em imagem, materiais PBR com texturas
 * procedurais, sombras suaves, oclusão ambiental (GTAO), bloom e tone mapping cinematográfico.
 *
 * Parâmetros na URL: ?time=golden|dusk
 */
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { buildCar } from './car';
import { contactShadowTexture, context2d, pick, rand, speckle, toTexture } from './lib';

const params = new URLSearchParams(location.search);
const dusk = params.get('time') === 'dusk';

// ---------- utilidades ----------

// ---------- texturas procedurais ----------

function asphaltTextures() {
  const size = 1024;
  const [color, c] = context2d(size);
  c.fillStyle = '#3a3b3e';
  c.fillRect(0, 0, size, size);
  // Remendos de asfalto (rua de verdade em Osasco tem muitos).
  for (let i = 0; i < 7; i++) {
    c.fillStyle = `rgba(20,20,22,${0.25 + rand() * 0.3})`;
    const w = 80 + rand() * 260;
    const h = 60 + rand() * 160;
    c.fillRect(rand() * size, rand() * size, w, h);
  }
  speckle(c, size, 90_000, 150, 20);
  // Rachaduras.
  c.strokeStyle = 'rgba(12,12,14,0.8)';
  for (let i = 0; i < 14; i++) {
    c.lineWidth = 0.8 + rand() * 1.6;
    c.beginPath();
    let x = rand() * size;
    let y = rand() * size;
    c.moveTo(x, y);
    for (let s = 0; s < 12; s++) {
      x += (rand() - 0.5) * 40;
      y += (rand() - 0.5) * 40;
      c.lineTo(x, y);
    }
    c.stroke();
  }
  const [rough, r] = context2d(256);
  r.fillStyle = '#d8d8d8';
  r.fillRect(0, 0, 256, 256);
  speckle(r, 256, 12_000, 255, 150);
  return {
    map: toTexture(color, [6, 1.2]),
    roughnessMap: toTexture(rough, [24, 4.8], false),
    bumpMap: toTexture(color, [6, 1.2], false),
  };
}

function sidewalkTexture() {
  const size = 512;
  const [canvas, c] = context2d(size);
  c.fillStyle = '#a7a39b';
  c.fillRect(0, 0, size, size);
  speckle(c, size, 30_000, 210, 90);
  // Placas de concreto 50 cm.
  c.strokeStyle = 'rgba(60,58,55,0.7)';
  c.lineWidth = 3;
  for (let i = 0; i <= 4; i++) {
    c.beginPath();
    c.moveTo(0, (i * size) / 4);
    c.lineTo(size, (i * size) / 4);
    c.moveTo((i * size) / 4, 0);
    c.lineTo((i * size) / 4, size);
    c.stroke();
  }
  // Manchas de sujeira.
  for (let i = 0; i < 25; i++) {
    c.fillStyle = `rgba(70,65,55,${rand() * 0.18})`;
    c.beginPath();
    c.arc(rand() * size, rand() * size, 10 + rand() * 40, 0, Math.PI * 2);
    c.fill();
  }
  return toTexture(canvas, [30, 1.4]);
}

function grassTexture() {
  const size = 512;
  const [canvas, c] = context2d(size);
  c.fillStyle = '#4f6b33';
  c.fillRect(0, 0, size, size);
  for (let i = 0; i < 40_000; i++) {
    const g = 70 + rand() * 90;
    c.fillStyle = `rgba(${g * 0.6},${g},${g * 0.35},0.6)`;
    c.fillRect(rand() * size, rand() * size, 1, 2 + rand() * 4);
  }
  return toTexture(canvas, [40, 40]);
}

function plasterTexture(base: string) {
  const size = 256;
  const [canvas, c] = context2d(size);
  c.fillStyle = base;
  c.fillRect(0, 0, size, size);
  speckle(c, size, 6000, 255, 120);
  // Escorrido de chuva perto do topo.
  const gradient = c.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, 'rgba(60,55,50,0.25)');
  gradient.addColorStop(0.25, 'rgba(60,55,50,0)');
  c.fillStyle = gradient;
  c.fillRect(0, 0, size, size);
  return toTexture(canvas, [2, 1]);
}

function facadeTexture(wall: string, lit: boolean) {
  const w = 512;
  const h = 256;
  const [canvas, c] = context2d(w, h);
  c.fillStyle = wall;
  c.fillRect(0, 0, w, h);
  speckle(c, w, 7000, 255, 110);
  const window = (x: number, y: number, ww: number, wh: number) => {
    c.fillStyle = '#f2efe8';
    c.fillRect(x - 6, y - 6, ww + 12, wh + 12);
    const on = lit && rand() < 0.6;
    c.fillStyle = on ? '#ffcf7a' : '#1d2a33';
    c.fillRect(x, y, ww, wh);
    // Grade de ferro, comum nas casas.
    c.strokeStyle = 'rgba(30,30,30,0.85)';
    c.lineWidth = 3;
    for (let gx = x; gx <= x + ww; gx += ww / 4) {
      c.beginPath();
      c.moveTo(gx, y);
      c.lineTo(gx, y + wh);
      c.stroke();
    }
  };
  window(60, 60, 110, 90);
  window(340, 60, 110, 90);
  c.fillStyle = '#5b3a22';
  c.fillRect(215, 90, 80, 166);
  return toTexture(canvas);
}

function roofTexture() {
  const size = 256;
  const [canvas, c] = context2d(size);
  c.fillStyle = '#9c4a2e';
  c.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 16) {
    c.fillStyle = 'rgba(40,10,5,0.45)';
    c.fillRect(0, y, size, 4);
    for (let x = (y / 16) % 2 ? 0 : 12; x < size; x += 24) {
      c.fillStyle = `rgba(${150 + rand() * 60},${60 + rand() * 30},${40},0.35)`;
      c.fillRect(x, y + 4, 22, 12);
    }
  }
  speckle(c, size, 4000, 90, 20);
  return toTexture(canvas, [4, 3]);
}

function signTexture(text: string) {
  const [canvas, c] = context2d(512, 128);
  c.fillStyle = '#0b6b3a';
  c.fillRect(0, 0, 512, 128);
  c.strokeStyle = '#fff';
  c.lineWidth = 6;
  c.strokeRect(8, 8, 496, 112);
  c.fillStyle = '#fff';
  c.font = 'bold 50px sans-serif';
  c.textAlign = 'center';
  c.fillText(text, 256, 82);
  return toTexture(canvas);
}

// ---------- renderer, céu e luz ----------

const canvas = document.getElementById('c') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = dusk ? 0.85 : 0.42;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 6000);
camera.position.set(6.4, 1.05, 4.6);
camera.lookAt(0.2, 0.75, 0.4);

const sky = new Sky();
sky.scale.setScalar(4000);
const sunElevation = dusk ? 2.6 : 9;
const sunAzimuth = 125;
const sun = new THREE.Vector3().setFromSphericalCoords(
  1,
  THREE.MathUtils.degToRad(90 - sunElevation),
  THREE.MathUtils.degToRad(sunAzimuth),
);
sky.material.uniforms.turbidity!.value = dusk ? 9 : 5;
sky.material.uniforms.rayleigh!.value = dusk ? 2.6 : 1.4;
sky.material.uniforms.mieCoefficient!.value = 0.006;
sky.material.uniforms.mieDirectionalG!.value = 0.86;
(sky.material.uniforms.sunPosition!.value as THREE.Vector3).copy(sun);
scene.add(sky);

// Iluminação de ambiente gerada a partir do próprio céu (reflexos na pintura e nos vidros).
const pmrem = new THREE.PMREMGenerator(renderer);
const skyScene = new THREE.Scene();
const skyForEnv = new Sky();
skyForEnv.scale.setScalar(1000);
skyForEnv.material.uniforms = sky.material.uniforms;
skyScene.add(skyForEnv);
scene.environment = pmrem.fromScene(skyScene).texture;
scene.environmentIntensity = 1;
scene.fog = new THREE.Fog(dusk ? 0x8a6a6a : 0xc9b8a0, 40, 260);

const sunLight = new THREE.DirectionalLight(dusk ? 0xff9a5a : 0xffd2a0, dusk ? 1.6 : 2.7);
sunLight.position.copy(sun).multiplyScalar(60);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(4096, 4096);
sunLight.shadow.bias = -0.0002;
sunLight.shadow.normalBias = 0.02;
sunLight.shadow.radius = 4;
Object.assign(sunLight.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 160 });
scene.add(sunLight);
scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x4a3f33, dusk ? 0.15 : 0.35));

// ---------- chão: asfalto, calçadas, meio-fio, grama ----------

const ROAD_HALF = 3.6;
const asphalt = asphaltTextures();
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(120, ROAD_HALF * 2),
  new THREE.MeshStandardMaterial({ ...asphalt, bumpScale: 0.6, roughness: 1, color: 0xffffff }),
);
road.rotation.x = -Math.PI / 2;
road.receiveShadow = true;
scene.add(road);

const paint = (color: number) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 });
const white = paint(0xe9e6dc);
const yellow = paint(0xe0b021);
for (let x = -60; x < 60; x += 6) {
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.12), yellow);
  dash.rotation.x = -Math.PI / 2;
  dash.position.set(x, 0.004, 0);
  dash.receiveShadow = true;
  scene.add(dash);
}
for (const z of [-ROAD_HALF + 0.25, ROAD_HALF - 0.25]) {
  const line = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.12), white);
  line.rotation.x = -Math.PI / 2;
  line.position.set(0, 0.004, z);
  line.receiveShadow = true;
  scene.add(line);
}

const curbMaterial = new THREE.MeshStandardMaterial({ color: 0xbdb8ae, roughness: 0.85 });
const sidewalkMaterial = new THREE.MeshStandardMaterial({ map: sidewalkTexture(), roughness: 0.9 });
for (const side of [-1, 1]) {
  const curb = new THREE.Mesh(new THREE.BoxGeometry(120, 0.16, 0.18), curbMaterial);
  curb.position.set(0, 0.08, side * (ROAD_HALF + 0.09));
  curb.castShadow = curb.receiveShadow = true;
  scene.add(curb);
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(120, 0.15, 2.8), sidewalkMaterial);
  sidewalk.position.set(0, 0.075, side * (ROAD_HALF + 0.18 + 1.4));
  sidewalk.receiveShadow = true;
  scene.add(sidewalk);
}
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(800, 800),
  new THREE.MeshStandardMaterial({ map: grassTexture(), roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.02;
ground.receiveShadow = true;
scene.add(ground);

// ---------- casas com muro (lado oposto da rua) ----------

const WALL_COLORS = ['#e7d3a6', '#cfe3d2', '#f2b8a2', '#bccbe6', '#f3ecd7', '#e9c46a'];
const roofMaterial = new THREE.MeshStandardMaterial({ map: roofTexture(), roughness: 0.75 });
const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x4a5056, metalness: 0.3, roughness: 0.55 });
const FRONT = -(ROAD_HALF + 3.1);

function house(x: number, width: number) {
  const group = new THREE.Group();
  const wall = pick(WALL_COLORS);
  const depth = 7;
  const height = rand() < 0.4 ? 5.8 : 3.1;
  const side = new THREE.MeshStandardMaterial({ map: plasterTexture(wall), roughness: 0.95 });
  const front = new THREE.MeshStandardMaterial({ map: facadeTexture(wall, dusk), roughness: 0.9 });
  if (dusk) {
    front.emissiveMap = front.map;
    front.emissive = new THREE.Color(0xffa040);
    front.emissiveIntensity = 0.12;
  }
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), [
    side,
    side,
    side,
    side,
    front,
    side,
  ]);
  body.position.set(0, height / 2, -depth / 2 - 4);
  body.castShadow = body.receiveShadow = true;
  group.add(body);

  const roofShape = new THREE.Shape();
  roofShape.moveTo(-depth / 2 - 0.5, 0);
  roofShape.lineTo(depth / 2 + 0.5, 0);
  roofShape.lineTo(0, 1.6);
  roofShape.closePath();
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roofShape, { depth: width + 0.8, bevelEnabled: false }),
    roofMaterial,
  );
  roof.rotation.y = Math.PI / 2;
  roof.position.set(-width / 2 - 0.4, height, -depth / 2 - 4);
  roof.castShadow = roof.receiveShadow = true;
  group.add(roof);

  // Muro com portão de ferro: a cara de bairro de Osasco.
  const muroMaterial = new THREE.MeshStandardMaterial({
    map: plasterTexture(pick(WALL_COLORS)),
    roughness: 0.95,
  });
  const muroLeft = new THREE.Mesh(new THREE.BoxGeometry(width * 0.55, 2.1, 0.2), muroMaterial);
  muroLeft.position.set(-width * 0.225, 1.05, 0);
  const gate = new THREE.Mesh(new THREE.BoxGeometry(width * 0.42, 1.95, 0.06), gateMaterial);
  gate.position.set(width * 0.29, 0.98, 0.02);
  for (const m of [muroLeft, gate]) {
    m.castShadow = m.receiveShadow = true;
    group.add(m);
  }
  group.position.set(x, 0.15, FRONT);
  scene.add(group);
}
for (let x = -46; x < 50; x += 0) {
  const width = 7 + rand() * 4;
  house(x + width / 2, width);
  x += width + 0.4;
}

// Prédios ao fundo, para dar profundidade.
const towerMaterial = new THREE.MeshStandardMaterial({ color: 0xb8b2a8, roughness: 0.9 });
for (let i = 0; i < 18; i++) {
  const h = 12 + rand() * 30;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(10 + rand() * 10, h, 10 + rand() * 10), towerMaterial);
  tower.position.set(-80 + rand() * 160, h / 2, -40 - rand() * 60);
  tower.castShadow = true;
  scene.add(tower);
}

// ---------- árvores ----------

function leafTexture(hue: number) {
  const size = 256;
  const [canvas, c] = context2d(size);
  c.clearRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) {
    const x = size / 2 + (rand() - 0.5) * size * 0.85;
    const y = size / 2 + (rand() - 0.5) * size * 0.85;
    if (Math.hypot(x - size / 2, y - size / 2) > size * 0.44) continue;
    const light = 22 + rand() * 26;
    c.fillStyle = `hsl(${hue + (rand() - 0.5) * 18}, ${45 + rand() * 20}%, ${light}%)`;
    c.beginPath();
    c.ellipse(x, y, 5 + rand() * 6, 2.5 + rand() * 3, rand() * Math.PI, 0, Math.PI * 2);
    c.fill();
  }
  return toTexture(canvas, [1, 1]);
}
const leafMaps = [leafTexture(95), leafTexture(105), leafTexture(85)];
const barkMaterial = new THREE.MeshStandardMaterial({ color: 0x4b3a2a, roughness: 1 });

function tree(x: number, z: number, scale: number) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 3.4, 10), barkMaterial);
  trunk.position.y = 1.7;
  group.add(trunk);
  for (let b = 0; b < 4; b++) {
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 1.6, 6), barkMaterial);
    branch.position.set((rand() - 0.5) * 0.6, 3.4, (rand() - 0.5) * 0.6);
    branch.rotation.set((rand() - 0.5) * 1.2, rand() * Math.PI, (rand() - 0.5) * 1.2);
    group.add(branch);
  }
  const map = pick(leafMaps);
  const leaves = new THREE.MeshStandardMaterial({
    map,
    alphaTest: 0.45,
    side: THREE.DoubleSide,
    roughness: 0.8,
  });
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.45 });
  const cards = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.3, 1.3), leaves, 140);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  for (let i = 0; i < cards.count; i++) {
    // Pontos dentro de um elipsoide (copa), mais densos por fora.
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const r = 0.55 + rand() * 0.45;
    p.set(
      Math.sin(v) * Math.cos(u) * 2.1 * r,
      4.4 + Math.cos(v) * 1.5 * r,
      Math.sin(v) * Math.sin(u) * 2.1 * r,
    );
    q.setFromEuler(e.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI));
    const s = 0.8 + rand() * 0.6;
    m.compose(p, q, new THREE.Vector3(s, s, s));
    cards.setMatrixAt(i, m);
  }
  cards.customDepthMaterial = depth;
  group.add(cards);
  group.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  group.scale.setScalar(scale);
  group.position.set(x, 0.15, z);
  scene.add(group);
}
tree(-9, -(ROAD_HALF + 2.2), 1.1);
tree(13, -(ROAD_HALF + 2.3), 1.25);
tree(-24, -(ROAD_HALF + 2.2), 1);
tree(-15, ROAD_HALF + 2.4, 1.2);

// ---------- postes com fiação e placa de rua ----------

const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8a8a84, roughness: 0.9 });
const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
const poleXs = [-30, -10, 10, 30];
const poleZ = -(ROAD_HALF + 0.7);
for (const x of poleXs) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 9, 10), woodMaterial);
  pole.position.set(x, 4.5, poleZ);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.8), woodMaterial);
  arm.position.set(x, 8.3, poleZ);
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), gateMaterial);
  lampArm.rotation.x = Math.PI / 2;
  lampArm.position.set(x, 7, poleZ + 0.8);
  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.12, 0.25),
    new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      emissive: 0xffc070,
      emissiveIntensity: dusk ? 6 : 0,
    }),
  );
  lamp.position.set(x, 6.92, poleZ + 1.6);
  for (const m of [pole, arm, lampArm, lamp]) {
    m.castShadow = true;
    scene.add(m);
  }
  if (dusk) {
    const light = new THREE.PointLight(0xffb060, 18, 18, 1.6);
    light.position.set(x, 6.7, poleZ + 1.6);
    scene.add(light);
  }
}
for (let i = 0; i < poleXs.length - 1; i++) {
  for (const offset of [-0.7, 0, 0.7]) {
    const a = new THREE.Vector3(poleXs[i] ?? 0, 8.4, poleZ + offset);
    const b = new THREE.Vector3(poleXs[i + 1] ?? 0, 8.4, poleZ + offset);
    const points = Array.from({ length: 20 }, (_, k) => {
      const t = k / 19;
      const p = a.clone().lerp(b, t);
      p.y -= Math.sin(Math.PI * t) * 0.55;
      return p;
    });
    const wire = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 40, 0.012, 4),
      wireMaterial,
    );
    scene.add(wire);
  }
}
const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8, 8), gateMaterial);
signPole.position.set(4.5, 1.55, -(ROAD_HALF + 0.5));
const sign = new THREE.Mesh(
  new THREE.PlaneGeometry(1.6, 0.4),
  new THREE.MeshStandardMaterial({ map: signTexture('R. DOS DEVS'), roughness: 0.5 }),
);
sign.position.set(4.5, 2.85, -(ROAD_HALF + 0.48));
signPole.castShadow = sign.castShadow = true;
scene.add(signPole, sign);

// ---------- o carro do estagiário ----------

const car = buildCar({ lightsOn: dusk });
car.position.set(0, 0, 1.75);
car.rotation.y = -0.06;
scene.add(car);

const contactShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(4.8, 2.3),
  new THREE.MeshBasicMaterial({
    map: contactShadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.75,
  }),
);
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.set(0, 0.006, 1.75);
scene.add(contactShadow);

// ---------- pós-processamento ----------

const width = window.innerWidth;
const height = window.innerHeight;
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, width, height);
gtao.blendIntensity = 0.9;
composer.addPass(gtao);
composer.addPass(
  new UnrealBloomPass(new THREE.Vector2(width, height), dusk ? 0.45 : 0.06, 0.4, dusk ? 0.85 : 0.98),
);
composer.addPass(new OutputPass());
composer.addPass(new SMAAPass());

function render() {
  composer.render();
  document.body.dataset.ready = '1';
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  composer.setSize(window.innerWidth, window.innerHeight);
  render();
});

render();
