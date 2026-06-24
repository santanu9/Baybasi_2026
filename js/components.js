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
  var text = props.text, className = props.className, extraStyle = props.style || {};
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
  var lastIdx = words.length - 1;

  return _h('p', {
    ref: ref, className: className,
    style: Object.assign({ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.32em', rowGap: '0.1em' }, extraStyle)
  }, words.map(function (word, i) {
    return _h(MotionSpan, {
      key: i,
      initial: { opacity: 0, y: 18 },
      animate: visible ? {
        opacity: 1,
        y: 0,
      } : {},
      transition: { duration: 0.38, delay: (i * 35) / 1000, ease: 'easeOut' },
      style: { display: 'inline-block', willChange: 'transform, opacity' }
    }, i < lastIdx ? word + ' ' : word);
  }));
};

/* ── Navbar ────────────────────────────────────────────────────────────── */
window.Navbar = function Navbar(props) {
  var activePage = props.activePage || '';
  var openState = React.useState(false);
  var open = openState[0], setOpen = openState[1];
  var ddState = React.useState(false);     // desktop dropdown open
  var ddOpen = ddState[0], setDdOpen = ddState[1];
  var mDdState = React.useState(false);    // mobile dropdown open
  var mDdOpen = mDdState[0], setMDdOpen = mDdState[1];
  var fontStack = 'Aptos, InterAdj, Inter, Calibri, Trebuchet MS, Arial, sans-serif';

  var links = [
    { label: 'Home',     href: 'index.html' },
    { label: 'About Us', href: 'about.html' },
    { label: 'Impacts',  href: 'impacts.html' },
    { label: 'Events',   href: 'events.html' },
  ];

  var subItems = [
    { label: 'Membership',  href: 'membership.html',  desc: 'Voting rights, full event access, tax-deductible.' },
    { label: 'Event Pass',  href: 'event-pass.html',  desc: 'Annual, event-specific, and day passes.' },
    { label: 'Volunteer',   href: 'volunteer.html',   desc: 'Give time, earn redeemable reward points.' },
    { label: 'Sponsorship', href: 'sponsorship.html', desc: 'Partner with Baybasi for brand visibility.' },
  ];
  var subHrefs = subItems.map(function (s) { return s.href; });
  var ddActive = subHrefs.indexOf(activePage) >= 0;

  var navLink = function(lk) {
    var isActive = activePage === lk.href;
    return _h('a', {
      key: lk.label, href: lk.href,
      style: {
        padding: '0.375rem 0.875rem',
        fontSize: '0.875rem',
        fontFamily: fontStack,
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

  /* Desktop "Get Involved" dropdown — parent button + floating panel.
     Close is deferred via timer so the cursor can travel from button → panel
     across the small visual gap (the gap is a transparent paddingTop on the
     panel container so the bridge stays hovered). */
  var ddCloseTimerRef = React.useRef(null);
  var openDd = function () {
    if (ddCloseTimerRef.current) { clearTimeout(ddCloseTimerRef.current); ddCloseTimerRef.current = null; }
    setDdOpen(true);
  };
  var scheduleCloseDd = function () {
    if (ddCloseTimerRef.current) clearTimeout(ddCloseTimerRef.current);
    ddCloseTimerRef.current = setTimeout(function () { setDdOpen(false); ddCloseTimerRef.current = null; }, 180);
  };
  var dropdown = _h('div', {
    style: { position: 'relative', display: 'inline-block' },
    onMouseEnter: openDd,
    onMouseLeave: scheduleCloseDd
  },
    _h('button', {
      type: 'button',
      'aria-haspopup': 'menu',
      'aria-expanded': ddOpen ? 'true' : 'false',
      onClick: function () { setDdOpen(!ddOpen); },
      style: {
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.375rem 0.875rem', fontSize: '0.875rem',
        fontFamily: fontStack, fontWeight: 500,
        borderRadius: '0.5rem', whiteSpace: 'nowrap',
        transition: 'color 0.15s, background 0.15s',
        color: ddActive ? C.red : C.text,
        background: ddActive ? 'rgba(185,28,28,0.08)' : 'transparent',
        border: 'none', cursor: 'pointer'
      }
    },
      'Get Involved',
      _h('svg', {
        viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2,
        style: { width: '12px', height: '12px', transition: 'transform 0.2s', transform: ddOpen ? 'rotate(180deg)' : 'rotate(0)' }
      }, _h('polyline', { points: '6 9 12 15 18 9' }))
    ),
    ddOpen && _h('div', {
      /* Outer positioned container — transparent top padding creates a hovered
         bridge so the cursor can travel from button to the visible card without
         triggering mouseleave. */
      style: {
        position: 'absolute',
        top: '100%', right: '50%', transform: 'translateX(50%)',
        paddingTop: '0.5rem',
        zIndex: 60
      },
      onMouseEnter: openDd,
      onMouseLeave: scheduleCloseDd
    },
      _h('div', {
        role: 'menu',
        style: {
          minWidth: '320px',
          background: 'rgba(255,247,237,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid #E5E7EB',
          borderRadius: '1rem',
          boxShadow: '0 14px 36px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
          padding: '0.5rem'
        }
      },
      subItems.map(function (s) {
        var sActive = activePage === s.href;
        return _h('a', {
          key: s.href, href: s.href, role: 'menuitem',
          style: {
            display: 'block', padding: '0.7rem 0.85rem', textDecoration: 'none',
            borderRadius: '0.625rem', transition: 'background 0.12s',
            background: sActive ? 'rgba(185,28,28,0.08)' : 'transparent'
          },
          onMouseEnter: function (e) { if (!sActive) e.currentTarget.style.background = 'rgba(127,29,29,0.06)'; },
          onMouseLeave: function (e) { if (!sActive) e.currentTarget.style.background = 'transparent'; }
        },
          _h('div', {
            style: {
              fontFamily: fontStack, fontWeight: 700, fontSize: '0.92rem',
              color: sActive ? C.red : C.text, lineHeight: 1.2, marginBottom: '0.15rem'
            }
          }, s.label),
          _h('div', {
            style: { fontFamily: fontStack, fontWeight: 400, fontSize: '0.78rem', color: C.muted, lineHeight: 1.4 }
          }, s.desc)
        );
      })
      )
    )
  );

  return _h('nav', {
    className: 'fixed top-0 left-0 right-0 z-[1000]',
    style: {
      isolation: 'isolate',
      zIndex: 10000,
      background: '#FFF7ED',
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
          _h('span', { style: { fontFamily: 'Aptos, InterAdj, Inter, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: C.red } }, 'Baybasi'),
          _h('span', { style: { fontFamily: 'Aptos, InterAdj, Inter, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 400, fontSize: '0.65rem', color: C.muted, letterSpacing: '0.04em' } }, 'A California Nonprofit')
        )
      ),

      /* ── Desktop nav links ── */
      _h('div', { className: 'hidden lg:flex items-center gap-1' },
        links.map(navLink),
        dropdown,
        _h('a', {
          href: 'join-us.html',
          className: 'ml-2',
          style: { background: C.red, color: '#fff', borderRadius: '9999px', padding: '0.5rem 1.25rem',
                   fontSize: '0.875rem', fontFamily: fontStack, fontWeight: 600,
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
                   fontSize: '0.8rem', fontFamily: 'Aptos, InterAdj, Inter, Calibri, Trebuchet MS, Arial, sans-serif', fontWeight: 600, textDecoration: 'none' }
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
            fontFamily: fontStack, fontWeight: 500, borderRadius: '0.5rem',
            color: isActive ? C.red : C.text,
            background: isActive ? 'rgba(185,28,28,0.06)' : 'transparent',
            textDecoration: 'none', marginBottom: '2px', transition: 'background 0.12s',
          },
          onClick: function () { setOpen(false); }
        }, lk.label);
      }),

      /* Mobile collapsible "Get Involved" group */
      _h('button', {
        type: 'button',
        onClick: function () { setMDdOpen(!mDdOpen); },
        'aria-expanded': mDdOpen ? 'true' : 'false',
        style: {
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem', fontSize: '0.9rem',
          fontFamily: fontStack, fontWeight: 500, borderRadius: '0.5rem',
          color: ddActive ? C.red : C.text,
          background: ddActive ? 'rgba(185,28,28,0.06)' : 'transparent',
          border: 'none', textAlign: 'left', cursor: 'pointer', marginBottom: '2px'
        }
      },
        'Get Involved',
        _h('svg', {
          viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2,
          style: { width: '14px', height: '14px', transition: 'transform 0.2s', transform: mDdOpen ? 'rotate(180deg)' : 'rotate(0)' }
        }, _h('polyline', { points: '6 9 12 15 18 9' }))
      ),
      mDdOpen && _h('div', {
        style: { paddingLeft: '0.75rem', borderLeft: '2px solid rgba(127,29,29,0.18)', margin: '0 0 0.5rem 0.75rem' }
      },
        subItems.map(function (s) {
          var sActive = activePage === s.href;
          return _h('a', {
            key: s.href, href: s.href,
            style: {
              display: 'block', padding: '0.55rem 0.85rem', fontSize: '0.86rem',
              fontFamily: fontStack, fontWeight: 500, borderRadius: '0.5rem',
              color: sActive ? C.red : C.text,
              background: sActive ? 'rgba(185,28,28,0.06)' : 'transparent',
              textDecoration: 'none', marginBottom: '2px', transition: 'background 0.12s'
            },
            onClick: function () { setOpen(false); }
          }, s.label);
        })
      ),

      _h('a', {
        href: 'join-us.html',
        style: { display: 'block', marginTop: '0.5rem', background: C.red, color: '#fff',
                 borderRadius: '9999px', padding: '0.625rem 1.25rem', fontSize: '0.875rem',
                 fontFamily: fontStack, fontWeight: 600, textAlign: 'center', textDecoration: 'none' },
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
          ? _h('span', { style: { fontSize: '0.78rem', fontFamily: 'Aptos, InterAdj, Inter, Calibri, Trebuchet MS, Arial, sans-serif', color: C.red, fontWeight: 600 } }, c.label)
          : _h(React.Fragment, null,
              _h('a', { href: c.href, style: { fontSize: '0.78rem', fontFamily: 'Aptos, InterAdj, Inter, Calibri, Trebuchet MS, Arial, sans-serif', color: C.muted, textDecoration: 'none', transition: 'color 0.15s' },
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
  var navColumns = [
    { title: 'Explore', links: [
      ['Home',     'index.html'],
      ['About Us', 'about.html'],
      ['Impacts',  'impacts.html'],
      ['Events',   'events.html'],
    ]},
    { title: 'Engage', links: [
      ['Join Us',     'join-us.html'],
      ['Sponsors',    'sponsors.html'],
      ['Corporate',   'about.html#corporate'],
      ['Performance', 'about.html#reports'],
    ]}
  ];

  var SOCIALS = [
    { label: 'WhatsApp', href: 'https://chat.whatsapp.com/HiKJgF5hRouCzoHLM2izk2?mode=gi_t', ext: true,
      d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.845L.057 23.571a.75.75 0 0 0 .925.926l5.726-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.844 0-3.574-.483-5.073-1.33L3.2 21.731l1.065-3.729A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z' },
    { label: 'Email', href: 'mailto:baybasi@baybasi.us',
      d: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z' },
    { label: 'Facebook', href: 'https://www.facebook.com/BayBasi/', ext: true,
      d: 'M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z' },
    { label: 'YouTube', href: 'https://www.youtube.com/@baybasiu', ext: true,
      d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
    { label: 'Instagram', href: '#',
      d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
  ];

  var fontStack = 'Aptos, InterAdj, Inter, Calibri, Trebuchet MS, Arial, sans-serif';

  var navLink = function(pair) {
    return _h('a', {
      key: pair[0], href: pair[1],
      style: { color: 'rgba(255,247,237,0.62)', fontSize: '0.85rem', fontFamily: fontStack, fontWeight: 400, textDecoration: 'none', transition: 'color 0.18s, transform 0.18s', display: 'inline-block' },
      onMouseEnter: function(e) { e.currentTarget.style.color = '#FFF7ED'; e.currentTarget.style.transform = 'translateX(2px)'; },
      onMouseLeave: function(e) { e.currentTarget.style.color = 'rgba(255,247,237,0.62)'; e.currentTarget.style.transform = 'translateX(0)'; }
    }, pair[0]);
  };

  var socialIcon = function(s) {
    var p = { key: s.label, href: s.href, 'aria-label': s.label,
      style: { width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,247,237,0.08)', border: '1px solid rgba(255,247,237,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, border-color 0.2s, transform 0.2s', flexShrink: 0, textDecoration: 'none' },
      onMouseEnter: function(e) { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.transform = 'translateY(-2px)'; },
      onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(255,247,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,247,237,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }
    };
    if (s.ext) { p.target = '_blank'; p.rel = 'noopener noreferrer'; }
    return _h('a', p,
      _h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', style: { width: '16px', height: '16px', color: '#FFF7ED' } },
        _h('path', { d: s.d })
      )
    );
  };

  return _h('footer', {
    style: {
      background: 'linear-gradient(180deg, #7F1D1D 0%, #5B1414 100%)',
      position: 'relative', zIndex: 10, overflow: 'hidden'
    }
  },
    /* Decorative top accent line */
    _h('div', { style: { height: '3px', background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' } }),

    /* Decorative subtle radial glow */
    _h('div', { style: { position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '60rem', height: '40rem', background: 'radial-gradient(ellipse, rgba(245,158,11,0.10) 0%, transparent 60%)', pointerEvents: 'none' } }),
    /* CTA banner */
    _h('div', { style: { position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '3.5rem 2rem 0' } },
      _h('div', { style: { textAlign: 'center', marginBottom: '2rem' } },
        _h('p', { style: { color: '#F59E0B', fontSize: '0.72rem', fontFamily: fontStack, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.6rem' } }, '— Get Involved —'),
        _h('h3', { style: { color: '#FFF7ED', fontFamily: fontStack, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.1 } }, 'Be part of our story.'),
        _h('p', { style: { color: 'rgba(255,247,237,0.65)', fontSize: '0.92rem', fontFamily: fontStack, fontWeight: 300, maxWidth: '32rem', margin: '0.6rem auto 0', lineHeight: 1.5 } },
          'Join 25+ years of Bay Area culture, community, and giving back.')
      ),
      _h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' } },
        _h('a', {
          href: 'join-us.html',
          style: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#F59E0B', color: '#7F1D1D', fontFamily: fontStack, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em', borderRadius: '9999px', padding: '0.75rem 1.6rem', textDecoration: 'none', transition: 'background 0.2s, transform 0.2s' },
          onMouseEnter: function(e) { e.currentTarget.style.background = '#FBBF24'; e.currentTarget.style.transform = 'translateY(-1px)'; },
          onMouseLeave: function(e) { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.transform = 'translateY(0)'; }
        }, 'Sign Up', _h(window.ArrowUpRight, { className: 'h-3.5 w-3.5' })),
        _h('a', {
          href: 'mailto:baybasi@baybasi.us',
          style: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', color: '#FFF7ED', fontFamily: fontStack, fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.04em', borderRadius: '9999px', padding: '0.75rem 1.6rem', textDecoration: 'none', border: '1px solid rgba(255,247,237,0.30)', transition: 'background 0.2s, border-color 0.2s' },
          onMouseEnter: function(e) { e.currentTarget.style.borderColor = '#FFF7ED'; e.currentTarget.style.background = 'rgba(255,247,237,0.06)'; },
          onMouseLeave: function(e) { e.currentTarget.style.borderColor = 'rgba(255,247,237,0.30)'; e.currentTarget.style.background = 'transparent'; }
        }, 'Contact Us'),
        _h('a', {
          href: 'about.html#corporate',
          style: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', color: 'rgba(255,247,237,0.85)', fontFamily: fontStack, fontWeight: 500, fontSize: '0.85rem', letterSpacing: '0.04em', borderRadius: '9999px', padding: '0.75rem 1.2rem', textDecoration: 'none', transition: 'color 0.2s' },
          onMouseEnter: function(e) { e.currentTarget.style.color = '#FFF7ED'; },
          onMouseLeave: function(e) { e.currentTarget.style.color = 'rgba(255,247,237,0.85)'; }
        }, 'Corporate Inquiry →')
      )
    ),

    _h('div', { style: { position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '0 2rem 2rem' } },
      /* Top row: brand + nav + connect */
      _h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(255,247,237,0.10)', marginBottom: '2.5rem' } },

        /* Brand column */
        _h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 } },
          _h('a', { href: 'index.html', style: { display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' } },
            _h('img', { src: 'images/common/baybasi-logo.png', alt: 'Baybasi', style: { height: '52px', width: '52px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(245,158,11,0.25))' } }),
            _h('div', { style: { display: 'flex', flexDirection: 'column', lineHeight: 1.1 } },
              _h('span', { style: { fontFamily: fontStack, fontWeight: 800, fontSize: '1.55rem', color: '#FFF7ED', letterSpacing: '-0.5px' } }, 'Baybasi'),
              _h('span', { style: { fontFamily: fontStack, fontWeight: 400, fontSize: '0.7rem', color: 'rgba(255,247,237,0.55)', letterSpacing: '0.06em', marginTop: '2px' } }, 'A California Nonprofit')
            )
          ),
          _h('p', { style: { color: 'rgba(255,247,237,0.70)', fontSize: '0.85rem', fontFamily: fontStack, fontWeight: 300, lineHeight: 1.65, margin: 0 } },
            'Preserving Bengali and Indian heritage in the SF Bay Area since 2000 — through cultural events, community service, and philanthropy.'),
          _h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem', fontSize: '0.72rem', color: 'rgba(255,247,237,0.45)', fontFamily: fontStack } },
            _h('span', null, 'Est. 2000'),
            _h('span', null, '·'),
            _h('span', null, 'Foster City, CA'),
            _h('span', null, '·'),
            _h('span', null, '501(c)(3) Nonprofit')
          )
        ),

        /* Nav columns */
        navColumns.map(function (col) {
          return _h('div', { key: col.title, style: { display: 'flex', flexDirection: 'column', gap: '0.9rem' } },
            _h('h4', { style: { color: '#F59E0B', fontFamily: fontStack, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 } }, col.title),
            _h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.55rem' } },
              col.links.map(navLink)
            )
          );
        }),

        /* Connect column */
        _h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.9rem' } },
          _h('h4', { style: { color: '#F59E0B', fontFamily: fontStack, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 } }, 'Connect'),
          _h('a', { href: 'mailto:baybasi@baybasi.us',
            style: { color: '#FFF7ED', fontSize: '0.92rem', fontFamily: fontStack, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' },
            onMouseEnter: function(e) { e.currentTarget.style.color = '#F59E0B'; },
            onMouseLeave: function(e) { e.currentTarget.style.color = '#FFF7ED'; }
          }, 'baybasi@baybasi.us'),
          _h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' } },
            SOCIALS.map(socialIcon)
          )
        )
      ),

      /* Bottom bar */
      _h('div', { style: { borderTop: '1px solid rgba(255,247,237,0.10)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' } },
        _h('p', { style: { color: 'rgba(255,247,237,0.50)', fontSize: '0.75rem', fontFamily: fontStack, margin: 0, letterSpacing: '0.02em' } },
          '© 2026, BAYBASI · All Rights Reserved'),
        _h('p', { style: { color: 'rgba(255,247,237,0.35)', fontSize: '0.72rem', fontFamily: fontStack, margin: 0, fontStyle: 'italic' } },
          'Crafted with care in the SF Bay Area')
      )
    )
  );
};
