import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, MeshWobbleMaterial } from '@react-three/drei';
import { Mesh } from 'three';

interface Coin3DProps {
  result?: 'cara' | 'coroa' | null;
  isFlipping?: boolean;
  onFlipComplete?: (result: 'cara' | 'coroa') => void;
}

function CoinMesh({ isFlipping, result }: { isFlipping: boolean; result: 'cara' | 'coroa' | null }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isFlipping) {
        meshRef.current.rotation.x += delta * 10; // Rotação rápida durante o flip
        meshRef.current.rotation.y += delta * 8;
      } else {
        // Rotação suave quando parada
        meshRef.current.rotation.y += delta * 0.5;
      }
    }
  });

  const showCoroa = result === 'coroa';

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/* Cilindro principal da moeda */}
      <cylinderGeometry args={[2, 2, 0.3, 32]} />
      <MeshWobbleMaterial
        color="#FFD700"
        metalness={0.8}
        roughness={0.2}
        factor={isFlipping ? 0.3 : 0.1}
        speed={isFlipping ? 3 : 1}
      />
      
      {/* Texto CARA - frente */}
      <Text
        position={[0, 0, 0.16]}
        fontSize={0.6}
        color="#8B4513"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
        font="/fonts/inter-bold.woff"
      >
        CARA
      </Text>
      
      {/* Texto COROA - verso */}
      <Text
        position={[0, 0, -0.16]}
        fontSize={0.5}
        color="#8B4513"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
        font="/fonts/inter-bold.woff"
      >
        COROA
      </Text>
      
      {/* Símbolo da coroa no verso */}
      <Text
        position={[0, -0.5, -0.16]}
        fontSize={0.8}
        color="#8B4513"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        ♔
      </Text>
    </mesh>
  );
}

export const Coin3DReact: React.FC<Coin3DProps> = ({ 
  result = null, 
  isFlipping = false,
  onFlipComplete 
}) => {
  return (
    <div className="w-32 h-32 mx-auto">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Iluminação */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#FFD700" />
        
        {/* Moeda 3D */}
        <CoinMesh isFlipping={isFlipping} result={result} />
      </Canvas>
    </div>
  );
};