'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

const SHARD_COUNT = 30;

// Algorithmically generate jagged, fractured glass shard geometry
function generateShardGeometry() {
  const shape = new THREE.Shape();
  const radius = Math.random() * 2 + 1.0;
  const sides = Math.floor(Math.random() * 3) + 3; // 3 to 5 sides (triangles/quads mostly)
  
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
    const r = radius * (0.6 + Math.random() * 0.4);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    
    if (i === 0) {
        shape.moveTo(x, y);
    } else {
        shape.lineTo(x, y);
    }
  }
  
  const extrudeSettings = {
    depth: Math.random() * 0.2 + 0.05,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  };
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

interface ShardProps {
    geometry: THREE.ExtrudeGeometry;
    initialPosition: [number, number, number];
    initialRotation: [number, number, number];
    initialScale: number;
}

function Shard({ geometry, initialPosition, initialRotation, initialScale }: ShardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, pointer } = useThree();
  
  // Random, constant drift speeds for the shard
  const randomDriftSpeedX = (Math.random() - 0.5) * 0.1;
  const randomDriftSpeedY = (Math.random() - 0.5) * 0.1;
  const randomDriftSpeedZ = (Math.random() - 0.5) * 0.1;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Base continuous slow rotation drift
    meshRef.current.rotation.x += randomDriftSpeedX * delta;
    meshRef.current.rotation.y += randomDriftSpeedY * delta;
    meshRef.current.rotation.z += randomDriftSpeedZ * delta;

    // Map screen mouse [-1, 1] to world viewport coordinates 
    const targetX = (pointer.x * viewport.width) / 2;
    const targetY = (pointer.y * viewport.height) / 2;
    
    // Distance check between shard and mouse proxy
    const dx = meshRef.current.position.x - targetX;
    const dy = meshRef.current.position.y - targetY;
    const distSq = dx * dx + dy * dy;
    
    // We want the shards to generally stay at their initial formation
    let targetPosX = initialPosition[0];
    let targetPosY = initialPosition[1];
    let targetPosZ = initialPosition[2];

    // Cinematic repulsion force when mouse passes nearby
    if (distSq < 25.0) {
      const force = (25.0 - distSq) * 0.03;
      targetPosX += dx * force;
      targetPosY += dy * force;
      targetPosZ += 2.0 * force; // push the glass slightly forward
      
      // Tilt it dynamically away from the mouse
      meshRef.current.rotation.x -= dy * force * 0.01;
      meshRef.current.rotation.y += dx * force * 0.01;
    }
    
    // Smooth Lerp back toward the calculated target (which defaults to origin)
    meshRef.current.position.x += (targetPosX - meshRef.current.position.x) * 0.04;
    meshRef.current.position.y += (targetPosY - meshRef.current.position.y) * 0.04;
    meshRef.current.position.z += (targetPosZ - meshRef.current.position.z) * 0.04;
  });

  return (
    <Float floatIntensity={1} rotationIntensity={0.5} speed={1.5}>
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        position={initialPosition} 
        rotation={initialRotation} 
        scale={initialScale}
      >
        <MeshTransmissionMaterial 
          background={new THREE.Color('#020617')} // Ensures refractions sample the deep navy abyss
          transmission={0.95} 
          thickness={0.5} 
          roughness={0.1} 
          chromaticAberration={0.05} 
          ior={1.5}
          anisotropy={0.5}
          distortion={0.2}
          distortionScale={0.3}
          color="#d1d9e6" // Glacial Silver tint
        />
      </mesh>
    </Float>
  );
}

function FracturedGlassScene() {
  // Pre-generate the geometries and starting coordinates to avoid recalculating on render loops
  const shards = useMemo(() => {
    const arr = [];
    for (let i = 0; i < SHARD_COUNT; i++) {
        // Distribute heavily around the perimeter so center isn't fully obscured
      arr.push({
        geometry: generateShardGeometry(),
        position: [
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 10 - 2
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number],
        scale: Math.random() * 0.5 + 0.5
      });
    }
    return arr;
  }, []);

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={2.0} color="#00f2ff" /> // Cyan reflection
      <directionalLight position={[-10, -10, -10]} intensity={1.5} color="#020617" />
      
      {shards.map((props, i) => (
        <Shard 
          key={i} 
          geometry={props.geometry}
          initialPosition={props.position}
          initialRotation={props.rotation}
          initialScale={props.scale}
        />
      ))}
    </>
  );
}

export default function ShatteredGlass() {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full bg-[#020617] pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1.5]} // Balance sharp refractions vs performance
        gl={{ powerPreference: 'high-performance', antialias: true }}
      >
        <FracturedGlassScene />
      </Canvas>
      
      {/* Cinematic Dark Vignette Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(2,6,23,0.95) 100%)',
          zIndex: 1
        }}
      />
    </div>
  );
}
