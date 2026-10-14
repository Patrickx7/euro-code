/** O carro do estagiário: popular anos 90 modelado com curvas (prévias visuais). */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { plateTexture, stickerTexture } from './lib';

export function buildCar({ lightsOn }: { lightsOn: boolean }) {
  const dusk = lightsOn;
  const car = new THREE.Group();
  const paintMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x24527d,
    metalness: 0.35,
    roughness: 0.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.8,
  });
  // A porta trocada no ferro-velho, sem pintura.
  const primerMaterial = new THREE.MeshStandardMaterial({ color: 0x8c8f93, roughness: 0.85 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0c1116,
    metalness: 0.1,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.4,
  });
  const plasticMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1b1d,
    roughness: 0.85,
    envMapIntensity: 0.35,
  });
  const chromeMaterial = new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: 1, roughness: 0.15 });
  const rubberMaterial = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.92 });
  const steelRimMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a9da1,
    metalness: 0.8,
    roughness: 0.35,
  });

  // Carroceria: perfil lateral com as caixas de roda recortadas, extrudado com bordas arredondadas.
  const WHEEL_X = 1.2;
  const ARCH_R = 0.4;
  const body = new THREE.Shape();
  body.moveTo(-1.9, 0.28);
  body.lineTo(-WHEEL_X - ARCH_R, 0.28);
  body.lineTo(-WHEEL_X - ARCH_R, 0.32);
  body.absarc(-WHEEL_X, 0.32, ARCH_R, Math.PI, 0, true);
  body.lineTo(-WHEEL_X + ARCH_R, 0.28);
  body.lineTo(WHEEL_X - ARCH_R, 0.28);
  body.lineTo(WHEEL_X - ARCH_R, 0.32);
  body.absarc(WHEEL_X, 0.32, ARCH_R, Math.PI, 0, true);
  body.lineTo(WHEEL_X + ARCH_R, 0.28);
  body.lineTo(1.88, 0.28);
  body.quadraticCurveTo(1.99, 0.29, 1.99, 0.42);
  body.lineTo(1.99, 0.64);
  body.quadraticCurveTo(1.97, 0.77, 1.78, 0.8);
  body.quadraticCurveTo(1.3, 0.86, 0.92, 0.93);
  body.lineTo(-1.58, 0.95);
  body.quadraticCurveTo(-1.94, 0.95, -1.97, 0.78);
  body.lineTo(-1.99, 0.44);
  body.quadraticCurveTo(-1.99, 0.29, -1.9, 0.28);
  const bodyGeometry = new THREE.ExtrudeGeometry(body, {
    depth: 1.46,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.06,
    bevelSegments: 8,
    curveSegments: 32,
  });
  bodyGeometry.translate(0, 0, -0.73);
  car.add(new THREE.Mesh(bodyGeometry, paintMaterial));

  // Cabine (teto e colunas) e vidros.
  const cabin = new THREE.Shape();
  cabin.moveTo(-1.6, 0.93);
  cabin.quadraticCurveTo(-1.42, 1.25, -1.2, 1.39);
  cabin.quadraticCurveTo(-0.5, 1.43, 0.2, 1.42);
  cabin.quadraticCurveTo(0.32, 1.41, 0.38, 1.35);
  cabin.lineTo(0.95, 0.93);
  cabin.closePath();
  const cabinGeometry = new THREE.ExtrudeGeometry(cabin, {
    depth: 1.2,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.05,
    bevelSegments: 6,
    curveSegments: 24,
  });
  cabinGeometry.translate(0, 0, -0.6);
  car.add(new THREE.Mesh(cabinGeometry, paintMaterial));

  const sideGlass = new THREE.Shape();
  sideGlass.moveTo(-1.45, 0.99);
  sideGlass.quadraticCurveTo(-1.33, 1.2, -1.16, 1.32);
  sideGlass.lineTo(0.18, 1.35);
  sideGlass.lineTo(0.78, 0.99);
  sideGlass.closePath();
  const sideGlassGeometry = new THREE.ExtrudeGeometry(sideGlass, { depth: 1.39, bevelEnabled: false });
  sideGlassGeometry.translate(0, 0, -0.695);
  car.add(new THREE.Mesh(sideGlassGeometry, glassMaterial));
  // Coluna B.
  const bPillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 1.41), paintMaterial);
  bPillar.position.set(-0.38, 1.16, 0);
  car.add(bPillar);

  const slopedGlass = (from: THREE.Vector2, to: THREE.Vector2, outward: number) => {
    const length = from.distanceTo(to);
    const dir = to.clone().sub(from).normalize();
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.02, length * 0.9, 1.16), glassMaterial);
    glass.rotation.z = Math.atan2(-dir.x, dir.y);
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const normal = new THREE.Vector2(dir.y, -dir.x).multiplyScalar(outward);
    glass.position.set(mid.x + normal.x * 0.09, mid.y + normal.y * 0.09, 0);
    car.add(glass);
  };
  slopedGlass(new THREE.Vector2(0.92, 0.95), new THREE.Vector2(0.33, 1.38), 1); // para-brisa
  slopedGlass(new THREE.Vector2(-1.58, 0.95), new THREE.Vector2(-1.22, 1.37), -1); // vigia traseira

  // Para-choques, grade, faróis e lanternas.
  const frontBumper = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.24, 1.66, 4, 0.08), plasticMaterial);
  frontBumper.position.set(2.0, 0.4, 0);
  const rearBumper = frontBumper.clone();
  rearBumper.position.x = -2.0;
  const grille = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.12, 0.7, 2, 0.02), plasticMaterial);
  grille.position.set(2.07, 0.66, 0);
  car.add(frontBumper, rearBumper, grille);

  const headlightMaterial = new THREE.MeshPhysicalMaterial({
    color: dusk ? 0xf8f6ef : 0x9fa6aa,
    metalness: dusk ? 0 : 0.6,
    emissive: 0xfff1d0,
    emissiveIntensity: dusk ? 8 : 0,
    roughness: 0.05,
    clearcoat: 1,
  });
  const tailMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8a0d0d,
    emissive: 0xff2010,
    emissiveIntensity: dusk ? 3 : 0,
    roughness: 0.1,
    clearcoat: 1,
  });
  for (const side of [-1, 1]) {
    const head = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.16, 0.36, 3, 0.03), headlightMaterial);
    head.position.set(2.05, 0.66, side * 0.58);
    const tail = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.22, 0.2, 3, 0.03), tailMaterial);
    tail.position.set(-2.06, 0.72, side * 0.64);
    const mirror = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.12, 0.1, 3, 0.03), plasticMaterial);
    mirror.position.set(0.72, 1.02, side * 0.9);
    const handle = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.035, 0.03, 2, 0.012), chromeMaterial);
    handle.position.set(-0.2, 0.86, side * 0.84);
    car.add(head, tail, mirror, handle);
  }
  if (dusk) {
    for (const side of [-1, 1]) {
      const beam = new THREE.SpotLight(0xfff0d0, 40, 30, 0.45, 0.6, 1.5);
      beam.position.set(2.1, 0.66, side * 0.58);
      beam.target.position.set(12, 0, side * 0.9);
      car.add(beam, beam.target);
    }
  }

  // Frisos das portas e a porta de outra cor.
  const doorLineMaterial = new THREE.MeshStandardMaterial({ color: 0x14181c, roughness: 0.6 });
  for (const x of [0.4, -0.38, -1.25]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.56, 1.682), doorLineMaterial);
    line.position.set(x, 0.62, 0);
    car.add(line);
  }
  const primerDoor = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.56, 0.02, 2, 0.008), primerMaterial);
  primerDoor.position.set(0.01, 0.62, 0.832);
  const sticker = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.17),
    new THREE.MeshStandardMaterial({ map: stickerTexture(), transparent: true, roughness: 0.4 }),
  );
  sticker.position.set(-0.85, 0.58, 0.835);
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.125),
    new THREE.MeshStandardMaterial({ map: plateTexture('DEV1A23'), roughness: 0.4 }),
  );
  plate.rotation.y = Math.PI / 2;
  plate.position.set(2.115, 0.4, 0);
  car.add(primerDoor, sticker, plate);

  // Rodas: pneu (torno), roda de aço com calota e furos.
  const tireProfile = [
    new THREE.Vector2(0.2, -0.095),
    new THREE.Vector2(0.27, -0.1),
    new THREE.Vector2(0.305, -0.085),
    new THREE.Vector2(0.315, 0),
    new THREE.Vector2(0.305, 0.085),
    new THREE.Vector2(0.27, 0.1),
    new THREE.Vector2(0.2, 0.095),
  ];
  const tireGeometry = new THREE.LatheGeometry(tireProfile, 40);
  tireGeometry.rotateX(Math.PI / 2);
  const rimGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.17, 32);
  rimGeometry.rotateX(Math.PI / 2);
  const capGeometry = new THREE.SphereGeometry(0.11, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  capGeometry.rotateX(Math.PI / 2);
  const holeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12);
  holeGeometry.rotateX(Math.PI / 2);
  for (const x of [-WHEEL_X, WHEEL_X]) {
    for (const side of [-1, 1]) {
      const wheel = new THREE.Group();
      wheel.add(new THREE.Mesh(tireGeometry, rubberMaterial));
      wheel.add(new THREE.Mesh(rimGeometry, steelRimMaterial));
      const cap = new THREE.Mesh(capGeometry, chromeMaterial);
      cap.position.z = 0.085;
      cap.scale.z = 0.35;
      wheel.add(cap);
      for (let k = 0; k < 6; k++) {
        const hole = new THREE.Mesh(holeGeometry, rubberMaterial);
        const angle = (k / 6) * Math.PI * 2;
        hole.position.set(Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, 0.086);
        wheel.add(hole);
      }
      if (side < 0) wheel.rotation.y = Math.PI;
      wheel.position.set(x, 0.315, side * 0.72);
      car.add(wheel);
    }
    // Caixa de roda escura, para não dar para ver através do carro.
    const well = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.42, 1.3), plasticMaterial);
    well.position.set(x, 0.52, 0);
    car.add(well);
  }

  car.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return car;
}
