"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import * as THREE from "three";

// Drop your .obj file at public/model.obj to use it
const MODEL_PATH = "/model.obj";

function OBJModel({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const obj = useLoader(OBJLoader, MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null!);

  // Apply a consistent material to all meshes in the OBJ
  useEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: "#a78bfa",
          roughness: 0.3,
          metalness: 0.5,
        });
        child.castShadow = true;
      }
    });
  }, [obj]);

  useFrame(() => {
    if (!groupRef.current || !mouse.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.current.x * 0.4,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -mouse.current.y * 0.2,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <primitive object={obj} />
      </Float>
    </group>
  );
}

function PlaceholderAvatar({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current || !mouse.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.current.x * 0.4,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -mouse.current.y * 0.2,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh castShadow>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshStandardMaterial color="#7c3aed" roughness={0.2} metalness={0.6} emissive="#3b0764" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow>
          <sphereGeometry args={[0.55, 64, 64]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.2} metalness={0.5} emissive="#4c1d95" emissiveIntensity={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-4, 2, -4]} intensity={0.8} color="#f59e0b" />
      <pointLight position={[4, -2, 4]} intensity={0.6} color="#6366f1" />
    </>
  );
}

export function HeroScene({ scrollY }: { scrollY: number }) {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const progress = Math.min(scrollY / 600, 1);
  const zPos = -progress * 6;
  const opacity = 1 - progress;

  return (
    <div
      className="absolute inset-0"
      style={{ opacity, transform: `translateZ(${zPos * 10}px)`, transition: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        shadows
      >
        <Lights />
        <group position={[0, -0.5, zPos]}>
          <Suspense fallback={<PlaceholderAvatar mouse={mouse} />}>
            <OBJModel mouse={mouse} />
          </Suspense>
        </group>
      </Canvas>
    </div>
  );
}
