"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ── Region definitions ────────────────────────────────────────────────────────
// Positions are in brain local space (brain ellipsoid: rx=1.15, ry=0.95, rz=1.0)
// Coordinate system: +Z = front, -Z = back, +Y = up, +X = right
const REGION_DEFS: {
  id: string;
  label: string;
  sublabel: string;
  pos: [number, number, number];
  color: number;
  hexColor: string;
  subjects: string[];
}[] = [
  {
    id: "frontal",
    label: "Lobe frontal",
    sublabel: "Logique & calcul",
    pos: [0, 0.25, 0.88],
    color: 0xE8922A,
    hexColor: "#E8922A",
    subjects: ["mathématiques", "physique", "chimie", "technologie"],
  },
  {
    id: "temporal",
    label: "Lobe temporal",
    sublabel: "Langage & mémoire",
    pos: [-0.88, -0.05, 0.18],
    color: 0xEC4899,
    hexColor: "#EC4899",
    subjects: ["français", "anglais", "espagnol", "allemand", "latin", "musique"],
  },
  {
    id: "parietal",
    label: "Lobe pariétal",
    sublabel: "Analyse & espace",
    pos: [0.05, 0.75, -0.2],
    color: 0x10B981,
    hexColor: "#10B981",
    subjects: ["sciences de la vie", "svt", "histoire", "géographie"],
  },
  {
    id: "occipital",
    label: "Lobe occipital",
    sublabel: "Vision",
    pos: [0, 0.12, -0.92],
    color: 0x8B5CF6,
    hexColor: "#8B5CF6",
    subjects: ["arts plastiques", "arts"],
  },
  {
    id: "cerebellum",
    label: "Cervelet",
    sublabel: "Coordination",
    pos: [0, -0.42, -0.72],
    color: 0x3B82F6,
    hexColor: "#3B82F6",
    subjects: ["eps", "sport", "éducation physique"],
  },
];

function matchRegion(subject: string, subjects: string[]): boolean {
  const s = subject.toLowerCase();
  return subjects.some((r) => s.includes(r) || r.includes(s.split(" ")[0]));
}

interface Props {
  activeSubjects: string[];
}

export default function BrainViewer({ activeSubjects }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // WebGL support check
    try {
      const testCanvas = document.createElement("canvas");
      const ctx = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!ctx) { setWebglFailed(true); return; }
    } catch { setWebglFailed(true); return; }

    const W = mount.clientWidth || 320;
    const H = mount.clientHeight || 260;

    let renderer: THREE.WebGLRenderer;
    try {
    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 0.3, 3.8);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Lights ────────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x0A1A30, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x3A7FC8, 2.0);
    keyLight.position.set(2, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x001A40, 0.8);
    rimLight.position.set(-4, -1, -3);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x102040, 0.5);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);

    // ── Brain group (everything rotates together) ──────────────────────────────
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Main brain body
    const brainGeo = new THREE.SphereGeometry(1, 40, 30);
    brainGeo.scale(1.15, 0.95, 1.0);
    const brainMat = new THREE.MeshPhongMaterial({
      color: 0x122840,
      specular: 0x2A6090,
      shininess: 45,
      transparent: true,
      opacity: 0.95,
    });
    const brain = new THREE.Mesh(brainGeo, brainMat);
    brainGroup.add(brain);

    // Brain wireframe overlay (subtle grid lines = convolutions feel)
    const wireGeo = new THREE.SphereGeometry(1.01, 14, 10);
    wireGeo.scale(1.15, 0.95, 1.0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2A5A8A,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    brainGroup.add(new THREE.Mesh(wireGeo, wireMat));

    // Cerebellum (small ellipsoid at back-bottom)
    const cGeo = new THREE.SphereGeometry(0.42, 32, 24);
    cGeo.scale(1.25, 0.65, 1.1);
    const cMat = new THREE.MeshPhongMaterial({
      color: 0x0E2035,
      specular: 0x1A4060,
      shininess: 30,
    });
    const cerebellum = new THREE.Mesh(cGeo, cMat);
    cerebellum.position.set(0, -0.52, -0.82);
    brainGroup.add(cerebellum);

    // Cerebellum wireframe
    const cwGeo = new THREE.SphereGeometry(0.43, 12, 10);
    cwGeo.scale(1.25, 0.65, 1.1);
    const cwMat = new THREE.MeshBasicMaterial({ color: 0x1A3A5C, wireframe: true, transparent: true, opacity: 0.1 });
    const cw = new THREE.Mesh(cwGeo, cwMat);
    cw.position.copy(cerebellum.position);
    brainGroup.add(cw);

    // ── Region markers + lights ───────────────────────────────────────────────
    const activeLights: THREE.PointLight[] = [];

    REGION_DEFS.forEach((region) => {
      const isActive = activeSubjects.some((s) => matchRegion(s, region.subjects));
      const [x, y, z] = region.pos;

      // Marker core sphere
      const markerGeo = new THREE.SphereGeometry(isActive ? 0.078 : 0.05, 16, 12);
      const markerMat = new THREE.MeshBasicMaterial({
        color: region.color,
        transparent: true,
        opacity: isActive ? 1.0 : 0.3,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      brainGroup.add(marker);

      if (isActive) {
        // Outer glow sphere
        const glowGeo = new THREE.SphereGeometry(0.22, 16, 12);
        const glowMat = new THREE.MeshBasicMaterial({
          color: region.color,
          transparent: true,
          opacity: 0.12,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(x, y, z);
        brainGroup.add(glow);

        // Middle glow ring
        const midGeo = new THREE.SphereGeometry(0.14, 16, 12);
        const midMat = new THREE.MeshBasicMaterial({
          color: region.color,
          transparent: true,
          opacity: 0.22,
        });
        const mid = new THREE.Mesh(midGeo, midMat);
        mid.position.set(x, y, z);
        brainGroup.add(mid);

        // Point light illuminates brain surface around the region
        const light = new THREE.PointLight(region.color, 1.8, 1.6);
        light.position.set(x, y, z);
        brainGroup.add(light);
        activeLights.push(light);
      }
    });

    // ── Neural connection lines between active regions ──────────────────────
    const activeRegions = REGION_DEFS.filter((r) =>
      activeSubjects.some((s) => matchRegion(s, r.subjects))
    );
    for (let i = 0; i < activeRegions.length - 1; i++) {
      const a = activeRegions[i];
      const b = activeRegions[i + 1];
      const pts = [
        new THREE.Vector3(...a.pos),
        new THREE.Vector3(
          (a.pos[0] + b.pos[0]) / 2,
          (a.pos[1] + b.pos[1]) / 2 + 0.15,
          (a.pos[2] + b.pos[2]) / 2
        ),
        new THREE.Vector3(...b.pos),
      ];
      const curve = new THREE.QuadraticBezierCurve3(pts[0], pts[1], pts[2]);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xE8922A,
        transparent: true,
        opacity: 0.3,
      });
      brainGroup.add(new THREE.Line(lineGeo, lineMat));
    }

    // ── Mouse / touch interaction ─────────────────────────────────────────────
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      velX = 0;
      velY = 0;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      velX = dx * 0.01;
      velY = dy * 0.008;
      brainGroup.rotation.y += velX;
      brainGroup.rotation.x += velY;
      brainGroup.rotation.x = Math.max(-1.0, Math.min(1.0, brainGroup.rotation.x));
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onPointerUp = () => { isDragging = false; };

    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number;
    let time = 0;
    brainGroup.rotation.x = -0.15;
    brainGroup.rotation.y = 0.4;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.012;

      // Auto-rotate when not dragging (with inertia)
      if (!isDragging) {
        velX *= 0.96; // inertia decay
        velY *= 0.96;
        brainGroup.rotation.y += velX + 0.003;
        brainGroup.rotation.x += velY;
        brainGroup.rotation.x = Math.max(-0.8, Math.min(0.8, brainGroup.rotation.x));
      }

      // Pulse active region lights
      activeLights.forEach((light, i) => {
        light.intensity = 1.4 + 0.5 * Math.sin(time * 1.8 + i * 1.4);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    } catch {
      setWebglFailed(true);
    }
  }, [activeSubjects]);

  if (webglFailed) {
    return (
      <div style={{
        width: "100%", height: "200px", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
        background: "rgba(255,255,255,0.03)", borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <span style={{ fontSize: 48 }}>🧠</span>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", maxWidth: 220 }}>
          Visualisation 3D indisponible sur ce navigateur.<br/>Ton cerveau travaille quand même ! ✨
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "260px", cursor: "grab", borderRadius: "12px", overflow: "hidden" }}
    />
  );
}
