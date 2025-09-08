'use client';
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
uniform float u_time;
uniform float u_radius;
varying vec2 v_uv;
void main() {
    v_uv = uv;
    vec3 pos = position;
    float noise = sin(pos.x * u_radius + u_time) * sin(pos.y * u_radius + u_time);
    pos.z += noise * 0.1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = `
uniform float u_time;
uniform vec3 u_color;
varying vec2 v_uv;
void main() {
    float noise = sin(v_uv.x * 10.0 + u_time) * sin(v_uv.y * 10.0 + u_time);
    vec3 color = u_color + noise * 0.2;
    gl_FragColor = vec4(color, 1.0);
}
`

const LiquidEther = () => {
    const meshRef = useRef<THREE.Mesh>(null!)
    const uniforms = useMemo(
        () => ({
            u_time: { value: 0 },
            u_radius: { value: 2.0 },
            u_color: { value: new THREE.Color('#3b82f6') }, // You can change this hex code to any color you like!
        }),
        []
    )

    useFrame((state) => {
        const { clock } = state
        if (meshRef.current) {
            // @ts-ignore
            meshRef.current.material.uniforms.u_time.value = clock.getElapsedTime()
        }
    })

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[10, 10, 32, 32]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
            />
        </mesh>
    )
}

export const LiquidEtherBackground = () => {
    return (
        <Canvas camera={{ position: [0, 0, 5] }} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
            <LiquidEther />
        </Canvas>
    )
}