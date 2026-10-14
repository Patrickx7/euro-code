/** Céu, névoa, sol e luz ambiente. O "clima" do estilo vem quase todo da névoa e da gradação de cor. */
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export interface Mood {
  sunElevation: number;
  sunAzimuth: number;
  exposure: number;
  haze: number;
  fogDensity: number;
  sunColor: number;
  sunIntensity: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  /** Multiplicador de cor da gradação final. */
  tint: [number, number, number];
  turbidity: number;
  rayleigh: number;
}

/** Fim de tarde dourado (o horário padrão do protótipo). */
export const GOLDEN_HOUR: Mood = {
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

export interface Atmosphere {
  /** Direção do sol (unitária). */
  sunDirection: THREE.Vector3;
  sunLight: THREE.DirectionalLight;
  /** Sol e sombras acompanham o carro. */
  follow(target: THREE.Vector3, forward: THREE.Vector3): void;
}

export function createAtmosphere(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  mood: Mood,
  shadowMapSize: number,
): Atmosphere {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mood.exposure;

  const sunDirection = new THREE.Vector3().setFromSphericalCoords(
    1,
    THREE.MathUtils.degToRad(90 - mood.sunElevation),
    THREE.MathUtils.degToRad(mood.sunAzimuth),
  );
  const sky = new Sky();
  sky.scale.setScalar(15000);
  const uniforms = sky.material.uniforms;
  if (uniforms.turbidity) uniforms.turbidity.value = mood.turbidity;
  if (uniforms.rayleigh) uniforms.rayleigh.value = mood.rayleigh;
  if (uniforms.mieCoefficient) uniforms.mieCoefficient.value = 0.006;
  if (uniforms.mieDirectionalG) uniforms.mieDirectionalG.value = 0.86;
  (uniforms.sunPosition?.value as THREE.Vector3 | undefined)?.copy(sunDirection);
  scene.add(sky);

  // Reflexos (IBL) a partir do mesmo céu.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envSky = new Sky();
  envSky.scale.setScalar(1000);
  envSky.material.uniforms = sky.material.uniforms;
  envScene.add(envSky);
  scene.environment = pmrem.fromScene(envScene).texture;
  scene.environmentIntensity = 0.7;
  pmrem.dispose();

  scene.fog = new THREE.FogExp2(mood.haze, mood.fogDensity);

  const sunLight = new THREE.DirectionalLight(mood.sunColor, mood.sunIntensity);
  if (shadowMapSize > 0) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.06;
    Object.assign(sunLight.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 1, far: 800 });
  }
  scene.add(sunLight, sunLight.target);
  scene.add(new THREE.HemisphereLight(mood.hemiSky, mood.hemiGround, mood.hemiIntensity));

  return {
    sunDirection,
    sunLight,
    follow(target, forward) {
      sunLight.position.copy(target).addScaledVector(sunDirection, 400);
      sunLight.target.position.copy(target).addScaledVector(forward, 30);
    },
  };
}
