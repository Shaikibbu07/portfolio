(function(){
'use strict';
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ═══════════ PRELOADER ═══════════ */
const preloader = document.getElementById('preloader');
const plName = document.getElementById('pl-name');
const plLine = document.getElementById('pl-line');
const plPct = document.getElementById('pl-pct');

// Build name letters
'SHAIK IBRAHEEM'.split('').forEach((ch, i) => {
  const s = document.createElement('span');
  s.textContent = ch === ' ' ? '\u00A0' : ch;
  s.style.transitionDelay = (i * 0.05) + 's';
  plName.appendChild(s);
});

let pct = 0;
function tickPreloader() {
  pct += Math.floor(Math.random()*12) + 5;
  if (pct > 100) pct = 100;
  plPct.textContent = (pct < 10 ? '0' : '') + pct + '%';
  if (pct < 100) {
    setTimeout(tickPreloader, 60);
  } else {
    setTimeout(() => {
      preloader.classList.add('done');
      startIntro();
    }, 300);
  }
}
// Kick off
setTimeout(() => {
  plName.querySelectorAll('span').forEach(s => s.classList.add('show'));
  setTimeout(() => plLine.classList.add('go'), 300);
  setTimeout(tickPreloader, 500);
}, 200);

/* ═══════════ INTRO SEQUENCE ═══════════ */
function startIntro() {
  document.getElementById('nav').classList.add('show');
  document.getElementById('status').classList.add('show');
  document.getElementById('scroll-cue').classList.add('show');
  // Reveal hero name
  document.querySelectorAll('.hero-name .line span').forEach((s, i) => {
    setTimeout(() => s.classList.add('show'), i * 120);
  });
  // Start typewriter
  setTimeout(startTypewriter, 800);
}

/* ═══════════ TIME GREETING ═══════════ */
const h = new Date().getHours();
document.getElementById('hero-greeting').textContent =
  (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', welcome.';

/* ═══════════ TYPEWRITER ═══════════ */
const phrases = [
  'Building scalable backend systems.',
  'Developing REST APIs with Spring Boot.',
  'Solving DSA problems every day.',
  'Learning. Building. Improving.',
  'Future Software Engineer.'
];
let pi = 0, ci = 0, deleting = false;
const twEl = document.getElementById('typewriter');
function startTypewriter() { typeStep(); }
function typeStep() {
  const phrase = phrases[pi];
  if (deleting) {
    ci--;
    twEl.textContent = phrase.substring(0, ci);
  } else {
    ci++;
    twEl.textContent = phrase.substring(0, ci);
  }
  let speed = deleting ? 40 : 80;
  if (!deleting && ci === phrase.length) { speed = 2200; deleting = true; }
  else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; speed = 400; }
  setTimeout(typeStep, speed);
}

/* ═══════════ THREE.JS SCENE ═══════════ */
const canvasWrap = document.getElementById('canvas-wrap');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.006);
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 500);
camera.position.set(0, 0, 80);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
canvasWrap.appendChild(renderer.domElement);

// Particles
const pCount = innerWidth < 768 ? 800 : 2500;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(pCount * 3);
const pCol = new Float32Array(pCount * 3);
const accentC = new THREE.Color('#ff4d2e');
const accent2C = new THREE.Color('#7cffb2');
const whiteC = new THREE.Color('#ffffff');
for (let i = 0; i < pCount * 3; i += 3) {
  pPos[i]   = (Math.random() - 0.5) * 120;
  pPos[i+1] = (Math.random() - 0.5) * 120;
  pPos[i+2] = (Math.random() - 0.5) * 300 - 50;
  const r = Math.random();
  const c = r > 0.95 ? accentC : r > 0.9 ? accent2C : whiteC;
  pCol[i] = c.r; pCol[i+1] = c.g; pCol[i+2] = c.b;
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const pMat = new THREE.PointsMaterial({
  size: 0.12, vertexColors: true, transparent: true,
  opacity: 0.7, blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Wireframe shapes
const shapes = [];
const geos = [
  new THREE.IcosahedronGeometry(2.5, 0),
  new THREE.TorusGeometry(2, 0.6, 6, 16),
  new THREE.OctahedronGeometry(2, 0),
  new THREE.TetrahedronGeometry(2.5, 0),
  new THREE.IcosahedronGeometry(1.5, 1)
];
const sColors = [0xff4d2e, 0x7cffb2, 0x6366f1, 0xffffff, 0xff4d2e];
for (let i = 0; i < 7; i++) {
  const mat = new THREE.MeshBasicMaterial({
    color: sColors[i % sColors.length], wireframe: true,
    transparent: true, opacity: 0.06 + Math.random() * 0.06
  });
  const mesh = new THREE.Mesh(geos[i % geos.length], mat);
  mesh.position.set(
    (Math.random()-0.5)*50,
    (Math.random()-0.5)*40,
    -Math.random()*180 - 20
  );
  mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
  const s = 0.8 + Math.random();
  mesh.scale.setScalar(s);
  shapes.push({
    mesh,
    rx: (Math.random()-0.5)*0.003,
    ry: (Math.random()-0.5)*0.005
  });
  scene.add(mesh);
}

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ═══════════ CUSTOM SMOOTH SCROLL ═══════════ */
let scrollTarget = 0, scrollCurrent = 0;
const EASE = 0.065;
const camStart = 80, camTravel = 200;

window.addEventListener('scroll', () => { scrollTarget = scrollY; }, { passive: true });

/* ═══════════ CURSOR ═══════════ */
let mx = innerWidth/2, my = innerHeight/2;
let rx = mx, ry = my;
const trails = [document.getElementById('ct0'), document.getElementById('ct1'), document.getElementById('ct2')];
const tPos = trails.map(() => ({x: mx, y: my}));
const dot = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
const label = document.getElementById('cur-label');

if (!isTouch) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('active');
      label.textContent = el.getAttribute('data-cursor');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
      label.textContent = '';
    });
  });
}

/* ═══════════ MOUSE FOR CAMERA ═══════════ */
let camMX = 0, camMY = 0, camTX = 0, camTY = 0;
if (!isTouch) {
  window.addEventListener('mousemove', e => {
    camTX = (e.clientX / innerWidth - 0.5) * 2;
    camTY = (e.clientY / innerHeight - 0.5) * 2;
  });
}

/* ═══════════ SECTION CONFIG ═══════════ */
const SECTIONS = {
  hero:       { el: document.getElementById('layer-hero'),       range: [0, 0.12], label: 'HERO' },
  marquee:    { el: document.getElementById('layer-marquee'),    range: [0.10, 0.18], label: 'TECH' },
  about:      { el: document.getElementById('layer-about'),      range: [0.16, 0.30], label: 'ABOUT' },
  skills:     { el: document.getElementById('layer-skills'),     range: [0.28, 0.42], label: 'SKILLS' },
  projects:   { el: document.getElementById('layer-projects'),   range: [0.40, 0.68], label: 'WORK' },
  experience: { el: document.getElementById('layer-experience'), range: [0.66, 0.82], label: 'EXPERIENCE' },
  contact:    { el: document.getElementById('layer-contact'),    range: [0.80, 1.00], label: 'CONTACT' }
};

const scrollBar = document.getElementById('scroll-bar');
const statusSec = document.getElementById('status-section');
const statusPct = document.getElementById('status-pct');
const scrollCue = document.getElementById('scroll-cue');
const nav = document.getElementById('nav');
let statsAnimated = false, skillsAnimated = false;

/* ═══════════ ANIMATION LOOP ═══════════ */
function frame() {
  requestAnimationFrame(frame);

  // Smooth scroll
  scrollCurrent += (scrollTarget - scrollCurrent) * EASE;
  const maxScroll = document.body.scrollHeight - innerHeight;
  const progress = maxScroll > 0 ? Math.max(0, Math.min(1, scrollCurrent / maxScroll)) : 0;

  // Camera
  camMX += (camTX - camMX) * 0.04;
  camMY += (camTY - camMY) * 0.04;
  camera.position.z = camStart - progress * camTravel;
  camera.position.x = camMX * 3;
  camera.position.y = -camMY * 2;
  camera.rotation.z = camMX * 0.03;

  // Particles slow drift
  particles.rotation.y += 0.0003;

  // Wireframes spin
  shapes.forEach(s => { s.mesh.rotation.x += s.rx; s.mesh.rotation.y += s.ry; });

  // Cursor ring lerp
  if (!isTouch) {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    // Trails
    tPos[0].x += (mx - tPos[0].x) * 0.2;
    tPos[0].y += (my - tPos[0].y) * 0.2;
    trails[0].style.left = tPos[0].x + 'px'; trails[0].style.top = tPos[0].y + 'px';
    for (let i = 1; i < tPos.length; i++) {
      tPos[i].x += (tPos[i-1].x - tPos[i].x) * 0.2;
      tPos[i].y += (tPos[i-1].y - tPos[i].y) * 0.2;
      trails[i].style.left = tPos[i].x + 'px'; trails[i].style.top = tPos[i].y + 'px';
    }
  }

  // UI updates
  scrollBar.style.width = (progress * 100) + '%';
  statusPct.textContent = (progress * 100).toFixed(1) + '%';
  nav.classList.toggle('scrolled', progress > 0.05);
  scrollCue.style.opacity = Math.max(0, 1 - progress * 12);

  // Update sections
  let activeLabel = 'HERO';
  for (const key in SECTIONS) {
    const sec = SECTIONS[key];
    const [start, end] = sec.range;
    if (progress >= start - 0.02 && progress <= end + 0.02) {
      const lp = Math.max(0, Math.min(1, (progress - start) / (end - start)));
      const fadeIn = Math.min(lp / 0.2, 1);
      const fadeOut = Math.min((1 - lp) / 0.2, 1);
      let opacity = Math.min(fadeIn, fadeOut);

      let transform = '';
      if (key === 'hero') {
        opacity = 1 - lp * 1.5;
        transform = `scale(${1 - lp*0.08}) translateY(${lp*60}px)`;
        if (opacity < 0) opacity = 0;
      } else if (key === 'marquee') {
        transform = `scale(${0.92 + opacity*0.08})`;
      } else if (key === 'projects') {
        const projP = Math.max(0, Math.min(1, (lp - 0.05) / 0.9));
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, i) => {
          const targetP = i / (cards.length - 1);
          const dist = projP - targetP;
          if (Math.abs(dist) < 0.35) {
            const cOpacity = 1 - Math.abs(dist) * 3;
            card.style.opacity = Math.max(0, cOpacity);
            card.style.transform = `translateY(${dist * 120}vh) scale(${1 - Math.abs(dist)*0.15})`;
            card.style.pointerEvents = Math.abs(dist) < 0.12 ? 'auto' : 'none';
          } else {
            card.style.opacity = 0;
            card.style.pointerEvents = 'none';
          }
        });
      } else if (key === 'about') {
        transform = `translateY(${(1-fadeIn)*40}px)`;
        if (fadeIn > 0.5 && !statsAnimated) {
          statsAnimated = true;
          document.querySelectorAll('.counter').forEach(el => {
            const target = +el.dataset.target;
            animateCounter(el, target);
          });
        }
      } else if (key === 'skills') {
        if (fadeIn > 0.5 && !skillsAnimated) {
          skillsAnimated = true;
          document.querySelectorAll('.skill-fill').forEach((bar, i) => {
            setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, i * 50);
          });
        }
      } else if (key === 'experience') {
        const items = sec.el.querySelectorAll('.timeline-item');
        items.forEach((item, i) => {
          if (lp > 0.15 + i * 0.12) item.classList.add('show');
        });
      } else if (key === 'contact') {
        transform = `translateY(${(1-fadeIn)*60}px)`;
      }

      sec.el.style.opacity = opacity;
      sec.el.style.transform = transform;
      sec.el.style.pointerEvents = opacity > 0.3 ? 'auto' : 'none';

      if (lp > 0.1 && lp < 0.9) activeLabel = sec.label;
    } else {
      sec.el.style.opacity = 0;
      sec.el.style.pointerEvents = 'none';
    }
  }
  statusSec.textContent = activeLabel;

  // Nav active link
  document.querySelectorAll('.nav-links a').forEach(a => {
    const s = a.dataset.section;
    a.classList.toggle('active', SECTIONS[s] && activeLabel === SECTIONS[s].label);
  });

  renderer.render(scene, camera);
}
if (!reduced) frame();
else {
  Object.values(SECTIONS).forEach(s => { s.el.style.opacity = 1; s.el.style.pointerEvents = 'auto'; });
  renderer.render(scene, camera);
}

function animateCounter(el, target) {
  const dur = 1800;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

/* ═══════════ NAV CLICKS ═══════════ */
document.querySelectorAll('[data-section]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    const key = el.dataset.section;
    if (SECTIONS[key]) {
      const maxScroll = document.body.scrollHeight - innerHeight;
      const [start, end] = SECTIONS[key].range;
      const target = (start + (end-start)*0.3) * maxScroll;
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  });
});

/* ═══════════ THEME TOGGLE ═══════════ */
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
  const isLight = document.documentElement.classList.toggle('light');
  themeBtn.textContent = isLight ? '☾' : '☀';
  scene.fog.color.setHex(isLight ? 0xf5f5f0 : 0x000000);
  pMat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
  showToast(isLight ? 'Light mode' : 'Dark mode');
});

/* ═══════════ COMMAND PALETTE ═══════════ */
const cmdEl = document.getElementById('cmd');
const cmdInput = document.getElementById('cmd-input');
const cmdList = document.getElementById('cmd-list');
const commands = [
  { label: 'Go to About', key: '↵', action: () => navTo('about') },
  { label: 'Go to Skills', key: '↵', action: () => navTo('skills') },
  { label: 'Go to Projects', key: '↵', action: () => navTo('projects') },
  { label: 'Go to Experience', key: '↵', action: () => navTo('experience') },
  { label: 'Go to Contact', key: '↵', action: () => navTo('contact') },

  { label: 'Download Resume', key: '↓', action: () => window.open('resume.pdf', '_blank') },

  { label: 'Open GitHub', key: '↗', action: () => window.open('https://github.com/Shaikibbu07', '_blank') },

  { label: 'Open LinkedIn', key: '↗', action: () => window.open('https://www.linkedin.com/in/ibraheem-shaik-914930317/', '_blank') },

  // Replace with your actual LeetCode profile
  { label: 'Open LeetCode', key: '↗', action: () => window.open('https://leetcode.com/', '_blank') },

  { label: 'Send Email', key: '✉', action: () => window.location.href = 'mailto:shaikibbu548@gmail.com' },

  { label: 'Toggle Theme', key: '↵', action: () => themeBtn.click() },

  { label: 'Back to Top', key: '↑', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
];
let cmdSel = 0;

function navTo(key) {
  if (SECTIONS[key]) {
    const maxScroll = document.body.scrollHeight - innerHeight;
    const [start, end] = SECTIONS[key].range;
    window.scrollTo({ top: (start + (end-start)*0.3) * maxScroll, behavior: 'smooth' });
  }
}

function renderCmds(filter) {
  const q = (filter || '').toLowerCase();
  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(q));
  cmdList.innerHTML = '';
  filtered.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'cmd-item' + (i === 0 ? ' sel' : '');
    div.innerHTML = `<span>${c.label}</span><span class="key">${c.key}</span>`;
    div.addEventListener('click', () => { c.action(); toggleCmd(); });
    div.addEventListener('mouseenter', () => {
      cmdList.querySelectorAll('.cmd-item').forEach(x => x.classList.remove('sel'));
      div.classList.add('sel');
      cmdSel = i;
    });
    cmdList.appendChild(div);
  });
  cmdSel = 0;
}

function toggleCmd() {
  const open = cmdEl.classList.toggle('open');
  if (open) { cmdInput.value = ''; renderCmds(''); setTimeout(() => cmdInput.focus(), 100); }
}

document.getElementById('cmd-btn').addEventListener('click', toggleCmd);
cmdEl.addEventListener('click', e => { if (e.target === cmdEl) toggleCmd(); });
cmdInput.addEventListener('input', e => renderCmds(e.target.value));

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleCmd(); }
  if (!cmdEl.classList.contains('open')) return;
  if (e.key === 'Escape') toggleCmd();
  const items = cmdList.querySelectorAll('.cmd-item');
  if (e.key === 'ArrowDown') { e.preventDefault(); cmdSel = (cmdSel+1) % items.length; items.forEach((x,i) => x.classList.toggle('sel', i===cmdSel)); }
  if (e.key === 'ArrowUp') { e.preventDefault(); cmdSel = (cmdSel-1+items.length) % items.length; items.forEach((x,i) => x.classList.toggle('sel', i===cmdSel)); }
  if (e.key === 'Enter') {
    e.preventDefault();
    const q = cmdInput.value.toLowerCase();
    const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    if (filtered[cmdSel]) { filtered[cmdSel].action(); toggleCmd(); }
  }
});

/* ═══════════ CONTACT FORM ═══════════ */
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  showToast('Message sent ✓');
  e.target.reset();
});

/* ═══════════ TOAST ═══════════ */
function showToast(msg) {
  const area = document.getElementById('toast-area');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  area.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

/* ═══════════ KONAMI CODE ═══════════ */
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let ki = 0;
document.addEventListener('keydown', e => {
  if (e.key === konami[ki]) { ki++; if (ki === konami.length) { ki=0; activateMatrix(); } }
  else ki = 0;
});

function activateMatrix() {
  showToast('🟢 Matrix Mode Activated');
  document.documentElement.style.setProperty('--accent','#0f0');
  document.documentElement.style.setProperty('--accent2','#0a0');
  setTimeout(() => {
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--accent2');
    showToast('Matrix Mode ended');
  }, 8000);
}

})();
