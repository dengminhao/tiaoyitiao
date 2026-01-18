import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Environment, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { 
  GameState, 
  PlatformData, 
  ShapeType 
} from '../types';
import { 
  MIN_DISTANCE, 
  MAX_DISTANCE, 
  PLATFORM_COLORS, 
  PLATFORM_BASE_SIZE,
  JUMP_SPEED_MULTIPLIER,
  PLATFORM_HEIGHT,
  PLAYER_SIZE,
  GRAVITY,
  HORIZONTAL_SPEED
} from '../constants';
import Player from './Player';
import Platform from './Platform';

// Helper to generate random number
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Helper to generate next platform
const generatePlatform = (prevPos: THREE.Vector3, currentPos: THREE.Vector3, isFirst: boolean = false): PlatformData => {
  const id = Math.random().toString(36).substr(2, 9);
  
  // First platform
  if (isFirst) {
    return {
      id,
      position: new THREE.Vector3(0, 0, 0),
      type: ShapeType.BOX,
      color: '#ffffff',
      size: PLATFORM_BASE_SIZE,
      height: PLATFORM_HEIGHT
    };
  }

  const distance = randomRange(MIN_DISTANCE, MAX_DISTANCE);
  
  // Calculate vector from prev to current to know "incoming" direction
  const diff = new THREE.Vector3().subVectors(currentPos, prevPos);
  
  // Define 4 cardinal directions
  const directions = [
      new THREE.Vector3(1, 0, 0),  // +X
      new THREE.Vector3(-1, 0, 0), // -X
      new THREE.Vector3(0, 0, 1),  // +Z
      new THREE.Vector3(0, 0, -1)  // -Z
  ];

  let validDirs = directions;

  // Logic: Identify the direction we just came from, and ban the opposite.
  // E.g. If we moved +X (Right), we cannot move -X (Left) next.
  if (diff.lengthSq() > 0.1) {
      // Find the dominant axis of movement to snap to grid
      const isX = Math.abs(diff.x) > Math.abs(diff.z);
      // Normalized direction vector (1,0,0) or (-1,0,0) etc.
      const incomingDirX = isX ? Math.sign(diff.x) : 0;
      const incomingDirZ = !isX ? Math.sign(diff.z) : 0;

      // We want to exclude the direction that is exactly opposite to incoming
      // Opposite of (x, z) is (-x, -z)
      validDirs = directions.filter(d => {
          const isOpposite = (d.x === -incomingDirX && d.z === -incomingDirZ);
          return !isOpposite;
      });
  } else {
      // First generated block after start (prevPos == currentPos)
      // Default to standard Isometric Forward directions (+X or -Z)
      // This ensures the first jump is always "forward" in the isometric view
      validDirs = [
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, -1)
      ];
  }

  const chosenDir = validDirs[Math.floor(Math.random() * validDirs.length)];
  
  // Apply direction
  const nextPos = currentPos.clone().add(chosenDir.multiplyScalar(distance));

  return {
    id,
    position: nextPos,
    type: Math.random() > 0.5 ? ShapeType.BOX : ShapeType.CYLINDER,
    color: PLATFORM_COLORS[Math.floor(Math.random() * PLATFORM_COLORS.length)],
    size: randomRange(0.8, 1.2),
    height: PLATFORM_HEIGHT
  };
};

interface GameSceneProps {
  gameState: GameState;
  onScore: () => void;
  onGameOver: () => void;
}

const GameLogic: React.FC<GameSceneProps> = ({ gameState, onScore, onGameOver }) => {
  const { camera } = useThree();
  
  // -- Game State Refs --
  const playerPosRef = useRef(new THREE.Vector3(0, PLATFORM_HEIGHT, 0));
  const playerVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const isJumpingRef = useRef(false);
  const chargeStartTimeRef = useRef(0);
  const platformsRef = useRef<PlatformData[]>([]);
  const isDeadRef = useRef(false);
  
  // Ref for smooth camera movement
  const viewTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  
  // -- React State --
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeRatio, setChargeRatio] = useState(0);
  const [cameraTarget, setCameraTarget] = useState(new THREE.Vector3(0, 0, 0));

  // Initialize Game
  useEffect(() => {
    if (gameState === GameState.PLAYING && platformsRef.current.length === 0) {
      const first = generatePlatform(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), true);
      const second = generatePlatform(first.position, first.position);
      
      platformsRef.current = [first, second];
      setPlatforms([...platformsRef.current]);
      
      playerPosRef.current.set(0, PLATFORM_HEIGHT, 0);
      playerVelocityRef.current.set(0, 0, 0);
      isJumpingRef.current = false;
      isDeadRef.current = false;
      
      // Reset Camera
      const midPoint = new THREE.Vector3().addVectors(first.position, second.position).multiplyScalar(0.5);
      setCameraTarget(midPoint);
      viewTargetRef.current.copy(midPoint); // Snap camera immediately
    }
  }, [gameState]);

  // Input Handlers
  const startCharge = useCallback(() => {
    if (gameState !== GameState.PLAYING || isJumpingRef.current || isDeadRef.current) return;
    setIsCharging(true);
    chargeStartTimeRef.current = performance.now();
  }, [gameState]);

  const endCharge = useCallback(() => {
    if (gameState !== GameState.PLAYING || !isCharging || isJumpingRef.current || isDeadRef.current) return;
    
    setIsCharging(false);
    const duration = (performance.now() - chargeStartTimeRef.current) / 1000;
    const clampedDuration = Math.min(duration, 1.5);
    setChargeRatio(0);

    // Physics Launch
    const currentPlatform = platformsRef.current[platformsRef.current.length - 2];
    const nextPlatform = platformsRef.current[platformsRef.current.length - 1];
    
    const direction = new THREE.Vector3()
      .subVectors(nextPlatform.position, currentPlatform.position)
      .normalize();

    const jumpDistance = clampedDuration * JUMP_SPEED_MULTIPLIER; 
    const flightTime = jumpDistance / HORIZONTAL_SPEED;
    const vy = 0.5 * GRAVITY * flightTime;
    
    const vx = direction.x * HORIZONTAL_SPEED;
    const vz = direction.z * HORIZONTAL_SPEED;

    playerVelocityRef.current.set(vx, vy, vz);
    isJumpingRef.current = true;

  }, [gameState, isCharging]);


  // Game Loop
  useFrame((state, delta) => {
    if (gameState !== GameState.PLAYING) return;

    // Charging Animation
    if (isCharging && !isJumpingRef.current && !isDeadRef.current) {
        const duration = (performance.now() - chargeStartTimeRef.current) / 1000;
        const ratio = Math.min(duration / 1.5, 1);
        setChargeRatio(ratio);
    }

    // Jumping Physics
    if (isJumpingRef.current) {
      const pos = playerPosRef.current;
      const vel = playerVelocityRef.current;

      pos.x += vel.x * delta;
      pos.y += vel.y * delta;
      pos.z += vel.z * delta;

      vel.y -= GRAVITY * delta;

      // Check collision with platform plane
      if (vel.y < 0 && pos.y <= PLATFORM_HEIGHT) {
        
        let landedPlatform: PlatformData | null = null;
        
        for (let i = platformsRef.current.length - 1; i >= Math.max(0, platformsRef.current.length - 3); i--) {
            const p = platformsRef.current[i];
            const dist = new THREE.Vector2(pos.x, pos.z).distanceTo(new THREE.Vector2(p.position.x, p.position.z));
            if (dist < p.size + 0.2) { 
                landedPlatform = p;
                break;
            }
        }

        if (landedPlatform) {
            pos.y = PLATFORM_HEIGHT;
            isJumpingRef.current = false;
            playerVelocityRef.current.set(0, 0, 0);

            const currentIdx = platformsRef.current.length - 2;
            const nextIdx = platformsRef.current.length - 1;
            const nextPlatform = platformsRef.current[nextIdx];
            const currentPlatform = platformsRef.current[currentIdx];

            if (landedPlatform.id === nextPlatform.id) {
                // SUCCESS
                onScore();

                // Generate new platform with updated logic (3 directions)
                const newPlatform = generatePlatform(currentPlatform.position, nextPlatform.position);
                platformsRef.current.push(newPlatform);
                
                if (platformsRef.current.length > 6) {
                    platformsRef.current.shift();
                }
                setPlatforms([...platformsRef.current]);

                // Update Camera Target
                const newTarget = new THREE.Vector3()
                    .addVectors(nextPlatform.position, newPlatform.position)
                    .multiplyScalar(0.5);
                setCameraTarget(newTarget);

            } else if (landedPlatform.id === currentPlatform.id) {
                // Fail if jumped too short (stayed on same block)
                if (Math.abs(pos.x - currentPlatform.position.x) > 0.1 || Math.abs(pos.z - currentPlatform.position.z) > 0.1) {
                    isDeadRef.current = true;
                    setTimeout(onGameOver, 500);
                }
            } else {
                // Landed on wrong platform
                isDeadRef.current = true;
                setTimeout(onGameOver, 500);
            }
        } else {
            // Missed everything
            if (!isDeadRef.current) {
                isDeadRef.current = true;
                setTimeout(onGameOver, 800);
            }
        }
      }
    }

    // Camera Follow Logic
    viewTargetRef.current.lerp(cameraTarget, 0.02); 
    const camOffset = new THREE.Vector3(-20, 20, 20); 
    camera.position.copy(viewTargetRef.current).add(camOffset);
    camera.lookAt(viewTargetRef.current);
  });

  const nextPlat = platforms.length > 1 ? platforms[platforms.length - 1] : null;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>

      {/* Input Overlay */}
      <mesh 
        position={[cameraTarget.x, 5, cameraTarget.z]} 
        rotation={[-Math.PI/2, 0, 0]} 
        visible={false}
        onPointerDown={startCharge}
        onPointerUp={endCharge}
        onPointerLeave={endCharge}
      >
        <planeGeometry args={[100, 100]} />
      </mesh>

      <Player 
        position={playerPosRef.current} 
        isCharging={isCharging}
        chargeLevel={chargeRatio}
        lookAtTarget={nextPlat ? nextPlat.position : null}
      />

      {platforms.map((p, index) => (
        <Platform 
            key={p.id} 
            data={p} 
            isTarget={index === platforms.length - 1} 
        />
      ))}

      <Environment preset="city" />
    </>
  );
};

const GameScene: React.FC<GameSceneProps> = (props) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      {/* Camera is controlled by GameLogic, initial config here only */}
      <OrthographicCamera makeDefault position={[-20, 20, 20]} zoom={40} near={-50} far={200} />
      <GameLogic {...props} />
    </Canvas>
  );
};

export default GameScene;