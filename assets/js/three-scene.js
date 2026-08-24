// Three.js 3D Printing Scene for PRINTXTORE

// ============================================================================
// --- 3D SCENE CONFIGURATION ---
// You can easily modify these parameters to manually adjust the size,
// positioning, animations, parallax, and lighting of the central 3D card.
// ============================================================================
const SCENE_CONFIG = {
  // Card Dimensions
  cardWidth: 4.2,         // Width of the card
  cardHeight: 3.15,       // Height of the card (4:3 ratio with width is recommended)
  cardThickness: 0.05,    // Thickness/depth of the card

  // Initial Position in 3D Space
  posX: 0,                // X position (horizontal centering)
  posY: 0.1,              // Y position (vertical centering offset)
  posZ: 0.8,              // Z position (depth, closer to camera means larger card)

  // Initial Rotation angles (in radians)
  rotX: 0.1,              // Pitch (x-axis rotation tilt)
  rotY: -0.2,             // Yaw (y-axis rotation tilt)
  rotZ: 0.05,             // Roll (z-axis rotation tilt)

  // Auto-Floating Animation (Up and Down Hovering)
  floatAmplitude: 0.05,   // Peak height of float movement (0 to disable)
  floatSpeed: 1.5,        // Speed frequency of the floating cycle

  // Mouse Parallax movement multipliers (how much card moves when cursor is dragged)
  mouseMovePosFactor: 0.1,    // Position movement multiplier
  mouseMoveRotFactor: 0.05,   // Local card rotation multiplier
  globalGroupRotFactor: 0.03, // Global scene rotation multiplier

  // Lighting Intensities (0.0 to 2.0+)
  ambientLightIntensity: 0.85,  // Overall base lighting brightness
  dirLightIntensity: 1.4,       // Directional lighting brightness (casting shadows)
  pointLightIntensity: 1.5      // Warm orange color light brightness (bottom-left)
};
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("hero-3d-canvas");
  if (!container) return;

  // Check mobile to reduce loading overhead
  const isMobile = window.innerWidth < 768;

  // Scene setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = isMobile ? 7 : 6;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, SCENE_CONFIG.ambientLightIntensity);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, SCENE_CONFIG.dirLightIntensity);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0xe95d2c, SCENE_CONFIG.pointLightIntensity, 10);
  pointLight.position.set(-3, -2, 2);
  scene.add(pointLight);

  // Group to contain all objects
  const objectsGroup = new THREE.Group();
  scene.add(objectsGroup);

  // Object Materials
  const tealMat = new THREE.MeshPhysicalMaterial({
    color: 0x45586c,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const greenMat = new THREE.MeshPhysicalMaterial({
    color: 0xe95d2c,
    roughness: 0.3,
    metalness: 0.1,
    clearcoat: 0.8
  });

  const whiteMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4f8f5,
    roughness: 0.4,
    metalness: 0.0,
    clearcoat: 0.2
  });

  const goldMat = new THREE.MeshPhysicalMaterial({
    color: 0xb0cee2,
    roughness: 0.1,
    metalness: 0.8
  });

  // Texture Loader for Printer Card
  const textureLoader = new THREE.TextureLoader();
  const printerTexture = textureLoader.load('assets/images/printer-showcase.png');
  printerTexture.encoding = THREE.sRGBEncoding;
  
  const printerMat = new THREE.MeshPhysicalMaterial({
    map: printerTexture,
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
  });

  // Array to hold references for animations
  const items = [];

  // Helper to add items
  function createItem(geometry, material, pos, rot, speed) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.set(rot.x, rot.y, rot.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    objectsGroup.add(mesh);
    items.push({
      mesh,
      basePos: { ...pos },
      baseRot: { ...rot },
      speed
    });
  }

  // Central Printer Card (Floating in center)
  createItem(
    new THREE.BoxGeometry(SCENE_CONFIG.cardWidth, SCENE_CONFIG.cardHeight, SCENE_CONFIG.cardThickness),
    printerMat,
    { x: SCENE_CONFIG.posX, y: SCENE_CONFIG.posY, z: SCENE_CONFIG.posZ },
    { x: SCENE_CONFIG.rotX, y: SCENE_CONFIG.rotY, z: SCENE_CONFIG.rotZ },
    0.005
  );

  // Mouse Parallax movement
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  });

  // Scroll effect offset
  let scrollY = 0;
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY / window.innerHeight;
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Lerp mouse target
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Apply floating and mouse offset
    items.forEach((item, idx) => {
      // Sin wave float (using config parameters)
      const bounce = Math.sin(elapsedTime * SCENE_CONFIG.floatSpeed + idx * 100) * SCENE_CONFIG.floatAmplitude;
      item.mesh.position.y = item.basePos.y + bounce + (targetY * -SCENE_CONFIG.mouseMovePosFactor) - (scrollY * 0.5);
      item.mesh.position.x = item.basePos.x + (targetX * SCENE_CONFIG.mouseMovePosFactor);

      // Rotation updates (using config parameters)
      item.mesh.rotation.x = item.baseRot.x + (elapsedTime * item.speed * 0.5) + (targetY * SCENE_CONFIG.mouseMoveRotFactor);
      item.mesh.rotation.y = item.baseRot.y + (elapsedTime * item.speed) + (targetX * SCENE_CONFIG.mouseMoveRotFactor);
    });

    // Slight global group rotation (using config parameters)
    objectsGroup.rotation.y = targetX * SCENE_CONFIG.globalGroupRotFactor;
    objectsGroup.rotation.x = targetY * SCENE_CONFIG.globalGroupRotFactor;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
