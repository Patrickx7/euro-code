/**
 * Provador: o dev em luz de estúdio, com as variações de personalização escolhidas pela URL.
 * ?cabelo=curto|cacheado|coque|longo|careca &barba=cheia|bigode|nenhuma &oculos=1|0
 * &roupa=moletom|camiseta|xadrez &mochila=1|0 &pele=c98b62 &corCabelo=2a1d16 &corRoupa=5a3f8c
 * &enquadrar=corpo|rosto|maos|costas
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

const q = new URLSearchParams(location.search);
const choice = {
  hair: q.get('cabelo') ?? 'curto',
  beard: q.get('barba') ?? 'cheia',
  glasses: q.get('oculos') !== '0',
  top: q.get('roupa') ?? 'moletom',
  backpack: q.get('mochila') !== '0',
  skin: q.get('pele'),
  hairColor: q.get('corCabelo'),
  topColor: q.get('corRoupa'),
  frame: q.get('enquadrar') ?? 'corpo',
};

const canvas = document.getElementById('c') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x231f2b);
scene.fog = new THREE.Fog(0x231f2b, 6, 14);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 64),
  new THREE.MeshStandardMaterial({ color: 0x35303f, roughness: 0.6 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const key = new THREE.DirectionalLight(0xfff1e0, 2.4);
key.position.set(2.5, 4, 3.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.radius = 5;
key.shadow.bias = -0.0004;
Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2.5, bottom: -0.5, near: 0.5, far: 12 });
scene.add(key);
const rim = new THREE.DirectionalLight(0xb8c8ff, 1.6);
rim.position.set(-3, 3, -3);
scene.add(rim);

const frames: Record<
  string,
  { eye: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  corpo: { eye: [1.3, 1.15, 3.6], target: [0, 0.92, 0], fov: 32 },
  rosto: { eye: [0.22, 1.67, 0.62], target: [0, 1.64, 0], fov: 30 },
  maos: { eye: [0.75, 0.95, 0.55], target: [0.3, 0.84, 0], fov: 30 },
  costas: { eye: [-1.4, 1.3, -3.3], target: [0, 1.0, 0], fov: 32 },
};
const frame = frames[choice.frame] ?? frames.corpo!;
const camera = new THREE.PerspectiveCamera(frame.fov, window.innerWidth / window.innerHeight, 0.02, 50);
camera.position.set(...frame.eye);
camera.lookAt(new THREE.Vector3(...frame.target));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, window.innerWidth, window.innerHeight);
gtao.blendIntensity = 0.7;
composer.addPass(gtao);
composer.addPass(new OutputPass());
composer.addPass(new SMAAPass());

const capitalized = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const visible = new Set<string>([
  `Hair_${capitalized(choice.hair)}`,
  `Beard_${capitalized(choice.beard)}`,
  `Top_${capitalized(choice.top)}`,
  ...(choice.glasses ? ['Glasses_Redondo'] : []),
  ...(choice.backpack ? ['Backpack'] : []),
]);

new GLTFLoader().load(new URL('../public/models/personagem/dev.glb', import.meta.url).href, (gltf) => {
  gltf.scene.traverse((object) => {
    // Peças com vários materiais viram vários filhos (ex.: Top_Moletom_1): vale o prefixo.
    const variant = /^((Hair|Beard|Glasses|Top)_[A-Za-z]+|Backpack)/.exec(object.name)?.[1];
    if (variant) object.visible = visible.has(variant);
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = (
      Array.isArray(object.material) ? object.material : [object.material]
    ) as THREE.MeshStandardMaterial[];
    for (const m of materials) {
      if (m.name === 'Skin' && choice.skin) m.color.set(`#${choice.skin}`);
      if (m.name === 'Hair' && choice.hairColor) m.color.set(`#${choice.hairColor}`);
      if (m.name === 'Top' && choice.topColor) m.color.set(`#${choice.topColor}`);
    }
  });
  scene.add(gltf.scene);
  composer.render();
  document.body.dataset.ready = '1';
});
