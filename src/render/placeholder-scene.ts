/**
 * Cena provisória da Fase 0: estrada sem fim, um caminhão simples e câmera de perseguição.
 * Será substituída pelo mapa real (Fase 1) e pelo caminhão com física (Fase 2).
 */
import * as THREE from 'three';

const ROAD_WIDTH = 12;
const TILE_LENGTH = 40;
const TILE_COUNT = 12;
const DASH_SPACING = 10;

export interface PlaceholderScene {
  /** Avança a simulação. `speed` em m/s. */
  update(dtSeconds: number, speed: number): void;
  render(): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

function createTruck(): { group: THREE.Group; wheels: THREE.Mesh[] } {
  const group = new THREE.Group();
  const cabMaterial = new THREE.MeshStandardMaterial({ color: 0x1f6feb, roughness: 0.5, metalness: 0.2 });
  const trailerMaterial = new THREE.MeshStandardMaterial({ color: 0xe6e6e6, roughness: 0.8 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x9fd3ff, roughness: 0.1, metalness: 0.5 });

  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.6, 2.4), cabMaterial);
  cab.position.set(0, 2.1, -6.2);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 0.05), glassMaterial);
  windshield.position.set(0, 2.7, -7.42);
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 14), darkMaterial);
  chassis.position.set(0, 0.9, 0);
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.0, 11), trailerMaterial);
  trailer.position.set(0, 2.7, 1.2);
  group.add(cab, windshield, chassis, trailer);

  const wheels: THREE.Mesh[] = [];
  const wheelGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 20);
  wheelGeometry.rotateZ(Math.PI / 2);
  for (const z of [-6.2, -1, 3.2, 4.6]) {
    for (const x of [-1.2, 1.2]) {
      const wheel = new THREE.Mesh(wheelGeometry, darkMaterial);
      wheel.position.set(x, 0.55, z);
      wheels.push(wheel);
      group.add(wheel);
    }
  }
  for (const mesh of group.children) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }
  return { group, wheels };
}

function createRoadTile(): THREE.Group {
  const tile = new THREE.Group();
  const asphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(ROAD_WIDTH, TILE_LENGTH),
    new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.95 }),
  );
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.receiveShadow = true;
  tile.add(asphalt);

  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xf2f2f2 });
  const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xf5c518 });
  for (const x of [-ROAD_WIDTH / 2 + 0.3, ROAD_WIDTH / 2 - 0.3]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.2, TILE_LENGTH), lineMaterial);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.01, 0);
    tile.add(edge);
  }
  for (let z = -TILE_LENGTH / 2; z < TILE_LENGTH / 2; z += DASH_SPACING) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 4), dashMaterial);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.01, z + 2);
    tile.add(dash);
  }
  return tile;
}

function createScenery(): THREE.Group {
  const scenery = new THREE.Group();
  const trunk = new THREE.MeshStandardMaterial({ color: 0x6b4423 });
  const leaves = new THREE.MeshStandardMaterial({ color: 0x2f7d32, roughness: 1 });
  const building = new THREE.MeshStandardMaterial({ color: 0xc9b79c, roughness: 0.9 });
  const random = mulberry32(42);
  for (let i = 0; i < 60; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (ROAD_WIDTH / 2 + 6 + random() * 40);
    const z = -((TILE_LENGTH * TILE_COUNT) / 2) + random() * TILE_LENGTH * TILE_COUNT;
    if (random() < 0.25) {
      const h = 6 + random() * 18;
      const block = new THREE.Mesh(new THREE.BoxGeometry(8 + random() * 8, h, 8 + random() * 8), building);
      block.position.set(x + side * 15, h / 2, z);
      block.castShadow = true;
      scenery.add(block);
    } else {
      const tree = new THREE.Group();
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2), trunk);
      t.position.y = 1;
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4, 8), leaves);
      crown.position.y = 3.8;
      tree.add(t, crown);
      tree.position.set(x, 0, z);
      tree.children.forEach((c) => (c.castShadow = true));
      scenery.add(tree);
    }
  }
  return scenery;
}

/** Gerador pseudoaleatório com semente, para a cena ser sempre igual. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createPlaceholderScene(canvas: HTMLCanvasElement): PlaceholderScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const sky = new THREE.Color(0xa8d4f0);
  scene.background = sky;
  scene.fog = new THREE.Fog(sky, 80, 380);

  scene.add(new THREE.HemisphereLight(0xdff1ff, 0x5a7a3a, 1.2));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.position.set(-30, 60, -20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 150 });
  scene.add(sun, sun.target);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x6f9a4a, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const tiles: THREE.Group[] = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    const tile = createRoadTile();
    tile.position.z = -TILE_LENGTH * (i - 2);
    tiles.push(tile);
    scene.add(tile);
  }
  const scenery = createScenery();
  scene.add(scenery);

  const { group: truck, wheels } = createTruck();
  truck.position.x = ROAD_WIDTH / 4;
  scene.add(truck);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(ROAD_WIDTH / 4 + 4, 7, 20);
  camera.lookAt(truck.position.x, 2.5, -8);

  const wrapLength = TILE_LENGTH * TILE_COUNT;
  let elapsed = 0;

  return {
    update(dt, speed) {
      elapsed += dt;
      const distance = speed * dt;
      // O caminhão fica parado na origem e o mundo se move para trás.
      for (const tile of tiles) {
        tile.position.z += distance;
        if (tile.position.z > TILE_LENGTH * 2) tile.position.z -= wrapLength;
      }
      for (const item of scenery.children) {
        item.position.z += distance;
        if (item.position.z > TILE_LENGTH * 2) item.position.z -= wrapLength;
      }
      for (const wheel of wheels) wheel.rotation.x -= distance / 0.55;
      truck.position.y = Math.sin(elapsed * 9) * 0.02;
    },
    render() {
      renderer.render(scene, camera);
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    },
    dispose() {
      renderer.dispose();
    },
  };
}
