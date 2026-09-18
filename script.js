document.getElementById('year').textContent = new Date().getFullYear();

const links = document.querySelectorAll('a[href^="#"]');
links.forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const revealItems = document.querySelectorAll('.project-card, .service-grid article, .about-grid p, .coming');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(18px)';
  item.style.transition = 'opacity .6s ease, transform .6s ease';
  observer.observe(item);
});

const style = document.createElement('style');
style.textContent = '.visible{opacity:1!important;transform:translateY(0)!important}';
document.head.appendChild(style);
