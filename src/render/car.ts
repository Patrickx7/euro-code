/**
 * Carrega o modelo glTF de um carro (`public/models/carros/`). No glTF a frente aponta para +X, a
 * pintura usa o material `Paint` e as rodas são os objetos `Wheel_FL/FR/RL/RR` (eixo = Z local).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export interface CarView {
  group: THREE.Group;
  /** Gira as rodas conforme a distância percorrida. */
  roll(distance: number): void;
}

export function loadCar(modelFile: string, paint: string, onLoad?: () => void): CarView {
  const group = new THREE.Group();
  const wheels: THREE.Object3D[] = [];
  let wheelRadius = 0.29;

  // Silhueta simples enquanto o modelo carrega.
  const standIn = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.2, 1.6),
    new THREE.MeshStandardMaterial({ color: `#${paint}`, roughness: 0.6 }),
  );
  standIn.position.y = 0.75;
  standIn.castShadow = true;
  group.add(standIn);

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    `${import.meta.env.BASE_URL}models/carros/${modelFile}`,
    (gltf) => {
      gltf.scene.traverse((object) => {
        if (/^Wheel_(FL|FR|RL|RR)$/.test(object.name)) wheels.push(object);
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const materials = (
          Array.isArray(object.material) ? object.material : [object.material]
        ) as THREE.MeshStandardMaterial[];
        for (const m of materials) {
          if (m.name === 'Paint') m.color.set(`#${paint}`);
          if (m.name === 'Glass' || m.name === 'Lens') {
            m.transparent = true;
            m.opacity = m.name === 'Lens' ? 0.25 : 0.4;
            m.depthWrite = false;
          }
          // A luz do céu (IBL) não sabe que o carro tem teto: por dentro ela precisa ser bem mais fraca.
          if (['Interior', 'InteriorLight', 'Seat', 'Gauges'].includes(m.name)) m.envMapIntensity = 0.15;
        }
      });
      const firstWheel = wheels[0];
      if (firstWheel) {
        const size = new THREE.Box3().setFromObject(firstWheel).getSize(new THREE.Vector3());
        wheelRadius = size.y / 2;
      }
      group.remove(standIn);
      group.add(gltf.scene);
      onLoad?.();
    },
    undefined,
    (err) => console.warn('Não foi possível carregar o modelo do carro.', err),
  );

  return {
    group,
    roll(distance) {
      for (const wheel of wheels) wheel.rotation.z -= distance / wheelRadius;
    },
  };
}
