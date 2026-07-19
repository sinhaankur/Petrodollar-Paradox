// ─── Counter on hero ──────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCounter(el, target, decimals, duration = 1800) {
  if (prefersReducedMotion) { el.textContent = target.toFixed(decimals); return; }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = target * eased;
    el.textContent = v.toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals);
  };
  requestAnimationFrame(tick);
}

document.querySelectorAll('[data-counter]').forEach(el => {
  const target = parseFloat(el.dataset.counter);
  const decimals = parseInt(el.dataset.decimals || '0');
  animateCounter(el, target, decimals);
});

// ─── Reveal on scroll ─────────────────────────────────────────
const revealTargets = document.querySelectorAll(
  '.section-title, .section-lede, .compare-card, .stat-block, .layer-card, .force-card, .chain-node, .upside, .reel-card, .printing-card, .factor-row'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

// ─── Reel data ────────────────────────────────────────────────
const reelData = [
  { y: 2000, m2: 4.9,  inr: 44.9,  title: "The calm before",         tag: "BASELINE",       desc: "Fed balance sheet small. Oil at $30. India just beginning to rise.", color: "amber" },
  { y: 2001, m2: 5.4,  inr: 47.2,  title: "Dot-com bust and 9/11",   tag: "FIRST SHOCK",    desc: "Fed slashes rates. M2 jumps. Dollar liquidity expands.", color: "coral" },
  { y: 2003, m2: 6.0,  inr: 45.6,  title: "Iraq war begins",         tag: "OIL SURGE",      desc: "Military spending rises. Oil climbs past $40.", color: "coral" },
  { y: 2005, m2: 6.6,  inr: 44.1,  title: "Bull market boom",        tag: "INFLOW ERA",     desc: "Cheap money fuels global asset bubble. Capital floods India.", color: "teal" },
  { y: 2008, m2: 8.2,  inr: 48.4,  title: "Global financial crisis", tag: "BIG BANG",       desc: "Fed launches QE1. Trillions printed. Capital flees emerging markets.", color: "coral" },
  { y: 2010, m2: 8.8,  inr: 45.6,  title: "QE2 launched",            tag: "MORE PRINTING",  desc: "Fed buys $600B more bonds. Dollars flood the system again.", color: "blue" },
  { y: 2013, m2: 11.0, inr: 61.9,  title: "Taper tantrum",           tag: "RUPEE CRISIS",   desc: "Fed hints at ending QE. Rupee crashes 20% in months.", color: "coral" },
  { y: 2015, m2: 12.4, inr: 66.3,  title: "Strong dollar era",       tag: "DXY PEAK",       desc: "Fed ends QE. Dollar surges globally. EM currencies weaken.", color: "blue" },
  { y: 2018, m2: 14.4, inr: 70.1,  title: "Trade war and QT",        tag: "PRESSURE",       desc: "Tariffs and tightening. Oil rises to $80. Rupee crosses ₹70.", color: "amber" },
  { y: 2020, m2: 19.1, inr: 74.1,  title: "COVID money printer",     tag: "UNPRECEDENTED",  desc: "Fed prints $4T in months. Largest expansion in history.", color: "coral" },
  { y: 2022, m2: 21.9, inr: 82.8,  title: "Inflation breaks out",    tag: "PAYBACK TIME",   desc: "9% inflation. Fed hikes 525bps. Dollar surges. Rupee past ₹80.", color: "coral" },
  { y: 2023, m2: 20.8, inr: 83.2,  title: "QT continues",            tag: "TIGHT MONEY",    desc: "Rates highest in 22 years. Dollar stays strong.", color: "blue" },
  { y: 2024, m2: 21.5, inr: 84.5,  title: "Soft landing hopes",      tag: "STEADY GRIND",   desc: "Fed pauses. M2 starts growing again. Rupee depreciates slowly.", color: "amber" },
  { y: 2025, m2: 22.4, inr: 88.4,  title: "Growth slowdown",         tag: "OUTFLOW SIGNS",  desc: "FIIs pull out $15B. Rupee crosses ₹88.", color: "amber" },
  { y: 2026, m2: 22.7, inr: 95.96, title: "Iran–US conflict",        tag: "PERFECT STORM",  desc: "Brent at $105. Rupee at ₹95.96. Asia's weakest currency.", color: "coral" }
];

const reelColors = {
  amber: { bg: "#FAEEDA", border: "#BA7517", title: "#412402", text: "#854F0B", tagBg: "rgba(186,117,23,0.25)", tagText: "#412402" },
  coral: { bg: "#FAECE7", border: "#D85A30", title: "#4A1B0C", text: "#993C1D", tagBg: "rgba(216,90,48,0.22)",  tagText: "#4A1B0C" },
  teal:  { bg: "#E1F5EE", border: "#1D9E75", title: "#04342C", text: "#0F6E56", tagBg: "rgba(29,158,117,0.22)", tagText: "#04342C" },
  blue:  { bg: "#E6F1FB", border: "#378ADD", title: "#042C53", text: "#185FA5", tagBg: "rgba(55,138,221,0.22)", tagText: "#042C53" }
};

let reelIdx = 0;
let reelPlaying = false;
let reelTimer = null;

const canvas = document.getElementById('reelChart');
const ctx = canvas.getContext('2d');
const DPR = window.devicePixelRatio || 1;

function sizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * DPR;
  canvas.height = rect.height * DPR;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(DPR, DPR);
}
sizeCanvas();

function drawChart() {
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  ctx.clearRect(0, 0, w, h);

  const padL = 14, padR = 14, padT = 22, padB = 28;
  const cw = w - padL - padR;
  const ch = h - padT - padB;
  const yMin = 2000, yMax = 2026;
  const m2Max = 24, inrMax = 100;

  // gridlines
  ctx.strokeStyle = 'rgba(26, 22, 20, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (ch / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + cw, y);
    ctx.stroke();
  }

  const m2Points = reelData.slice(0, reelIdx + 1);
  const inrPoints = reelData.slice(0, reelIdx + 1);

  // M2 area fill
  if (m2Points.length > 1) {
    ctx.fillStyle = 'rgba(55, 138, 221, 0.14)';
    ctx.beginPath();
    m2Points.forEach((p, i) => {
      const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
      const y = padT + ch - (p.m2 / m2Max) * ch;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    const lastX = padL + ((m2Points[m2Points.length - 1].y - yMin) / (yMax - yMin)) * cw;
    ctx.lineTo(lastX, padT + ch);
    ctx.lineTo(padL, padT + ch);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#378ADD';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    m2Points.forEach((p, i) => {
      const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
      const y = padT + ch - (p.m2 / m2Max) * ch;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // INR line
  if (inrPoints.length > 1) {
    ctx.strokeStyle = '#D85A30';
    ctx.lineWidth = 3;
    ctx.beginPath();
    inrPoints.forEach((p, i) => {
      const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
      const y = padT + ch - (p.inr / inrMax) * ch;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // markers on current point
  if (m2Points.length) {
    const p = m2Points[m2Points.length - 1];
    const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
    const y = padT + ch - (p.m2 / m2Max) * ch;
    ctx.fillStyle = '#378ADD';
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  if (inrPoints.length) {
    const p = inrPoints[inrPoints.length - 1];
    const x = padL + ((p.y - yMin) / (yMax - yMin)) * cw;
    const y = padT + ch - (p.inr / inrMax) * ch;
    ctx.fillStyle = '#D85A30';
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  // labels
  ctx.fillStyle = '#8A847A';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('US M2 (trillions $)', padL, h - 8);
  ctx.textAlign = 'right';
  ctx.fillText('USD / INR', w - padR, h - 8);
}

function updateReelUi() {
  const d = reelData[reelIdx];
  const prev = reelIdx > 0 ? reelData[reelIdx - 1] : null;
  const c = reelColors[d.color];

  document.getElementById('reelYear').textContent = d.y;
  document.getElementById('reelM2').textContent = '$' + d.m2.toFixed(1) + 'T';
  document.getElementById('reelInr').textContent = '₹' + d.inr.toFixed(2);

  if (prev) {
    const m2Pct = ((d.m2 - prev.m2) / prev.m2 * 100);
    const inrPct = ((d.inr - prev.inr) / prev.inr * 100);
    document.getElementById('reelM2Delta').textContent = (m2Pct >= 0 ? '+' : '') + m2Pct.toFixed(1) + '% vs ' + prev.y;
    document.getElementById('reelInrDelta').textContent = (inrPct >= 0 ? '+' : '') + inrPct.toFixed(1) + '% vs ' + prev.y;
  } else {
    document.getElementById('reelM2Delta').textContent = 'starting point';
    document.getElementById('reelInrDelta').textContent = 'starting point';
  }

  const event = document.getElementById('reelEvent');
  event.style.background = c.bg;
  event.style.borderLeftColor = c.border;

  const title = document.getElementById('reelTitle');
  title.textContent = d.title;
  title.style.color = c.title;

  const tag = document.getElementById('reelTag');
  tag.textContent = d.tag;
  tag.style.background = c.tagBg;
  tag.style.color = c.tagText;

  const desc = document.getElementById('reelDesc');
  desc.textContent = d.desc;
  desc.style.color = c.text;

  const pct = (reelIdx / (reelData.length - 1)) * 100;
  document.getElementById('reelProgress').style.width = pct + '%';

  drawChart();
}

function reelStep() {
  if (reelIdx < reelData.length - 1) {
    reelIdx++;
    updateReelUi();
  } else {
    reelPause();
  }
}

function setPlayLabel(label, icon) {
  document.getElementById('reelPlayLabel').textContent = label;
  const btn = document.getElementById('reelPlay');
  const svg = btn.querySelector('svg');
  if (icon === 'pause') {
    svg.innerHTML = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>';
  } else {
    svg.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

function reelPlay() {
  reelPlaying = true;
  setPlayLabel('Pause', 'pause');
  const speed = parseInt(document.getElementById('reelSpeed').value);
  reelTimer = setInterval(reelStep, speed);
}

function reelPause() {
  reelPlaying = false;
  clearInterval(reelTimer);
  setPlayLabel(reelIdx >= reelData.length - 1 ? 'Replay' : 'Resume', 'play');
}

function reelReset() {
  reelPause();
  reelIdx = 0;
  updateReelUi();
  setPlayLabel('Start reel', 'play');
}

document.getElementById('reelPlay').addEventListener('click', () => {
  if (reelIdx >= reelData.length - 1 && !reelPlaying) {
    reelIdx = 0;
    updateReelUi();
    reelPlay();
    return;
  }
  if (reelPlaying) reelPause();
  else reelPlay();
});

document.getElementById('reelReset').addEventListener('click', reelReset);

document.getElementById('reelSpeed').addEventListener('change', function () {
  if (reelPlaying) {
    clearInterval(reelTimer);
    reelTimer = setInterval(reelStep, parseInt(this.value));
  }
});

window.addEventListener('resize', () => {
  sizeCanvas();
  drawChart();
});

updateReelUi();

// ─── Auto-play reel when it scrolls into view ─────────────────
const reelTrigger = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && reelIdx === 0 && !reelPlaying) {
      setTimeout(() => reelPlay(), 600);
      reelTrigger.unobserve(e.target);
    }
  });
}, { threshold: 0.45 });

reelTrigger.observe(document.querySelector('.reel-card'));

// ─── Smooth nav highlight ─────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-links a');
const sections = ['#puzzle', '#timeline', '#printing', '#history', '#system', '#globe', '#forces', '#simulator', '#scenarios', '#currencies', '#solutions', '#impact', '#knowledge']
  .map(id => document.querySelector(id))
  .filter(Boolean);

// ─── Section roadmap rail ("you are here") ────────────────────
const RAIL_LABELS = {
  puzzle: 'The puzzle', timeline: 'Timeline', printing: 'How printing works',
  history: 'History of money', system: 'The system', globe: 'The globe',
  forces: 'Four forces', simulator: 'Simulator', currencies: 'Currencies',
  solutions: 'The way out', impact: 'Impact', knowledge: 'Learn'
};
const railEl = document.getElementById('sectionRail');
const railLinks = {};
if (railEl) {
  sections.forEach(sec => {
    const a = document.createElement('a');
    a.href = '#' + sec.id;
    a.setAttribute('aria-label', RAIL_LABELS[sec.id] || sec.id);
    a.innerHTML = '<span class="rail-label">' + (RAIL_LABELS[sec.id] || sec.id) + '</span>';
    railEl.appendChild(a);
    railLinks[sec.id] = a;
  });
}

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = '#' + e.target.id;
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === id ? 'var(--ink)' : '';
      });
      Object.entries(railLinks).forEach(([sid, a]) => {
        a.classList.toggle('is-active', sid === e.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// Show the rail only after the user scrolls past the hero
if (railEl) {
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    const railToggle = new IntersectionObserver((entries) => {
      // hero mostly out of view → show rail
      railEl.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 0.15 });
    railToggle.observe(heroEl);
  } else {
    railEl.classList.add('is-visible');
  }
}

// ─── Value simulator ───────────────────────────────────────────
const SIM_BASE = { oil: 105, dxy: 98.3, fii: -21, fed: 5.0, rbi: 0 };
const SIM_BASE_RATE = 95.96;
// Sensitivities: rupees per unit delta from baseline
const SIM_BETA = {
  oil: 0.05,    // ₹/bbl  → $10 = ₹0.50
  dxy: 0.25,    // ₹/point
  fii: -0.04,   // ₹/$B  (positive FII inflow strengthens rupee, so beta negative)
  fed: 1.20,    // ₹/percentage point
  rbi: -0.06    // ₹/$B sold (more defense = stronger rupee)
};

const SIM_PRESETS = {
  current: { oil: 105, dxy: 98.3, fii: -21, fed: 5.0,  rbi: 0,  label: "Current state (May 2026)" },
  best:    { oil: 75,  dxy: 92.0, fii: 15,  fed: 3.0,  rbi: 8,  label: "Best-case recovery" },
  hormuz:  { oil: 150, dxy: 103,  fii: -50, fed: 5.75, rbi: 25, label: "Hormuz closure" },
  covid:   { oil: 40,  dxy: 92.5, fii: -28, fed: 0.25, rbi: 12, label: "COVID-style shock" },
  taper:   { oil: 110, dxy: 85.0, fii: -35, fed: 2.25, rbi: 30, label: "2013 taper tantrum" }
};

function fmtSigned(n, decimals = 2, symbol = '₹') {
  const sign = n >= 0 ? '+' : '−';
  return sign + symbol + Math.abs(n).toFixed(decimals);
}

function fmtFii(b) {
  if (b >= 0) return '+' + b;
  return '−' + Math.abs(b);
}

function simContributions(v) {
  return {
    oil: (v.oil - SIM_BASE.oil) * SIM_BETA.oil,
    dxy: (v.dxy - SIM_BASE.dxy) * SIM_BETA.dxy,
    fii: (v.fii - SIM_BASE.fii) * SIM_BETA.fii,
    fed: (v.fed - SIM_BASE.fed) * SIM_BETA.fed,
    rbi: (v.rbi - SIM_BASE.rbi) * SIM_BETA.rbi
  };
}

function verdictFor(rate, total) {
  if (rate < 80) {
    return { state: 'better', label: 'STRENGTHENING',
      text: 'The rupee has rallied meaningfully below ₹80. Imports get cheaper, inflation eases, and the RBI can rebuild reserves rather than burn them.' };
  }
  if (rate < 92) {
    return { state: 'better', label: 'SOLID',
      text: 'Healthy territory. India\'s macro looks steady. FII flows would likely turn positive at these levels.' };
  }
  if (rate < 97) {
    return { state: 'neutral', label: 'AROUND CURRENT',
      text: 'Roughly where the rupee is today. The forces are in balance — neither pushing it sharply higher nor lower than ₹95–96.' };
  }
  if (rate < 102) {
    return { state: 'worse', label: 'UNDER PRESSURE',
      text: 'The rupee is weaker than today and pressing the psychological ₹100 mark. Expect RBI intervention to slow the slide.' };
  }
  if (rate < 110) {
    return { state: 'worse', label: 'WEAK',
      text: 'Past ₹100 in headlines and onto the front page. RBI defense will be aggressive. Inflation pressure builds quickly through fuel and imports.' };
  }
  if (rate < 120) {
    return { state: 'crisis', label: 'CRISIS',
      text: 'Severe stress. NRI bond raises, gold import restrictions, and emergency capital controls move onto the table. 2013-style measures likely.' };
  }
  return { state: 'crisis', label: 'BREAKING POINT',
    text: 'A 1991-style balance of payments situation. IMF conversations begin. Deep policy intervention becomes unavoidable.' };
}

const sim = {
  oil: document.getElementById('ctlOil'),
  dxy: document.getElementById('ctlDxy'),
  fii: document.getElementById('ctlFii'),
  fed: document.getElementById('ctlFed'),
  rbi: document.getElementById('ctlRbi')
};

function readSim() {
  return {
    oil: parseFloat(sim.oil.value),
    dxy: parseFloat(sim.dxy.value),
    fii: parseFloat(sim.fii.value),
    fed: parseFloat(sim.fed.value),
    rbi: parseFloat(sim.rbi.value)
  };
}

function updateSim() {
  const v = readSim();
  const c = simContributions(v);
  const total = c.oil + c.dxy + c.fii + c.fed + c.rbi;
  const rate = SIM_BASE_RATE + total;

  document.getElementById('valOil').textContent = v.oil.toFixed(0);
  document.getElementById('valDxy').textContent = v.dxy.toFixed(1);
  document.getElementById('valFii').textContent = fmtFii(v.fii);
  document.getElementById('valFed').textContent = v.fed.toFixed(2);
  document.getElementById('valRbi').textContent = v.rbi.toFixed(0);

  const setBd = (id, val) => {
    const el = document.getElementById(id);
    el.textContent = fmtSigned(val, 2);
    el.classList.toggle('up', val > 0.005);
    el.classList.toggle('down', val < -0.005);
  };
  setBd('bdOil', c.oil);
  setBd('bdDxy', c.dxy);
  setBd('bdFii', c.fii);
  setBd('bdFed', c.fed);
  setBd('bdRbi', c.rbi);
  setBd('bdTotal', total);

  const out = document.getElementById('simOut');
  out.textContent = '₹' + rate.toFixed(2);
  out.classList.remove('is-better', 'is-worse', 'is-crisis');
  if (rate < 90) out.classList.add('is-better');
  else if (rate > 110) out.classList.add('is-crisis');
  else if (rate > 98) out.classList.add('is-worse');

  const delta = document.getElementById('simDelta');
  if (Math.abs(total) < 0.005) {
    delta.textContent = 'no change from current ₹95.96';
  } else {
    const dir = total > 0 ? 'weaker than' : 'stronger than';
    delta.textContent = fmtSigned(total) + ' · ' + dir + ' current ₹95.96';
  }

  // Marker on meter — meter spans 65 to 125
  const meterMin = 65, meterMax = 125;
  const clamped = Math.max(meterMin, Math.min(meterMax, rate));
  const pct = ((clamped - meterMin) / (meterMax - meterMin)) * 100;
  document.getElementById('simMarker').style.left = pct + '%';

  const verdict = verdictFor(rate, total);
  const vEl = document.getElementById('simVerdict');
  vEl.classList.remove('is-better', 'is-crisis');
  if (verdict.state === 'better') vEl.classList.add('is-better');
  else if (verdict.state === 'crisis') vEl.classList.add('is-crisis');
  vEl.querySelector('.sim-verdict-label').textContent = 'VERDICT · ' + verdict.label;
  vEl.querySelector('.sim-verdict-text').textContent = verdict.text;

  // ── Actionable "what would pull it back?" solution ──
  const solEl = document.getElementById('simSolutionText');
  if (solEl) {
    const drivers = [
      { key: 'oil', val: c.oil, weak: 'oil at $' + v.oil.toFixed(0) + '/bbl', fix: 'cutting oil dependency — rupee invoicing, discounted Russian crude and faster clean-energy buildout' },
      { key: 'dxy', val: c.dxy, weak: 'a strong dollar (DXY ' + v.dxy.toFixed(1) + ')', fix: 'a wait for the Fed to ease and DXY to cool — India can only cushion this one, not control it' },
      { key: 'fii', val: c.fii, weak: 'foreign capital outflows', fix: 'stickier inflows — deeper bond-index inclusion and long-term FDI over hot money' },
      { key: 'fed', val: c.fed, weak: 'the Fed rate at ' + v.fed.toFixed(2) + '%', fix: 'narrowing the rate gap, or building reserves to ride out the carry-trade pull' },
    ];
    // biggest positive (weakening) contributor
    const worst = drivers.filter(d => d.val > 0.02).sort((a, b) => b.val - a.val)[0];
    const rbiRoom = v.rbi < 40; // is there defense headroom left?

    if (total <= 0.02) {
      solEl.innerHTML = rate < 95.96
        ? 'This scenario already <strong>strengthens</strong> the rupee. Whatever you changed is exactly the kind of lever the "Way Out" section builds on.'
        : "You're at today's level. Push any slider into the red and this box will name the fastest lever to recover — and where to fix it for real.";
    } else if (worst) {
      const defense = rbiRoom
        ? ' In the short run, RBI can lean against it by selling reserves (the RBI slider) — but that buys time, not a fix.'
        : ' RBI is already spending heavily to defend it, so the durable fix has to be structural.';
      solEl.innerHTML = 'The biggest drag here is <strong>' + worst.weak + '</strong>. The real answer is <strong>' + worst.fix + '</strong>.' + defense;
    }
  }

  // Highlight active preset if matches
  const presetKey = Object.keys(SIM_PRESETS).find(k => {
    const p = SIM_PRESETS[k];
    return Math.abs(p.oil - v.oil) < 0.5 && Math.abs(p.dxy - v.dxy) < 0.05
      && Math.abs(p.fii - v.fii) < 0.5 && Math.abs(p.fed - v.fed) < 0.05
      && Math.abs(p.rbi - v.rbi) < 0.5;
  });
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === presetKey);
  });
}

Object.values(sim).forEach(el => el.addEventListener('input', updateSim));

function applySimState(p) {
  if (!p) return;
  sim.oil.value = p.oil;
  sim.dxy.value = p.dxy;
  sim.fii.value = p.fii;
  sim.fed.value = p.fed;
  sim.rbi.value = p.rbi;
  updateSim();
}

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => applySimState(SIM_PRESETS[btn.dataset.preset]));
});

// Exposed so the scenario library can drive the simulator with a historical
// episode's conditions ("Replay in simulator") without duplicating logic.
window.applyScenario = applySimState;

updateSim();

// ─── Currency tool ─────────────────────────────────────────────
const CURRENCIES = {
  EUR: { name: "Euro", code: "EUR", flag: "🇪🇺", rate: "€0.94", ytd: -2.4, since: -4.0, cat: "Reserve currency", verdict: "Resilient",
    story: "The euro is structurally weaker than the dollar in 2026 — ECB rates sit below Fed rates and the eurozone imports more energy than the US. But because the euro is itself a reserve currency, it doesn't collapse the way emerging-market currencies do.",
    vsInr: "Both currencies are weaker against the dollar this year — but the euro's gentle slide reflects Europe's structural buffer as a reserve issuer. India has no such cushion." },
  JPY: { name: "Japanese yen", code: "JPY", flag: "🇯🇵", rate: "¥158.20", ytd: -8.5, since: -35.0, cat: "Reserve currency", verdict: "Weak",
    story: "The yen is in the worst stretch of its modern history. The Bank of Japan held rates at zero for too long, and even as it now tightens, the gap with US yields remains huge. Capital piles into dollar assets via the carry trade.",
    vsInr: "The yen has fallen even harder than the rupee year-to-date, despite Japan being one of the largest holders of dollar reserves. Reserve status alone isn't enough when the yield differential is extreme." },
  GBP: { name: "British pound", code: "GBP", flag: "🇬🇧", rate: "£0.81", ytd: -1.8, since: -22.0, cat: "Reserve currency", verdict: "Holding",
    story: "Sterling has been one of the better-performing major currencies in 2026. The Bank of England has kept rates close to the Fed's level, narrowing the yield gap that hurts other currencies.",
    vsInr: "The pound is holding up where the rupee is buckling — a reminder that rate parity with the Fed matters more than economic size." },
  CNY: { name: "Chinese yuan", code: "CNY", flag: "🇨🇳", rate: "¥7.32", ytd: -2.1, since: 11.0, cat: "Managed peg", verdict: "Controlled",
    story: "Beijing keeps the yuan in a tight band against the dollar through heavy intervention and capital controls. Movement is allowed only on the People's Bank of China's terms.",
    vsInr: "The yuan moves on policy, not markets. China can defend any level it chooses because of $3T in reserves and a closed capital account. India, with a more open capital account, cannot." },
  KRW: { name: "South Korean won", code: "KRW", flag: "🇰🇷", rate: "₩1,420", ytd: -4.5, since: -25.0, cat: "Asian EM", verdict: "Pressured",
    story: "The won has weakened sharply on tech-driven export volatility and political uncertainty. Bank of Korea has the same dollar-strength problem as the RBI, but with a more open capital account.",
    vsInr: "Korea and India are running similar playbooks — managed depreciation, occasional intervention, accepting some weakness to support exports." },
  IDR: { name: "Indonesian rupiah", code: "IDR", flag: "🇮🇩", rate: "Rp16,800", ytd: -3.8, since: -78.0, cat: "Asian EM", verdict: "Pressured",
    story: "Indonesia has been one of the larger Asian losers in 2026, with foreign investors pulling out of equities. Bank Indonesia has intervened aggressively in the spot market.",
    vsInr: "Indonesia is in a similar boat — commodity importer, capital-account opener, FII-sensitive. The rupiah and rupee tend to move together when the dollar strengthens." },
  TRY: { name: "Turkish lira", code: "TRY", flag: "🇹🇷", rate: "₺48.50", ytd: -22.0, since: -98.0, cat: "Frontier EM", verdict: "Crisis",
    story: "The lira has been in a multi-year free fall driven by unorthodox monetary policy and chronic inflation. Real rates have been deeply negative for years.",
    vsInr: "The lira's collapse shows what happens when central bank credibility breaks. India has been disciplined — repo rates well above inflation — which is why the rupee is at ₹95 instead of ₹400." },
  BRL: { name: "Brazilian real", code: "BRL", flag: "🇧🇷", rate: "R$6.30", ytd: -10.0, since: -71.0, cat: "Commodity EM", verdict: "Weak",
    story: "The real has weakened despite commodity exporter status. Fiscal concerns and dovish central bank signals have outweighed strong terms of trade.",
    vsInr: "Brazil shows that even commodity exporters get crushed by dollar strength and fiscal worries. India's stronger fiscal position is helping the rupee relative to peers." },
  ZAR: { name: "South African rand", code: "ZAR", flag: "🇿🇦", rate: "R20.10", ytd: -8.5, since: -67.0, cat: "Commodity EM", verdict: "Weak",
    story: "The rand is one of the most liquid emerging market currencies and trades as a proxy for global risk. When dollar strength hits, the rand falls fastest.",
    vsInr: "The rand falls and rises with global sentiment. India's larger domestic economy means the rupee is less of a risk barometer — but it gets hit by the same dollar wave." },
  ARS: { name: "Argentine peso", code: "ARS", flag: "🇦🇷", rate: "ARS$1,850", ytd: -38.0, since: -99.9, cat: "Frontier EM", verdict: "Crisis",
    story: "The peso is in a perpetual currency crisis driven by chronic fiscal deficits, hyperinflation, and political instability. Multiple parallel exchange rates exist.",
    vsInr: "Argentina is the cautionary tale. India's macro discipline — primary fiscal balance, inflation targeting, building reserves — is exactly the playbook that keeps the rupee from becoming the peso." },
  RUB: { name: "Russian ruble", code: "RUB", flag: "🇷🇺", rate: "₽103", ytd: -5.0, since: -73.0, cat: "Sanctioned", verdict: "Distorted",
    story: "The ruble price is shaped by sanctions, capital controls, oil revenue, and limited dollar liquidity. The market price doesn't reflect normal supply-demand.",
    vsInr: "The ruble doesn't trade in a normal market anymore. The rupee, despite pressure, remains fully convertible on the current account — a feature India is keen to preserve." },
  CAD: { name: "Canadian dollar", code: "CAD", flag: "🇨🇦", rate: "C$1.42", ytd: -2.8, since: -1.0, cat: "Commodity G10", verdict: "Steady",
    story: "The Canadian dollar has held up because Canada's economy is closely linked to the US, and energy exports benefit from oil strength.",
    vsInr: "Canada has the rare advantage of being a major oil exporter — exactly the opposite of India. The CAD strengthens with oil. The rupee weakens." },
  AUD: { name: "Australian dollar", code: "AUD", flag: "🇦🇺", rate: "A$1.55", ytd: -3.5, since: -19.0, cat: "Commodity G10", verdict: "Soft",
    story: "The Aussie has weakened on China-growth concerns and a wider rate differential with the Fed. Iron ore prices have softened.",
    vsInr: "Australia is a commodity exporter to China and a Fed-rate taker. It's caught between the same forces hitting India, just with a different commodity profile." },
  CHF: { name: "Swiss franc", code: "CHF", flag: "🇨🇭", rate: "CHF 0.91", ytd: 0.5, since: 47.0, cat: "Safe haven", verdict: "Strong",
    story: "The franc is the world's purest safe haven. When global risk rises, capital piles into Swiss francs and Swiss government bonds. The SNB even runs negative rates to slow appreciation.",
    vsInr: "The franc and the rupee are at opposite poles. The franc benefits from risk-off. The rupee gets crushed by it. This is the asymmetry of being a reserve issuer versus an importer." },
  MXN: { name: "Mexican peso", code: "MXN", flag: "🇲🇽", rate: "$20.50", ytd: -5.8, since: -45.0, cat: "Commodity EM", verdict: "Soft",
    story: "The peso was a star performer of the 2020s carry trade but has weakened in 2026 on political reform concerns and a narrower Banxico-Fed spread.",
    vsInr: "Mexico is geographically and commercially next to the US — usually a stabilizer. Even that hasn't been enough in 2026, showing how dominant the dollar story has been." }
};

function buildScoreboard() {
  const rows = Object.values(CURRENCIES)
    .map(c => ({ ...c }))
    .sort((a, b) => b.ytd - a.ytd);

  const target = document.getElementById('ccyScoreboard');
  if (!target) return;
  target.innerHTML = '';
  rows.forEach(c => {
    const row = document.createElement('div');
    row.className = 'ccy-row';
    row.dataset.code = c.code;
    const ytdClass = c.ytd >= 0 ? 'pos' : 'neg';
    const ytdStr = (c.ytd >= 0 ? '+' : '−') + Math.abs(c.ytd).toFixed(1) + '%';
    row.innerHTML = `
      <span class="ccy-row-flag">${c.flag}</span>
      <span class="ccy-row-name">${c.name}</span>
      <span class="ccy-row-pct ${ytdClass}">${ytdStr}</span>
    `;
    row.addEventListener('click', () => {
      const dd = document.getElementById('ccyPick');
      dd.value = c.code;
      renderCcy(c.code);
    });
    target.appendChild(row);
  });
}

function renderCcy(code) {
  const c = CURRENCIES[code];
  if (!c) return;
  document.getElementById('ccyFlag').textContent = c.flag;
  document.getElementById('ccyName').textContent = c.name;
  document.getElementById('ccyCode').textContent = c.code + ' · vs USD';
  document.getElementById('ccyRate').textContent = c.rate;

  const fmtPct = (n) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1) + '%';
  document.getElementById('ccyYtd').textContent = fmtPct(c.ytd);
  document.getElementById('ccySince').textContent = fmtPct(c.since);
  document.getElementById('ccyCat').textContent = c.cat;
  document.getElementById('ccyVerdict').textContent = c.verdict;
  document.getElementById('ccyStory').textContent = c.story;
  document.getElementById('ccyVsInr').textContent = c.vsInr;

  document.querySelectorAll('.ccy-row').forEach(r => {
    r.classList.toggle('is-selected', r.dataset.code === code);
  });
}

const ccyPick = document.getElementById('ccyPick');
if (ccyPick) {
  ccyPick.addEventListener('change', () => renderCcy(ccyPick.value));
  buildScoreboard();
  renderCcy(ccyPick.value);
}

// ─── Internationalization (EN / HI) ────────────────────────────
const I18N = {
  en: {
    'nav.story': 'The Story',
    'nav.history': 'History',
    'nav.system': 'The System',
    'nav.tools': 'Tools',
    'nav.scenarios': 'Scenarios',
    'nav.currencies': 'Currencies',
    'nav.globe': 'The Globe',
    'nav.solutions': 'The Way Out',
    'nav.impact': 'Impact',
    'nav.learn': 'Learn',
    'globe.label': 'THE SYSTEM ON THE PLANET',
    'globe.title': 'Spin the world. Follow the dollars and the oil.',
    'globe.lede': "The petrodollar system isn't an abstraction — it runs across real geography. The US prints, importers like India pay dollars for oil, Gulf exporters recycle the surplus into US Treasuries. Rotate and zoom the globe, then tap any country to see where it sits in the machine.",
    'globe.note': "Country markers are placed at approximate capitals. Figures are the same snapshot used across this page (May 14, 2026) and are illustrative of each country's role, not a live feed.",
    'sol.label': 'THE WAY OUT',
    'sol.title': 'The rupee is trapped — but not powerless. Pick the levers.',
    'sol.lede': 'Diagnosis is only half the story. Toggle the policy and structural moves India can actually make — each is real, already underway in some form — and watch how far they could pull the rupee back from ₹95.96. No single lever fixes it. Stacked together, they add up.',
    'lflow.label': 'DETAILED FLOW · ANIMATED',
    'lflow.title': 'Watch each layer in motion.',
    'lflow.lede': 'Dollars don\'t sit still. They circulate through specific channels that lock in their dominance. Pick a layer to see the flows.',
    'lflow.tab1': 'Dollar as plumbing',
    'lflow.tab2': 'Petrodollar engine',
    'lflow.tab3': 'India squeezed',
    'wo.label': 'CHANGING THE WORLD ORDER',
    'wo.title': 'If the petrodollar shifts, what does the math look like?',
    'wo.lede': 'Three slow-moving forces are chipping at dollar dominance. Move the sliders to see how the system would respond — and what it would mean for the rupee.',
    'wo.realLabel': 'REAL-WORLD PROGRESS',
    'wo.realTitle': 'What\'s already happening on the ground.',
    'reel.label': 'SHARE AS A REEL',
    'reel.title': 'Generate a video clip in your language.',
    'reel.lede': 'An auto-built 30-second portrait video summarizing the story, with narration in the language you picked above. Generated in your browser — nothing leaves your device.',
    'hero.date': 'MAY 14, 2026',
    'hero.sub': 'All-time low against the dollar',
    'hero.puzzleLabel': 'THE PUZZLE',
    'hero.puzzle': 'The US has been printing dollars for decades.<br>So why is the rupee falling, not the dollar?',
    'hero.cta': 'Read the story',
    'puzzle.label': 'THE INTUITION FAILS',
    'puzzle.title': 'More dollars in the world should mean a cheaper dollar.',
    'puzzle.lede': "For any normal currency, that's exactly what happens. But the dollar isn't normal. It's the world's plumbing — and when the world gets anxious, every importing country needs more dollars, faster than the Fed can print them.",
    'timeline.label': '26 YEARS, TWO LINES',
    'timeline.title': 'The US printed. The rupee fell. They moved together — not apart.',
    'printing.label': 'HOW USD PRINTING WORKS',
    'printing.title': 'When the Fed "prints," it doesn\'t run physical presses.',
    'printing.lede': 'The dollar supply expands through the banking system — and the way it expands determines whether the rupee gets a boost or a beating.',
    'system.label': 'THE SYSTEM',
    'system.title': 'The puzzle resolves in three layers.',
    'system.lede': 'Start here. Tap the three tabs below to watch the money actually move — first how the dollar became the world\'s plumbing, then how oil locks the loop in place, then why India ends up squeezed. Once the animation makes it click, the written breakdown underneath fills in the detail.',
    'system.cardsLabel': 'THE SAME THREE LAYERS, IN WORDS',
    'lflow.hint': 'Tap a layer to switch the animation',
    'forces.label': 'THE FOUR FORCES',
    'forces.title': 'Every dollar-demand stream is firing at once.',
    'forces.lede': 'No single factor explains the slide. Four forces are stacking on top of each other in 2026 — and the rupee has nowhere to hide.',
    'sim.label': 'VALUE SIMULATOR',
    'sim.title': 'Move the sliders. Watch the rupee respond.',
    'sim.lede': 'A simplified linear model of the five major forces — oil, dollar strength, capital flows, Fed policy, and RBI defense. Adjust any input and the projected USD/INR updates instantly.',
    'sim.hint': 'Drag any slider — the rate, breakdown and verdict update live',
    'ccy.label': 'CROSS-CURRENCY IMPACT',
    'ccy.title': "India isn't alone. The dollar is moving everyone.",
    'ccy.lede': "Pick any currency below to see how it's responding to the same forces hitting the rupee — and why some are holding up while others are buckling.",
    'impact.label': 'THE IMPACT CHAIN',
    'impact.title': 'How rupee weakness reaches your wallet.',
    'impact.lede': 'A weaker rupee triggers three first-order effects — and each one cascades into something the household, the firm, or the central bank feels directly.',
    'ref.label': 'REFERENCES & DATA',
    'ref.title': 'The numbers, and where they come from.',
    'ref.lede': 'Every figure cited on this page, with its source and the date it was last verified. The data is a snapshot in time — exchange rates and yields move every minute.',
    'math.label': 'BASIC MATH',
    'math.title': 'See the formula behind the projection.',
    'math.lede': "Each slider has a coefficient. Subtract today's baseline. Multiply. Add them up. That's the model — no hidden steps.",
    'math.formula': 'Projected ₹/$ = ₹95.96 + Σ ( coefficient × (current value − baseline) )',
    'math.amount': 'Convert an amount',
    'math.amountHelp': 'See what $1,000 costs today versus at the simulated rate.',
    'math.usd': 'Dollars (USD)',
    'math.inrToday': "At today's ₹95.96",
    'math.inrSim': 'At simulated rate',
    'math.diff': 'Difference',
    'math.cheaper': 'cheaper',
    'math.costlier': 'costlier',
    'math.flat': 'same as today',
  },
  hi: {
    'nav.story': 'कहानी',
    'nav.history': 'इतिहास',
    'system.cardsLabel': 'वही तीन परतें, शब्दों में',
    'lflow.hint': 'एनिमेशन बदलने के लिए किसी परत पर टैप करें',
    'sim.hint': 'कोई भी स्लाइडर खिसकाएँ — दर, विश्लेषण और नतीजा तुरंत बदलते हैं',
    'nav.system': 'व्यवस्था',
    'nav.tools': 'उपकरण',
    'nav.scenarios': 'परिदृश्य',
    'nav.currencies': 'मुद्राएँ',
    'nav.impact': 'प्रभाव',
    'nav.learn': 'जानें',
    'hero.date': '14 मई, 2026',
    'hero.sub': 'डॉलर के मुकाबले अब तक का सबसे कम स्तर',
    'hero.puzzleLabel': 'पहेली',
    'hero.puzzle': 'अमेरिका दशकों से डॉलर छाप रहा है।<br>तो रुपया क्यों गिर रहा है, डॉलर क्यों नहीं?',
    'hero.cta': 'कहानी पढ़ें',
    'puzzle.label': 'अनुमान विफल',
    'puzzle.title': 'दुनिया में अधिक डॉलर का अर्थ है सस्ता डॉलर — होना चाहिए।',
    'puzzle.lede': 'किसी भी सामान्य मुद्रा के साथ यही होता है। लेकिन डॉलर सामान्य नहीं है। यह दुनिया की पाइपलाइन है — और जब दुनिया घबराती है, हर आयातक देश को ज़्यादा डॉलर चाहिए, फेड के छापने की रफ़्तार से भी तेज़।',
    'timeline.label': '26 वर्ष, दो रेखाएँ',
    'timeline.title': 'अमेरिका ने छापा। रुपया गिरा। वे साथ-साथ चले — अलग नहीं।',
    'printing.label': 'डॉलर छपाई कैसे काम करती है',
    'printing.title': 'जब फेड "छापता" है, तो असली प्रिंटिंग प्रेस नहीं चलती।',
    'printing.lede': 'डॉलर की आपूर्ति बैंकिंग सिस्टम के ज़रिए बढ़ती है — और जिस तरह यह बढ़ती है वही तय करती है कि रुपये को राहत मिलेगी या मार।',
    'system.label': 'व्यवस्था',
    'system.title': 'पहेली तीन परतों में सुलझती है।',
    'forces.label': 'चार बल',
    'forces.title': 'हर डॉलर-माँग की धारा एक साथ चल रही है।',
    'forces.lede': 'कोई एक कारण इस गिरावट को नहीं समझाता। 2026 में चार बल एक-दूसरे के ऊपर ढेर हो रहे हैं — और रुपये के पास छिपने की जगह नहीं है।',
    'sim.label': 'मान सिम्युलेटर',
    'sim.title': 'स्लाइडर सरकाओ। देखो रुपया कैसे जवाब देता है।',
    'sim.lede': 'पाँच मुख्य बलों का एक सरलीकृत रेखीय मॉडल — तेल, डॉलर की मज़बूती, पूँजी प्रवाह, फेड नीति, और RBI रक्षा। कोई भी इनपुट बदलें, अनुमानित USD/INR तुरंत अद्यतन होगा।',
    'ccy.label': 'अंतर-मुद्रा प्रभाव',
    'ccy.title': 'भारत अकेला नहीं है। डॉलर सबको हिला रहा है।',
    'ccy.lede': 'नीचे से कोई भी मुद्रा चुनें यह देखने के लिए कि वह उन्हीं बलों पर कैसे प्रतिक्रिया कर रही है जो रुपये को प्रभावित कर रहे हैं — और कुछ क्यों टिकी हुई हैं जबकि अन्य गिर रही हैं।',
    'impact.label': 'प्रभाव श्रृंखला',
    'impact.title': 'रुपये की कमज़ोरी आपकी जेब तक कैसे पहुँचती है।',
    'impact.lede': 'कमज़ोर रुपया तीन प्राथमिक प्रभाव पैदा करता है — और हर एक घर, फर्म, या केंद्रीय बैंक तक झरने की तरह पहुँचता है।',
    'ref.label': 'संदर्भ और डेटा',
    'ref.title': 'आँकड़े, और वे कहाँ से आते हैं।',
    'ref.lede': 'इस पृष्ठ पर उद्धृत हर आँकड़ा, उसके स्रोत और अंतिम सत्यापन की तारीख के साथ।',
    'math.label': 'बुनियादी गणित',
    'math.title': 'अनुमान के पीछे का सूत्र देखें।',
    'math.lede': 'हर स्लाइडर का एक गुणांक है। आज का आधार घटाओ। गुणा करो। जोड़ो। यही मॉडल है — कोई छुपा कदम नहीं।',
    'math.formula': 'अनुमानित ₹/$ = ₹95.96 + Σ ( गुणांक × (वर्तमान मान − आधार) )',
    'math.amount': 'राशि बदलें',
    'math.amountHelp': 'देखें $1,000 आज और सिम्युलेटेड दर पर कितने रुपये का।',
    'math.usd': 'डॉलर (USD)',
    'math.inrToday': 'आज की ₹95.96 पर',
    'math.inrSim': 'सिम्युलेटेड दर पर',
    'math.diff': 'अंतर',
    'math.cheaper': 'सस्ता',
    'math.costlier': 'महँगा',
    'math.flat': 'आज के बराबर',
    'nav.globe': 'दुनिया',
    'nav.solutions': 'रास्ता',
    'globe.label': 'ग्रह पर यह व्यवस्था',
    'globe.title': 'दुनिया घुमाइए। डॉलर और तेल के प्रवाह को देखिए।',
    'globe.lede': 'पेट्रोडॉलर व्यवस्था कोई अमूर्त विचार नहीं — यह असली भूगोल पर चलती है। अमेरिका डॉलर छापता है, भारत जैसे आयातक तेल के लिए डॉलर चुकाते हैं, और खाड़ी के निर्यातक उस अधिशेष को अमेरिकी ट्रेज़री में लौटा देते हैं। ग्लोब घुमाइए और ज़ूम कीजिए, फिर किसी देश पर टैप करके देखिए कि वह इस मशीन में कहाँ बैठता है।',
    'globe.note': 'देशों के चिह्न अनुमानित राजधानियों पर रखे गए हैं। आँकड़े इसी पृष्ठ पर उपयोग किया गया 14 मई 2026 का स्नैपशॉट हैं और हर देश की भूमिका दर्शाने के लिए हैं, लाइव डेटा नहीं।',
    'sol.label': 'रास्ता',
    'sol.title': 'रुपया फँसा है — पर बेबस नहीं। लीवर चुनिए।',
    'sol.lede': 'निदान तो कहानी का आधा हिस्सा है। भारत जो नीतिगत और संरचनात्मक कदम सचमुच उठा सकता है, उन्हें चुनिए — हर एक असली है, किसी न किसी रूप में पहले से जारी — और देखिए कि वे रुपये को ₹95.96 से कितना पीछे खींच सकते हैं। कोई अकेला लीवर इसे ठीक नहीं करता। मिलकर, ये जुड़ जाते हैं।',
    'lflow.label': 'विस्तृत प्रवाह · एनिमेटेड',
    'lflow.title': 'हर परत को गति में देखें।',
    'lflow.lede': 'डॉलर स्थिर नहीं रहते। वे विशिष्ट माध्यमों से घूमते हैं जो उनके प्रभुत्व को मजबूत करते हैं। प्रवाह देखने के लिए एक परत चुनें।',
    'lflow.tab1': 'प्लंबिंग के रूप में डॉलर',
    'lflow.tab2': 'पेट्रोडॉलर इंजन',
    'lflow.tab3': 'भारत दबाव में',
    'wo.label': 'विश्व व्यवस्था बदलना',
    'wo.title': 'यदि पेट्रोडॉलर बदलता है, तो गणित कैसा दिखता है?',
    'wo.lede': 'तीन धीमी गति वाली शक्तियाँ डॉलर के प्रभुत्व को कमजोर कर रही हैं। स्लाइडर घुमाकर देखें कि व्यवस्था कैसे प्रतिक्रिया देगी — और रुपये के लिए इसका क्या अर्थ होगा।',
    'wo.realLabel': 'वास्तविक प्रगति',
    'wo.realTitle': 'ज़मीन पर पहले से क्या हो रहा है।',
    'reel.label': 'रील के रूप में साझा करें',
    'reel.title': 'अपनी भाषा में एक वीडियो क्लिप बनाएँ।',
    'reel.lede': 'कहानी का सार प्रस्तुत करता एक स्वतः-निर्मित 30-सेकंड का पोर्ट्रेट वीडियो, ऊपर चुनी गई भाषा में वर्णन के साथ। आपके ब्राउज़र में बनता है — कुछ भी आपके डिवाइस से बाहर नहीं जाता।',
  },
  bn: {
    'nav.globe': 'বিশ্ব',
    'nav.solutions': 'উপায়',
    'globe.label': 'গ্রহের উপর এই ব্যবস্থা',
    'globe.title': 'বিশ্বকে ঘোরান। ডলার আর তেলের প্রবাহ অনুসরণ করুন।',
    'globe.lede': 'পেট্রোডলার ব্যবস্থা কোনো বিমূর্ত ধারণা নয় — এটি বাস্তব ভূগোলে চলে। যুক্তরাষ্ট্র ডলার ছাপে, ভারতের মতো আমদানিকারকরা তেলের জন্য ডলার দেয়, আর উপসাগরীয় রপ্তানিকারকরা সেই উদ্বৃত্ত মার্কিন ট্রেজারিতে ফিরিয়ে দেয়। গ্লোব ঘোরান ও জুম করুন, তারপর যেকোনো দেশে ট্যাপ করে দেখুন সে এই যন্ত্রে কোথায় আছে।',
    'globe.note': 'দেশের চিহ্নগুলি আনুমানিক রাজধানীতে স্থাপন করা হয়েছে। সংখ্যাগুলি এই পৃষ্ঠায় ব্যবহৃত ১৪ মে ২০২৬-এর স্ন্যাপশট এবং প্রতিটি দেশের ভূমিকা বোঝানোর জন্য, লাইভ ডেটা নয়।',
    'sol.label': 'উপায়',
    'sol.title': 'রুপি আটকে আছে — কিন্তু অসহায় নয়। লিভারগুলি বাছুন।',
    'sol.lede': 'রোগনির্ণয় গল্পের অর্ধেক মাত্র। ভারত বাস্তবে যে নীতিগত ও কাঠামোগত পদক্ষেপ নিতে পারে সেগুলি টগল করুন — প্রতিটি বাস্তব, কোনো না কোনো রূপে ইতিমধ্যে চলছে — এবং দেখুন সেগুলি রুপিকে ₹95.96 থেকে কতটা ফিরিয়ে আনতে পারে। একটি লিভারও একা এটি ঠিক করে না। একসাথে, এগুলি যোগ হয়।',
    'lflow.label': 'বিস্তারিত প্রবাহ · অ্যানিমেটেড',
    'lflow.title': 'প্রতিটি স্তরকে গতিতে দেখুন।',
    'lflow.lede': 'ডলার স্থির থাকে না। তারা নির্দিষ্ট চ্যানেলের মধ্য দিয়ে সঞ্চালিত হয় যা তাদের আধিপত্য দৃঢ় করে। প্রবাহ দেখতে একটি স্তর বেছে নিন।',
    'lflow.tab1': 'পাইপলাইন হিসেবে ডলার',
    'lflow.tab2': 'পেট্রোডলার ইঞ্জিন',
    'lflow.tab3': 'ভারত চাপে',
    'wo.label': 'বিশ্ব ব্যবস্থা বদলানো',
    'wo.title': 'পেট্রোডলার সরে গেলে হিসাবটা কেমন দাঁড়ায়?',
    'wo.lede': 'তিনটি ধীরগতির শক্তি ডলারের আধিপত্যে চিড় ধরাচ্ছে। স্লাইডার সরিয়ে দেখুন ব্যবস্থাটি কীভাবে সাড়া দেবে — এবং রুপির জন্য এর অর্থ কী।',
    'wo.realLabel': 'বাস্তব অগ্রগতি',
    'wo.realTitle': 'মাটিতে ইতিমধ্যে যা ঘটছে।',
    'reel.label': 'রিল হিসেবে শেয়ার করুন',
    'reel.title': 'আপনার ভাষায় একটি ভিডিও ক্লিপ তৈরি করুন।',
    'reel.lede': 'গল্পের সারাংশ তুলে ধরা একটি স্বয়ংক্রিয়ভাবে তৈরি ৩০-সেকেন্ডের পোর্ট্রেট ভিডিও, উপরে বেছে নেওয়া ভাষায় বর্ণনা সহ। আপনার ব্রাউজারে তৈরি হয় — কিছুই আপনার ডিভাইস থেকে বেরোয় না।',
    'nav.story': 'গল্প',
    'nav.history': 'ইতিহাস',
    'system.cardsLabel': 'একই তিনটি স্তর, কথায়',
    'lflow.hint': 'অ্যানিমেশন বদলাতে যেকোনো স্তরে ট্যাপ করুন',
    'sim.hint': 'যেকোনো স্লাইডার টানুন — রেট, বিশ্লেষণ ও রায় সঙ্গে সঙ্গে বদলায়',
    'nav.system': 'ব্যবস্থা',
    'nav.tools': 'সরঞ্জাম',
    'nav.scenarios': 'পরিস্থিতি',
    'nav.currencies': 'মুদ্রা',
    'nav.impact': 'প্রভাব',
    'nav.learn': 'জানুন',
    'hero.date': '১৪ মে, ২০২৬',
    'hero.sub': 'ডলারের বিপরীতে সর্বকালের সর্বনিম্ন',
    'hero.puzzleLabel': 'ধাঁধা',
    'hero.puzzle': 'যুক্তরাষ্ট্র কয়েক দশক ধরে ডলার ছাপছে।<br>তাহলে কেন রুপি পড়ছে, ডলার নয়?',
    'hero.cta': 'গল্পটি পড়ুন',
    'puzzle.label': 'সহজ যুক্তি ব্যর্থ হয়',
    'puzzle.title': 'বিশ্বে বেশি ডলার মানে সস্তা ডলার হওয়ার কথা।',
    'puzzle.lede': 'যেকোনো সাধারণ মুদ্রার ক্ষেত্রে ঠিক তাই ঘটে। কিন্তু ডলার সাধারণ নয়। এটি বিশ্বের নলব্যবস্থা — আর বিশ্ব যখন উদ্বিগ্ন হয়, প্রতিটি আমদানিকারক দেশের ফেডের ছাপার চেয়ে দ্রুত আরও ডলার দরকার হয়।',
    'timeline.label': '২৬ বছর, দুটি রেখা',
    'timeline.title': 'যুক্তরাষ্ট্র ছাপল। রুপি পড়ল। তারা একসাথে চলল — আলাদা নয়।',
    'printing.label': 'ডলার ছাপা কীভাবে কাজ করে',
    'printing.title': 'ফেড যখন "ছাপে", তখন সে আসল ছাপাখানা চালায় না।',
    'printing.lede': 'ডলারের সরবরাহ ব্যাংক ব্যবস্থার মাধ্যমে বাড়ে — আর কীভাবে বাড়ে তা ঠিক করে রুপি উৎসাহ পায় নাকি মার খায়।',
    'system.label': 'ব্যবস্থা',
    'system.title': 'ধাঁধাটি তিনটি স্তরে মীমাংসিত হয়।',
    'forces.label': 'চারটি শক্তি',
    'forces.title': 'প্রতিটি ডলার-চাহিদার ধারা একসাথে সক্রিয়।',
    'forces.lede': 'কোনো একক কারণ এই পতন ব্যাখ্যা করে না। ২০২৬-এ চারটি শক্তি একে অপরের উপর জমছে — আর রুপির লুকানোর জায়গা নেই।',
    'sim.label': 'মূল্য সিমুলেটর',
    'sim.title': 'স্লাইডার সরান। রুপির প্রতিক্রিয়া দেখুন।',
    'sim.lede': 'পাঁচটি প্রধান শক্তির একটি সরলীকৃত রৈখিক মডেল — তেল, ডলারের শক্তি, পুঁজিপ্রবাহ, ফেড নীতি ও আরবিআই প্রতিরক্ষা। যেকোনো ইনপুট বদলান, প্রক্ষেপিত USD/INR তৎক্ষণাৎ হালনাগাদ হয়।',
    'ccy.label': 'আন্তঃমুদ্রা প্রভাব',
    'ccy.title': 'ভারত একা নয়। ডলার সবাইকে নাড়াচ্ছে।',
    'ccy.lede': 'নিচের যেকোনো মুদ্রা বাছুন এবং দেখুন রুপির উপর আঘাত হানা একই শক্তির প্রতি সে কীভাবে সাড়া দিচ্ছে — আর কেন কিছু টিকে আছে আর কিছু ভেঙে পড়ছে।',
    'impact.label': 'প্রভাবের শৃঙ্খল',
    'impact.title': 'রুপির দুর্বলতা কীভাবে আপনার পকেটে পৌঁছায়।',
    'impact.lede': 'দুর্বল রুপি তিনটি প্রথম-স্তরের প্রভাব তৈরি করে — আর প্রতিটি এমন কিছুতে গড়ায় যা পরিবার, প্রতিষ্ঠান বা কেন্দ্রীয় ব্যাংক সরাসরি অনুভব করে।',
    'ref.label': 'তথ্যসূত্র ও ডেটা',
    'ref.title': 'সংখ্যাগুলি, আর সেগুলি কোথা থেকে আসে।',
    'ref.lede': 'এই পৃষ্ঠায় উদ্ধৃত প্রতিটি সংখ্যা, তার উৎস ও শেষ যাচাইয়ের তারিখসহ। ডেটা সময়ের একটি স্ন্যাপশট — বিনিময় হার ও ইল্ড প্রতি মিনিটে বদলায়।',
    'math.label': 'মৌলিক গণিত',
    'math.title': 'প্রক্ষেপণের পিছনের সূত্র দেখুন।',
    'math.lede': 'প্রতিটি স্লাইডারের একটি সহগ আছে। আজকের ভিত্তি বিয়োগ করুন। গুণ করুন। যোগ করুন। এটাই মডেল — কোনো লুকানো ধাপ নেই।',
    'math.formula': 'প্রক্ষেপিত ₹/$ = ₹95.96 + Σ ( সহগ × (বর্তমান মান − ভিত্তি) )',
    'math.amount': 'একটি পরিমাণ রূপান্তর করুন',
    'math.amountHelp': 'দেখুন $১,০০০ আজ বনাম সিমুলেটেড হারে কত পড়ে।',
    'math.usd': 'ডলার (USD)',
    'math.inrToday': 'আজকের ₹95.96 তে',
    'math.inrSim': 'সিমুলেটেড হারে',
    'math.diff': 'পার্থক্য',
    'math.cheaper': 'সস্তা',
    'math.costlier': 'দামি',
    'math.flat': 'আজকের মতোই',
  },
  ta: {
    'nav.globe': 'உலகம்',
    'nav.solutions': 'வழி',
    'globe.label': 'கிரகத்தின் மேல் இந்த அமைப்பு',
    'globe.title': 'உலகைச் சுழற்றுங்கள். டாலர்களையும் எண்ணெயையும் பின்தொடருங்கள்.',
    'globe.lede': 'பெட்ரோடாலர் அமைப்பு ஒரு கருத்தல்ல — அது உண்மையான புவியியலில் இயங்குகிறது. அமெரிக்கா டாலர்களை அச்சிடுகிறது, இந்தியா போன்ற இறக்குமதியாளர்கள் எண்ணெய்க்கு டாலர் செலுத்துகிறார்கள், வளைகுடா ஏற்றுமதியாளர்கள் அந்த உபரியை அமெரிக்க கருவூலப் பத்திரங்களில் மீண்டும் சேர்க்கிறார்கள். புவியைச் சுழற்றி பெரிதாக்குங்கள், பிறகு எந்த நாட்டையும் தட்டி அது இந்த இயந்திரத்தில் எங்கே இருக்கிறது என்பதைப் பாருங்கள்.',
    'globe.note': 'நாட்டுக் குறிகள் தோராயமான தலைநகரங்களில் வைக்கப்பட்டுள்ளன. புள்ளிவிவரங்கள் இந்தப் பக்கத்தில் பயன்படுத்தப்பட்ட மே 14, 2026 ஸ்னாப்ஷாட் ஆகும், ஒவ்வொரு நாட்டின் பங்கைக் காட்டுவதற்கானவை, நேரலைத் தரவு அல்ல.',
    'sol.label': 'வழி',
    'sol.title': 'ரூபாய் சிக்கியுள்ளது — ஆனால் இயலாதல்ல. நெம்புகோல்களைத் தேர்ந்தெடுங்கள்.',
    'sol.lede': 'நோய் கண்டறிதல் கதையின் பாதி மட்டுமே. இந்தியா உண்மையில் எடுக்கக்கூடிய கொள்கை மற்றும் கட்டமைப்பு நடவடிக்கைகளை மாற்றுங்கள் — ஒவ்வொன்றும் உண்மையானது, ஏதோ ஒரு வடிவில் ஏற்கனவே நடந்து வருகிறது — அவை ரூபாயை ₹95.96 இலிருந்து எவ்வளவு பின்னால் இழுக்க முடியும் என்பதைப் பாருங்கள். எந்த ஒரு நெம்புகோலும் தனியாக இதைச் சரிசெய்யாது. சேர்ந்தால், அவை கூடுகின்றன.',
    'lflow.label': 'விரிவான ஓட்டம் · அசைவூட்டப்பட்டது',
    'lflow.title': 'ஒவ்வொரு அடுக்கையும் இயக்கத்தில் காணுங்கள்.',
    'lflow.lede': 'டாலர்கள் அசையாமல் இருப்பதில்லை. அவை தமது ஆதிக்கத்தை உறுதிப்படுத்தும் குறிப்பிட்ட வழிகளில் சுழல்கின்றன. ஓட்டங்களைக் காண ஒரு அடுக்கைத் தேர்ந்தெடுக்கவும்.',
    'lflow.tab1': 'குழாய் அமைப்பாக டாலர்',
    'lflow.tab2': 'பெட்ரோடாலர் இயந்திரம்',
    'lflow.tab3': 'இந்தியா நெருக்கடியில்',
    'wo.label': 'உலக ஒழுங்கை மாற்றுதல்',
    'wo.title': 'பெட்ரோடாலர் மாறினால், கணக்கு எப்படி இருக்கும்?',
    'wo.lede': 'மூன்று மெதுவான சக்திகள் டாலரின் ஆதிக்கத்தை அரித்து வருகின்றன. அமைப்பு எப்படி எதிர்வினையாற்றும் — ரூபாய்க்கு அது என்ன அர்த்தம் என்பதைப் பார்க்க ஸ்லைடர்களை நகர்த்துங்கள்.',
    'wo.realLabel': 'நிஜ உலக முன்னேற்றம்',
    'wo.realTitle': 'தரையில் ஏற்கனவே நடப்பது என்ன.',
    'reel.label': 'ரீலாகப் பகிரவும்',
    'reel.title': 'உங்கள் மொழியில் ஒரு வீடியோ கிளிப்பை உருவாக்குங்கள்.',
    'reel.lede': 'கதையைச் சுருக்கமாகக் கூறும் தானாக உருவாக்கப்பட்ட 30-வினாடி செங்குத்து வீடியோ, மேலே தேர்ந்தெடுத்த மொழியில் விவரிப்புடன். உங்கள் உலாவியில் உருவாக்கப்படுகிறது — எதுவும் உங்கள் சாதனத்தை விட்டு வெளியேறாது.',
    'nav.story': 'கதை',
    'nav.history': 'வரலாறு',
    'system.cardsLabel': 'அதே மூன்று அடுக்குகள், சொற்களில்',
    'lflow.hint': 'அனிமேஷனை மாற்ற ஒரு அடுக்கைத் தட்டவும்',
    'sim.hint': 'எந்த ஸ்லைடரையும் நகர்த்துங்கள் — விகிதம், பகுப்பாய்வு, தீர்ப்பு உடனே மாறும்',
    'nav.system': 'அமைப்பு',
    'nav.tools': 'கருவிகள்',
    'nav.scenarios': 'காட்சிகள்',
    'nav.currencies': 'நாணயங்கள்',
    'nav.impact': 'தாக்கம்',
    'nav.learn': 'அறிக',
    'hero.date': 'மே 14, 2026',
    'hero.sub': 'டாலருக்கு எதிராக எப்போதும் இல்லாத தாழ்வு',
    'hero.puzzleLabel': 'புதிர்',
    'hero.puzzle': 'அமெரிக்கா பல பத்தாண்டுகளாக டாலர்களை அச்சிட்டு வருகிறது.<br>அப்படியானால் ஏன் ரூபாய் வீழ்கிறது, டாலர் அல்ல?',
    'hero.cta': 'கதையைப் படியுங்கள்',
    'puzzle.label': 'உள்ளுணர்வு தோற்கிறது',
    'puzzle.title': 'உலகில் அதிக டாலர்கள் என்றால் மலிவான டாலர் என்று பொருள்.',
    'puzzle.lede': 'எந்த சாதாரண நாணயத்திற்கும் அதுதான் நடக்கும். ஆனால் டாலர் சாதாரணமானதல்ல. அது உலகின் குழாய் அமைப்பு — உலகம் கவலைப்படும்போது, ஒவ்வொரு இறக்குமதி நாட்டுக்கும் ஃபெட் அச்சிடுவதை விட வேகமாக அதிக டாலர்கள் தேவைப்படுகின்றன.',
    'timeline.label': '26 ஆண்டுகள், இரண்டு கோடுகள்',
    'timeline.title': 'அமெரிக்கா அச்சிட்டது. ரூபாய் வீழ்ந்தது. அவை ஒன்றாக நகர்ந்தன — விலகவில்லை.',
    'printing.label': 'டாலர் அச்சிடல் எப்படி வேலை செய்கிறது',
    'printing.title': 'ஃபெட் "அச்சிடும்போது", அது உண்மையான அச்சு இயந்திரங்களை இயக்குவதில்லை.',
    'printing.lede': 'டாலர் வழங்கல் வங்கி அமைப்பின் மூலம் விரிவடைகிறது — அது எப்படி விரிவடைகிறது என்பது ரூபாய்க்கு ஊக்கமா அல்லது அடியா என்பதை தீர்மானிக்கிறது.',
    'system.label': 'அமைப்பு',
    'system.title': 'புதிர் மூன்று அடுக்குகளில் தீர்கிறது.',
    'forces.label': 'நான்கு சக்திகள்',
    'forces.title': 'ஒவ்வொரு டாலர்-தேவை ஓட்டமும் ஒரே நேரத்தில் இயங்குகிறது.',
    'forces.lede': 'எந்த ஒரு காரணியும் இந்த வீழ்ச்சியை விளக்கவில்லை. 2026-இல் நான்கு சக்திகள் ஒன்றின் மேல் ஒன்றாக அடுக்கப்படுகின்றன — ரூபாய்க்கு மறைய இடமில்லை.',
    'sim.label': 'மதிப்பு உருவகி',
    'sim.title': 'ஸ்லைடர்களை நகர்த்துங்கள். ரூபாயின் பதிலைப் பாருங்கள்.',
    'sim.lede': 'ஐந்து முக்கிய சக்திகளின் எளிமையாக்கப்பட்ட நேரியல் மாதிரி — எண்ணெய், டாலர் வலிமை, மூலதன ஓட்டம், ஃபெட் கொள்கை, ரிசர்வ் வங்கி பாதுகாப்பு. எந்த உள்ளீட்டையும் மாற்றுங்கள், கணிக்கப்பட்ட USD/INR உடனே புதுப்பிக்கப்படும்.',
    'ccy.label': 'குறுக்கு-நாணய தாக்கம்',
    'ccy.title': 'இந்தியா தனியல்ல. டாலர் அனைவரையும் அசைக்கிறது.',
    'ccy.lede': 'கீழே எந்த நாணயத்தையும் தேர்ந்தெடுத்து, ரூபாயைத் தாக்கும் அதே சக்திகளுக்கு அது எப்படி பதிலளிக்கிறது — சில ஏன் தாக்குப்பிடிக்கின்றன, சில ஏன் சரிகின்றன என்பதைப் பாருங்கள்.',
    'impact.label': 'தாக்க சங்கிலி',
    'impact.title': 'ரூபாய் பலவீனம் உங்கள் பணப்பையை எப்படி அடைகிறது.',
    'impact.lede': 'பலவீனமான ரூபாய் மூன்று முதல்-நிலை விளைவுகளைத் தூண்டுகிறது — ஒவ்வொன்றும் குடும்பம், நிறுவனம் அல்லது மத்திய வங்கி நேரடியாக உணரும் ஒன்றாக நீள்கிறது.',
    'ref.label': 'மேற்கோள்கள் & தரவு',
    'ref.title': 'எண்கள், அவை எங்கிருந்து வருகின்றன.',
    'ref.lede': 'இந்தப் பக்கத்தில் மேற்கோள் காட்டப்பட்ட ஒவ்வொரு எண்ணும், அதன் ஆதாரம் மற்றும் கடைசியாக சரிபார்க்கப்பட்ட தேதியுடன். தரவு ஒரு கால ஸ்னாப்ஷாட் — மாற்று விகிதங்களும் ஈல்டுகளும் ஒவ்வொரு நிமிடமும் மாறுகின்றன.',
    'math.label': 'அடிப்படை கணிதம்',
    'math.title': 'கணிப்பின் பின்னால் உள்ள சூத்திரத்தைப் பாருங்கள்.',
    'math.lede': 'ஒவ்வொரு ஸ்லைடருக்கும் ஒரு குணகம் உண்டு. இன்றைய அடிப்படையைக் கழியுங்கள். பெருக்குங்கள். கூட்டுங்கள். அதுதான் மாதிரி — மறைந்த படிகள் இல்லை.',
    'math.formula': 'கணிக்கப்பட்ட ₹/$ = ₹95.96 + Σ ( குணகம் × (தற்போதைய மதிப்பு − அடிப்படை) )',
    'math.amount': 'ஒரு தொகையை மாற்றுங்கள்',
    'math.amountHelp': '$1,000 இன்று எவ்வளவு, சிமுலேட்டட் விகிதத்தில் எவ்வளவு எனப் பாருங்கள்.',
    'math.usd': 'டாலர் (USD)',
    'math.inrToday': 'இன்றைய ₹95.96 இல்',
    'math.inrSim': 'சிமுலேட்டட் விகிதத்தில்',
    'math.diff': 'வேறுபாடு',
    'math.cheaper': 'மலிவு',
    'math.costlier': 'விலை உயர்வு',
    'math.flat': 'இன்றைப் போலவே',
  },
  te: {
    'nav.globe': 'ప్రపంచం',
    'nav.solutions': 'మార్గం',
    'globe.label': 'గ్రహం మీద ఈ వ్యవస్థ',
    'globe.title': 'ప్రపంచాన్ని తిప్పండి. డాలర్లను, చమురును అనుసరించండి.',
    'globe.lede': 'పెట్రోడాలర్ వ్యవస్థ ఒక భావన కాదు — అది నిజమైన భౌగోళికం మీద నడుస్తుంది. అమెరికా డాలర్లను ముద్రిస్తుంది, భారత్ వంటి దిగుమతిదారులు చమురు కోసం డాలర్లు చెల్లిస్తారు, గల్ఫ్ ఎగుమతిదారులు ఆ మిగులును అమెరికా ట్రెజరీలలోకి తిరిగి పంపుతారు. గ్లోబ్‌ను తిప్పి జూమ్ చేయండి, తర్వాత ఏ దేశాన్నైనా నొక్కి అది ఈ యంత్రంలో ఎక్కడ ఉందో చూడండి.',
    'globe.note': 'దేశ గుర్తులు సుమారు రాజధానుల వద్ద ఉంచబడ్డాయి. గణాంకాలు ఈ పేజీలో ఉపయోగించిన మే 14, 2026 స్నాప్‌షాట్ మరియు ప్రతి దేశ పాత్రను చూపించడానికి, లైవ్ డేటా కాదు.',
    'sol.label': 'మార్గం',
    'sol.title': 'రూపాయి చిక్కుకుంది — కానీ నిస్సహాయం కాదు. లివర్‌లను ఎంచుకోండి.',
    'sol.lede': 'నిర్ధారణ కథలో సగం మాత్రమే. భారత్ నిజంగా తీసుకోగల విధాన, నిర్మాణాత్మక చర్యలను టోగుల్ చేయండి — ప్రతి ఒక్కటీ నిజమైనది, ఏదో ఒక రూపంలో ఇప్పటికే జరుగుతోంది — అవి రూపాయిని ₹95.96 నుండి ఎంత వెనక్కి లాగగలవో చూడండి. ఏ ఒక్క లివర్ కూడా దీన్ని ఒంటరిగా సరిచేయదు. కలిసి, అవి కూడతాయి.',
    'lflow.label': 'వివరణాత్మక ప్రవాహం · యానిమేటెడ్',
    'lflow.title': 'ప్రతి పొరను చలనంలో చూడండి.',
    'lflow.lede': 'డాలర్లు నిశ్చలంగా ఉండవు. అవి తమ ఆధిపత్యాన్ని పటిష్ఠం చేసే నిర్దిష్ట మార్గాల ద్వారా ప్రసరిస్తాయి. ప్రవాహాలను చూడటానికి ఒక పొరను ఎంచుకోండి.',
    'lflow.tab1': 'పైప్‌లైన్‌గా డాలర్',
    'lflow.tab2': 'పెట్రోడాలర్ ఇంజిన్',
    'lflow.tab3': 'భారత్‌పై ఒత్తిడి',
    'wo.label': 'ప్రపంచ క్రమాన్ని మార్చడం',
    'wo.title': 'పెట్రోడాలర్ మారితే, లెక్క ఎలా ఉంటుంది?',
    'wo.lede': 'మూడు నెమ్మదిగా కదిలే శక్తులు డాలర్ ఆధిపత్యాన్ని క్షీణింపజేస్తున్నాయి. వ్యవస్థ ఎలా స్పందిస్తుందో — రూపాయికి దాని అర్థం ఏమిటో చూడటానికి స్లయిడర్‌లను జరపండి.',
    'wo.realLabel': 'వాస్తవ ప్రగతి',
    'wo.realTitle': 'క్షేత్రస్థాయిలో ఇప్పటికే జరుగుతున్నది.',
    'reel.label': 'రీల్‌గా షేర్ చేయండి',
    'reel.title': 'మీ భాషలో ఒక వీడియో క్లిప్‌ను రూపొందించండి.',
    'reel.lede': 'కథను సంక్షిప్తీకరించే స్వయంచాలకంగా రూపొందించిన 30-సెకన్ల నిలువు వీడియో, పైన ఎంచుకున్న భాషలో వ్యాఖ్యానంతో. మీ బ్రౌజర్‌లో రూపొందించబడుతుంది — ఏదీ మీ పరికరాన్ని విడిచిపెట్టదు.',
    'nav.story': 'కథ',
    'nav.history': 'చరిత్ర',
    'system.cardsLabel': 'అవే మూడు పొరలు, మాటల్లో',
    'lflow.hint': 'యానిమేషన్ మార్చడానికి ఒక పొరపై నొక్కండి',
    'sim.hint': 'ఏ స్లైడర్‌నైనా జరపండి — రేటు, విశ్లేషణ, తీర్పు వెంటనే మారతాయి',
    'nav.system': 'వ్యవస్థ',
    'nav.tools': 'సాధనాలు',
    'nav.scenarios': 'సన్నివేశాలు',
    'nav.currencies': 'కరెన్సీలు',
    'nav.impact': 'ప్రభావం',
    'nav.learn': 'తెలుసుకోండి',
    'hero.date': 'మే 14, 2026',
    'hero.sub': 'డాలర్‌తో పోలిస్తే సర్వకాల కనిష్ఠం',
    'hero.puzzleLabel': 'చిక్కు',
    'hero.puzzle': 'అమెరికా దశాబ్దాలుగా డాలర్లు ముద్రిస్తోంది.<br>మరి ఎందుకు రూపాయి పడుతోంది, డాలర్ కాదు?',
    'hero.cta': 'కథను చదవండి',
    'puzzle.label': 'సహజ అంచనా విఫలమవుతుంది',
    'puzzle.title': 'ప్రపంచంలో ఎక్కువ డాలర్లు అంటే చౌక డాలర్ కావాలి.',
    'puzzle.lede': 'ఏ సాధారణ కరెన్సీకైనా అదే జరుగుతుంది. కానీ డాలర్ సాధారణమైనది కాదు. అది ప్రపంచపు గొట్టపు వ్యవస్థ — ప్రపంచం ఆందోళన చెందినప్పుడు, ప్రతి దిగుమతి దేశానికి ఫెడ్ ముద్రించే దానికంటే వేగంగా ఎక్కువ డాలర్లు అవసరం.',
    'timeline.label': '26 సంవత్సరాలు, రెండు గీతలు',
    'timeline.title': 'అమెరికా ముద్రించింది. రూపాయి పడింది. అవి కలిసి కదిలాయి — విడిపోలేదు.',
    'printing.label': 'డాలర్ ముద్రణ ఎలా పనిచేస్తుంది',
    'printing.title': 'ఫెడ్ "ముద్రించినప్పుడు", అది నిజమైన ముద్రణ యంత్రాలను నడపదు.',
    'printing.lede': 'డాలర్ సరఫరా బ్యాంకింగ్ వ్యవస్థ ద్వారా విస్తరిస్తుంది — అది ఎలా విస్తరిస్తుందో అనేది రూపాయికి ప్రోత్సాహమా లేక దెబ్బా అని నిర్ణయిస్తుంది.',
    'system.label': 'వ్యవస్థ',
    'system.title': 'చిక్కు మూడు పొరల్లో పరిష్కారమవుతుంది.',
    'forces.label': 'నాలుగు శక్తులు',
    'forces.title': 'ప్రతి డాలర్-డిమాండ్ ప్రవాహం ఒకేసారి పనిచేస్తోంది.',
    'forces.lede': 'ఏ ఒక్క కారణం ఈ పతనాన్ని వివరించదు. 2026లో నాలుగు శక్తులు ఒకదానిపై ఒకటి పేరుకుపోతున్నాయి — రూపాయికి దాక్కునే చోటు లేదు.',
    'sim.label': 'విలువ సిమ్యులేటర్',
    'sim.title': 'స్లైడర్లను కదపండి. రూపాయి స్పందనను చూడండి.',
    'sim.lede': 'ఐదు ప్రధాన శక్తుల సరళీకృత రేఖీయ నమూనా — చమురు, డాలర్ బలం, పెట్టుబడి ప్రవాహాలు, ఫెడ్ విధానం, ఆర్‌బీఐ రక్షణ. ఏ ఇన్‌పుట్‌నైనా మార్చండి, అంచనా వేసిన USD/INR తక్షణం నవీకరించబడుతుంది.',
    'ccy.label': 'క్రాస్-కరెన్సీ ప్రభావం',
    'ccy.title': 'భారత్ ఒంటరిగా లేదు. డాలర్ అందరినీ కదిలిస్తోంది.',
    'ccy.lede': 'దిగువ ఏ కరెన్సీనైనా ఎంచుకుని, రూపాయిని తాకే అదే శక్తులకు అది ఎలా స్పందిస్తోందో — కొన్ని ఎందుకు నిలబడతాయో, కొన్ని ఎందుకు కుంగిపోతాయో చూడండి.',
    'impact.label': 'ప్రభావ గొలుసు',
    'impact.title': 'రూపాయి బలహీనత మీ జేబును ఎలా చేరుతుంది.',
    'impact.lede': 'బలహీన రూపాయి మూడు మొదటి-స్థాయి ప్రభావాలను ప్రేరేపిస్తుంది — ప్రతి ఒక్కటీ కుటుంబం, సంస్థ లేదా కేంద్ర బ్యాంకు నేరుగా అనుభవించే దానికి దారితీస్తుంది.',
    'ref.label': 'సూచనలు & డేటా',
    'ref.title': 'సంఖ్యలు, అవి ఎక్కడి నుండి వస్తాయి.',
    'ref.lede': 'ఈ పేజీలో ఉదహరించిన ప్రతి సంఖ్య, దాని మూలం మరియు చివరిగా ధృవీకరించిన తేదీతో. డేటా ఒక కాల స్నాప్‌షాట్ — మారకపు రేట్లు, ఈల్డ్‌లు ప్రతి నిమిషం మారుతాయి.',
    'math.label': 'ప్రాథమిక గణితం',
    'math.title': 'అంచనా వెనుక సూత్రాన్ని చూడండి.',
    'math.lede': 'ప్రతి స్లైడర్‌కు ఒక గుణకం ఉంది. నేటి ప్రాతిపదికను తీసివేయండి. గుణించండి. కూడండి. అదే నమూనా — దాచిన దశలు లేవు.',
    'math.formula': 'అంచనా ₹/$ = ₹95.96 + Σ ( గుణకం × (ప్రస్తుత విలువ − ప్రాతిపదిక) )',
    'math.amount': 'ఒక మొత్తాన్ని మార్చండి',
    'math.amountHelp': '$1,000 నేడు ఎంత, సిమ్యులేటెడ్ రేటులో ఎంత చూడండి.',
    'math.usd': 'డాలర్లు (USD)',
    'math.inrToday': 'నేటి ₹95.96 వద్ద',
    'math.inrSim': 'సిమ్యులేటెడ్ రేటులో',
    'math.diff': 'తేడా',
    'math.cheaper': 'చౌక',
    'math.costlier': 'ఖరీదు',
    'math.flat': 'నేటిలాగే',
  },
  mr: {
    'nav.globe': 'जग',
    'nav.solutions': 'मार्ग',
    'globe.label': 'ग्रहावरील ही व्यवस्था',
    'globe.title': 'जग फिरवा. डॉलर आणि तेलाचा प्रवाह पाहा.',
    'globe.lede': 'पेट्रोडॉलर व्यवस्था ही अमूर्त कल्पना नाही — ती खऱ्या भूगोलावर चालते. अमेरिका डॉलर छापते, भारतासारखे आयातदार तेलासाठी डॉलर देतात, आणि आखाती निर्यातदार ती शिल्लक अमेरिकन ट्रेझरीमध्ये परत टाकतात. ग्लोब फिरवा आणि झूम करा, मग कोणत्याही देशावर टॅप करून तो या यंत्रात कुठे बसतो ते पाहा.',
    'globe.note': 'देशांची चिन्हे अंदाजे राजधान्यांवर ठेवली आहेत. आकडे या पानावर वापरलेला १४ मे २०२६ चा स्नॅपशॉट आहेत आणि प्रत्येक देशाची भूमिका दर्शवण्यासाठी आहेत, थेट डेटा नाही.',
    'sol.label': 'मार्ग',
    'sol.title': 'रुपया अडकला आहे — पण असहाय नाही. लिव्हर निवडा.',
    'sol.lede': 'निदान ही कथेची अर्धीच बाजू. भारत प्रत्यक्षात करू शकेल अशी धोरणात्मक व संरचनात्मक पावले टॉगल करा — प्रत्येक खरी आहे, कोणत्या ना कोणत्या स्वरूपात आधीच सुरू आहे — आणि ती रुपयाला ₹95.96 वरून किती मागे खेचू शकतात ते पाहा. एकही लिव्हर एकट्याने हे ठीक करत नाही. एकत्र, ती जमा होतात.',
    'lflow.label': 'तपशीलवार प्रवाह · अ‍ॅनिमेटेड',
    'lflow.title': 'प्रत्येक थर गतीमध्ये पाहा.',
    'lflow.lede': 'डॉलर स्थिर राहत नाहीत. ते त्यांचे वर्चस्व दृढ करणाऱ्या विशिष्ट मार्गांतून फिरतात. प्रवाह पाहण्यासाठी एक थर निवडा.',
    'lflow.tab1': 'नळयंत्रणा म्हणून डॉलर',
    'lflow.tab2': 'पेट्रोडॉलर इंजिन',
    'lflow.tab3': 'भारत दबावाखाली',
    'wo.label': 'जागतिक व्यवस्था बदलणे',
    'wo.title': 'पेट्रोडॉलर बदलल्यास गणित कसे दिसते?',
    'wo.lede': 'तीन संथ शक्ती डॉलरचे वर्चस्व कमकुवत करत आहेत. व्यवस्था कशी प्रतिसाद देईल — आणि रुपयासाठी त्याचा काय अर्थ आहे हे पाहण्यासाठी स्लायडर हलवा.',
    'wo.realLabel': 'प्रत्यक्ष प्रगती',
    'wo.realTitle': 'प्रत्यक्षात आधीच काय घडत आहे.',
    'reel.label': 'रील म्हणून शेअर करा',
    'reel.title': 'तुमच्या भाषेत एक व्हिडिओ क्लिप तयार करा.',
    'reel.lede': 'कथेचा सारांश देणारा स्वयं-निर्मित ३० सेकंदांचा उभा व्हिडिओ, वर निवडलेल्या भाषेत निवेदनासह. तुमच्या ब्राउझरमध्ये तयार होतो — काहीही तुमच्या डिव्हाइसमधून बाहेर जात नाही.',
    'nav.story': 'कथा',
    'nav.history': 'इतिहास',
    'system.cardsLabel': 'त्याच तीन स्तर, शब्दांत',
    'lflow.hint': 'अ‍ॅनिमेशन बदलण्यासाठी कोणत्याही स्तरावर टॅप करा',
    'sim.hint': 'कोणताही स्लायडर सरकवा — दर, विश्लेषण आणि निकाल लगेच बदलतात',
    'nav.system': 'व्यवस्था',
    'nav.tools': 'साधने',
    'nav.scenarios': 'परिस्थिती',
    'nav.currencies': 'चलने',
    'nav.impact': 'परिणाम',
    'nav.learn': 'जानें',
    'hero.date': '१४ मे, २०२६',
    'hero.sub': 'डॉलरच्या तुलनेत सार्वकालिक नीचांक',
    'hero.puzzleLabel': 'कोडे',
    'hero.puzzle': 'अमेरिका दशकांपासून डॉलर छापत आहे.<br>मग रुपया का पडतोय, डॉलर का नाही?',
    'hero.cta': 'कथा वाचा',
    'puzzle.label': 'सहज तर्क अपयशी ठरतो',
    'puzzle.title': 'जगात जास्त डॉलर म्हणजे स्वस्त डॉलर असायला हवा.',
    'puzzle.lede': 'कोणत्याही सामान्य चलनासाठी नेमके तेच घडते. पण डॉलर सामान्य नाही. तो जगाची नळयंत्रणा आहे — आणि जग अस्वस्थ झाले की प्रत्येक आयातदार देशाला फेड छापण्यापेक्षा वेगाने अधिक डॉलर लागतात.',
    'timeline.label': '२६ वर्षे, दोन रेषा',
    'timeline.title': 'अमेरिकेने छापले. रुपया पडला. ते एकत्र सरकले — वेगळे नाही.',
    'printing.label': 'डॉलर छपाई कशी चालते',
    'printing.title': 'फेड "छापते" तेव्हा ती खरी छापखाने चालवत नाही.',
    'printing.lede': 'डॉलरचा पुरवठा बँकिंग व्यवस्थेतून वाढतो — आणि तो कसा वाढतो यावर रुपयाला चालना मिळते की मार बसतो हे ठरते.',
    'system.label': 'व्यवस्था',
    'system.title': 'कोडे तीन थरांत सुटते.',
    'forces.label': 'चार शक्ती',
    'forces.title': 'प्रत्येक डॉलर-मागणी प्रवाह एकाच वेळी सक्रिय आहे.',
    'forces.lede': 'कोणताही एकच घटक ही घसरण स्पष्ट करत नाही. २०२६ मध्ये चार शक्ती एकावर एक रचल्या जात आहेत — आणि रुपयाला लपायला जागा नाही.',
    'sim.label': 'मूल्य सिम्युलेटर',
    'sim.title': 'स्लायडर हलवा. रुपयाचा प्रतिसाद पाहा.',
    'sim.lede': 'पाच प्रमुख शक्तींचे सरलीकृत रेषीय प्रारूप — तेल, डॉलरची ताकद, भांडवली प्रवाह, फेड धोरण आणि आरबीआय संरक्षण. कोणतेही इनपुट बदला, अंदाजित USD/INR तत्काळ अद्ययावत होते.',
    'ccy.label': 'आंतर-चलन परिणाम',
    'ccy.title': 'भारत एकटा नाही. डॉलर सर्वांना हलवत आहे.',
    'ccy.lede': 'खालील कोणतेही चलन निवडा आणि रुपयाला धडक देणाऱ्या त्याच शक्तींना ते कसे प्रतिसाद देते — काही का टिकतात आणि काही का कोसळतात ते पाहा.',
    'impact.label': 'परिणाम साखळी',
    'impact.title': 'रुपयाची कमजोरी तुमच्या खिशापर्यंत कशी पोहोचते.',
    'impact.lede': 'कमजोर रुपया तीन प्रथम-स्तरीय परिणाम घडवतो — आणि प्रत्येक कुटुंब, कंपनी किंवा मध्यवर्ती बँकेला थेट जाणवणाऱ्या गोष्टीत रूपांतरित होतो.',
    'ref.label': 'संदर्भ आणि डेटा',
    'ref.title': 'आकडे, आणि ते कुठून येतात.',
    'ref.lede': 'या पानावर उद्धृत केलेला प्रत्येक आकडा, त्याचा स्रोत आणि शेवटच्या पडताळणीच्या तारखेसह. डेटा हा काळाचा स्नॅपशॉट आहे — विनिमय दर आणि उत्पन्न दर प्रत्येक मिनिटाला बदलतात.',
    'math.label': 'मूलभूत गणित',
    'math.title': 'अंदाजामागील सूत्र पाहा.',
    'math.lede': 'प्रत्येक स्लायडरला एक गुणांक आहे. आजचा आधार वजा करा. गुणा. बेरीज करा. हेच प्रारूप — लपलेली पावले नाहीत.',
    'math.formula': 'अंदाजित ₹/$ = ₹95.96 + Σ ( गुणांक × (सध्याचे मूल्य − आधार) )',
    'math.amount': 'रक्कम रूपांतरित करा',
    'math.amountHelp': '$१,००० आज किती आणि सिम्युलेटेड दराने किती ते पाहा.',
    'math.usd': 'डॉलर (USD)',
    'math.inrToday': 'आजच्या ₹95.96 वर',
    'math.inrSim': 'सिम्युलेटेड दराने',
    'math.diff': 'फरक',
    'math.cheaper': 'स्वस्त',
    'math.costlier': 'महाग',
    'math.flat': 'आजच्यासारखेच',
  },
  gu: {
    'nav.globe': 'વિશ્વ',
    'nav.solutions': 'માર્ગ',
    'globe.label': 'ગ્રહ પર આ વ્યવસ્થા',
    'globe.title': 'વિશ્વ ફેરવો. ડોલર અને તેલનો પ્રવાહ અનુસરો.',
    'globe.lede': 'પેટ્રોડોલર વ્યવસ્થા કોઈ અમૂર્ત વિચાર નથી — તે વાસ્તવિક ભૂગોળ પર ચાલે છે. અમેરિકા ડોલર છાપે છે, ભારત જેવા આયાતકારો તેલ માટે ડોલર ચૂકવે છે, અને ગલ્ફના નિકાસકારો એ સરપ્લસ અમેરિકન ટ્રેઝરીમાં પાછો મૂકે છે. ગ્લોબ ફેરવો અને ઝૂમ કરો, પછી કોઈપણ દેશ પર ટૅપ કરીને જુઓ કે તે આ મશીનમાં ક્યાં બેસે છે.',
    'globe.note': 'દેશના ચિહ્નો અંદાજિત રાજધાનીઓ પર મૂક્યા છે. આંકડા આ પાના પર વપરાયેલ 14 મે 2026 નો સ્નેપશોટ છે અને દરેક દેશની ભૂમિકા દર્શાવવા માટે છે, લાઇવ ડેટા નથી.',
    'sol.label': 'માર્ગ',
    'sol.title': 'રૂપિયો ફસાયેલો છે — પણ લાચાર નથી. લિવર પસંદ કરો.',
    'sol.lede': 'નિદાન એ વાર્તાનો અડધો ભાગ છે. ભારત ખરેખર લઈ શકે તેવા નીતિગત અને માળખાકીય પગલાં ટૉગલ કરો — દરેક વાસ્તવિક છે, કોઈને કોઈ સ્વરૂપે પહેલેથી ચાલુ છે — અને જુઓ કે તે રૂપિયાને ₹95.96 થી કેટલો પાછળ ખેંચી શકે છે. કોઈ એક લિવર એકલું આને ઠીક કરતું નથી. સાથે મળીને, તે ઉમેરાય છે.',
    'lflow.label': 'વિગતવાર પ્રવાહ · એનિમેટેડ',
    'lflow.title': 'દરેક સ્તરને ગતિમાં જુઓ.',
    'lflow.lede': 'ડોલર સ્થિર રહેતા નથી. તેઓ ચોક્કસ માર્ગો દ્વારા ફરે છે જે તેમનું પ્રભુત્વ મજબૂત કરે છે. પ્રવાહ જોવા માટે એક સ્તર પસંદ કરો.',
    'lflow.tab1': 'પ્લમ્બિંગ તરીકે ડોલર',
    'lflow.tab2': 'પેટ્રોડોલર એન્જિન',
    'lflow.tab3': 'ભારત દબાણમાં',
    'wo.label': 'વિશ્વ વ્યવસ્થા બદલવી',
    'wo.title': 'જો પેટ્રોડોલર બદલાય, તો ગણિત કેવું દેખાય?',
    'wo.lede': 'ત્રણ ધીમી ગતિની શક્તિઓ ડોલરના પ્રભુત્વને નબળું પાડી રહી છે. વ્યવસ્થા કેવી પ્રતિક્રિયા આપશે — અને રૂપિયા માટે તેનો શું અર્થ છે તે જોવા સ્લાઇડર ખસેડો.',
    'wo.realLabel': 'વાસ્તવિક પ્રગતિ',
    'wo.realTitle': 'જમીન પર પહેલેથી શું થઈ રહ્યું છે.',
    'reel.label': 'રીલ તરીકે શેર કરો',
    'reel.title': 'તમારી ભાષામાં એક વિડિઓ ક્લિપ બનાવો.',
    'reel.lede': 'વાર્તાનો સારાંશ આપતો સ્વયં-નિર્મિત 30-સેકન્ડનો પોર્ટ્રેટ વિડિઓ, ઉપર પસંદ કરેલી ભાષામાં વર્ણન સાથે. તમારા બ્રાઉઝરમાં બને છે — કંઈપણ તમારા ડિવાઇસમાંથી બહાર જતું નથી.',
    'nav.story': 'વાર્તા',
    'nav.history': 'ઇતિહાસ',
    'system.cardsLabel': 'એ જ ત્રણ સ્તર, શબ્દોમાં',
    'lflow.hint': 'એનિમેશન બદલવા માટે કોઈપણ સ્તર પર ટૅપ કરો',
    'sim.hint': 'કોઈપણ સ્લાઇડર ખસેડો — દર, વિશ્લેષણ અને ચુકાદો તરત બદલાય છે',
    'nav.system': 'વ્યવસ્થા',
    'nav.tools': 'સાધનો',
    'nav.scenarios': 'પરિદૃશ્યો',
    'nav.currencies': 'ચલણો',
    'nav.impact': 'અસર',
    'nav.learn': 'જાણો',
    'hero.date': '૧૪ મે, ૨૦૨૬',
    'hero.sub': 'ડોલર સામે સર્વકાલીન નીચલી સપાટી',
    'hero.puzzleLabel': 'કોયડો',
    'hero.puzzle': 'અમેરિકા દાયકાઓથી ડોલર છાપી રહ્યું છે.<br>તો પછી રૂપિયો કેમ પડે છે, ડોલર કેમ નહીં?',
    'hero.cta': 'વાર્તા વાંચો',
    'puzzle.label': 'સહજ તર્ક નિષ્ફળ જાય છે',
    'puzzle.title': 'વિશ્વમાં વધુ ડોલર એટલે સસ્તો ડોલર હોવો જોઈએ.',
    'puzzle.lede': 'કોઈપણ સામાન્ય ચલણ માટે એ જ થાય છે. પણ ડોલર સામાન્ય નથી. તે વિશ્વની નળવ્યવસ્થા છે — અને જ્યારે વિશ્વ ચિંતિત થાય, ત્યારે દરેક આયાતકાર દેશને ફેડ છાપે તેના કરતાં ઝડપથી વધુ ડોલર જોઈએ છે.',
    'timeline.label': '૨૬ વર્ષ, બે રેખાઓ',
    'timeline.title': 'અમેરિકાએ છાપ્યું. રૂપિયો પડ્યો. તેઓ સાથે ચાલ્યા — અલગ નહીં.',
    'printing.label': 'ડોલર છપાઈ કેવી રીતે ચાલે છે',
    'printing.title': 'ફેડ "છાપે" ત્યારે તે ખરી છાપકામ મશીનો ચલાવતું નથી.',
    'printing.lede': 'ડોલરનો પુરવઠો બેંકિંગ વ્યવસ્થા દ્વારા વધે છે — અને તે કેવી રીતે વધે છે તે નક્કી કરે છે કે રૂપિયાને પ્રોત્સાહન મળે છે કે માર.',
    'system.label': 'વ્યવસ્થા',
    'system.title': 'કોયડો ત્રણ સ્તરોમાં ઉકેલાય છે.',
    'forces.label': 'ચાર બળો',
    'forces.title': 'દરેક ડોલર-માંગ પ્રવાહ એકસાથે સક્રિય છે.',
    'forces.lede': 'કોઈ એક પરિબળ આ ઘટાડો સમજાવતું નથી. ૨૦૨૬માં ચાર બળો એકબીજા પર ખડકાઈ રહ્યાં છે — અને રૂપિયા પાસે સંતાવાની જગ્યા નથી.',
    'sim.label': 'મૂલ્ય સિમ્યુલેટર',
    'sim.title': 'સ્લાઇડર ખસેડો. રૂપિયાનો પ્રતિભાવ જુઓ.',
    'sim.lede': 'પાંચ મુખ્ય બળોનું સરળીકૃત રેખીય મોડેલ — તેલ, ડોલરની તાકાત, મૂડીપ્રવાહ, ફેડ નીતિ અને આરબીઆઈ સંરક્ષણ. કોઈપણ ઇનપુટ બદલો, અંદાજિત USD/INR તરત જ અપડેટ થાય છે.',
    'ccy.label': 'આંતર-ચલણ અસર',
    'ccy.title': 'ભારત એકલું નથી. ડોલર બધાને હલાવી રહ્યો છે.',
    'ccy.lede': 'નીચે કોઈપણ ચલણ પસંદ કરો અને જુઓ કે રૂપિયાને ફટકારતાં એ જ બળોને તે કેવી રીતે પ્રતિભાવ આપે છે — કેમ કેટલાક ટકે છે અને કેટલાક તૂટે છે.',
    'impact.label': 'અસર સાંકળ',
    'impact.title': 'રૂપિયાની નબળાઈ તમારા ખિસ્સા સુધી કેવી રીતે પહોંચે છે.',
    'impact.lede': 'નબળો રૂપિયો ત્રણ પ્રથમ-સ્તરની અસરો સર્જે છે — અને દરેક કુટુંબ, પેઢી કે મધ્યસ્થ બેંક સીધી અનુભવે તેવી બાબતમાં પરિણમે છે.',
    'ref.label': 'સંદર્ભો અને ડેટા',
    'ref.title': 'આંકડા, અને તે ક્યાંથી આવે છે.',
    'ref.lede': 'આ પાના પર ટાંકેલો દરેક આંકડો, તેના સ્રોત અને છેલ્લે ચકાસ્યાની તારીખ સાથે. ડેટા સમયનો સ્નેપશોટ છે — વિનિમય દર અને યીલ્ડ દર મિનિટે બદલાય છે.',
    'math.label': 'મૂળભૂત ગણિત',
    'math.title': 'અંદાજ પાછળનું સૂત્ર જુઓ.',
    'math.lede': 'દરેક સ્લાઇડરને એક ગુણાંક છે. આજનો આધાર બાદ કરો. ગુણો. સરવાળો કરો. એ જ મોડેલ — કોઈ છુપાયેલા પગલાં નથી.',
    'math.formula': 'અંદાજિત ₹/$ = ₹95.96 + Σ ( ગુણાંક × (વર્તમાન મૂલ્ય − આધાર) )',
    'math.amount': 'રકમ રૂપાંતરિત કરો',
    'math.amountHelp': '$૧,૦૦૦ આજે કેટલા અને સિમ્યુલેટેડ દરે કેટલા તે જુઓ.',
    'math.usd': 'ડોલર (USD)',
    'math.inrToday': 'આજના ₹95.96 પર',
    'math.inrSim': 'સિમ્યુલેટેડ દરે',
    'math.diff': 'તફાવત',
    'math.cheaper': 'સસ્તું',
    'math.costlier': 'મોંઘું',
    'math.flat': 'આજના જેવું જ',
  },
  kn: {
    'nav.globe': 'ಜಗತ್ತು',
    'nav.solutions': 'ದಾರಿ',
    'globe.label': 'ಗ್ರಹದ ಮೇಲೆ ಈ ವ್ಯವಸ್ಥೆ',
    'globe.title': 'ಜಗತ್ತನ್ನು ತಿರುಗಿಸಿ. ಡಾಲರ್ ಮತ್ತು ತೈಲವನ್ನು ಅನುಸರಿಸಿ.',
    'globe.lede': 'ಪೆಟ್ರೋಡಾಲರ್ ವ್ಯವಸ್ಥೆ ಒಂದು ಅಮೂರ್ತ ಕಲ್ಪನೆಯಲ್ಲ — ಅದು ನಿಜವಾದ ಭೂಗೋಳದ ಮೇಲೆ ನಡೆಯುತ್ತದೆ. ಅಮೆರಿಕ ಡಾಲರ್ ಮುದ್ರಿಸುತ್ತದೆ, ಭಾರತದಂತಹ ಆಮದುದಾರರು ತೈಲಕ್ಕೆ ಡಾಲರ್ ಪಾವತಿಸುತ್ತಾರೆ, ಗಲ್ಫ್ ರಫ್ತುದಾರರು ಆ ಹೆಚ್ಚುವರಿಯನ್ನು ಅಮೆರಿಕದ ಖಜಾನೆ ಪತ್ರಗಳಿಗೆ ಮರಳಿಸುತ್ತಾರೆ. ಗ್ಲೋಬ್ ತಿರುಗಿಸಿ ಜೂಮ್ ಮಾಡಿ, ನಂತರ ಯಾವುದೇ ದೇಶವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ಅದು ಈ ಯಂತ್ರದಲ್ಲಿ ಎಲ್ಲಿದೆ ಎಂದು ನೋಡಿ.',
    'globe.note': 'ದೇಶಗಳ ಗುರುತುಗಳನ್ನು ಅಂದಾಜು ರಾಜಧಾನಿಗಳಲ್ಲಿ ಇರಿಸಲಾಗಿದೆ. ಅಂಕಿಅಂಶಗಳು ಈ ಪುಟದಲ್ಲಿ ಬಳಸಿದ ಮೇ 14, 2026 ರ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ ಆಗಿದ್ದು ಪ್ರತಿ ದೇಶದ ಪಾತ್ರವನ್ನು ತೋರಿಸಲು, ಲೈವ್ ಡೇಟಾ ಅಲ್ಲ.',
    'sol.label': 'ದಾರಿ',
    'sol.title': 'ರೂಪಾಯಿ ಸಿಕ್ಕಿಹಾಕಿಕೊಂಡಿದೆ — ಆದರೆ ಅಸಹಾಯಕವಲ್ಲ. ಲಿವರ್‌ಗಳನ್ನು ಆರಿಸಿ.',
    'sol.lede': 'ರೋಗನಿರ್ಣಯ ಕಥೆಯ ಅರ್ಧ ಮಾತ್ರ. ಭಾರತ ನಿಜವಾಗಿ ತೆಗೆದುಕೊಳ್ಳಬಹುದಾದ ನೀತಿ ಮತ್ತು ರಚನಾತ್ಮಕ ಕ್ರಮಗಳನ್ನು ಟಾಗಲ್ ಮಾಡಿ — ಪ್ರತಿಯೊಂದೂ ನಿಜ, ಯಾವುದೋ ರೂಪದಲ್ಲಿ ಈಗಾಗಲೇ ನಡೆಯುತ್ತಿದೆ — ಅವು ರೂಪಾಯಿಯನ್ನು ₹95.96 ರಿಂದ ಎಷ್ಟು ಹಿಂದಕ್ಕೆ ಎಳೆಯಬಹುದು ಎಂದು ನೋಡಿ. ಯಾವುದೇ ಒಂದು ಲಿವರ್ ಒಂಟಿಯಾಗಿ ಇದನ್ನು ಸರಿಪಡಿಸುವುದಿಲ್ಲ. ಒಟ್ಟಾಗಿ, ಅವು ಸೇರುತ್ತವೆ.',
    'lflow.label': 'ವಿವರವಾದ ಹರಿವು · ಅನಿಮೇಟೆಡ್',
    'lflow.title': 'ಪ್ರತಿ ಪದರವನ್ನು ಚಲನೆಯಲ್ಲಿ ನೋಡಿ.',
    'lflow.lede': 'ಡಾಲರ್‌ಗಳು ಸ್ಥಿರವಾಗಿ ಇರುವುದಿಲ್ಲ. ಅವು ತಮ್ಮ ಪ್ರಾಬಲ್ಯವನ್ನು ಗಟ್ಟಿಗೊಳಿಸುವ ನಿರ್ದಿಷ್ಟ ಮಾರ್ಗಗಳ ಮೂಲಕ ಸಂಚರಿಸುತ್ತವೆ. ಹರಿವುಗಳನ್ನು ನೋಡಲು ಒಂದು ಪದರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    'lflow.tab1': 'ಕೊಳವೆ ವ್ಯವಸ್ಥೆಯಾಗಿ ಡಾಲರ್',
    'lflow.tab2': 'ಪೆಟ್ರೋಡಾಲರ್ ಎಂಜಿನ್',
    'lflow.tab3': 'ಭಾರತ ಒತ್ತಡದಲ್ಲಿ',
    'wo.label': 'ವಿಶ್ವ ವ್ಯವಸ್ಥೆ ಬದಲಾಯಿಸುವಿಕೆ',
    'wo.title': 'ಪೆಟ್ರೋಡಾಲರ್ ಬದಲಾದರೆ, ಲೆಕ್ಕ ಹೇಗಿರುತ್ತದೆ?',
    'wo.lede': 'ಮೂರು ನಿಧಾನ ಶಕ್ತಿಗಳು ಡಾಲರ್ ಪ್ರಾಬಲ್ಯವನ್ನು ಕುಗ್ಗಿಸುತ್ತಿವೆ. ವ್ಯವಸ್ಥೆ ಹೇಗೆ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತದೆ — ಮತ್ತು ರೂಪಾಯಿಗೆ ಅದರ ಅರ್ಥವೇನು ಎಂಬುದನ್ನು ನೋಡಲು ಸ್ಲೈಡರ್‌ಗಳನ್ನು ಸರಿಸಿ.',
    'wo.realLabel': 'ವಾಸ್ತವ ಪ್ರಗತಿ',
    'wo.realTitle': 'ನೆಲದ ಮಟ್ಟದಲ್ಲಿ ಈಗಾಗಲೇ ಏನು ನಡೆಯುತ್ತಿದೆ.',
    'reel.label': 'ರೀಲ್ ಆಗಿ ಹಂಚಿಕೊಳ್ಳಿ',
    'reel.title': 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಒಂದು ವೀಡಿಯೊ ಕ್ಲಿಪ್ ರಚಿಸಿ.',
    'reel.lede': 'ಕಥೆಯನ್ನು ಸಂಕ್ಷೇಪಿಸುವ ಸ್ವಯಂ-ನಿರ್ಮಿತ 30-ಸೆಕೆಂಡ್ ಲಂಬ ವೀಡಿಯೊ, ಮೇಲೆ ಆಯ್ಕೆಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ನಿರೂಪಣೆಯೊಂದಿಗೆ. ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ರಚಿಸಲಾಗುತ್ತದೆ — ಏನೂ ನಿಮ್ಮ ಸಾಧನವನ್ನು ಬಿಟ್ಟು ಹೋಗುವುದಿಲ್ಲ.',
    'nav.story': 'ಕಥೆ',
    'nav.history': 'ಇತಿಹಾಸ',
    'system.cardsLabel': 'ಅದೇ ಮೂರು ಪದರಗಳು, ಪದಗಳಲ್ಲಿ',
    'lflow.hint': 'ಅನಿಮೇಷನ್ ಬದಲಿಸಲು ಯಾವುದೇ ಪದರವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ',
    'sim.hint': 'ಯಾವುದೇ ಸ್ಲೈಡರ್ ಎಳೆಯಿರಿ — ದರ, ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ತೀರ್ಪು ತಕ್ಷಣ ಬದಲಾಗುತ್ತವೆ',
    'nav.system': 'ವ್ಯವಸ್ಥೆ',
    'nav.tools': 'ಪರಿಕರಗಳು',
    'nav.scenarios': 'ಸನ್ನಿವೇಶಗಳು',
    'nav.currencies': 'ಕರೆನ್ಸಿಗಳು',
    'nav.impact': 'ಪರಿಣಾಮ',
    'nav.learn': 'ತಿಳಿಯಿರಿ',
    'hero.date': 'ಮೇ 14, 2026',
    'hero.sub': 'ಡಾಲರ್ ವಿರುದ್ಧ ಸಾರ್ವಕಾಲಿಕ ಕನಿಷ್ಠ',
    'hero.puzzleLabel': 'ಒಗಟು',
    'hero.puzzle': 'ಅಮೆರಿಕ ದಶಕಗಳಿಂದ ಡಾಲರ್‌ಗಳನ್ನು ಮುದ್ರಿಸುತ್ತಿದೆ.<br>ಹಾಗಾದರೆ ರೂಪಾಯಿ ಏಕೆ ಬೀಳುತ್ತಿದೆ, ಡಾಲರ್ ಅಲ್ಲ?',
    'hero.cta': 'ಕಥೆಯನ್ನು ಓದಿ',
    'puzzle.label': 'ಸಹಜ ಊಹೆ ವಿಫಲವಾಗುತ್ತದೆ',
    'puzzle.title': 'ಜಗತ್ತಿನಲ್ಲಿ ಹೆಚ್ಚು ಡಾಲರ್‌ಗಳು ಎಂದರೆ ಅಗ್ಗದ ಡಾಲರ್ ಆಗಬೇಕು.',
    'puzzle.lede': 'ಯಾವುದೇ ಸಾಮಾನ್ಯ ಕರೆನ್ಸಿಗೆ ನಿಖರವಾಗಿ ಅದೇ ಆಗುತ್ತದೆ. ಆದರೆ ಡಾಲರ್ ಸಾಮಾನ್ಯವಲ್ಲ. ಅದು ಜಗತ್ತಿನ ಕೊಳಾಯಿ ವ್ಯವಸ್ಥೆ — ಜಗತ್ತು ಆತಂಕಗೊಂಡಾಗ, ಪ್ರತಿ ಆಮದು ದೇಶಕ್ಕೆ ಫೆಡ್ ಮುದ್ರಿಸುವುದಕ್ಕಿಂತ ವೇಗವಾಗಿ ಹೆಚ್ಚು ಡಾಲರ್‌ಗಳು ಬೇಕಾಗುತ್ತವೆ.',
    'timeline.label': '26 ವರ್ಷಗಳು, ಎರಡು ರೇಖೆಗಳು',
    'timeline.title': 'ಅಮೆರಿಕ ಮುದ್ರಿಸಿತು. ರೂಪಾಯಿ ಬಿತ್ತು. ಅವು ಒಟ್ಟಿಗೆ ಚಲಿಸಿದವು — ಬೇರ್ಪಟ್ಟಿಲ್ಲ.',
    'printing.label': 'ಡಾಲರ್ ಮುದ್ರಣ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
    'printing.title': 'ಫೆಡ್ "ಮುದ್ರಿಸಿದಾಗ", ಅದು ನಿಜವಾದ ಮುದ್ರಣ ಯಂತ್ರಗಳನ್ನು ನಡೆಸುವುದಿಲ್ಲ.',
    'printing.lede': 'ಡಾಲರ್ ಪೂರೈಕೆ ಬ್ಯಾಂಕಿಂಗ್ ವ್ಯವಸ್ಥೆಯ ಮೂಲಕ ವಿಸ್ತರಿಸುತ್ತದೆ — ಅದು ಹೇಗೆ ವಿಸ್ತರಿಸುತ್ತದೆ ಎಂಬುದು ರೂಪಾಯಿಗೆ ಉತ್ತೇಜನವೋ ಅಥವಾ ಹೊಡೆತವೋ ಎಂದು ನಿರ್ಧರಿಸುತ್ತದೆ.',
    'system.label': 'ವ್ಯವಸ್ಥೆ',
    'system.title': 'ಒಗಟು ಮೂರು ಪದರಗಳಲ್ಲಿ ಪರಿಹಾರವಾಗುತ್ತದೆ.',
    'forces.label': 'ನಾಲ್ಕು ಶಕ್ತಿಗಳು',
    'forces.title': 'ಪ್ರತಿ ಡಾಲರ್-ಬೇಡಿಕೆ ಹರಿವು ಒಂದೇ ಬಾರಿಗೆ ಸಕ್ರಿಯವಾಗಿದೆ.',
    'forces.lede': 'ಯಾವುದೇ ಒಂದೇ ಅಂಶ ಈ ಕುಸಿತವನ್ನು ವಿವರಿಸುವುದಿಲ್ಲ. 2026ರಲ್ಲಿ ನಾಲ್ಕು ಶಕ್ತಿಗಳು ಒಂದರ ಮೇಲೊಂದು ಪೇರಿಸಿಕೊಳ್ಳುತ್ತಿವೆ — ರೂಪಾಯಿಗೆ ಅಡಗಲು ಜಾಗವಿಲ್ಲ.',
    'sim.label': 'ಮೌಲ್ಯ ಸಿಮ್ಯುಲೇಟರ್',
    'sim.title': 'ಸ್ಲೈಡರ್‌ಗಳನ್ನು ಸರಿಸಿ. ರೂಪಾಯಿಯ ಪ್ರತಿಕ್ರಿಯೆ ನೋಡಿ.',
    'sim.lede': 'ಐದು ಪ್ರಮುಖ ಶಕ್ತಿಗಳ ಸರಳೀಕೃತ ರೇಖೀಯ ಮಾದರಿ — ತೈಲ, ಡಾಲರ್ ಬಲ, ಬಂಡವಾಳ ಹರಿವು, ಫೆಡ್ ನೀತಿ ಮತ್ತು ಆರ್‌ಬಿಐ ರಕ್ಷಣೆ. ಯಾವುದೇ ಇನ್‌ಪುಟ್ ಬದಲಿಸಿ, ಅಂದಾಜು USD/INR ತಕ್ಷಣ ನವೀಕರಿಸುತ್ತದೆ.',
    'ccy.label': 'ಅಡ್ಡ-ಕರೆನ್ಸಿ ಪರಿಣಾಮ',
    'ccy.title': 'ಭಾರತ ಒಂಟಿಯಲ್ಲ. ಡಾಲರ್ ಎಲ್ಲರನ್ನೂ ಅಲುಗಾಡಿಸುತ್ತಿದೆ.',
    'ccy.lede': 'ಕೆಳಗಿನ ಯಾವುದೇ ಕರೆನ್ಸಿ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ರೂಪಾಯಿಗೆ ಹೊಡೆಯುವ ಅದೇ ಶಕ್ತಿಗಳಿಗೆ ಅದು ಹೇಗೆ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತದೆ — ಕೆಲವು ಏಕೆ ನಿಲ್ಲುತ್ತವೆ ಮತ್ತು ಕೆಲವು ಏಕೆ ಕುಸಿಯುತ್ತವೆ ಎಂದು ನೋಡಿ.',
    'impact.label': 'ಪರಿಣಾಮ ಸರಪಳಿ',
    'impact.title': 'ರೂಪಾಯಿ ದೌರ್ಬಲ್ಯ ನಿಮ್ಮ ಜೇಬನ್ನು ಹೇಗೆ ತಲುಪುತ್ತದೆ.',
    'impact.lede': 'ದುರ್ಬಲ ರೂಪಾಯಿ ಮೂರು ಮೊದಲ-ಹಂತದ ಪರಿಣಾಮಗಳನ್ನು ಪ್ರಚೋದಿಸುತ್ತದೆ — ಪ್ರತಿಯೊಂದೂ ಕುಟುಂಬ, ಸಂಸ್ಥೆ ಅಥವಾ ಕೇಂದ್ರ ಬ್ಯಾಂಕ್ ನೇರವಾಗಿ ಅನುಭವಿಸುವ ಯಾವುದಕ್ಕೋ ಹರಡುತ್ತದೆ.',
    'ref.label': 'ಉಲ್ಲೇಖಗಳು & ಡೇಟಾ',
    'ref.title': 'ಸಂಖ್ಯೆಗಳು, ಮತ್ತು ಅವು ಎಲ್ಲಿಂದ ಬರುತ್ತವೆ.',
    'ref.lede': 'ಈ ಪುಟದಲ್ಲಿ ಉಲ್ಲೇಖಿಸಿದ ಪ್ರತಿ ಸಂಖ್ಯೆ, ಅದರ ಮೂಲ ಮತ್ತು ಕೊನೆಯ ಪರಿಶೀಲನೆಯ ದಿನಾಂಕದೊಂದಿಗೆ. ಡೇಟಾ ಸಮಯದ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್ — ವಿನಿಮಯ ದರಗಳು ಮತ್ತು ಇಳುವರಿ ಪ್ರತಿ ನಿಮಿಷ ಬದಲಾಗುತ್ತವೆ.',
    'math.label': 'ಮೂಲ ಗಣಿತ',
    'math.title': 'ಅಂದಾಜಿನ ಹಿಂದಿನ ಸೂತ್ರವನ್ನು ನೋಡಿ.',
    'math.lede': 'ಪ್ರತಿ ಸ್ಲೈಡರ್‌ಗೆ ಒಂದು ಗುಣಾಂಕವಿದೆ. ಇಂದಿನ ಆಧಾರವನ್ನು ಕಳೆಯಿರಿ. ಗುಣಿಸಿ. ಕೂಡಿಸಿ. ಅದೇ ಮಾದರಿ — ಮರೆಯಾದ ಹಂತಗಳಿಲ್ಲ.',
    'math.formula': 'ಅಂದಾಜು ₹/$ = ₹95.96 + Σ ( ಗುಣಾಂಕ × (ಪ್ರಸ್ತುತ ಮೌಲ್ಯ − ಆಧಾರ) )',
    'math.amount': 'ಒಂದು ಮೊತ್ತವನ್ನು ಪರಿವರ್ತಿಸಿ',
    'math.amountHelp': '$1,000 ಇಂದು ಎಷ್ಟು ಮತ್ತು ಸಿಮ್ಯುಲೇಟೆಡ್ ದರದಲ್ಲಿ ಎಷ್ಟು ನೋಡಿ.',
    'math.usd': 'ಡಾಲರ್ (USD)',
    'math.inrToday': 'ಇಂದಿನ ₹95.96 ರಲ್ಲಿ',
    'math.inrSim': 'ಸಿಮ್ಯುಲೇಟೆಡ್ ದರದಲ್ಲಿ',
    'math.diff': 'ವ್ಯತ್ಯಾಸ',
    'math.cheaper': 'ಅಗ್ಗ',
    'math.costlier': 'ದುಬಾರಿ',
    'math.flat': 'ಇಂದಿನಂತೆಯೇ',
  },
  ml: {
    'nav.globe': 'ലോകം',
    'nav.solutions': 'വഴി',
    'globe.label': 'ഗ്രഹത്തിന് മുകളിലെ ഈ വ്യവസ്ഥ',
    'globe.title': 'ലോകത്തെ കറക്കുക. ഡോളറും എണ്ണയും പിന്തുടരുക.',
    'globe.lede': 'പെട്രോഡോളർ വ്യവസ്ഥ ഒരു അമൂർത്ത ആശയമല്ല — അത് യഥാർത്ഥ ഭൂമിശാസ്ത്രത്തിൽ പ്രവർത്തിക്കുന്നു. അമേരിക്ക ഡോളർ അച്ചടിക്കുന്നു, ഇന്ത്യ പോലുള്ള ഇറക്കുമതിക്കാർ എണ്ണയ്ക്ക് ഡോളർ നൽകുന്നു, ഗൾഫ് കയറ്റുമതിക്കാർ ആ മിച്ചം അമേരിക്കൻ ട്രഷറികളിലേക്ക് തിരികെ ഇടുന്നു. ഗ്ലോബ് കറക്കി സൂം ചെയ്യുക, പിന്നെ ഏതെങ്കിലും രാജ്യത്തിൽ ടാപ്പ് ചെയ്ത് അത് ഈ യന്ത്രത്തിൽ എവിടെയാണെന്ന് കാണുക.',
    'globe.note': 'രാജ്യ ചിഹ്നങ്ങൾ ഏകദേശ തലസ്ഥാനങ്ങളിൽ സ്ഥാപിച്ചിരിക്കുന്നു. കണക്കുകൾ ഈ പേജിൽ ഉപയോഗിച്ച 2026 മേയ് 14-ലെ സ്നാപ്‌ഷോട്ട് ആണ്, ഓരോ രാജ്യത്തിന്റെയും പങ്ക് കാണിക്കാനുള്ളതാണ്, ലൈവ് ഡാറ്റയല്ല.',
    'sol.label': 'വഴി',
    'sol.title': 'രൂപ കുടുങ്ങിയിരിക്കുന്നു — പക്ഷേ നിസ്സഹായമല്ല. ലിവറുകൾ തിരഞ്ഞെടുക്കുക.',
    'sol.lede': 'രോഗനിർണയം കഥയുടെ പകുതി മാത്രം. ഇന്ത്യക്ക് യഥാർത്ഥത്തിൽ എടുക്കാവുന്ന നയപരവും ഘടനാപരവുമായ നടപടികൾ ടോഗിൾ ചെയ്യുക — ഓരോന്നും യഥാർത്ഥമാണ്, ഏതെങ്കിലും രൂപത്തിൽ ഇതിനകം നടക്കുന്നു — അവ രൂപയെ ₹95.96-ൽ നിന്ന് എത്ര പിന്നോട്ട് വലിക്കാമെന്ന് കാണുക. ഒരു ലിവറും ഒറ്റയ്ക്ക് ഇത് പരിഹരിക്കില്ല. ഒരുമിച്ച്, അവ കൂടിച്ചേരുന്നു.',
    'lflow.label': 'വിശദമായ ഒഴുക്ക് · ആനിമേറ്റഡ്',
    'lflow.title': 'ഓരോ പാളിയും ചലനത്തിൽ കാണുക.',
    'lflow.lede': 'ഡോളറുകൾ നിശ്ചലമായി ഇരിക്കില്ല. അവയുടെ ആധിപത്യം ഉറപ്പിക്കുന്ന പ്രത്യേക വഴികളിലൂടെ അവ ചുറ്റിക്കറങ്ങുന്നു. ഒഴുക്കുകൾ കാണാൻ ഒരു പാളി തിരഞ്ഞെടുക്കുക.',
    'lflow.tab1': 'പൈപ്പ്‌ലൈനായി ഡോളർ',
    'lflow.tab2': 'പെട്രോഡോളർ എൻജിൻ',
    'lflow.tab3': 'ഇന്ത്യ ഞെരുക്കത്തിൽ',
    'wo.label': 'ലോകക്രമം മാറ്റുന്നു',
    'wo.title': 'പെട്രോഡോളർ മാറിയാൽ, കണക്ക് എങ്ങനെ ആയിരിക്കും?',
    'wo.lede': 'മൂന്ന് പതുക്കെ നീങ്ങുന്ന ശക്തികൾ ഡോളറിന്റെ ആധിപത്യത്തെ ദുർബലപ്പെടുത്തുന്നു. വ്യവസ്ഥ എങ്ങനെ പ്രതികരിക്കും — രൂപയ്ക്ക് അതിന്റെ അർത്ഥം എന്താണ് എന്ന് കാണാൻ സ്ലൈഡറുകൾ നീക്കുക.',
    'wo.realLabel': 'യഥാർത്ഥ പുരോഗതി',
    'wo.realTitle': 'നിലത്ത് ഇപ്പോൾ തന്നെ എന്താണ് സംഭവിക്കുന്നത്.',
    'reel.label': 'റീലായി പങ്കിടുക',
    'reel.title': 'നിങ്ങളുടെ ഭാഷയിൽ ഒരു വീഡിയോ ക്ലിപ്പ് സൃഷ്ടിക്കുക.',
    'reel.lede': 'കഥ സംഗ്രഹിക്കുന്ന സ്വയം-നിർമ്മിത 30-സെക്കൻഡ് പോർട്രെയ്റ്റ് വീഡിയോ, മുകളിൽ തിരഞ്ഞെടുത്ത ഭാഷയിൽ വിവരണത്തോടെ. നിങ്ങളുടെ ബ്രൗസറിൽ സൃഷ്ടിക്കപ്പെടുന്നു — ഒന്നും നിങ്ങളുടെ ഉപകരണത്തിൽ നിന്ന് പുറത്തുപോകുന്നില്ല.',
    'nav.story': 'കഥ',
    'nav.history': 'ചരിത്രം',
    'system.cardsLabel': 'അതേ മൂന്ന് പാളികൾ, വാക്കുകളിൽ',
    'lflow.hint': 'ആനിമേഷൻ മാറ്റാൻ ഏതെങ്കിലും പാളിയിൽ ടാപ്പ് ചെയ്യുക',
    'sim.hint': 'ഏതെങ്കിലും സ്ലൈഡർ നീക്കുക — നിരക്ക്, വിശകലനം, വിധി ഉടൻ മാറും',
    'nav.system': 'വ്യവസ്ഥ',
    'nav.tools': 'ഉപകരണങ്ങൾ',
    'nav.scenarios': 'സാഹചര്യങ്ങൾ',
    'nav.currencies': 'നാണയങ്ങൾ',
    'nav.impact': 'സ്വാധീനം',
    'nav.learn': 'അറിയുക',
    'hero.date': 'മേയ് 14, 2026',
    'hero.sub': 'ഡോളറിനെതിരെ എക്കാലത്തെയും താഴ്ന്ന നില',
    'hero.puzzleLabel': 'കടങ്കഥ',
    'hero.puzzle': 'അമേരിക്ക പതിറ്റാണ്ടുകളായി ഡോളർ അച്ചടിക്കുന്നു.<br>പിന്നെ എന്തുകൊണ്ട് രൂപ വീഴുന്നു, ഡോളറല്ല?',
    'hero.cta': 'കഥ വായിക്കുക',
    'puzzle.label': 'സഹജബോധം പരാജയപ്പെടുന്നു',
    'puzzle.title': 'ലോകത്ത് കൂടുതൽ ഡോളർ എന്നാൽ വിലകുറഞ്ഞ ഡോളർ ആകണം.',
    'puzzle.lede': 'ഏതൊരു സാധാരണ നാണയത്തിനും കൃത്യമായി അതാണ് സംഭവിക്കുന്നത്. പക്ഷേ ഡോളർ സാധാരണമല്ല. അത് ലോകത്തിന്റെ പൈപ്പ് സംവിധാനമാണ് — ലോകം ഉത്കണ്ഠപ്പെടുമ്പോൾ, ഓരോ ഇറക്കുമതി രാജ്യത്തിനും ഫെഡ് അച്ചടിക്കുന്നതിനേക്കാൾ വേഗത്തിൽ കൂടുതൽ ഡോളർ വേണം.',
    'timeline.label': '26 വർഷം, രണ്ട് വരകൾ',
    'timeline.title': 'അമേരിക്ക അച്ചടിച്ചു. രൂപ വീണു. അവ ഒരുമിച്ച് നീങ്ങി — വേർപിരിഞ്ഞില്ല.',
    'printing.label': 'ഡോളർ അച്ചടി എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    'printing.title': 'ഫെഡ് "അച്ചടിക്കുമ്പോൾ", അത് യഥാർത്ഥ അച്ചടിയന്ത്രങ്ങൾ പ്രവർത്തിപ്പിക്കുന്നില്ല.',
    'printing.lede': 'ഡോളർ വിതരണം ബാങ്കിംഗ് സംവിധാനത്തിലൂടെ വികസിക്കുന്നു — അത് എങ്ങനെ വികസിക്കുന്നു എന്നത് രൂപയ്ക്ക് ഉത്തേജനമോ അടിയോ എന്ന് നിർണയിക്കുന്നു.',
    'system.label': 'വ്യവസ്ഥ',
    'system.title': 'കടങ്കഥ മൂന്ന് പാളികളിൽ പരിഹരിക്കപ്പെടുന്നു.',
    'forces.label': 'നാല് ശക്തികൾ',
    'forces.title': 'എല്ലാ ഡോളർ-ഡിമാൻഡ് ഒഴുക്കും ഒരേസമയം സജീവമാണ്.',
    'forces.lede': 'ഒരൊറ്റ ഘടകവും ഈ ഇടിവ് വിശദീകരിക്കുന്നില്ല. 2026-ൽ നാല് ശക്തികൾ പരസ്പരം അടുക്കിവയ്ക്കപ്പെടുന്നു — രൂപയ്ക്ക് ഒളിക്കാൻ ഇടമില്ല.',
    'sim.label': 'മൂല്യ സിമുലേറ്റർ',
    'sim.title': 'സ്ലൈഡറുകൾ നീക്കുക. രൂപയുടെ പ്രതികരണം കാണുക.',
    'sim.lede': 'അഞ്ച് പ്രധാന ശക്തികളുടെ ലളിതമാക്കിയ രേഖീയ മാതൃക — എണ്ണ, ഡോളർ കരുത്ത്, മൂലധന ഒഴുക്ക്, ഫെഡ് നയം, ആർബിഐ പ്രതിരോധം. ഏത് ഇൻപുട്ടും മാറ്റുക, പ്രവചിച്ച USD/INR ഉടനടി പുതുക്കുന്നു.',
    'ccy.label': 'ക്രോസ്-കറൻസി സ്വാധീനം',
    'ccy.title': 'ഇന്ത്യ ഒറ്റയ്ക്കല്ല. ഡോളർ എല്ലാവരെയും ഇളക്കുന്നു.',
    'ccy.lede': 'താഴെയുള്ള ഏത് നാണയവും തിരഞ്ഞെടുത്ത്, രൂപയെ ബാധിക്കുന്ന അതേ ശക്തികളോട് അത് എങ്ങനെ പ്രതികരിക്കുന്നു — ചിലത് എന്തുകൊണ്ട് പിടിച്ചുനിൽക്കുന്നു, ചിലത് എന്തുകൊണ്ട് തകരുന്നു എന്ന് കാണുക.',
    'impact.label': 'സ്വാധീന ശൃംഖല',
    'impact.title': 'രൂപയുടെ ദൗർബല്യം നിങ്ങളുടെ പോക്കറ്റിൽ എങ്ങനെ എത്തുന്നു.',
    'impact.lede': 'ദുർബലമായ രൂപ മൂന്ന് ഒന്നാം-തല ഫലങ്ങൾ ഉണ്ടാക്കുന്നു — ഓരോന്നും കുടുംബമോ സ്ഥാപനമോ കേന്ദ്ര ബാങ്കോ നേരിട്ട് അനുഭവിക്കുന്ന ഒന്നിലേക്ക് വളരുന്നു.',
    'ref.label': 'അവലംബങ്ങൾ & ഡാറ്റ',
    'ref.title': 'സംഖ്യകൾ, അവ എവിടെ നിന്ന് വരുന്നു.',
    'ref.lede': 'ഈ പേജിൽ ഉദ്ധരിച്ച ഓരോ കണക്കും, അതിന്റെ ഉറവിടവും അവസാനം സ്ഥിരീകരിച്ച തീയതിയും സഹിതം. ഡാറ്റ ഒരു കാല സ്നാപ്‌ഷോട്ട് ആണ് — വിനിമയ നിരക്കുകളും യീൽഡും ഓരോ മിനിറ്റിലും മാറുന്നു.',
    'math.label': 'അടിസ്ഥാന ഗണിതം',
    'math.title': 'പ്രവചനത്തിന് പിന്നിലെ സൂത്രം കാണുക.',
    'math.lede': 'ഓരോ സ്ലൈഡറിനും ഒരു ഗുണകമുണ്ട്. ഇന്നത്തെ അടിസ്ഥാനം കുറയ്ക്കുക. ഗുണിക്കുക. കൂട്ടുക. അതാണ് മാതൃക — മറഞ്ഞ ഘട്ടങ്ങളില്ല.',
    'math.formula': 'പ്രവചിത ₹/$ = ₹95.96 + Σ ( ഗുണകം × (നിലവിലെ മൂല്യം − അടിസ്ഥാനം) )',
    'math.amount': 'ഒരു തുക പരിവർത്തനം ചെയ്യുക',
    'math.amountHelp': '$1,000 ഇന്ന് എത്ര, സിമുലേറ്റഡ് നിരക്കിൽ എത്ര എന്ന് കാണുക.',
    'math.usd': 'ഡോളർ (USD)',
    'math.inrToday': 'ഇന്നത്തെ ₹95.96-ൽ',
    'math.inrSim': 'സിമുലേറ്റഡ് നിരക്കിൽ',
    'math.diff': 'വ്യത്യാസം',
    'math.cheaper': 'വില കുറവ്',
    'math.costlier': 'വില കൂടുതൽ',
    'math.flat': 'ഇന്നത്തെപ്പോലെ',
  },
  pa: {
    'nav.globe': 'ਦੁਨੀਆ',
    'nav.solutions': 'ਰਾਹ',
    'globe.label': 'ਗ੍ਰਹਿ ਉੱਤੇ ਇਹ ਵਿਵਸਥਾ',
    'globe.title': 'ਦੁਨੀਆ ਘੁਮਾਓ। ਡਾਲਰ ਅਤੇ ਤੇਲ ਦੇ ਵਹਾਅ ਨੂੰ ਵੇਖੋ।',
    'globe.lede': 'ਪੈਟਰੋਡਾਲਰ ਵਿਵਸਥਾ ਕੋਈ ਅਮੂਰਤ ਵਿਚਾਰ ਨਹੀਂ — ਇਹ ਅਸਲ ਭੂਗੋਲ ਉੱਤੇ ਚੱਲਦੀ ਹੈ। ਅਮਰੀਕਾ ਡਾਲਰ ਛਾਪਦਾ ਹੈ, ਭਾਰਤ ਵਰਗੇ ਦਰਾਮਦਕਾਰ ਤੇਲ ਲਈ ਡਾਲਰ ਦਿੰਦੇ ਹਨ, ਅਤੇ ਖਾੜੀ ਦੇ ਬਰਾਮਦਕਾਰ ਉਹ ਵਾਧੂ ਅਮਰੀਕੀ ਖਜ਼ਾਨੇ ਵਿੱਚ ਵਾਪਸ ਪਾ ਦਿੰਦੇ ਹਨ। ਗਲੋਬ ਘੁਮਾਓ ਤੇ ਜ਼ੂਮ ਕਰੋ, ਫਿਰ ਕਿਸੇ ਵੀ ਦੇਸ਼ ਉੱਤੇ ਟੈਪ ਕਰਕੇ ਵੇਖੋ ਕਿ ਉਹ ਇਸ ਮਸ਼ੀਨ ਵਿੱਚ ਕਿੱਥੇ ਬੈਠਦਾ ਹੈ।',
    'globe.note': 'ਦੇਸ਼ਾਂ ਦੇ ਨਿਸ਼ਾਨ ਅੰਦਾਜ਼ਨ ਰਾਜਧਾਨੀਆਂ ਉੱਤੇ ਰੱਖੇ ਗਏ ਹਨ। ਅੰਕੜੇ ਇਸ ਪੰਨੇ ਉੱਤੇ ਵਰਤਿਆ 14 ਮਈ 2026 ਦਾ ਸਨੈਪਸ਼ਾਟ ਹਨ ਅਤੇ ਹਰ ਦੇਸ਼ ਦੀ ਭੂਮਿਕਾ ਦਰਸਾਉਣ ਲਈ ਹਨ, ਲਾਈਵ ਡਾਟਾ ਨਹੀਂ।',
    'sol.label': 'ਰਾਹ',
    'sol.title': 'ਰੁਪਿਆ ਫਸਿਆ ਹੈ — ਪਰ ਬੇਵੱਸ ਨਹੀਂ। ਲੀਵਰ ਚੁਣੋ।',
    'sol.lede': 'ਨਿਦਾਨ ਕਹਾਣੀ ਦਾ ਅੱਧਾ ਹਿੱਸਾ ਹੈ। ਭਾਰਤ ਜੋ ਨੀਤੀਗਤ ਤੇ ਢਾਂਚਾਗਤ ਕਦਮ ਸੱਚਮੁੱਚ ਚੁੱਕ ਸਕਦਾ ਹੈ, ਉਹਨਾਂ ਨੂੰ ਟੌਗਲ ਕਰੋ — ਹਰ ਇੱਕ ਅਸਲੀ ਹੈ, ਕਿਸੇ ਨਾ ਕਿਸੇ ਰੂਪ ਵਿੱਚ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ — ਅਤੇ ਵੇਖੋ ਕਿ ਉਹ ਰੁਪਏ ਨੂੰ ₹95.96 ਤੋਂ ਕਿੰਨਾ ਪਿੱਛੇ ਖਿੱਚ ਸਕਦੇ ਹਨ। ਕੋਈ ਇੱਕ ਲੀਵਰ ਇਕੱਲਾ ਇਸ ਨੂੰ ਠੀਕ ਨਹੀਂ ਕਰਦਾ। ਇਕੱਠੇ, ਇਹ ਜੁੜ ਜਾਂਦੇ ਹਨ।',
    'lflow.label': 'ਵਿਸਤ੍ਰਿਤ ਵਹਾਅ · ਐਨੀਮੇਟਡ',
    'lflow.title': 'ਹਰ ਪਰਤ ਨੂੰ ਗਤੀ ਵਿੱਚ ਵੇਖੋ।',
    'lflow.lede': 'ਡਾਲਰ ਸਥਿਰ ਨਹੀਂ ਰਹਿੰਦੇ। ਉਹ ਖਾਸ ਰਾਹਾਂ ਰਾਹੀਂ ਘੁੰਮਦੇ ਹਨ ਜੋ ਉਨ੍ਹਾਂ ਦੀ ਸਰਦਾਰੀ ਪੱਕੀ ਕਰਦੇ ਹਨ। ਵਹਾਅ ਵੇਖਣ ਲਈ ਇੱਕ ਪਰਤ ਚੁਣੋ।',
    'lflow.tab1': 'ਪਲੰਬਿੰਗ ਵਜੋਂ ਡਾਲਰ',
    'lflow.tab2': 'ਪੈਟਰੋਡਾਲਰ ਇੰਜਣ',
    'lflow.tab3': 'ਭਾਰਤ ਦਬਾਅ ਹੇਠ',
    'wo.label': 'ਵਿਸ਼ਵ ਵਿਵਸਥਾ ਬਦਲਣਾ',
    'wo.title': 'ਜੇ ਪੈਟਰੋਡਾਲਰ ਬਦਲੇ, ਤਾਂ ਹਿਸਾਬ ਕਿਵੇਂ ਦਿਸੇਗਾ?',
    'wo.lede': 'ਤਿੰਨ ਹੌਲੀ ਚੱਲਣ ਵਾਲੀਆਂ ਤਾਕਤਾਂ ਡਾਲਰ ਦੀ ਸਰਦਾਰੀ ਨੂੰ ਕਮਜ਼ੋਰ ਕਰ ਰਹੀਆਂ ਹਨ। ਸਲਾਈਡਰ ਹਿਲਾ ਕੇ ਵੇਖੋ ਕਿ ਵਿਵਸਥਾ ਕਿਵੇਂ ਹੁੰਗਾਰਾ ਭਰੇਗੀ — ਅਤੇ ਰੁਪਏ ਲਈ ਇਸਦਾ ਕੀ ਅਰਥ ਹੈ।',
    'wo.realLabel': 'ਅਸਲ ਪ੍ਰਗਤੀ',
    'wo.realTitle': 'ਜ਼ਮੀਨ ਉੱਤੇ ਪਹਿਲਾਂ ਹੀ ਕੀ ਹੋ ਰਿਹਾ ਹੈ।',
    'reel.label': 'ਰੀਲ ਵਜੋਂ ਸਾਂਝਾ ਕਰੋ',
    'reel.title': 'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਇੱਕ ਵੀਡੀਓ ਕਲਿੱਪ ਬਣਾਓ।',
    'reel.lede': 'ਕਹਾਣੀ ਦਾ ਸਾਰ ਦੱਸਦਾ ਇੱਕ ਆਪੇ-ਬਣਿਆ 30-ਸਕਿੰਟ ਦਾ ਪੋਰਟਰੇਟ ਵੀਡੀਓ, ਉੱਪਰ ਚੁਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬਿਆਨ ਨਾਲ। ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਬਣਦਾ ਹੈ — ਕੁਝ ਵੀ ਤੁਹਾਡੇ ਡਿਵਾਈਸ ਤੋਂ ਬਾਹਰ ਨਹੀਂ ਜਾਂਦਾ।',
    'nav.story': 'ਕਹਾਣੀ',
    'nav.history': 'ਇਤਿਹਾਸ',
    'system.cardsLabel': 'ਉਹੀ ਤਿੰਨ ਪਰਤਾਂ, ਸ਼ਬਦਾਂ ਵਿੱਚ',
    'lflow.hint': 'ਐਨੀਮੇਸ਼ਨ ਬਦਲਣ ਲਈ ਕਿਸੇ ਵੀ ਪਰਤ ਉੱਤੇ ਟੈਪ ਕਰੋ',
    'sim.hint': 'ਕੋਈ ਵੀ ਸਲਾਈਡਰ ਖਿਸਕਾਓ — ਦਰ, ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਫੈਸਲਾ ਤੁਰੰਤ ਬਦਲਦੇ ਹਨ',
    'nav.system': 'ਵਿਵਸਥਾ',
    'nav.tools': 'ਸੰਦ',
    'nav.scenarios': 'ਹਾਲਾਤ',
    'nav.currencies': 'ਮੁਦਰਾਵਾਂ',
    'nav.impact': 'ਅਸਰ',
    'nav.learn': 'ਜਾਣੋ',
    'hero.date': '14 ਮਈ, 2026',
    'hero.sub': 'ਡਾਲਰ ਦੇ ਮੁਕਾਬਲੇ ਹਰ ਸਮੇਂ ਦਾ ਹੇਠਲਾ ਪੱਧਰ',
    'hero.puzzleLabel': 'ਬੁਝਾਰਤ',
    'hero.puzzle': 'ਅਮਰੀਕਾ ਦਹਾਕਿਆਂ ਤੋਂ ਡਾਲਰ ਛਾਪ ਰਿਹਾ ਹੈ।<br>ਤਾਂ ਫਿਰ ਰੁਪਿਆ ਕਿਉਂ ਡਿੱਗ ਰਿਹਾ ਹੈ, ਡਾਲਰ ਕਿਉਂ ਨਹੀਂ?',
    'hero.cta': 'ਕਹਾਣੀ ਪੜ੍ਹੋ',
    'puzzle.label': 'ਸਹਿਜ ਸੋਚ ਨਾਕਾਮ ਹੋ ਜਾਂਦੀ ਹੈ',
    'puzzle.title': 'ਦੁਨੀਆ ਵਿੱਚ ਵੱਧ ਡਾਲਰ ਦਾ ਮਤਲਬ ਸਸਤਾ ਡਾਲਰ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।',
    'puzzle.lede': 'ਕਿਸੇ ਵੀ ਆਮ ਮੁਦਰਾ ਲਈ ਬਿਲਕੁਲ ਇਹੀ ਹੁੰਦਾ ਹੈ। ਪਰ ਡਾਲਰ ਆਮ ਨਹੀਂ ਹੈ। ਇਹ ਦੁਨੀਆ ਦੀ ਪਾਈਪ-ਵਿਵਸਥਾ ਹੈ — ਅਤੇ ਜਦੋਂ ਦੁਨੀਆ ਘਬਰਾਉਂਦੀ ਹੈ, ਹਰ ਦਰਾਮਦਕਾਰ ਦੇਸ਼ ਨੂੰ ਫੈੱਡ ਦੇ ਛਾਪਣ ਨਾਲੋਂ ਤੇਜ਼ੀ ਨਾਲ ਹੋਰ ਡਾਲਰ ਚਾਹੀਦੇ ਹਨ।',
    'timeline.label': '26 ਸਾਲ, ਦੋ ਲਕੀਰਾਂ',
    'timeline.title': 'ਅਮਰੀਕਾ ਨੇ ਛਾਪਿਆ। ਰੁਪਿਆ ਡਿੱਗਿਆ। ਉਹ ਇਕੱਠੇ ਚੱਲੇ — ਵੱਖ ਨਹੀਂ।',
    'printing.label': 'ਡਾਲਰ ਛਪਾਈ ਕਿਵੇਂ ਕੰਮ ਕਰਦੀ ਹੈ',
    'printing.title': 'ਫੈੱਡ ਜਦੋਂ "ਛਾਪਦਾ" ਹੈ, ਤਾਂ ਇਹ ਅਸਲੀ ਛਾਪਾਖਾਨੇ ਨਹੀਂ ਚਲਾਉਂਦਾ।',
    'printing.lede': 'ਡਾਲਰ ਦੀ ਸਪਲਾਈ ਬੈਂਕਿੰਗ ਵਿਵਸਥਾ ਰਾਹੀਂ ਵਧਦੀ ਹੈ — ਅਤੇ ਇਹ ਕਿਵੇਂ ਵਧਦੀ ਹੈ ਇਹ ਤੈਅ ਕਰਦਾ ਹੈ ਕਿ ਰੁਪਏ ਨੂੰ ਹੁਲਾਰਾ ਮਿਲਦਾ ਹੈ ਜਾਂ ਮਾਰ।',
    'system.label': 'ਵਿਵਸਥਾ',
    'system.title': 'ਬੁਝਾਰਤ ਤਿੰਨ ਪਰਤਾਂ ਵਿੱਚ ਹੱਲ ਹੁੰਦੀ ਹੈ।',
    'forces.label': 'ਚਾਰ ਤਾਕਤਾਂ',
    'forces.title': 'ਹਰ ਡਾਲਰ-ਮੰਗ ਦਾ ਵਹਾਅ ਇੱਕੋ ਵੇਲੇ ਚੱਲ ਰਿਹਾ ਹੈ।',
    'forces.lede': 'ਕੋਈ ਇੱਕ ਕਾਰਕ ਇਸ ਗਿਰਾਵਟ ਨੂੰ ਨਹੀਂ ਸਮਝਾਉਂਦਾ। 2026 ਵਿੱਚ ਚਾਰ ਤਾਕਤਾਂ ਇੱਕ ਦੂਜੇ ਉੱਤੇ ਢੇਰ ਹੋ ਰਹੀਆਂ ਹਨ — ਅਤੇ ਰੁਪਏ ਕੋਲ ਲੁਕਣ ਦੀ ਥਾਂ ਨਹੀਂ।',
    'sim.label': 'ਮੁੱਲ ਸਿਮੂਲੇਟਰ',
    'sim.title': 'ਸਲਾਈਡਰ ਹਿਲਾਓ। ਰੁਪਏ ਦਾ ਹੁੰਗਾਰਾ ਵੇਖੋ।',
    'sim.lede': 'ਪੰਜ ਮੁੱਖ ਤਾਕਤਾਂ ਦਾ ਸਰਲ ਰੇਖੀ ਮਾਡਲ — ਤੇਲ, ਡਾਲਰ ਦੀ ਤਾਕਤ, ਪੂੰਜੀ ਦਾ ਵਹਾਅ, ਫੈੱਡ ਨੀਤੀ ਅਤੇ ਆਰਬੀਆਈ ਬਚਾਅ। ਕੋਈ ਵੀ ਇਨਪੁੱਟ ਬਦਲੋ, ਅਨੁਮਾਨਿਤ USD/INR ਤੁਰੰਤ ਅੱਪਡੇਟ ਹੁੰਦਾ ਹੈ।',
    'ccy.label': 'ਅੰਤਰ-ਮੁਦਰਾ ਅਸਰ',
    'ccy.title': 'ਭਾਰਤ ਇਕੱਲਾ ਨਹੀਂ। ਡਾਲਰ ਸਭ ਨੂੰ ਹਿਲਾ ਰਿਹਾ ਹੈ।',
    'ccy.lede': 'ਹੇਠਾਂ ਕੋਈ ਵੀ ਮੁਦਰਾ ਚੁਣੋ ਅਤੇ ਵੇਖੋ ਕਿ ਰੁਪਏ ਨੂੰ ਮਾਰਨ ਵਾਲੀਆਂ ਉਹੀ ਤਾਕਤਾਂ ਨੂੰ ਇਹ ਕਿਵੇਂ ਹੁੰਗਾਰਾ ਦਿੰਦੀ ਹੈ — ਕੁਝ ਕਿਉਂ ਟਿਕੀਆਂ ਹਨ ਅਤੇ ਕੁਝ ਕਿਉਂ ਟੁੱਟ ਰਹੀਆਂ ਹਨ।',
    'impact.label': 'ਅਸਰ ਲੜੀ',
    'impact.title': 'ਰੁਪਏ ਦੀ ਕਮਜ਼ੋਰੀ ਤੁਹਾਡੀ ਜੇਬ ਤੱਕ ਕਿਵੇਂ ਪਹੁੰਚਦੀ ਹੈ।',
    'impact.lede': 'ਕਮਜ਼ੋਰ ਰੁਪਿਆ ਤਿੰਨ ਪਹਿਲੇ-ਪੱਧਰ ਦੇ ਅਸਰ ਪੈਦਾ ਕਰਦਾ ਹੈ — ਅਤੇ ਹਰ ਇੱਕ ਉਸ ਚੀਜ਼ ਵਿੱਚ ਬਦਲਦਾ ਹੈ ਜੋ ਪਰਿਵਾਰ, ਫ਼ਰਮ ਜਾਂ ਕੇਂਦਰੀ ਬੈਂਕ ਸਿੱਧਾ ਮਹਿਸੂਸ ਕਰਦਾ ਹੈ।',
    'ref.label': 'ਹਵਾਲੇ ਅਤੇ ਡਾਟਾ',
    'ref.title': 'ਅੰਕੜੇ, ਅਤੇ ਉਹ ਕਿੱਥੋਂ ਆਉਂਦੇ ਹਨ।',
    'ref.lede': 'ਇਸ ਪੰਨੇ ਉੱਤੇ ਦਿੱਤਾ ਹਰ ਅੰਕੜਾ, ਉਸ ਦੇ ਸਰੋਤ ਅਤੇ ਆਖਰੀ ਪੜਤਾਲ ਦੀ ਤਾਰੀਖ਼ ਨਾਲ। ਡਾਟਾ ਸਮੇਂ ਦਾ ਸਨੈਪਸ਼ਾਟ ਹੈ — ਵਟਾਂਦਰਾ ਦਰਾਂ ਅਤੇ ਯੀਲਡ ਹਰ ਮਿੰਟ ਬਦਲਦੇ ਹਨ।',
    'math.label': 'ਮੂਲ ਗਣਿਤ',
    'math.title': 'ਅਨੁਮਾਨ ਪਿੱਛੇ ਦਾ ਫਾਰਮੂਲਾ ਵੇਖੋ।',
    'math.lede': 'ਹਰ ਸਲਾਈਡਰ ਦਾ ਇੱਕ ਗੁਣਾਂਕ ਹੈ। ਅੱਜ ਦਾ ਆਧਾਰ ਘਟਾਓ। ਗੁਣਾ ਕਰੋ। ਜੋੜੋ। ਇਹੀ ਮਾਡਲ ਹੈ — ਕੋਈ ਲੁਕੇ ਕਦਮ ਨਹੀਂ।',
    'math.formula': 'ਅਨੁਮਾਨਿਤ ₹/$ = ₹95.96 + Σ ( ਗੁਣਾਂਕ × (ਮੌਜੂਦਾ ਮੁੱਲ − ਆਧਾਰ) )',
    'math.amount': 'ਇੱਕ ਰਕਮ ਬਦਲੋ',
    'math.amountHelp': 'ਵੇਖੋ $1,000 ਅੱਜ ਕਿੰਨੇ ਦੇ ਅਤੇ ਸਿਮੂਲੇਟਿਡ ਦਰ ਉੱਤੇ ਕਿੰਨੇ ਦੇ।',
    'math.usd': 'ਡਾਲਰ (USD)',
    'math.inrToday': 'ਅੱਜ ਦੇ ₹95.96 ਉੱਤੇ',
    'math.inrSim': 'ਸਿਮੂਲੇਟਿਡ ਦਰ ਉੱਤੇ',
    'math.diff': 'ਫ਼ਰਕ',
    'math.cheaper': 'ਸਸਤਾ',
    'math.costlier': 'ਮਹਿੰਗਾ',
    'math.flat': 'ਅੱਜ ਵਰਗਾ ਹੀ',
  },
};

let currentLang = 'en';

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = I18N[lang][key];
    if (val === undefined) return;
    if (el.dataset.i18nHtml) el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll('.lang-btn').forEach(b => {
    const active = b.dataset.lang === lang;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  if (document.getElementById('mathAmount')) updateMath();
}

// Dropdown picker
const langPick = document.getElementById('langPick');
if (langPick) {
  langPick.addEventListener('change', () => applyLang(langPick.value));
}

// ─── Basic Math widget ─────────────────────────────────────────
function updateMath() {
  const amtEl = document.getElementById('mathAmount');
  if (!amtEl) return;
  const usd = parseFloat(amtEl.value) || 0;
  const todayRate = 95.96;
  const simRate = parseFloat(document.getElementById('simOut').textContent.replace(/[^\d.]/g, '')) || todayRate;

  const inrToday = usd * todayRate;
  const inrSim = usd * simRate;
  const diff = inrSim - inrToday;

  const fmtINR = (v) => '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  document.getElementById('mathTodayVal').textContent = fmtINR(inrToday);
  document.getElementById('mathSimVal').textContent = fmtINR(inrSim);

  const diffEl = document.getElementById('mathDiff');
  const diffLabel = document.getElementById('mathDiffLabel');
  if (Math.abs(diff) < 0.01) {
    diffEl.textContent = fmtINR(0);
    diffEl.className = 'math-cell-val';
    diffLabel.textContent = t('math.flat');
  } else if (diff > 0) {
    diffEl.textContent = '+' + fmtINR(diff);
    diffEl.className = 'math-cell-val math-up';
    diffLabel.textContent = t('math.costlier');
  } else {
    diffEl.textContent = '−' + fmtINR(Math.abs(diff));
    diffEl.className = 'math-cell-val math-down';
    diffLabel.textContent = t('math.cheaper');
  }

  // Plug current slider values into a readable formula
  const v = readSim();
  const c = simContributions(v);
  const fEl = document.getElementById('mathFormulaLive');
  if (fEl) {
    const fmt = (n) => (n >= 0 ? '+' : '−') + '₹' + Math.abs(n).toFixed(2);
    fEl.innerHTML =
      '₹95.96 ' +
      '<span class="formula-token">' + fmt(c.oil) + '</span> oil ' +
      '<span class="formula-token">' + fmt(c.dxy) + '</span> dxy ' +
      '<span class="formula-token">' + fmt(c.fii) + '</span> fii ' +
      '<span class="formula-token">' + fmt(c.fed) + '</span> fed ' +
      '<span class="formula-token">' + fmt(c.rbi) + '</span> rbi ' +
      '= <strong>₹' + (95.96 + c.oil + c.dxy + c.fii + c.fed + c.rbi).toFixed(2) + '</strong>';
  }
}

const mathAmt = document.getElementById('mathAmount');
if (mathAmt) {
  mathAmt.addEventListener('input', updateMath);
  // re-run whenever sim updates
  const origUpdateSim = updateSim;
  window.updateSim = function () {
    origUpdateSim();
    updateMath();
  };
  Object.values(sim).forEach(el => el.addEventListener('input', updateMath));
  document.querySelectorAll('.preset-btn').forEach(btn => btn.addEventListener('click', () => setTimeout(updateMath, 0)));
  updateMath();
}

// Apply default language on load
applyLang('en');

// ─── Layer-flow tabs ───────────────────────────────────────────
document.querySelectorAll('.lflow-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const layer = tab.dataset.layer;
    document.querySelectorAll('.lflow-tab').forEach(t => {
      const isActive = t.dataset.layer === layer;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    document.querySelectorAll('.lflow-panel').forEach(p => {
      p.classList.toggle('active', p.dataset.panel === layer);
    });
  });
});

// ─── History timelines: reserve-currency dynasties + the rupee ──
const DYNASTY_ERAS = [
  {
    flag: '🇵🇹', name: 'Portugal', unit: 'the real / cruzado', reign: '~1450–1530', span: '≈80 yrs',
    rise: 'First to master ocean navigation. Control of the spice route round Africa made Lisbon the hub of world trade, and Portuguese gold coin the trusted settlement metal.',
    fall: 'A small population couldn\'t hold a global empire. Spain absorbed the crown (1580) and the trade shifted.',
    injected: 'Pumped African gold and Asian spices into Europe — the first time one small nation set the price of global goods.',
    impact: 'Established the template: sea power + trade routes = monetary power.',
    sources: [
      { label: 'Reserve currency (history)', url: 'https://en.wikipedia.org/wiki/Reserve_currency#History' },
      { label: 'Portuguese Empire', url: 'https://en.wikipedia.org/wiki/Portuguese_Empire' }
    ]
  },
  {
    flag: '🇪🇸', name: 'Spain', unit: 'the silver real / "pieces of eight"', reign: '~1530–1640', span: '≈110 yrs',
    rise: 'New World silver from Potosí and Mexico flooded the globe. The Spanish silver dollar became the first truly worldwide money — accepted from Manila to Amsterdam to the American colonies.',
    fall: 'Too much silver caused inflation ("the price revolution"); endless wars and defaults (Spain defaulted repeatedly) drained the treasury.',
    injected: 'Injected so much silver into world trade that it literally minted the money Asia and Europe used for centuries — the peso underpinned the later US dollar sign.',
    impact: 'Proved a reserve currency can be inflated away by its own issuer\'s overspending — the first cautionary tale.',
    sources: [
      { label: 'Spanish dollar ("pieces of eight")', url: 'https://en.wikipedia.org/wiki/Spanish_dollar' },
      { label: 'Price revolution', url: 'https://en.wikipedia.org/wiki/Price_revolution' }
    ]
  },
  {
    flag: '🇳🇱', name: 'Netherlands', unit: 'the Dutch guilder', reign: '~1640–1720', span: '≈80 yrs',
    rise: 'The Dutch invented modern finance: the first central bank (Amsterdam), the first stock exchange, and the first joint-stock multinational (the VOC). The guilder was backed by the deepest, safest capital market in the world.',
    fall: 'Wars with England and France, plus the 1720 speculative bubbles, sapped the edge. Financial leadership drifted to London.',
    injected: 'Exported credit and trade finance — Dutch capital funded ventures worldwide, showing that finance, not just gold, confers currency power.',
    impact: 'Introduced the idea that trust in institutions — not just metal — makes a currency global.',
    sources: [
      { label: 'Bank of Amsterdam', url: 'https://en.wikipedia.org/wiki/Bank_of_Amsterdam' },
      { label: 'Dutch East India Company (VOC)', url: 'https://en.wikipedia.org/wiki/Dutch_East_India_Company' }
    ]
  },
  {
    flag: '🇫🇷', name: 'France', unit: 'the livre / franc', reign: '~1720–1815', span: '≈95 yrs',
    rise: 'Europe\'s largest, richest economy for much of the 18th century. The livre, and later the franc, rivalled sterling as a settlement currency across the continent.',
    fall: 'The John Law paper-money bubble (1720), the cost of the American and Napoleonic wars, and the Revolution\'s hyperinflation (the assignats) destroyed monetary credibility.',
    injected: 'Financed revolutions and wars abroad, spreading French coin — but also spread the first modern paper-money collapse.',
    impact: 'A second warning: print to fund war and you forfeit the trust a reserve currency runs on.',
    sources: [
      { label: 'Mississippi Company (John Law bubble)', url: 'https://en.wikipedia.org/wiki/Mississippi_Company' },
      { label: 'Assignat (Revolution hyperinflation)', url: 'https://en.wikipedia.org/wiki/Assignat' }
    ]
  },
  {
    flag: '🇬🇧', name: 'Britain', unit: 'the pound sterling £', reign: '~1815–1944', span: '≈130 yrs',
    rise: 'Victory at Waterloo, the Industrial Revolution and a global empire made sterling the anchor of the classic gold standard. By 1900, ~60% of world trade was invoiced in pounds; London was the world\'s bank.',
    fall: 'Two world wars turned Britain from the world\'s biggest creditor into a huge debtor. It sold assets to survive, and the US emerged with the gold and the industry.',
    injected: 'Exported sterling credit across the empire and beyond — the City of London financed global trade for over a century.',
    impact: 'The clearest modern parallel to the dollar: dominance ended not overnight, but through war debt and a rising challenger already in place.',
    sources: [
      { label: 'Pound sterling (history)', url: 'https://en.wikipedia.org/wiki/Pound_sterling#History' },
      { label: 'Gold standard', url: 'https://en.wikipedia.org/wiki/Gold_standard' }
    ]
  },
  {
    flag: '🇺🇸', name: 'United States', unit: 'the US dollar $', reign: '~1920–today', span: '≈105 yrs & counting', now: true,
    rise: 'WWII left the US with most of the world\'s gold and industry. Bretton Woods (1944) pegged the world to a gold-backed dollar. When Nixon cut the gold link (1971), the petrodollar deal (1974) — oil priced only in dollars — kept demand structural.',
    fall: 'Not fallen — but challenged. Weaponized sanctions (freezing Russia\'s reserves, 2022) pushed rivals toward alternatives; huge deficits and money-printing raise long-run credibility questions.',
    injected: 'The great injector. The US flooded the world with dollars via the Marshall Plan (rebuilding Europe), Bretton Woods reserves, the petrodollar recycling loop, and post-2008/2020 QE (~$8T+). Other central banks hold those dollars as reserves — which is exactly why "printing" doesn\'t sink the dollar.',
    impact: 'This is the system the rest of this page dissects. India — and the rupee — live downstream of every dollar the US injects.',
    sources: [
      { label: 'Bretton Woods system', url: 'https://en.wikipedia.org/wiki/Bretton_Woods_system' },
      { label: 'Nixon shock (1971)', url: 'https://en.wikipedia.org/wiki/Nixon_shock' },
      { label: 'Petrodollar', url: 'https://en.wikipedia.org/wiki/Petrodollar' },
      { label: 'Fed History · Bretton Woods', url: 'https://www.federalreservehistory.org/essays/bretton-woods-created' }
    ]
  }
];

const RUPEE_ERAS = [
  { year: '1540', title: 'The silver rupee is born', body: 'Sher Shah Suri issues the "rupiya" — a standardized 11.5g silver coin. It becomes the subcontinent\'s money for centuries and one of the longest-lived currencies on Earth.', tag: 'SILVER STANDARD', stat: '1 rupiya = 11.5g silver',
    sources: [{ label: 'History of the rupee', url: 'https://en.wikipedia.org/wiki/History_of_the_rupee' }, { label: 'Sher Shah Suri', url: 'https://en.wikipedia.org/wiki/Sher_Shah_Suri' }] },
  { year: '1835', title: 'One rupee for all of British India', body: 'The Coinage Act makes the silver rupee the single legal tender across British India, ending a patchwork of regional coins. Split into 16 annas, 64 pice.', tag: 'UNIFIED COINAGE', stat: '1 rupee = 16 anna = 64 pice',
    sources: [{ label: 'Indian rupee (British India)', url: 'https://en.wikipedia.org/wiki/Indian_rupee#British_India' }, { label: 'Anna (currency)', url: 'https://en.wikipedia.org/wiki/Anna_(currency)' }] },
  { year: '1898', title: 'Pegged to the pound', body: 'India moves onto a gold-exchange standard, fixing the rupee to sterling at 1 shilling 4 pence (≈15 rupees to the pound). The rupee\'s value now rides on Britain\'s.', tag: 'STERLING PEG', stat: '₹15 ≈ £1',
    sources: [{ label: 'History of the rupee', url: 'https://en.wikipedia.org/wiki/History_of_the_rupee' }] },
  { year: '1947', title: 'Independence — and a dollar rate', body: 'At independence the rupee is worth about ₹4.16 to the US dollar, still tied to sterling. India inherits a currency built for a colonial trade system it must now re-engineer.', tag: 'INDEPENDENCE', stat: '₹4.16 = $1',
    sources: [{ label: 'Indian rupee (value over time)', url: 'https://en.wikipedia.org/wiki/Indian_rupee#Exchange_rate' }] },
  { year: '1957', title: 'Decimalization: annas become paise', body: 'The rupee is split into 100 "naye paise" instead of 16 annas / 64 pice. The messy 64-base system gives way to clean decimal maths — simpler pricing, accounting and trade.', tag: 'THE 64 → 100 SHIFT', stat: '1 rupee = 100 paise',
    sources: [{ label: 'Paisa (decimalization)', url: 'https://en.wikipedia.org/wiki/Paisa#India' }, { label: 'Indian Coinage Act, 1955', url: 'https://en.wikipedia.org/wiki/Indian_rupee#Decimalisation' }] },
  { year: '1966', title: 'First big devaluation', body: 'After war, drought and a balance-of-payments crisis, India devalues the rupee 57% — from ₹4.76 to ₹7.50 per dollar — to boost exports and secure foreign aid. Imports get sharply costlier overnight.', tag: 'DEVALUATION', stat: '₹4.76 → ₹7.50 = $1',
    sources: [{ label: '1966 devaluation', url: 'https://en.wikipedia.org/wiki/History_of_the_rupee#Post-independence' }] },
  { year: '1991', title: 'The crisis that changed everything', body: 'Foreign reserves fall to two weeks of imports. India airlifts gold to London as collateral, devalues sharply, and launches the liberalization reforms that open the economy. The rupee roughly halves.', tag: 'BOP CRISIS', stat: '₹17.9 = $1',
    sources: [{ label: '1991 economic crisis', url: 'https://en.wikipedia.org/wiki/1991_Indian_economic_crisis' }, { label: 'Economic liberalisation in India', url: 'https://en.wikipedia.org/wiki/Economic_liberalisation_in_India' }] },
  { year: '1993', title: 'The rupee floats', body: 'India moves to a market-determined exchange rate (a managed float). From now on, oil, capital flows and the dollar — not a government decree — set the rupee\'s daily value. The modern FX era begins.', tag: 'MARKET FLOAT', stat: '~₹31 = $1',
    sources: [{ label: 'Indian rupee (exchange rate)', url: 'https://en.wikipedia.org/wiki/Indian_rupee#Exchange_rate' }] },
  { year: '2026', title: 'Today: ₹95.96 and downstream', body: 'A managed float inside a dollar-centric world. Oil shocks, Fed policy, capital flight and a strong dollar now move the rupee in real time — the forces the simulator on this page lets you play with.', tag: 'ALL-TIME LOW', stat: '₹95.96 = $1', now: true,
    sources: [{ label: 'RBI reference rate', url: 'https://www.rbi.org.in/' }] },
];

// Render an inline "Sources" row from an array of {label, url}
function tlSources(sources) {
  if (!sources || !sources.length) return '';
  const links = sources.map(s =>
    '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.label +
    '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
  ).join('');
  return '<div class="tl-sources"><span class="tl-sources-label">Sources</span>' + links + '</div>';
}

function renderDynasty(i) {
  const e = DYNASTY_ERAS[i];
  const panel = document.getElementById('tlDynastyPanel');
  if (!panel || !e) return;
  panel.innerHTML =
    '<div class="tl-card' + (e.now ? ' tl-card--now' : '') + '">' +
      '<div class="tl-card-head">' +
        '<span class="tl-card-flag">' + e.flag + '</span>' +
        '<div><div class="tl-card-name">' + e.name + '</div>' +
        '<div class="tl-card-unit">' + e.unit + '</div></div>' +
        '<div class="tl-card-reign"><span>' + e.reign + '</span><em>' + e.span + '</em></div>' +
      '</div>' +
      '<div class="tl-card-grid">' +
        '<div class="tl-card-block"><h5>How it rose</h5><p>' + e.rise + '</p></div>' +
        '<div class="tl-card-block"><h5>' + (e.now ? 'What\'s challenging it' : 'What ended it') + '</h5><p>' + e.fall + '</p></div>' +
        '<div class="tl-card-block"><h5>How it injected money into the world</h5><p>' + e.injected + '</p></div>' +
        '<div class="tl-card-block tl-card-block--impact"><h5>Why it matters here</h5><p>' + e.impact + '</p></div>' +
      '</div>' +
      tlSources(e.sources) +
    '</div>';
}

function renderRupee(i) {
  const e = RUPEE_ERAS[i];
  const panel = document.getElementById('tlRupeePanel');
  if (!panel || !e) return;
  panel.innerHTML =
    '<div class="tl-card' + (e.now ? ' tl-card--now' : '') + '">' +
      '<div class="tl-card-head tl-card-head--rupee">' +
        '<div class="tl-rupee-year">' + e.year + '</div>' +
        '<div class="tl-card-title-wrap"><span class="tl-card-tag">' + e.tag + '</span>' +
        '<div class="tl-card-name">' + e.title + '</div></div>' +
        '<div class="tl-rupee-stat">' + e.stat + '</div>' +
      '</div>' +
      '<p class="tl-rupee-body">' + e.body + '</p>' +
      tlSources(e.sources) +
    '</div>';
}

function wireTimeline(trackSel, renderFn) {
  const nodes = Array.from(document.querySelectorAll(trackSel + ' .tl-node'));
  if (!nodes.length) return;
  nodes.forEach(node => {
    const activate = () => {
      nodes.forEach(n => n.setAttribute('aria-selected', n === node ? 'true' : 'false'));
      renderFn(parseInt(node.dataset.era, 10));
    };
    node.addEventListener('click', activate);
    node.addEventListener('keydown', (ev) => {
      const idx = nodes.indexOf(node);
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault();
        const next = nodes[(idx + (ev.key === 'ArrowRight' ? 1 : nodes.length - 1)) % nodes.length];
        next.focus(); next.click();
      }
    });
  });
  renderFn(0);
}

wireTimeline('#tlDynasty', renderDynasty);
wireTimeline('#tlRupee', renderRupee);

// ─── Reading progress bar ──────────────────────────────────────
const readBar = document.getElementById('readProgress');
const backTop = document.getElementById('backToTop');

function onScroll() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
  if (readBar) readBar.style.width = pct + '%';
  if (backTop) backTop.classList.toggle('visible', h.scrollTop > 480);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backTop) {
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── WORLD ORDER MATH ─────────────────────────────────────────
const WO_BASE = { oil: 5, reserves: 42, rails: 8, horizon: 10 };
const WO_COEF = { oil: 0.45, reserves: 0.30, rails: 0.40 };
// Time multiplier — more years allows shifts to compound (range 0.5–1.4)
function woTimeMult(h) { return 0.5 + (h / 30) * 0.9; }

function calcWorldOrder() {
  const oil = +document.getElementById('woOil').value;
  const res = +document.getElementById('woReserves').value;
  const rails = +document.getElementById('woRails').value;
  const horizon = +document.getElementById('woHorizon').value;

  document.getElementById('woOilVal').textContent = oil;
  document.getElementById('woReservesVal').textContent = res;
  document.getElementById('woRailsVal').textContent = rails;
  document.getElementById('woHorizonVal').textContent = horizon;

  const t = woTimeMult(horizon);
  const drag =
    Math.max(0, oil - WO_BASE.oil) * WO_COEF.oil +
    Math.max(0, res - WO_BASE.reserves) * WO_COEF.reserves +
    Math.max(0, rails - WO_BASE.rails) * WO_COEF.rails;
  const gain =
    Math.min(0, oil - WO_BASE.oil) * WO_COEF.oil +
    Math.min(0, res - WO_BASE.reserves) * WO_COEF.reserves +
    Math.min(0, rails - WO_BASE.rails) * WO_COEF.rails;

  const dominance = Math.max(20, Math.min(120, 100 - drag * t - gain * t * 0.5));
  // Map dominance → INR: full-dominance 100 = ₹95.96; lower dominance = stronger rupee
  const inrShift = (100 - dominance) * 0.08; // each point of dominance off-base ≈ ₹0.08 stronger
  const inr = Math.max(40, 95.96 - inrShift);

  // Years to below 50% — extrapolate based on current drag rate
  let years = '∞';
  if (drag > 0) {
    const yrsToHalf = ((100 - 50) / drag) | 0;
    years = yrsToHalf > 100 ? '> 100' : yrsToHalf + ' yrs';
  }

  // Winner logic — whichever input is highest above its baseline
  const shifts = [
    { name: 'Status quo', sub: 'No major shift in flows', amount: 0 },
    { name: 'Yuan / RMB', sub: 'Oil priced more in yuan + reserves shift to CNY', amount: (oil - WO_BASE.oil) * 0.6 + (res - WO_BASE.reserves) * 0.3 },
    { name: 'Gold', sub: 'Central banks moving reserves into bullion', amount: (res - WO_BASE.reserves) * 0.7 },
    { name: 'BRICS rail / multipolar', sub: 'Alternative payment networks gain share', amount: (rails - WO_BASE.rails) * 0.9 },
    { name: 'Indian rupee', sub: 'Bilateral rupee trade with Russia, UAE grows', amount: (rails - WO_BASE.rails) * 0.4 + (oil - WO_BASE.oil) * 0.2 },
  ];
  const winner = shifts.reduce((a, b) => b.amount > a.amount ? b : a, shifts[0]);

  document.getElementById('woDom').textContent = dominance.toFixed(0);
  const change = (100 - dominance);
  document.getElementById('woDomSub').textContent =
    Math.abs(change) < 0.5
      ? 'No change from baseline (100 = today)'
      : (change > 0 ? '−' : '+') + Math.abs(change).toFixed(1) + ' pts vs today';

  // Bar fill (100 = today = right end; 0 = collapse = left end). Width grows from left.
  const barPct = Math.max(8, dominance);
  document.getElementById('woBar').style.width = barPct + '%';

  document.getElementById('woInr').textContent = '₹' + inr.toFixed(2);
  const inrDelta = 95.96 - inr;
  document.getElementById('woInrDelta').textContent =
    Math.abs(inrDelta) < 0.05
      ? 'no change'
      : (inrDelta > 0 ? '−₹' + inrDelta.toFixed(2) + ' stronger' : '+₹' + Math.abs(inrDelta).toFixed(2) + ' weaker');

  document.getElementById('woYears').textContent = years;
  document.getElementById('woWinner').textContent = winner.name;
  document.getElementById('woWinnerSub').textContent = winner.sub;

  // Verdict
  const vText = document.getElementById('woVerdictText');
  if (dominance > 95) {
    vText.textContent = "Today's system. The dollar remains the world's plumbing. Each marginal shift takes decades because the network effect of $7.5T daily FX is hard to dislodge.";
  } else if (dominance > 80) {
    vText.textContent = "A meaningful but gradual shift. The dollar is still dominant, but no longer unchallenged. Reserve diversification accelerates as confidence in single-currency hegemony fades.";
  } else if (dominance > 60) {
    vText.textContent = "Multipolar by default. Multiple reserve currencies coexist. India, China, and Brazil settle a meaningful share of trade outside the dollar. The rupee benefits from less FX volatility.";
  } else if (dominance > 40) {
    vText.textContent = "Post-dominance. The dollar is one of three or four major rails, not the only one. Most central banks split reserves. Petrostates accept multiple currencies for oil. The petrodollar era ends.";
  } else {
    vText.textContent = "Crisis transition. A fast unwinding of dollar dominance would create FX dislocations few economies are prepared for. Historically these reorderings come with wars, defaults, or new institutional frameworks.";
  }
}

['woOil', 'woReserves', 'woRails', 'woHorizon'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', calcWorldOrder);
});

if (document.getElementById('woOil')) calcWorldOrder();

// ─── Solutions engine ("The Way Out") ─────────────────────────
// Each lever pulls the rupee toward strength (a positive `pull` in ₹).
// Pulls are calibrated off the same sensitivities as the value simulator.
// Stacked levers get mild diminishing returns so you can't sum to parity.
const SOL_BASE_RATE = 95.96;
// Ordered biggest → smallest pull. Coefficients are deliberately conservative:
// they represent a plausible multi-year ceiling, not a forecast.
const SOL_LEVERS = [
  { id: 'oil',     title: 'Diversify oil away from the dollar', pull: 1.8,
    detail: 'Expand rupee–ruble, rupee–dirham and yuan-settled crude deals so more of the import bill escapes dollar demand.',
    tag: 'Already underway · Russia, UAE' },
  { id: 'rupee',   title: 'Push rupee invoicing & UPI rails', pull: 1.5,
    detail: 'Vostro accounts, BRICS Pay and cross-border UPI let more trade settle in rupees instead of sourcing dollars first.',
    tag: 'Live · Singapore, UAE, Nepal' },
  { id: 'exports', title: 'Grow non-oil exports ~8%/yr', pull: 1.4,
    detail: 'Electronics (PLI schemes), pharma, and services widen the structural dollar supply that offsets the oil bill.',
    tag: 'Structural · multi-year' },
  { id: 'fdi',     title: 'Attract sticky FDI over hot FII', pull: 1.0,
    detail: 'Long-horizon factory and infrastructure investment brings dollars that do not flee on the next risk-off headline.',
    tag: 'Quality of flows' },
  { id: 'reserve', title: 'Build a strategic oil reserve', pull: 0.7,
    detail: 'Buying crude when it is cheap smooths the import bill and blunts the FX shock of price spikes and Hormuz risk.',
    tag: 'Policy lever' },
  { id: 'buffer',  title: 'Grow the RBI reserve buffer to $750B+', pull: 0.6,
    detail: 'A deeper war chest lets the RBI smooth volatility for longer without signalling weakness or draining the cushion.',
    tag: 'Central-bank defense' },
  { id: 'gold',    title: 'Keep accumulating gold reserves', pull: 0.5,
    detail: 'Gold now backs a rising share of reserves — a dollar-independent store of value that steadies the balance sheet.',
    tag: 'Cumulative · record buying' },
];

const solState = {};
SOL_LEVERS.forEach(l => { solState[l.id] = false; });

function solVerdict(rate, total) {
  if (total < 0.05)
    return { label: 'NO ACTION', text: 'No levers pulled. The four forces keep the rupee pinned near its all-time low. The way out exists — it just requires deliberate, stacked choices.' };
  if (rate > 93)
    return { label: 'FIRST STEPS', text: 'A start. A lever or two eases the pressure, but the rupee is still firmly in weak territory. Real stabilization needs the structural moves stacked together.' };
  if (rate > 89)
    return { label: 'STABILIZING', text: 'The slide is arrested. With de-dollarized trade and stronger export supply working together, the rupee steadies well off its lows — the realistic near-term ceiling.' };
  if (rate > 85)
    return { label: 'RESILIENT', text: 'A genuinely more resilient rupee. This is roughly the best a determined, multi-year policy push could achieve without a global tailwind — every major lever pulling at once.' };
  return { label: 'FULL RECLAIM', text: 'The optimistic frontier. Every lever firing plus a friendlier world. Politically hard and years away — but it shows the ceiling of what deliberate policy can reclaim.' };
}

function updateSolutions() {
  const list = document.getElementById('solLeverList');
  if (!list) return;

  // Sum raw pulls of active levers, then apply mild diminishing returns.
  const active = SOL_LEVERS.filter(l => solState[l.id]);
  const rawTotal = active.reduce((s, l) => s + l.pull, 0);
  // Diminishing factor: the more you stack, the less each marginal ₹ lands.
  const damp = rawTotal > 0 ? (1 - Math.min(0.32, rawTotal * 0.028)) : 1;
  const total = rawTotal * damp;
  const rate = SOL_BASE_RATE - total;

  const bigEl = document.getElementById('solOut');
  bigEl.textContent = '₹' + rate.toFixed(2);
  bigEl.classList.toggle('is-better', total > 0.05);

  const deltaEl = document.getElementById('solDelta');
  deltaEl.textContent = total < 0.05
    ? 'no levers pulled · rupee stays at today’s ₹95.96'
    : '−₹' + total.toFixed(2) + ' stronger than today’s ₹95.96';

  // Meter spans ₹100 (left, weak) → ₹80 (right, strong)
  const meterMax = 100, meterMin = 80;
  const clamped = Math.max(meterMin, Math.min(meterMax, rate));
  const pct = ((meterMax - clamped) / (meterMax - meterMin)) * 100;
  document.getElementById('solMarker').style.left = pct + '%';

  // Breakdown
  const bd = document.getElementById('solBreakdown');
  if (!active.length) {
    bd.innerHTML = '<div class="sol-bd-empty">Pull a lever to see its contribution.</div>';
  } else {
    bd.innerHTML = active.map(l =>
      '<div class="sol-bd-row"><span>' + l.title + '</span>' +
      '<span class="sol-bd-val up">−₹' + (l.pull * damp).toFixed(2) + '</span></div>'
    ).join('');
  }
  const totEl = document.getElementById('solTotal');
  totEl.textContent = total < 0.005 ? '+₹0.00' : '−₹' + total.toFixed(2);
  totEl.classList.toggle('up', total > 0.005);

  const v = solVerdict(rate, total);
  const vEl = document.getElementById('solVerdict');
  vEl.classList.toggle('is-better', total > 0.05);
  vEl.querySelector('.sol-verdict-label').textContent = 'VERDICT · ' + v.label;
  vEl.querySelector('.sol-verdict-text').textContent = v.text;

  // Toggle-all button label
  const allBtn = document.getElementById('solToggleAll');
  if (allBtn) allBtn.textContent = active.length === SOL_LEVERS.length ? 'Clear all' : 'Select all';

  // Sync card active states
  list.querySelectorAll('.sol-lever').forEach(card => {
    card.classList.toggle('active', solState[card.dataset.lever]);
    card.setAttribute('aria-pressed', String(!!solState[card.dataset.lever]));
  });
}

function initSolutions() {
  const list = document.getElementById('solLeverList');
  if (!list) return;

  list.innerHTML = SOL_LEVERS.map(l =>
    '<button class="sol-lever" type="button" data-lever="' + l.id + '" aria-pressed="false">' +
      '<span class="sol-lever-check" aria-hidden="true"></span>' +
      '<span class="sol-lever-body">' +
        '<span class="sol-lever-head">' +
          '<span class="sol-lever-title">' + l.title + '</span>' +
          '<span class="sol-lever-pull">−₹' + l.pull.toFixed(1) + '</span>' +
        '</span>' +
        '<span class="sol-lever-detail">' + l.detail + '</span>' +
        '<span class="sol-lever-tag">' + l.tag + '</span>' +
      '</span>' +
    '</button>'
  ).join('');

  list.querySelectorAll('.sol-lever').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.lever;
      solState[id] = !solState[id];
      updateSolutions();
    });
  });

  const allBtn = document.getElementById('solToggleAll');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      const allOn = SOL_LEVERS.every(l => solState[l.id]);
      SOL_LEVERS.forEach(l => { solState[l.id] = !allOn; });
      updateSolutions();
    });
  }

  const resetBtn = document.getElementById('solReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      SOL_LEVERS.forEach(l => { solState[l.id] = false; });
      updateSolutions();
    });
  }

  updateSolutions();
}

initSolutions();

// ─── REEL GENERATOR ───────────────────────────────────────────
// Each slide has a `type` that selects an infographic renderer.
// Slide cycles through everything on the site so the reel stands alone.
const REEL_SLIDES_BY_LANG = {
  en: [
    { type: 'hero',      title: '₹95.96', sub: 'USD / INR · all-time low · May 2026',
      narration: 'The Indian rupee just hit an all-time low. Ninety-five rupees ninety-six paise per dollar.',
      bg: '#712B13', accent: '#FAECE7' },
    { type: 'puzzle',    title: 'The puzzle', sub: 'Print trillions. Dollar still wins.',
      narration: 'The US printed trillions of dollars. So why is the rupee falling, not the dollar?',
      bg: '#412402', accent: '#FAEEDA',
      data: { left: { tag: 'NORMAL CURRENCY', text: 'Print → Weaken' }, right: { tag: 'THE DOLLAR', text: 'Print → Absorbed' } } },
    { type: 'lineChart', title: '26 years', sub: 'M2 up +360% · Rupee weakened +113%',
      narration: 'US money supply grew three hundred sixty percent. The rupee weakened a hundred and thirteen percent. They moved together, not apart.',
      bg: '#0C447C', accent: '#E6F1FB',
      data: {
        m2:  [4.9, 5.4, 6.0, 6.6, 8.2, 8.8, 11.0, 12.4, 14.4, 19.1, 21.9, 22.4, 22.7],
        inr: [44.9, 47.2, 45.6, 44.1, 48.4, 45.6, 61.9, 66.3, 70.1, 74.1, 82.8, 88.4, 95.96],
        years: [2000, 2001, 2003, 2005, 2008, 2010, 2013, 2015, 2018, 2020, 2022, 2025, 2026]
      } },
    { type: 'bigStats',  title: 'The numbers', sub: '2000 → 2026',
      narration: 'US money supply went from four point nine trillion to twenty-two point seven trillion. The rupee went from forty-four ninety to ninety-five ninety-six.',
      bg: '#3C3489', accent: '#EEEDFE',
      data: { items: [
        { val: '$4.9T', sub: 'M2 in 2000', side: 'left' },
        { val: '$22.7T', sub: 'M2 in 2026', side: 'right' },
        { val: '₹44.90', sub: '$1 in 2000', side: 'left' },
        { val: '₹95.96', sub: '$1 in 2026', side: 'right' },
      ] } },
    { type: 'layer1',    title: 'Layer 1', sub: "Dollar = world's plumbing",
      narration: 'Ninety percent of global trades involve the dollar. Fifty-eight percent of central bank reserves are dollars. All commodities priced in it.',
      bg: '#3C3489', accent: '#EEEDFE',
      data: { facts: [
        { val: '~90%', sub: 'global FX trades' },
        { val: '~58%', sub: 'central bank reserves' },
        { val: 'All', sub: 'commodities priced in $' },
        { val: 'Most', sub: 'cross-border debt' },
      ] } },
    { type: 'loop',      title: 'Layer 2', sub: 'Petrodollar engine',
      narration: 'Oil is priced in dollars. The US prints. Importers buy oil with dollars. Exporters recycle the surplus into US Treasuries. The loop closes.',
      bg: '#04342C', accent: '#E1F5EE',
      data: { nodes: ['United States', 'Oil importers', 'Oil exporters', 'US Treasuries'] } },
    { type: 'pressure',  title: 'Layer 3', sub: 'India sits downstream',
      narration: 'Eighty-five percent imported oil. Twenty-one billion in capital outflows. A strong dollar. The rupee has nowhere to hide.',
      bg: '#4A1B0C', accent: '#FAECE7',
      data: { items: [
        { tag: 'OIL', val: '$105', sub: '85% imported' },
        { tag: 'IRAN', val: '~5%', sub: 'rupee since Feb' },
        { tag: 'FII', val: '$21B', sub: 'outflow YTD' },
        { tag: 'DXY', val: '98.3', sub: 'strong dollar' },
      ] } },
    { type: 'cascade',   title: 'How it hits you', sub: 'A weaker rupee cascades',
      narration: 'A weaker rupee reaches households through fuel, gold, electronics. Dollar-debt firms struggle. The RBI burns reserves to slow the fall.',
      bg: '#72243E', accent: '#FBEAF0',
      data: { rows: [
        { head: 'Households pay more', sub: 'Fuel · gold · imported goods' },
        { head: 'Firms with $ debt suffer', sub: 'More rupees per dollar owed' },
        { head: 'RBI burns reserves', sub: '$728B peak, slowly draining' },
      ] } },
    { type: 'currencies', title: 'India isn\'t alone', sub: 'YTD vs USD · 2026',
      narration: 'India is not alone. The lira collapsed. The yen and real fell harder. Only the franc gained.',
      bg: '#042C53', accent: '#E6F1FB',
      data: { rows: [
        { code: 'TRY · Lira',  ytd: -22 },
        { code: 'BRL · Real',  ytd: -10 },
        { code: 'JPY · Yen',   ytd: -8.5 },
        { code: 'INR · Rupee', ytd: -6.0, highlight: true },
        { code: 'KRW · Won',   ytd: -4.5 },
        { code: 'EUR · Euro',  ytd: -2.4 },
        { code: 'CHF · Franc', ytd: 0.5 },
      ] } },
    { type: 'world',     title: 'What could change it?', sub: 'Three slow forces',
      narration: 'Three slow forces could shift it. Oil priced outside the dollar. Central banks diversifying reserves. New payment rails like BRICS Pay and UPI.',
      bg: '#3C3489', accent: '#EEEDFE',
      data: { items: [
        { tag: '01', head: 'Non-USD oil pricing', sub: 'Yuan, rupee, ruble deals · ~5% today' },
        { tag: '02', head: 'Reserve diversification', sub: 'Gold + yuan + euro · 42% today' },
        { tag: '03', head: 'Alternative rails', sub: 'BRICS Pay · UPI cross-border · CBDC bridges' },
      ] } },
    { type: 'closing',   title: "The dollar isn't just a currency.", sub: "It's the world's plumbing. India sits downstream.",
      narration: "The dollar isn't just a currency. It's the world's plumbing. And India sits downstream.",
      bg: '#0a0a0a', accent: '#FAECE7' },
  ],
  hi: [
    { type: 'hero',      title: '₹95.96', sub: 'USD / INR · सर्वकालिक निम्न · मई 2026',
      narration: 'भारतीय रुपया अब तक के सबसे कम स्तर पर। पंचानवे रुपये छियानवे पैसे प्रति डॉलर।',
      bg: '#712B13', accent: '#FAECE7' },
    { type: 'puzzle',    title: 'पहेली', sub: 'खरबों छापे। डॉलर फिर भी जीतता है।',
      narration: 'अमेरिका ने खरबों डॉलर छापे। तो रुपया क्यों गिर रहा है, डॉलर क्यों नहीं?',
      bg: '#412402', accent: '#FAEEDA',
      data: { left: { tag: 'सामान्य मुद्रा', text: 'छपाई → कमज़ोरी' }, right: { tag: 'डॉलर', text: 'छपाई → सोख ली' } } },
    { type: 'lineChart', title: '26 वर्ष', sub: 'M2 +360% · रुपया कमज़ोर +113%',
      narration: 'अमेरिकी मुद्रा आपूर्ति तीन सौ साठ प्रतिशत बढ़ी। रुपया एक सौ तेरह प्रतिशत कमज़ोर हुआ।',
      bg: '#0C447C', accent: '#E6F1FB',
      data: {
        m2:  [4.9, 5.4, 6.0, 6.6, 8.2, 8.8, 11.0, 12.4, 14.4, 19.1, 21.9, 22.4, 22.7],
        inr: [44.9, 47.2, 45.6, 44.1, 48.4, 45.6, 61.9, 66.3, 70.1, 74.1, 82.8, 88.4, 95.96],
        years: [2000, 2001, 2003, 2005, 2008, 2010, 2013, 2015, 2018, 2020, 2022, 2025, 2026]
      } },
    { type: 'bigStats',  title: 'आँकड़े', sub: '2000 → 2026',
      narration: 'अमेरिकी मुद्रा आपूर्ति 4.9 खरब से 22.7 खरब डॉलर हो गई। रुपया 44.90 से 95.96 तक।',
      bg: '#3C3489', accent: '#EEEDFE',
      data: { items: [
        { val: '$4.9T', sub: '2000 में M2', side: 'left' },
        { val: '$22.7T', sub: '2026 में M2', side: 'right' },
        { val: '₹44.90', sub: '2000 में $1', side: 'left' },
        { val: '₹95.96', sub: '2026 में $1', side: 'right' },
      ] } },
    { type: 'layer1',    title: 'परत एक', sub: 'डॉलर = दुनिया की पाइपलाइन',
      narration: 'नब्बे प्रतिशत वैश्विक व्यापार डॉलर में। अट्ठावन प्रतिशत भंडार डॉलर में। सभी जिंस डॉलर में।',
      bg: '#3C3489', accent: '#EEEDFE',
      data: { facts: [
        { val: '~90%', sub: 'वैश्विक व्यापार' },
        { val: '~58%', sub: 'केंद्रीय बैंक भंडार' },
        { val: 'सब', sub: 'जिंस डॉलर में' },
        { val: 'अधिकांश', sub: 'सीमा-पार ऋण' },
      ] } },
    { type: 'loop',      title: 'परत दो', sub: 'पेट्रोडॉलर इंजन',
      narration: 'तेल डॉलर में बिकता है। अमेरिका छापता है। आयातक डॉलर देते हैं। निर्यातक उन्हें ट्रेज़री में लगाते हैं।',
      bg: '#04342C', accent: '#E1F5EE',
      data: { nodes: ['अमेरिका', 'तेल आयातक', 'तेल निर्यातक', 'अमेरिकी ट्रेज़री'] } },
    { type: 'pressure',  title: 'परत तीन', sub: 'भारत पाइप के दूसरे छोर पर',
      narration: 'पचासी प्रतिशत तेल आयात। इक्कीस अरब का बहिर्वाह। मज़बूत डॉलर। रुपये के पास छुपने की जगह नहीं।',
      bg: '#4A1B0C', accent: '#FAECE7',
      data: { items: [
        { tag: 'तेल', val: '$105', sub: '85% आयातित' },
        { tag: 'ईरान', val: '~5%', sub: 'फरवरी से रुपया' },
        { tag: 'FII', val: '$21B', sub: 'बहिर्वाह YTD' },
        { tag: 'DXY', val: '98.3', sub: 'मज़बूत डॉलर' },
      ] } },
    { type: 'cascade',   title: 'आप तक कैसे पहुँचता है', sub: 'कमज़ोर रुपये का असर',
      narration: 'कमज़ोर रुपया घरों तक पहुँचता है। डॉलर-कर्ज़दार कंपनियाँ परेशान। RBI भंडार जलाता है।',
      bg: '#72243E', accent: '#FBEAF0',
      data: { rows: [
        { head: 'घर ज़्यादा भुगतान करते हैं', sub: 'ईंधन · सोना · आयातित सामान' },
        { head: 'डॉलर-कर्ज़दार कंपनियाँ', sub: 'हर डॉलर के लिए ज़्यादा रुपये' },
        { head: 'RBI भंडार जलाता है', sub: '$728 अरब चरम, धीरे-धीरे घटता' },
      ] } },
    { type: 'currencies', title: 'भारत अकेला नहीं', sub: 'YTD डॉलर के मुकाबले · 2026',
      narration: 'भारत अकेला नहीं है। लीरा गिरा। येन और रियाल और अधिक गिरे। केवल फ्रैंक मज़बूत हुआ।',
      bg: '#042C53', accent: '#E6F1FB',
      data: { rows: [
        { code: 'TRY · लीरा', ytd: -22 },
        { code: 'BRL · रियाल', ytd: -10 },
        { code: 'JPY · येन', ytd: -8.5 },
        { code: 'INR · रुपया', ytd: -6.0, highlight: true },
        { code: 'KRW · वोन', ytd: -4.5 },
        { code: 'EUR · यूरो', ytd: -2.4 },
        { code: 'CHF · फ्रैंक', ytd: 0.5 },
      ] } },
    { type: 'world',     title: 'क्या बदल सकता है?', sub: 'तीन धीमे बल',
      narration: 'तीन धीमे बल इसे बदल सकते हैं। गैर-डॉलर तेल मूल्य। भंडार विविधीकरण। नई भुगतान प्रणालियाँ।',
      bg: '#3C3489', accent: '#EEEDFE',
      data: { items: [
        { tag: '01', head: 'गैर-USD तेल मूल्य', sub: 'युआन, रुपया, रूबल सौदे · ~5% आज' },
        { tag: '02', head: 'भंडार विविधीकरण', sub: 'सोना + युआन + यूरो · 42% आज' },
        { tag: '03', head: 'वैकल्पिक रेल', sub: 'BRICS Pay · UPI · CBDC' },
      ] } },
    { type: 'closing',   title: 'डॉलर सिर्फ़ मुद्रा नहीं है।', sub: 'यह दुनिया की पाइपलाइन है। भारत निचले छोर पर है।',
      narration: 'डॉलर सिर्फ़ एक मुद्रा नहीं है। यह दुनिया की पाइपलाइन है। और भारत उसके निचले छोर पर है।',
      bg: '#0a0a0a', accent: '#FAECE7' },
  ],
};

const REEL_BCP47 = {
  en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN',
  mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN',
};

const REEL_NAMES = {
  en: 'English', hi: 'हिन्दी (Hindi)', bn: 'বাংলা (Bengali)', ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)', mr: 'मराठी (Marathi)', gu: 'ગુજરાતી (Gujarati)',
  kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)', pa: 'ਪੰਜਾਬੀ (Punjabi)',
};

const reelCanvas = document.getElementById('reelCanvas');
const reelCtx = reelCanvas && reelCanvas.getContext('2d');
const reelStatus = document.getElementById('reelStatus');
const reelPlayBtn = document.getElementById('reelPlayBtn');
const reelDlBtn = document.getElementById('reelDownloadBtn');
const reelStopBtn = document.getElementById('reelStopBtn');
const reelLangName = document.getElementById('reelLangName');
const reelVoiceStatus = document.getElementById('reelVoiceStatus');

let rgPlaying = false;
let rgCancel = false;
let rgRecorder = null;

function rgLang() { return currentLang || 'en'; }

function rgSlides() {
  const slides = REEL_SLIDES_BY_LANG[rgLang()];
  return slides || REEL_SLIDES_BY_LANG.en;
}

// Preferred male English voice names (in order). Picked across macOS / iOS /
// Windows / Chrome / Android — first match wins. For non-English languages
// we just trust the OS to pick a sensible voice for that BCP-47 tag.
// Declared here (before its first use in checkVoice) so an early synchronous
// `onvoiceschanged` / checkVoice() call can't hit the temporal dead zone.
const MALE_EN_VOICES = [
  'Daniel',                          // macOS / iOS UK male
  'Daniel (Enhanced)',
  'Oliver',                          // macOS UK male
  'Arthur',                          // macOS UK male (newer)
  'Alex',                            // macOS US male
  'Google UK English Male',          // Chrome / Android
  'Microsoft Ryan Online (Natural)', // Windows Edge UK male
  'Microsoft George',                // Windows UK male
  'Microsoft Mark',                  // Windows US male
  'Microsoft David Desktop',         // Windows US male (legacy)
];

function checkVoice() {
  if (!('speechSynthesis' in window)) {
    if (reelVoiceStatus) reelVoiceStatus.textContent = 'Not supported in this browser';
    return null;
  }
  const lang = rgLang();
  let match = null;
  if (lang === 'en') {
    match = pickEnglishMaleVoice();
  } else {
    const target = REEL_BCP47[lang] || 'en-GB';
    const voices = speechSynthesis.getVoices();
    match = voices.find(v => v.lang.toLowerCase().startsWith(target.toLowerCase().split('-')[0]));
  }
  if (reelVoiceStatus) {
    reelVoiceStatus.textContent = match
      ? `${match.name} (${match.lang})`
      : `Default voice`;
  }
  return match;
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = checkVoice;
  checkVoice();
}

// ─── reel infographic helpers ─────────────────────────────────
function rgClear(slide) {
  const W = reelCanvas.width, H = reelCanvas.height;
  const grad = reelCtx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, slide.bg);
  grad.addColorStop(1, '#050505');
  reelCtx.fillStyle = grad;
  reelCtx.fillRect(0, 0, W, H);
}

function rgChrome(slide, progress) {
  const W = reelCanvas.width, H = reelCanvas.height;

  // Top accent bar (grows)
  reelCtx.fillStyle = slide.accent;
  reelCtx.fillRect(0, 0, W * Math.min(1, progress * 1.4), 6);

  // Brand
  reelCtx.fillStyle = 'rgba(255,255,255,0.7)';
  reelCtx.font = '700 16px Inter, sans-serif';
  reelCtx.textAlign = 'left';
  reelCtx.fillText('THE PETRODOLLAR PARADOX', 32, 56);
  reelCtx.fillStyle = 'rgba(255,255,255,0.45)';
  reelCtx.font = '500 12px monospace';
  reelCtx.fillText('₹/$ · May 2026', 32, 78);

  // Slide section eyebrow
  reelCtx.fillStyle = slide.accent;
  reelCtx.font = '600 13px Inter, sans-serif';
  const idx = rgSlides().indexOf(slide);
  const idxLabel = String(idx + 1).padStart(2, '0') + ' / ' + String(rgSlides().length).padStart(2, '0');
  reelCtx.textAlign = 'right';
  reelCtx.fillText(idxLabel, W - 32, 56);

  // Footer watermark
  reelCtx.fillStyle = 'rgba(255,255,255,0.55)';
  reelCtx.font = '500 13px Inter, sans-serif';
  reelCtx.textAlign = 'center';
  reelCtx.fillText('sinhaankur.github.io/Petrodollar-Paradox', W / 2, H - 36);

  // Progress dots
  const slides = rgSlides();
  const dotY = H - 70;
  const dotGap = 16;
  const totalW = (slides.length - 1) * dotGap;
  const startX = W / 2 - totalW / 2;
  for (let i = 0; i < slides.length; i++) {
    reelCtx.fillStyle = i <= idx ? slide.accent : 'rgba(255,255,255,0.18)';
    reelCtx.beginPath();
    reelCtx.arc(startX + i * dotGap, dotY, 3, 0, Math.PI * 2);
    reelCtx.fill();
  }
}

function rgTitle(slide, yTop) {
  const W = reelCanvas.width;
  const safeW = W - 80;

  // Title with auto-shrink so long lines never overflow
  reelCtx.fillStyle = slide.accent;
  let titleSize = 40;
  reelCtx.font = `700 ${titleSize}px Inter, sans-serif`;
  while (reelCtx.measureText(slide.title).width > safeW && titleSize > 26) {
    titleSize -= 2;
    reelCtx.font = `700 ${titleSize}px Inter, sans-serif`;
  }
  reelCtx.textAlign = 'center';
  reelCtx.fillText(slide.title, W / 2, yTop);

  // Subtitle
  reelCtx.fillStyle = 'rgba(255,255,255,0.78)';
  reelCtx.font = '500 18px Inter, sans-serif';
  rgWrap(slide.sub, W / 2, yTop + titleSize * 0.85 + 6, safeW, 24);
}

function rgWrap(text, x, y, maxWidth, lineHeight) {
  const ctx = reelCtx;
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  words.forEach(word => {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line); line = word;
    } else line = test;
  });
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

function rgRoundRect(x, y, w, h, r) {
  reelCtx.beginPath();
  reelCtx.moveTo(x + r, y);
  reelCtx.lineTo(x + w - r, y);
  reelCtx.quadraticCurveTo(x + w, y, x + w, y + r);
  reelCtx.lineTo(x + w, y + h - r);
  reelCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  reelCtx.lineTo(x + r, y + h);
  reelCtx.quadraticCurveTo(x, y + h, x, y + h - r);
  reelCtx.lineTo(x, y + r);
  reelCtx.quadraticCurveTo(x, y, x + r, y);
  reelCtx.closePath();
}

// ─── slide-type renderers ─────────────────────────────────────
function rgRenderHero(slide, p) {
  const W = reelCanvas.width, H = reelCanvas.height;
  const cy = H / 2 - 40;
  const safeW = W - 80;

  // Expanding ring behind
  reelCtx.strokeStyle = slide.accent;
  reelCtx.lineWidth = 2;
  reelCtx.globalAlpha = Math.max(0, 0.45 - p * 0.45);
  reelCtx.beginPath();
  reelCtx.arc(W / 2, cy, 80 + p * 160, 0, Math.PI * 2);
  reelCtx.stroke();
  reelCtx.globalAlpha = 1;

  // Single "₹95.96" string sized to fit safe width
  const text = '₹95.96';
  let fontSize = 180;
  reelCtx.font = `700 ${fontSize}px Inter, sans-serif`;
  while (reelCtx.measureText(text).width > safeW && fontSize > 60) {
    fontSize -= 4;
    reelCtx.font = `700 ${fontSize}px Inter, sans-serif`;
  }
  reelCtx.fillStyle = slide.accent;
  reelCtx.textAlign = 'center';
  reelCtx.textBaseline = 'middle';
  reelCtx.fillText(text, W / 2, cy);
  reelCtx.textBaseline = 'alphabetic';

  // Tag below
  reelCtx.fillStyle = 'rgba(255,255,255,0.78)';
  reelCtx.font = '600 18px Inter, sans-serif';
  reelCtx.fillText(slide.sub.toUpperCase(), W / 2, cy + fontSize / 2 + 50);

  // Sub-note
  reelCtx.fillStyle = 'rgba(255,255,255,0.55)';
  reelCtx.font = '500 16px Inter, sans-serif';
  reelCtx.fillText("Asia's weakest currency · YTD −6%", W / 2, cy + fontSize / 2 + 82);
}

function rgRenderPuzzle(slide, p) {
  const W = reelCanvas.width;
  rgTitle(slide, 220);
  const cardY = 360;
  const cardH = 180;
  const gap = 24;
  const cardW = W - 80;

  // Card 1
  reelCtx.fillStyle = 'rgba(125, 211, 252, 0.18)';
  rgRoundRect(40, cardY, cardW, cardH, 14); reelCtx.fill();
  reelCtx.strokeStyle = '#7dd3fc';
  reelCtx.lineWidth = 1.5;
  rgRoundRect(40, cardY, cardW, cardH, 14); reelCtx.stroke();
  reelCtx.fillStyle = '#7dd3fc';
  reelCtx.font = '700 14px Inter, sans-serif';
  reelCtx.textAlign = 'left';
  reelCtx.fillText(slide.data.left.tag, 60, cardY + 36);
  reelCtx.fillStyle = '#fff';
  reelCtx.font = '700 42px Inter, sans-serif';
  reelCtx.fillText(slide.data.left.text, 60, cardY + 110);

  // Card 2
  const c2y = cardY + cardH + gap;
  reelCtx.fillStyle = 'rgba(251, 191, 36, 0.18)';
  rgRoundRect(40, c2y, cardW, cardH, 14); reelCtx.fill();
  reelCtx.strokeStyle = '#fbbf24';
  rgRoundRect(40, c2y, cardW, cardH, 14); reelCtx.stroke();
  reelCtx.fillStyle = '#fbbf24';
  reelCtx.font = '700 14px Inter, sans-serif';
  reelCtx.fillText(slide.data.right.tag, 60, c2y + 36);
  reelCtx.fillStyle = '#fff';
  reelCtx.font = '700 42px Inter, sans-serif';
  reelCtx.fillText(slide.data.right.text, 60, c2y + 110);
}

function rgRenderLineChart(slide, p) {
  const W = reelCanvas.width;
  rgTitle(slide, 180);
  const chartX = 50, chartY = 320, chartW = W - 100, chartH = 380;

  // Frame
  reelCtx.strokeStyle = 'rgba(255,255,255,0.08)';
  reelCtx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = chartY + (chartH / 4) * i;
    reelCtx.beginPath();
    reelCtx.moveTo(chartX, y); reelCtx.lineTo(chartX + chartW, y);
    reelCtx.stroke();
  }

  const m2 = slide.data.m2, inr = slide.data.inr, years = slide.data.years;
  const yMin = years[0], yMax = years[years.length - 1];
  const m2Max = 24, inrMax = 100;
  const N = m2.length;
  const visible = Math.max(2, Math.min(N, Math.ceil(N * p * 1.4)));

  // M2 fill
  reelCtx.fillStyle = 'rgba(125, 211, 252, 0.22)';
  reelCtx.beginPath();
  for (let i = 0; i < visible; i++) {
    const x = chartX + ((years[i] - yMin) / (yMax - yMin)) * chartW;
    const y = chartY + chartH - (m2[i] / m2Max) * chartH;
    if (i === 0) reelCtx.moveTo(x, y); else reelCtx.lineTo(x, y);
  }
  const lastX = chartX + ((years[visible - 1] - yMin) / (yMax - yMin)) * chartW;
  reelCtx.lineTo(lastX, chartY + chartH);
  reelCtx.lineTo(chartX, chartY + chartH);
  reelCtx.closePath();
  reelCtx.fill();

  // M2 line
  reelCtx.strokeStyle = '#7dd3fc';
  reelCtx.lineWidth = 4;
  reelCtx.lineCap = 'round'; reelCtx.lineJoin = 'round';
  reelCtx.beginPath();
  for (let i = 0; i < visible; i++) {
    const x = chartX + ((years[i] - yMin) / (yMax - yMin)) * chartW;
    const y = chartY + chartH - (m2[i] / m2Max) * chartH;
    if (i === 0) reelCtx.moveTo(x, y); else reelCtx.lineTo(x, y);
  }
  reelCtx.stroke();

  // INR line
  reelCtx.strokeStyle = '#f97366';
  reelCtx.beginPath();
  for (let i = 0; i < visible; i++) {
    const x = chartX + ((years[i] - yMin) / (yMax - yMin)) * chartW;
    const y = chartY + chartH - (inr[i] / inrMax) * chartH;
    if (i === 0) reelCtx.moveTo(x, y); else reelCtx.lineTo(x, y);
  }
  reelCtx.stroke();

  // End markers
  if (visible > 0) {
    const last = visible - 1;
    const xM = chartX + ((years[last] - yMin) / (yMax - yMin)) * chartW;
    const yM = chartY + chartH - (m2[last] / m2Max) * chartH;
    reelCtx.fillStyle = '#7dd3fc';
    reelCtx.beginPath(); reelCtx.arc(xM, yM, 8, 0, Math.PI * 2); reelCtx.fill();
    const yI = chartY + chartH - (inr[last] / inrMax) * chartH;
    reelCtx.fillStyle = '#f97366';
    reelCtx.beginPath(); reelCtx.arc(xM, yI, 8, 0, Math.PI * 2); reelCtx.fill();
  }

  // Axis labels
  reelCtx.fillStyle = 'rgba(255,255,255,0.5)';
  reelCtx.font = '500 13px monospace';
  reelCtx.textAlign = 'left';
  reelCtx.fillText('2000', chartX, chartY + chartH + 22);
  reelCtx.textAlign = 'right';
  reelCtx.fillText('2026', chartX + chartW, chartY + chartH + 22);

  // Legend at bottom
  const legendY = chartY + chartH + 60;
  reelCtx.fillStyle = '#7dd3fc';
  reelCtx.fillRect(60, legendY, 18, 4);
  reelCtx.fillStyle = '#fff';
  reelCtx.font = '600 16px Inter, sans-serif';
  reelCtx.textAlign = 'left';
  reelCtx.fillText('US M2  +360%', 88, legendY + 8);

  reelCtx.fillStyle = '#f97366';
  reelCtx.fillRect(60, legendY + 30, 18, 4);
  reelCtx.fillStyle = '#fff';
  reelCtx.fillText('USD/INR  +113%', 88, legendY + 38);
}

function rgRenderBigStats(slide, p) {
  const W = reelCanvas.width;
  rgTitle(slide, 180);
  const startY = 310, cellH = 100, gap = 12;
  const items = slide.data.items;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const y = startY + i * (cellH + gap);
    const reveal = Math.max(0, Math.min(1, p * 2 - i * 0.18));
    if (reveal <= 0) continue;
    reelCtx.globalAlpha = reveal;
    reelCtx.fillStyle = i % 2 === 0 ? 'rgba(125, 211, 252, 0.15)' : 'rgba(94, 234, 212, 0.15)';
    rgRoundRect(40, y, W - 80, cellH, 12); reelCtx.fill();
    // value left side
    reelCtx.textAlign = 'left';
    reelCtx.fillStyle = '#fff';
    reelCtx.font = '700 42px Inter, sans-serif';
    reelCtx.fillText(it.val, 60, y + 64);
    // label right side
    reelCtx.textAlign = 'right';
    reelCtx.fillStyle = 'rgba(255,255,255,0.75)';
    reelCtx.font = '500 14px Inter, sans-serif';
    reelCtx.fillText(it.sub, W - 60, y + 64);
  }
  reelCtx.globalAlpha = 1;
}

function rgRenderLayer1(slide, p) {
  const W = reelCanvas.width;
  rgTitle(slide, 180);
  const cx = W / 2, cy = 540;

  // Surrounding facts in a 2x2 grid below the hub
  const facts = slide.data.facts;
  const pillW = 200, pillH = 80;
  // Left column / right column positioning that stays inside the canvas
  const positions = [
    { x: cx - 110, y: cy - 130 }, // top-left
    { x: cx + 110, y: cy - 130 }, // top-right
    { x: cx - 110, y: cy + 130 }, // bottom-left
    { x: cx + 110, y: cy + 130 }, // bottom-right
  ];

  // Center hub
  reelCtx.fillStyle = 'rgba(196, 181, 253, 0.18)';
  reelCtx.beginPath();
  reelCtx.arc(cx, cy, 70 + Math.sin(p * Math.PI * 2) * 3, 0, Math.PI * 2);
  reelCtx.fill();
  reelCtx.strokeStyle = slide.accent;
  reelCtx.lineWidth = 2;
  reelCtx.beginPath(); reelCtx.arc(cx, cy, 70, 0, Math.PI * 2); reelCtx.stroke();
  reelCtx.fillStyle = '#fff';
  reelCtx.font = '700 32px Inter, sans-serif';
  reelCtx.textAlign = 'center';
  reelCtx.textBaseline = 'middle';
  reelCtx.fillText('USD', cx, cy);
  reelCtx.textBaseline = 'alphabetic';

  for (let i = 0; i < facts.length; i++) {
    const pos = positions[i];
    const reveal = Math.max(0, Math.min(1, p * 2 - i * 0.15));
    if (reveal <= 0) continue;
    reelCtx.globalAlpha = reveal;

    // connector line from hub to pill
    reelCtx.strokeStyle = 'rgba(255,255,255,0.18)';
    reelCtx.lineWidth = 1.5;
    reelCtx.beginPath();
    reelCtx.moveTo(cx, cy); reelCtx.lineTo(pos.x, pos.y);
    reelCtx.stroke();

    // pill (clipped to canvas safe area)
    const px = Math.max(40, Math.min(W - 40 - pillW, pos.x - pillW / 2));
    const py = pos.y - pillH / 2;
    reelCtx.fillStyle = 'rgba(196, 181, 253, 0.18)';
    rgRoundRect(px, py, pillW, pillH, 10); reelCtx.fill();
    reelCtx.strokeStyle = 'rgba(196, 181, 253, 0.4)';
    reelCtx.lineWidth = 1;
    rgRoundRect(px, py, pillW, pillH, 10); reelCtx.stroke();

    reelCtx.fillStyle = '#fff';
    reelCtx.font = '700 26px Inter, sans-serif';
    reelCtx.textAlign = 'center';
    reelCtx.fillText(facts[i].val, px + pillW / 2, py + 34);
    reelCtx.fillStyle = 'rgba(255,255,255,0.72)';
    reelCtx.font = '500 12px Inter, sans-serif';
    reelCtx.fillText(facts[i].sub, px + pillW / 2, py + 58);
  }
  reelCtx.globalAlpha = 1;
}

function rgRenderLoop(slide, p) {
  const W = reelCanvas.width, H = reelCanvas.height;
  rgTitle(slide, 180);
  // 2x2 grid of nodes
  const cx = W / 2, cy = 540;
  const dx = 150, dy = 130;
  const positions = [
    { x: cx - dx, y: cy - dy }, // US
    { x: cx + dx, y: cy - dy }, // Importers
    { x: cx + dx, y: cy + dy }, // Exporters
    { x: cx - dx, y: cy + dy }, // Treasuries
  ];
  const nodes = slide.data.nodes;
  const palette = ['#7dd3fc', '#fbbf24', '#f97366', '#5eead4'];

  // Loop arrows (animated dash)
  reelCtx.strokeStyle = slide.accent;
  reelCtx.lineWidth = 2.5;
  const dashOffset = -(p * 60) % 24;
  reelCtx.setLineDash([8, 8]);
  reelCtx.lineDashOffset = dashOffset;

  // US → Importers
  reelCtx.beginPath();
  reelCtx.moveTo(positions[0].x + 75, positions[0].y);
  reelCtx.lineTo(positions[1].x - 75, positions[1].y);
  reelCtx.stroke();
  // Importers → Exporters
  reelCtx.beginPath();
  reelCtx.moveTo(positions[1].x, positions[1].y + 55);
  reelCtx.lineTo(positions[2].x, positions[2].y - 55);
  reelCtx.stroke();
  // Exporters → Treasuries
  reelCtx.beginPath();
  reelCtx.moveTo(positions[2].x - 75, positions[2].y);
  reelCtx.lineTo(positions[3].x + 75, positions[3].y);
  reelCtx.stroke();
  // Treasuries → US
  reelCtx.beginPath();
  reelCtx.moveTo(positions[3].x, positions[3].y - 55);
  reelCtx.lineTo(positions[0].x, positions[0].y + 55);
  reelCtx.stroke();
  reelCtx.setLineDash([]);

  // Nodes on top
  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    reelCtx.fillStyle = palette[i] + '33';
    rgRoundRect(pos.x - 80, pos.y - 50, 160, 100, 12); reelCtx.fill();
    reelCtx.strokeStyle = palette[i];
    reelCtx.lineWidth = 2;
    rgRoundRect(pos.x - 80, pos.y - 50, 160, 100, 12); reelCtx.stroke();
    reelCtx.fillStyle = '#fff';
    reelCtx.font = '700 18px Inter, sans-serif';
    reelCtx.textAlign = 'center';
    rgWrap(nodes[i], pos.x, pos.y + 5, 140, 22);
  }
}

function rgRenderPressure(slide, p) {
  const W = reelCanvas.width;
  rgTitle(slide, 180);
  // 2x2 grid of force tiles
  const items = slide.data.items;
  const cellW = (W - 100) / 2;
  const cellH = 140;
  const startY = 380;
  for (let i = 0; i < items.length; i++) {
    const col = i % 2;
    const row = (i / 2) | 0;
    const x = 40 + col * (cellW + 20);
    const y = startY + row * (cellH + 18);
    const reveal = Math.max(0, Math.min(1, p * 2 - i * 0.12));
    reelCtx.globalAlpha = reveal;

    reelCtx.fillStyle = 'rgba(249, 115, 102, 0.16)';
    rgRoundRect(x, y, cellW, cellH, 12); reelCtx.fill();
    reelCtx.strokeStyle = '#f97366';
    reelCtx.lineWidth = 1.5;
    rgRoundRect(x, y, cellW, cellH, 12); reelCtx.stroke();

    reelCtx.fillStyle = '#f97366';
    reelCtx.font = '700 12px Inter, sans-serif';
    reelCtx.textAlign = 'left';
    reelCtx.fillText(items[i].tag, x + 18, y + 28);

    reelCtx.fillStyle = '#fff';
    reelCtx.font = '700 38px Inter, sans-serif';
    reelCtx.fillText(items[i].val, x + 18, y + 80);

    reelCtx.fillStyle = 'rgba(255,255,255,0.7)';
    reelCtx.font = '500 14px Inter, sans-serif';
    reelCtx.fillText(items[i].sub, x + 18, y + 115);
  }
  reelCtx.globalAlpha = 1;
}

function rgRenderCascade(slide, p) {
  const W = reelCanvas.width;
  rgTitle(slide, 180);
  const rows = slide.data.rows;
  const rowH = 110, gap = 14, startY = 360;
  for (let i = 0; i < rows.length; i++) {
    const y = startY + i * (rowH + gap);
    const reveal = Math.max(0, Math.min(1, p * 2 - i * 0.2));
    reelCtx.globalAlpha = reveal;

    // Numbered marker
    reelCtx.fillStyle = slide.accent;
    reelCtx.beginPath();
    reelCtx.arc(80, y + rowH / 2, 24, 0, Math.PI * 2);
    reelCtx.fill();
    reelCtx.fillStyle = slide.bg;
    reelCtx.font = '700 20px Inter, sans-serif';
    reelCtx.textAlign = 'center';
    reelCtx.fillText(String(i + 1), 80, y + rowH / 2 + 7);

    // Card
    reelCtx.fillStyle = 'rgba(255,255,255,0.06)';
    rgRoundRect(116, y, W - 156, rowH, 12); reelCtx.fill();
    reelCtx.fillStyle = '#fff';
    reelCtx.font = '700 22px Inter, sans-serif';
    reelCtx.textAlign = 'left';
    reelCtx.fillText(rows[i].head, 138, y + 42);
    reelCtx.fillStyle = 'rgba(255,255,255,0.65)';
    reelCtx.font = '500 15px Inter, sans-serif';
    reelCtx.fillText(rows[i].sub, 138, y + 72);

    // Down arrow between rows
    if (i < rows.length - 1) {
      reelCtx.fillStyle = 'rgba(255,255,255,0.4)';
      reelCtx.font = '600 18px Inter, sans-serif';
      reelCtx.textAlign = 'center';
      reelCtx.fillText('↓', W / 2, y + rowH + 10);
    }
  }
  reelCtx.globalAlpha = 1;
}

function rgRenderCurrencies(slide, p) {
  const W = reelCanvas.width;
  rgTitle(slide, 180);
  const rows = slide.data.rows;
  const startY = 340, rowH = 50;
  // determine scale: max abs value
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.ytd)));
  const barMaxW = W - 220;
  const center = W / 2 + 20;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const y = startY + i * rowH;
    const reveal = Math.max(0, Math.min(1, p * 2 - i * 0.1));
    reelCtx.globalAlpha = reveal;

    // Label
    reelCtx.fillStyle = r.highlight ? slide.accent : 'rgba(255,255,255,0.85)';
    reelCtx.font = r.highlight ? '700 16px Inter, sans-serif' : '500 14px Inter, sans-serif';
    reelCtx.textAlign = 'right';
    reelCtx.fillText(r.code, center - 14, y + 22);

    // Bar
    const w = (Math.abs(r.ytd) / maxAbs) * (barMaxW / 2) * Math.min(1, p * 2);
    const color = r.ytd >= 0 ? '#4ade80' : (r.highlight ? '#f97366' : 'rgba(249,115,102,0.7)');
    reelCtx.fillStyle = color;
    if (r.ytd >= 0) {
      reelCtx.fillRect(center, y + 6, w, 26);
    } else {
      reelCtx.fillRect(center - w, y + 6, w, 26);
    }

    // Value
    reelCtx.fillStyle = '#fff';
    reelCtx.font = r.highlight ? '700 14px Inter, sans-serif' : '500 13px Inter, sans-serif';
    reelCtx.textAlign = 'left';
    const valX = r.ytd >= 0 ? center + w + 8 : center - w - 8;
    reelCtx.textAlign = r.ytd >= 0 ? 'left' : 'right';
    reelCtx.fillText((r.ytd >= 0 ? '+' : '') + r.ytd.toFixed(1) + '%', valX, y + 24);
  }
  // Center line
  reelCtx.globalAlpha = 1;
  reelCtx.strokeStyle = 'rgba(255,255,255,0.25)';
  reelCtx.lineWidth = 1;
  reelCtx.beginPath();
  reelCtx.moveTo(center, startY - 8);
  reelCtx.lineTo(center, startY + rows.length * rowH);
  reelCtx.stroke();
}

function rgRenderWorld(slide, p) {
  const W = reelCanvas.width;
  rgTitle(slide, 180);
  const items = slide.data.items;
  const startY = 340, cardH = 110, gap = 14;
  for (let i = 0; i < items.length; i++) {
    const y = startY + i * (cardH + gap);
    const reveal = Math.max(0, Math.min(1, p * 2 - i * 0.15));
    reelCtx.globalAlpha = reveal;
    reelCtx.fillStyle = 'rgba(196, 181, 253, 0.16)';
    rgRoundRect(40, y, W - 80, cardH, 12); reelCtx.fill();
    reelCtx.strokeStyle = '#c4b5fd';
    reelCtx.lineWidth = 1.5;
    rgRoundRect(40, y, W - 80, cardH, 12); reelCtx.stroke();

    // Big number
    reelCtx.fillStyle = '#c4b5fd';
    reelCtx.font = '700 44px Inter, sans-serif';
    reelCtx.textAlign = 'left';
    reelCtx.fillText(items[i].tag, 56, y + 70);

    reelCtx.fillStyle = '#fff';
    reelCtx.font = '700 19px Inter, sans-serif';
    reelCtx.fillText(items[i].head, 148, y + 50);
    reelCtx.fillStyle = 'rgba(255,255,255,0.72)';
    reelCtx.font = '500 12.5px Inter, sans-serif';
    reelCtx.fillText(items[i].sub, 148, y + 76);
  }
  reelCtx.globalAlpha = 1;
}

function rgRenderClosing(slide, p) {
  const W = reelCanvas.width, H = reelCanvas.height;
  // Two big lines centered
  reelCtx.fillStyle = slide.accent;
  reelCtx.font = '700 48px Inter, sans-serif';
  reelCtx.textAlign = 'center';
  rgWrap(slide.title, W / 2, H / 2 - 80, W - 80, 58);
  reelCtx.fillStyle = '#f97366';
  reelCtx.font = '500 italic 30px Inter, sans-serif';
  rgWrap(slide.sub, W / 2, H / 2 + 60, W - 100, 38);

  // Pulse circle
  reelCtx.strokeStyle = slide.accent;
  reelCtx.lineWidth = 2;
  reelCtx.globalAlpha = Math.max(0, 0.5 - p * 0.5);
  reelCtx.beginPath();
  reelCtx.arc(W / 2, H / 2, 200 + p * 200, 0, Math.PI * 2);
  reelCtx.stroke();
  reelCtx.globalAlpha = 1;
}

// ─── dispatcher ───────────────────────────────────────────────
const RG_RENDERERS = {
  hero: rgRenderHero,
  puzzle: rgRenderPuzzle,
  lineChart: rgRenderLineChart,
  bigStats: rgRenderBigStats,
  layer1: rgRenderLayer1,
  loop: rgRenderLoop,
  pressure: rgRenderPressure,
  cascade: rgRenderCascade,
  currencies: rgRenderCurrencies,
  world: rgRenderWorld,
  closing: rgRenderClosing,
};

function drawRgFrame(slide, progress) {
  if (!reelCtx) return;
  rgClear(slide);
  const renderer = RG_RENDERERS[slide.type] || rgRenderHero;
  renderer(slide, progress);
  rgChrome(slide, progress);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach(word => {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  });
  if (line) lines.push(line);
  const totalH = lines.length * lineHeight;
  let startY = y - totalH / 2 + lineHeight / 2;
  lines.forEach(l => { ctx.fillText(l, x, startY); startY += lineHeight; });
}

function pickEnglishMaleVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices();
  // 1) Exact name match from preferred list
  for (const name of MALE_EN_VOICES) {
    const v = voices.find(v => v.name === name || v.name.startsWith(name));
    if (v) return v;
  }
  // 2) Any en-GB voice whose name suggests male
  const maleHints = /(male|david|daniel|oliver|arthur|james|ryan|george|alex|mark|guy|sam|tom|aaron|jamie)/i;
  let v = voices.find(v => v.lang.toLowerCase().startsWith('en-gb') && maleHints.test(v.name));
  if (v) return v;
  // 3) Any en-GB voice at all
  v = voices.find(v => v.lang.toLowerCase().startsWith('en-gb'));
  if (v) return v;
  // 4) Any en-* male-hinted voice
  v = voices.find(v => v.lang.toLowerCase().startsWith('en') && maleHints.test(v.name));
  if (v) return v;
  // 5) Any en-* voice
  return voices.find(v => v.lang.toLowerCase().startsWith('en')) || null;
}

function speak(text, lang) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  return new Promise(resolve => {
    const u = new SpeechSynthesisUtterance(text);
    if (lang === 'en') {
      // Pin to a British male voice when narrating English.
      const v = pickEnglishMaleVoice();
      if (v) { u.voice = v; u.lang = v.lang; }
      else { u.lang = 'en-GB'; }
      u.pitch = 0.92;     // slightly lower
      u.rate = 0.94;
    } else {
      u.lang = REEL_BCP47[lang] || 'en-GB';
      u.rate = 0.95;
    }
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

async function playRg(record = false) {
  if (rgPlaying) return;
  rgPlaying = true;
  rgCancel = false;
  reelPlayBtn.disabled = true;
  reelDlBtn.disabled = true;
  reelStopBtn.disabled = false;
  reelStatus.className = 'reel-status is-recording';

  let chunks = [];
  if (record) {
    try {
      const stream = reelCanvas.captureStream(30);
      const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      const mime = types.find(t => MediaRecorder.isTypeSupported(t));
      if (!mime) throw new Error('No supported video format');
      rgRecorder = new MediaRecorder(stream, { mimeType: mime });
      rgRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      rgRecorder.start();
      reelStatus.textContent = '● Recording…';
    } catch (e) {
      reelStatus.className = 'reel-status is-error';
      reelStatus.textContent = 'Recording failed: ' + e.message;
      reelPlayBtn.disabled = false;
      reelDlBtn.disabled = false;
      reelStopBtn.disabled = true;
      rgPlaying = false;
      return;
    }
  } else {
    reelStatus.textContent = '▶ Playing preview with narration…';
  }

  const slides = rgSlides();
  const lang = rgLang();
  const slideDuration = 4500;
  const frameMs = 1000 / 30;

  for (let i = 0; i < slides.length; i++) {
    if (rgCancel) break;
    const slide = slides[i];

    if (!record) {
      speak(slide.narration, lang);
    }

    const startTime = performance.now();
    while (performance.now() - startTime < slideDuration) {
      if (rgCancel) break;
      const p = (performance.now() - startTime) / slideDuration;
      drawRgFrame(slide, p);
      await new Promise(r => setTimeout(r, frameMs));
    }
  }

  if (record && rgRecorder) {
    rgRecorder.stop();
    await new Promise(r => rgRecorder.onstop = r);
    if (!rgCancel && chunks.length) {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rupee-story-${lang}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      reelStatus.className = 'reel-status is-done';
      reelStatus.textContent = '✓ Reel downloaded as .webm — open it in Photos, Reels, or your editor.';
    } else {
      reelStatus.className = 'reel-status';
      reelStatus.textContent = 'Cancelled.';
    }
  } else if (!rgCancel) {
    reelStatus.className = 'reel-status is-done';
    reelStatus.textContent = '✓ Preview finished. Hit Generate to download as a video.';
  }

  if ('speechSynthesis' in window) speechSynthesis.cancel();

  reelPlayBtn.disabled = false;
  reelDlBtn.disabled = false;
  reelStopBtn.disabled = true;
  rgPlaying = false;
  rgRecorder = null;
}

function stopRg() {
  rgCancel = true;
  if (rgRecorder && rgRecorder.state === 'recording') rgRecorder.stop();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

if (reelPlayBtn) reelPlayBtn.addEventListener('click', () => playRg(false));
if (reelDlBtn) reelDlBtn.addEventListener('click', () => playRg(true));
if (reelStopBtn) reelStopBtn.addEventListener('click', stopRg);

// Initialize first frame
if (reelCtx) {
  drawRgFrame(rgSlides()[0], 0);
}

// Update language name when language changes
const origApplyLang = applyLang;
applyLang = function(lang) {
  origApplyLang(lang);
  if (reelLangName) reelLangName.textContent = REEL_NAMES[lang] || lang.toUpperCase();
  checkVoice();
  if (reelCtx && !rgPlaying) drawRgFrame(rgSlides()[0], 0);
};
// Re-apply so name shows correctly on load
applyLang(currentLang);

// ─── Mobile nav hamburger ──────────────────────────────────────
(function setupMobileNav() {
  const btn = document.getElementById('navToggle');
  const list = document.getElementById('navL1');
  if (!btn || !list) return;

  function close() {
    list.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflow = '';
  }
  function open() {
    list.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close navigation');
    document.body.style.overflow = 'hidden';
  }

  btn.addEventListener('click', () => {
    if (list.classList.contains('is-open')) close();
    else open();
  });

  // Tapping a link should close the menu
  list.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 880px)').matches) close();
    });
  });

  // Restore scrolling if the user resizes back to desktop while open
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 880px)').matches) close();
  });

  // Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && list.classList.contains('is-open')) close();
  });
})();

// ─── L1 nav: active-section underline tracking ─────────────────
(function setupL1Nav() {
  const list = document.getElementById('navL1');
  if (!list) return;
  const links = Array.from(list.querySelectorAll('a'));

  // A nav link points at the *starting* section of a content group.
  // Each link is active while the user is anywhere from its target
  // section through the next link's target — we use the ordered list
  // of section starts to figure that out from scroll position.
  const anchors = links
    .map(a => ({ link: a, el: document.querySelector(a.getAttribute('href')) }))
    .filter(x => x.el);

  function setActive(link) {
    links.forEach(a => a.classList.toggle('is-active', a === link));
  }

  function update() {
    const y = window.scrollY + 120; // offset for sticky navbar
    let current = anchors[0];
    for (const a of anchors) {
      if (a.el.offsetTop <= y) current = a; else break;
    }
    setActive(current.link);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ─── L2 nav: layer-flow tabs underline slider ──────────────────
(function setupL2Nav() {
  const tabsEl = document.getElementById('lflowTabs');
  const pill = document.getElementById('lflowTabsPill');
  if (!tabsEl || !pill) return;
  const tabs = Array.from(tabsEl.querySelectorAll('.lflow-tab'));

  function movePill(target) {
    if (!target) return;
    const wrap = tabsEl.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    pill.style.transform = `translate3d(${r.left - wrap.left}px, 0, 0)`;
    pill.style.width = r.width + 'px';
    pill.classList.add('is-ready');
  }

  function activeTab() {
    return tabs.find(t => t.classList.contains('active')) || tabs[0];
  }

  tabs.forEach(t => {
    t.addEventListener('mouseenter', () => movePill(t));
    t.addEventListener('focus', () => movePill(t));
    t.addEventListener('click', () => setTimeout(() => movePill(activeTab()), 0));
  });
  tabsEl.addEventListener('mouseleave', () => movePill(activeTab()));

  window.addEventListener('resize', () => movePill(activeTab()));
  requestAnimationFrame(() => setTimeout(() => movePill(activeTab()), 60));
})();

// ─── THE GLOBE ────────────────────────────────────────────────
// The petrodollar system mapped onto real geography. 2D SVG by default
// (zero-dependency), with an opt-in 3D Three.js globe lazy-loaded on demand.
(function () {
  const stage = document.getElementById('globeStage');
  if (!stage) return;

  // ── Curated dataset: only countries that matter to the petrodollar story,
  //    grouped by role. Figures are the same May-2026 snapshot used site-wide.
  //    lat/lon are approximate capitals. Roles drive marker color + grouping.
  const COUNTRIES = [
    { id: 'US', name: 'United States', flag: '🇺🇸', role: 'printer', lat: 38.9, lon: -77.0,
      summary: 'Issues the world reserve currency. When the Fed prints, the new dollars get absorbed by global demand instead of weakening the dollar.',
      stats: [['Currency', 'US Dollar'], ['Reserve share', '~58% of global'], ['FX share', '~90% of trades'], ['Fed balance sheet', '$7.0T']],
      rupee: 'Sets the price of the rupee indirectly: Fed rate hikes and a strong dollar pull capital out of India and push USD/INR up.' },
    { id: 'IN', name: 'India', flag: '🇮🇳', role: 'india', lat: 28.6, lon: 77.2,
      summary: 'Earns rupees but must buy dollars for 85% of its crude. Sits at the wrong end of every dollar flow — the focus of this page.',
      stats: [['USD / INR', '₹95.96'], ['Oil imported', '85%'], ['Forex reserves', '$728B peak'], ['FPI YTD 2026', '−$21B']],
      rupee: 'The subject of the whole page: every oil import, every FII exit, every strong-dollar day shows up as a weaker rupee.' },
    // Oil exporters / dollar recyclers
    { id: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', role: 'exporter', lat: 24.7, lon: 46.7,
      summary: 'The archetypal petrodollar recycler. Prices oil in dollars, runs a currency pegged to the USD, and parks surpluses in US Treasuries.',
      stats: [['Currency', 'Riyal (USD peg)'], ['Role', 'Swing oil exporter'], ['Recycles into', 'US Treasuries'], ['Oil pricing', 'USD']],
      rupee: 'India\'s top crude supplier still invoices in dollars, so every Saudi barrel is a standing bid for dollars against the rupee.' },
    { id: 'AE', name: 'UAE', flag: '🇦🇪', role: 'exporter', lat: 24.5, lon: 54.4,
      summary: 'Gulf exporter and a growing hub for non-dollar oil deals — including rupee-settled trade with India.',
      stats: [['Currency', 'Dirham (USD peg)'], ['Role', 'Exporter + trade hub'], ['With India', 'Rupee-settled deals'], ['Oil pricing', 'Mostly USD']],
      rupee: 'The rare bright spot: rupee-settled oil deals with the UAE let India pay for some crude without first buying dollars.' },
    { id: 'RU', name: 'Russia', flag: '🇷🇺', role: 'exporter', lat: 55.8, lon: 37.6,
      summary: 'Sanctioned out of much of the dollar system, Russia sells crude to India and China in rupees, rubles and yuan — the leading edge of de-dollarization.',
      stats: [['Currency', 'Ruble'], ['Role', 'Exporter (non-USD)'], ['With India', 'Rupee–ruble trade'], ['Oil pricing', 'Yuan / rupee']],
      rupee: 'Discounted, non-dollar Russian crude eases the rupee\'s dollar bill — but stranded rupee balances in Russian banks are the catch.' },
    { id: 'IR', name: 'Iran', flag: '🇮🇷', role: 'exporter', lat: 35.7, lon: 51.4,
      summary: 'Sells most crude in yuan and rupees outside the dollar system. The 2026 Iran–US conflict adds a Strait-of-Hormuz risk premium to every barrel.',
      stats: [['Currency', 'Rial'], ['Role', 'Exporter (non-USD)'], ['Chokepoint', 'Strait of Hormuz'], ['Oil pricing', 'Yuan / rupee']],
      rupee: 'Hormuz risk is a direct rupee tax: any threat to the strait spikes oil, widens India\'s import bill and drags USD/INR higher.' },
    { id: 'IQ', name: 'Iraq', flag: '🇮🇶', role: 'exporter', lat: 33.3, lon: 44.4,
      summary: 'Major OPEC exporter. Crude priced and settled overwhelmingly in dollars, feeding the recycling loop.',
      stats: [['Currency', 'Dinar'], ['Role', 'OPEC exporter'], ['Oil pricing', 'USD'], ['Recycles into', 'USD assets']],
      rupee: 'Another dollar-invoiced supplier to India — its barrels add to the monthly demand for dollars that weighs on the rupee.' },
    // Oil importers
    { id: 'CN', name: 'China', flag: '🇨🇳', role: 'importer', lat: 39.9, lon: 116.4,
      summary: 'The largest oil importer, pushing yuan-settled deals with Saudi and Iran and building alternative payment rails (CIPS, mBridge).',
      stats: [['Currency', 'Yuan (managed)'], ['Reserves', '~$3T'], ['Oil', 'Largest importer'], ['Rails', 'CIPS · mBridge']],
      rupee: 'China\'s yuan-settlement push is the template India is watching — if it works, the rupee gets a real path out of the dollar trap.' },
    { id: 'JP', name: 'Japan', flag: '🇯🇵', role: 'importer', lat: 35.7, lon: 139.7,
      summary: 'A huge dollar-reserve holder, yet the yen is in its worst modern stretch — proof that reserve status alone can\'t offset a wide yield gap.',
      stats: [['Currency', 'Yen'], ['USD / JPY', '¥158'], ['Oil', 'Near-total importer'], ['YTD vs USD', '−8.5%']],
      rupee: 'A warning for the rupee: even a rich, reserve-heavy currency slides when the US–home yield gap stays wide.' },
    { id: 'KR', name: 'South Korea', flag: '🇰🇷', role: 'importer', lat: 37.6, lon: 127.0,
      summary: 'Export-driven economy running a similar managed-depreciation playbook to India, with the same dollar-strength problem.',
      stats: [['Currency', 'Won'], ['USD / KRW', '₩1,420'], ['Oil', 'Importer'], ['YTD vs USD', '−4.5%']],
      rupee: 'A close peer: the won and rupee tend to weaken together whenever the dollar strengthens against Asian exporters.' },
    { id: 'EU', name: 'Eurozone', flag: '🇪🇺', role: 'importer', lat: 50.8, lon: 4.4,
      summary: 'A reserve issuer in its own right, so the euro cushions better than EM currencies — but it still imports more energy than the US.',
      stats: [['Currency', 'Euro'], ['Reserve share', '~20%'], ['Oil', 'Net importer'], ['YTD vs USD', '−2.4%']],
      rupee: 'Shows the cushion the rupee lacks: reserve status lets the euro hold far better than an emerging-market importer can.' },
    { id: 'TR', name: 'Türkiye', flag: '🇹🇷', role: 'importer', lat: 39.9, lon: 32.9,
      summary: 'Shows the downside case: an importer whose central-bank credibility broke, sending the lira into a multi-year free fall.',
      stats: [['Currency', 'Lira'], ['USD / TRY', '₺48.5'], ['Oil', 'Importer'], ['YTD vs USD', '−22%']],
      rupee: 'The cautionary tale: it\'s what the rupee avoids precisely because the RBI defends credibility instead of chasing cheap money.' },
    { id: 'BR', name: 'Brazil', flag: '🇧🇷', role: 'importer', lat: -15.8, lon: -47.9,
      summary: 'A commodity economy and BRICS member piloting yuan-settled trade and BRICS Pay — chipping slowly at dollar dominance.',
      stats: [['Currency', 'Real'], ['USD / BRL', 'R$6.30'], ['Bloc', 'BRICS'], ['Rails', 'BRICS Pay pilot']],
      rupee: 'A BRICS partner in the same project: every non-dollar rail Brazil pilots is one the rupee could eventually ride too.' },
    { id: 'ZA', name: 'South Africa', flag: '🇿🇦', role: 'importer', lat: -25.7, lon: 28.2,
      summary: 'BRICS member and commodity exporter whose rand swings with global risk appetite and the strength of the dollar.',
      stats: [['Currency', 'Rand'], ['Bloc', 'BRICS'], ['Driver', 'Risk-on / risk-off'], ['Oil', 'Net importer']],
      rupee: 'Moves on the same risk-on/risk-off tide as the rupee: when global money flees to dollars, both currencies fall together.' },
  ];

  const byId = Object.fromEntries(COUNTRIES.map(c => [c.id, c]));

  // Flow arcs: from → to, typed. Types drive color + the flow filter.
  const FLOWS = [
    // Dollars out from the US
    { from: 'US', to: 'CN', type: 'dollars' },
    { from: 'US', to: 'IN', type: 'dollars' },
    { from: 'US', to: 'EU', type: 'dollars' },
    { from: 'US', to: 'JP', type: 'dollars' },
    // Oil to importers
    { from: 'SA', to: 'IN', type: 'oil' },
    { from: 'SA', to: 'CN', type: 'oil' },
    { from: 'RU', to: 'IN', type: 'oil' },
    { from: 'RU', to: 'CN', type: 'oil' },
    { from: 'IR', to: 'CN', type: 'oil' },
    { from: 'AE', to: 'IN', type: 'oil' },
    { from: 'IQ', to: 'EU', type: 'oil' },
    // Recycling back into US Treasuries
    { from: 'SA', to: 'US', type: 'recycle' },
    { from: 'AE', to: 'US', type: 'recycle' },
    { from: 'JP', to: 'US', type: 'recycle' },
    { from: 'CN', to: 'US', type: 'recycle' },
  ];

  const ROLE_COLORS = {
    printer:  '#7c73e6',
    importer: '#e6a15a',
    exporter: '#e0654a',
    india:    '#2fb98a',
  };
  const FLOW_COLORS = { oil: '#e0654a', dollars: '#7c73e6', recycle: '#5aa9e6' };

  // 2D-map label placement for the crowded Gulf–India cluster. Default (any
  // country not listed) is centred 12px above the dot. Values are in the SVG's
  // 1000×500 units. Fanning IQ left, SA below-left, AE below-right and keeping
  // IR/IN above stops the two-letter codes from overlapping each other.
  const LABEL_OFFSETS = {
    IQ: { x: -9, y: -3,  anchor: 'end' },     // Iraq → left of its dot
    IR: { x: 0,  y: -12, anchor: 'middle' },  // Iran → above
    SA: { x: -3, y: 15,  anchor: 'end' },     // Saudi → below-left
    AE: { x: 3,  y: 15,  anchor: 'start' },   // UAE → below-right
    IN: { x: 0,  y: -13, anchor: 'middle' },  // India → above (the focus)
  };

  // Simplified continent outlines as [lat, lon] rings — low-poly, hand-tuned
  // for the equirectangular 1000×500 map. Purely decorative context so the
  // country markers sit on recognisable landmasses rather than an empty grid.
  const CONTINENTS = [
    // North America
    [[71,-156],[70,-128],[60,-140],[55,-131],[48,-124],[33,-117],[23,-110],[18,-95],[21,-87],[30,-82],[25,-80],[35,-76],[45,-67],[52,-56],[60,-64],[58,-78],[63,-78],[68,-84],[70,-110],[71,-156]],
    // South America
    [[11,-72],[6,-77],[-5,-81],[-18,-70],[-32,-72],[-46,-75],[-54,-69],[-51,-59],[-38,-58],[-23,-43],[-8,-35],[0,-50],[6,-58],[11,-72]],
    // Africa
    [[35,-6],[32,10],[31,26],[24,35],[12,43],[0,42],[-15,40],[-26,33],[-34,26],[-34,19],[-22,14],[-6,9],[4,9],[5,-4],[10,-15],[20,-17],[31,-10],[35,-6]],
    // Europe
    [[71,25],[66,15],[58,5],[62,-2],[58,-6],[50,-5],[44,-2],[43,6],[40,18],[41,28],[45,30],[55,28],[60,30],[65,24],[71,25]],
    // Asia
    [[66,32],[62,60],[70,90],[73,110],[70,140],[60,160],[52,142],[43,132],[35,127],[30,122],[22,115],[10,105],[8,98],[15,95],[22,90],[20,72],[25,62],[26,52],[30,48],[38,46],[45,50],[55,55],[60,45],[66,32]],
    // Australia
    [[-12,131],[-11,142],[-20,149],[-28,154],[-38,147],[-38,140],[-32,130],[-35,118],[-22,114],[-15,124],[-12,131]],
  ];

  let activeFlow = 'all';
  let selectedId = null;

  // ── Shared: country selection updates the side panel ──
  function selectCountry(id) {
    selectedId = id;
    const c = byId[id];
    const empty = document.getElementById('globePanelEmpty');
    const card = document.getElementById('globePanelCard');
    if (!c) { empty.hidden = false; card.hidden = true; return; }
    empty.hidden = true;
    card.hidden = false;
    document.getElementById('gcFlag').textContent = c.flag;
    document.getElementById('gcName').textContent = c.name;
    const roleLabel = { printer: 'Dollar issuer', importer: 'Oil importer', exporter: 'Oil exporter / recycler', india: 'The focus — India' }[c.role];
    document.getElementById('gcRole').textContent = roleLabel;
    document.getElementById('gcSummary').textContent = c.summary;
    const rupeeEl = document.getElementById('gcRupee');
    if (rupeeEl) {
      if (c.rupee) {
        rupeeEl.innerHTML = '<span class="gc-rupee-label">FOR THE RUPEE</span>' + c.rupee;
        rupeeEl.hidden = false;
      } else {
        rupeeEl.hidden = true;
      }
    }
    document.getElementById('gcStats').innerHTML = c.stats.map(([k, v]) =>
      '<div class="globe-card-stat"><span class="gc-k">' + k + '</span><span class="gc-v">' + v + '</span></div>'
    ).join('');
    const related = FLOWS.filter(f => f.from === id || f.to === id);
    document.getElementById('gcFlows').innerHTML = related.length
      ? '<div class="gc-flows-title">FLOWS</div>' + related.map(f => {
          const other = f.from === id ? byId[f.to] : byId[f.from];
          const dir = f.from === id ? '→' : '←';
          const label = { oil: 'oil', dollars: 'dollars', recycle: 'recycling' }[f.type];
          return '<div class="gc-flow-row"><span class="gc-flow-dot" style="background:' + FLOW_COLORS[f.type] + '"></span>' +
                 c.flag + ' ' + dir + ' ' + other.flag + ' <span class="gc-flow-label">' + label + '</span></div>';
        }).join('')
      : '';
    // reflect selection in the active renderer
    if (render2D.active) render2D.highlight(id);
    if (window.__globe3d && window.__globe3d.highlight) window.__globe3d.highlight(id);
  }

  function flowVisible(type) { return activeFlow === 'all' || activeFlow === type; }

  // ── 2D renderer (SVG, always available) ──
  const render2D = (function () {
    const svg = document.getElementById('globe2dSvg');
    const NS = 'http://www.w3.org/2000/svg';
    // Equirectangular projection into the 1000×500 viewBox
    function project(lat, lon) {
      return { x: (lon + 180) / 360 * 1000, y: (90 - lat) / 180 * 500 };
    }
    let built = false, active = false;

    function build() {
      if (built) return;
      built = true;

      // landmasses (decorative context)
      const land = document.createElementNS(NS, 'g');
      land.setAttribute('class', 'g2d-land');
      CONTINENTS.forEach(ring => {
        const d = ring.map((pt, i) => {
          const p = project(pt[0], pt[1]);
          return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
        }).join(' ') + ' Z';
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', d);
        land.appendChild(path);
      });
      svg.appendChild(land);

      // subtle grid
      const grid = document.createElementNS(NS, 'g');
      grid.setAttribute('class', 'g2d-grid');
      for (let lon = -180; lon <= 180; lon += 30) {
        const { x } = project(0, lon);
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', x); l.setAttribute('y1', 0); l.setAttribute('x2', x); l.setAttribute('y2', 500);
        grid.appendChild(l);
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const { y } = project(lat, 0);
        const l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', 0); l.setAttribute('y1', y); l.setAttribute('x2', 1000); l.setAttribute('y2', y);
        grid.appendChild(l);
      }
      svg.appendChild(grid);

      // flow arcs (quadratic curves bending toward the pole)
      const arcs = document.createElementNS(NS, 'g');
      arcs.setAttribute('class', 'g2d-arcs');
      FLOWS.forEach((f, i) => {
        const a = project(byId[f.from].lat, byId[f.from].lon);
        const b = project(byId[f.to].lat, byId[f.to].lon);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.18 - 20;
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`);
        path.setAttribute('class', 'g2d-arc');
        path.setAttribute('data-flow', f.type);
        path.setAttribute('stroke', FLOW_COLORS[f.type]);
        arcs.appendChild(path);
        // moving dot
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', '3');
        dot.setAttribute('fill', FLOW_COLORS[f.type]);
        dot.setAttribute('class', 'g2d-arc-dot');
        dot.setAttribute('data-flow', f.type);
        const anim = document.createElementNS(NS, 'animateMotion');
        anim.setAttribute('dur', (2.4 + (i % 4) * 0.4) + 's');
        anim.setAttribute('repeatCount', 'indefinite');
        anim.setAttribute('path', `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`);
        dot.appendChild(anim);
        arcs.appendChild(dot);
      });
      svg.appendChild(arcs);

      // country markers
      const nodes = document.createElementNS(NS, 'g');
      nodes.setAttribute('class', 'g2d-nodes');
      COUNTRIES.forEach(c => {
        const p = project(c.lat, c.lon);
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'g2d-node');
        g.setAttribute('data-id', c.id);
        g.setAttribute('transform', `translate(${p.x},${p.y})`);
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', c.name + ' — ' + c.role);
        const halo = document.createElementNS(NS, 'circle');
        halo.setAttribute('r', c.role === 'india' ? '11' : '8');
        halo.setAttribute('class', 'g2d-node-halo');
        halo.setAttribute('fill', ROLE_COLORS[c.role]);
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', c.role === 'india' ? '6' : '4.5');
        dot.setAttribute('fill', ROLE_COLORS[c.role]);
        dot.setAttribute('stroke', '#12100f');
        dot.setAttribute('stroke-width', '1.5');
        const label = document.createElementNS(NS, 'text');
        // The Gulf–India band (IQ/IR/SA/AE/IN) is crowded, so fan those labels
        // out to different sides instead of stacking them all above their dots.
        const off = LABEL_OFFSETS[c.id] || { x: 0, y: -12, anchor: 'middle' };
        label.setAttribute('x', off.x);
        label.setAttribute('y', off.y);
        label.setAttribute('text-anchor', off.anchor);
        label.setAttribute('class', 'g2d-node-label');
        label.textContent = c.id;
        g.appendChild(halo); g.appendChild(dot); g.appendChild(label);
        g.addEventListener('click', () => selectCountry(c.id));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCountry(c.id); } });
        nodes.appendChild(g);
      });
      svg.appendChild(nodes);
    }

    function applyFilter() {
      svg.querySelectorAll('[data-flow]').forEach(el => {
        el.style.display = flowVisible(el.getAttribute('data-flow')) ? '' : 'none';
      });
    }
    function highlight(id) {
      svg.querySelectorAll('.g2d-node').forEach(n =>
        n.classList.toggle('is-selected', n.getAttribute('data-id') === id));
    }
    return {
      get active() { return active; },
      show() { build(); applyFilter(); active = true; if (selectedId) highlight(selectedId); },
      hide() { active = false; },
      applyFilter, highlight,
    };
  })();

  // ── 3D renderer (Three.js, lazy) ──
  // Uses the modern ES-module build (the legacy UMD build/three.min.js is
  // deprecated at r150+). Loaded on demand via dynamic import so it costs
  // nothing until the user opts into 3D.
  let threeLoading = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threeLoading) return threeLoading;
    threeLoading = import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js')
      .then(mod => { window.THREE = mod; return mod; });
    return threeLoading;
  }

  function latLonToVec3(lat, lon, r, THREE) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function initGlobe3D(THREE) {
    if (window.__globe3d) { window.__globe3d.resume(); return; }
    const canvas = document.getElementById('globeCanvas');
    const host = document.getElementById('globe3d');
    const R = 1.6;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    // globe
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(R, 48, 48),
      new THREE.MeshPhongMaterial({ color: 0x1c3a4a, emissive: 0x0a1a24, shininess: 12, transparent: true, opacity: 0.94 })
    );
    scene.add(globe);
    // wireframe graticule
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(R * 1.001, 24, 16)),
      new THREE.LineBasicMaterial({ color: 0x2f5a70, transparent: true, opacity: 0.28 })
    );
    scene.add(wire);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6); dir.position.set(3, 2, 4); scene.add(dir);

    const group = new THREE.Group(); scene.add(group);

    // country markers
    const markerMeshes = [];
    COUNTRIES.forEach(c => {
      const pos = latLonToVec3(c.lat, c.lon, R * 1.02, THREE);
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(c.role === 'india' ? 0.055 : 0.04, 16, 16),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(ROLE_COLORS[c.role]) })
      );
      m.position.copy(pos);
      m.userData.id = c.id;
      group.add(m);
      markerMeshes.push(m);
    });

    // flow arcs as tube-ish curves lifted off the surface
    const arcObjs = [];
    FLOWS.forEach(f => {
      const start = latLonToVec3(byId[f.from].lat, byId[f.from].lon, R * 1.02, THREE);
      const end = latLonToVec3(byId[f.to].lat, byId[f.to].lon, R * 1.02, THREE);
      const mid = start.clone().add(end).multiplyScalar(0.5).setLength(R * (1.15 + start.distanceTo(end) * 0.12));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: new THREE.Color(FLOW_COLORS[f.type]), transparent: true, opacity: 0.6 }));
      line.userData.flow = f.type;
      group.add(line);
      // travelling dot
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(FLOW_COLORS[f.type]) }));
      dot.userData.flow = f.type;
      group.add(dot);
      arcObjs.push({ curve, dot, line, speed: 0.12 + Math.random() * 0.08, t: Math.random() });
    });

    function applyFilter3D() {
      arcObjs.forEach(a => {
        const vis = flowVisible(a.line.userData.flow);
        a.line.visible = vis; a.dot.visible = vis;
      });
    }
    applyFilter3D();

    // interaction: drag to rotate, wheel to zoom, click to select
    let dragging = false, px = 0, py = 0, autoRotate = true;
    let rotY = 0.4, rotX = 0.15, zoom = 5;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) autoRotate = false;

    function onDown(e) { dragging = true; autoRotate = false; const t = e.touches ? e.touches[0] : e; px = t.clientX; py = t.clientY; }
    function onMove(e) {
      if (!dragging) return;
      const t = e.touches ? e.touches[0] : e;
      rotY += (t.clientX - px) * 0.005; rotX += (t.clientY - py) * 0.005;
      rotX = Math.max(-1.2, Math.min(1.2, rotX));
      px = t.clientX; py = t.clientY;
    }
    function onUp() { dragging = false; }
    function onWheel(e) { e.preventDefault(); zoom = Math.max(3, Math.min(9, zoom + Math.sign(e.deltaY) * 0.4)); }
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('touchend', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downX = 0, downY = 0;
    canvas.addEventListener('mousedown', e => { downX = e.clientX; downY = e.clientY; });
    canvas.addEventListener('click', e => {
      if (Math.abs(e.clientX - downX) > 4 || Math.abs(e.clientY - downY) > 4) return; // was a drag
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(markerMeshes);
      if (hits.length) selectCountry(hits[0].object.userData.id);
    });

    function highlight3D(id) {
      markerMeshes.forEach(m => {
        const on = m.userData.id === id;
        m.scale.setScalar(on ? 1.8 : 1);
      });
    }

    function resize() {
      const w = host.clientWidth, h = host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    let running = true, clock = 0, contextLost = false;
    function frame() {
      if (!running || contextLost) return;
      requestAnimationFrame(frame);
      clock += 0.016;
      if (autoRotate) rotY += 0.0018;
      group.rotation.y = rotY; group.rotation.x = rotX;
      globe.rotation.y = rotY; globe.rotation.x = rotX;
      wire.rotation.y = rotY; wire.rotation.x = rotX;
      camera.position.setLength(zoom);
      camera.lookAt(0, 0, 0);
      if (!reduced) arcObjs.forEach(a => {
        if (!a.dot.visible) return;
        a.t = (a.t + a.speed * 0.016) % 1;
        a.dot.position.copy(a.curve.getPoint(a.t));
      });
      renderer.render(scene, camera);
    }
    frame();

    // WebGL context loss (common on mobile under memory pressure or when the
    // tab is backgrounded). Without this the globe freezes to a black square
    // with no way back. Pause the loop and, if the GPU doesn't recover within
    // a few seconds, drop to the always-available 2D map.
    let restoreTimer = null;
    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault(); // required so the browser will try to restore
      contextLost = true;
      restoreTimer = setTimeout(() => {
        if (contextLost && !el3d.hidden) show2D();
      }, 4000);
    }, false);
    canvas.addEventListener('webglcontextrestored', () => {
      if (restoreTimer) { clearTimeout(restoreTimer); restoreTimer = null; }
      contextLost = false;
      // Three.js re-uploads GPU resources automatically on restore; just
      // re-sync the drawing buffer size and restart the loop.
      resize();
      if (running) frame();
    }, false);

    window.__globe3d = {
      highlight: highlight3D,
      applyFilter: applyFilter3D,
      pause() { running = false; },
      resume() { if (!running && !contextLost) { running = true; resize(); frame(); } },
    };
    if (selectedId) highlight3D(selectedId);
  }

  // ── View toggle ──
  const el2d = document.getElementById('globe2d');
  const el3d = document.getElementById('globe3d');
  const btn2d = document.getElementById('globe2dBtn');
  const btn3d = document.getElementById('globe3dBtn');
  const loading = document.getElementById('globeLoading');
  const fallback = document.getElementById('globeFallback');
  const hint = document.getElementById('globeHint');

  function show2D() {
    btn2d.classList.add('active'); btn2d.setAttribute('aria-selected', 'true');
    btn3d.classList.remove('active'); btn3d.setAttribute('aria-selected', 'false');
    el2d.hidden = false; el3d.hidden = true;
    hint.textContent = 'Tap a country dot to see its role';
    render2D.show();
    if (window.__globe3d) window.__globe3d.pause();
  }
  function show3D() {
    btn3d.classList.add('active'); btn3d.setAttribute('aria-selected', 'true');
    btn2d.classList.remove('active'); btn2d.setAttribute('aria-selected', 'false');
    el2d.hidden = true; el3d.hidden = false;
    render2D.hide();
    hint.textContent = 'Drag to rotate · scroll to zoom · tap a country';
    loading.hidden = false; fallback.hidden = true;
    loadThree().then(THREE => {
      loading.hidden = true;
      initGlobe3D(THREE);
    }).catch(() => {
      loading.hidden = true; fallback.hidden = false;
    });
  }
  btn2d.addEventListener('click', show2D);
  btn3d.addEventListener('click', show3D);
  document.getElementById('globeBackTo2d').addEventListener('click', show2D);

  // flow filter
  document.querySelectorAll('.globe-flow-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.globe-flow-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      activeFlow = b.getAttribute('data-flow');
      render2D.applyFilter();
      if (window.__globe3d) window.__globe3d.applyFilter();
    });
  });

  // Cheap one-off WebGL capability probe. If the context can't be created we
  // stay on the dependency-free 2D map instead of flashing the 3D fallback.
  function canUseWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  // Default to the interactive 3D globe when the device can render it. Fall back
  // to 2D when WebGL is unavailable, or when the user prefers reduced motion
  // (the 3D globe auto-rotates, so 2D is the calmer, honest default there).
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canUseWebGL() && !prefersReducedMotion) {
    show3D();
  } else {
    show2D();
  }
  selectCountry('IN'); // preselect India as the focus in either view

  // Pause the 3D render loop while the globe is scrolled out of view so it
  // doesn't burn GPU/battery running at 60fps in the background. Only touches
  // the loop when the 3D view is the active one; the 2D map is static anyway.
  if ('IntersectionObserver' in window) {
    const stage = document.getElementById('globeStage');
    if (stage) {
      const visObserver = new IntersectionObserver(entries => {
        const visible = entries[0].isIntersecting;
        if (!window.__globe3d || el3d.hidden) return;
        if (visible) window.__globe3d.resume();
        else window.__globe3d.pause();
      }, { threshold: 0.05 });
      visObserver.observe(stage);
    }
  }
})();

/* ── Knowledge Base search ───────────────────────────────────────────────
   Live-filters the glossary + questions columns by term text. Highlights
   matches, hides items/columns that don't match, and shows a no-results
   note. Pure text filter over the ~17 <details> items — no index needed. */
(function initKbSearch() {
  const input = document.getElementById('kbSearch');
  const clearBtn = document.getElementById('kbSearchClear');
  const empty = document.getElementById('kbSearchEmpty');
  if (!input) return;

  const items = Array.from(document.querySelectorAll('#knowledge .kb-item'));
  const cols = Array.from(document.querySelectorAll('#knowledge .kb-col'));
  // Cache each item's original markup so we can strip <mark> between keystrokes.
  const cache = items.map(it => ({
    el: it,
    summary: it.querySelector('summary'),
    body: it.querySelector('.kb-item-body'),
    summaryHTML: it.querySelector('summary') ? it.querySelector('summary').innerHTML : '',
    bodyHTML: it.querySelector('.kb-item-body') ? it.querySelector('.kb-item-body').innerHTML : '',
    text: (it.textContent || '').toLowerCase()
  }));

  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Wrap matches in <mark>, transforming only the text segments so we never
  // corrupt tags or HTML entities. Splitting on <...> keeps tag chunks intact
  // and also works when the content is plain text (no tags at all).
  function highlight(html, re) {
    return html.split(/(<[^>]+>)/).map(chunk =>
      chunk.startsWith('<') ? chunk : chunk.replace(re, '<mark>$&</mark>')
    ).join('');
  }

  function apply(q) {
    const query = q.trim().toLowerCase();
    clearBtn.hidden = query === '';

    if (!query) {
      cache.forEach(c => {
        c.el.hidden = false;
        if (c.summary) c.summary.innerHTML = c.summaryHTML;
        if (c.body) c.body.innerHTML = c.bodyHTML;
        c.el.open = false;
      });
      cols.forEach(col => { col.hidden = false; });
      empty.hidden = true;
      return;
    }

    const re = new RegExp(escRe(query), 'gi');
    let matches = 0;
    cache.forEach(c => {
      const hit = c.text.includes(query);
      c.el.hidden = !hit;
      if (hit) {
        matches++;
        if (c.summary) c.summary.innerHTML = highlight(c.summaryHTML, re);
        if (c.body) c.body.innerHTML = highlight(c.bodyHTML, re);
        c.el.open = true; // reveal the definition so the match is visible
      } else {
        if (c.summary) c.summary.innerHTML = c.summaryHTML;
        if (c.body) c.body.innerHTML = c.bodyHTML;
      }
    });

    // Hide a whole column if none of its items matched.
    cols.forEach(col => {
      const anyVisible = Array.from(col.querySelectorAll('.kb-item')).some(el => !el.hidden);
      col.hidden = !anyVisible;
    });

    empty.hidden = matches > 0;
    if (matches === 0) empty.querySelector('span').textContent = q.trim();
  }

  input.addEventListener('input', () => apply(input.value));
  clearBtn.addEventListener('click', () => {
    input.value = '';
    apply('');
    input.focus();
  });
  // Esc clears while the box is focused.
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      input.value = '';
      apply('');
    }
  });
})();

/* ── Self-test quiz ──────────────────────────────────────────────────────
   Eight questions on the core content. One correct answer each, with an
   explanation shown on selection. Answers are grounded in the page's own
   glossary/sections so the quiz stays consistent with the copy above. */
(function initQuiz() {
  const root = document.getElementById('quiz');
  if (!root) return;
  const bodyEl = document.getElementById('quizBody');
  const progEl = document.getElementById('quizProgress');
  const resultEl = document.getElementById('quizResult');
  const scoreEl = document.getElementById('quizScore');
  const verdictEl = document.getElementById('quizVerdict');
  const retryBtn = document.getElementById('quizRetry');

  const QUESTIONS = [
    {
      q: 'What is the "petrodollar" system?',
      options: [
        'A special banknote used only to buy oil',
        'Oil priced and sold in US dollars, which exporters then recycle into US assets',
        'A digital currency issued by oil-producing nations',
        'The Fed printing dollars specifically to import oil'
      ],
      answer: 1,
      explain: 'Since the 1970s, crude has been priced and settled mostly in dollars. Exporters earn dollars and "recycle" them into US assets — chiefly Treasuries — keeping global demand for dollars high.'
    },
    {
      q: 'If the US prints trillions of dollars, why doesn\'t the dollar collapse?',
      options: [
        'The Fed secretly destroys an equal amount of old cash',
        'Other countries are legally barred from selling dollars',
        'The world needs dollars for oil, trade and reserves, so demand absorbs the extra supply',
        'US gold reserves back every new dollar'
      ],
      answer: 2,
      explain: 'A normal currency weakens when you print it. The dollar is propped up by standing global demand — it\'s everyone else\'s plumbing for oil, trade settlement and reserves (~58% of global reserves).'
    },
    {
      q: 'Why can\'t India simply print rupees to pay for its oil?',
      options: [
        'International law forbids printing money for imports',
        'Oil exporters want dollars, so India must first sell rupees to buy dollars',
        'India has no printing presses for large denominations',
        'The RBI is not allowed to increase the money supply'
      ],
      answer: 1,
      explain: 'Saudi Arabia and most exporters want dollars, not rupees. India must sell rupees to buy dollars first — so printing more rupees would weaken the currency and make oil dearer, not cheaper.'
    },
    {
      q: 'What does the Dollar Index (DXY) measure?',
      options: [
        'The number of dollars in circulation worldwide',
        'The dollar\'s strength against a basket of six major currencies',
        'The interest rate the Fed charges banks',
        'How many barrels of oil one dollar buys'
      ],
      answer: 1,
      explain: 'DXY tracks the dollar against six majors (euro, yen, pound, and others). When DXY rises the dollar is strong globally — and the rupee tends to weaken regardless of India\'s own fundamentals.'
    },
    {
      q: 'What are "FII/FPI flows," and why do they move the rupee?',
      options: [
        'Government-to-government loans that rarely change',
        'Foreign investment in Indian stocks and bonds — "hot" money that can leave fast',
        'India\'s foreign aid budget',
        'The RBI\'s gold purchases'
      ],
      answer: 1,
      explain: 'Foreign Portfolio/Institutional Investment is overseas money in Indian equities and debt. It can exit quickly; that buying and selling moves the rupee in real time. India saw ~$21B of outflows in 2026.'
    },
    {
      q: 'What was the 2013 "taper tantrum"?',
      options: [
        'A spike in oil prices after a Gulf conflict',
        'The rupee being formally devalued by the RBI',
        'Capital fleeing emerging markets when the Fed hinted it would slow QE',
        'India defaulting on its foreign debt'
      ],
      answer: 2,
      explain: 'The Fed merely signalled it would slow bond-buying, and money rushed out of emerging markets. The rupee fell from about ₹54 to ₹68 in months — the classic example of India\'s sensitivity to Fed signals.'
    },
    {
      q: 'What does RBI intervention actually achieve for the rupee?',
      options: [
        'It permanently fixes the exchange rate',
        'It smooths sharp moves by selling dollars, but can\'t reverse a structural trend',
        'It prints rupees to buy oil directly',
        'It sets global interest rates'
      ],
      answer: 1,
      explain: 'The RBI sells dollars from reserves to slow sharp falls — managing the pace of depreciation rather than preventing it. Fighting a structural trend burns reserves fast, so every dollar spent is one not saved for a future crisis.'
    },
    {
      q: 'Is a weaker rupee bad for everyone in India?',
      options: [
        'Yes — it hurts every part of the economy equally',
        'No — it raises import costs but benefits dollar-earning exporters like IT and pharma',
        'No — it makes imported oil cheaper',
        'Yes — it always causes the stock market to crash'
      ],
      answer: 1,
      explain: 'A weaker rupee makes imports and foreign travel costlier, but exporters earning dollars get more rupees per dollar. That\'s why IT and pharma benefit — and why the stock market can hold up even as the currency slides.'
    }
  ];

  let idx = 0;
  let score = 0;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function render() {
    const item = QUESTIONS[idx];
    progEl.textContent = `Question ${idx + 1} of ${QUESTIONS.length}`;
    resultEl.hidden = true;
    bodyEl.hidden = false;

    const opts = item.options.map((opt, i) =>
      `<button type="button" class="quiz-option" data-i="${i}">
         <span class="quiz-option-key">${String.fromCharCode(65 + i)}</span>
         <span>${escapeHtml(opt)}</span>
       </button>`
    ).join('');

    bodyEl.innerHTML =
      `<div class="quiz-q" data-q="${idx}">
         <div class="quiz-q-num">Question ${idx + 1} / ${QUESTIONS.length}</div>
         <p class="quiz-q-text">${escapeHtml(item.q)}</p>
         <div class="quiz-options">${opts}</div>
         <div class="quiz-explain" hidden></div>
         <div class="quiz-next-wrap" hidden>
           <button type="button" class="btn btn--primary" data-next>${idx === QUESTIONS.length - 1 ? 'See my score' : 'Next question'}</button>
         </div>
       </div>`;

    const optionBtns = Array.from(bodyEl.querySelectorAll('.quiz-option'));
    const explainEl = bodyEl.querySelector('.quiz-explain');
    const nextWrap = bodyEl.querySelector('.quiz-next-wrap');

    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = Number(btn.dataset.i);
        const correct = item.answer;
        optionBtns.forEach(b => { b.disabled = true; });
        optionBtns[correct].classList.add('is-correct');
        if (chosen !== correct) btn.classList.add('is-wrong');
        else score++;

        explainEl.innerHTML = (chosen === correct ? '<strong>Correct.</strong> ' : '<strong>Not quite.</strong> ')
          + escapeHtml(item.explain);
        explainEl.hidden = false;
        nextWrap.hidden = false;
        nextWrap.querySelector('[data-next]').focus();
      });
    });

    nextWrap.querySelector('[data-next]').addEventListener('click', () => {
      if (idx < QUESTIONS.length - 1) { idx++; render(); }
      else finish();
      if (!prefersReduced) root.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function finish() {
    bodyEl.hidden = true;
    resultEl.hidden = false;
    progEl.textContent = 'Complete';
    scoreEl.textContent = `${score} / ${QUESTIONS.length}`;
    let verdict;
    if (score === QUESTIONS.length) verdict = 'Perfect — you\'ve got the whole chain, from petrodollar to rupee.';
    else if (score >= 6) verdict = 'Strong. You understand the core forces; skim the sections you missed to lock it in.';
    else if (score >= 4) verdict = 'A solid start. Revisit the "How printing works" and "Six factors" sections and try again.';
    else verdict = 'Worth another pass — the Knowledge Base glossary above covers every term you\'ll need.';
    verdictEl.textContent = verdict;
    retryBtn.focus();
  }

  retryBtn.addEventListener('click', () => {
    idx = 0; score = 0;
    render();
    if (!prefersReduced) root.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Reveal + start once wired up (kept hidden by default so no-JS users
  // don't see an empty shell).
  root.hidden = false;
  render();
})();

/* ── Data download (CSV / JSON) ──────────────────────────────────────────
   Lets readers grab the 2000–2026 series (US M2 vs USD/INR, with the event
   annotations) that drives the timeline reel. Client-side blob download —
   no dependency, works offline, self-documenting metadata in the JSON. */
(function initDataDownload() {
  const csvBtn = document.getElementById('dlCsv');
  const jsonBtn = document.getElementById('dlJson');
  if (!csvBtn || typeof reelData === 'undefined') return;

  const VERIFIED = '2026-05-14';
  const rows = reelData.map(d => ({
    year: d.y,
    us_m2_trillions_usd: d.m2,
    usd_inr: d.inr,
    event: d.title,
    note: d.desc
  }));

  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke on the next tick so the download has grabbed the blob.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  // RFC-4180 quoting: wrap in quotes and double any embedded quotes.
  function csvCell(v) {
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function toCsv() {
    const cols = ['year', 'us_m2_trillions_usd', 'usd_inr', 'event', 'note'];
    const header = cols.join(',');
    const body = rows.map(r => cols.map(c => csvCell(r[c])).join(',')).join('\n');
    // Comment lines document provenance without breaking most CSV parsers.
    const preamble =
      '# The Petrodollar Paradox — US M2 vs USD/INR, 2000–2026\n' +
      '# Sources: FRED (M2SL, St. Louis Fed) · RBI Reference Rate (FBIL)\n' +
      '# Last verified: ' + VERIFIED + '. Educational use; not investment advice.\n';
    return preamble + header + '\n' + body + '\n';
  }

  function toJson() {
    return JSON.stringify({
      title: 'The Petrodollar Paradox — US M2 vs USD/INR',
      description: 'Annual snapshots of US M2 money supply (trillions USD) and the USD/INR exchange rate, with the macro event of each year.',
      sources: [
        'FRED series M2SL (Federal Reserve Bank of St. Louis)',
        'RBI Reference Rate (FBIL)'
      ],
      last_verified: VERIFIED,
      disclaimer: 'Educational explainer. Not investment advice.',
      units: { us_m2_trillions_usd: 'trillions of US dollars', usd_inr: 'rupees per US dollar' },
      series: rows
    }, null, 2) + '\n';
  }

  csvBtn.addEventListener('click', () => download('petrodollar-paradox-m2-vs-usdinr.csv', toCsv(), 'text/csv'));
  jsonBtn.addEventListener('click', () => download('petrodollar-paradox-m2-vs-usdinr.json', toJson(), 'application/json'));
})();

/* ── Scenario library ────────────────────────────────────────────────────
   Real episodes that shaped the rupee. Market-era cards carry a `sim` config
   that drives the value simulator (via window.applyScenario) so the model
   reproduces history. Deep-history cards predate the float and don't map onto
   the market sliders, so they omit `sim`. USD/INR levels align with the
   page's own reelData series where they overlap; each card is sourced. */
(function initScenarios() {
  const grid = document.getElementById('scnGrid');
  const gridDeep = document.getElementById('scnGridDeep');
  if (!grid) return;

  const SCENARIOS = [
    {
      year: '2013', title: 'The taper tantrum', from: 54, to: 68, dir: 'down',
      body: 'The Fed merely hinted it would slow bond-buying. Capital rushed out of emerging markets and the rupee fell ~20% in months — the textbook case of India\'s sensitivity to Fed signals.',
      lesson: 'A <strong>Fed signal</strong>, not an Indian problem, drove the crash. Capital flows front-run policy.',
      sim: { oil: 110, dxy: 85.0, fii: -35, fed: 2.25, rbi: 30 },
      src: { label: 'Taper tantrum', url: 'https://en.wikipedia.org/wiki/Taper_tantrum' }
    },
    {
      year: '2018', title: 'Oil + the EM selloff', from: 63, to: 74, dir: 'down',
      body: 'Fed hikes and quantitative tightening pulled dollars home while Brent pushed past $80. India\'s oil bill and a strong dollar squeezed the rupee past ₹70 for the first time.',
      lesson: 'Two of India\'s six factors — <strong>oil and the dollar</strong> — firing together is enough on its own.',
      sim: { oil: 80, dxy: 96.0, fii: -18, fed: 2.5, rbi: 15 },
      src: { label: 'Indian rupee · exchange rate', url: 'https://en.wikipedia.org/wiki/Indian_rupee#Exchange_rate' }
    },
    {
      year: '2020', title: 'The COVID money printer', from: 71, to: 77, dir: 'down',
      body: 'The Fed created ~$4T in months — the largest expansion in history. Paradoxically the dollar first surged in the panic ("dash for cash"), dragging the rupee to record lows before liquidity calmed it.',
      lesson: 'In a crisis the world runs <strong>to</strong> dollars, not away — so printing can strengthen the dollar short-term.',
      sim: { oil: 40, dxy: 92.5, fii: -28, fed: 0.25, rbi: 12 },
      src: { label: 'Quantitative easing', url: 'https://en.wikipedia.org/wiki/Quantitative_easing' }
    },
    {
      year: '2022', title: 'Inflation breaks out', from: 74, to: 83, dir: 'down',
      body: 'US inflation hit ~9% and the Fed hiked 525 bps in the fastest cycle in decades. The dollar surged worldwide and the rupee slid past ₹80 — "payback" for the pandemic printing.',
      lesson: 'The <strong>reversal</strong> of easy money is when emerging markets pay. QT and rate hikes pull capital back.',
      sim: { oil: 95, dxy: 106.0, fii: -30, fed: 4.5, rbi: 35 },
      src: { label: '2021–2023 inflation surge', url: 'https://en.wikipedia.org/wiki/2021%E2%80%932023_inflation_surge' }
    },
    {
      year: '2026', title: 'The Iran–US conflict', from: 88, to: 96, dir: 'down',
      body: 'Conflict near the Strait of Hormuz pushed Brent to ~$105 while the dollar stayed strong. With India importing ~85% of its crude, the rupee became Asia\'s weakest currency at ₹95.96.',
      lesson: 'The <strong>perfect storm</strong>: an oil shock and a strong dollar at once, against a structural import bill.',
      sim: { oil: 105, dxy: 98.3, fii: -21, fed: 5.0, rbi: 0 },
      src: { label: 'Strait of Hormuz', url: 'https://en.wikipedia.org/wiki/Strait_of_Hormuz' }
    },
    {
      year: '2017', title: 'The year it held', from: 68, to: 64, dir: 'up',
      body: 'The one recent stretch the rupee actually strengthened. A weak-dollar year, heavy foreign inflows into Indian equities and bonds, and calm oil let the rupee firm from ~₹68 toward ₹64.',
      lesson: 'The rupee is <strong>not one-directional</strong>. When the dollar is soft and inflows are strong, it can rise.',
      sim: { oil: 55, dxy: 92.0, fii: 30, fed: 1.25, rbi: 0 },
      src: { label: 'Indian rupee · exchange rate', url: 'https://en.wikipedia.org/wiki/Indian_rupee#Exchange_rate' }
    }
  ];

  const DEEP = [
    {
      year: '1966', title: 'The first big devaluation', from: 4.76, to: 7.50, dir: 'down',
      body: 'Facing war, drought and a balance-of-payments squeeze, India devalued the rupee ~57% against the dollar — a politically explosive move tied to foreign-aid conditions.',
      lesson: 'Even under a <strong>fixed peg</strong>, a currency can\'t defy its trade balance forever.',
      src: { label: 'History of the rupee', url: 'https://en.wikipedia.org/wiki/History_of_the_rupee#Post-independence' }
    },
    {
      year: '1975', title: 'Off sterling, onto a basket', from: 8.4, to: 8.4, dir: 'flat',
      body: 'India ended the rupee\'s link to the pound and pegged it to a basket of trading-partner currencies instead — an early step away from a single-anchor system toward managed flexibility.',
      lesson: 'Choosing <strong>what to peg to</strong> is itself a policy lever — and a bet on whose economy to ride.',
      src: { label: 'History of the rupee', url: 'https://en.wikipedia.org/wiki/History_of_the_rupee#Post-independence' }
    },
    {
      year: '1991', title: 'The crisis that opened India', from: 21, to: 26, dir: 'down',
      body: 'Reserves fell to barely two weeks of imports. India airlifted gold to the Bank of England as collateral, devalued sharply, and launched the liberalisation that reshaped the economy.',
      lesson: 'The rupee\'s modern story starts here: crisis forced the <strong>market-based system</strong> we model today.',
      src: { label: '1991 economic crisis', url: 'https://en.wikipedia.org/wiki/1991_Indian_economic_crisis' }
    }
  ];

  const extIcon = '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const replayIcon = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function moveBadge(s) {
    if (s.dir === 'flat') return '<span class="scn-move">₹' + s.from + ' held</span>';
    const arrow = s.dir === 'up' ? '↑' : '↓';
    const cls = s.dir === 'up' ? 'scn-move--up' : 'scn-move--down';
    return '<span class="scn-move ' + cls + '">₹' + s.from + ' ' + arrow + ' ₹' + s.to + '</span>';
  }

  function card(s, deep) {
    const replay = (!deep && s.sim)
      ? '<button type="button" class="scn-replay" data-replay>' + replayIcon + 'Replay in simulator</button>'
      : '';
    const src = '<a class="scn-src" href="' + s.src.url + '" target="_blank" rel="noopener">' + s.src.label + ' ' + extIcon + '</a>';
    const el = document.createElement('article');
    el.className = 'scn-card' + (deep ? ' scn-card--deep' : '');
    el.innerHTML =
      '<div class="scn-card-top"><span class="scn-year">' + s.year + '</span>' + moveBadge(s) + '</div>' +
      '<h3 class="scn-title">' + s.title + '</h3>' +
      '<p class="scn-body">' + s.body + '</p>' +
      '<div class="scn-lesson">' + s.lesson + '</div>' +
      '<div class="scn-foot">' + replay + src + '</div>';

    if (!deep && s.sim) {
      el.querySelector('[data-replay]').addEventListener('click', () => {
        if (typeof window.applyScenario === 'function') window.applyScenario(s.sim);
        const target = document.getElementById('simulator');
        if (target) {
          const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
      });
    }
    return el;
  }

  SCENARIOS.forEach(s => grid.appendChild(card(s, false)));
  DEEP.forEach(s => gridDeep.appendChild(card(s, true)));
})();

/* ── Live hero rate (opt-in) ─────────────────────────────────────────────
   The page is static by design (snapshot as of the verified date). This lets
   a reader pull the *current* USD/INR on demand and see how far the rupee has
   moved since. It only touches the hero headline — the model, tables and
   simulator stay anchored to the verified snapshot to avoid mixing dates.
   Two independent no-key, CORS-open sources; static value restored on failure
   or on toggle-off. No network call happens unless the reader clicks. */
(function initLiveRate() {
  const wrap = document.querySelector('.hero-live');
  const btn = document.getElementById('heroLiveBtn');
  const label = document.getElementById('heroLiveLabel');
  const note = document.getElementById('heroLiveNote');
  const rateEl = document.getElementById('heroRate');
  const dateEl = document.getElementById('heroDate');
  if (!wrap || !btn || !rateEl || typeof fetch !== 'function') return;

  const STATIC_RATE = parseFloat(rateEl.dataset.counter); // 95.96
  const STATIC_DATE = dateEl ? dateEl.textContent : '';
  const decimals = parseInt(rateEl.dataset.decimals || '2');
  let showingLive = false;
  let liveShown = null; // remembers the fetched rate for the toggle

  // Reveal the control now that we know fetch is available.
  wrap.hidden = false;

  // Two sources tried in order. Each returns { rate, asOf } or throws.
  const SOURCES = [
    async () => {
      const r = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
      if (!r.ok) throw new Error('er-api ' + r.status);
      const j = await r.json();
      const rate = j && j.rates && j.rates.INR;
      if (!rate) throw new Error('er-api no INR');
      return { rate, asOf: j.time_last_update_utc ? new Date(j.time_last_update_utc) : new Date() };
    },
    async () => {
      const r = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=INR', { cache: 'no-store' });
      if (!r.ok) throw new Error('frankfurter ' + r.status);
      const j = await r.json();
      const rate = j && j.rates && j.rates.INR;
      if (!rate) throw new Error('frankfurter no INR');
      return { rate, asOf: j.date ? new Date(j.date + 'T00:00:00Z') : new Date() };
    }
  ];

  async function fetchLive() {
    let lastErr;
    for (const src of SOURCES) {
      try {
        const out = await Promise.race([
          src(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))
        ]);
        if (out && isFinite(out.rate) && out.rate > 0 && out.rate < 1000) return out;
      } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error('all sources failed');
  }

  function fmtDate(d) {
    try {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
    } catch (e) { return d.toISOString().slice(0, 10); }
  }

  function showStatic() {
    showingLive = false;
    animateCounter(rateEl, STATIC_RATE, decimals, 700);
    if (dateEl) dateEl.textContent = STATIC_DATE;
    label.textContent = 'Use live rate';
    note.textContent = '';
    note.classList.remove('is-error');
  }

  function showLive(out) {
    showingLive = true;
    liveShown = out;
    animateCounter(rateEl, out.rate, decimals, 900);
    if (dateEl) dateEl.textContent = 'LIVE · ' + fmtDate(out.asOf);
    label.textContent = 'Show snapshot (' + STATIC_RATE.toFixed(decimals) + ')';
    const delta = out.rate - STATIC_RATE;
    const dir = delta >= 0 ? 'weaker' : 'stronger';
    note.classList.remove('is-error');
    note.textContent = (delta >= 0 ? '+' : '−') + '₹' + Math.abs(delta).toFixed(2)
      + ' vs the snapshot — the rupee is ' + dir + ' now.';
  }

  btn.addEventListener('click', async () => {
    // Toggle back to the static snapshot without re-fetching.
    if (showingLive) { showStatic(); return; }
    if (liveShown) { showLive(liveShown); return; }

    btn.disabled = true;
    btn.classList.add('is-loading');
    note.classList.remove('is-error');
    note.textContent = 'Fetching…';
    try {
      const out = await fetchLive();
      showLive(out);
    } catch (e) {
      note.classList.add('is-error');
      note.textContent = 'Couldn\'t reach a live source — showing the verified snapshot.';
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
    }
  });
})();
