// The Third Space: shared behavior

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Generic form handler: validates, builds a mailto: to send the inquiry,
  // and shows an inline confirmation (no backend/booking system yet).
  document.querySelectorAll('form[data-mailto-subject]').forEach((form) => {
    const msg = form.querySelector('.form-msg');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const subject = form.getAttribute('data-mailto-subject');
      const lines = [];
      form.querySelectorAll('[name]').forEach((field) => {
        const label = field.closest('.field')?.querySelector('label')?.textContent?.trim() || field.name;
        const value = data.get(field.name);
        if (value) lines.push(`${label}: ${value}`);
      });

      const body = lines.join('\n');
      const mailto = `mailto:thirdspacereservations@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;

      if (msg) {
        msg.classList.remove('error');
        msg.classList.add('show');
        msg.textContent = "Opening your email client with this inquiry pre-filled, just hit send. If nothing opens, email us directly at thirdspacereservations@gmail.com.";
      }
    });
  });

  // Reservation / inquiry type toggle (Contact page)
  const toggleBtns = document.querySelectorAll('.type-toggle button');
  if (toggleBtns.length) {
    const panels = {
      roza: document.getElementById('form-roza'),
      event: document.getElementById('form-event'),
    };
    const activate = (target) => {
      toggleBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-target') === target));
      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        panel.style.display = key === target ? 'block' : 'none';
      });
    };
    toggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => activate(btn.getAttribute('data-target')));
    });

    const requested = new URLSearchParams(window.location.search).get('type');
    if (requested === 'roza' || requested === 'event') activate(requested);
  }

  // Scroll progress bar
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.innerHTML = '<div class="scroll-progress-bar"></div>';
  document.body.appendChild(progress);
  const progressBar = progress.querySelector('.scroll-progress-bar');

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      progressBar.style.width = pct + '%';
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  const revealSelectors = [
    '.two-col > div', '.teaser', '.split-card', '.stat',
    '.gallery-grid figure', '.form-card', '.photo-block',
    'section.block > .wrap > h2', 'section.block > .wrap > h3',
  ];
  const revealEls = document.querySelectorAll(revealSelectors.join(','));
  if (revealEls.length && 'IntersectionObserver' in window) {
    revealEls.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  }
});
