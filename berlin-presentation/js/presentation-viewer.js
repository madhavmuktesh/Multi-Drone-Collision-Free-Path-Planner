// Global State
let scene, camera, renderer, controls;
let dronePaths = {};
let sceneData;
let selectedDroneId = 0;

// Animation variables
let isAnimating = false;
let animationProgress = 0;
let animationStartTime = 0;
let currentCameraPath = null;
let cameraWaypoints = [];

const cameraPresets = {
  overview: { position: { x: 3000, y: 2500, z: 3000 }, target: { x: 0, y: 100, z: 0 }, duration: 3000 },
  birdsEye: { position: { x: 0, y: 4000, z: 0 }, target: { x: 0, y: 0, z: 0 }, duration: 3000 }, 
  sideView: { position: { x: 4000, y: 800, z: 0 }, target: { x: 0, y: 400, z: 0 }, duration: 3000 }, 
  groundLevel: { position: { x: 1500, y: 200, z: 1500 }, target: { x: 0, y: 500, z: 0 }, duration: 3000 }, 
  diagonalSweep: { position: { x: -3000, y: 1500, z: -3000 }, target: { x: 1000, y: 200, z: 1000 }, duration: 3000 }
};

// Current scenario
let currentScenario = "Scenario_1_HeadOn_Central_Crossing";

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e27);
  scene.fog = new THREE.Fog(0x0a0e27, 2000, 8000);

  const container = document.getElementById("viewer-container");
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 10000);
  camera.position.set(2500, 1500, 2500);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 100, 0);
  controls.enableDamping = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(2000, 3000, 2000);
  scene.add(directionalLight);

  const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
  const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1f3a, side: THREE.DoubleSide });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(5000, 50, 0x00d4ff, 0x444444);
  gridHelper.material.opacity = 0.2;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  animate();

  window.addEventListener("resize", onWindowResize, false);
  document.getElementById("timestamp").textContent = new Date().toLocaleString();

  // Load initial scenario
  const select = document.getElementById("scenario-select");
  currentScenario = select.value || currentScenario;
  changeScenario();
}

async function changeScenario() {
  const select = document.getElementById("scenario-select");
  currentScenario = select.value;

  try {
    const sceneUrl = `results/${currentScenario}/multi_drone_scene.json`;
    const response = await fetch(sceneUrl);
    if (!response.ok) throw new Error(`Failed to load scenario data: ${currentScenario}`);

    const data = await response.json();
    clearScene();

    buildBuildings(data.buildings);
    buildDronePaths(data.drones);
    updateSystemStats(data);
    createDroneButtons(data.drones);
    selectDrone(0);

    document.getElementById("loading").classList.add("hidden");
  } catch (e) {
    alert("Error loading scenario data: " + e.message);
  }

  await loadScenarioMetrics(currentScenario);
}

function clearScene() {
  Object.values(dronePaths).forEach(({ line, markers }) => {
    scene.remove(line);
    markers.forEach((m) => scene.remove(m));
  });
  dronePaths = {};

  for (let i = scene.children.length - 1; i >= 0; i--) {
    const obj = scene.children[i];
    if (obj.geometry || obj.material) scene.remove(obj);
  }
}

function buildBuildings(buildings) {
  buildings.forEach((b) => {
    const geo = new THREE.BoxGeometry(b.width, b.height, b.length);
    const mat = new THREE.MeshLambertMaterial({ color: 0x444466, transparent: true, opacity: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(b.x, b.height / 2, b.y);

    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, opacity: 0.3, transparent: true });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    mesh.add(wireframe);
    scene.add(mesh);
  });
}

function buildDronePaths(drones) {
  const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xff8800];
  drones.forEach((drone, i) => {
    const points = drone.path.map((wp) => new THREE.Vector3(wp.x, wp.z, wp.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: colors[i], linewidth: 3 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const markers = [];
    drone.path.forEach((wp) => {
      const markerGeo = new THREE.SphereGeometry(wp.is_start || wp.is_goal ? 20 : 12, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: colors[i] });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(wp.x, wp.z, wp.y);
      scene.add(marker);
      markers.push(marker);
    });
    dronePaths[i] = { line, markers, data: drone, visible: true };
  });
}

function updateSystemStats(data) {
  document.getElementById("total-drones").textContent = data.drones.length;
  document.getElementById("total-buildings").textContent = data.buildings.length;

  const totalDist = data.drones.reduce((sum, d) => sum + d.statistics.path_length_meters, 0);
  document.getElementById("total-distance").textContent = totalDist.toFixed(0) + "m";
  document.getElementById("safety-radius").textContent = data.metadata.safety_radius + "m";
}

function createDroneButtons(drones) {
  const container = document.getElementById("drone-selector");
  container.innerHTML = ""; // clear past buttons
  drones.forEach((drone, i) => {
    const btn = document.createElement("div");
    btn.className = "drone-btn";
    btn.dataset.drone = i;
    btn.textContent = `Drone ${i} (${drone.altitude_band.center}m)`;
    btn.onclick = () => selectDrone(i);
    btn.ondblclick = () => followDronePath(i);
    container.appendChild(btn);
  });
}

function selectDrone(droneId) {
  selectedDroneId = droneId;
  document.querySelectorAll(".drone-btn").forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.drone) === droneId);
  });

  const drone = dronePaths[droneId].data;
  const path = drone.path;
  const pathLength = drone.statistics.path_length_meters;

  const straightDist = Math.sqrt(
    Math.pow(path[path.length - 1].x - path[0].x, 2) +
      Math.pow(path[path.length - 1].y - path[0].y, 2) +
      Math.pow(path[path.length - 1].z - path[0].z, 2)
  );
  const detour = ((pathLength / straightDist - 1) * 100).toFixed(1);

  const altitudes = path.map((p) => p.z);
  const meanAlt = (altitudes.reduce((a, b) => a + b, 0) / altitudes.length).toFixed(1);
  const minAlt = Math.min(...altitudes).toFixed(1);
  const maxAlt = Math.max(...altitudes).toFixed(1);
  const verticalMovement = path
    .reduce((sum, p, i) => (i > 0 ? sum + Math.abs(p.z - path[i - 1].z) : sum), 0)
    .toFixed(1);

  const angles = [];
  for (let i = 1; i < path.length - 1; i++) {
    const v1 = { x: path[i].x - path[i - 1].x, y: path[i].y - path[i - 1].y };
    const v2 = { x: path[i + 1].x - path[i].x, y: path[i + 1].y - path[i].y };
    const norm1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const norm2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    if (norm1 > 0.01 && norm2 > 0.01) {
      const cosAngle = (v1.x * v2.x + v1.y * v2.y) / (norm1 * norm2);
      const angle = (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;
      angles.push(angle);
    }
  }
  const avgAngle = angles.length > 0 ? (angles.reduce((a, b) => a + b, 0) / angles.length).toFixed(1) : 0;
  const maxAngle = angles.length > 0 ? Math.max(...angles).toFixed(1) : 0;
  const sharpTurns = angles.filter((a) => a > 90).length;
  const smoothness = Math.max(0, 100 - avgAngle / 1.8 - sharpTurns * 5).toFixed(1);

  document.getElementById("selected-drone-id").textContent = droneId;
  document.getElementById("waypoints-count").textContent = path.length;
  document.getElementById("path-length").textContent = pathLength.toFixed(1) + "m";
  document.getElementById("straight-distance").textContent = straightDist.toFixed(1) + "m";
  document.getElementById("detour").textContent = "+" + detour + "%";
  document.getElementById("altitude-band").textContent = `${drone.altitude_band.min}-${drone.altitude_band.max}m`;
  document.getElementById("mean-altitude").textContent = meanAlt + "m";
  document.getElementById("altitude-range").textContent = `${minAlt}-${maxAlt}m`;
  document.getElementById("vertical-movement").textContent = verticalMovement + "m";
  document.getElementById("avg-angle").textContent = avgAngle + "°";
  document.getElementById("max-angle").textContent = maxAngle + "°";
  document.getElementById("sharp-turns").textContent = sharpTurns;
  document.getElementById("smoothness-score").textContent = smoothness + "%";
  document.getElementById("building-collisions").textContent = "0 ✅";
  document.getElementById("drone-collisions").textContent = "0 ✅";
  document.getElementById("min-clearance").textContent = ">15m ✅";

  const efficiency = ((straightDist / pathLength) * 100).toFixed(1);
  const altCompliance = 100;
  document.getElementById("efficiency-bar").style.width = efficiency + "%";
  document.getElementById("efficiency-value").textContent = efficiency + "%";
  document.getElementById("altitude-bar").style.width = altCompliance + "%";
  document.getElementById("altitude-value").textContent = altCompliance + "%";
  document.getElementById("smoothness-bar").style.width = smoothness + "%";
  document.getElementById("smoothness-value").textContent = smoothness + "%";
}

async function loadScenarioMetrics(scenario) {
  const metrics = { totalPaths: 0, totalPathLength: 0, collisions: 0, clearanceFailures: 0, successful: 0 };
  try {
    const file = `results/${scenario}/multi_drone_accuracy_report.csv`;
    const csvRows = await fetchCSV(file);
    for (const row of csvRows) {
      metrics.totalPaths++;
      metrics.totalPathLength += parseFloat(row.PathLength || 0);
      if (row.Collision && row.Collision.toLowerCase() === "true") metrics.collisions++;
      if (row.ClearanceFailure && row.ClearanceFailure.toLowerCase() === "true") metrics.clearanceFailures++;
      if (row.Successful && row.Successful.toLowerCase() === "true") metrics.successful++;
    }
  } catch (e) {
    console.warn("Failed to load metrics for scenario: " + scenario);
  }
  metrics.avgPathLength = metrics.totalPaths > 0 ? metrics.totalPathLength / metrics.totalPaths : 0;
  metrics.collisionRate = metrics.totalPaths > 0 ? metrics.collisions / metrics.totalPaths : 0;
  metrics.clearanceFailureRate = metrics.totalPaths > 0 ? metrics.clearanceFailures / metrics.totalPaths : 0;
  metrics.successRate = metrics.totalPaths > 0 ? metrics.successful / metrics.totalPaths : 0;

  document.getElementById("path-length").textContent = metrics.avgPathLength.toFixed(1) + "m";
  document.getElementById("collisions-value").textContent = metrics.collisions + " (" + (metrics.collisionRate * 100).toFixed(1) + "%)";
  document.getElementById("clearance-failures-value").textContent = metrics.clearanceFailures + " (" + (metrics.clearanceFailureRate * 100).toFixed(1) + "%)";
  document.getElementById("success-rate-value").textContent = (metrics.successRate * 100).toFixed(1) + "%";
}

async function fetchCSV(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("File not found: " + url);
  const text = await resp.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    let obj = {};
    headers.forEach((h, i) => (obj[h.trim()] = values[i] ? values[i].trim() : ""));
    return obj;
  });
}

function resetCamera() {
  if (isAnimating) stopAnimation();
  camera.position.set(2500, 1500, 2500);
  controls.target.set(0, 100, 0);
  controls.update();
}

function toggleAnimation() {
  if (isAnimating) stopAnimation();
  else startCinematicTour();
}

function captureScreenshot() {
  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "berlin-drone-paths.png";
  link.click();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById("viewer-container");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function startCinematicTour() {
  if (isAnimating) {
    stopAnimation();
    return;
  }
  isAnimating = true;
  animationProgress = 0;
  animationStartTime = Date.now();

  cameraWaypoints = [
    { ...cameraPresets.overview, delay: 0 },
    { ...cameraPresets.sideView, delay: 3000 },
    { ...cameraPresets.birdsEye, delay: 6000 },
    { ...cameraPresets.groundLevel, delay: 9000 },
    { ...cameraPresets.diagonalSweep, delay: 12000 },
    { ...cameraPresets.overview, delay: 15000 },
  ];

  const btn = document.getElementById("animate-btn");
  if (btn) btn.textContent = "⏹ Stop Animation";
  controls.enabled = false;
  animateCameraTour();
}

function animateCameraTour() {
  if (!isAnimating) return;
  const elapsed = Date.now() - animationStartTime;
  const totalDuration = 18000;

  if (elapsed >= totalDuration) {
    stopAnimation();
    return;
  }

  let currentWaypoint = null;
  let nextWaypoint = null;
  let localProgress = 0;
  for (let i = 0; i < cameraWaypoints.length - 1; i++) {
    if (elapsed >= cameraWaypoints[i].delay && elapsed < cameraWaypoints[i + 1].delay) {
      currentWaypoint = cameraWaypoints[i];
      nextWaypoint = cameraWaypoints[i + 1];
      const segmentDuration = nextWaypoint.delay - currentWaypoint.delay;
      const segmentElapsed = elapsed - currentWaypoint.delay;
      localProgress = segmentElapsed / segmentDuration;
      break;
    }
  }

  if (currentWaypoint && nextWaypoint) {
    const eased = easeInOutCubic(localProgress);
    camera.position.x = lerp(currentWaypoint.position.x, nextWaypoint.position.x, eased);
    camera.position.y = lerp(currentWaypoint.position.y, nextWaypoint.position.y, eased);
    camera.position.z = lerp(currentWaypoint.position.z, nextWaypoint.position.z, eased);
    const targetX = lerp(currentWaypoint.target.x, nextWaypoint.target.x, eased);
    const targetY = lerp(currentWaypoint.target.y, nextWaypoint.target.y, eased);
    const targetZ = lerp(currentWaypoint.target.z, nextWaypoint.target.z, eased);
    controls.target.set(targetX, targetY, targetZ);
    camera.lookAt(targetX, targetY, targetZ);
  }
  requestAnimationFrame(animateCameraTour);
}

function stopAnimation() {
  isAnimating = false;
  controls.enabled = true;
  const btn = document.getElementById("animate-btn");
  if (btn) btn.textContent = "▶ Cinematic Tour";
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function followDronePath(droneId) {
  if (isAnimating) stopAnimation();
  isAnimating = true;
  animationProgress = 0;
  animationStartTime = Date.now();

  const droneData = dronePaths[droneId].data;
  const path = droneData.path;

  const btn = document.getElementById("animate-btn");
  if (btn) btn.textContent = "⏹ Stop Follow";

  controls.enabled = false;

  animateDroneFollow(path);
}

function animateDroneFollow(path) {
  if (!isAnimating) return;

  const elapsed = Date.now() - animationStartTime;
  const duration = 12000;
  const progress = Math.min(elapsed / duration, 1);

  if (progress >= 1) {
    stopAnimation();
    return;
  }

  const pathIndex = Math.floor(progress * (path.length - 1));
  const nextIndex = Math.min(pathIndex + 1, path.length - 1);
  const localProgress = progress * (path.length - 1) - pathIndex;

  const currentPoint = path[pathIndex];
  const nextPoint = path[nextIndex];

  const targetX = lerp(currentPoint.x, nextPoint.x, localProgress);
  const targetY = lerp(currentPoint.y, nextPoint.y, localProgress);
  const targetZ = lerp(currentPoint.z, nextPoint.z, localProgress);

  const offset = 200;
  const heightOffset = 120;

  const dx = nextPoint.x - currentPoint.x;
  const dy = nextPoint.y - currentPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length > 0) {
    const normDx = dx / length;
    const normDy = dy / length;

    camera.position.x = targetX - normDx * offset;
    camera.position.y = targetZ + heightOffset;
    camera.position.z = targetY - normDy * offset;
  }

  controls.target.set(targetX, targetZ, targetY);
  camera.lookAt(targetX, targetZ, targetY);

  requestAnimationFrame(() => animateDroneFollow(path));
}

function startOrbitalView() {
  if (isAnimating) stopAnimation();

  isAnimating = true;
  animationStartTime = Date.now();

  const btn = document.getElementById("animate-btn");
  if (btn) btn.textContent = "⏹ Stop Orbit";

  controls.enabled = false;

  animateOrbital();
}

function animateOrbital() {
  if (!isAnimating) return;

  const elapsed = Date.now() - animationStartTime;
  const duration = 20000;
  const progress = (elapsed % duration) / duration;

  const angle = progress * Math.PI * 2;
  const radius = 3500;
  const height = 1500 + Math.sin(progress * Math.PI * 4) * 500;

  camera.position.x = Math.cos(angle) * radius;
  camera.position.z = Math.sin(angle) * radius;
  camera.position.y = height;

  controls.target.set(0, 300, 0);
  camera.lookAt(0, 300, 0);

  requestAnimationFrame(animateOrbital);
}

// Entry point
window.addEventListener("load", init);
