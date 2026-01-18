import React, { useMemo } from 'react';
import { PlatformData, ShapeType } from '../types';

interface PlatformProps {
  data: PlatformData;
  isTarget: boolean;
}

const Platform: React.FC<PlatformProps> = ({ data, isTarget }) => {
  // UseMemo to keep geometry consistent
  const geometry = useMemo(() => {
    if (data.type === ShapeType.CYLINDER) {
      return <cylinderGeometry args={[data.size, data.size, data.height, 32]} />;
    } else {
      const w = data.size * 1.8; // Box width needs to be comparable to cylinder diameter
      return <boxGeometry args={[w, data.height, w]} />;
    }
  }, [data.type, data.size, data.height]);

  return (
    <group position={data.position}>
      <mesh castShadow receiveShadow position={[0, data.height / 2, 0]}>
        {geometry}
        <meshStandardMaterial 
          color={data.color} 
          roughness={0.1} // Shiny plastic look
          metalness={0.0} 
        />
      </mesh>
      
      {/* Target indicator (optional subtle effect) */}
      {isTarget && (
        <mesh position={[0, data.height + 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[0.1, 0.2, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default Platform;