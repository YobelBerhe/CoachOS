import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Droplet,
  Coffee,
  Dumbbell,
  Utensils,
  ShoppingCart,
  ChefHat,
  Repeat,
  Award,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Loader2
} from 'lucide-react';

interface TimeStation {
  time: string;
  title: string;
  emoji: string;
  icon: any;
  color: string;
  angle: number;
  features: string[];
  description: string;
}

const timeStations: TimeStation[] = [
  {
    time: '6 AM',
    title: 'Wake Up',
    emoji: '🌅',
    icon: Droplet,
    color: '#f97316',
    angle: 0,
    features: ['Voice Greeting', 'Hydration Alert', 'Daily Goals', 'Morning Report'],
    description: 'Start your day with AI-powered guidance'
  },
  {
    time: '8 AM',
    title: 'Breakfast',
    emoji: '🍳',
    icon: Coffee,
    color: '#f59e0b',
    angle: 45,
    features: ['Food Diary', 'Barcode Scanner', 'Macro Tracker', 'Voice Logging'],
    description: 'Log breakfast in seconds'
  },
  {
    time: '9 AM',
    title: 'Workout',
    emoji: '💪',
    icon: Dumbbell,
    color: '#ef4444',
    angle: 90,
    features: ['Voice Commands', 'Smart Reminders', 'Progress Tracking'],
    description: 'Hands-free workout logging'
  },
  {
    time: '12 PM',
    title: 'Lunch',
    emoji: '🍽️',
    icon: Utensils,
    color: '#10b981',
    angle: 135,
    features: ['Menu Scanner AI', 'Health Scores', 'Smart Modifications', 'Meal Logging'],
    description: 'WORLD-FIRST restaurant menu AI'
  },
  {
    time: '3 PM',
    title: 'Shopping',
    emoji: '🛒',
    icon: ShoppingCart,
    color: '#3b82f6',
    angle: 180,
    features: ['AI Shopping List', 'Scan-to-Check-Off', 'Bobby-Style Alerts', 'Receipt Scanner'],
    description: 'Revolutionary shopping experience'
  },
  {
    time: '6 PM',
    title: 'Cooking',
    emoji: '👨‍🍳',
    icon: ChefHat,
    color: '#8b5cf6',
    angle: 225,
    features: ['AI Meal Planner', 'Rescue Recipes', 'Food Waste Tracker', 'Voice Cook Mode'],
    description: 'Save food, save money, save planet'
  },
  {
    time: '8 PM',
    title: 'Dinner',
    emoji: '🍱',
    icon: Repeat,
    color: '#ec4899',
    angle: 270,
    features: ['Meal Swap', 'Community Trading', 'Family Sharing', 'Carbon Tracking'],
    description: 'Share meals, build community'
  },
  {
    time: '10 PM',
    title: 'Summary',
    emoji: '📊',
    icon: Award,
    color: '#eab308',
    angle: 315,
    features: ['Daily Report', 'Achievements', 'Money Saved', 'Voice Summary'],
    description: 'See your daily impact'
  },
];

// Central Earth Sphere
function EarthSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      const scale = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <mesh 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial
        color="#1e40af"
        emissive="#3b82f6"
        emissiveIntensity={0.3}
        roughness={0.7}
        metalness={0.3}
      />
    </mesh>
  );
}

// Time Station Node
function TimeStationNode({ 
  station, 
  index, 
  isActive, 
  onClick 
}: { 
  station: TimeStation; 
  index: number; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate position on orbit
  const radius = 4;
  const angleRad = (station.angle * Math.PI) / 180;
  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;

  useFrame((state) => {
    if (meshRef.current) {
      // Scale animation
      const targetScale = isActive ? 1.5 : hovered ? 1.3 : 1.0;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale), 
        0.1
      );
      
      // Gentle floating
      const float = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      meshRef.current.position.z = float;
    }

    if (glowRef.current) {
      glowRef.current.rotation.z += 0.02;
      const targetOpacity = isActive ? 0.6 : hovered ? 0.4 : 0.2;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = targetOpacity;
    }
  });

  return (
    <group position={[x, y, 0]}>
      {/* Glow Ring */}
      <mesh ref={glowRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial
          color={station.color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main Station Sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color={station.color}
          emissive={station.color}
          emissiveIntensity={isActive ? 2.0 : hovered ? 1.5 : 0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Pulse Ring when Active */}
      {isActive && (
        <mesh>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial
            color={station.color}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3D Text Label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {station.time}
      </Text>

      {/* Emoji */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {station.emoji}
      </Text>

      {/* Connection Line to Center */}
      {isActive && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                0, 0, 0,
                -x / 1.5, -y / 1.5, 0
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={station.color}
            linewidth={2}
            transparent
            opacity={0.6}
          />
        </line>
      )}
    </group>
  );
}

// Orbit Ring
function OrbitRing() {
  const points = [];
  const radius = 4;
  for (let i = 0; i <= 128; i++) {
    const angle = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ));
  }

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color="#3b82f6" 
        transparent 
        opacity={0.2}
        linewidth={1}
      />
    </line>
  );
}

// Floating Particles
function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    // Random position in sphere
    const radius = 8 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Random colors (blue tones)
    colors[i * 3] = 0.2 + Math.random() * 0.3;
    colors[i * 3 + 1] = 0.4 + Math.random() * 0.4;
    colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
  }

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
      particlesRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Scene Component
function Scene({ 
  activeIndex, 
  onStationClick 
}: { 
  activeIndex: number; 
  onStationClick: (index: number) => void;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[0, 0, 10]} intensity={0.8} color="#8b5cf6" />

      {/* Stars Background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={2000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Central Earth */}
      <EarthSphere />

      {/* Orbit Ring */}
      <OrbitRing />

      {/* Time Stations */}
      {timeStations.map((station, index) => (
        <TimeStationNode
          key={index}
          station={station}
          index={index}
          isActive={activeIndex === index}
          onClick={() => onStationClick(index)}
        />
      ))}
    </>
  );
}

// Loading Component
function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold">Loading 3D Experience...</p>
        <p className="text-blue-300 text-sm mt-2">Preparing your journey</p>
      </div>
    </div>
  );
}

// Main Timeline3D Component
export default function Timeline3D() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-rotate through stations
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % timeStations.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const activeStation = timeStations[activeIndex];

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  return (
    <div className={`relative w-full bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 rounded-2xl overflow-hidden ${
      isFullscreen ? 'h-screen' : 'h-[500px] md:h-[700px] lg:h-[800px]'
    }`}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        className="w-full h-full"
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <Scene 
            activeIndex={activeIndex} 
            onStationClick={(index) => {
              setActiveIndex(index);
              setShowDetails(true);
              setIsPlaying(false);
            }} 
          />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={6}
            maxDistance={18}
            autoRotate={isPlaying}
            autoRotateSpeed={0.3}
            dampingFactor={0.05}
            rotateSpeed={0.5}
          />
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        </Suspense>
      </Canvas>

      {/* Loading Fallback */}
      <Suspense fallback={<LoadingScreen />}>
        <div />
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto z-10">
          <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-4 border border-white/10">
            <Badge className="bg-blue-500/90 backdrop-blur-sm text-white mb-2 shadow-lg">
              <Clock className="w-4 h-4 mr-2" />
              Interactive 3D Journey
            </Badge>
            <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-2xl">
              Your 24-Hour Health Cycle
            </h3>
            <p className="text-blue-200 text-sm mt-1 hidden md:block">
              Click stations • Drag to rotate • Scroll to zoom
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsPlaying(!isPlaying)}
              className="backdrop-blur-xl bg-white/90 hover:bg-white shadow-lg"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Play</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveIndex(0)}
              className="backdrop-blur-xl bg-white/90 hover:bg-white shadow-lg"
              title="Reset to start"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleFullscreen}
              className="backdrop-blur-xl bg-white/90 hover:bg-white shadow-lg hidden md:flex"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Info Panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-4 left-4 right-4 pointer-events-auto z-10"
            >
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                <CardContent className="p-4 md:p-6">
                  {/* Station Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-2xl"
                        style={{ backgroundColor: activeStation.color }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {activeStation.emoji}
                      </motion.div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {activeStation.time}
                        </p>
                        <h4 className="text-xl md:text-2xl font-bold">
                          {activeStation.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {activeStation.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDetails(false)}
                      className="flex-shrink-0"
                    >
                      Hide
                    </Button>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {activeStation.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: activeStation.color }}
                        />
                        <span className="text-sm font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Station Navigation Dots */}
                  <div className="flex gap-1.5 justify-center pt-3 border-t">
                    {timeStations.map((station, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveIndex(idx);
                          setIsPlaying(false);
                        }}
                        className={`h-2 rounded-full transition-all ${
                          idx === activeIndex 
                            ? 'w-8' 
                            : 'w-2 opacity-50 hover:opacity-100'
                        }`}
                        style={{ 
                          backgroundColor: idx === activeIndex 
                            ? activeStation.color 
                            : '#cbd5e1' 
                        }}
                        aria-label={`Go to ${station.time}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show Details Button (when hidden) */}
        {!showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-10"
          >
            <Button
              onClick={() => setShowDetails(true)}
              className="backdrop-blur-xl bg-white/90 hover:bg-white shadow-2xl"
            >
              Show Details
            </Button>
          </motion.div>
        )}

        {/* Mobile Instructions */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none md:hidden">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 3, duration: 1 }}
            className="text-center backdrop-blur-xl bg-black/40 rounded-2xl p-4 border border-white/10"
          >
            <p className="text-white text-sm font-semibold mb-2">
              👆 Touch & Drag to Explore
            </p>
            <p className="text-blue-200 text-xs">
              Tap stations to see features
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
