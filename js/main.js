// The Third Space: shared behavior

// --- EmailJS config ---
const EMAILJS_PUBLIC_KEY = '3y_aw8UjGmN4Fil80';
const EMAILJS_SERVICE_ID = 'service_ztu24sk';
const EMAILJS_TEMPLATE_BUSINESS = 'template_cm040lu';
const EMAILJS_TEMPLATE_CUSTOMER = 'template_8uphj66';
// -----------------------

if (window.emailjs) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Confirmation modal
  const CONFIRMATION_MESSAGE = "Thank you for your enquiry, we have sent you an email acknowledging your enquiry and someone from our team will be in touch to discuss the request/reservation to formalize it for you.";

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <span class="eyebrow">Request Received</span>
      <h3 id="modal-title">You're All Set</h3>
      <p>${CONFIRMATION_MESSAGE}</p>
    </div>
  `;
  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.classList.remove('show');
  modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Generic form handler: sends two emails via EmailJS (one notification to
  // the business, one autoresponse confirmation to the customer), shows an
  // inline confirmation, and pops up a matching confirmation modal.
  document.querySelectorAll('form[data-form-subject]').forEach((form) => {
    const msg = form.querySelector('.form-msg');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const data = new FormData(form);
      const subject = form.getAttribute('data-form-subject');
      const toEmail = form.querySelector('[type="email"]')?.value || '';
      const toName = form.querySelector('[name="Name"]')?.value || '';

      const lines = [];
      form.querySelectorAll('[name]').forEach((field) => {
        const label = field.closest('.field')?.querySelector('label')?.textContent?.trim() || field.name;
        const value = data.get(field.name);
        if (value) lines.push(`${label}: ${value}`);
      });

      const templateParams = {
        subject,
        to_name: toName,
        to_email: toEmail,
        message: lines.join('\n'),
      };

      if (submitBtn) submitBtn.disabled = true;

      Promise.all([
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_BUSINESS, templateParams),
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CUSTOMER, templateParams),
      ])
        .then(() => {
          if (msg) {
            msg.classList.remove('error');
            msg.classList.add('show');
            msg.textContent = CONFIRMATION_MESSAGE;
          }
          modalOverlay.classList.add('show');
          form.reset();
        })
        .catch(() => {
          if (msg) {
            msg.classList.add('show', 'error');
            msg.textContent = "Something went wrong sending your request. Please email us directly at thirdspacereservations@gmail.com.";
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
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
