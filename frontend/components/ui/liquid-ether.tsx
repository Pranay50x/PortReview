'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec3 u_color_base; // Base dark blue for the background
  uniform vec3 u_color_accent1; // Lighter blue/cyan for the waves
  uniform vec3 u_color_accent2; // Even lighter for highlights
  varying vec2 vUv;

  void main() {
    vec2 st = vUv * 2.0 - 1.0; // Normalize to -1 to 1 range
    
    // Time-based wave movement
    float t = u_time * 0.5; // Speed of the waves

    vec2 pos = vUv;
    float num_waves = 30.0; // Number of "traps" or wave segments
    pos.x *= num_waves;

    float wave_intensity = 0.0;
    float mouse_influence = length(st - u_mouse * 1.0) * 0.5; // Mouse interaction

    for (int i = 0; i < int(num_waves); i++) {
        float trap_factor = float(i) / num_waves;
        // Shift waves based on time and mouse
        float wave_position = mod(pos.x - t + u_mouse.x * 0.2, 1.0); 
        if (wave_position > trap_factor) {
            wave_intensity = trap_factor;
        }
    }
    
    // Mix colors based on wave intensity and mouse influence
    vec3 color_mixed = mix(u_color_base, u_color_accent1, wave_intensity + mouse_influence * 0.2);
    color_mixed = mix(color_mixed, u_color_accent2, mouse_influence * 0.8);
    
    gl_FragColor = vec4(color_mixed, 1.0);
  }
`;

const SilkPlane = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const mousePosition = useRef({ x: 0, y: 0 });

const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      // NEW Corrected & Harmonized Color Palette
      u_color_base:    { value: new THREE.Color('#173c42') }, // A deeper, richer navy blue base
      u_color_accent1: { value: new THREE.Color('#215963') }, // A vibrant royal blue for blending
      u_color_accent2: { value: new THREE.Color('#28D8FB') }, // Your specified bright cyan accent
    }),
    []
  );

  useFrame((state) => {
    const { clock, pointer } = state;
    if (meshRef.current) {
      // @ts-ignore
      meshRef.current.material.uniforms.u_time.value = clock.getElapsedTime();
      
      // Interpolate mouse position for smoother interaction
      mousePosition.current.x = THREE.MathUtils.lerp(mousePosition.current.x, pointer.x, 0.05);
      mousePosition.current.y = THREE.MathUtils.lerp(mousePosition.current.y, pointer.y, 0.05);
      // @ts-ignore
      meshRef.current.material.uniforms.u_mouse.value = new THREE.Vector2(mousePosition.current.x, mousePosition.current.y);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

export const LiquidEtherBackground = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 1.5] }}> {/* Adjusted camera for better view of plane */}
        <SilkPlane />
      </Canvas>
    </div>
  );
};