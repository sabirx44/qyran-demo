// Micro-interaction kit shared by the demo sites. Each hook is opt-in via a data attribute:
//   data-magnetic="0.3"      element drifts toward the cursor
//   data-cursor="Label"      custom cursor grows and shows the label over this element
//   data-tilt="8"            card tilts in 3D under the cursor (max degrees)
//   data-count               number counts up when it enters the viewport
//   data-wipe                image container is revealed with a wipe on scroll
//   .marquee [data-marquee]  looping band whose speed and skew follow scroll velocity
//   [data-preloader]         intro overlay, removed after the page is ready
//   [data-progress-bar]      scroll progress line
//   [data-float]             gentle idle bobbing
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initKit({ reduced }: { reduced: boolean }) {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const rtl = document.documentElement.dir === 'rtl';

  // Preloader
  const pre = document.querySelector<HTMLElement>('[data-preloader]');
  if (pre) {
    if (reduced) pre.remove();
    else {
      const tl = gsap.timeline({ onComplete: () => pre.remove() });
      tl.from(pre.querySelectorAll('[data-pre-in]'), { opacity: 0, scale: 0.6, rotate: -90, duration: 0.9, ease: 'expo.out', stagger: 0.08 })
        .from(pre.querySelectorAll('[data-pre-text]'), { yPercent: 110, duration: 0.7, ease: 'power4.out' }, '-=0.5')
        .to(pre.querySelectorAll('[data-pre-in],[data-pre-text]'), { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, '+=0.35')
        .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.1');
    }
  }
  if (reduced) return;

  // Scroll progress
  const bar = document.querySelector<HTMLElement>('[data-progress-bar]');
  if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  // Magnetic
  if (fine) {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
      const s = parseFloat(el.dataset.magnetic || '0.3');
      const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * s);
        yTo((e.clientY - r.top - r.height / 2) * s);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  // Custom cursor
  const cursor = document.querySelector<HTMLElement>('[data-cursor-el]');
  if (cursor && fine) {
    document.documentElement.classList.add('has-cursor');
    const label = cursor.querySelector<HTMLElement>('[data-cursor-label]')!;
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); cursor.classList.add('on'); });
    document.addEventListener('pointerleave', () => cursor.classList.remove('on'));
    document.addEventListener('pointerover', (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button, [role="button"], input, select, textarea');
      cursor.classList.toggle('grow', !!t && !t.matches('input, select, textarea'));
      cursor.classList.toggle('text', !!t?.dataset.cursor);
      label.textContent = t?.dataset.cursor || '';
    });
    document.addEventListener('pointerdown', () => gsap.to(cursor, { scale: 0.8, duration: 0.15, yoyo: true, repeat: 1 }));
  }

  // 3D tilt
  if (fine) {
    document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt || '6');
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  // Count-up numbers (keeps the original formatting: spaces, commas, decimals)
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const raw = el.textContent || '';
    const m = raw.match(/[\d\s.,]*\d/);
    if (!m) return;
    const numStr = m[0];
    const decimalSep = /[.,]\d{1,2}$/.test(numStr) ? numStr.match(/[.,](?=\d{1,2}$)/)![0] : null;
    const clean = decimalSep ? numStr.replace(/[\s.,](?=\d{3})/g, '').replace(decimalSep, '.') : numStr.replace(/\D/g, '');
    const target = parseFloat(clean);
    const decimals = decimalSep ? clean.split('.')[1].length : 0;
    const group = numStr.includes(' ') || numStr.includes(' ') ? ' ' : numStr.match(/,\d{3}/) ? ',' : '';
    const fmt = (v: number) => {
      let s = v.toFixed(decimals);
      let [i, d] = s.split('.');
      if (group) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, group);
      return raw.replace(numStr, d ? `${i}${decimalSep}${d}` : i);
    };
    const o = { v: 0 };
    // Anything already on screen (hero stats) counts right after the intro; the rest when scrolled into view
    const inHero = !!el.closest('[data-hero]');
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', once: true,
      onEnter: () => gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', delay: inHero && pre ? 2 : 0, onUpdate: () => (el.textContent = fmt(o.v)) }),
    });
    el.textContent = fmt(0);
  });

  // Wipe reveal for image containers
  document.querySelectorAll<HTMLElement>('[data-wipe]').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Marquee with scroll velocity
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((m) => {
    const track = m.querySelector<HTMLElement>('[data-marquee-track]')!;
    const dir = rtl ? 1 : -1;
    const tween = gsap.to(track, { xPercent: dir * 50, ease: 'none', duration: parseFloat(m.dataset.marquee || '28'), repeat: -1 });
    let skewTo = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });
    ScrollTrigger.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity();
        gsap.to(tween, { timeScale: 1 + Math.min(Math.abs(v) / 300, 5), duration: 0.2, overwrite: true });
        skewTo(Math.max(-8, Math.min(8, v / -150)));
        gsap.to(tween, { timeScale: 1, duration: 1.2, delay: 0.2, overwrite: false });
      },
    });
  });

  // Idle float
  document.querySelectorAll<HTMLElement>('[data-float]').forEach((el, i) => {
    gsap.to(el, { y: -8, duration: 2.4 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });
}
