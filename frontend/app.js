// ---- Logo easter egg: 5 clicks within 3s plays a sound -----------------
const logo = document.getElementById('logo');
let clickCount = 0;
let resetTimer = null;

logo.addEventListener('click', () => {
  clickCount++;
  if (clickCount === 5) {
    playSound();
    clickCount = 0;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = null;
    return;
  }
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => { clickCount = 0; resetTimer = null; }, 3000);
});

function playSound() {
  const isFrench = Math.random() < 0.2;
  const file = isFrench ? 'assets/rammus_french.mp3' : 'assets/rammus-ok.mp3';
  const audio = new Audio(file);
  audio.volume = 0.7;
  audio.play().catch(() => playBeep());

  logo.style.transform = 'scale(1.2)';
  logo.style.background = '#ff8800';
  setTimeout(() => {
    logo.style.transform = 'scale(1)';
    logo.style.background = '#ff6600';
  }, 200);
}

function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
  osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

// ---- Item click handlers per type ---------------------------------------
const handlers = {
  url(item) {
    window.open(item.value, '_blank', 'noopener');
  },
  copy(item) {
    navigator.clipboard.writeText(item.value)
      .then(() => toast(`Copied: ${item.value}`))
      .catch(() => toast('Failed to copy'));
  },
};

function arrowFor(type) {
  switch (type) {
    case 'copy': return '📋';
    case 'url':  return '→';
    default:     return '→';
  }
}

function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// ---- Render -------------------------------------------------------------
async function render() {
  const list = document.getElementById('items');
  let data;
  try {
    const res = await fetch('services.json', { cache: 'no-cache' });
    data = await res.json();
  } catch (err) {
    list.innerHTML = `<li style="color:#fff">Failed to load services.json</li>`;
    return;
  }

  for (const item of data) {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <span class="item-name">${escape(item.name)}</span>
      <span class="item-arrow">${item.icon ? escape(item.icon) : arrowFor(item.type)}</span>
    `;
    const handler = handlers[item.type];
    if (handler) li.addEventListener('click', () => handler(item));
    list.appendChild(li);
  }
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

render();
