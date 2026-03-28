'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

// Fast algorithmic pseudo-noise function to deform the blob without needing heavy external shader libraries
function organicNoise(x: number, y: number, z: number, time: number) {
  const s = 1.3;
  return (
    Math.sin(x * s + time) * 
    Math.cos(y * s - time * 0.8) * 
    Math.sin(z * s + time * 0.6)
  );
}

function LiquidBlob() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.SphereGeometry>(null);
  const { camera } = useThree();

  const state = useMemo(() => {
    return {
      originalPositions: new Float32Array(0),
      mouseWorld: new THREE.Vector3(9999, 9999, 0),
      mouseTarget: new THREE.Vector2(-9999, -9999),
      initialized: false
    };
  }, []);

  // Globally track mouse cursor mapping to standardized coordinates
  useEffect(() => {
    if (geoRef.current) {
      // Deep clone initial pure spherical vertices to act as the mathematical base calculation layer
      state.originalPositions = Float32Array.from(geoRef.current.attributes.position.array);
      state.initialized = true;
    }
    
    const handleMouseMove = (e: MouseEvent) => {
        state.mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
        state.mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  useFrame((st) => {
    if (!geoRef.current || !state.initialized || !meshRef.current) return;
    const time = st.clock.elapsedTime * 0.5; // Slow down to meet "hypnotic" and "breathing" constraints

    // Raycast cursor unprojection onto the blob depth plane
    const vector = new THREE.Vector3(state.mouseTarget.x, state.mouseTarget.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z; 
    state.mouseWorld.copy(camera.position).add(dir.multiplyScalar(distance));

    const positions = geoRef.current.attributes.position.array as Float32Array;
    const originals = state.originalPositions;
    const count = originals.length / 3;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ox = originals[i3];
        const oy = originals[i3 + 1];
        const oz = originals[i3 + 2];
        
        // Base lengths 
        const length = Math.sqrt(ox*ox + oy*oy + oz*oz);
        const nx = ox / length;
        const ny = oy / length;
        const nz = oz / length;

        // Waveform mapping to generate the liquid distortion shape dynamically
        const noise = organicNoise(nx, ny, nz, time) * 0.45;

        // Physical mouse repulsion field
        let mouseRipple = 0;
        const dx = ox - state.mouseWorld.x;
        const dy = oy - state.mouseWorld.y;
        const dz = oz - state.mouseWorld.z;
        const distSq = dx*dx + dy*dy + dz*dz;
        
        // Pull vertices magnetically towards the cursor as they pass
        if (distSq < 6.0) {
            mouseRipple = (6.0 - distSq) * 0.08; 
        }

        const finalDisplacement = noise + mouseRipple;
        
        positions[i3] = ox + nx * finalDisplacement;
        positions[i3 + 1] = oy + ny * finalDisplacement;
        positions[i3 + 2] = oz + nz * finalDisplacement;
    }

    // Flag GPU to re-paint the altered array data mapping directly
    geoRef.current.attributes.position.needsUpdate = true;
    
    // Critical: Recalculate normal arrays to guarantee the Chrome PBR material correctly reflects lighting off mutated structures
    geoRef.current.computeVertexNormals(); 
  });

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={0.4}>
      <mesh ref={meshRef}>
        {/* High poly count 64x64 guarantees the liquid feels completely organic safely within 60fps budgets */}
        <sphereGeometry ref={geoRef} args={[2.5, 64, 64]} />
        
        {/* Perfect Mirror Mercury Shader configurations */}
        <meshPhysicalMaterial 
          color="#0f0f0f"     // Pitch dark core forces the metal to strictly rely on extreme edge lighting
          metalness={1.0}     // 100% chrome reflectivity
          roughness={0.0}     // Eradicates matte textures resulting in glass-like metallic properties
          clearcoat={1.0}     // External liquid polish
          clearcoatRoughness={0.05}
          envMapIntensity={1.5} // Magnifies the atmospheric reflections
        />
      </mesh>
    </Float>
  );
}

export default function LiquidChromeCore() {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full bg-[#000000] pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: true }}
      >
        <ambientLight intensity={0.1} />
        
        {/* Left Rim Light - Intense Electric Cyan Array */}
        <spotLight position={[-10, 5, 5]} angle={0.5} penumbra={1} intensity={200} color="#00f2ff" />
        <directionalLight position={[-8, 0, -4]} intensity={2.0} color="#00f2ff" />

        {/* Right Rim Light - Intense Magenta Overload Array */}
        <spotLight position={[10, -5, 5]} angle={0.5} penumbra={1} intensity={200} color="#ff00c8" />
        <directionalLight position={[8, 0, -4]} intensity={2.0} color="#ff00c8" />

        {/* Top Rim Light - Generic Polish Spotlight */}
        <spotLight position={[0, 10, 0]} angle={0.8} penumbra={0.5} intensity={80} color="#ffffff" />

        {/* Generic environmental HDR structure enabling true "metal reflection" behaviors */}
        <Environment preset="studio" />

        <LiquidBlob />
      </Canvas>
      {/* Heavy Cinematic Black Vignette Fade Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.95) 100%)',
          zIndex: 1
        }}
      />
    </div>
  );
}
