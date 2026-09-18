const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

const header = document.querySelector('.header');
const progress = document.querySelector('.scroll-progress span');
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  if (header) header.classList.toggle('scrolled', window.scrollY > 24);

  let current = '';
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 180) current = section.id;
  }
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + current));
}
updateScrollUI();
window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);

const revealGroups = [
  ['.section-heading', 'from-left'],
  ['.about-grid p', ''],
  ['.project-card', ''],
  ['.service-grid article', ''],
  ['.coming', ''],
  ['.contact .kicker, .contact h2, .contact p, .social-actions', '']
];

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

let revealDelay = 0;
revealGroups.forEach(([selector, direction]) => {
  document.querySelectorAll(selector).forEach((item, index) => {
    item.classList.add('reveal');
    if (direction) item.classList.add(direction);
    item.style.transitionDelay = `${Math.min(index * 80, 240)}ms`;
    if (reducedMotion) item.classList.add('visible');
    else revealObserver.observe(item);
    revealDelay++;
  });
});

const heroCard = document.querySelector('.hero-card');
if (heroCard) {
  requestAnimationFrame(() => heroCard.classList.add('in-view'));
}

if (!reducedMotion && finePointer) {
  const glow = document.querySelector('.cursor-glow');
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
  window.addEventListener('pointermove', e => {
    tx = e.clientX;
    ty = e.clientY;
    if (glow) glow.style.opacity = '1';
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    if (glow) glow.style.opacity = '0';
  });

  const animateGlow = () => {
    gx += (tx - gx) * .12;
    gy += (ty - gy) * .12;
    if (glow) glow.style.transform = `translate3d(${gx - 210}px,${gy - 210}px,0)`;
    requestAnimationFrame(animateGlow);
  };
  animateGlow();

  if (heroCard) {
    heroCard.addEventListener('pointermove', e => {
      const r = heroCard.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      heroCard.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-3px)`;
    });
    heroCard.addEventListener('pointerleave', () => {
      heroCard.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  }

  document.querySelectorAll('.project-card, .service-grid article').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  document.querySelectorAll('.btn, .header-cta').forEach(button => {
    button.addEventListener('pointermove', e => {
      const r = button.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      button.style.transform = `translate(${x * .08}px,${y * .11}px) translateY(-2px)`;
    });
    button.addEventListener('pointerleave', () => button.style.transform = '');
  });
}

const canvas = document.getElementById('ambient-canvas');
if (canvas && !reducedMotion) {
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = 1;
  let particles = [];
  let pointer = { x: -9999, y: -9999 };

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(72, Math.max(32, Math.floor((width * height) / 22000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.25 + .35,
      phase: Math.random() * Math.PI * 2
    }));
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointermove', e => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  function frame(time) {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      const dxp = p.x - pointer.x;
      const dyp = p.y - pointer.y;
      const pd = Math.hypot(dxp, dyp);
      if (pd < 130 && pd > 0) {
        const force = (130 - pd) / 130;
        p.x += (dxp / pd) * force * 1.2;
        p.y += (dyp / pd) * force * 1.2;
      }

      const alpha = .2 + (Math.sin(time * .001 + p.phase) + 1) * .08;
      ctx.beginPath();
      ctx.fillStyle = `rgba(160,225,255,${alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 105) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(110,231,255,${(1 - dist / 105) * .055})`;
          ctx.lineWidth = .6;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  resizeCanvas();
  requestAnimationFrame(frame);
}
