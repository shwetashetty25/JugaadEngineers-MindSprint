import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Zap,
  Play,
  Pause,
  Compass,
  Check,
  ShieldAlert,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ThreeCredentialCardProps {
  initialMode?: 'valid' | 'revoked';
}

export const ThreeCredentialCard: React.FC<ThreeCredentialCardProps> = ({
  initialMode = 'valid',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'valid' | 'revoked'>(initialMode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  const { success } = useToast();

  // Internal Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cardMeshRef = useRef<THREE.Mesh | null>(null);
  const laserRef = useRef<THREE.Mesh | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  const frontTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const backTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Interaction refs
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationTargetRef = useRef({ x: 0.1, y: 0.2 });
  const currentRotationRef = useRef({ x: 0.1, y: 0.2 });
  const isAutoSpinRef = useRef(true);
  const isVerifyingRef = useRef(false);
  const isRevokedRef = useRef(false);

  useEffect(() => {
    isAutoSpinRef.current = isAutoSpin;
  }, [isAutoSpin]);

  useEffect(() => {
    isVerifyingRef.current = isVerifying;
  }, [isVerifying]);

  useEffect(() => {
    isRevokedRef.current = mode === 'revoked';
  }, [mode]);

  // Helper to draw the front face of the credential onto an HTML canvas
  const drawFrontCanvas = (isRevokedState: boolean): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background base
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle modern gradient
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(0.5, '#F9FCFC');
    bgGrad.addColorStop(1, '#F0F6F6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Security Micro-Grid Pattern in Powder Blue
    ctx.strokeStyle = '#A8C9C8';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25;
    for (let x = 40; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, canvas.height - 40);
      ctx.stroke();
    }
    for (let y = 40; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 40, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Outer Border (Powder Blue or Rose)
    ctx.strokeStyle = isRevokedState ? '#F43F5E' : '#A8C9C8';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner Elegant Gold/Orange Accent Line
    ctx.strokeStyle = isRevokedState ? '#E11D48' : '#F45B0B';
    ctx.lineWidth = 4;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // Top Header Banner
    const bannerGrad = ctx.createLinearGradient(50, 50, canvas.width - 50, 50);
    if (isRevokedState) {
      bannerGrad.addColorStop(0, '#E11D48');
      bannerGrad.addColorStop(1, '#BE123C');
    } else {
      bannerGrad.addColorStop(0, '#A8C9C8');
      bannerGrad.addColorStop(0.5, '#F45B0B');
      bannerGrad.addColorStop(1, '#A8C9C8');
    }
    ctx.fillStyle = bannerGrad;
    ctx.fillRect(50, 50, canvas.width - 100, 16);

    // University Crest / Seal
    ctx.fillStyle = isRevokedState ? '#FFF1F2' : '#F4F8F8';
    ctx.beginPath();
    ctx.arc(160, 190, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isRevokedState ? '#E11D48' : '#F45B0B';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Emblem Icon (Stylized Greek Temple / Award)
    ctx.fillStyle = isRevokedState ? '#E11D48' : '#F45B0B';
    ctx.fillRect(125, 175, 70, 12); // Roof base
    ctx.fillRect(135, 195, 10, 30); // Column 1
    ctx.fillRect(155, 195, 10, 30); // Column 2
    ctx.fillRect(175, 195, 10, 30); // Column 3
    ctx.fillRect(120, 230, 80, 10); // Base

    // University Name & Hierarchy
    ctx.fillStyle = '#111617';
    ctx.font = 'bold 50px "Playfair Display", Georgia, serif';
    ctx.fillText('Indian Institute of Technology Delhi', 260, 175);

    ctx.fillStyle = '#777A73';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('ACADEMIC SENATE REGISTRY • NEW DELHI', 260, 215);

    // Verification Status Badge (Top Right)
    const badgeX = canvas.width - 320;
    const badgeY = 145;
    ctx.fillStyle = isRevokedState ? '#FFF1F2' : '#F4F8F8';
    ctx.strokeStyle = isRevokedState ? '#E11D48' : '#A8C9C8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, 240, 60, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isRevokedState ? '#E11D48' : '#174B3A';
    ctx.beginPath();
    ctx.arc(badgeX + 35, badgeY + 30, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 24px monospace';
    ctx.fillText(isRevokedState ? 'REVOKED' : 'VERIFIED', badgeX + 60, badgeY + 38);

    // Conferred Credential Card Area
    const boxY = 320;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E6E3DA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, boxY, canvas.width - 160, 520, 24);
    ctx.fill();
    ctx.stroke();

    // Box Header
    ctx.fillStyle = '#777A73';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('CONFERRED CREDENTIAL', 120, boxY + 60);

    ctx.fillStyle = isRevokedState ? '#E11D48' : '#F45B0B';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(isRevokedState ? 'VDX-2023-IITD-0104' : 'VDX-2024-IITD-0891', canvas.width - 480, boxY + 60);

    // Degree Title
    ctx.fillStyle = '#111617';
    ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
    ctx.fillText('Bachelor of Technology in', 120, boxY + 150);
    ctx.fillText('Computer Science & Engineering', 120, boxY + 220);

    ctx.fillStyle = '#777A73';
    ctx.font = '30px sans-serif';
    ctx.fillText('Department of Computer Science and Engineering', 120, boxY + 280);

    // Divider Line
    ctx.strokeStyle = '#E6E3DA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, boxY + 340);
    ctx.lineTo(canvas.width - 120, boxY + 340);
    ctx.stroke();

    // Candidate Details
    ctx.fillStyle = '#777A73';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('CANDIDATE', 120, boxY + 385);

    ctx.fillStyle = '#111617';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(isRevokedState ? 'Aditya Singhal' : 'Aarav Sharma', 120, boxY + 435);

    ctx.fillStyle = '#777A73';
    ctx.font = '24px monospace';
    ctx.fillText(isRevokedState ? 'Roll: 2019CS10901' : 'Roll: 2020CS10492', 120, boxY + 480);

    // Class & Honors
    ctx.fillStyle = '#777A73';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('CLASS & HONORS', canvas.width - 480, boxY + 385);

    ctx.fillStyle = isRevokedState ? '#E11D48' : '#F45B0B';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(isRevokedState ? 'CGPA: 8.45' : 'CGPA: 9.62 (Gold Medal)', canvas.width - 480, boxY + 435);

    ctx.fillStyle = '#777A73';
    ctx.font = '24px sans-serif';
    ctx.fillText('Graduation Year: 2024', canvas.width - 480, boxY + 480);

    // Cryptographic Signatures & Hash Box (Bottom Section)
    const cryptoY = 890;
    ctx.fillStyle = '#111617';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('Senate Digital Signature:', 100, cryptoY + 40);

    ctx.fillStyle = isRevokedState ? '#E11D48' : '#F45B0B';
    ctx.fillText(isRevokedState ? 'INVALIDATED / REVOKED' : 'ECDSA Valid (P-256)', 500, cryptoY + 40);

    // SHA-256 Box
    ctx.fillStyle = '#F4F8F8';
    ctx.strokeStyle = '#A8C9C8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(100, cryptoY + 80, 680, 80, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#174B3A';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('SHA-256: ', 130, cryptoY + 130);
    ctx.fillStyle = '#111617';
    ctx.fillText(isRevokedState ? '0x4455667788...2233' : '0x8f2a91b34c...4a1e', 260, cryptoY + 130);

    ctx.fillStyle = '#777A73';
    ctx.font = '24px monospace';
    ctx.fillText('Ledger Anchor: Block #19,521,402 • Verified in 0.2s', 100, cryptoY + 210);

    // QR Code Visualization (drawn as a crisp matrix)
    const qrSize = 220;
    const qrX = canvas.width - 340;
    const qrY = cryptoY + 20;

    // QR Frame
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#F45B0B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 16);
    ctx.fill();
    ctx.stroke();

    // Draw QR pattern simulation
    ctx.fillStyle = '#111617';
    const gridCount = 21;
    const cellSize = qrSize / gridCount;

    // Corner Finder Patterns
    const drawFinder = (fx: number, fy: number) => {
      ctx.fillStyle = '#111617';
      ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = '#F45B0B';
      ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
    };

    drawFinder(qrX + cellSize, qrY + cellSize);
    drawFinder(qrX + qrSize - cellSize * 8, qrY + cellSize);
    drawFinder(qrX + cellSize, qrY + qrSize - cellSize * 8);

    // Random data bits with seed
    ctx.fillStyle = '#111617';
    for (let r = 0; r < gridCount; r++) {
      for (let c = 0; c < gridCount; c++) {
        // Skip finder areas
        if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
        if ((r * 13 + c * 7) % 3 === 0) {
          ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }

    ctx.fillStyle = '#777A73';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SCAN TO VERIFY', qrX + 25, qrY + qrSize + 35);

    // Holographic Foil Security Strip (Rainbow gradient on bottom edge)
    const foilGrad = ctx.createLinearGradient(0, canvas.height - 120, canvas.width, canvas.height - 80);
    foilGrad.addColorStop(0, '#A8C9C8');
    foilGrad.addColorStop(0.2, '#FFFFFF');
    foilGrad.addColorStop(0.4, '#F45B0B');
    foilGrad.addColorStop(0.6, '#A8C9C8');
    foilGrad.addColorStop(0.8, '#FFD700');
    foilGrad.addColorStop(1, '#A8C9C8');
    ctx.fillStyle = foilGrad;
    ctx.fillRect(80, canvas.height - 140, canvas.width - 160, 40);

    ctx.fillStyle = '#111617';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('VERIDEGREE X CRYPTOGRAPHICALLY ANCHORED LEDGER • TAMPER PROOF', 120, canvas.height - 114);

    // Diagonal Revoked Stamp Overlay if revoked
    if (isRevokedState) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 8);

      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 12;
      ctx.fillStyle = 'rgba(255, 241, 242, 0.92)';
      ctx.beginPath();
      ctx.roundRect(-450, -100, 900, 200, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#BE123C';
      ctx.font = 'bold 72px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('REVOKED BY SENATE', 0, 10);

      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('DECREE #SR-2024-41: TRANSCRIPT FALSIFICATION', 0, 60);

      ctx.restore();
    }

    return canvas;
  };

  // Helper to draw the reverse/back side of the credential
  const drawBackCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Dark Obsidian background for high contrast reverse
    ctx.fillStyle = '#111617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border in Powder Blue
    ctx.strokeStyle = '#A8C9C8';
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Golden Microchip Contact Pad
    ctx.fillStyle = '#F45B0B';
    ctx.beginPath();
    ctx.roundRect(140, 160, 220, 180, 20);
    ctx.fill();

    // Chip lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.strokeRect(170, 190, 160, 120);
    ctx.beginPath();
    ctx.moveTo(170, 250);
    ctx.lineTo(330, 250);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px "Playfair Display", Georgia, serif';
    ctx.fillText('VERIDEGREE X DECENTRALIZED PROTOCOL', 400, 220);

    ctx.fillStyle = '#A8C9C8';
    ctx.font = '24px monospace';
    ctx.fillText('W3C VERIFIABLE CREDENTIALS SPECIFICATION v2.0', 400, 270);

    // Magnetic cryptographic ribbon
    ctx.fillStyle = '#1F2A2E';
    ctx.fillRect(40, 420, canvas.width - 80, 180);

    ctx.fillStyle = '#A8C9C8';
    ctx.font = '26px monospace';
    ctx.fillText('IMMUTABLE MERKLE ROOT RECORD', 80, 480);

    ctx.fillStyle = '#F45B0B';
    ctx.font = '32px monospace';
    ctx.fillText('ROOT: 0x3c71a9e88b410fb37ca29801f92e104cb99182a17724', 80, 540);

    // Institutional Legal Disclaimer
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('Institutional Attestation Terms', 80, 700);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px sans-serif';
    const lines = [
      '1. This digital credential is cryptographically anchored to a public trust ledger.',
      '2. Any unauthorized alteration or tampering mathematically breaks the SHA-256 seal.',
      '3. Instant real-time revocation telemetry is broadcasted to the global recruiter network.',
      '4. Conferred under the statutory authority of the Indian Institute of Technology Senate.',
      '5. Verifiable globally without contacting the university registrar office directly.',
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, 80, 770 + i * 55);
    });

    // Signatures
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 1200);
    ctx.lineTo(480, 1200);
    ctx.moveTo(canvas.width - 480, 1200);
    ctx.lineTo(canvas.width - 80, 1200);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 34px "Playfair Display", serif';
    ctx.fillText('Prof. V. Ramgopal Rao', 120, 1170);
    ctx.fillText('Dr. Deepika Bhaskar', canvas.width - 440, 1170);

    ctx.fillStyle = '#A8C9C8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('DIRECTOR & SENATE CHAIR', 120, 1240);
    ctx.fillText('REGISTRAR OF THE INSTITUTE', canvas.width - 440, 1240);

    // Bottom Watermark
    ctx.fillStyle = '#F45B0B';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('VERIFIED VIA VERIDEGREE X TRUST LEDGER • ALL RIGHTS RESERVED', 180, 1480);

    return canvas;
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = 580;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.9);
    scene.add(ambientLight);

    // Front Key Light (Powder Blue sheen)
    const keyLight = new THREE.DirectionalLight(0xA8C9C8, 1.2);
    keyLight.position.set(6, 8, 10);
    scene.add(keyLight);

    // Orange Rim Light from back
    const rimLight = new THREE.DirectionalLight(0xF45B0B, 1.5);
    rimLight.position.set(-6, -6, 8);
    scene.add(rimLight);

    // Dynamic mouse-following point light for metallic foil reflection
    const pointLight = new THREE.PointLight(0xFFFFFF, 1.8, 25);
    pointLight.position.set(0, 0, 6);
    lightRef.current = pointLight;
    scene.add(pointLight);

    // 3. Create Textures from Canvases
    const frontCanvas = drawFrontCanvas(mode === 'revoked');
    const frontTexture = new THREE.CanvasTexture(frontCanvas);
    frontTexture.anisotropy = 8;
    frontTextureRef.current = frontTexture;

    const backCanvas = drawBackCanvas();
    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.anisotropy = 8;
    backTextureRef.current = backTexture;

    // 4. Construct 3D Physical Card Mesh
    // Card Dimensions: width = 7.2, height = 9.6, depth = 0.14
    const cardGeo = new THREE.BoxGeometry(7.2, 9.6, 0.14);

    // Edge metallic material in Powder Blue / Racing Orange
    const edgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xF45B0B,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const frontMat = new THREE.MeshPhysicalMaterial({
      map: frontTexture,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      reflectivity: 0.6,
    });

    const backMat = new THREE.MeshPhysicalMaterial({
      map: backTexture,
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 0.5,
    });

    // Box materials array: [right, left, top, bottom, front, back]
    const materials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];
    const cardMesh = new THREE.Mesh(cardGeo, materials);
    cardMesh.rotation.set(0.1, 0.2, 0);
    cardMeshRef.current = cardMesh;
    scene.add(cardMesh);

    // 5. 3D Laser Scanner Beam Mesh
    const laserGeo = new THREE.CylinderGeometry(0.04, 0.04, 8.2, 16);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xF45B0B,
      transparent: true,
      opacity: 0,
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.rotation.z = Math.PI / 2;
    laserMesh.position.z = 0.12;
    laserRef.current = laserMesh;
    cardMesh.add(laserMesh);

    // 6. Floating 3D Sparkle Particles around the Card
    const particleCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    const cOrange = new THREE.Color(0xF45B0B);
    const cPowder = new THREE.Color(0xA8C9C8);
    const cWhite = new THREE.Color(0xFFFFFF);

    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const rand = Math.random();
      const col = rand > 0.5 ? cPowder : rand > 0.2 ? cOrange : cWhite;
      pColors[i * 3] = col.r;
      pColors[i * 3 + 1] = col.g;
      pColors[i * 3 + 2] = col.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 7. Mouse Drag & Orbit Interaction Listeners
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      // Dynamic point light tracking
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / height) * 2 - 1);
      if (lightRef.current) {
        lightRef.current.position.x = normX * 8;
        lightRef.current.position.y = normY * 8;
      }

      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      rotationTargetRef.current.y += deltaX * 0.008;
      rotationTargetRef.current.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch support for mobile / trackpad
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      rotationTargetRef.current.y += deltaX * 0.008;
      rotationTargetRef.current.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Responsive resize handler
    const onResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', onResize);

    // 8. Animation Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // If auto-spin is active and user is not dragging
      if (isAutoSpinRef.current && !isDraggingRef.current) {
        rotationTargetRef.current.y += 0.008;
        // Gentle organic bobbing tilt
        rotationTargetRef.current.x = Math.sin(elapsed * 1.2) * 0.12;
      }

      // Smooth interpolation (lerp) toward target rotation
      currentRotationRef.current.x += (rotationTargetRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (rotationTargetRef.current.y - currentRotationRef.current.y) * 0.1;

      if (cardMesh) {
        cardMesh.rotation.x = currentRotationRef.current.x;
        cardMesh.rotation.y = currentRotationRef.current.y;
        // Floating hovering bob
        cardMesh.position.y = Math.sin(elapsed * 1.8) * 0.25;
      }

      // Orbit particles gently
      particles.rotation.y += 0.002;

      // Laser Scanner Animation
      if (laserMesh && laserRef.current) {
        if (isVerifyingRef.current) {
          (laserMesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
          // Sweep from y = 4.6 to -4.6
          const scanCycle = (elapsed * 2.5) % 2;
          laserMesh.position.y = 4.6 - scanCycle * 4.6;
        } else {
          (laserMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      domEl.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      cardGeo.dispose();
      edgeMat.dispose();
      frontMat.dispose();
      backMat.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Update front texture whenever mode changes
  useEffect(() => {
    if (!frontTextureRef.current) return;
    const newCanvas = drawFrontCanvas(mode === 'revoked');
    frontTextureRef.current.image = newCanvas;
    frontTextureRef.current.needsUpdate = true;
  }, [mode]);

  // Flip Card Action
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    setIsAutoSpin(false);
    rotationTargetRef.current.y += Math.PI;
  };

  // Reset 3D View
  const handleResetView = () => {
    rotationTargetRef.current = { x: 0.1, y: 0.2 };
    setIsAutoSpin(true);
    setIsFlipped(false);
  };

  // Live 3D verification scan trigger
  const handleTriggerScan = () => {
    setIsVerifying(true);
    setIsAutoSpin(false);

    // Center card facing forward for scan
    rotationTargetRef.current = { x: 0, y: isFlipped ? Math.PI : 0 };

    setTimeout(() => {
      setIsVerifying(false);
      setIsAutoSpin(true);
      if (mode === 'valid') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F45B0B', '#A8C9C8', '#FFFFFF', '#174B3A'],
        });
        success('Verification Confirmed', 'Degree signatures mathematically verified on-chain in 0.2s');
      } else {
        success('Revocation Confirmed', 'Senate Decree #SR-2024-41 is active. Degree is invalid.');
      }
    }, 1800);
  };

  const isValid = mode === 'valid';

  return (
    <div className="relative mx-auto max-w-lg w-full select-none">
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between gap-2 p-1.5 bg-white/95 backdrop-blur-md border border-powder/60 rounded-2xl shadow-subtle mb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-powder-dark pl-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-orange animate-spin" style={{ animationDuration: '6s' }} />
          <span>Real 3D WebGL Card</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setMode('valid');
              handleTriggerScan();
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              isValid
                ? 'bg-orange text-white shadow-xs font-bold'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-powder-light'
            }`}
          >
            ✓ Authentic
          </button>
          <button
            onClick={() => {
              setMode('revoked');
              handleTriggerScan();
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              !isValid
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-charcoal-muted hover:text-charcoal hover:bg-rose-50'
            }`}
          >
            ⚠ Revoked
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[540px] sm:h-[580px] rounded-3xl bg-gradient-to-b from-white/90 via-powder-light/30 to-white/90 border border-powder/60 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        {/* Subtle Watermark Micro-Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#A8C9C8_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-[0.25] pointer-events-none" />

        {/* Floating 3D Interaction Control HUD */}
        <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2 pointer-events-auto z-20 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-powder/60 shadow-lg">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAutoSpin(!isAutoSpin)}
              className="p-2 rounded-xl text-charcoal hover:bg-powder-light transition-all flex items-center gap-1 text-xs font-semibold"
              title={isAutoSpin ? 'Pause Rotation' : 'Auto Rotate'}
            >
              {isAutoSpin ? <Pause className="w-3.5 h-3.5 text-orange" /> : <Play className="w-3.5 h-3.5 text-orange" />}
              <span className="hidden sm:inline">{isAutoSpin ? 'Pause' : 'Rotate'}</span>
            </button>

            <button
              onClick={handleFlipCard}
              className="p-2 rounded-xl text-charcoal hover:bg-powder-light transition-all flex items-center gap-1 text-xs font-semibold"
              title="Flip Card 180° to inspect cryptographic reverse"
            >
              <RotateCcw className="w-3.5 h-3.5 text-powder-dark" />
              <span>Flip Card</span>
            </button>

            <button
              onClick={handleResetView}
              className="p-2 rounded-xl text-charcoal hover:bg-powder-light transition-all text-xs font-semibold"
              title="Reset View"
            >
              <Compass className="w-3.5 h-3.5 text-charcoal-muted" />
            </button>
          </div>

          {/* Action: Trigger Live 3D Laser Verification */}
          <button
            onClick={handleTriggerScan}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-orange hover:bg-orange-hover shadow-subtle hover:shadow-orange-glow transition-all disabled:opacity-75"
          >
            <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-bounce' : ''}`} />
            <span>{isVerifying ? 'Scanning 3D Mesh...' : 'Live Verify'}</span>
          </button>
        </div>

        {/* Drag Hint Tag */}
        <div className="absolute top-4 left-4 pointer-events-none z-10 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-powder/50 text-[10px] font-mono text-powder-dark font-bold flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3 h-3 text-orange" />
          <span>Click & Drag to Rotate in 360° 3D</span>
        </div>
      </div>
    </div>
  );
};

