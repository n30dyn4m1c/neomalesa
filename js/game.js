/* ============================================================
   LIGHT THE ISLANDS — the Interlude.

   A night sea, six dark islands, one small outrigger. Sail to
   each island to light its beacon; every light joins the last
   by a brass line, and each tells one part of the record. When
   all six burn, the network is online.

   Loaded on demand by main.js (initGame), so three.js is only
   ever fetched by a reader who chooses to play.
   ============================================================ */

import * as THREE from '../assets/vendor/three.module.min.js';

const EMAIL = 'neomalesa@protonmail.com';
const BEST_KEY = 'neomalesa.crossing.best';

const BRASS = 0xc5a880;
const BRASS_HOT = 0xffdcae;
const NIGHT = 0x090c11;

// What each beacon stands for — the record, one light at a time
const BEACONS = [
  { x: 0, z: 150, r: 26, title: 'Systems', text: 'Leads in-house software development at the University of Papua New Guinea.' },
  { x: -172, z: 70, r: 22, title: 'Data', text: 'Grand Pacific Prize, Pacific Dataviz Challenge 2026 — The Ocean Knows First.' },
  { x: -150, z: -112, r: 28, title: 'Applied AI', text: 'Eight AI thinking tools, built and released free.' },
  { x: 18, z: -190, r: 20, title: 'Open Tools', text: 'Eleven tools free to the public — from a GPA calculator to a gold trading bot.' },
  { x: 180, z: -92, r: 26, title: 'Writing', text: 'Essays on Papua New Guinea, data, and technology, published since 2018.' },
  { x: 162, z: 98, r: 22, title: 'Abide Tech', text: 'An ICT consultancy for PNG and the Pacific. Founded 2026.' },
];

const WORLD_LIMIT = 300;   // beyond this the current turns the boat back
const LIGHT_RANGE = 17;    // how close past the shore a beacon catches
const CRUISE = 27;
const TRIMMED = 42;
const EASED = 13;
const TURN_RATE = 1.55;

/* ---------- small utilities ---------- */

// Deterministic randomness, so the sea chart is the same on every visit
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fract = (v) => v - Math.floor(v);
const hash = (a, b, c, seed) => fract(Math.sin(a * 12.9898 + b * 78.233 + c * 37.719 + seed) * 43758.5453);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Signed shortest way round from one heading to another
function angleDelta(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

const formatTime = (seconds) => {
  const s = Math.floor(seconds);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};

// Swell height at a point — three crossing sine trains
function swell(x, z, t) {
  return (
    Math.sin(x * 0.045 + t * 0.9) * 1.05 +
    Math.sin(z * 0.06 + t * 0.7) * 0.85 +
    Math.sin((x + z) * 0.11 + t * 1.6) * 0.32
  );
}

// Nudge every vertex by a hash of its own position, so vertices that
// share a position (seams, caps) move together and no cracks open
function roughen(geometry, amount, seed) {
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const kx = Math.round(x * 10);
    const ky = Math.round(y * 10);
    const kz = Math.round(z * 10);
    pos.setXYZ(
      i,
      x + (hash(kx, ky, kz, seed) - 0.5) * amount,
      y + (hash(kx, ky, kz, seed + 3.1) - 0.5) * amount * 0.55,
      z + (hash(kx, ky, kz, seed + 7.7) - 0.5) * amount
    );
  }
  pos.needsUpdate = true;
  return geometry;
}

// A soft round glow, drawn once and shared by every light in the scene
function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}


/* ============================================================
   createGame — builds the scene once and returns its controls
   ============================================================ */

export function createGame(root) {
  const canvas = root.querySelector('.game__canvas');
  const ui = {
    count: root.querySelector('#game-count'),
    time: root.querySelector('#game-time'),
    arrow: root.querySelector('#game-arrow'),
    dist: root.querySelector('#game-dist'),
    toast: root.querySelector('#game-toast'),
    toastKicker: root.querySelector('#game-toast-kicker'),
    toastTitle: root.querySelector('#game-toast-title'),
    toastText: root.querySelector('#game-toast-text'),
    end: root.querySelector('#game-end'),
    final: root.querySelector('#game-final'),
    best: root.querySelector('#game-best'),
    signal: root.querySelector('#game-signal'),
    again: root.querySelector('#game-again'),
    sound: root.querySelector('#game-sound'),
    full: root.querySelector('#game-full'),
    quit: root.querySelector('#game-quit'),
  };

  /* ---------- renderer, scene, camera ---------- */

  // Throws where WebGL is unavailable — main.js turns that into a quiet notice
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(NIGHT);
  scene.fog = new THREE.FogExp2(NIGHT, 0.0046);

  const camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.5, 2400);
  camera.position.set(0, 12, -26);

  scene.add(new THREE.HemisphereLight(0x3c4f6b, 0x05070a, 1.5));
  const moonLight = new THREE.DirectionalLight(0xc9d6f2, 1.9);
  moonLight.position.set(-0.45, 0.62, 0.65);
  scene.add(moonLight);

  const glowTexture = makeGlowTexture();
  const makeGlow = (color, scale, opacity) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      })
    );
    sprite.scale.setScalar(scale);
    return sprite;
  };

  /* ---------- sky: stars and a low moon ---------- */

  const sky = new THREE.Group();
  scene.add(sky);
  {
    const rand = mulberry32(11);
    const positions = [];
    for (let i = 0; i < 700; i++) {
      // Upper dome only, thinned toward the horizon
      const u = rand();
      const y = 0.06 + u * 0.94;
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(1 - y * y);
      positions.push(Math.cos(a) * rr * 1500, y * 1500, Math.sin(a) * rr * 1500);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    sky.add(
      new THREE.Points(
        geometry,
        new THREE.PointsMaterial({ color: 0xcfd8e8, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.75, fog: false })
      )
    );
    const moon = makeGlow(0xdfe6f5, 260, 0.85);
    moon.position.copy(moonLight.position).normalize().multiplyScalar(1400);
    sky.add(moon);
  }

  /* ---------- sea: a faceted sheet that travels with the boat ---------- */

  const SEA_SIZE = 720;
  const SEA_SEGMENTS = 90;
  const SEA_CELL = SEA_SIZE / SEA_SEGMENTS;
  const seaGeometry = new THREE.PlaneGeometry(SEA_SIZE, SEA_SIZE, SEA_SEGMENTS, SEA_SEGMENTS);
  seaGeometry.rotateX(-Math.PI / 2);
  const sea = new THREE.Mesh(
    seaGeometry,
    new THREE.MeshPhongMaterial({
      color: 0x0f2230,
      specular: 0x2a3b4e,
      shininess: 34,
      flatShading: true,
    })
  );
  scene.add(sea);

  // Still water beyond the moving sheet, so the sea has no edge when the
  // camera rises over the finished network
  const deep = new THREE.Mesh(
    new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: 0x0f2230, specular: 0x000000 })
  );
  deep.position.y = -2.4;
  scene.add(deep);

  // The sheet snaps to its own grid as it follows the boat, so the waves
  // stay fixed to the world rather than sliding along with the camera
  function updateSea(cx, cz, t) {
    const ox = Math.round(cx / SEA_CELL) * SEA_CELL;
    const oz = Math.round(cz / SEA_CELL) * SEA_CELL;
    sea.position.set(ox, 0, oz);
    const pos = seaGeometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, swell(pos.getX(i) + ox, pos.getZ(i) + oz, t));
    }
    pos.needsUpdate = true;
  }

  /* ---------- islands and their beacons ---------- */

  const islandMaterial = new THREE.MeshPhongMaterial({ color: 0x1b2430, specular: 0x202a36, shininess: 8, flatShading: true });
  const towerMaterial = new THREE.MeshPhongMaterial({ color: 0x2b313b, flatShading: true });

  const beacons = BEACONS.map((data, index) => {
    const group = new THREE.Group();
    group.position.set(data.x, 0, data.z);

    const height = data.r * 0.95;
    const hill = new THREE.Mesh(
      roughen(new THREE.CylinderGeometry(data.r * 0.2, data.r, height, 10, 3), data.r * 0.22, index * 13.7),
      islandMaterial
    );
    hill.position.y = height / 2 - 2.5;
    group.add(hill);

    // A lower shoulder gives each island its own silhouette
    const shoulder = new THREE.Mesh(
      roughen(new THREE.CylinderGeometry(data.r * 0.12, data.r * 0.62, height * 0.55, 8, 2), data.r * 0.16, index * 5.3 + 2),
      islandMaterial
    );
    const side = hash(index, 1, 2, 9) * Math.PI * 2;
    shoulder.position.set(Math.cos(side) * data.r * 0.55, height * 0.275 - 2.5, Math.sin(side) * data.r * 0.55);
    group.add(shoulder);

    const top = height - 3;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1, 9, 6), towerMaterial);
    tower.position.y = top + 3.5;
    group.add(tower);

    const lantern = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), new THREE.MeshBasicMaterial({ color: 0x4a515c, fog: false }));
    lantern.position.y = top + 9;
    group.add(lantern);

    const glow = makeGlow(BRASS_HOT, 1, 0);
    glow.position.y = top + 9;
    group.add(glow);

    // A column of light: a faint pale marker while dark, brass once lit.
    // Drawn without fog so every island can be found from anywhere.
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 1.6, 170, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xb9c6dc,
        transparent: true,
        opacity: 0.07,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      })
    );
    column.position.y = top + 9 + 85;
    group.add(column);

    const light = new THREE.PointLight(BRASS_HOT, 0, 130, 1.2);
    light.position.y = top + 12;
    group.add(light);

    scene.add(group);
    return { data, group, lantern, glow, column, light, lit: false, ignite: 0, top: top + 9 };
  });

  /* ---------- reefs: scattered rock to steer around ---------- */

  const rocks = [];
  {
    const rand = mulberry32(2026);
    const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x232c38, flatShading: true });
    let attempts = 0;
    while (rocks.length < 26 && attempts++ < 600) {
      const a = rand() * Math.PI * 2;
      const d = 46 + rand() * 226;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      const r = 3 + rand() * 3.6;
      const clear =
        beacons.every((b) => Math.hypot(x - b.data.x, z - b.data.z) > b.data.r + 30) &&
        rocks.every((k) => Math.hypot(x - k.x, z - k.z) > 26);
      if (!clear) continue;
      const mesh = new THREE.Mesh(roughen(new THREE.IcosahedronGeometry(r, 0), r * 0.5, rocks.length * 3.3), rockMaterial);
      mesh.position.set(x, r * 0.15, z);
      mesh.rotation.set(rand() * 3, rand() * 3, rand() * 3);
      scene.add(mesh);
      rocks.push({ x, z, r });
    }
  }

  /* ---------- the boat: a small outrigger under a crab-claw sail ---------- */

  const boat = new THREE.Group();
  boat.rotation.order = 'YXZ';
  const sail = new THREE.Group();
  {
    const wood = new THREE.MeshPhongMaterial({ color: 0x5a4028, specular: 0x2a2018, shininess: 20, flatShading: true });
    const dark = new THREE.MeshPhongMaterial({ color: 0x2e2216, flatShading: true });

    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), wood);
    hull.scale.set(0.95, 0.6, 4.4);
    boat.add(hull);

    const float = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5), wood);
    float.scale.set(0.34, 0.3, 3);
    float.position.set(3.1, -0.1, 0);
    boat.add(float);

    [-1.3, 1.3].forEach((z) => {
      const boom = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.12, 0.16), dark);
      boom.position.set(1.6, 0.45, z);
      boat.add(boom);
    });

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 7, 6), dark);
    mast.position.set(0, 3.9, 0.5);
    boat.add(mast);

    const cloth = new THREE.BufferGeometry();
    cloth.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.2, 0.9, 0, 6.6, 0.1, 0, 1.3, -3.9], 3));
    cloth.computeVertexNormals();
    sail.add(
      new THREE.Mesh(
        cloth,
        new THREE.MeshPhongMaterial({ color: 0xd8c7a3, emissive: 0x3a3020, side: THREE.DoubleSide, flatShading: true })
      )
    );
    sail.position.set(0, 0.5, 0.5);
    boat.add(sail);

    // A lantern at the bow — the boat carries its own small light
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), new THREE.MeshBasicMaterial({ color: BRASS_HOT }));
    lamp.position.set(0, 1.1, 3.6);
    boat.add(lamp);
    const lampGlow = makeGlow(BRASS_HOT, 5, 0.75);
    lampGlow.position.copy(lamp.position);
    boat.add(lampGlow);
    const lampLight = new THREE.PointLight(BRASS_HOT, 14, 46, 1.4);
    lampLight.position.set(0, 2.2, 2);
    boat.add(lampLight);
  }
  boat.scale.setScalar(1.3);
  scene.add(boat);

  /* ---------- wake: pale foam let go astern, spreading as it fades ---------- */

  const foam = [];
  for (let i = 0; i < 26; i++) {
    const puff = makeGlow(0xa9bdd4, 1, 0);
    puff.material.blending = THREE.NormalBlending;
    puff.material.fog = true;
    scene.add(puff);
    foam.push({ sprite: puff, life: 0 });
  }
  let wakeIndex = 0;
  let wakeClock = 0;

  function updateWake(dt, t, fx, fz) {
    wakeClock += dt * (state.speed / CRUISE);
    if (wakeClock > 0.11 && state.speed > 4) {
      wakeClock = 0;
      const puff = foam[wakeIndex++ % foam.length];
      puff.life = 1;
      const px = state.x - fx * 5.2;
      const pz = state.z - fz * 5.2;
      puff.sprite.position.set(px, swell(px, pz, t) + 0.25, pz);
    }
    foam.forEach((puff) => {
      if (puff.life <= 0) return;
      puff.life = Math.max(0, puff.life - dt * 0.55);
      puff.sprite.material.opacity = puff.life * puff.life * 0.2;
      puff.sprite.scale.setScalar(3 + (1 - puff.life) * 9);
    });
  }

  /* ---------- the network: brass arcs between lit beacons ---------- */

  const links = [];
  const ARC_POINTS = 64;

  function addLink(from, to) {
    const a = new THREE.Vector3(from.data.x, from.top, from.data.z);
    const b = new THREE.Vector3(to.data.x, to.top, to.data.z);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y += a.distanceTo(b) * 0.2;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(ARC_POINTS - 1));
    geometry.setDrawRange(0, 0);
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: BRASS_HOT, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    line.frustumCulled = false;
    scene.add(line);
    links.push({ line, geometry, drawn: 0 });
  }

  function clearLinks() {
    links.forEach(({ line, geometry }) => {
      scene.remove(line);
      geometry.dispose();
      line.material.dispose();
    });
    links.length = 0;
  }

  /* ---------- sound: a small chime, off unless asked for ---------- */

  let audio = null;
  let soundOn = false;

  function chime(notes) {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const now = audio.currentTime;
      notes.forEach((freq, i) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const at = now + i * 0.14;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.12, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.3);
        osc.connect(gain).connect(audio.destination);
        osc.start(at);
        osc.stop(at + 1.4);
      });
    } catch (err) {
      soundOn = false; // No audio on this device — carry on in silence
    }
  }

  /* ---------- state ---------- */

  const state = {
    mode: 'idle', // idle | playing | won
    x: 0,
    z: 0,
    heading: 0,
    speed: 0,
    roll: 0,
    turn: 0,
    elapsed: 0,
    clock: 0,
    lit: 0,
    lastLit: null,
    firstLit: null,
    shake: 0,
    wonAt: 0,
    fog: 0.0046,
  };

  const input = { left: false, right: false, up: false, down: false };
  let toastTimer = 0;
  let frame = 0;
  let last = 0;
  let inView = true;

  const cameraTarget = new THREE.Vector3();
  const cameraGoal = new THREE.Vector3();

  function reset() {
    state.x = 0;
    state.z = 0;
    state.heading = 0;
    state.speed = 0;
    state.roll = 0;
    state.turn = 0;
    state.elapsed = 0;
    state.lit = 0;
    state.lastLit = null;
    state.firstLit = null;
    state.shake = 0;
    state.fog = 0.0046;
    scene.fog.density = state.fog;
    input.left = input.right = input.up = input.down = false;

    beacons.forEach((b) => {
      b.lit = false;
      b.ignite = 0;
      b.lantern.material.color.setHex(0x4a515c);
      b.glow.material.opacity = 0;
      b.glow.scale.setScalar(1);
      b.column.material.color.setHex(0xb9c6dc);
      b.column.material.opacity = 0.07;
      b.light.intensity = 0;
    });
    clearLinks();
    foam.forEach((puff) => {
      puff.life = 0;
      puff.sprite.material.opacity = 0;
    });

    ui.count.textContent = '0 / ' + beacons.length;
    ui.time.textContent = '0:00';
    ui.end.hidden = true;
    ui.toast.classList.remove('is-visible');

    camera.position.set(0, 13, -27);
    cameraTarget.set(0, 2, 14);
  }

  function showToast(kicker, title, text, hold) {
    ui.toastKicker.textContent = kicker;
    ui.toastTitle.textContent = title;
    ui.toastText.textContent = text;
    ui.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('is-visible'), hold || 5200);
  }

  function lightBeacon(beacon) {
    beacon.lit = true;
    state.lit += 1;
    ui.count.textContent = state.lit + ' / ' + beacons.length;

    if (state.lastLit) addLink(state.lastLit, beacon);
    else state.firstLit = beacon;
    state.lastLit = beacon;

    showToast('Beacon ' + state.lit + ' of ' + beacons.length + ' lit', beacon.data.title, beacon.data.text);
    chime([587.33, 880]);

    if (state.lit === beacons.length) {
      // The last light joins the first — the ring is closed
      addLink(beacon, state.firstLit);
      win();
    }
  }

  function win() {
    state.mode = 'won';
    state.wonAt = state.clock;
    root.dataset.state = 'won';

    const time = formatTime(state.elapsed);
    let best = null;
    try {
      best = parseFloat(localStorage.getItem(BEST_KEY));
      if (!best || state.elapsed < best) localStorage.setItem(BEST_KEY, String(state.elapsed));
    } catch (err) {
      best = null; // Storage unavailable — the time is still shown
    }

    ui.final.textContent = time;
    ui.best.textContent =
      best && state.elapsed >= best ? ' (best: ' + formatTime(best) + ')' : best ? ' — a new best' : '';
    ui.signal.href =
      'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent('All six beacons lit — ' + time) +
      '&body=' + encodeURIComponent('The crossing is made, in ' + time + '.\n\n');

    chime([587.33, 739.99, 880, 1174.66]);
    document.dispatchEvent(new CustomEvent('crossing:complete', { detail: { time } }));

    setTimeout(() => {
      if (state.mode !== 'won') return;
      ui.toast.classList.remove('is-visible');
      ui.end.hidden = false;
      ui.signal.focus({ preventScroll: true });
    }, 4200);
  }

  /* ---------- simulation ---------- */

  function step(dt) {
    state.clock += dt;
    const t = state.clock;

    if (state.mode === 'playing') {
      state.elapsed += dt;

      // Steering — screen-left is a positive turn about the vertical
      const want = (input.left ? 1 : 0) - (input.right ? 1 : 0);
      state.turn = lerp(state.turn, want, 1 - Math.exp(-dt * 6));
      state.heading += state.turn * TURN_RATE * dt * (0.55 + 0.45 * (state.speed / CRUISE));

      const targetSpeed = input.up ? TRIMMED : input.down ? EASED : CRUISE;
      state.speed = lerp(state.speed, targetSpeed, 1 - Math.exp(-dt * 1.4));

      state.x += Math.sin(state.heading) * state.speed * dt;
      state.z += Math.cos(state.heading) * state.speed * dt;

      // Shores and reefs push the hull back out and knock the way off her
      const collide = (cx, cz, radius) => {
        const dx = state.x - cx;
        const dz = state.z - cz;
        const d = Math.hypot(dx, dz);
        if (d >= radius || d === 0) return;
        state.x = cx + (dx / d) * radius;
        state.z = cz + (dz / d) * radius;
        if (state.speed > 9) state.shake = Math.max(state.shake, 0.5);
        state.speed *= Math.pow(0.02, dt);
      };
      beacons.forEach((b) => collide(b.data.x, b.data.z, b.data.r * 0.94 + 2));
      rocks.forEach((k) => collide(k.x, k.z, k.r + 1.9));

      // The current at the edge of the chart turns the boat for home
      const out = Math.hypot(state.x, state.z);
      if (out > WORLD_LIMIT) {
        const home = Math.atan2(-state.x, -state.z);
        state.heading += angleDelta(state.heading, home) * Math.min(1, dt * 2.2);
        if (out > WORLD_LIMIT + 26) {
          state.x *= (WORLD_LIMIT + 26) / out;
          state.z *= (WORLD_LIMIT + 26) / out;
        }
        if (!ui.toast.classList.contains('is-visible')) {
          showToast('Edge of the chart', 'The current turns the boat', 'The islands lie behind.', 2600);
        }
      }

      // Beacons catch when the boat passes close under them
      let nearest = null;
      let nearestDist = Infinity;
      beacons.forEach((b) => {
        if (b.lit) return;
        const d = Math.hypot(state.x - b.data.x, state.z - b.data.z);
        if (d < b.data.r + LIGHT_RANGE) {
          lightBeacon(b);
          return;
        }
        if (d < nearestDist) {
          nearestDist = d;
          nearest = b;
        }
      });

      // Bearing to the nearest dark island, relative to the bow
      if (nearest && state.mode === 'playing') {
        const bearing = Math.atan2(nearest.data.x - state.x, nearest.data.z - state.z);
        const relative = angleDelta(state.heading, bearing);
        ui.arrow.style.transform = 'rotate(' + (-relative * 180 / Math.PI).toFixed(1) + 'deg)';
        ui.dist.textContent = Math.max(0, Math.round(nearestDist - nearest.data.r - LIGHT_RANGE)) + ' m';
      }
      ui.time.textContent = formatTime(state.elapsed);
    } else if (state.mode === 'won') {
      // Way falls off; the boat idles in a slow curve
      state.speed = lerp(state.speed, 4, 1 - Math.exp(-dt * 0.8));
      state.turn = lerp(state.turn, 0.25, 1 - Math.exp(-dt));
      state.heading += state.turn * 0.25 * dt;
      state.x += Math.sin(state.heading) * state.speed * dt;
      state.z += Math.cos(state.heading) * state.speed * dt;
    }

    /* ----- boat: ride the swell, lean into the turn ----- */
    const fx = Math.sin(state.heading);
    const fz = Math.cos(state.heading);
    const here = swell(state.x, state.z, t);
    const ahead = swell(state.x + fx * 4, state.z + fz * 4, t);
    const astern = swell(state.x - fx * 4, state.z - fz * 4, t);
    state.roll = lerp(state.roll, -state.turn * 0.3 * (state.speed / CRUISE), 1 - Math.exp(-dt * 4));
    boat.position.set(state.x, here * 0.55 + 0.35, state.z);
    boat.rotation.set(Math.atan2(astern - ahead, 8) * 0.7, state.heading, state.roll + Math.sin(t * 1.3) * 0.03);
    sail.rotation.y = lerp(sail.rotation.y, state.turn * 0.45 + Math.sin(t * 0.8) * 0.05, 1 - Math.exp(-dt * 3));
    updateWake(dt, t, fx, fz);

    /* ----- beacons: ignite, then breathe ----- */
    beacons.forEach((b, i) => {
      if (!b.lit) return;
      b.ignite = Math.min(1, b.ignite + dt * 1.4);
      const e = 1 - Math.pow(1 - b.ignite, 3);
      const breathe = 1 + Math.sin(t * 2.1 + i * 1.7) * 0.08;
      b.lantern.material.color.setHex(BRASS_HOT);
      b.glow.material.opacity = 0.95 * e;
      b.glow.scale.setScalar((6 + 30 * e) * breathe);
      b.column.material.color.setHex(BRASS);
      b.column.material.opacity = lerp(0.07, 0.34, e) * breathe;
      b.light.intensity = 90 * e * breathe;
    });

    /* ----- links draw themselves from one light to the next ----- */
    links.forEach((link) => {
      if (link.drawn >= ARC_POINTS) return;
      link.drawn = Math.min(ARC_POINTS, link.drawn + dt * 46);
      link.geometry.setDrawRange(0, Math.floor(link.drawn));
    });

    /* ----- camera ----- */
    if (state.mode === 'won') {
      // Rise and circle, so the whole network can be seen at once
      const k = clamp((t - state.wonAt) / 5, 0, 1);
      const e = k * k * (3 - 2 * k);
      const orbit = (t - state.wonAt) * 0.07 + state.heading + Math.PI;
      cameraGoal.set(Math.sin(orbit) * 400, 250, Math.cos(orbit) * 400);
      camera.position.lerp(cameraGoal, 1 - Math.exp(-dt * (0.4 + e * 1.2)));
      cameraTarget.lerp(new THREE.Vector3(0, 10, 0), 1 - Math.exp(-dt * 1.2));
      state.fog = lerp(state.fog, 0.0011, 1 - Math.exp(-dt * 0.9));
      scene.fog.density = state.fog;
    } else {
      const back = 23 + state.speed * 0.12;
      cameraGoal.set(state.x - fx * back, 10.5 + state.speed * 0.05, state.z - fz * back);
      camera.position.lerp(cameraGoal, 1 - Math.exp(-dt * 3.2));
      cameraTarget.lerp(new THREE.Vector3(state.x + fx * 16, 2.5, state.z + fz * 16), 1 - Math.exp(-dt * 5));
    }

    if (state.shake > 0.001) {
      camera.position.x += (Math.random() - 0.5) * state.shake;
      camera.position.y += (Math.random() - 0.5) * state.shake;
      state.shake *= Math.pow(0.004, dt);
    }
    camera.lookAt(cameraTarget);

    sky.position.copy(camera.position);
    updateSea(state.mode === 'won' ? 0 : state.x, state.mode === 'won' ? 0 : state.z, t);
  }

  function loop(now) {
    frame = 0;
    if (state.mode === 'idle' || !inView || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    step(dt);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  }

  function wake() {
    if (frame || state.mode === 'idle') return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }

  /* ---------- sizing ---------- */

  function resize() {
    const width = root.clientWidth;
    const height = root.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // A touch wider on tall phone screens, so the bow stays in view
    camera.fov = camera.aspect < 1 ? 70 : 58;
    camera.updateProjectionMatrix();
    if (state.mode !== 'idle') renderer.render(scene, camera);
  }

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(root);
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', resize);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) wake();
    }, { threshold: 0.2 }).observe(root);
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wake();
  });

  /* ---------- input ---------- */

  const KEYS = {
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
  };

  // The helm only takes the keys while the sea is on screen and nothing
  // else — a text field, say — is being typed into
  const helmActive = () => {
    if (state.mode !== 'playing' || !inView) return false;
    const el = document.activeElement;
    return !(el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  };

  window.addEventListener('keydown', (event) => {
    const action = KEYS[event.key];
    if (!action || !helmActive() || event.metaKey || event.ctrlKey || event.altKey) return;
    input[action] = true;
    event.preventDefault(); // Arrow keys steer; they must not scroll the page
  });
  window.addEventListener('keyup', (event) => {
    const action = KEYS[event.key];
    if (action) input[action] = false;
  });
  window.addEventListener('blur', () => {
    input.left = input.right = input.up = input.down = false;
  });

  // Touch: hold either side of the sea, or the round buttons, to steer
  const held = new Map();
  const applyHeld = () => {
    const sides = Array.from(held.values());
    input.left = sides.includes('left');
    input.right = sides.includes('right');
  };
  const press = (event, side) => {
    if (state.mode !== 'playing') return;
    held.set(event.pointerId, side);
    applyHeld();
    event.preventDefault();
  };
  const release = (event) => {
    if (!held.delete(event.pointerId)) return;
    applyHeld();
  };

  canvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    press(event, event.clientX - rect.left < rect.width / 2 ? 'left' : 'right');
  });
  root.querySelectorAll('.game__touch-btn').forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      button.classList.add('is-held');
      press(event, button.dataset.steer);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
      button.addEventListener(type, () => button.classList.remove('is-held'));
    });
  });
  ['pointerup', 'pointercancel'].forEach((type) => window.addEventListener(type, release));

  /* ---------- controls ---------- */

  function start() {
    reset();
    state.mode = 'playing';
    root.dataset.state = 'playing';
    resize();
    showToast('Under way', 'Six islands lie dark', 'Follow the arrow to the nearest. Pass close under its beacon to light it.', 6000);
    canvas.focus({ preventScroll: true });
    wake();
  }

  function stop() {
    state.mode = 'idle';
    root.dataset.state = 'idle';
    ui.end.hidden = true;
    ui.toast.classList.remove('is-visible');
    if (document.fullscreenElement === root && document.exitFullscreen) document.exitFullscreen();
  }

  canvas.tabIndex = 0;

  ui.again.addEventListener('click', start);
  ui.quit.addEventListener('click', stop);

  ui.sound.addEventListener('click', () => {
    soundOn = !soundOn;
    ui.sound.setAttribute('aria-pressed', String(soundOn));
    ui.sound.textContent = soundOn ? 'Sound on' : 'Sound off';
    if (soundOn) chime([880]);
  });

  if (root.requestFullscreen) {
    ui.full.addEventListener('click', () => {
      if (document.fullscreenElement === root) document.exitFullscreen();
      else root.requestFullscreen().catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      ui.full.textContent = document.fullscreenElement === root ? 'Exit full screen' : 'Full screen';
    });
  } else {
    ui.full.hidden = true; // iPhone Safari has no element fullscreen
  }

  return { start, stop };
}
