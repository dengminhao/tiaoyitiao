import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLAYER_COLOR } from '../constants';

interface PlayerProps {
  position: THREE.Vector3;
  isCharging: boolean;
  chargeLevel: number; // 0 to 1
  lookAtTarget: THREE.Vector3 | null;
}

const Player: React.FC<PlayerProps> = ({ position, isCharging, chargeLevel, lookAtTarget }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  // Smooth visual position interpolation
  useFrame(() => {
    if (groupRef.current) {
      // Lerp the actual group position to the physics position
      groupRef.current.position.lerp(position, 0.2);

      // Look at logic
      if (lookAtTarget) {
        // Create a dummy object to calculate rotation to keep it simple
        const targetPos = new THREE.Vector3(lookAtTarget.x, groupRef.current.position.y, lookAtTarget.z);
        groupRef.current.lookAt(targetPos);
      }

      // Squash and stretch animation based on charging
      if (isCharging) {
        // Squash down
        const squashFactor = 1 - (chargeLevel * 0.4); // Max 40% squash
        const bulgeFactor = 1 + (chargeLevel * 0.2); 
        
        if (bodyRef.current && headRef.current) {
             bodyRef.current.scale.set(bulgeFactor, squashFactor, bulgeFactor);
             // Adjust positions to keep feet on ground
             bodyRef.current.position.y = (0.5 * squashFactor) / 2;
             headRef.current.position.y = (0.5 * squashFactor) + 0.15;
        }
      } else {
        // Return to normal
        if (bodyRef.current && headRef.current) {
            bodyRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.2);
            bodyRef.current.position.y = 0.25;
            headRef.current.position.y = 0.65;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.65, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={PLAYER_COLOR} roughness={0.2} metalness={0.1} />
      </mesh>
      
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.25, 0.5, 32]} />
        <meshStandardMaterial color={PLAYER_COLOR} roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Shadow Blob (Simple fake shadow for better grounding) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

export default Player;