/**
 * Provador: o dev (personagem do Kenney, CC0) em luz de estúdio, com skin e animação escolhidas pela URL.
 * ?skin=skaterMaleA|skaterFemaleA|criminalMaleA|cyborgFemaleA  &anim=Idle|Run|Jump  &t=0.4 (segundos)
 * &enquadrar=corpo|rosto|costas
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

const q = new URLSearchParams(location.search);
const skin = q.get('skin') ?? 'skaterMaleA';
const animName = q.get('anim') ?? 'Idle';
const time = Number(q.get('t') ?? '0.4');
const frameName = q.get('enquadrar') ?? 'corpo';

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
scene.environmentIntensity = 0.8;

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 64),
  new THREE.MeshStandardMaterial({ color: 0x35303f, roughness: 0.6 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
key.position.set(2.5, 4, 3.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.radius = 5;
key.shadow.bias = -0.0004;
Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2.5, bottom: -0.5, near: 0.5, far: 12 });
scene.add(key);
const rim = new THREE.DirectionalLight(0xb8c8ff, 1.4);
rim.position.set(-3, 3, -3);
scene.add(rim);

const frames: Record<
  string,
  { eye: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  corpo: { eye: [1.2, 1.2, 3.4], target: [0, 0.9, 0], fov: 32 },
  rosto: { eye: [0.25, 1.55, 1.1], target: [0, 1.45, 0], fov: 30 },
  costas: { eye: [-1.3, 1.3, -3.2], target: [0, 0.95, 0], fov: 32 },
};
const frame = frames[frameName] ?? frames.corpo!;
const camera = new THREE.PerspectiveCamera(frame.fov, window.innerWidth / window.innerHeight, 0.02, 50);
camera.position.set(...frame.eye);
camera.lookAt(new THREE.Vector3(...frame.target));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());
composer.addPass(new SMAAPass());

const skinUrl = new URL(`../public/models/personagem/skins/${skin}.png`, import.meta.url).href;
const skinTexture = new THREE.TextureLoader().loadAsync(skinUrl);

new GLTFLoader().load(new URL('../public/models/personagem/dev.glb', import.meta.url).href, (gltf) => {
  void skinTexture.then((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false; // texturas de glTF não são invertidas
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const material = object.material as THREE.MeshStandardMaterial;
      material.map = texture;
      material.transparent = false;
      material.opacity = 1;
      material.needsUpdate = true;
    });
    scene.add(gltf.scene);

    // Pose da animação escolhida num instante fixo (para a captura ficar sempre igual).
    const mixer = new THREE.AnimationMixer(gltf.scene);
    const clip = THREE.AnimationClip.findByName(gltf.animations, animName) ?? gltf.animations[0];
    console.log(
      'clips',
      gltf.animations
        .map((a) => `${a.name}:${a.duration.toFixed(2)}:${a.tracks.length}:${a.tracks[0]?.name}`)
        .join(' '),
    );
    if (clip) {
      mixer.clipAction(clip).play();
      mixer.setTime(time % clip.duration);
    }
    const box = new THREE.Box3().setFromObject(gltf.scene);
    document.body.dataset.size = `${box.min
      .toArray()
      .map((v) => v.toFixed(2))
      .join(',')} | ${box.max
      .toArray()
      .map((v) => v.toFixed(2))
      .join(',')}`;
    composer.render();
    document.body.dataset.ready = '1';
  });
});
