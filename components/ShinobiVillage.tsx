'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const RAIN_COUNT = 1800;
const LANTERN_POSITIONS: [number, number, number][] = [
  [-3.2, 2.8, -4],
  [3.0, 2.6, -6],
  [-1.5, 2.4, -10],
  [2.5, 2.5, -12],
  [-4.0, 2.7, -15],
];

// ─── RAIN SYSTEM ──────────────────────────────────────────────────────────────
function RainSystem() {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(RAIN_COUNT * 3);
    const velocities = new Float32Array(RAIN_COUNT);

    for (let i = 0; i < RAIN_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      velocities[i]        = 0.12 + Math.random() * 0.08;
    }
    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < RAIN_COUNT; i++) {
      pos[i * 3 + 1] -= velocities[i];

      // Slight wind drift on X
      pos[i * 3] += 0.01;

      if (pos[i * 3 + 1] < -2) {
        pos[i * 3]     = (Math.random() - 0.5) * 60;
        pos[i * 3 + 1] = 28;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#a8d8f0"
        size={0.04}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── LANTERN ──────────────────────────────────────────────────────────────────
function Lantern({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    // Subtle flicker
    const t = clock.elapsedTime;
    lightRef.current.intensity = 1.8 + Math.sin(t * 7.3 + position[0]) * 0.3 + Math.sin(t * 13.1) * 0.15;
  });

  return (
    <group position={position}>
      {/* Lantern body */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 6]} />
        <meshStandardMaterial color="#cc3300" emissive="#ff4400" emissiveIntensity={2.5} />
      </mesh>
      {/* Warm point light */}
      <pointLight ref={lightRef} color="#ff6600" intensity={2.0} distance={8} decay={2} castShadow={false} />
    </group>
  );
}

// ─── BUILDING ─────────────────────────────────────────────────────────────────
function PagodaBuilding({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      {/* Main body */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.4, 2.2]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Upper storey */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <boxGeometry args={[2.6, 1.2, 1.8]} />
        <meshStandardMaterial color="#150d06" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Ground-floor roof */}
      <mesh position={[0, 2.45, 0]} receiveShadow>
        <coneGeometry args={[2.4, 0.7, 4]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Upper roof */}
      <mesh position={[0, 3.65, 0]}>
        <coneGeometry args={[1.8, 0.65, 4]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Roof cap / finial */}
      <mesh position={[0, 4.0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.35, 6]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ─── FOG WISPS ────────────────────────────────────────────────────────────────
function FogWisps() {
  const refs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs[0].current && (refs[0].current.position.x = Math.sin(t * 0.12) * 2 - 1);
    refs[1].current && (refs[1].current.position.x = Math.sin(t * 0.09 + 2) * 3 + 1);
    refs[2].current && (refs[2].current.position.x = Math.sin(t * 0.07 + 4) * 2.5 - 3);
  });

  return (
    <>
      {([[-1, 0.3, -8], [2, 0.2, -13], [-3.5, 0.25, -18]] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} ref={refs[i]} position={pos}>
          <sphereGeometry args={[2.8 + i * 0.5, 8, 6]} />
          <meshStandardMaterial
            color="#6e8fad"
            transparent
            opacity={0.06 + i * 0.01}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── CHIMNEYS ─────────────────────────────────────────────────────────────────
function ChimneySmoke() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 0.4;
      arr[i * 3 + 1] = Math.random() * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 120; i++) {
      pos[i * 3 + 1] += 0.006;
      pos[i * 3]     += 0.003;
      if (pos[i * 3 + 1] > 3) {
        pos[i * 3 + 1] = 0;
        pos[i * 3]     = (Math.random() - 0.5) * 0.4;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[-3.5, 3.8, -6]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#aaaaaa" size={0.18} transparent opacity={0.12} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── GROUND ───────────────────────────────────────────────────────────────────
function WetCobblestoneGround() {
  return (
    <>
      {/* Main wet street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -10]} receiveShadow>
        <planeGeometry args={[12, 40]} />
        <meshStandardMaterial
          color="#1a1a22"
          roughness={0.05}   // Very glossy — wet stone
          metalness={0.6}    // Reflective
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Wider ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -10]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#111116" roughness={0.9} metalness={0.01} />
      </mesh>
    </>
  );
}

// ─── MAIN SCENE ───────────────────────────────────────────────────────────────
function ShinobiScene() {
  return (
    <>
      {/* Atmospheric fog — attached natively to the scene */}
      <fog attach="fog" args={['#091520', 18, 60]} />

      {/* Ambient indigo-blue overcast light */}
      <ambientLight color="#1a2f4a" intensity={1.8} />

      {/* Heavy overcast directional from above */}
      <directionalLight color="#2a4a70" position={[0, 20, 10]} intensity={1.5} />

      {/* Cool fill light from rear */}
      <directionalLight color="#1a3050" position={[0, 5, 30]} intensity={0.8} />

      {/* Environment for PBR reflections */}
      <Environment preset="night" />

      {/* Ground */}
      <WetCobblestoneGround />

      {/* Buildings — left row */}
      <PagodaBuilding x={-5} z={-6}  scale={1.1} />
      <PagodaBuilding x={-6} z={-13} scale={0.9} />
      <PagodaBuilding x={-5.5} z={-20} scale={1.0} />

      {/* Buildings — right row */}
      <PagodaBuilding x={5}  z={-8}  scale={1.0} />
      <PagodaBuilding x={6}  z={-15} scale={1.2} />
      <PagodaBuilding x={5}  z={-22} scale={0.85} />

      {/* Lanterns */}
      {LANTERN_POSITIONS.map((pos, i) => <Lantern key={i} position={pos} />)}

      {/* Atmospheric elements */}
      <FogWisps />
      <ChimneySmoke />
      <RainSystem />
    </>
  );
}

// ─── EXPORTED COMPONENT ───────────────────────────────────────────────────────
export default function ShinobiVillage() {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full bg-[#050a10] pointer-events-none overflow-hidden">
      <Canvas
        shadows={false} // Keep shadows off for performance
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 1.6, 8], fov: 55, near: 0.1, far: 120 }}
      >
        <ShinobiScene />
      </Canvas>

      {/* Film Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          zIndex: 2,
        }}
      />

      {/* Radial gradient — keeps center clear for UI */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0) 28%, rgba(0,0,0,0.70) 100%)',
          zIndex: 3,
        }}
      />
    </div>
  );
}
