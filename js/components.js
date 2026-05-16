/* Baybasi – Shared React components (React.createElement, no JSX)
   Loaded as a plain <script> tag before any Babel scripts. */

;(function () {
  var orig = console.error;
  console.error = function () {
    var a = arguments;
    if (typeof a[0] === 'string' && (a[0].includes('"key" prop') || a[0].includes('Each child in a list'))) return;
    orig.apply(console, a);
  };
})();

var _h = React.createElement;

/* ── Brand tokens ─────────────────────────────────────────────────────────── */
var C = {
  red:    '#B91C1C',
  maroon: '#7F1D1D',
  gold:   '#F59E0B',
  cream:  '#FFF7ED',
  peach:  '#FFE4D6',
  white:  '#FFFFFF',
  text:   '#1F2937',
  muted:  '#6B7280',
  border: '#E5E7EB',
};

/* ── Icons ─────────────────────────────────────────────────────────────── */
window.ArrowUpRight = function ArrowUpRight(p) {
  var cls = p.className || 'h-4 w-4';
  return _h('svg', { className: cls, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    _h('path', { d: 'M7 17L17 7M7 7h10v10' }));
};

window.PlayIcon = function PlayIcon(p) {
  var cls = p.className || 'h-4 w-4';
  return _h('svg', { className: cls, viewBox: '0 0 24 24', fill: 'currentColor' },
    _h('polygon', { points: '6 4 20 12 6 20 6 4' }));
};

window.MenuIcon = function MenuIcon(p) {
  var cls = p.className || 'h-5 w-5';
  return _h('svg', { className: cls, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' },
    _h('path', { d: 'M4 6h16M4 12h16M4 18h16' }));
};

window.XIcon = function XIcon(p) {
  var cls = p.className || 'h-5 w-5';
  return _h('svg', { className: cls, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' },
    _h('path', { d: 'M18 6L6 18M6 6l12 12' }));
};

/* ── FadingVideo ───────────────────────────────────────────────────────── */
window.FadingVideo = function FadingVideo(props) {
  var src = props.src, className = props.className, style = props.style;
  var videoRef    = React.useRef(null);
  var rafRef      = React.useRef(null);
  var fadingOutRef = React.useRef(false);
  var FADE_MS = 500, FADE_OUT_LEAD = 0.55;

  var fadeTo = React.useCallback(function (target, duration) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    var video = videoRef.current;
    if (!video) return;
    var start = performance.now();
    var from  = parseFloat(video.style.opacity) || 0;
    function step(now) {
      var t = Math.min((now - start) / duration, 1);
      video.style.opacity = String(from + (target - from) * t);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
  }, []);

  React.useEffect(function () {
    var video = videoRef.current;
    if (!video || !src) return;
    function onLoaded() {
      video.style.opacity = '0';
      video.play().catch(function () {});
      fadeTo(1, FADE_MS);
    }
    function onTimeUpdate() {
      var rem = video.duration - video.currentTime;
      if (!fadingOutRef.current && rem <= FADE_OUT_LEAD && rem > 0) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    }
    function onEnded() {
      video.style.opacity = '0';
      setTimeout(function () {
        video.currentTime = 0;
        video.play().catch(function () {});
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    }
    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    return function () {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, [src, fadeTo]);

  return _h('video', {
    ref: videoRef, src: src,
    autoPlay: true, muted: true, playsInline: true, preload: 'auto',
    className: className,
    style: Object.assign({}, style, { opacity: 0 })
  });
};

/* ── BlurText ──────────────────────────────────────────────────────────── */
window.BlurText = function BlurText(props) {
  var text = props.text, className = props.className;
  var ref = React.useRef(null);
  var visible = React.useState(false);
  var setVisible = visible[1];
  visible = visible[0];

  React.useEffect(function () {
    var el = ref.current;
    if (!el) return;
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    obs.observe(el);
    return function () { obs.disconnect(); };
  }, []);

  var MotionSpan = window.Motion.motion.span;
  var words = text.split(' ');

  return _h('p', {
    ref: ref, className: className,
    style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }
  }, words.map(function (word, i) {
    return _h(MotionSpan, {
      key: i,
      initial: { filter: 'blur(10px)', opacity: 0, y: 50 },
      animate: visible ? {
        filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
        opacity: [0, 0.5, 1],
        y: [50, -5, 0],
      } : {},
      transition: { duration: 0.7, delay: (i * 100) / 1000, ease: 'easeOut', times: [0, 0.5, 1] },
      style: { display: 'inline-block', marginRight: '0.28em' }
    }, word);
  }));
};

/* ── Navbar ────────────────────────────────────────────────────────────── */
window.Navbar = function Navbar(props) {
  var activePage = props.activePage || '';
  var openState = React.useState(false);
  var open = openState[0], setOpen = openState[1];

  var links = [
    { label: 'Home',     href: 'index.html' },
    { label: 'About Us', href: 'about.html' },
    { label: 'Impacts',  href: 'impacts.html' },
    { label: 'Events',   href: 'events.html' },
  ];

  var navLink = function(lk) {
    var isActive = activePage === lk.href;
    return _h('a', {
      key: lk.label, href: lk.href,
      style: {
        padding: '0.375rem 0.875rem',
        fontSize: '0.875rem',
        fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif',
        fontWeight: 500,
        borderRadius: '0.5rem',
        whiteSpace: 'nowrap',
        transition: 'color 0.15s, background 0.15s',
        color: isActive ? C.red : C.text,
        background: isActive ? 'rgba(185,28,28,0.08)' : 'transparent',
        textDecoration: 'none',
      },
      onMouseEnter: function(e) { if (!isActive) { e.currentTarget.style.color = C.red; e.currentTarget.style.background = 'rgba(185,28,28,0.06)'; } },
      onMouseLeave: function(e) { if (!isActive) { e.currentTarget.style.color = C.text; e.currentTarget.style.background = 'transparent'; } }
    }, lk.label);
  };

  return _h('nav', {
    className: 'fixed top-0 left-0 right-0 z-50',
    style: {
      background: 'rgba(255,247,237,0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #E5E7EB',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }
  },
    _h('div', { style: { maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },

      /* ── Logo ── */
      _h('a', { href: 'index.html', style: { display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 } },
        _h('img', {
          src: 'images/common/baybasi-logo.png',
          alt: 'Baybasi',
          style: { height: '52px', width: '52px', objectFit: 'contain', display: 'block' }
        }),
        _h('div', { style: { display: 'flex', flexDirection: 'column', lineHeight: 1.1 } },
          _h('span', { style: { fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: C.red } }, 'Baybasi'),
          _h('span', { style: { fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 400, fontSize: '0.65rem', color: C.muted, letterSpacing: '0.04em' } }, 'A California Nonprofit')
        )
      ),

      /* ── Desktop nav links ── */
      _h('div', { className: 'hidden lg:flex items-center gap-1' },
        links.map(navLink),
        _h('a', {
          href: 'join-us.html',
          className: 'ml-2',
          style: { background: C.red, color: '#fff', borderRadius: '9999px', padding: '0.5rem 1.25rem',
                   fontSize: '0.875rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 600,
                   whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem',
                   textDecoration: 'none', transition: 'background 0.15s' },
          onMouseEnter: function(e) { e.currentTarget.style.background = C.maroon; },
          onMouseLeave: function(e) { e.currentTarget.style.background = C.red; }
        }, 'Join Us ', _h(window.ArrowUpRight, { className: 'h-3.5 w-3.5' }))
      ),

      /* ── Mobile right ── */
      _h('div', { className: 'flex items-center gap-3 lg:hidden' },
        _h('a', {
          href: 'join-us.html',
          className: 'hidden md:flex items-center gap-1',
          style: { background: C.red, color: '#fff', borderRadius: '9999px', padding: '0.45rem 1rem',
                   fontSize: '0.8rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 600, textDecoration: 'none' }
        }, 'Join Us ', _h(window.ArrowUpRight, { className: 'h-3 w-3' })),
        _h('button', {
          style: { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB',
                   background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer', flexShrink: 0 },
          onClick: function () { setOpen(!open); },
          'aria-label': 'Toggle navigation'
        }, open
          ? _h(window.XIcon,   { className: 'h-4 w-4', style: { color: C.text } })
          : _h(window.MenuIcon, { className: 'h-4 w-4', style: { color: C.text } })
        )
      )
    ),

    /* ── Mobile dropdown ── */
    open && _h('div', {
      className: 'lg:hidden menu-enter',
      style: { background: '#fff', borderTop: '1px solid #E5E7EB', padding: '0.75rem 1rem 1rem' }
    },
      links.map(function (lk) {
        var isActive = activePage === lk.href;
        return _h('a', {
          key: lk.label, href: lk.href,
          style: {
            display: 'block', padding: '0.75rem 1rem', fontSize: '0.9rem',
            fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 500, borderRadius: '0.5rem',
            color: isActive ? C.red : C.text,
            background: isActive ? 'rgba(185,28,28,0.06)' : 'transparent',
            textDecoration: 'none', marginBottom: '2px', transition: 'background 0.12s',
          },
          onClick: function () { setOpen(false); }
        }, lk.label);
      }),
      _h('a', {
        href: 'join-us.html',
        style: { display: 'block', marginTop: '0.5rem', background: C.red, color: '#fff',
                 borderRadius: '9999px', padding: '0.625rem 1.25rem', fontSize: '0.875rem',
                 fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 600, textAlign: 'center', textDecoration: 'none' },
        onClick: function () { setOpen(false); }
      }, 'Join Us')
    )
  );
};

/* ── Breadcrumb ────────────────────────────────────────────────────────── */
window.Breadcrumb = function Breadcrumb(props) {
  var crumbs = props.crumbs || []; // e.g. [{ label: 'About Us', href: 'about.html' }]
  var all = [{ label: 'Home', href: 'index.html' }].concat(crumbs);
  return _h('nav', {
    'aria-label': 'breadcrumb',
    style: { display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', padding: '0.5rem 0 0' }
  },
    all.map(function(c, i) {
      var isLast = i === all.length - 1;
      return _h(React.Fragment, { key: c.label },
        isLast
          ? _h('span', { style: { fontSize: '0.78rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', color: C.red, fontWeight: 600 } }, c.label)
          : _h(React.Fragment, null,
              _h('a', { href: c.href, style: { fontSize: '0.78rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', color: C.muted, textDecoration: 'none', transition: 'color 0.15s' },
                onMouseEnter: function(e) { e.currentTarget.style.color = C.red; },
                onMouseLeave: function(e) { e.currentTarget.style.color = C.muted; }
              }, c.label),
              _h('span', { style: { color: 'rgba(107,114,128,0.4)', fontSize: '0.75rem' } }, '›')
            )
      );
    })
  );
};

/* ── Footer ────────────────────────────────────────────────────────────── */
window.Footer = function Footer() {
  var footerLinks = [
    ['Home',       'index.html'],
    ['About Us',   'about.html'],
    ['Impacts',    'impacts.html'],
    ['Events',     'events.html'],
    ['Sponsors',   'sponsors.html'],
    ['Join Us',    'join-us.html'],
  ];

  var ctaBtnStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif',
    fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.07em',
    textTransform: 'uppercase', textDecoration: 'none',
    borderRadius: '9999px', padding: '0.6rem 1.4rem',
    transition: 'background 0.18s, color 0.18s, border-color 0.18s',
    whiteSpace: 'nowrap'
  };

  return _h('footer', {
    style: { background: C.maroon, position: 'relative', zIndex: 10 }
  },
    /* CTA band */
    _h('div', { style: { borderBottom: '1px solid rgba(255,247,237,0.10)' } },
      _h('div', { style: { maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'center' } },
        _h('span', { style: { fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'rgba(255,247,237,0.70)', marginRight: '0.5rem', letterSpacing: '0.03em' } }, 'Get Involved:'),
        /* Sign Up */
        _h('a', {
          href: 'join-us.html',
          style: Object.assign({}, ctaBtnStyle, { background: '#FFF7ED', color: C.maroon }),
          onMouseEnter: function(e) { e.currentTarget.style.background = '#FFE4D6'; },
          onMouseLeave: function(e) { e.currentTarget.style.background = '#FFF7ED'; }
        }, 'Sign Up'),
        /* Contact Us */
        _h('a', {
          href: 'mailto:baybasi@baybasi.us',
          style: Object.assign({}, ctaBtnStyle, { background: 'transparent', color: '#FFF7ED', border: '1.5px solid rgba(255,247,237,0.50)' }),
          onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#FFF7ED'; e.currentTarget.style.background = 'rgba(255,247,237,0.08)'; },
          onMouseLeave: function(e) { e.currentTarget.style.borderColor = 'rgba(255,247,237,0.50)'; e.currentTarget.style.background = 'transparent'; }
        }, 'Contact Us'),
        /* Corp. Inquiry */
        _h('a', {
          href: 'about.html#corporate',
          style: Object.assign({}, ctaBtnStyle, { background: 'transparent', color: '#F59E0B', border: '1.5px solid rgba(245,158,11,0.55)' }),
          onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.background = 'rgba(245,158,11,0.10)'; },
          onMouseLeave: function(e) { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.55)'; e.currentTarget.style.background = 'transparent'; }
        }, 'Corp. Inquiry')
      )
    ),

    _h('div', { style: { maxWidth: '80rem', margin: '0 auto', padding: '3rem 2rem 2rem' } },
      /* Top row */
      _h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'space-between', marginBottom: '2.5rem' } },

        /* Brand */
        _h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '260px' } },
          _h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.625rem' } },
            _h('div', { style: { width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              _h('span', { style: { fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 800, color: '#FFF7ED', fontSize: '1.15rem', lineHeight: 1 } }, 'B')
            ),
            _h('span', { style: { fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#FFF7ED' } }, 'Baybasi')
          ),
          _h('p', { style: { color: 'rgba(255,247,237,0.65)', fontSize: '0.8rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', lineHeight: 1.6 } },
            'SF Bay Area Bengali & Indian Cultural Organization'),
          _h('p', { style: { color: 'rgba(255,247,237,0.40)', fontSize: '0.72rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif' } },
            'Est. 2000 · Foster City, CA · 501(c)(3) Nonprofit')
        ),

        /* Navigation links */
        _h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '0.375rem 2rem', alignContent: 'flex-start' } },
          footerLinks.map(function (pair) {
            return _h('a', {
              key: pair[0], href: pair[1],
              style: { color: 'rgba(255,247,237,0.60)', fontSize: '0.82rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', textDecoration: 'none', transition: 'color 0.15s' },
              onMouseEnter: function(e) { e.currentTarget.style.color = '#FFF7ED'; },
              onMouseLeave: function(e) { e.currentTarget.style.color = 'rgba(255,247,237,0.60)'; }
            }, pair[0]);
          })
        ),

        /* Social icons + contact */
        _h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' } },
          _h('p', { style: { color: 'rgba(255,247,237,0.40)', fontSize: '0.68rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' } }, 'Connect'),
          /* Social icon row */
          _h('div', { style: { display: 'flex', gap: '0.625rem', alignItems: 'center' } },
            /* WhatsApp */
            _h('a', { href: 'https://chat.whatsapp.com/HiKJgF5hRouCzoHLM2izk2?mode=gi_t', target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'WhatsApp',
              style: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,247,237,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 },
              onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.22)'; },
              onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.10)'; }
            },
              _h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', style: { width: '15px', height: '15px', color: '#FFF7ED' } },
                _h('path', { d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z' }),
                _h('path', { d: 'M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.845L.057 23.571a.75.75 0 0 0 .925.926l5.726-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.844 0-3.574-.483-5.073-1.33L3.2 21.731l1.065-3.729A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z' })
              )
            ),
            /* Gmail */
            _h('a', { href: 'mailto:baybasi@baybasi.us', 'aria-label': 'Email',
              style: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,247,237,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 },
              onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.22)'; },
              onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.10)'; }
            },
              _h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', style: { width: '15px', height: '15px', color: '#FFF7ED' } },
                _h('path', { d: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z' })
              )
            ),
            /* Facebook */
            _h('a', { href: 'https://www.facebook.com/BayBasi/', target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Facebook',
              style: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,247,237,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 },
              onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.22)'; },
              onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.10)'; }
            },
              _h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', style: { width: '15px', height: '15px', color: '#FFF7ED' } },
                _h('path', { d: 'M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z' })
              )
            ),
            /* YouTube */
            _h('a', { href: 'https://www.youtube.com/@baybasiu', target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'YouTube',
              style: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,247,237,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 },
              onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.22)'; },
              onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.10)'; }
            },
              _h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', style: { width: '15px', height: '15px', color: '#FFF7ED' } },
                _h('path', { d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' })
              )
            ),
            /* Instagram */
            _h('a', { href: '#', 'aria-label': 'Instagram',
              style: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,247,237,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 },
              onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.22)'; },
              onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.10)'; }
            },
              _h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', style: { width: '15px', height: '15px', color: '#FFF7ED' } },
                _h('path', { d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' })
              )
            )
          ),
          _h('a', { href: 'mailto:baybasi@baybasi.us',
            style: { color: 'rgba(255,247,237,0.60)', fontSize: '0.78rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', textDecoration: 'none', transition: 'color 0.15s' },
            onMouseEnter: function(e) { e.currentTarget.style.color = '#FFF7ED'; },
            onMouseLeave: function(e) { e.currentTarget.style.color = 'rgba(255,247,237,0.60)'; }
          }, 'baybasi@baybasi.us')
        )
      ),

      /* Bottom divider */
      _h('div', { style: { borderTop: '1px solid rgba(255,247,237,0.12)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' } },
        _h('p', { style: { color: 'rgba(255,247,237,0.40)', fontSize: '0.72rem', fontFamily: 'Aptos, Calibri, Trebuchet MS, Arial, sans-serif', textAlign: 'center' } },
          '© 2026, BAYBASI – All Rights Reserved')
      )
    )
  );
};
