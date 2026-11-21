import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CredentialThreeCanvasProps {
  isVerifying?: boolean;
  isRevoked?: boolean;
  scanProgress?: number;
}

export const CredentialThreeCanvas: React.FC<CredentialThreeCanvasProps> = ({
  isVerifying = false,
  isRevoked = false,
  scanProgress = 100,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isVerifyingRef = useRef(isVerifying);
  const isRevokedRef = useRef(isRevoked);
  const scanProgressRef = useRef(scanProgress);

  // Keep refs in sync for requestAnimationFrame loop
  useEffect(() => {
    isVerifyingRef.current = isVerifying;
  }, [isVerifying]);

  useEffect(() => {
    isRevokedRef.current = isRevoked;
  }, [isRevoked]);

  useEffect(() => {
    scanProgressRef.current = scanProgress;
  }, [scanProgress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = mount.clientWidth || 550;
    let height = mount.clientHeight || 650;

    // 1. Scene, Camera, WebGLRenderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 32);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Color definitions matching user's palette
    const orangeColor = new THREE.Color(0xF45B0B);
    const powderColor = new THREE.Color(0xA8C9C8);
    const whiteColor = new THREE.Color(0xFFFFFF);
    const roseColor = new THREE.Color(0xE11D48);

    // 3. Central Holographic Security Seal (Rotating 3D Icosahedron & Rings)
    const sealGroup = new THREE.Group();
    scene.add(sealGroup);

    // Outer Gyroscope Ring (Powder Blue)
    const ringGeo1 = new THREE.TorusGeometry(10.5, 0.06, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: powderColor,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    sealGroup.add(ring1);

    // Middle Gyroscope Ring (Racing Orange)
    const ringGeo2 = new THREE.TorusGeometry(8.2, 0.05, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: orangeColor,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    sealGroup.add(ring2);

    // Inner Gyroscope Ring (White / Powder)
    const ringGeo3 = new THREE.TorusGeometry(6.4, 0.04, 16, 80);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: whiteColor,
      transparent: true,
      opacity: 0.35,
    });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.y = Math.PI / 4;
    sealGroup.add(ring3);

    // 4. Floating 3D Merkle Blockchain Nodes (Cubes orbiting in 3D)
    const nodeCount = 6;
    const nodes: { mesh: THREE.Mesh; angle: number; speed: number; distance: number; height: number }[] = [];
    const cubeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    for (let i = 0; i < nodeCount; i++) {
      const isOrange = i % 2 === 0;
      const cubeMat = new THREE.MeshBasicMaterial({
        color: isOrange ? orangeColor : powderColor,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      
      // Wireframe inner core
      const innerCubeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
      const innerCubeMat = new THREE.MeshBasicMaterial({
        color: whiteColor,
        transparent: true,
        opacity: 0.8,
      });
      const innerCube = new THREE.Mesh(innerCubeGeo, innerCubeMat);
      cube.add(innerCube);

      scene.add(cube);
      nodes.push({
        mesh: cube,
        angle: (i / nodeCount) * Math.PI * 2,
        speed: 0.015 + (i % 3) * 0.005,
        distance: 12 + (i % 2) * 2.5,
        height: (Math.sin(i) * 6),
      });
    }

    // 5. Constellation Particle Cloud (280 glowing micro-particles)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 9 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      const rand = Math.random();
      const pColor = rand > 0.45 ? powderColor : rand > 0.15 ? orangeColor : whiteColor;
      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Volumetric 3D Laser Scanning Plane
    const laserPlaneGeo = new THREE.PlaneGeometry(24, 0.35);
    const laserPlaneMat = new THREE.MeshBasicMaterial({
      color: orangeColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const laserMesh = new THREE.Mesh(laserPlaneGeo, laserPlaneMat);
    laserMesh.position.z = 2;
    scene.add(laserMesh);

    // 7. Mouse Parallax Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 2.5;
      mouse.targetY = y * 2.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Responsive Resize
    const handleResize = () => {
      if (!mount) return;
      width = mount.clientWidth || 550;
      height = mount.clientHeight || 650;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 9. Main Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const verifying = isVerifyingRef.current;
      const revoked = isRevokedRef.current;
      const progress = scanProgressRef.current;

      // Update ring colors based on state
      const targetColor = revoked ? roseColor : powderColor;
      ringMat1.color.lerp(targetColor, 0.1);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Camera parallax tilt
      camera.position.x = mouse.x * 1.2;
      camera.position.y = mouse.y * 1.2;
      camera.lookAt(0, 0, 0);

      // Multiplier speed when verifying
      const speedMult = verifying ? 3.5 : 1.0;

      // Rotate seal rings with precision
      ring1.rotation.z += 0.15 * delta * speedMult;
      ring1.rotation.x = Math.PI / 3 + mouse.y * 0.15;

      ring2.rotation.y += -0.22 * delta * speedMult;
      ring2.rotation.x = Math.PI / 4 + mouse.x * 0.15;

      ring3.rotation.z += 0.28 * delta * speedMult;
      ring3.rotation.y += 0.18 * delta * speedMult;

      // Orbiting Merkle blocks
      nodes.forEach((node, idx) => {
        node.angle += node.speed * speedMult;
        node.mesh.position.x = Math.cos(node.angle) * node.distance;
        node.mesh.position.z = Math.sin(node.angle) * node.distance - 2;
        node.mesh.position.y = node.height + Math.sin(elapsed * 1.5 + idx) * 1.2;

        node.mesh.rotation.x += 0.02 * speedMult;
        node.mesh.rotation.y += 0.03 * speedMult;
      });

      // Animate Particles
      particles.rotation.y += 0.03 * delta * speedMult;
      particles.rotation.x = Math.sin(elapsed * 0.2) * 0.08 + mouse.y * 0.1;

      // Laser scan beam in 3D
      if (verifying) {
        laserPlaneMat.opacity = 0.85;
        // Map scanProgress (0 to 100) to 3D Y coordinates (8 down to -8)
        laserMesh.position.y = 8 - (progress / 100) * 16;
        laserMesh.scale.x = 1 + Math.sin(elapsed * 20) * 0.08;
      } else {
        laserPlaneMat.opacity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      ringGeo3.dispose();
      ringMat3.dispose();
      cubeGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      laserPlaneGeo.dispose();
      laserPlaneMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute -inset-16 sm:-inset-24 pointer-events-none -z-10 overflow-visible flex items-center justify-center select-none"
    />
  );
};
