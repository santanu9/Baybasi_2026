
/*
  Baybasi Website Prototype MVP 1
  Vanilla JavaScript only.
  Future developers: replace static arrays/form handlers with CMS/API integrations as needed.
*/

(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('.primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Rotating hero background and impact stat for homepage.
  // Future CMS can provide this array dynamically.
  const hero = document.querySelector('[data-hero-rotator]');
  const impactBox = document.querySelector('[data-rotating-impact]');
  const slides = [
    { image: 'assets/images/hero-culture.svg', number: '25+', label: 'Years in Service' },
    { image: 'assets/images/hero-festival.svg', number: '200+', label: 'Festivals and Programs' },
    { image: 'assets/images/hero-impact.svg', number: '$100,000+', label: 'Donated to Charity' },
    { image: 'assets/images/hero-culture.svg', number: '250,000+', label: 'Lives Touched' }
  ];

  if (hero && impactBox && slides.length) {
    let index = 0;
    setInterval(() => {
      index = (index + 1) % slides.length;
      const slide = slides[index];
      hero.style.backgroundImage = `url('${slide.image}')`;
      impactBox.innerHTML = `<span class="stat-number">${slide.number}</span><span class="stat-label">${slide.label}</span>`;
    }, 4200);
  }

  // Static MVP form behavior: transform form fields into a mailto draft.
  // This is only a prototype. Replace with Formspree, Netlify Forms, Basin, custom backend,
  // Google Sheets, or CMS workflow when ready.
  const forms = document.querySelectorAll('[data-mailto-form]');
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const recipient = form.getAttribute('data-recipient') || 'baybasi@baybasi.us';
      const data = new FormData(form);
      const formType = data.get('Form Type') || data.get('Inquiry Type') || 'Baybasi Website Inquiry';
      const lines = [];
      for (const [key, value] of data.entries()) {
        if (String(value).trim()) {
          lines.push(`${key}: ${value}`);
        }
      }
      const subject = encodeURIComponent(`[Baybasi Website] ${formType}`);
      const body = encodeURIComponent(lines.join('\n'));
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    });
  });
})();
