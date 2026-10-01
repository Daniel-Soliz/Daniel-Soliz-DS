const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    if (link.closest('.collection-index')) {
      document.querySelector('[data-filter="todos"]')?.click();
    }
    target.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
  });
});
// Static cards remain visible when JavaScript is unavailable.
const projectFilters = document.querySelector('.project-filters');
const projectCards = [...document.querySelectorAll('.portfolio-card')];
const projectCount = document.querySelector('.project-count');
if (projectFilters && projectCount) {
  projectFilters.hidden = false;
  projectFilters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    const category = button.dataset.filter;
    projectFilters.querySelectorAll('button').forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    projectCards.forEach(card => {
      card.hidden = category !== 'todos' && card.dataset.category !== category;
      if (!card.hidden) {
        count++;
        card.classList.add('visible');
      }
    });
    projectCount.textContent = count === 1 ? '1 projeto para explorar' : `${count} projetos para explorar`;
  });
}
