'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuildingDef {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

// ─── Sky Dome ─────────────────────────────────────────────────────────────────
// Custom GLSL gradient shader — no texture required, zero performance cost

const skyVertShader = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragShader = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 midColor;
  uniform vec3 horizonColor;
  varying vec3 vWorldPos;

  void main() {
    float h = normalize(vWorldPos).y; // -1..1
    vec3 col;
    if (h > 0.15) {
      // above horizon → blend mid to top
      col = mix(midColor, topColor, clamp((h - 0.15) / 0.85, 0.0, 1.0));
    } else {
      // below horizon → blend horizon to mid
      col = mix(horizonColor, midColor, clamp((h + 0.3) / 0.45, 0.0, 1.0));
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

function SkyDome() {
  const uniforms = useMemo(
    () => ({
      topColor:     { value: new THREE.Color('#180c24') }, // deep purple
      midColor:     { value: new THREE.Color('#b84510') }, // burnt orange
      horizonColor: { value: new THREE.Color('#f5a030') }, // warm yellow
    }),
    []
  );

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[450, 32, 16]} />
      <shaderMaterial
        vertexShader={skyVertShader}
        fragmentShader={skyFragShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Ground ───────────────────────────────────────────────────────────────────

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
      <planeGeometry args={[300, 300, 1, 1]} />
      <meshStandardMaterial color="#4d5a38" roughness={0.95} metalness={0} />
    </mesh>
  );
}

// ─── Road strip ───────────────────────────────────────────────────────────────

function Road() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.01, -10]}>
      <planeGeometry args={[6, 120]} />
      <meshStandardMaterial color="#2e2a24" roughness={0.9} />
    </mesh>
  );
}

// ─── Single building ─────────────────────────────────────────────────────────

function Building({ position, size, color }: BuildingDef) {
  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Main body — sits on the ground */}
      <mesh
        position={[0, size[1] / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Slightly darker roof cap */}
      <mesh position={[0, size[1] + 0.15, 0]} castShadow>
        <boxGeometry args={[size[0] + 0.1, 0.3, size[2] + 0.1]} />
        <meshStandardMaterial
          color={new THREE.Color(color).multiplyScalar(0.6)}
          roughness={0.9}
        />
      </mesh>

      {/* Window cutout illusion — dark square planes on the wall face */}
      {size[1] > 3 && (
        <mesh position={[size[0] / 2 + 0.01, size[1] * 0.55, 0]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial color="#0a0704" />
        </mesh>
      )}
    </group>
  );
}

// ─── Procedural building set ─────────────────────────────────────────────────

// Seeded pseudo-random so buildings are stable across renders
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function Buildings() {
  const data = useMemo<BuildingDef[]>(() => {
    const r = seededRand(42);
    const rng = (min: number, max: number) => min + r() * (max - min);
    const colors = ['#d9c9a3', '#bfa987', '#c7b299', '#a89070', '#9c8060'];
    const pick = () => colors[Math.floor(r() * colors.length)];
    const list: BuildingDef[] = [];

    // Small houses — clustered around the road
    for (let i = 0; i < 10; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      list.push({
        position: [side * (5 + rng(2, 12)), 0, -5 - rng(0, 40)],
        size: [rng(3, 5), rng(2.5, 3.5), rng(3, 5)],
        color: pick(),
      });
    }

    // Two-storey houses
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      list.push({
        position: [side * (8 + rng(4, 18)), 0, -10 - rng(5, 35)],
        size: [rng(4, 7), rng(4.5, 6), rng(4, 7)],
        color: pick(),
      });
    }

    // Warehouse structures — set back
    for (let i = 0; i < 4; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      list.push({
        position: [side * (14 + rng(0, 16)), 0, -20 - rng(10, 40)],
        size: [rng(10, 16), rng(4, 6), rng(7, 12)],
        color: '#8a7a68',
      });
    }

    return list;
  }, []);

  return (
    <>
      {data.map((b, i) => (
        <Building key={i} {...b} />
      ))}
    </>
  );
}

// ─── Sparse trees / poles ─────────────────────────────────────────────────────

function Poles() {
  const positions = useMemo(() => {
    const r = seededRand(99);
    return Array.from({ length: 12 }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      return [side * (3 + r() * 8), 0, -5 - r() * 55] as [number, number, number];
    });
  }, []);

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={[pos[0], 2, pos[2]]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 4, 5]} />
          <meshStandardMaterial color="#3a3028" roughness={1} />
        </mesh>
      ))}
    </>
  );
}

// ─── Camera rig (cinematic slow pan) ─────────────────────────────────────────

function CameraRig() {
  const { camera } = useThree();
  const elapsed = useRef(0);

  // Set initial position so first frame isn't a jump
  useMemo(() => {
    camera.position.set(0, 6, 14);
  }, [camera]);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current;

    // Very slow horizontal sway + slight altitude bob
    camera.position.x = Math.sin(t * 0.07) * 5;
    camera.position.y = 5.5 + Math.sin(t * 0.04) * 0.4;
    camera.position.z = 13;

    // Look toward center of town, gently drifting
    camera.lookAt(
      Math.sin(t * 0.05) * 2,
      2,
      -12,
    );
  });

  return null;
}

// ─── Inner scene ──────────────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      <CameraRig />

      {/* Exponential fog: colour, density */}
      <fogExp2 attach="fog" args={['#2a1b12', 0.012]} />

      {/* Warm sunset directional light with shadows */}
      <directionalLight
        position={[50, 30, 20]}
        intensity={2.8}
        color="#ff9c54"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={180}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.0004}
      />

      {/* Low fill light from the opposite side for subtle rim catch */}
      <directionalLight
        position={[-30, 10, -10]}
        intensity={0.4}
        color="#2030a0"
      />

      {/* Very dim ambient so shadows don't go pure black */}
      <ambientLight intensity={0.18} color="#ff7030" />

      <SkyDome />
      <Ground />
      <Road />
      <Buildings />
      <Poles />
    </>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function BGMIWorld() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -20,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 6, 14], fov: 58, near: 0.5, far: 500 }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
