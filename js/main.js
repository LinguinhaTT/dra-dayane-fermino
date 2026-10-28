const WA = 'https://wa.me/5515996498978?text=';

// Nav: fundo ao rolar + menu mobile
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const setMenu = (open) => {
  links.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.style.overflow = open ? 'hidden' : '';
};
toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Reveal: só anima o que começa abaixo da dobra, o resto já aparece pronto
const revealTargets = '.section-head, .proc, .step, .space__item, .faq details, .map__stage, .feature__text > *, .about__media, .about__text > *, .results__inner > *, .cta > *, .manifesto__tag';
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll(revealTargets).forEach((el) => {
  if (el.getBoundingClientRect().top > window.innerHeight) {
    el.classList.add('reveal');
    io.observe(el);
  }
});

// Manifesto: palavras acendem conforme a rolagem
const manifesto = document.querySelector('[data-words]');
if (manifesto) {
  const accents = ['futilidade,', 'cuidar', 'sente'];
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/)
    .map((w) => `<span class="w${accents.includes(w) ? ' accent' : ''}">${w}</span>`)
    .join(' ');
  const words = manifesto.querySelectorAll('.w');

  const paint = () => {
    const r = manifesto.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0), 1);
    const lit = Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < lit));
  };
  paint();
  window.addEventListener('scroll', paint, { passive: true });
  window.addEventListener('resize', paint);
}

// Mapa do rosto: x/y em % da ilustração (viewBox 400x500)
const regions = [
  { id: 'testa', label: 'Testa', x: 50, y: 25,
    issue: 'Linhas horizontais na testa',
    text: 'Aparecem com o movimento de levantar as sobrancelhas e, com o tempo, ficam marcadas mesmo com o rosto parado.',
    proc: 'Toxina botulínica' },
  { id: 'glabela', label: 'Entre as sobrancelhas', x: 50, y: 39,
    issue: 'A "ruga de bravo"',
    text: 'As linhas verticais entre as sobrancelhas deixam o semblante tenso ou cansado, mesmo quando você está tranquila.',
    proc: 'Toxina botulínica' },
  { id: 'olhos', label: 'Olhos', x: 72, y: 43,
    issue: 'Pés de galinha',
    text: 'As linhas no canto dos olhos que aparecem ao sorrir. Dá para suavizar sem perder a expressão do seu sorriso.',
    proc: 'Toxina botulínica' },
  { id: 'malar', label: 'Maçãs do rosto', x: 31, y: 54,
    issue: 'Perda de volume e sustentação',
    text: 'Com a idade ou depois de emagrecer, as maçãs perdem volume e o rosto fica com aspecto mais fundo e cansado.',
    proc: 'Bioestimulador de colágeno' },
  { id: 'labios', label: 'Lábios', x: 50, y: 70,
    issue: 'Lábios finos ou sem contorno',
    text: 'Contorno pouco definido, ressecamento ou assimetria. O volume é medido em ml para ficar proporcional ao seu rosto.',
    proc: 'Preenchimento labial' },
  { id: 'mandibula', label: 'Mandíbula', x: 71, y: 73,
    issue: 'Contorno sem definição',
    text: 'A flacidez faz a linha da mandíbula perder o desenho. Muito comum em quem emagreceu rápido.',
    proc: 'Harmonização facial ou Rosto de Mounjaro' },
  { id: 'queixo', label: 'Queixo', x: 50, y: 84,
    issue: 'Queixo pouco projetado',
    text: 'Um queixo retraído altera o equilíbrio de todo o perfil, inclusive a percepção do nariz e dos lábios.',
    proc: 'Harmonização facial' },
];

const spots = document.getElementById('faceSpots');
const panel = document.getElementById('mapPanel');
if (spots && panel) {
  const el = (id) => document.getElementById(id);
  const buttons = regions.map((r) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'spot';
    b.style.left = `${r.x}%`;
    b.style.top = `${r.y}%`;
    b.setAttribute('aria-label', r.label);
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="spot__label">${r.label}</span>`;
    b.addEventListener('click', () => select(r, b));
    spots.appendChild(b);
    return b;
  });

  function select(r, btn) {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    el('mapArea').textContent = r.label;
    el('mapIssue').textContent = r.issue;
    el('mapText').textContent = r.text;
    el('mapProc').textContent = r.proc;
    el('mapCta').href = WA + encodeURIComponent(`Olá, Dra. Day! Gostaria de avaliar a região: ${r.label.toLowerCase()}.`);
    panel.classList.remove('swap');
    void panel.offsetWidth;
    panel.classList.add('swap');
  }

  select(regions[4], buttons[4]);
  panel.classList.remove('swap');
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Carrossel do post "Rosto de Mounjaro": setas, bolinhas, arrastar e avanço automático
const post = document.getElementById('post');
if (post) {
  const track = post.querySelector('.post__track');
  const dots = post.querySelectorAll('.post__dots i');
  const total = track.children.length;
  let index = 0;
  let timer;

  const go = (i) => {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, n) => d.classList.toggle('on', n === index));
  };
  const restart = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => go(index + 1), 5000);
  };

  post.querySelector('.post__nav--prev').addEventListener('click', () => { go(index - 1); restart(); });
  post.querySelector('.post__nav--next').addEventListener('click', () => { go(index + 1); restart(); });

  let startX = null;
  post.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  post.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  });

  go(0);
  new IntersectionObserver(([e]) => (e.isIntersecting ? restart() : clearInterval(timer)), { threshold: 0.4 }).observe(post);
}

// Vídeo do ambiente: toca sem som enquanto está na tela; o botão pausa de vez
const video = document.querySelector('.space video');
const playBtn = document.querySelector('.space__play');
if (video && playBtn) {
  let userPaused = false;
  const sync = () => {
    playBtn.classList.toggle('is-paused', video.paused);
    playBtn.setAttribute('aria-label', video.paused ? 'Tocar vídeo' : 'Pausar vídeo');
  };
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  playBtn.addEventListener('click', () => {
    userPaused = !video.paused;
    if (userPaused) video.pause();
    else video.play().catch(() => {});
  });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !userPaused) video.play().catch(() => {});
    else if (!e.isIntersecting) video.pause();
  }, { threshold: 0.2 }).observe(video);
  sync();
}

document.getElementById('year').textContent = new Date().getFullYear();
