/**
 * Garagem / concessionária: o carro em luz de estúdio, como num configurador.
 * Parâmetros: ?carro=quadradinho  &angulo=frente|tras|lado|dentro  &cor=c8c2b4
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

const params = new URLSearchParams(location.search);
const carName = params.get('carro') ?? 'quadradinho';
const angle = params.get('angulo') ?? 'frente';
const paintColor = params.get('cor');

const canvas = document.getElementById('c') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1c20);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.9;

// Piso de estúdio com leve reflexo e um degradê ao fundo.
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(14, 64),
  new THREE.MeshStandardMaterial({ color: 0x2a2b30, roughness: 0.35, metalness: 0.1 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
scene.fog = new THREE.Fog(0x1b1c20, 9, 20);

const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(4, 7, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.radius = 6;
key.shadow.bias = -0.0005;
Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
scene.add(key);
const rim = new THREE.DirectionalLight(0xbcd2ff, 1.2);
rim.position.set(-5, 3, -4);
scene.add(rim);
// Faixas de luz no teto: o reflexo comprido na lataria, típico de foto de estúdio.
for (const z of [-1.2, 1.2]) {
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
  );
  strip.rotation.x = Math.PI / 2;
  strip.position.set(0, 5, z);
  scene.add(strip);
}

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.05, 100);
const views: Record<
  string,
  { eye: [number, number, number]; target: [number, number, number]; fov?: number }
> = {
  frente: { eye: [5.2, 1.35, 4.2], target: [0, 0.6, 0] },
  tras: { eye: [-5.2, 1.5, 4.0], target: [0, 0.6, 0] },
  lado: { eye: [0, 0.9, 7.2], target: [0, 0.65, 0] },
  // Banco do motorista (lado esquerdo do carro = -Z no Three.js), olhando para a frente.
  dentro: { eye: [-0.35, 1.18, -0.36], target: [3, 0.95, -0.36], fov: 62 },
};
const v = views[angle] ?? views.frente!;
camera.fov = v.fov ?? 30;
camera.updateProjectionMatrix();
camera.position.set(...v.eye);
camera.lookAt(new THREE.Vector3(...v.target));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, window.innerWidth, window.innerHeight);
gtao.blendIntensity = 0.8;
composer.addPass(gtao);
composer.addPass(new OutputPass());
composer.addPass(new SMAAPass());

new GLTFLoader().load(new URL(`../public/models/carros/${carName}.glb`, import.meta.url).href, (gltf) => {
  const car = gltf.scene;
  car.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const m of materials as THREE.MeshStandardMaterial[]) {
      if (m.name === 'Glass' || m.name === 'Lens') {
        m.transparent = true;
        m.opacity = m.name === 'Lens' ? 0.25 : 0.38;
        m.depthWrite = false;
        m.envMapIntensity = 1.6;
      }
      if (m.name === 'Paint' && paintColor) m.color.set(`#${paintColor}`);
    }
  });
  scene.add(car);
  composer.render();
  document.body.dataset.ready = '1';
});
