'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

const FRAGMENT_COUNT = 800; // Optimized for 500+ as requested

function ShardInstancedMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();
  
  // Dummy object for calculating matrices
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Mutable physical state arrays mapping 1:1 with instances
  const state = useMemo(() => {
    const originalPositions = new Float32Array(FRAGMENT_COUNT * 3);
    const positions = new Float32Array(FRAGMENT_COUNT * 3);
    const velocities = new Float32Array(FRAGMENT_COUNT * 3);
    const rotations = new Float32Array(FRAGMENT_COUNT * 3);
    const rotationSpeeds = new Float32Array(FRAGMENT_COUNT * 3);
    const scales = new Float32Array(FRAGMENT_COUNT);
    
    for (let i = 0; i < FRAGMENT_COUNT; i++) {
        const i3 = i * 3;
        
        // Spread particles across a wide 3D space
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 30;
        const z = (Math.random() - 0.5) * 15 - 2;
        
        originalPositions[i3] = x;
        originalPositions[i3 + 1] = y;
        originalPositions[i3 + 2] = z;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        velocities[i3] = 0;
        velocities[i3 + 1] = 0;
        velocities[i3 + 2] = 0;

        rotations[i3] = Math.random() * Math.PI;
        rotations[i3 + 1] = Math.random() * Math.PI;
        rotations[i3 + 2] = Math.random() * Math.PI;

        rotationSpeeds[i3] = (Math.random() - 0.5) * 0.02;
        rotationSpeeds[i3 + 1] = (Math.random() - 0.5) * 0.02;
        rotationSpeeds[i3 + 2] = (Math.random() - 0.5) * 0.02;

        // Size 0.05 to 0.15
        scales[i] = Math.random() * 0.1 + 0.05;
    }
    
    return {
      originalPositions,
      positions,
      velocities,
      rotations,
      rotationSpeeds,
      scales,
      mouseWorld: new THREE.Vector3(9999, 9999, 0),
      mouseTarget: new THREE.Vector2(-9999, -9999)
    };
  }, []);

  // Global mouse monitoring
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        state.mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
        state.mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  useFrame(() => {
    if (!meshRef.current) return;

    // Unproject Mouse to World Space based on Z=0 plane proximity
    const vector = new THREE.Vector3(state.mouseTarget.x, state.mouseTarget.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z; 
    state.mouseWorld.copy(camera.position).add(dir.multiplyScalar(distance));

    const { positions, originalPositions, velocities, rotations, rotationSpeeds, scales } = state;

    for (let i = 0; i < FRAGMENT_COUNT; i++) {
        const i3 = i * 3;
        
        let px = positions[i3];
        let py = positions[i3 + 1];
        let pz = positions[i3 + 2];
        
        // Repulsion logic
        const dxMouse = px - state.mouseWorld.x;
        const dyMouse = py - state.mouseWorld.y;
        const distSqMouse = dxMouse * dxMouse + dyMouse * dyMouse;
        
        // 150px approx translates to ~4-5 relative WebGL world units
        if (distSqMouse < 16.0) { 
            const force = (16.0 - distSqMouse) * 0.003;
            velocities[i3] += dxMouse * force;
            velocities[i3 + 1] += dyMouse * force;
            velocities[i3 + 2] += 1.0 * force; // Push slightly outward along Z
        }

        // Apply physical properties
        px += velocities[i3];
        py += velocities[i3 + 1];
        pz += velocities[i3 + 2];
        
        // Organic dampening to slow down the shards smoothly
        velocities[i3] *= 0.92;
        velocities[i3 + 1] *= 0.92;
        velocities[i3 + 2] *= 0.92;

        // Base Brownian atmospheric drift
        originalPositions[i3] += (Math.random() - 0.5) * 0.005;
        originalPositions[i3 + 1] += (Math.random() - 0.5) * 0.005;
        originalPositions[i3 + 2] += (Math.random() - 0.5) * 0.005;

        // Lerp interpolation back towards the constantly-drifting original anchoring position
        px += (originalPositions[i3] - px) * 0.015;
        py += (originalPositions[i3 + 1] - py) * 0.015;
        pz += (originalPositions[i3 + 2] - pz) * 0.015;
        
        positions[i3] = px;
        positions[i3 + 1] = py;
        positions[i3 + 2] = pz;

        // Apply rotations
        rotations[i3] += rotationSpeeds[i3];
        rotations[i3 + 1] += rotationSpeeds[i3 + 1];
        rotations[i3 + 2] += rotationSpeeds[i3 + 2];

        // Assign to Dummy Matrix mapping for Instanced Rendering
        dummy.position.set(px, py, pz);
        dummy.rotation.set(rotations[i3], rotations[i3 + 1], rotations[i3 + 2]);
        
        const scale = scales[i];
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    // Single trigger to push GPU buffer layout updates
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} color="#00f2ff" />
      <directionalLight position={[-10, -10, -10]} intensity={1} color="#f2c94c" />
      <Environment preset="city" />

      <instancedMesh ref={meshRef} args={[undefined, undefined, FRAGMENT_COUNT]}>
        {/* Extremely low poly, extremely fast geometry */}
        <tetrahedronGeometry args={[1, 0]} />
        {/* Fast standard material rather than expensive transmission raytracers */}
        <meshStandardMaterial
          roughness={0.1}
          metalness={1.0}
          transparent
          opacity={0.6}
          color="#c8f6ff"
          envMapIntensity={2}
        />
      </instancedMesh>
    </>
  );
}

export default function OptimizedIceShards() {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full bg-[#020617] pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: false }}
      >
        <ShardInstancedMesh />
      </Canvas>
      {/* Subtle screen vignette overlay */}
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
