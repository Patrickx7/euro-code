/** Pós-processamento: bloom leve, gradação de cor (dessaturada, pretos levantados, vinheta) e SMAA. */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: 0.78 },
    tint: { value: new THREE.Vector3(1, 1, 1) },
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

export function createComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: { bloom: boolean; tint: [number, number, number] },
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (options.bloom) composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.15, 0.7, 0.9));
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  (grade.uniforms.tint?.value as THREE.Vector3 | undefined)?.set(...options.tint);
  composer.addPass(grade);
  composer.addPass(new SMAAPass());
  return composer;
}
