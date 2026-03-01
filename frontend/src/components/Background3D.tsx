import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSphere({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5
      meshRef.current.rotation.x += 0.001
      meshRef.current.rotation.y += 0.002
    }
  })

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.6}
      />
    </Sphere>
  )
}

function FloatingShapes() {
  return (
    <>
      <AnimatedSphere position={[-4, 0, -5]} color="#3b82f6" />
      <AnimatedSphere position={[4, 2, -8]} color="#a855f7" />
      <AnimatedSphere position={[0, -2, -6]} color="#ec4899" />
      <AnimatedSphere position={[-2, 3, -7]} color="#06b6d4" />
      <AnimatedSphere position={[3, -1, -4]} color="#8b5cf6" />
    </>
  )
}

export default function Background3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      <FloatingShapes />
    </Canvas>
  )
}
