'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;

// Classic Perlin 3D Noise 
// by Stefan Gustavson
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  
  // Adjust aspect ratio to prevent stretching
  vec2 aspectModifiedUv = vUv;
  aspectModifiedUv.x *= uResolution.x / uResolution.y;

  // Create flowing noise fields driven by time
  float n1 = snoise(vec3(aspectModifiedUv * 1.5, uTime * 0.15));
  float n2 = snoise(vec3(aspectModifiedUv * 3.0, uTime * 0.10 + n1));
  float n3 = snoise(vec3(aspectModifiedUv * 2.0, uTime * 0.05 - n2));
  
  // Combine noise for a fluid liquid effect
  float flow = (n1 + n2 + n3) / 3.0;
  flow = flow * 0.5 + 0.5; // Map from -1..1 to 0..1
  
  // Shape the flow for digital silk / smoke streams
  // using smoothstep for soft, smoky bands
  float smoke = smoothstep(0.3, 0.7, flow) * smoothstep(0.7, 0.3, flow) * 2.1;

  // Mix Primary Flow (Deep Indigo / Navy)
  vec3 indigoFlow = mix(uColor1, uColor2, flow);
  
  // Add electric cyan energy highlights where smoke is dense
  float energyIntensity = smoothstep(0.48, 0.6, flow) * 0.3; 
  vec3 energyHighlights = mix(indigoFlow, uColor3, energyIntensity);
  
  // Blend final output over pitch black
  vec3 finalColor = mix(vec3(0.0), energyHighlights, smoke * 0.85);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Bypass view/projection for a fullscreen tri/plane
  gl_Position = vec4(position, 1.0);
}
`;

const AuroraShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uColor1: { value: new THREE.Color("#00171f") }, // Pitch Navy
    uColor2: { value: new THREE.Color("#003459") }, // Deep Ocean Indigo
    uColor3: { value: new THREE.Color("#00f2ff") }  // Electric Cyan Highlight
  },
  vertexShader,
  fragmentShader
};

function ShaderLayer() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uResolution.value.set(
        state.size.width * state.viewport.dpr, 
        state.size.height * state.viewport.dpr
      );
    }
  });

  return (
    <mesh>
      {/* Plane geometry set strictly to (-1, 1) to cover clipping space perfectly */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        args={[AuroraShaderMaterial]}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function AuroraDataStream() {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full bg-black pointer-events-none overflow-hidden">
      <Canvas
        dpr={[1, 1.5]} // Optimize for performance while keeping sharpness
        gl={{ powerPreference: 'high-performance', alpha: false, antialias: false }}
        camera={{ position: [0, 0, 1], near: 0.1, far: 100 }}
      >
        <ShaderLayer />
      </Canvas>
      {/* Radial Vignette Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]" 
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 100%)',
        }}
      />
    </div>
  );
}
