'use client';

import { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 1500; // Balanced for 60FPS on web
const MAX_CONNECTIONS = 3000; // Limits line drawing to prevent lag
const MIN_DISTANCE_SQ = 2.5; // connection distance squared

function PlexusNetwork() {
  const { size, camera } = useThree();
  
  // Refs
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  // Mutable state for physics
  const state = useMemo(() => {
    const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Spread particles across a wide 3D area
        const x = (Math.random() - 0.5) * 35;
        const y = (Math.random() - 0.5) * 25;
        const z = (Math.random() - 0.5) * 15;
        
        originalPositions[i * 3] = x;
        originalPositions[i * 3 + 1] = y;
        originalPositions[i * 3 + 2] = z;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Random drift velocities
        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    // Allocate buffer for worst-case lines
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6);
    const lineColors = new Float32Array(MAX_CONNECTIONS * 6);
    
    return {
      originalPositions,
      positions,
      velocities,
      linePositions,
      lineColors,
      mouseWorld: new THREE.Vector3(9999, 9999, 0),
      mouseTarget: new THREE.Vector2(-9999, -9999)
    };
  }, []);

  // Global mouse tracking (since canvas has pointer-events: none)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        // Normalize coordinates to -1 to +1
        state.mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
        state.mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  useFrame(() => {
    if (!pointsRef.current || !linesRef.current) return;

    // Unproject Mouse to World Space based on Z=0 plane
    const vector = new THREE.Vector3(state.mouseTarget.x, state.mouseTarget.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z; 
    state.mouseWorld.copy(camera.position).add(dir.multiplyScalar(distance));

    const { positions, originalPositions, velocities, linePositions, lineColors } = state;
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        
        // Current position
        let px = positions[i3];
        let py = positions[i3 + 1];
        let pz = positions[i3 + 2];
        
        // Browser mouse repulsion check
        const dxMouse = px - state.mouseWorld.x;
        const dyMouse = py - state.mouseWorld.y;
        const distSqMouse = dxMouse * dxMouse + dyMouse * dyMouse;
        
        if (distSqMouse < 15.0) { 
            // Repel
            const force = (15.0 - distSqMouse) * 0.005;
            velocities[i3] += dxMouse * force;
            velocities[i3 + 1] += dyMouse * force;
        }

        // Apply Velocity with dampening
        px += velocities[i3];
        py += velocities[i3 + 1];
        pz += velocities[i3 + 2];
        velocities[i3] *= 0.95;
        velocities[i3 + 1] *= 0.95;
        velocities[i3 + 2] *= 0.95;

        // Base drift motion (Brownian)
        originalPositions[i3] += (Math.random() - 0.5) * 0.01;
        originalPositions[i3 + 1] += (Math.random() - 0.5) * 0.01;
        originalPositions[i3 + 2] += (Math.random() - 0.5) * 0.01;

        // Lerp back towards original position to maintain structure
        px += (originalPositions[i3] - px) * 0.02;
        py += (originalPositions[i3 + 1] - py) * 0.02;
        pz += (originalPositions[i3 + 2] - pz) * 0.02;
        
        positions[i3] = px;
        positions[i3 + 1] = py;
        positions[i3 + 2] = pz;

        // Build Plexus Connections efficiently
        if (numConnected >= MAX_CONNECTIONS) continue;

        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
            const j3 = j * 3;
            const dx = positions[j3] - px;
            const dy = positions[j3 + 1] - py;
            const dz = positions[j3 + 2] - pz;
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < MIN_DISTANCE_SQ) {
                const alpha = 1.0 - (distSq / MIN_DISTANCE_SQ); // closer = brighter
                
                linePositions[vertexpos++] = px;
                linePositions[vertexpos++] = py;
                linePositions[vertexpos++] = pz;
                
                linePositions[vertexpos++] = positions[j3];
                linePositions[vertexpos++] = positions[j3 + 1];
                linePositions[vertexpos++] = positions[j3 + 2];

                // Base color Cyan #00F2FF
                const r = 0.0;
                const g = 0.95;
                const b = 1.0;
                
                // Add colors mapped with alpha
                lineColors[colorpos++] = r;
                lineColors[colorpos++] = g;
                lineColors[colorpos++] = b;
                lineColors[colorpos++] = alpha * 0.4; // max opacity

                lineColors[colorpos++] = r;
                lineColors[colorpos++] = g;
                lineColors[colorpos++] = b;
                lineColors[colorpos++] = alpha * 0.4;
                
                numConnected++;
                if (numConnected >= MAX_CONNECTIONS) break;
            }
        }
    }

    // Update GPU Buffers
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Safety check incase we hit the line limit
    linesRef.current.geometry.setDrawRange(0, numConnected * 2);
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <group>
      {/* Network Nodes (Particles) */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            args={[state.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#00F2FF"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Network Plexus (Connecting Lines) */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={MAX_CONNECTIONS * 2}
              args={[state.linePositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              count={MAX_CONNECTIONS * 2}
              args={[state.lineColors, 4]}
            />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export default function NeuralPlexus() {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full bg-[#020617] pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: false, alpha: false }}
      >
        <PlexusNetwork />
      </Canvas>
      {/* Subtle Screen Vignette Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, transparent 20%, rgba(2,6,23,0.95) 100%)',
          zIndex: 1
        }}
      />
    </div>
  );
}
