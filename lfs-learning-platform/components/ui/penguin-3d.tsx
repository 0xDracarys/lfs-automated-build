'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';

function PenguinModel() {
  const [fbx, setFbx] = useState<THREE.Group | null>(null);
  
  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      '/linux-char/source/LINUX.fbx',
      (object) => {
        console.log('FBX loaded successfully', object);
        // Scale bigger (16x) and position to right-down
        object.scale.set(0.16, 0.16, 0.16);
        object.position.set(1.5, -4, 0);
        
        // Traverse and set materials
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Ensure materials are properly set
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.needsUpdate = true;
                  }
                });
              } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.needsUpdate = true;
              }
            }
          }
        });
        
        setFbx(object);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
      },
      (error) => {
        console.error('Error loading FBX:', error);
        // Fallback to geometric penguin if FBX fails
      }
    );
  }, []);

  return (
    <group>
      {fbx ? (
        <primitive object={fbx} />
      ) : (
        // Fallback geometric penguin while loading or if FBX fails
        <group position={[0, -0.5, 0]}>
          {/* Penguin body - black sphere */}
          <mesh position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
          </mesh>
          
          {/* Penguin belly - white oval */}
          <mesh position={[0, 0, 0.6]} castShadow>
            <sphereGeometry args={[0.65, 32, 32]} />
            <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
          </mesh>
          
          {/* Left eye white */}
          <mesh position={[0.35, 0.4, 0.85]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          
          {/* Left eye pupil */}
          <mesh position={[0.38, 0.4, 0.95]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          
          {/* Right eye white */}
          <mesh position={[-0.35, 0.4, 0.85]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          
          {/* Right eye pupil */}
          <mesh position={[-0.38, 0.4, 0.95]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          
          {/* Beak */}
          <mesh position={[0, 0.2, 1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <coneGeometry args={[0.2, 0.4, 8]} />
            <meshStandardMaterial color="#ff9500" metalness={0.2} roughness={0.6} />
          </mesh>
          
          {/* Left foot */}
          <mesh position={[0.35, -1, 0.4]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
            <boxGeometry args={[0.35, 0.1, 0.5]} />
            <meshStandardMaterial color="#ff9500" metalness={0.2} roughness={0.6} />
          </mesh>
          
          {/* Right foot */}
          <mesh position={[-0.35, -1, 0.4]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
            <boxGeometry args={[0.35, 0.1, 0.5]} />
            <meshStandardMaterial color="#ff9500" metalness={0.2} roughness={0.6} />
          </mesh>
          
          {/* Left wing */}
          <mesh position={[0.8, 0, 0.2]} rotation={[0, 0, -Math.PI / 6]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
          </mesh>
          
          {/* Right wing */}
          <mesh position={[-0.8, 0, 0.2]} rotation={[0, 0, Math.PI / 6]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function Penguin3D() {
  return (
    <div className="w-full h-full relative pointer-events-none">
      {/* Dotted Background Only */}
      <div className="absolute inset-0 w-full h-full opacity-20">
        <div className="w-full h-full dotted-bg"></div>
      </div>

      {/* White glow layer behind penguin - positioned right-down */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl translate-x-12 translate-y-8"></div>
      </div>

      {/* 3D Penguin Canvas - Static, no interaction */}
      <div className="relative z-10 w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 16], fov: 55 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, 3, -5]} intensity={0.6} color="#4080ff" />
          
          <Suspense fallback={null}>
            <PenguinModel />
          </Suspense>
        </Canvas>
      </div>
      
      <style jsx>{`
        .dotted-bg {
          background-image: 
            radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
