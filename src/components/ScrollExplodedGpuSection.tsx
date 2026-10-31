import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Layers, RotateCw, Sparkles } from 'lucide-react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ScrollTelemetryState {
  progressPct: number;
  rotationDeg: number;
  shroudOffsetMm: number;
  stageLabel: string;
}

interface GpuRigHandles {
  rootGroup: THREE.Group;
  frontShroudGroup: THREE.Group;
  leftShroudWing: THREE.Group;
  rightShroudWing: THREE.Group;
  heatsinkGroup: THREE.Group;
  backplateGroup: THREE.Group;
  pcbCoreGroup: THREE.Group;
  fanBlades: THREE.Object3D[];
  requestRender: () => void;
}

export const ScrollExplodedGpuSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<GpuRigHandles | null>(null);

  const [telemetry, setTelemetry] = useState<ScrollTelemetryState>({
    progressPct: 0,
    rotationDeg: 0,
    shroudOffsetMm: 0,
    stageLabel: 'STAGE 01 · 3/4 HERO SILHOUETTE',
  });

  // 1. Initialize Three.js Scene, Procedural Multi-Part GPU Assembly & Full Resource Cleanup
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    const width = Math.max(host.clientWidth, 320);
    const height = Math.max(host.clientHeight, 360);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 5.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLightIndigo = new THREE.DirectionalLight(0x6357f2, 1.8);
    rimLightIndigo.position.set(-5, 3, -4);
    scene.add(rimLightIndigo);

    const fillLightCyan = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLightCyan.position.set(0, -4, 3);
    scene.add(fillLightCyan);

    // Track disposable resources to prevent memory leaks on unmount
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      materials.push(m);
      return m;
    };

    // PBR Materials
    const shroudDarkMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e2430,
        metalness: 0.78,
        roughness: 0.28,
      })
    );
    const shroudSilverTrimMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd8dee9,
        metalness: 0.88,
        roughness: 0.18,
      })
    );
    const indigoAccentMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x6357f2,
        emissive: 0x4338ca,
        emissiveIntensity: 0.65,
        metalness: 0.5,
        roughness: 0.25,
      })
    );
    const copperPipeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xd97742,
        metalness: 0.92,
        roughness: 0.2,
      })
    );
    const aluFinMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        metalness: 0.85,
        roughness: 0.32,
      })
    );
    const pcbMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.35,
        roughness: 0.55,
      })
    );
    const siliconDieMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.95,
        roughness: 0.08,
      })
    );
    const goldFingerMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.92,
        roughness: 0.22,
      })
    );

    // Root GPU Group — Initial dramatic 3/4 hero angle
    const rootGroup = new THREE.Group();
    rootGroup.rotation.set(0.32, -0.58, -0.08);
    scene.add(rootGroup);

    // 1. PCB Core Assembly (Anchor Plane)
    const pcbCoreGroup = new THREE.Group();
    rootGroup.add(pcbCoreGroup);

    const pcbBoard = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.75, 1.18, 0.05)),
      pcbMat
    );
    pcbCoreGroup.add(pcbBoard);

    // GB202 GPU Silicon Die + Substrate + 16x GDDR7 VRAM Chips
    const gpuDie = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.46, 0.46, 0.04)),
      siliconDieMat
    );
    gpuDie.position.set(-0.2, 0.02, 0.04);
    pcbCoreGroup.add(gpuDie);

    const vramGeo = trackGeo(new THREE.BoxGeometry(0.12, 0.14, 0.03));
    const vramOffsets: [number, number][] = [
      [-0.52, 0.22],
      [-0.52, 0.02],
      [-0.52, -0.18],
      [0.12, 0.22],
      [0.12, 0.02],
      [0.12, -0.18],
      [-0.32, 0.36],
      [-0.08, 0.36],
      [-0.32, -0.32],
      [-0.08, -0.32],
    ];
    vramOffsets.forEach(([vx, vy]) => {
      const chip = new THREE.Mesh(vramGeo, shroudDarkMat);
      chip.position.set(vx, vy, 0.035);
      pcbCoreGroup.add(chip);
    });

    // PCIe 5.0 Gold Finger Connector Strip
    const pcieEdge = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.15, 0.12, 0.055)),
      goldFingerMat
    );
    pcieEdge.position.set(-0.45, -0.62, 0);
    pcbCoreGroup.add(pcieEdge);

    // 2. Internal Vapor Chamber, Copper Heatpipes & Fin Array
    const heatsinkGroup = new THREE.Group();
    heatsinkGroup.position.set(0, 0, 0.16);
    rootGroup.add(heatsinkGroup);

    const vaporPlate = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.85, 0.85, 0.06)),
      copperPipeMat
    );
    vaporPlate.position.set(-0.2, 0.02, -0.04);
    heatsinkGroup.add(vaporPlate);

    // 6 Copper Heatpipes running horizontally across the heatsink
    const pipeGeo = trackGeo(new THREE.CylinderGeometry(0.028, 0.028, 2.95, 16));
    pipeGeo.rotateZ(Math.PI / 2);
    for (let p = 0; p < 5; p++) {
      const pipe = new THREE.Mesh(pipeGeo, copperPipeMat);
      pipe.position.set(0, -0.34 + p * 0.17, 0.02);
      heatsinkGroup.add(pipe);
    }

    // Dense Aluminum Heatsink Fin Stack
    const finGeo = trackGeo(new THREE.BoxGeometry(0.018, 1.24, 0.24));
    for (let f = -36; f <= 36; f += 2) {
      const fin = new THREE.Mesh(finGeo, aluFinMat);
      fin.position.set(f * 0.042, 0, 0.05);
      heatsinkGroup.add(fin);
    }

    // 3. Front Primary Shroud + Left & Right Expandable Shroud Wings + Triple Axial Fans
    const frontShroudGroup = new THREE.Group();
    frontShroudGroup.position.set(0, 0, 0.38);
    rootGroup.add(frontShroudGroup);

    const centerFrame = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(3.2, 1.38, 0.12)),
      shroudDarkMat
    );
    frontShroudGroup.add(centerFrame);

    // Illuminated RGB Accent Bar
    const rgbStrip = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(2.85, 0.06, 0.14)),
      indigoAccentMat
    );
    rgbStrip.position.set(0, 0.64, 0.02);
    frontShroudGroup.add(rgbStrip);

    // Left & Right Heatsink Shroud Wings that slide outward during scroll explosion
    const leftShroudWing = new THREE.Group();
    frontShroudGroup.add(leftShroudWing);
    const leftWingMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.95, 1.44, 0.18)),
      shroudSilverTrimMat
    );
    leftWingMesh.position.set(-1.18, 0, 0.03);
    leftShroudWing.add(leftWingMesh);

    const rightShroudWing = new THREE.Group();
    frontShroudGroup.add(rightShroudWing);
    const rightWingMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.95, 1.44, 0.18)),
      shroudSilverTrimMat
    );
    rightWingMesh.position.set(1.18, 0, 0.03);
    rightShroudWing.add(rightWingMesh);

    // Triple Axial-Tech Fans
    const fanBlades: THREE.Object3D[] = [];
    const ringGeo = trackGeo(new THREE.TorusGeometry(0.44, 0.035, 16, 36));
    const hubGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 24));
    hubGeo.rotateX(Math.PI / 2);
    const bladeGeo = trackGeo(new THREE.BoxGeometry(0.26, 0.06, 0.015));

    [-1.02, 0, 1.02].forEach((fx) => {
      const ring = new THREE.Mesh(ringGeo, shroudSilverTrimMat);
      ring.position.set(fx, 0, 0.07);
      frontShroudGroup.add(ring);

      const fanRotor = new THREE.Group();
      fanRotor.position.set(fx, 0, 0.07);
      const hub = new THREE.Mesh(hubGeo, indigoAccentMat);
      fanRotor.add(hub);

      for (let b = 0; b < 9; b++) {
        const angle = (b / 9) * Math.PI * 2;
        const blade = new THREE.Mesh(bladeGeo, shroudDarkMat);
        blade.position.set(Math.cos(angle) * 0.26, Math.sin(angle) * 0.26, 0);
        blade.rotation.z = angle + 0.35;
        blade.rotation.y = 0.42;
        fanRotor.add(blade);
      }

      frontShroudGroup.add(fanRotor);
      fanBlades.push(fanRotor);
    });

    // 4. Rear Brushed Metal Backplate
    const backplateGroup = new THREE.Group();
    backplateGroup.position.set(0, 0, -0.14);
    rootGroup.add(backplateGroup);

    const backplateMesh = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(3.16, 1.36, 0.06)),
      shroudSilverTrimMat
    );
    backplateGroup.add(backplateMesh);

    const backplateAccent = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.1, 0.42, 0.07)),
      indigoAccentMat
    );
    backplateAccent.position.set(0.65, 0, -0.01);
    backplateGroup.add(backplateAccent);

    // Paced on-demand render helper
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const requestRender = () => {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = window.requestAnimationFrame(() => {
        renderDirty = false;
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    rigRef.current = {
      rootGroup,
      frontShroudGroup,
      leftShroudWing,
      rightShroudWing,
      heatsinkGroup,
      backplateGroup,
      pcbCoreGroup,
      fanBlades,
      requestRender,
    };

    requestRender();

    const handleResize = () => {
      if (!host) return;
      const w = Math.max(host.clientWidth, 320);
      const h = Math.max(host.clientHeight, 360);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      rigRef.current = null;

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Bind 3D Model Rotation (180°) & Outward Heatsink Shroud Explosion to Viewport Scroll with useGSAP
  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      const pinEl = pinContainerRef.current;
      const rig = rigRef.current;
      if (!sectionEl || !pinEl || !rig) return;

      const proxy = {
        rotX: 0.32,
        rotY: -0.58,
        rotZ: -0.08,
        frontShroudZ: 0.38,
        shroudWingSpreadX: 0,
        heatsinkZ: 0.16,
        backplateZ: -0.14,
        fanSpinRad: 0,
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          pin: pinEl,
          start: 'top top',
          end: '+=200%', // Pins section for 200vh of scroll travel
          scrub: 0.85,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          rig.rootGroup.rotation.set(proxy.rotX, proxy.rotY, proxy.rotZ);
          rig.frontShroudGroup.position.z = proxy.frontShroudZ;
          rig.leftShroudWing.position.x = -proxy.shroudWingSpreadX;
          rig.rightShroudWing.position.x = proxy.shroudWingSpreadX;
          rig.heatsinkGroup.position.z = proxy.heatsinkZ;
          rig.backplateGroup.position.z = proxy.backplateZ;

          rig.fanBlades.forEach((fan, idx) => {
            fan.rotation.z = proxy.fanSpinRad * (idx % 2 === 0 ? 1 : -1);
          });

          rig.requestRender();

          const prog = tl.progress();
          const pct = Math.round(prog * 100);
          const deg = Math.round(prog * 180);
          const offsetMm = Math.round(prog * 112);

          let stageLabel = 'STAGE 01 · 3/4 HERO SILHOUETTE';
          if (pct >= 75) {
            stageLabel = 'STAGE 03 · 180° TOP-DOWN EXPLODED ARCHITECTURE';
          } else if (pct >= 30) {
            stageLabel = 'STAGE 02 · ORBITAL ROTATION & SHROUD SEPARATION';
          }

          setTelemetry((prev) => {
            if (prev.progressPct === pct) return prev;
            return {
              progressPct: pct,
              rotationDeg: deg,
              shroudOffsetMm: offsetMm,
              stageLabel,
            };
          });
        },
      });

      // Rotate 180 degrees (Math.PI) from dramatic 3/4 hero angle into exploded top-down layout
      tl.to(
        proxy,
        {
          rotX: Math.PI / 2, // Top-down architectural pitch
          rotY: -0.58 + Math.PI, // Full 180-degree orbital rotation
          rotZ: 0,
          frontShroudZ: 1.38, // Move primary shroud assembly outward
          shroudWingSpreadX: 0.68, // Move left & right heatsink shrouds outward laterally
          heatsinkZ: 0.62, // Separate copper vapor chamber & fin stack from PCB
          backplateZ: -0.88, // Translate rear metal backplate outward
          fanSpinRad: Math.PI * 4,
          ease: 'power2.inOut',
          duration: 1,
        },
        0
      );

      // Explicit cleanup inside useGSAP to prevent ScrollTrigger or timeline memory leaks
      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="nexus-scroll-gpu-teardown"
      aria-label="Interactive 3D GPU Scroll-Driven Teardown"
      className="relative w-full px-3 sm:px-6 lg:px-8 my-6"
    >
      <div
        ref={pinContainerRef}
        className="max-w-[1360px] mx-auto min-h-[86vh] flex flex-col justify-between nexus-editorial-panel rounded-3xl p-5 sm:p-8 relative overflow-hidden"
      >
        {/* Top Engineering Telemetry Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.16em] text-[#38BDF8] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
              <span>GSAP SCROLLTRIGGER · 200VH PINNED 3D TEARDOWN</span>
            </div>
            <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              180° Architectural Rotation & Heatsink Shroud Explosion
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mt-1 font-medium">
              Scroll down to rotate the 3D GPU assembly 180° from its 3/4 studio hero
              stance into a top-down exploded blueprint while separating the heatsink
              shrouds, copper vapor chamber, and GB202 silicon core.
            </p>
          </div>

          {/* Live Scroll Telemetry Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="nexus-frosted-badge nexus-frosted-badge-indigo font-mono tabular-nums">
              {telemetry.stageLabel}
            </span>
            <span className="nexus-frosted-badge nexus-frosted-badge-teal font-mono tabular-nums">
              ROTATION: {telemetry.rotationDeg}° / 180°
            </span>
          </div>
        </div>

        {/* 3D WebGL Canvas Stage */}
        <div
          ref={canvasHostRef}
          data-testid="scroll-exploded-gpu-canvas"
          className="relative w-full h-[380px] sm:h-[460px] my-2 flex items-center justify-center"
        />

        {/* Bottom Interactive Telemetry Progress Strip */}
        <div className="nexus-editorial-well rounded-2xl p-4 z-10 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div className="flex items-center gap-2.5">
            <RotateCw className="w-4 h-4 text-[#C4B5FD] shrink-0" />
            <div>
              <span className="block text-[10px] font-mono font-bold text-[#94A3B8] uppercase">
                ORBITAL SWEEP
              </span>
              <span className="font-mono text-sm font-extrabold text-white tabular-nums">
                {telemetry.rotationDeg}° / 180° (3/4 → Top-Down)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <div>
              <span className="block text-[10px] font-mono font-bold text-[#94A3B8] uppercase">
                SHROUD DISPLACEMENT
              </span>
              <span className="font-mono text-sm font-extrabold text-white tabular-nums">
                +{telemetry.shroudOffsetMm} mm Outward
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-[#A78BFA] shrink-0" />
            <div>
              <span className="block text-[10px] font-mono font-bold text-[#94A3B8] uppercase">
                EXPOSED LAYERS
              </span>
              <span className="font-mono text-xs font-bold text-white">
                Shroud · Fin Stack · GB202 Die · Backplate
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#C4B5FD] mb-1 tabular-nums">
              <span>200VH PIN PROGRESS</span>
              <span>{telemetry.progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6357F2] to-[#38BDF8] transition-all duration-75"
                style={{ width: `${telemetry.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
