// ─── Counter on hero ──────────────────────────────────────────
function animateCounter(el, target, decimals, duration = 1800) {
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
const sections = ['#puzzle', '#timeline', '#printing', '#system', '#forces', '#simulator', '#currencies', '#solutions', '#impact', '#references']
  .map(id => document.querySelector(id))
  .filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = '#' + e.target.id;
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === id ? 'var(--ink)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

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

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = SIM_PRESETS[btn.dataset.preset];
    if (!p) return;
    sim.oil.value = p.oil;
    sim.dxy.value = p.dxy;
    sim.fii.value = p.fii;
    sim.fed.value = p.fed;
    sim.rbi.value = p.rbi;
    updateSim();
  });
});

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
    'nav.puzzle': 'Puzzle',
    'nav.timeline': 'Timeline',
    'nav.printing': 'USD Printing',
    'nav.system': 'The System',
    'nav.forces': 'Forces',
    'nav.simulator': 'Simulator',
    'nav.currencies': 'Currencies',
    'nav.solutions': 'The Way Out',
    'nav.impact': 'Impact',
    'nav.data': 'Data',
    'sol.label': 'THE WAY OUT',
    'sol.title': 'The rupee is trapped — but not powerless. Pick the levers.',
    'sol.lede': 'Diagnosis is only half the story. Toggle the policy and structural moves India can actually make — each is real, already underway in some form — and watch how far they could pull the rupee back from ₹95.96. No single lever fixes it. Stacked together, they add up.',
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
    'forces.label': 'THE FOUR FORCES',
    'forces.title': 'Every dollar-demand stream is firing at once.',
    'forces.lede': 'No single factor explains the slide. Four forces are stacking on top of each other in 2026 — and the rupee has nowhere to hide.',
    'sim.label': 'VALUE SIMULATOR',
    'sim.title': 'Move the sliders. Watch the rupee respond.',
    'sim.lede': 'A simplified linear model of the five major forces — oil, dollar strength, capital flows, Fed policy, and RBI defense. Adjust any input and the projected USD/INR updates instantly.',
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
    'nav.puzzle': 'पहेली',
    'nav.timeline': 'समयरेखा',
    'nav.printing': 'डॉलर छपाई',
    'nav.system': 'व्यवस्था',
    'nav.forces': 'बल',
    'nav.simulator': 'सिम्युलेटर',
    'nav.currencies': 'मुद्राएँ',
    'nav.impact': 'प्रभाव',
    'nav.data': 'डेटा',
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
  mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', ur: 'ur-IN',
};

const REEL_NAMES = {
  en: 'English', hi: 'हिन्दी (Hindi)', bn: 'বাংলা (Bengali)', ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)', mr: 'मराठी (Marathi)', gu: 'ગુજરાતી (Gujarati)',
  kn: 'ಕನ್ನಡ (Kannada)', ml: 'മലയാളം (Malayalam)', pa: 'ਪੰਜਾਬੀ (Punjabi)', ur: 'اردو (Urdu)',
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

// Preferred male English voice names (in order). Picked across macOS / iOS /
// Windows / Chrome / Android — first match wins. For non-English languages
// we just trust the OS to pick a sensible voice for that BCP-47 tag.
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

// Initialise first frame
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
