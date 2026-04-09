/* ===================================================
   ELEVATE WEB SOLUTIONS — JavaScript
   =================================================== */

'use strict';

// Canvas background removed for superior scroll performance

// Custom cursor removed - using native OS cursor for better performance

// ──────────────────────────────────────────────────
// 3. LOADER
// ──────────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      triggerHeroAnimations();
    }, 2200);
  });
  document.body.style.overflow = 'hidden';
})();

function triggerHeroAnimations() {
  const heroEls = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-actions, .hero-stats, .hero-scroll-hint');
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`;
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 50);
  });
}

// ──────────────────────────────────────────────────
// 4. NAV SCROLL
// ──────────────────────────────────────────────────
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
  }

  document.querySelectorAll('.nav-link, .nav-cta').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });
})();

// ──────────────────────────────────────────────────
// 5. INTERSECTION OBSERVER — SCROLL ANIMATIONS
// ──────────────────────────────────────────────────
(function initScrollAnimations() {
  const opts = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target); // Stop observing once visible to save resources
      }
    });
  }, opts);

  // Group all elements that should fade up
  const animatedEls = document.querySelectorAll('.process-step, .testimonial-card, .anim-fade-up, .service-card, .faq-item');
  animatedEls.forEach(el => io.observe(el));
})();
// ──────────────────────────────────────────────────
// 6. COUNTER ANIMATION
// ──────────────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  const seen = new Set();

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !seen.has(e.target)) {
        seen.add(e.target);
        animateCounter(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

// ──────────────────────────────────────────────────
// 7. PRICING TOGGLE
// ──────────────────────────────────────────────────
(function initPricingToggle() {
  const toggleBtn = document.getElementById('pricing-toggle');
  const togMonthly = document.getElementById('tog-monthly');
  const togAnnual = document.getElementById('tog-annual');
  const amounts = document.querySelectorAll('.price-amount');
  let isAnnual = false;

  function updatePrices() {
    amounts.forEach(el => {
      const target = isAnnual ? parseInt(el.dataset.annual) : parseInt(el.dataset.monthly);
      const current = parseInt(el.textContent.replace(/,/g, ''));
      const duration = 400;
      const startTime = performance.now();
      const start = current;

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 2);
        const val = Math.round(start + (target - start) * ease);
        el.textContent = val.toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isAnnual = !isAnnual;
      toggleBtn.classList.toggle('active', isAnnual);
      togMonthly.classList.toggle('active', !isAnnual);
      togAnnual.classList.toggle('active', isAnnual);
      updatePrices();
    });
  }
})();

// ──────────────────────────────────────────────────
// 8. CONTACT FORM
// ──────────────────────────────────────────────────
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = submitBtn.querySelector('.submit-text');
    submitBtn.disabled = true;
    submitBtn.style.pointerEvents = 'none';
    text.textContent = 'Sending...';

    // CAPTURE MACHINE PROTOCOL (CLOUD FIREBASE)
    try {
        if (window.db && window.fbDoc && window.fbGetDoc && window.fbSetDoc) {
            const docRef = window.fbDoc(window.db, "crm", "core");
            const docSnap = await window.fbGetDoc(docRef);
            
            // Build the next state
            let nextState = docSnap.exists() ? docSnap.data() : { leads: [], meetings: [], deals: [], activity: [0,0,0,0,0,0,0], nextId: 1 };
            
            const newLead = {
                id: nextState.nextId++,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value || '',
                industry: document.getElementById('service').value || 'Web Lead',
                notes: `[WEBSITE INTAKE] Message: ${document.getElementById('message').value}`,
                contact: 'Inbound Web Form',
                value: 0,
                stage: 'Intake',
                createdAt: new Date().toISOString()
            };
            
            if(!nextState.leads) nextState.leads = [];
            nextState.leads.push(newLead);
            
            // Push to Firebase Firestore
            await window.fbSetDoc(docRef, nextState);
            console.log('✦ CAPTURE MACHINE: Lead synced to Veltrix Cloud DB');
        } else {
            console.error('Firebase DB not initialized properly.');
        }
    } catch (err) {
        console.error('Capture Machine Error:', err);
    }

    setTimeout(() => {
      submitBtn.classList.add('success');
      text.textContent = '✓ Message Sent!';
      form.reset();

      setTimeout(() => {
        submitBtn.classList.remove('success');
        text.textContent = 'Send Message';
        submitBtn.disabled = false;
        submitBtn.style.pointerEvents = '';
      }, 3000);
    }, 500);
  });
})();

// ──────────────────────────────────────────────────
// 9. BACK TO TOP
// ──────────────────────────────────────────────────
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ──────────────────────────────────────────────────
// 10. ACTIVE NAV LINK ON SCROLL
// ──────────────────────────────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => io.observe(s));
})();

// ──────────────────────────────────────────────────
// 12. SMOOTH SCROLL FOR ALL ANCHOR LINKS
// ──────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
// ──────────────────────────────────────────────────
// 14. FAQ ACCORDION
// ──────────────────────────────────────────────────
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all others
      items.forEach(other => {
        other.classList.remove('open');
        const ob = other.querySelector('.faq-question');
        if (ob) ob.setAttribute('aria-expanded', 'false');
      });
      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    // Keyboard support
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();

console.log('%c✦ Veltrix Studio ', 'background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; font-size: 16px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
console.log('%cBuilt with ❤️ and premium code.', 'color: #94a3b8; font-size: 12px;');
