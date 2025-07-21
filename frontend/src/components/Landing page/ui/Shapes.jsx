import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Float, Environment } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";

export function Shapes() {
  return (
    <div className="row-span-1 row-start-1 -mt-9 aspect-square md:col-span-1 md:col-start-2 md:mt-0">
      <Canvas
        className="z-0"
        shadows
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 25], fov: 30, near: 1, far: 40 }}
      > 
        <Suspense fallback={null}>
          <Geometries />
          <ContactShadows
            position={[0, -3, 0]}
            opacity={0.65}
            scale={40}
            blur={1}
            far={10}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Geometries() {
  const geometries = [
    {
      position: [0, 0, 0],
      r: 1.2,
      geometry: new THREE.IcosahedronGeometry(3.2), // Gem
    },
    {
      position: [1, -1, 4],
      r: 0.4,
      geometry: new THREE.CapsuleGeometry(0.5, 1.6, 2, 16), // Pill
    },
    {
      position: [-1.4, 2, -2],
      r: 0.6,
      geometry: new THREE.DodecahedronGeometry(1.5), // Soccer ball
    },
    {
      position: [-0.8, -0.75, 3],
      r: 0.5,
      geometry: new THREE.TorusGeometry(0.6, 0.25, 16, 32), // Donut
    },
    {
      position: [1.6, 1.6, -4],
      r: 0.7,
      geometry: new THREE.OctahedronGeometry(1.5), // Diamond
    },
  
    {
      position: [-0.1, 2.1, 3],
      r: 0.5,
      geometry: new THREE.TorusGeometry(0.5, 0.1, 10, 20), // Donut
    },
  
    {
      position: [-2,0, 0],
      r: 0.8,
      geometry: new THREE.SphereGeometry(1), // Sphere
    },
    {
      position: [0, 2, 0],
      r: 0.5,
      geometry: new THREE.BoxGeometry(1.5, 1.5, 1.5), // Cube
    },
    {
      position: [3, 3, 3],
      r: 0.4,
      geometry: new THREE.ConeGeometry(0.5, 1.5, 32), // Cone
    },
    {
      position: [0, -2, 2],
      r: 0.6,
      geometry: new THREE.CylinderGeometry(0.5, 0.5, 2, 32), // Cylinder
    },
    {
      position: [-1, -1.5, 2],
      r: 0.7,
      geometry: new THREE.CylinderGeometry(0, 1, 1, 4), // Pyramid
    },
    {
      position: [2, -1, 2],
      r: 0.6,
      geometry: new THREE.TetrahedronGeometry(1.2), // Tetrahedron
    },
    {
      position: [3, 1, 0],
      r: 0.8,
      geometry: new THREE.SphereGeometry(0.4), // Sphere
    },
    {
      position: [2, 2.9, -3],
      r: 0.5,
      geometry: new THREE.TorusGeometry(0.5, 0.1, 10, 20), // Donut
    },
    {
      position: [3, 1, -2.3],
      r: 0.6,
      geometry: new THREE.TetrahedronGeometry(0.5), // Tetrahedron
    },
    {
      position: [2.5, -0.2, 2.1],
      r: 0.4,
      geometry: new THREE.CapsuleGeometry(0.2, 1.3, 1, 5), // Pill
    },
    {
      position: [-1.4, -1.5, -2],
      r: 0.6,
      geometry: new THREE.DodecahedronGeometry(1), // Soccer ball
    },
    {
      position: [2,0, 0],
      r: 0.8,
      geometry: new THREE.DodecahedronGeometry(1), // Soccer ball
    },
    {
      position: [-1.5, 2.1, 2.9],
      r: 1.2,
      geometry: new THREE.IcosahedronGeometry(0.5), // Gem
    },
    {
      position: [2.1, 2, 2.7],
      r: 0.6,
      geometry: new THREE.CylinderGeometry(0.5, 0.5, 2, 32), // Cylinder
    },
    {
      position: [2, 2.1, -2.5],
      r: 1.2,
      geometry: new THREE.IcosahedronGeometry(1), // Gem
    },
    {
      position: [3,2, -4],
      r: 0.7,
      geometry: new THREE.OctahedronGeometry(1.5), // Diamond
    },
  ];

  

  const soundEffects = [
    new Audio("/sounds/hit2.ogg"),
    new Audio("/sounds/hit3.ogg"),
    new Audio("/sounds/hit4.ogg"),
  ];

  const materials = [
    new THREE.MeshNormalMaterial(),
    new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0 }),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0 }),
    new THREE.MeshStandardMaterial({ color: 0x2EE910, roughness: 0.1 }),
    new THREE.MeshStandardMaterial({ color: 0x375153, roughness: 0 }),

    new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 0.5,
      color: 0x2980b9,
    }),
    new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      roughness: 0.1,
      metalness: 0.5,
    }),
  ];

  return geometries.map(({ position, r, geometry }) => (
    <Geometry
      key={JSON.stringify(position)}
      position={position.map((p) => p * 2)}
      geometry={geometry}
      soundEffects={soundEffects}
      materials={materials}
      r={r}
    />
  ));
}

function Geometry({ r, position, geometry, soundEffects, materials }) {
  const meshRef = useRef();
  const [visible] = useState(true);

  const startingMaterial = useMemo(() => {
    return gsap.utils.random(materials);
  }, []);

  const handleClick = (e) => {
    const mesh = e.object;
    gsap.utils.random(soundEffects).play();

    gsap.to(mesh.rotation, {
      x: `+=${gsap.utils.random(0, 2)}`,
      y: `+=${gsap.utils.random(0, 2)}`,
      z: `+=${gsap.utils.random(0, 2)}`,
      duration: 1.3,
      ease: "elastic.out(1,0.3)",
      yoyo: true,
    });

    mesh.material = gsap.utils.random(materials);
  };

  const handlePointerOver = () => {
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    const mesh = meshRef.current;
    if (mesh) {
      mesh.geometry = geometry;
      mesh.material = startingMaterial;

      // Suppression de l'animation de mise à l'échelle pour un affichage instantané
      mesh.scale.set(1, 1, 1); // Valeur par défaut de l'échelle
    }
  }, [geometry, startingMaterial]);

  return (
    visible && (
      <Float
        position={position}
        speed={5 * r}
        rotationIntensity={6 * r}
        floatIntensity={5 * r}
      >
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      </Float>
    )
  );
}

export default Shapes;
