/**
 * Terreno com textura fotográfica: grama e terra misturadas por vértice (atributo `dirt`) e tingidas
 * pela cor de vértice (capim seco, terra vermelha na beira da estrada, pedra nas encostas).
 */
import * as THREE from 'three';
import { noise } from './landscape';
import { ROAD_HALF_WIDTH, type RoadLoop } from './road';

export interface GroundTextures {
  grass: THREE.Texture;
  dirt: THREE.Texture;
}

export function createTerrainMaterial({ grass, dirt }: GroundTextures): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.grassMap = { value: grass };
    shader.uniforms.dirtMap = { value: dirt };
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
        // Duas escalas de grama quebram a repetição da textura.
        vec3 grassNear = texture2D(grassMap, vGround.xz / 5.0).rgb;
        vec3 grassFar = texture2D(grassMap, vGround.xz / 37.0).rgb;
        vec3 dirtTex = texture2D(dirtMap, vGround.xz / 3.5).rgb;
        vec3 grass = mix(grassNear, grassFar, 0.35);
        diffuseColor.rgb *= mix(grass, dirtTex, clamp(vDirt, 0.0, 1.0)) * 2.2;
        `,
      );
  };
  return material;
}

const white = new THREE.Color(1, 1, 1);
const dryTint = new THREE.Color(1.25, 1.05, 0.72);
const redTint = new THREE.Color(1.45, 0.78, 0.55);
const rockTint = new THREE.Color(0.95, 0.9, 0.85);

export function buildTerrain(
  size: number,
  segments: number,
  height: (x: number, z: number) => number,
  material: THREE.Material,
  road: RoadLoop | null,
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  const dirt = new Float32Array(pos.count);
  const tint = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, height(x, z));
    const dry = noise.fbm(x / 180 + 40, z / 180, 2);
    tint.copy(white).lerp(dryTint, Math.min(1, Math.max(0, (dry - 0.35) * 2.2)));
    tint.multiplyScalar(0.85 + noise.fbm(x / 40, z / 40, 2) * 0.3);
    if (road) {
      // Terra vermelha no acostamento.
      const { dist } = road.nearest(x, z);
      const shoulder = dist < ROAD_HALF_WIDTH + 3.5 ? 1 : Math.max(0, 1 - (dist - ROAD_HALF_WIDTH - 3.5) / 7);
      dirt[i] = shoulder;
      tint.lerp(redTint, shoulder * 0.9);
    }
    colors.set([tint.r, tint.g, tint.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  // Encostas íngremes: terra e pedra aparecendo.
  const normals = geometry.getAttribute('normal');
  for (let i = 0; i < pos.count; i++) {
    const slope = 1 - normals.getY(i);
    if (slope > 0.16) {
      const k = Math.min(1, (slope - 0.16) * 3);
      dirt[i] = Math.max(dirt[i] ?? 0, k);
      tint.fromArray(colors, i * 3).lerp(slope > 0.4 ? rockTint : redTint, k);
      colors.set([tint.r, tint.g, tint.b], i * 3);
    }
  }
  geometry.setAttribute('dirt', new THREE.BufferAttribute(dirt, 1));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}
