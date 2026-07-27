const menuButton = document.querySelector('.menu-btn');
const menu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');
const toTop = document.querySelector('.to-top');

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.textContent = open ? '✕' : '☰';
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-menu a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.textContent = '☰';
  menuButton.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-35% 0px -55%' });
sections.forEach(section => sectionObserver.observe(section));

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  toTop.classList.toggle('visible', window.scrollY > 600);
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  projectCards.forEach(card => {
    const categories = card.dataset.category.split(' ');
    card.classList.toggle('hidden', filter !== 'all' && !categories.includes(filter));
  });
}));

const counter = document.querySelector('[data-count]');
let counterStarted = false;
const counterObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !counterStarted) {
    counterStarted = true;
    const target = Number(counter.dataset.count);
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      counter.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 95);
  }
}, { threshold: 0.7 });
counterObserver.observe(counter);

const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', event => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});
