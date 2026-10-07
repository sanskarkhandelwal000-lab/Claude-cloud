// DANDIYAARA visual kit — shared SVG ornaments for every format.
// Seeded random so every export renders identically.
Math.random = (() => { let s = 1710; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const NS = 'http://www.w3.org/2000/svg';
const C = {
  ink: '#0a0611', plum: '#2a0a26', wine: '#5c0f35', magenta: '#ff2d7a', rani: '#e0157a',
  marigold: '#ffb72b', saffron: '#ff7a1a', gold1: '#fff1c1', gold2: '#f2c66d', gold3: '#c08a2c',
  gold4: '#7a4d12', peacock: '#0fb8a6', emerald: '#14855c', mirror: '#e9f1ff'
};

function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

// Shared <defs>: gold gradients, mirror, grain.
function defs(svg) {
  const d = el('defs', {}, svg);
  d.innerHTML = `
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.gold1}"/><stop offset=".35" stop-color="${C.gold2}"/>
    <stop offset=".55" stop-color="${C.gold3}"/><stop offset=".75" stop-color="${C.gold2}"/>
    <stop offset="1" stop-color="${C.gold4}"/></linearGradient>
  <linearGradient id="goldH" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.gold4}" stop-opacity="0"/><stop offset=".2" stop-color="${C.gold3}"/>
    <stop offset=".5" stop-color="${C.gold1}"/><stop offset=".8" stop-color="${C.gold3}"/>
    <stop offset="1" stop-color="${C.gold4}" stop-opacity="0"/></linearGradient>
  <radialGradient id="mirror" cx=".35" cy=".3" r=".8">
    <stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${C.mirror}"/>
    <stop offset=".7" stop-color="#8a96b8"/><stop offset="1" stop-color="#3b3f5c"/></radialGradient>
  <radialGradient id="moonGlow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.marigold}" stop-opacity=".55"/>
    <stop offset=".45" stop-color="${C.saffron}" stop-opacity=".18"/>
    <stop offset="1" stop-color="${C.saffron}" stop-opacity="0"/></radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  return d;
}

// One dandiya stick: lacquered wood with wrapped colour bands + ghungroo bell at the tip.
function stick(g, len, w, palette, bell = true) {
  const s = el('g', {}, g);
  el('rect', { x: -w / 2, y: 0, width: w, height: len, rx: w / 2, fill: '#3a1608' }, s);
  const bands = palette.length;
  for (let i = 0; i < bands; i++) {
    const h = len / bands;
    el('rect', { x: -w / 2, y: i * h, width: w, height: h * .78, fill: palette[i] }, s);
    // fine gold wrap lines
    el('rect', { x: -w / 2, y: i * h + h * .78, width: w, height: h * .08, fill: C.gold2 }, s);
  }
  el('rect', { x: -w / 2 + w * .18, y: 0, width: w * .16, height: len, fill: '#fff', opacity: .28, rx: w * .08 }, s);
  if (bell) {
    el('circle', { cx: 0, cy: len + w * .9, r: w * .95, fill: 'url(#gold)' }, s);
    el('circle', { cx: -w * .3, cy: len + w * .6, r: w * .25, fill: '#fff', opacity: .7 }, s);
  }
  return s;
}

// The hero: a garba circle seen from above — dandiya sticks as sun-rays, mirror-work rings, lotus petals, crescent moon core.
function mandala(svg, cx, cy, R, opts = {}) {
  const g = el('g', { transform: `translate(${cx},${cy})` }, svg);
  el('circle', { r: R * 1.55, fill: 'url(#moonGlow)' }, g);

  // outer hairline rings
  [1.22, 1.08].forEach((k, i) => el('circle', { r: R * k, fill: 'none', stroke: C.gold2, 'stroke-width': i ? 1.2 : .6, opacity: .55, 'stroke-dasharray': i ? '' : '2 6' }, g));

  // engraved text ring
  if (opts.ringText) {
    const id = 'ring' + cx + cy, rr = R * 1.15;
    el('path', { id, d: `M0,${-rr} A${rr},${rr} 0 1 1 -0.01,${-rr}Z`, fill: 'none' }, g);
    const cp = el('clipPath', { id: id + 'c' }, g);
    el('rect', { x: -R * 2, y: -R * 2, width: R * 4, height: R * 2.75 }, cp);
    const t = el('text', { 'clip-path': `url(#${id}c)`, fill: C.gold2, 'font-family': 'Cinzel', 'font-weight': 600, 'font-size': R * .042, 'letter-spacing': R * .012, opacity: .7 }, g);
    const tp = el('textPath', { href: '#' + id }, t);
    tp.textContent = opts.ringText.repeat(opts.ringRepeat || 4);
  }

  // ray sticks
  const N = opts.rays || 32;
  const pals = [
    [C.rani, C.gold3, C.rani, C.gold3, C.rani],
    [C.wine, C.marigold, C.wine, C.marigold, C.wine],
  ];
  for (let i = 0; i < N; i++) {
    const a = (360 / N) * i;
    const long = i % 2 === 0;
    const r0 = R * (long ? .72 : .78), len = R * (long ? .36 : .24);
    const sg = el('g', { transform: `rotate(${a}) translate(0,${r0})` }, g);
    stick(sg, len, R * (long ? .028 : .022), pals[i % 4 < 2 ? 0 : 1]);
  }

  // mirror-work ring (abhla) with stitched gold rims
  const M = opts.mirrors || 24;
  for (let i = 0; i < M; i++) {
    const a = (Math.PI * 2 / M) * i + Math.PI / M;
    const x = Math.cos(a) * R * .64, y = Math.sin(a) * R * .64;
    el('circle', { cx: x, cy: y, r: R * .046, fill: 'none', stroke: C.gold2, 'stroke-width': R * .012, 'stroke-dasharray': `${R * .01} ${R * .008}` }, g);
    el('circle', { cx: x, cy: y, r: R * .032, fill: 'url(#mirror)' }, g);
  }

  // lotus petals
  const P = 16;
  const petals = el('g', {}, g);
  for (let i = 0; i < P; i++) {
    const p = el('path', {
      d: `M0,${-R * .32} C${R * .09},${-R * .38} ${R * .08},${-R * .52} 0,${-R * .58} C${-R * .08},${-R * .52} ${-R * .09},${-R * .38} 0,${-R * .32}Z`,
      fill: i % 2 ? C.wine : '#3d0b2a', stroke: C.gold2, 'stroke-width': 1.4, transform: `rotate(${(360 / P) * i})`
    }, petals);
    el('circle', { cx: 0, cy: -R * .49, r: R * .012, fill: C.marigold, transform: `rotate(${(360 / P) * i})` }, petals);
  }
  el('circle', { r: R * .33, fill: C.ink, stroke: C.gold2, 'stroke-width': 2 }, g);
  el('circle', { r: R * .30, fill: 'none', stroke: C.gold3, 'stroke-width': 1, 'stroke-dasharray': '1 5' }, g);

  if (opts.core === false) return g;
  // core: crescent moon cradling two crossed sticks
  const core = el('g', {}, g);
  const mr = R * .21;
  const mask = el('mask', { id: 'cres' + cx }, core);
  el('rect', { x: -R, y: -R, width: R * 2, height: R * 2, fill: '#fff' }, mask);
  el('circle', { cx: mr * .42, cy: -mr * .28, r: mr * .9, fill: '#000' }, mask);
  [-38, 38].forEach(a => {
    const sg = el('g', { transform: `rotate(${a}) translate(0,${-R * .25})` }, core);
    stick(sg, R * .46, R * .026, [C.rani, C.gold2, C.rani, C.gold2, C.rani]);
  });
  el('circle', { r: mr, fill: 'url(#gold)', mask: `url(#cres${cx})`, filter: 'url(#glow)' }, core);
  el('circle', { cx: mr * .55, cy: -mr * .55, r: R * .025, fill: C.gold1, filter: 'url(#glow)' }, core);
  return g;
}

// Toran: festive door hanging — mango leaves and mirror bells strung on a gold cord.
function toran(svg, x0, x1, y, sag, n, scale = 1) {
  const g = el('g', {}, svg);
  const pts = [];
  const curve = t => y + Math.sin(Math.PI * t) * sag;
  el('path', { d: `M${x0},${y} Q${(x0 + x1) / 2},${y + sag * 2} ${x1},${y}`, fill: 'none', stroke: C.gold3, 'stroke-width': 2 * scale }, g);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, yy = curve(t);
    const leaf = el('g', { transform: `translate(${x},${yy}) scale(${scale})` }, g);
    if (i % 2 === 0) {
      el('path', { d: 'M0,0 C14,10 12,44 0,58 C-12,44 -14,10 0,0Z', fill: i % 4 === 0 ? C.rani : C.emerald, stroke: C.gold2, 'stroke-width': 1.2 }, leaf);
      el('path', { d: 'M0,4 L0,52', stroke: C.gold2, 'stroke-width': .8, opacity: .8 }, leaf);
    } else {
      el('line', { x1: 0, y1: 0, x2: 0, y2: 26, stroke: C.gold3, 'stroke-width': 1.2 }, leaf);
      el('circle', { cx: 0, cy: 34, r: 9, fill: 'url(#mirror)', stroke: C.gold2, 'stroke-width': 2 }, leaf);
      el('path', { d: 'M-5,44 L5,44 L0,54Z', fill: C.marigold }, leaf);
    }
    pts.push([x, yy]);
  }
  return g;
}

// Bandhani tie-dye dot field (clusters of 4 dots in a diamond lattice).
function bandhani(svg, w, h, step, color, op) {
  const d = svg.querySelector('defs');
  const id = 'bh' + step;
  d.insertAdjacentHTML('beforeend', `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse">
    ${[[0, -1], [1, 0], [0, 1], [-1, 0]].map(([a, b]) => `<circle cx="${step / 2 + a * step * .07}" cy="${step / 2 + b * step * .07}" r="${step * .035}" fill="${color}"/>`).join('')}
    ${[[0, 0], [step, 0], [0, step], [step, step]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="${step * .03}" fill="${color}"/>`).join('')}
  </pattern>`);
  return el('rect', { width: w, height: h, fill: `url(#${id})`, opacity: op }, svg);
}

// Small gold divider: rule — diamond — rule.
function divider(width) {
  return `<svg class="div" viewBox="0 0 ${width} 20" width="${width}" height="20"><defs><linearGradient id="dg${width}" x1="0" x2="1"><stop offset="0" stop-color="#c08a2c" stop-opacity="0"/><stop offset=".5" stop-color="#ffe7a8"/><stop offset="1" stop-color="#c08a2c" stop-opacity="0"/></linearGradient></defs>
  <rect x="0" y="9.5" width="${width}" height="1" fill="url(#dg${width})"/>
  <path d="M${width / 2},2 L${width / 2 + 8},10 L${width / 2},18 L${width / 2 - 8},10Z" fill="#f2c66d"/>
  <circle cx="${width / 2 - 22}" cy="10" r="2.2" fill="#f2c66d"/><circle cx="${width / 2 + 22}" cy="10" r="2.2" fill="#f2c66d"/></svg>`;
}

// Out-of-focus festival lights — the depth a camera lens would give.
function bokeh(svg, w, h, n, zones) {
  const d = svg.querySelector('defs');
  if (!d.querySelector('#bk')) d.insertAdjacentHTML('beforeend', '<filter id="bk" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>');
  const g = el('g', { filter: 'url(#bk)' }, svg);
  const cols = [C.marigold, C.rani, C.gold1, C.saffron];
  for (let i = 0; i < n; i++) {
    const z = zones[i % zones.length];
    const x = z[0] + Math.random() * (z[2] - z[0]), y = z[1] + Math.random() * (z[3] - z[1]);
    const r = 8 + Math.random() * 34;
    el('circle', { cx: x, cy: y, r, fill: cols[i % 4], opacity: .08 + Math.random() * .22 }, g);
    el('circle', { cx: x, cy: y, r: r * .92, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: .1 }, g);
  }
  return g;
}
