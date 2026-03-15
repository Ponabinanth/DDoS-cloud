// Custom cursor: blockchain icon with a rocket-exhaust style trail.
// Enabled only for fine pointers (desktop mouse/trackpad).
(() => {
  const supportsFinePointer = window.matchMedia?.('(pointer: fine)')?.matches && window.matchMedia?.('(hover: hover)')?.matches;
  if (!supportsFinePointer) return;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const CURSOR_SIZE = 34;
  const HOTSPOT_X = Math.round(CURSOR_SIZE * 0.5);
  const HOTSPOT_Y = Math.round(CURSOR_SIZE * 0.5);

  const root = document.documentElement;
  root.classList.add('pen-cursor');
  const rootStyles = window.getComputedStyle(root);
  const exhaustHotRgb = rootStyles.getPropertyValue('--exhaust-hot-rgb').trim() || '255, 210, 90';
  const exhaustYellowRgb = rootStyles.getPropertyValue('--exhaust-yellow-rgb').trim() || '184, 134, 11';

  const pen = document.createElement('div');
  pen.id = 'cursor-pen';
  pen.setAttribute('aria-hidden', 'true');
  pen.innerHTML = `
    <svg class="cursor-chain-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="scCursorGrad" x1="0" y1="0" x2="1" y2="1">
          <stop class="cursor-grad-stop cursor-grad-stop--red" offset="0"></stop>
          <stop class="cursor-grad-stop cursor-grad-stop--blue" offset="1"></stop>
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#scCursorGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.95">
        <rect x="10" y="10" width="18" height="18" rx="4"></rect>
        <rect x="36" y="10" width="18" height="18" rx="4"></rect>
        <rect x="23" y="36" width="18" height="18" rx="4"></rect>
        <path d="M28 19h8"></path>
        <path d="M19 28v8"></path>
        <path d="M45 28l-8 8"></path>
      </g>
      <g fill="url(#scCursorGrad)" opacity="0.9">
        <circle cx="19" cy="19" r="2.4"></circle>
        <circle cx="45" cy="19" r="2.4"></circle>
        <circle cx="32" cy="45" r="2.4"></circle>
      </g>
    </svg>
  `;

  const trail = document.createElement('div');
  trail.id = 'cursor-ink-trail';
  trail.setAttribute('aria-hidden', 'true');

  const dots = [];
  const dotCount = reduceMotion ? 0 : 20;
  const dotSeeds = [];
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'ink-dot';
    const t = dotCount === 1 ? 0 : i / (dotCount - 1);
    const heat = Math.max(0, 1 - t * 1.15);
    const smoke = Math.min(1, t * 1.05);
    dot.style.opacity = String(Math.max(0, 0.9 - i * 0.035));
    dot.style.transform = `translate(-50%, -50%) scale(${0.45 + t * 1.05})`;
    dot.style.filter = `blur(${0.25 + t * 2.25}px)`;
    dot.style.background = `radial-gradient(circle at 38% 38%,
      rgba(255,255,255,${0.18 * heat}) 0%,
      rgba(${exhaustHotRgb},${0.7 * heat}) 38%,
      rgba(${exhaustYellowRgb},${0.55 * heat}) 64%,
      rgba(${exhaustYellowRgb},${0.22 * smoke}) 82%,
      rgba(${exhaustYellowRgb},0) 100%)`;
    dot.style.boxShadow = `0 0 ${Math.round(10 + t * 16)}px rgba(${exhaustYellowRgb},${0.2 * heat + 0.04})`;
    trail.appendChild(dot);
    dots.push(dot);
    dotSeeds.push((Math.random() * 2 - 1) * 0.9);
  }

  document.body.appendChild(trail);
  document.body.appendChild(pen);

  let targetX = Math.round(window.innerWidth * 0.5);
  let targetY = Math.round(window.innerHeight * 0.5);
  let x = targetX;
  let y = targetY;
  let lastX = x;
  let lastY = y;
  let angle = 0;
  let visible = false;

  const history = [];
  const historyLen = Math.max(12, dotCount * 2);
  for (let i = 0; i < historyLen; i++) history.push({ x, y });

  const showPen = () => {
    if (visible) return;
    visible = true;
    pen.classList.add('visible');
    trail.classList.add('visible');
  };

  const hidePen = () => {
    visible = false;
    pen.classList.remove('visible');
    trail.classList.remove('visible');
  };

  const onMove = (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    showPen();
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseleave', hidePen, { passive: true });

  const step = () => {
    // Smooth follow for a "glide" feel.
    x += (targetX - x) * 0.6;
    y += (targetY - y) * 0.6;

    const vx = x - lastX;
    const vy = y - lastY;
    const speed = Math.hypot(vx, vy);
    if (speed > 0.05) {
      angle = Math.atan2(vy, vx);
    }
    lastX = x;
    lastY = y;

    // Position cursor icon around the mouse point.
    pen.style.left = `${Math.round(x - HOTSPOT_X)}px`;
    pen.style.top = `${Math.round(y - HOTSPOT_Y)}px`;
    pen.style.transform = `rotate(${angle}rad)`;

    if (dotCount) {
      history.unshift({ x, y });
      history.length = historyLen;

      const inv = speed > 0.001 ? 1 / speed : 0;
      const dirX = vx * inv;
      const dirY = vy * inv;
      const backX = -dirX;
      const backY = -dirY;
      const perpX = -dirY;
      const perpY = dirX;
      const plume = Math.min(26, speed * 1.25);

      for (let i = 0; i < dots.length; i++) {
        const p = history[Math.min(history.length - 1, i * 2 + 1)];
        const dot = dots[i];
        const t = dots.length === 1 ? 0 : i / (dots.length - 1);
        const spread = plume * t;
        const along = Math.min(18, speed * 0.55) * t;
        const ox = perpX * dotSeeds[i] * spread + backX * along;
        const oy = perpY * dotSeeds[i] * spread + backY * along;
        dot.style.left = `${Math.round(p.x + ox)}px`;
        dot.style.top = `${Math.round(p.y + oy)}px`;
      }
    }

    window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
})();
