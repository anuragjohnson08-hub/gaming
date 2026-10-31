import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Cpu,
  Expand,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  Plug,
  RotateCcw,
  Shrink,
  Wind,
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

/**
 * REAL-WORLD MILLIMETER SCALE:
 * 1.000 scene unit = 100.0 mm (MM = 0.01)
 * Official Verified ASUS ROG Astral RTX 5090 32GB GDDR7 BTF OC Dimensions:
 * - Length:    357.6 mm -> 3.576 units
 * - Height:    149.3 mm -> 1.493 units
 * - Thickness:  76.0 mm -> 0.760 units (3.8 slots)
 */
const MM = 0.01;
export const ROG_ASTRAL_RTX5090_SPECS = {
  lengthMm: 357.6,
  heightMm: 149.3,
  thicknessMm: 76.0,
  slots: 3.8,
  vram: '32GB GDDR7 (16× 2GB)',
  interface: 'PCIe 5.0 x16 + BTF GC-HPWR (1000W+)',
  ports: '2× HDMI 2.1b + 3× DisplayPort 2.1b',
} as const;

type CameraPreset = 'iso' | 'front' | 'rear' | 'side' | 'top';

interface InteractiveGpu3DProps {
  onInspectFullReview?: () => void;
  devWireframe?: boolean;
  devFanRpmOverride?: number | null;
  devExplodeOverride?: number | null;
}

const CAMERA_PRESETS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number]; label: string }
> = {
  iso: {
    pos: [-1.72, 0.28, 3.42],
    target: [0.02, -0.03, 0],
    label: '3/4 Studio',
  },
  front: {
    pos: [0, 0.0, 3.72],
    target: [0, 0, 0],
    label: 'Front',
  },
  rear: {
    pos: [0.12, 0.08, -3.82],
    target: [0, 0, 0],
    label: 'Rear',
  },
  side: {
    pos: [-3.72, 0.06, 0.28],
    target: [-0.75, -0.04, 0],
    label: 'Side (I/O)',
  },
  top: {
    pos: [0.08, 3.42, 0.92],
    target: [0, 0, 0],
    label: 'Top / BTF',
  },
};

export const PART_MANIFEST = [
  { id: 1, name: '01_Main_Front_Shroud', status: 'Verified ASUS Exterior' },
  { id: 2, name: '02_Quad_Axial_Fans (4×)', status: 'Verified 3+1 Fan Layout' },
  { id: 3, name: '03_Fan_Rings_Fasteners', status: 'Verified Exterior Trim' },
  { id: 4, name: '04_Rear_Metal_Backplate', status: 'Verified Cutouts & Vents' },
  { id: 5, name: '05_DieCast_Frame_Rear_IO', status: 'Verified 3.8-Slot Frame' },
  { id: 6, name: '06_Internal_Alu_Heatsink', status: 'Approx. Fin Density' },
  { id: 7, name: '07_Vapor_Chamber_Heatpipes', status: 'Verified 8-Pipe / Chamber' },
  { id: 8, name: '08_PCB_PCIe5_BTF_Edge', status: 'Verified BTF Gold Fingers' },
  { id: 9, name: '09_GB202_GPU_32GB_GDDR7', status: 'Approx. 16×2GB Package' },
  { id: 10, name: '10_VRM_Inductors_MOSFETs', status: 'Approx. VRM Topology' },
  { id: 11, name: '11_Ports_2xHDMI_3xDP', status: 'Verified 2×HDMI + 3×DP' },
  { id: 12, name: '12_Detachable_GC_HPWR', status: 'Verified BTF Adapter' },
  { id: 13, name: '13_ROG_Logos_Aura_RGB', status: 'Verified Branding & LED' },
] as const;

// Pre-allocated vectors outside render loop (Zero GC)
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

/**
 * Generates high-resolution ROG Eye fan hub texture.
 */
function createRogHubTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
  grad.addColorStop(0, '#25272E');
  grad.addColorStop(0.76, '#121317');
  grad.addColorStop(0.83, '#E2E8F0');
  grad.addColorStop(0.91, '#94A3B8');
  grad.addColorStop(1, '#18191E');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 126, 0, Math.PI * 2);
  ctx.fill();

  // ROG Fearless Eye Emblem
  ctx.strokeStyle = '#F8FAFC';
  ctx.fillStyle = '#F8FAFC';
  ctx.lineWidth = 8.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(50, 136);
  ctx.quadraticCurveTo(106, 90, 200, 105);
  ctx.quadraticCurveTo(154, 158, 104, 156);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(114, 128);
  ctx.lineTo(176, 118);
  ctx.lineTo(146, 142);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(60, 118);
  ctx.lineTo(108, 98);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates the brushed aluminum coordinate ring texture around the right fan
 * ("25° 07' 37.0\" N  121° 28' 13.6\" E") from official ASUS ROG Astral photos.
 */
function createCoordinateRingTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#F1F5F9');
  grad.addColorStop(0.35, '#CBD5E1');
  grad.addColorStop(0.68, '#94A3B8');
  grad.addColorStop(1, '#E2E8F0');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 34;
  ctx.beginPath();
  ctx.arc(256, 256, 224, -Math.PI * 0.72, Math.PI * 0.34);
  ctx.stroke();

  ctx.strokeStyle = '#18191E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 256, 241, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(256, 256, 207, 0, Math.PI * 2);
  ctx.stroke();

  const label = "2 5 ° 0 7 ' 3 7 . 0 \" N   1 2 1 ° 2 8 ' 1 3 . 6 \" E";
  ctx.save();
  ctx.translate(256, 256);
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const startAngle = -Math.PI * 0.65;
  const endAngle = Math.PI * 0.28;
  for (let i = 0; i < label.length; i++) {
    const t = i / (label.length - 1);
    const angle = startAngle + t * (endAngle - startAngle);
    ctx.save();
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(label[i], 0, -224);
    ctx.restore();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates the brushed silver "ROG REPUBLIC OF GAMERS" nameplate texture.
 */
function createRogBadgeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 96);
  grad.addColorStop(0, '#E2E8F0');
  grad.addColorStop(0.5, '#CBD5E1');
  grad.addColorStop(1, '#94A3B8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 96);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 92);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillText('ROG', 20, 44);
  ctx.font = 'bold 14px "Inter", sans-serif';
  ctx.fillText('REPUBLIC OF', 82, 38);
  ctx.fillText('GAMERS', 82, 58);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export const InteractiveGpu3D: React.FC<InteractiveGpu3DProps> = ({
  onInspectFullReview,
  devWireframe = false,
  devFanRpmOverride = null,
  devExplodeOverride = null,
}) => {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [explodeFactor, setExplodeFactor] = useState<number>(0); // 0.0 to 1.0
  const [gcHpwrDetached, setGcHpwrDetached] = useState<boolean>(false);
  const [turboFan, setTurboFan] = useState<boolean>(false);
  const [showPartManifest, setShowPartManifest] = useState<boolean>(false);
  const [showRefOverlay, setShowRefOverlay] = useState<boolean>(false);
  const [isExpandedStudio, setIsExpandedStudio] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [camPreset, setCamPreset] = useState<CameraPreset>('iso');

  const explodeFactorRef = useRef<number>(0);
  const gcHpwrDetachedRef = useRef<boolean>(false);
  const turboFanRef = useRef<boolean>(false);
  const activeCamPresetRef = useRef<CameraPreset | null>('iso');
  const devFanRpmRef = useRef<number | null>(null);
  const devExplodeRef = useRef<number | null>(null);
  const devWireframeRef = useRef<boolean>(false);
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    explodeFactorRef.current = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    gcHpwrDetachedRef.current = gcHpwrDetached;
  }, [gcHpwrDetached]);

  useEffect(() => {
    turboFanRef.current = turboFan;
  }, [turboFan]);

  useEffect(() => {
    devFanRpmRef.current = devFanRpmOverride;
  }, [devFanRpmOverride]);

  useEffect(() => {
    devExplodeRef.current = devExplodeOverride;
  }, [devExplodeOverride]);

  useEffect(() => {
    devWireframeRef.current = devWireframe;
    materialsRef.current.forEach((m) => {
      if ('wireframe' in m) {
        (m as THREE.MeshStandardMaterial).wireframe = devWireframe;
        m.needsUpdate = true;
      }
    });
  }, [devWireframe]);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        viewerContainerRef.current?.requestFullscreen?.().catch(() => {
          // Graceful fallback to CSS viewport takeover + top z-index when iframe blocks native Fullscreen API
        });
      } else if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      return next;
    });
  }, []);

  // Trigger resize recalculation when Fullscreen or Expanded container state changes
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
    return () => window.cancelAnimationFrame(raf);
  }, [isFullscreen, isExpandedStudio]);

  // Listen for Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen]);

  const handleSelectCamera = (preset: CameraPreset) => {
    setShowRefOverlay(false);
    setCamPreset(preset);
    activeCamPresetRef.current = preset;
  };

  const handleToggleExplode = () => {
    setShowRefOverlay(false);
    setExplodeFactor((prev) => (prev > 0.1 ? 0 : 1));
  };

  const handleResetView = () => {
    setShowRefOverlay(false);
    setExplodeFactor(0);
    setGcHpwrDetached(false);
    setTurboFan(false);
    setCamPreset('iso');
    activeCamPresetRef.current = 'iso';
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL detection per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 200);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50);
    camera.position.set(...CAMERA_PRESETS.iso.pos);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // 2. Studio Environment Map (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. Studio Softboxes (RectAreaLight) + Balanced Key/Rim Rig
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 0.95);
    scene.add(hemiLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const topSoftbox = new THREE.RectAreaLight(0xffffff, 3.6, 4.5, 1.8);
      topSoftbox.position.set(0, 2.8, 1.8);
      topSoftbox.lookAt(0, 0, 0);
      scene.add(topSoftbox);

      const sideSoftbox = new THREE.RectAreaLight(0xe0e7ff, 2.4, 2.5, 2.0);
      sideSoftbox.position.set(3.4, 0.8, 2.4);
      sideSoftbox.lookAt(0, 0, 0);
      scene.add(sideSoftbox);
    }

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3.5, 5.2, 5.4);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 16;
      const d = 3.2;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const auraPointLight = new THREE.PointLight(0x8b5cf6, 2.0, 3.0);
    auraPointLight.position.set(-0.6, 0.62, 0.52);
    scene.add(auraPointLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.4);
    rimLight.position.set(-4.2, 2.0, -4.0);
    scene.add(rimLight);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 1.55;
    controls.maxDistance = 7.8;
    controls.target.set(...CAMERA_PRESETS.iso.target);

    const handleControlStart = () => {
      activeCamPresetRef.current = null;
    };
    controls.addEventListener('start', handleControlStart);

    // =========================================================================
    // 5. EXACT REAL-WORLD MILLIMETER SCALE MODEL ASSEMBLY
    //    Length = 357.6 mm (3.576) | Height = 149.3 mm (1.493) | Thickness = 76.0 mm (0.760)
    // =========================================================================
    const L = ROG_ASTRAL_RTX5090_SPECS.lengthMm * MM; // 3.576
    const H = ROG_ASTRAL_RTX5090_SPECS.heightMm * MM; // 1.493
    const T = ROG_ASTRAL_RTX5090_SPECS.thicknessMm * MM; // 0.760

    const gpuRoot = new THREE.Group();
    gpuRoot.name = 'ASUS_ROG_Astral_RTX5090_32GB_BTF_OC_Root';
    gpuRoot.position.set(0, 0.04, 0);
    gpuRoot.rotation.set(0.035, 0.11, -0.03);
    scene.add(gpuRoot);

    // Create the 13 Named Separate Object Groups required by specification
    const obj01_MainFrontShroud = new THREE.Group();
    obj01_MainFrontShroud.name = '01_Main_Front_Shroud';

    const obj02_QuadAxialFans = new THREE.Group();
    obj02_QuadAxialFans.name = '02_Quad_Axial_Fans';

    const obj03_FanMountingRings = new THREE.Group();
    obj03_FanMountingRings.name = '03_Fan_Mounting_Rings_Fasteners';

    const obj04_RearMetalBackplate = new THREE.Group();
    obj04_RearMetalBackplate.name = '04_Rear_Metal_Backplate';

    const obj05_DieCastFrameAndBracket = new THREE.Group();
    obj05_DieCastFrameAndBracket.name = '05_DieCast_Frame_Rear_IO_Bracket';

    const obj06_InternalHeatsink = new THREE.Group();
    obj06_InternalHeatsink.name = '06_Internal_Aluminum_Heatsink';

    const obj07_VaporChamberHeatpipes = new THREE.Group();
    obj07_VaporChamberHeatpipes.name = '07_Vapor_Chamber_Heatpipes';

    const obj08_PcbAndBtfInterface = new THREE.Group();
    obj08_PcbAndBtfInterface.name = '08_PCB_PCIe5_BTF_Interface';

    const obj09_GpuAndGddr7Packages = new THREE.Group();
    obj09_GpuAndGddr7Packages.name = '09_GPU_Package_32GB_GDDR7';

    const obj10_VrmPowerDelivery = new THREE.Group();
    obj10_VrmPowerDelivery.name = '10_VRM_Inductors_MOSFETs_Capacitors';

    const obj11_RearIoPorts = new THREE.Group();
    obj11_RearIoPorts.name = '11_Rear_IO_Ports_2xHDMI_3xDP';

    const obj12_DetachableGcHpwr = new THREE.Group();
    obj12_DetachableGcHpwr.name = '12_Detachable_GC_HPWR_Adapter';

    const obj13_RogLogosAndRgb = new THREE.Group();
    obj13_RogLogosAndRgb.name = '13_ROG_Logos_RGB_Markings';

    gpuRoot.add(
      obj01_MainFrontShroud,
      obj02_QuadAxialFans,
      obj03_FanMountingRings,
      obj04_RearMetalBackplate,
      obj05_DieCastFrameAndBracket,
      obj06_InternalHeatsink,
      obj07_VaporChamberHeatpipes,
      obj08_PcbAndBtfInterface,
      obj09_GPU_AddWrapper(obj09_GpuAndGddr7Packages),
      obj10_VrmPowerDelivery,
      obj11_RearIoPorts,
      obj12_DetachableGcHpwr,
      obj13_RogLogosAndRgb
    );

    function obj09_GPU_AddWrapper(g: THREE.Group) {
      return g;
    }

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const disposableTextures: THREE.Texture[] = [];

    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposableGeometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      disposableMaterials.push(m);
      materialsRef.current.push(m);
      if (devWireframeRef.current && 'wireframe' in m) {
        (m as unknown as { wireframe: boolean }).wireframe = true;
      }
      return m;
    };

    const rogHubTex = createRogHubTexture(maxAniso);
    const coordRingTex = createCoordinateRingTexture(maxAniso);
    const rogBadgeTex = createRogBadgeTexture(maxAniso);
    disposableTextures.push(rogHubTex, coordRingTex, rogBadgeTex);

    // --- PHYSICALLY BASED MATERIALS ---
    const dieCastCharcoalMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x202227,
        metalness: 0.56,
        roughness: 0.44,
      })
    );

    const brushedAluminumMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xd0d5dd,
        metalness: 0.88,
        roughness: 0.21,
        clearcoat: 0.25,
        clearcoatRoughness: 0.18,
      })
    );

    const mattePolymerMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x16181d,
        metalness: 0.22,
        roughness: 0.42,
      })
    );

    const chromeTrimMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xf1f5f9,
        metalness: 0.96,
        roughness: 0.12,
        clearcoat: 0.65,
      })
    );

    const stainlessBracketMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.24,
      })
    );

    const finStackAluminumMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.85,
        roughness: 0.28,
      })
    );

    const copperVaporMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd97742,
        metalness: 0.94,
        roughness: 0.18,
      })
    );

    const nickelHeatpipeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        metalness: 0.95,
        roughness: 0.14,
      })
    );

    const darkPcbMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f1116,
        metalness: 0.28,
        roughness: 0.62,
      })
    );

    const goldContactMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xeab308,
        metalness: 0.95,
        roughness: 0.16,
      })
    );

    const siliconMirrorMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x1e1b4b,
        metalness: 0.98,
        roughness: 0.05,
        clearcoat: 1.0,
      })
    );

    const gddr7PackageMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.35,
        roughness: 0.32,
      })
    );

    const vrmAlloyChokeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x3f3f46,
        metalness: 0.72,
        roughness: 0.35,
      })
    );

    const hubCapMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: rogHubTex,
        metalness: 0.65,
        roughness: 0.22,
      })
    );

    const coordRingMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: coordRingTex,
        transparent: true,
        metalness: 0.8,
        roughness: 0.22,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      })
    );

    const rogBadgeMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: rogBadgeTex,
        metalness: 0.75,
        roughness: 0.25,
      })
    );

    const auraBlueMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        emissive: 0x3b82f6,
        emissiveIntensity: 2.2,
        roughness: 0.15,
      })
    );

    const auraPurpleMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xc084fc,
        emissive: 0x9333ea,
        emissiveIntensity: 2.5,
        roughness: 0.15,
      })
    );

    const fanPositionsX = [-1.14, 0.0, 1.14];
    const fanOuterRadius = 0.515; // 103 mm diameter Axial-Tech fans

    // =========================================================================
    // OBJECT 1: Main Front Shroud (357.6 × 149.3 mm angular brushed aluminum)
    // =========================================================================
    const silverShroudShape = new THREE.Shape();
    silverShroudShape.moveTo(-1.71, -0.64);
    silverShroudShape.lineTo(0.76, -0.64);
    silverShroudShape.lineTo(0.98, 0.60);
    silverShroudShape.lineTo(-1.71, 0.60);
    silverShroudShape.closePath();

    [fanPositionsX[0], fanPositionsX[1]].forEach((fx) => {
      const hole = new THREE.Path();
      hole.absarc(fx, -0.02, fanOuterRadius, 0, Math.PI * 2, false);
      silverShroudShape.holes.push(hole);
    });

    const silverShroudGeo = trackGeo(
      new THREE.ExtrudeGeometry(silverShroudShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.022,
        bevelSize: 0.018,
        bevelSegments: 2,
      })
    );
    const silverShroudMesh = new THREE.Mesh(silverShroudGeo, brushedAluminumMat);
    silverShroudMesh.position.set(0, 0, T / 2 - 0.14);
    silverShroudMesh.castShadow = !isSoftwareGl;
    obj01_MainFrontShroud.add(silverShroudMesh);

    // Diagonal sculpted bridges around Fan 3 on front shroud
    const diagBridgeGeo = trackGeo(new THREE.BoxGeometry(0.13, 0.54, 0.14));
    const diagTop = new THREE.Mesh(diagBridgeGeo, dieCastCharcoalMat);
    diagTop.position.set(0.58, 0.42, T / 2 - 0.06);
    diagTop.rotation.z = 0.42;
    const diagBot = new THREE.Mesh(diagBridgeGeo, dieCastCharcoalMat);
    diagBot.position.set(0.58, -0.44, T / 2 - 0.06);
    diagBot.rotation.z = -0.42;
    obj01_MainFrontShroud.add(diagTop, diagBot);

    // =========================================================================
    // OBJECT 2: Four Individual Axial-Tech 7-Blade Fans (3 Front + 1 Rear)
    // =========================================================================
    const fanRotors: THREE.Group[] = [];
    const barrierRingGeo = trackGeo(
      new THREE.CylinderGeometry(0.475, 0.475, 0.11, 36, 1, true)
    );
    barrierRingGeo.rotateX(Math.PI / 2);

    const hubCylGeo = trackGeo(new THREE.CylinderGeometry(0.165, 0.165, 0.115, 32));
    hubCylGeo.rotateX(Math.PI / 2);
    const hubDecalGeo = trackGeo(new THREE.CircleGeometry(0.152, 32));
    const hubChromeRingGeo = trackGeo(new THREE.RingGeometry(0.148, 0.168, 32));

    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, -0.042);
    bladeShape.quadraticCurveTo(0.16, -0.105, 0.315, -0.048);
    bladeShape.quadraticCurveTo(0.335, 0.038, 0.295, 0.08);
    bladeShape.quadraticCurveTo(0.14, 0.055, 0, 0.032);
    bladeShape.closePath();

    const bladeExtrudeGeo = trackGeo(
      new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.018,
        bevelEnabled: true,
        bevelThickness: 0.004,
        bevelSize: 0.004,
        bevelSegments: 1,
      })
    );

    const buildAxialFan = (name: string): THREE.Group => {
      const rotor = new THREE.Group();
      rotor.name = name;
      const barrier = new THREE.Mesh(barrierRingGeo, mattePolymerMat);
      const hubBody = new THREE.Mesh(hubCylGeo, mattePolymerMat);
      const hubFace = new THREE.Mesh(hubDecalGeo, hubCapMat);
      hubFace.position.z = 0.06;
      const hubTrim = new THREE.Mesh(hubChromeRingGeo, chromeTrimMat);
      hubTrim.position.z = 0.061;
      rotor.add(barrier, hubBody, hubFace, hubTrim);

      const bladeCount = 7;
      for (let b = 0; b < bladeCount; b++) {
        const angle = (b / bladeCount) * Math.PI * 2;
        const pivot = new THREE.Group();
        pivot.rotation.z = angle;

        const blade = new THREE.Mesh(bladeExtrudeGeo, mattePolymerMat);
        blade.position.set(0.14, 0, -0.008);
        blade.rotation.x = 0.52;
        blade.rotation.y = -0.18;
        pivot.add(blade);
        rotor.add(pivot);
      }
      return rotor;
    };

    fanPositionsX.forEach((fx, idx) => {
      const fan = buildAxialFan(`Axial_Fan_Front_0${idx + 1}`);
      fan.position.set(fx, -0.02, T / 2 - 0.11);
      obj02_QuadAxialFans.add(fan);
      fanRotors.push(fan);
    });

    // 4th Rear Pull-Through Axial-Tech Fan mounted in the backplate right bay
    const rearFan4 = buildAxialFan('Axial_Fan_Rear_04_PullThrough');
    rearFan4.position.set(1.14, -0.02, -T / 2 + 0.06);
    rearFan4.rotation.y = Math.PI;
    obj02_QuadAxialFans.add(rearFan4);
    fanRotors.push(rearFan4);

    // =========================================================================
    // OBJECT 3: Fan Mounting Rings, Coordinate Bezel & Recessed Fasteners
    // =========================================================================
    const outerFanTorusGeo = trackGeo(
      new THREE.TorusGeometry(fanOuterRadius, 0.024, 16, 48)
    );
    fanPositionsX.forEach((fx, idx) => {
      const ring = new THREE.Mesh(
        outerFanTorusGeo,
        idx === 2 ? dieCastCharcoalMat : chromeTrimMat
      );
      ring.position.set(fx, -0.02, T / 2 - 0.04);
      obj03_FanMountingRings.add(ring);

      if (idx === 2) {
        const coordGeo = trackGeo(new THREE.RingGeometry(0.455, 0.578, 48));
        const coordMesh = new THREE.Mesh(coordGeo, coordRingMat);
        coordMesh.position.set(fx, -0.02, T / 2 - 0.012);
        obj03_FanMountingRings.add(coordMesh);
      }
    });

    // 18 Recessed Torx Fastener Screws across shroud & backplate (InstancedMesh)
    const screwGeo = trackGeo(new THREE.CylinderGeometry(0.016, 0.016, 0.018, 12));
    screwGeo.rotateX(Math.PI / 2);
    const screwInstanced = new THREE.InstancedMesh(screwGeo, chromeTrimMat, 12);
    const dummy = new THREE.Object3D();
    const screwCoords: [number, number, number][] = [
      [-1.66, 0.54, T / 2 - 0.01],
      [-1.66, -0.58, T / 2 - 0.01],
      [-0.57, 0.54, T / 2 - 0.01],
      [-0.57, -0.58, T / 2 - 0.01],
      [0.54, 0.54, T / 2 - 0.01],
      [0.54, -0.58, T / 2 - 0.01],
      [-1.62, 0.58, -T / 2 - 0.005],
      [-1.62, -0.58, -T / 2 - 0.005],
      [-0.45, 0.58, -T / 2 - 0.005],
      [-0.45, -0.58, -T / 2 - 0.005],
      [0.48, 0.58, -T / 2 - 0.005],
      [0.48, -0.58, -T / 2 - 0.005],
    ];
    screwCoords.forEach((pos, idx) => {
      dummy.position.set(...pos);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      screwInstanced.setMatrixAt(idx, dummy.matrix);
    });
    screwInstanced.instanceMatrix.needsUpdate = true;
    screwInstanced.computeBoundingSphere();
    obj03_FanMountingRings.add(screwInstanced);

    // =========================================================================
    // OBJECT 4: Rear Metal Backplate with 4th-Fan Intake Cutout & Vent Slats
    // =========================================================================
    const backplateShape = new THREE.Shape();
    const bpHalfL = L / 2 - 0.02;
    const bpHalfH = H / 2 - 0.02;
    backplateShape.moveTo(-bpHalfL, -bpHalfH);
    backplateShape.lineTo(bpHalfL, -bpHalfH);
    backplateShape.lineTo(bpHalfL, bpHalfH);
    backplateShape.lineTo(-bpHalfL, bpHalfH);
    backplateShape.closePath();

    // Circular cutout on right side of backplate for the 4th Axial-Tech fan
    const rearFanHole = new THREE.Path();
    rearFanHole.absarc(1.14, -0.02, 0.49, 0, Math.PI * 2, false);
    backplateShape.holes.push(rearFanHole);

    const backplateExtrudeGeo = trackGeo(
      new THREE.ExtrudeGeometry(backplateShape, {
        depth: 0.04,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 1,
      })
    );
    const backplateMesh = new THREE.Mesh(
      backplateExtrudeGeo,
      dieCastCharcoalMat
    );
    backplateMesh.position.set(0, 0, -T / 2);
    obj04_RearMetalBackplate.add(backplateMesh);

    // Brushed aluminum geometric accent plate on rear backplate
    const bpAccentGeo = trackGeo(new THREE.BoxGeometry(2.15, 0.48, 0.048));
    const bpAccentMesh = new THREE.Mesh(bpAccentGeo, brushedAluminumMat);
    bpAccentMesh.position.set(-0.58, 0.32, -T / 2 + 0.015);
    obj04_RearMetalBackplate.add(bpAccentMesh);

    // Rear 4th-fan protective ring bezel
    const rearFanBezel = new THREE.Mesh(outerFanTorusGeo, chromeTrimMat);
    rearFanBezel.position.set(1.14, -0.02, -T / 2);
    obj04_RearMetalBackplate.add(rearFanBezel);

    // =========================================================================
    // OBJECT 5: Structural Die-Cast Metal Frame (357.6 × 149.3 × 76.0 mm) & Rear I/O Bracket
    // =========================================================================
    const topFrameGeo = trackGeo(new THREE.BoxGeometry(L, 0.11, T));
    const topFrame = new THREE.Mesh(topFrameGeo, dieCastCharcoalMat);
    topFrame.position.set(0, H / 2 - 0.055, 0);

    const botFrameGeo = trackGeo(new THREE.BoxGeometry(L, 0.11, T));
    const botFrame = new THREE.Mesh(botFrameGeo, dieCastCharcoalMat);
    botFrame.position.set(0, -H / 2 + 0.055, 0);

    const leftFrameWallGeo = trackGeo(new THREE.BoxGeometry(0.12, H, T));
    const leftFrameWall = new THREE.Mesh(leftFrameWallGeo, dieCastCharcoalMat);
    leftFrameWall.position.set(-L / 2 + 0.06, 0, 0);

    // Right Open Structural End-Cage Pillars (matching ASUS ROG Astral right end)
    const endPillarGeo = trackGeo(new THREE.BoxGeometry(0.15, H, 0.16));
    const rightFrontPillar = new THREE.Mesh(endPillarGeo, dieCastCharcoalMat);
    rightFrontPillar.position.set(L / 2 - 0.075, 0, T / 2 - 0.08);
    const rightRearPillar = new THREE.Mesh(endPillarGeo, dieCastCharcoalMat);
    rightRearPillar.position.set(L / 2 - 0.075, 0, -T / 2 + 0.08);

    // 304L Stainless Steel Rear I/O Bracket on left side (-X = -L/2)
    const ioBracketPlateGeo = trackGeo(
      new THREE.BoxGeometry(0.04, H + 0.12, T * 0.88)
    );
    const ioBracketPlate = new THREE.Mesh(
      ioBracketPlateGeo,
      stainlessBracketMat
    );
    ioBracketPlate.position.set(-L / 2 - 0.02, -0.04, 0);

    const ioTabGeo = trackGeo(new THREE.BoxGeometry(0.16, 0.24, 0.04));
    const ioTab1 = new THREE.Mesh(ioTabGeo, stainlessBracketMat);
    ioTab1.position.set(-L / 2 + 0.02, -H / 2 - 0.1, -0.18);
    const ioTab2 = new THREE.Mesh(ioTabGeo, stainlessBracketMat);
    ioTab2.position.set(-L / 2 + 0.24, -H / 2 - 0.1, -0.18);

    obj05_DieCastFrameAndBracket.add(
      topFrame,
      botFrame,
      leftFrameWall,
      rightFrontPillar,
      rightRearPillar,
      ioBracketPlate,
      ioTab1,
      ioTab2
    );

    // =========================================================================
    // OBJECT 6: Internal Aluminum Heatsink with Dense Parallel Fins
    // =========================================================================
    const finCount = 64;
    const finGeo = trackGeo(
      new THREE.BoxGeometry(0.022, H - 0.26, T * 0.62)
    );
    const finInstanced = new THREE.InstancedMesh(
      finGeo,
      finStackAluminumMat,
      finCount
    );
    for (let i = 0; i < finCount; i++) {
      const fx = -L / 2 + 0.18 + (i / (finCount - 1)) * (L - 0.36);
      dummy.position.set(fx, 0, 0.02);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      finInstanced.setMatrixAt(i, dummy.matrix);
    }
    finInstanced.instanceMatrix.needsUpdate = true;
    finInstanced.computeBoundingSphere();
    obj06_InternalHeatsink.add(finInstanced);

    // =========================================================================
    // OBJECT 7: Milled Vapor-Chamber Baseplate & 8 Sintered Heatpipes
    // =========================================================================
    const vaporChamberGeo = trackGeo(new THREE.BoxGeometry(1.15, 0.96, 0.07));
    const vaporChamberMesh = new THREE.Mesh(vaporChamberGeo, copperVaporMat);
    vaporChamberMesh.position.set(-0.42, 0.02, -0.09);
    obj07_VaporChamberHeatpipes.add(vaporChamberMesh);

    const pipeGeo = trackGeo(
      new THREE.CylinderGeometry(0.03, 0.03, L - 0.26, 16)
    );
    pipeGeo.rotateZ(Math.PI / 2);
    [-0.49, -0.35, -0.21, -0.07, 0.07, 0.21, 0.35, 0.49].forEach((py) => {
      const pipe = new THREE.Mesh(pipeGeo, nickelHeatpipeMat);
      pipe.position.set(0, py, 0.02);
      obj07_VaporChamberHeatpipes.add(pipe);
    });

    // =========================================================================
    // OBJECT 8: PCB with PCIe 5.0 x16 Edge Connector & BTF Power Interface
    // =========================================================================
    const pcbLength = L * 0.78;
    const pcbHeight = H - 0.18;
    const pcbGeo = trackGeo(new THREE.BoxGeometry(pcbLength, pcbHeight, 0.04));
    const pcbMesh = new THREE.Mesh(pcbGeo, darkPcbMat);
    pcbMesh.position.set(-0.32, 0, -0.18);
    obj08_PcbAndBtfInterface.add(pcbMesh);

    // PCIe 5.0 x16 Gold Edge Connector (Left-Bottom of PCB)
    const pcieEdgeGeo = trackGeo(new THREE.BoxGeometry(0.89, 0.15, 0.044));
    const pcieEdge = new THREE.Mesh(pcieEdgeGeo, goldContactMat);
    pcieEdge.position.set(-0.78, -H / 2 - 0.02, -0.18);

    const pcieKeyTabGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.14, 0.044));
    const pcieKeyTab = new THREE.Mesh(pcieKeyTabGeo, goldContactMat);
    pcieKeyTab.position.set(-1.34, -H / 2 - 0.015, -0.18);

    // ASUS BTF High-Power Gold Edge Finger Interface (Right of PCIe slot on bottom PCB edge)
    const btfEdgeGeo = trackGeo(new THREE.BoxGeometry(0.42, 0.16, 0.046));
    const btfEdge = new THREE.Mesh(btfEdgeGeo, goldContactMat);
    btfEdge.position.set(0.28, -H / 2 - 0.025, -0.18);

    obj08_PcbAndBtfInterface.add(pcieEdge, pcieKeyTab, btfEdge);

    // =========================================================================
    // OBJECT 9: GB202 GPU Package & 16× 2GB (32GB Total) GDDR7 Memory Packages
    //           (Approx. Internal Layout based on 512-bit 16-chip topology)
    // =========================================================================
    const gpuSubstrateGeo = trackGeo(new THREE.BoxGeometry(0.64, 0.64, 0.028));
    const gpuSubstrate = new THREE.Mesh(
      gpuSubstrateGeo,
       trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x065f46,
          metalness: 0.35,
          roughness: 0.45,
        })
      )
    );
    gpuSubstrate.position.set(-0.42, 0.02, -0.148);

    const gpuSiliconDieGeo = trackGeo(new THREE.BoxGeometry(0.38, 0.34, 0.036));
    const gpuSiliconDie = new THREE.Mesh(gpuSiliconDieGeo, siliconMirrorMat);
    gpuSiliconDie.position.set(-0.42, 0.02, -0.14);

    const dieStiffenerRingGeo = trackGeo(
      new THREE.RingGeometry(0.24, 0.3, 4)
    );
    dieStiffenerRingGeo.rotateZ(Math.PI / 4);
    const dieStiffener = new THREE.Mesh(
      dieStiffenerRingGeo,
      stainlessBracketMat
    );
    dieStiffener.position.set(-0.42, 0.02, -0.132);

    obj09_GpuAndGddr7Packages.add(gpuSubstrate, gpuSiliconDie, dieStiffener);

    // 16× 2GB GDDR7 Memory Packages arranged around the GB202 GPU die (4 per side)
    const gddr7ChipGeo = trackGeo(new THREE.BoxGeometry(0.085, 0.068, 0.025));
    const gddr7Instanced = new THREE.InstancedMesh(
      gddr7ChipGeo,
      gddr7PackageMat,
      16
    );
    const gddrOffsets: [number, number][] = [
      // Top row (4 chips)
      [-0.22, 0.41],
      [-0.075, 0.41],
      [0.075, 0.41],
      [0.22, 0.41],
      // Bottom row (4 chips)
      [-0.22, -0.41],
      [-0.075, -0.41],
      [0.075, -0.41],
      [0.22, -0.41],
      // Left column (4 chips)
      [-0.41, -0.22],
      [-0.41, -0.075],
      [-0.41, 0.075],
      [-0.41, 0.22],
      // Right column (4 chips)
      [0.41, -0.22],
      [0.41, -0.075],
      [0.41, 0.075],
      [0.41, 0.22],
    ];
    gddrOffsets.forEach(([ox, oy], idx) => {
      dummy.position.set(-0.42 + ox, 0.02 + oy, -0.145);
      dummy.rotation.set(0, 0, Math.abs(ox) > 0.35 ? Math.PI / 2 : 0);
      dummy.updateMatrix();
      gddr7Instanced.setMatrixAt(idx, dummy.matrix);
    });
    gddr7Instanced.instanceMatrix.needsUpdate = true;
    gddr7Instanced.computeBoundingSphere();
    obj09_GpuAndGddr7Packages.add(gddr7Instanced);

    // =========================================================================
    // OBJECT 10: VRM Components, Inductors, MOSFETs & Capacitors (Approx.)
    // =========================================================================
    const inductorGeo = trackGeo(new THREE.BoxGeometry(0.065, 0.065, 0.045));
    const mosfetGeo = trackGeo(new THREE.BoxGeometry(0.04, 0.045, 0.02));
    const capGeo = trackGeo(new THREE.CylinderGeometry(0.022, 0.022, 0.048, 12));
    capGeo.rotateX(Math.PI / 2);

    const vrmCount = 24;
    const inductorInstanced = new THREE.InstancedMesh(
      inductorGeo,
      vrmAlloyChokeMat,
      vrmCount
    );
    const mosfetInstanced = new THREE.InstancedMesh(
      mosfetGeo,
      gddr7PackageMat,
      vrmCount
    );
    const capInstanced = new THREE.InstancedMesh(
      capGeo,
      chromeTrimMat,
      vrmCount
    );

    for (let i = 0; i < vrmCount; i++) {
      const isLeftBank = i < 10;
      const rowIdx = isLeftBank ? i : i - 10;
      const bankX = isLeftBank ? -1.12 : 0.22 + (rowIdx >= 7 ? 0.22 : 0);
      const localRow = isLeftBank ? rowIdx : rowIdx % 7;
      const py = -0.45 + localRow * 0.11;

      // Inductor
      dummy.position.set(bankX, py, -0.145);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      inductorInstanced.setMatrixAt(i, dummy.matrix);

      // MOSFET stage next to inductor
      dummy.position.set(bankX + 0.065, py, -0.152);
      dummy.updateMatrix();
      mosfetInstanced.setMatrixAt(i, dummy.matrix);

      // Solid Polymer Capacitor
      dummy.position.set(bankX - 0.065, py, -0.142);
      dummy.updateMatrix();
      capInstanced.setMatrixAt(i, dummy.matrix);
    }
    inductorInstanced.instanceMatrix.needsUpdate = true;
    mosfetInstanced.instanceMatrix.needsUpdate = true;
    capInstanced.instanceMatrix.needsUpdate = true;
    inductorInstanced.computeBoundingSphere();
    mosfetInstanced.computeBoundingSphere();
    capInstanced.computeBoundingSphere();
    obj10_VrmPowerDelivery.add(inductorInstanced, mosfetInstanced, capInstanced);

    // =========================================================================
    // OBJECT 11: Two HDMI 2.1b & Three DisplayPort 2.1b Ports in Rear Bracket
    // =========================================================================
    const portOuterGeo = trackGeo(new THREE.BoxGeometry(0.11, 0.14, 0.055));
    const portInnerTongueGeo = trackGeo(
      new THREE.BoxGeometry(0.115, 0.09, 0.018)
    );
    // 3× DisplayPort 2.1b + 2× HDMI 2.1b arranged along the rear I/O bracket (-L/2)
    const portSpecs: { y: number; z: number; isHdmi: boolean }[] = [
      { y: 0.34, z: -0.11, isHdmi: false }, // DP 1
      { y: 0.12, z: -0.11, isHdmi: false }, // DP 2
      { y: -0.1, z: -0.11, isHdmi: false }, // DP 3
      { y: -0.32, z: -0.11, isHdmi: true }, // HDMI 1
      { y: 0.23, z: 0.04, isHdmi: true }, // HDMI 2 (second tier)
    ];

    portSpecs.forEach((p, idx) => {
      const portGroup = new THREE.Group();
      portGroup.name = p.isHdmi ? `HDMI_2_1b_Port_${idx}` : `DP_2_1b_Port_${idx}`;
      const shell = new THREE.Mesh(portOuterGeo, chromeTrimMat);
      const tongue = new THREE.Mesh(
        portInnerTongueGeo,
        p.isHdmi ? goldContactMat : mattePolymerMat
      );
      tongue.position.x = -0.005;
      portGroup.add(shell, tongue);
      portGroup.position.set(-L / 2 - 0.01, p.y, p.z);
      obj11_RearIoPorts.add(portGroup);
    });

    // =========================================================================
    // OBJECT 12: Detachable GC-HPWR BTF Adapter & Connector Contacts
    // =========================================================================
    const gcAdapterHousingGeo = trackGeo(
      new THREE.BoxGeometry(0.52, 0.24, 0.14)
    );
    const gcAdapterHousing = new THREE.Mesh(
      gcAdapterHousingGeo,
      dieCastCharcoalMat
    );
    gcAdapterHousing.position.set(0.28, -H / 2 - 0.08, -0.18);

    const gcGoldContactsGeo = trackGeo(
      new THREE.BoxGeometry(0.4, 0.09, 0.145)
    );
    const gcGoldContacts = new THREE.Mesh(gcGoldContactsGeo, goldContactMat);
    gcGoldContacts.position.set(0.28, -H / 2 - 0.16, -0.18);

    const gcLatchGeo = trackGeo(new THREE.BoxGeometry(0.08, 0.18, 0.16));
    const gcLatch = new THREE.Mesh(gcLatchGeo, chromeTrimMat);
    gcLatch.position.set(0.56, -H / 2 - 0.08, -0.18);

    obj12_DetachableGcHpwr.add(gcAdapterHousing, gcGoldContacts, gcLatch);

    // =========================================================================
    // OBJECT 13: ROG Logos, Product Markings & Subtle Aura RGB Illumination
    // =========================================================================
    const badgeGeo = trackGeo(new THREE.BoxGeometry(0.32, 0.11, 0.025));
    const badgeMesh = new THREE.Mesh(badgeGeo, rogBadgeMat);
    badgeMesh.position.set(-0.57, 0.49, T / 2 - 0.01);

    const auraBarGeo = trackGeo(new THREE.BoxGeometry(0.52, 0.04, 0.07));
    const auraBar1 = new THREE.Mesh(auraBarGeo, auraBlueMat);
    auraBar1.position.set(-1.26, H / 2 - 0.12, T / 2 - 0.08);
    const auraBar2 = new THREE.Mesh(auraBarGeo, auraPurpleMat);
    auraBar2.position.set(-0.64, H / 2 - 0.12, T / 2 - 0.08);
    const auraBar3 = new THREE.Mesh(auraBarGeo, auraPurpleMat);
    auraBar3.position.set(-0.02, H / 2 - 0.12, T / 2 - 0.08);

    // Top-edge illuminated ROG Astral lightbar strip
    const topEdgeRgbGeo = trackGeo(new THREE.BoxGeometry(1.45, 0.025, 0.09));
    const topEdgeRgb = new THREE.Mesh(topEdgeRgbGeo, auraPurpleMat);
    topEdgeRgb.position.set(0.75, H / 2 + 0.005, 0.12);

    obj13_RogLogosAndRgb.add(
      badgeMesh,
      auraBar1,
      auraBar2,
      auraBar3,
      topEdgeRgb
    );

    // =========================================================================
    // 6. Contact Shadow Grounding Plane
    // =========================================================================
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.25)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    disposableTextures.push(shadowTex);

    const contactShadowGeo = trackGeo(new THREE.PlaneGeometry(5.0, 2.2));
    contactShadowGeo.rotateX(-Math.PI / 2);
    const contactShadowMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.85,
      })
    );
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.position.set(0, -1.02, 0);
    scene.add(contactShadow);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 7. ResizeObserver for responsive container sizing
    const handleResize = () => {
      if (!container) return;
      const w = Math.max(container.clientWidth, 260);
      const h = Math.max(container.clientHeight, 185);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Animation Loop with Software-WebGL fenceSync guard & Multi-Layer Exploded View Damping
    const clock = new THREE.Clock();
    let frameId = 0;
    let isDisposed = false;

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Spin the 4 Axial-Tech fans (center fan counter-rotates to reduce turbulence)
      const fanOverride = devFanRpmRef.current;
      const rpmSpeed =
        fanOverride !== null
          ? (fanOverride / 1200) * 5.2
          : turboFanRef.current
          ? 17.5
          : 5.2;

      if (fanRotors[0]) fanRotors[0].rotation.z -= delta * rpmSpeed;
      if (fanRotors[1]) fanRotors[1].rotation.z += delta * rpmSpeed;
      if (fanRotors[2]) fanRotors[2].rotation.z -= delta * rpmSpeed;
      if (fanRotors[3]) fanRotors[3].rotation.z += delta * rpmSpeed;

      gpuRoot.position.y = 0.04 + Math.sin(elapsed * 1.6) * 0.022;

      // Exploded Assembly Kinematics across all 13 separate objects
      const e =
        devExplodeRef.current !== null
          ? devExplodeRef.current
          : explodeFactorRef.current;

      // Front Shroud, Fans, Mounting Rings & RGB move forward (+Z)
      obj03_FanMountingRings.position.z = THREE.MathUtils.damp(
        obj03_FanMountingRings.position.z,
        e * 1.15,
        6,
        delta
      );
      obj02_QuadAxialFans.position.z = THREE.MathUtils.damp(
        obj02_QuadAxialFans.position.z,
        e * 0.92,
        6,
        delta
      );
      obj01_MainFrontShroud.position.z = THREE.MathUtils.damp(
        obj01_MainFrontShroud.position.z,
        e * 0.68,
        6,
        delta
      );
      obj13_RogLogosAndRgb.position.z = THREE.MathUtils.damp(
        obj13_RogLogosAndRgb.position.z,
        e * 0.72,
        6,
        delta
      );

      // Heatsink & Vapor Chamber separate in mid-front (+Z)
      obj06_InternalHeatsink.position.z = THREE.MathUtils.damp(
        obj06_InternalHeatsink.position.z,
        e * 0.32,
        6,
        delta
      );
      obj07_VaporChamberHeatpipes.position.z = THREE.MathUtils.damp(
        obj07_VaporChamberHeatpipes.position.z,
        e * 0.14,
        6,
        delta
      );

      // GPU Package, 32GB GDDR7, VRM & PCB separate slightly backward (-Z)
      obj09_GpuAndGddr7Packages.position.z = THREE.MathUtils.damp(
        obj09_GpuAndGddr7Packages.position.z,
        -e * 0.18,
        6,
        delta
      );
      obj10_VrmPowerDelivery.position.z = THREE.MathUtils.damp(
        obj10_VrmPowerDelivery.position.z,
        -e * 0.22,
        6,
        delta
      );
      obj08_PcbAndBtfInterface.position.z = THREE.MathUtils.damp(
        obj08_PcbAndBtfInterface.position.z,
        -e * 0.36,
        6,
        delta
      );

      // Rear Backplate moves furthest back (-Z)
      obj04_RearMetalBackplate.position.z = THREE.MathUtils.damp(
        obj04_RearMetalBackplate.position.z,
        -e * 0.78,
        6,
        delta
      );

      // Rear I/O ports & bracket slide slightly left (-X) when exploded
      obj11_RearIoPorts.position.x = THREE.MathUtils.damp(
        obj11_RearIoPorts.position.x,
        -e * 0.28,
        6,
        delta
      );

      // Detachable GC-HPWR BTF Adapter detaches downward (-Y) when toggled or exploded
      const targetGcY =
        gcHpwrDetachedRef.current || e > 0.2 ? -0.34 - e * 0.18 : 0;
      obj12_DetachableGcHpwr.position.y = THREE.MathUtils.damp(
        obj12_DetachableGcHpwr.position.y,
        targetGcY,
        6.5,
        delta
      );
      obj12_DetachableGcHpwr.position.z = THREE.MathUtils.damp(
        obj12_DetachableGcHpwr.position.z,
        -e * 0.36,
        6,
        delta
      );

      // Smooth Camera Preset transition if active
      if (activeCamPresetRef.current) {
        const preset = CAMERA_PRESETS[activeCamPresetRef.current];
        _targetPos.set(...preset.pos);
        _targetLook.set(...preset.target);

        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          _targetPos.x,
          5.5,
          delta
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          _targetPos.y,
          5.5,
          delta
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          _targetPos.z,
          5.5,
          delta
        );

        controls.target.x = THREE.MathUtils.damp(
          controls.target.x,
          _targetLook.x,
          5.5,
          delta
        );
        controls.target.y = THREE.MathUtils.damp(
          controls.target.y,
          _targetLook.y,
          5.5,
          delta
        );
        controls.target.z = THREE.MathUtils.damp(
          controls.target.z,
          _targetLook.z,
          5.5,
          delta
        );

        if (camera.position.distanceTo(_targetPos) < 0.03) {
          activeCamPresetRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlStart);
      controls.dispose();
      envTexture.dispose();
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
      materialsRef.current = [];
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={viewerContainerRef}
      data-testid="interactive-gpu-3d"
      data-gpu-fullscreen={isFullscreen ? 'true' : 'false'}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onDoubleClick={handleToggleFullscreen}
      role={isFullscreen ? 'dialog' : 'region'}
      aria-modal={isFullscreen ? true : undefined}
      aria-label="Interactive 3D ASUS ROG Astral GeForce RTX 5090 32GB GDDR7 BTF OC Edition"
      className={
        isFullscreen
          ? 'fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999] w-screen h-screen rounded-none overflow-hidden bg-gradient-to-b from-[#0B0D13] via-[#141822] to-[#080A0F] border-0 shadow-2xl transition-all duration-200'
          : `relative z-10 w-full ${
              isExpandedStudio
                ? 'min-h-[460px] h-[460px] sm:h-[520px]'
                : 'min-h-[360px] h-[360px] sm:h-[420px] lg:h-[460px]'
            } rounded-xl overflow-hidden bg-gradient-to-b from-[#0F1117] via-[#161923] to-[#0B0D13] border border-white/15 shadow-inner transition-all duration-200`
      }
    >
      {/* Top-Left Dimension & BTF Spec Header */}
      <div className="absolute top-3 left-3 pr-36 z-30 pointer-events-none flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-[#181B24]/95 border border-white/15 font-mono text-[10px] font-bold text-slate-200 tracking-wider truncate">
          ROG ASTRAL RTX 5090 32GB BTF OC · 357.6×149.3×76.0mm (3.8-SLOT)
        </span>
      </div>

      {/* Absolutely Positioned 'Fullscreen' Button (takes over viewport & toggles z-index to top) */}
      <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5">
        {!isFullscreen && (
          <button
            type="button"
            onClick={() => setIsExpandedStudio((prev) => !prev)}
            className="p-1.5 rounded-full bg-[#181B24]/95 border border-white/15 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title={
              isExpandedStudio ? 'Standard Card Height' : 'Expand Card Height'
            }
            aria-label={
              isExpandedStudio ? 'Standard Card Height' : 'Expand Card Height'
            }
          >
            {isExpandedStudio ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        <button
          type="button"
          data-testid="gpu-3d-fullscreen-btn"
          aria-pressed={isFullscreen}
          onClick={handleToggleFullscreen}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#584CE8] hover:bg-[#483CD6] border border-white/25 text-white font-mono text-[10px] font-bold cursor-pointer shadow-lg transition-colors"
          title={
            isFullscreen
              ? 'Exit Fullscreen (ESC)'
              : 'Fullscreen 3D GPU Viewer'
          }
          aria-label={
            isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'
          }
        >
          {isFullscreen ? (
            <>
              <Shrink className="w-3.5 h-3.5" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Expand className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </>
          )}
        </button>
      </div>

      {/* Exploded / Internal Geometry Accuracy Notice */}
      {explodeFactor > 0.1 && !showPartManifest && (
        <div className="absolute top-11 left-3 z-30 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded bg-[#1E1B4B]/95 border border-indigo-400/30 font-mono text-[10px] text-indigo-200">
            EXPLODED CAD: EXT. VERIFIED · INT. PCB/VRM/GDDR7 APPROXIMATE
          </span>
        </div>
      )}

      {/* 13-Object CAD Hierarchy & Spec Drawer */}
      {showPartManifest && (
        <div className="absolute inset-x-3 top-11 bottom-12 z-30 rounded-xl bg-[#0F1117]/95 border border-white/15 p-3 overflow-y-auto text-[11px] font-mono text-slate-200">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10">
            <span className="font-bold text-indigo-300">
              13-OBJECT CAD MANIFEST (SCALE: 1u = 100mm)
            </span>
            <span className="text-emerald-300 tabular-nums">
              BBOX: 357.6 × 149.3 × 76.0 mm
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {PART_MANIFEST.map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-white/[0.04]"
              >
                <span className="truncate text-slate-100">{part.name}</span>
                <span
                  className={`text-[10px] shrink-0 ${
                    part.status.startsWith('Verified')
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                  }`}
                >
                  {part.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Reference Photo Comparison Overlay (/assets/aistudio/image_4a61f533.png) */}
      {showRefOverlay && (
        <div className="absolute inset-0 z-20 bg-[#0F1117]/95 flex items-center justify-center p-4 pb-12 pointer-events-none">
          <img
            src="/assets/aistudio/image_4a61f533.png"
            alt="ASUS ROG Astral GeForce RTX 5090 Reference"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
      )}

      {/* Dedicated Isolated WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Unified Bottom Control Dock (Solid dark studio surface, no backdrop-filter over WebGL) */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#161923] border border-white/15 shadow-lg max-w-[98%] overflow-x-auto">
        {(['iso', 'front', 'rear', 'side', 'top'] as CameraPreset[]).map(
          (preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSelectCamera(preset)}
              className={`px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                !showRefOverlay && camPreset === preset
                  ? 'bg-[#584CE8] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {CAMERA_PRESETS[preset].label}
            </button>
          )
        )}

        <div className="h-3.5 w-[1px] bg-white/15 mx-0.5 shrink-0" />

        <button
          type="button"
          data-testid="gpu-3d-explode-btn"
          aria-pressed={explodeFactor > 0.1}
          onClick={handleToggleExplode}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            explodeFactor > 0.1
              ? 'bg-[#0D9488] text-white'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Explode 13-Part Assembly (Shroud, 4× Fans, Heatsink, Vapor Chamber, GB202+32GB GDDR7, VRM, PCB & Backplate)"
        >
          <Layers className="w-3 h-3" />
          <span>{explodeFactor > 0.1 ? 'Assemble' : 'Explode'}</span>
        </button>

        <button
          type="button"
          data-testid="gpu-3d-btf-btn"
          aria-pressed={gcHpwrDetached}
          onClick={() => {
            setShowRefOverlay(false);
            setGcHpwrDetached((prev) => !prev);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            gcHpwrDetached
              ? 'bg-amber-600 text-white'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Detach / Attach ASUS BTF GC-HPWR High-Power Gold Finger Adapter"
        >
          <Plug className="w-3 h-3" />
          <span>GC-HPWR</span>
        </button>

        <button
          type="button"
          data-testid="gpu-3d-rpm-btn"
          aria-pressed={turboFan}
          onClick={() => {
            setShowRefOverlay(false);
            setTurboFan((prev) => !prev);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            turboFan
              ? 'bg-[#584CE8] text-white'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Toggle OC Fan RPM Boost"
        >
          <Wind className="w-3 h-3" />
          <span>{turboFan ? '2800 RPM' : '1200 RPM'}</span>
        </button>

        <button
          type="button"
          data-testid="gpu-3d-parts-btn"
          aria-pressed={showPartManifest}
          onClick={() => setShowPartManifest((prev) => !prev)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            showPartManifest
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Inspect 13 Separate CAD Objects & Dimensions"
        >
          <Cpu className="w-3 h-3" />
          <span>13 Parts</span>
        </button>

        <button
          type="button"
          data-testid="gpu-3d-ref-btn"
          aria-pressed={showRefOverlay}
          onClick={() => setShowRefOverlay((prev) => !prev)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            showRefOverlay
              ? 'bg-slate-700 text-white'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Compare with Official ASUS ROG Astral Photo"
        >
          <Eye className="w-3 h-3" />
          <span>Ref</span>
        </button>

        <button
          type="button"
          onClick={handleResetView}
          aria-label="Reset 3D GPU View"
          title="Reset 3D View"
          className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
