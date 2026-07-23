import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * Globe3D - Premium Interactive 3D Earth Model Viewer
 * 
 * Features:
 * - Smooth continuous auto-rotation
 * - Mouse drag to rotate
 * - Touch drag support for mobile
 * - Mouse wheel zoom in/out
 * - Momentum/inertia after drag
 * - Professional lighting setup
 * - Transparent background (shows video beneath)
 * - Drop shadow glow effect
 * - Responsive sizing
 */

const Globe3D = ({ 
  modelPath = '/models/earth.glb',
  rotationSpeed = 0.0002, // One rotation per ~52 seconds
  autoRotate = true,
  onLoaded = null,
  onError = null
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const animationRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive state
  const dragRef = useRef({ isDragging: false, previousMousePosition: { x: 0, y: 0 } });
  const rotationRef = useRef({ x: 0, y: 0 });
  const momentumRef = useRef({ x: 0, y: 0 });
  const targetZoomRef = useRef(2.5);
  const lastInteractionRef = useRef(Date.now());

  useEffect(() => {
    if (!containerRef.current) return;

    // Get container dimensions
    const container = containerRef.current;
    const displaySize = Math.min(container.clientWidth, container.clientHeight) || 600;

    // ──────────────────────────────────────────────────────────────────
    // SCENE SETUP
    // ──────────────────────────────────────────────────────────────────

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // Transparent background

    // Camera - isometric view for best globe visibility
    const camera = new THREE.PerspectiveCamera(
      60,
      1, // Square aspect
      0.1,
      2000
    );
    camera.position.set(0, 0, 2.5);
    cameraRef.current = camera;

    // Renderer with transparency and high quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: 'highp',
      powerPreference: 'high-performance',
    });
    renderer.setSize(displaySize, displaySize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    rendererRef.current = renderer;

    // Style the canvas to fill container
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.cursor = 'grab';

    container.appendChild(renderer.domElement);

    // ──────────────────────────────────────────────────────────────────
    // LIGHTING - Premium setup for 3D globe
    // ──────────────────────────────────────────────────────────────────

    // Key light - main directional light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 3, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);

    // Fill light - subtle ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Rim light - subtle edge lighting
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-5, -2, -5);
    scene.add(rimLight);

    // ──────────────────────────────────────────────────────────────────
    // LOAD GLTF MODEL
    // ──────────────────────────────────────────────────────────────────

    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        globeRef.current = model;

        // Configure model
        model.scale.set(1, 1, 1);
        model.position.set(0, 0, 0);

        // Make sure all meshes cast and receive shadows
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            // Ensure materials support transparency for background video
            if (node.material) {
              node.material.side = THREE.FrontSide;
            }
          }
        });

        scene.add(model);
        setLoading(false);
        if (onLoaded) onLoaded(model);

        // Start animation loop
        animate();
      },
      (progress) => {
        // Progress callback - can be used for loading bar
        const percentComplete = (progress.loaded / progress.total) * 100;
        // console.log(percentComplete + '% loaded');
      },
      (error) => {
        console.error('Error loading model:', error);
        setError('Failed to load globe model');
        setLoading(false);
        if (onError) onError(error);
      }
    );

    // ──────────────────────────────────────────────────────────────────
    // MOUSE & TOUCH EVENT HANDLERS
    // ──────────────────────────────────────────────────────────────────

    const onMouseDown = (e) => {
      dragRef.current.isDragging = true;
      dragRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = 'grabbing';
      lastInteractionRef.current = Date.now();
    };

    const onMouseMove = (e) => {
      if (!dragRef.current.isDragging) return;

      const deltaX = e.clientX - dragRef.current.previousMousePosition.x;
      const deltaY = e.clientY - dragRef.current.previousMousePosition.y;

      // Convert pixel movement to rotation (adjust sensitivity)
      const sensitivity = 0.01;
      rotationRef.current.y += deltaX * sensitivity;
      rotationRef.current.x += deltaY * sensitivity;

      // Store momentum for inertia
      momentumRef.current.x = deltaY * sensitivity;
      momentumRef.current.y = deltaX * sensitivity;

      dragRef.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      lastInteractionRef.current = Date.now();
    };

    const onMouseUp = () => {
      dragRef.current.isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    // Touch events for mobile
    const onTouchStart = (e) => {
      if (e.touches.length === 0) return;
      dragRef.current.isDragging = true;
      dragRef.current.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastInteractionRef.current = Date.now();
    };

    const onTouchMove = (e) => {
      if (!dragRef.current.isDragging || e.touches.length === 0) return;

      const deltaX = e.touches[0].clientX - dragRef.current.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - dragRef.current.previousMousePosition.y;

      const sensitivity = 0.01;
      rotationRef.current.y += deltaX * sensitivity;
      rotationRef.current.x += deltaY * sensitivity;

      momentumRef.current.x = deltaY * sensitivity;
      momentumRef.current.y = deltaX * sensitivity;

      dragRef.current.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastInteractionRef.current = Date.now();
    };

    const onTouchEnd = () => {
      dragRef.current.isDragging = false;
    };

    // Mouse wheel zoom
    const onMouseWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      targetZoomRef.current += (e.deltaY > 0 ? 1 : -1) * zoomSpeed;
      // Clamp zoom between 1.5 and 4
      targetZoomRef.current = Math.max(1.5, Math.min(4, targetZoomRef.current));
      lastInteractionRef.current = Date.now();
    };

    // Attach event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
    renderer.domElement.addEventListener('touchend', onTouchEnd);
    renderer.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

    // ──────────────────────────────────────────────────────────────────
    // ANIMATION LOOP
    // ──────────────────────────────────────────────────────────────────

    const animate = () => {
      if (globeRef.current) {
        // Time since last interaction
        const timeSinceInteraction = Date.now() - lastInteractionRef.current;
        const autoRotateThreshold = 1000; // Resume auto-rotate after 1 second of inactivity

        // Apply drag-based rotation
        globeRef.current.rotation.y = rotationRef.current.y;
        globeRef.current.rotation.x = rotationRef.current.x;

        // Apply momentum with decay
        if (!dragRef.current.isDragging) {
          const decay = 0.95;
          momentumRef.current.x *= decay;
          momentumRef.current.y *= decay;

          rotationRef.current.y += momentumRef.current.y;
          rotationRef.current.x += momentumRef.current.x;

          // Resume auto-rotate if idle
          if (autoRotate && timeSinceInteraction > autoRotateThreshold) {
            rotationRef.current.y += rotationSpeed;
          }
        }
      }

      // Smooth camera zoom
      const currentZ = cameraRef.current.position.z;
      const targetZ = targetZoomRef.current;
      cameraRef.current.position.z += (targetZ - currentZ) * 0.1;

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation (will be called after model loads)
    if (globeRef.current) {
      animate();
    }

    // ──────────────────────────────────────────────────────────────────
    // HANDLE RESIZE & CLEANUP
    // ──────────────────────────────────────────────────────────────────

    const handleWindowResize = () => {
      if (containerRef.current && rendererRef.current) {
        const newSize = Math.min(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        rendererRef.current.setSize(newSize, newSize);
      }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', onMouseUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      renderer.domElement.removeEventListener('wheel', onMouseWheel);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current && renderer && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // Already removed
        }
      }
      // Dispose resources
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [modelPath, rotationSpeed, autoRotate, onLoaded, onError]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.15))',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                borderTop: '3px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading globe...
            </div>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: '0.9rem', color: '#ff6b6b', marginBottom: '0.5rem' }}>
              ⚠ {error}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Check that the model file exists at: {modelPath}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Globe3D;