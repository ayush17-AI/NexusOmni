'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

const FRAGMENT_COUNT = 2000; 

function ShardInstancedMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();
  
  // Dummy object for calculating matrices
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Stateful arrays mapping 1:1 with instances
  const state = useMemo(() => {
    const originalPositions = new Float32Array(FRAGMENT_COUNT * 3);
    const positions = new Float32Array(FRAGMENT_COUNT * 3);
    const rotations = new Float32Array(FRAGMENT_COUNT * 3);
    const rotationSpeeds = new Float32Array(FRAGMENT_COUNT * 3);
    const scales = new Float32Array(FRAGMENT_COUNT);
    const driftOffsets = new Float32Array(FRAGMENT_COUNT * 3); // For mathematical Brownian tracking
    
    for (let i = 0; i < FRAGMENT_COUNT; i++) {
        const i3 = i * 3;
        
        // Spread particles across a wide 3D space
        const x = (Math.random() - 0.5) * 50;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 20 - 5; // keep them pushed back slightly
        
        originalPositions[i3] = x;
        originalPositions[i3 + 1] = y;
        originalPositions[i3 + 2] = z;
        
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        
        // Very slow brownian drift seeds
        driftOffsets[i3] = Math.random() * 100;
        driftOffsets[i3 + 1] = Math.random() * 100;
        driftOffsets[i3 + 2] = Math.random() * 100;

        rotations[i3] = Math.random() * Math.PI;
        rotations[i3 + 1] = Math.random() * Math.PI;
        rotations[i3 + 2] = Math.random() * Math.PI;

        // Extremely slow rotation per frame requirements
        rotationSpeeds[i3] = (Math.random() - 0.5) * 0.01;
        rotationSpeeds[i3 + 1] = (Math.random() - 0.5) * 0.01;
        rotationSpeeds[i3 + 2] = (Math.random() - 0.5) * 0.01;

        // Size restricted exactly to 0.02 to 0.07 per requirements
        scales[i] = Math.random() * 0.05 + 0.02;
    }
    
    return {
      originalPositions,
      positions,
      rotations,
      rotationSpeeds,
      scales,
      driftOffsets,
      mouseWorld: new THREE.Vector3(9999, 9999, 0),
      mouseTarget: new THREE.Vector2(-9999, -9999)
    };
  }, []);

  // Monitor DOM mouse asynchronously
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        state.mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
        state.mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  useFrame((st) => {
    if (!meshRef.current) return;
    const time = st.clock.elapsedTime;

    // Unproject Mouse strictly on a 2D plane for intersection queries
    const vector = new THREE.Vector3(state.mouseTarget.x, state.mouseTarget.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z; 
    state.mouseWorld.copy(camera.position).add(dir.multiplyScalar(distance));

    const { positions, originalPositions, rotations, rotationSpeeds, scales, driftOffsets } = state;

    for (let i = 0; i < FRAGMENT_COUNT; i++) {
        const i3 = i * 3;
        
        let ox = originalPositions[i3];
        let oy = originalPositions[i3 + 1];
        let oz = originalPositions[i3 + 2];

        // Advanced Brownian Motion using trigonometric time offsets
        // Velocity heavily constrained to 0.001 -> 0.004 relative shifts
        const bx = Math.sin(time * 0.15 + driftOffsets[i3]) * 0.8;
        const by = Math.cos(time * 0.15 + driftOffsets[i3 + 1]) * 0.8;
        const bz = Math.sin(time * 0.15 + driftOffsets[i3 + 2]) * 0.8;

        let targetX = ox + bx;
        let targetY = oy + by;
        let targetZ = oz + bz;
        
        // Repulsion logic
        const dxMouse = targetX - state.mouseWorld.x;
        const dyMouse = targetY - state.mouseWorld.y;
        const distSqMouse = dxMouse * dxMouse + dyMouse * dyMouse;
        
        // Interaction radius ~100px translates to roughly ~3.0 relative WebGL world units
        if (distSqMouse < 9.0) { 
            const force = Math.max(0, 1.0 - Math.sqrt(distSqMouse) / 3.0);
            // Subtle violent shiver maxing out perfectly at 0.1 relative units
            targetX += dxMouse * force * 0.08;
            targetY += dyMouse * force * 0.08;
        }

        // Lerp interpolation towards target state smoothly filtering out jitter
        positions[i3] += (targetX - positions[i3]) * 0.05;
        positions[i3 + 1] += (targetY - positions[i3 + 1]) * 0.05;
        positions[i3 + 2] += (targetZ - positions[i3 + 2]) * 0.05;

        // Apply gentle rotations
        rotations[i3] += rotationSpeeds[i3];
        rotations[i3 + 1] += rotationSpeeds[i3 + 1];
        rotations[i3 + 2] += rotationSpeeds[i3 + 2];

        // Format to internal THREE struct
        dummy.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        dummy.rotation.set(rotations[i3], rotations[i3 + 1], rotations[i3 + 2]);
        const scale = scales[i];
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    // Flush batch call
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} color="#00f2ff" />
      <directionalLight position={[-10, -10, -10]} intensity={1} color="#f2c94c" />
      <Environment preset="city" />

      <instancedMesh ref={meshRef} args={[undefined, undefined, FRAGMENT_COUNT]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          roughness={0}
          metalness={1.0}
          color="#e0f7fa"    // Icy highlight color mapped directly
          transparent={false} // Heavy geometry bypass via pure opaqueness
          envMapIntensity={2.5}
        />
      </instancedMesh>
    </>
  );
}

export default function IceShardField() {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full bg-[#000000] pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: false }}
      >
        <ShardInstancedMesh />
      </Canvas>
      {/* Black ambient vignette overlay to fade depth tracking cleanly */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.95) 100%)',
          zIndex: 1
        }}
      />
    </div>
  );
}
