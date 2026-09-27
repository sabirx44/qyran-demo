import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { initKit } from './kit';

gsap.registerPlugin(ScrollTrigger, SplitText);

// ?qa disables motion so full-page review screenshots show every section at rest
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('qa');
const rtl = document.documentElement.dir === 'rtl';

const preDelay = !reduced && document.querySelector('[data-preloader]') ? 1.5 : 0;
initKit({ reduced });

if (reduced) {
  document.documentElement.classList.remove('js');
} else {
  if (document.body.hasAttribute('data-smooth')) {
    const lenis = new Lenis({ lerp: 0.085 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const el = document.querySelector<HTMLElement>(a.getAttribute('href')!);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -16 });
      });
    });
  }

  document.fonts.ready.then(() => {
    // Headlines rise line by line. Arabic is split by words only to keep letters joined.
    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      const split = SplitText.create(el, { type: rtl ? 'words,lines' : 'lines', mask: 'lines' });
      gsap.set(el, { visibility: 'visible' });
      const hero = el.closest('[data-hero]');
      gsap.from(split.lines, {
        yPercent: 105, duration: 1.2, ease: 'power4.out', stagger: 0.09, delay: hero ? 0.25 + preDelay : 0,
        scrollTrigger: hero ? undefined : { trigger: el, start: 'top 85%', once: true },
      });
    });

    ScrollTrigger.refresh();
  });

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08, delay: b.some((e) => e.closest('[data-hero]')) ? preDelay + 0.4 : 0 }),
  });

  // Hero photo: slow push-in on load, drift on scroll
  const heroImg = document.querySelector<HTMLElement>('[data-hero-img] img, [data-hero-img] .photo-ph');
  if (heroImg) {
    gsap.fromTo(heroImg, { scale: 1.18 }, { scale: 1.04, duration: 2.6, ease: 'power2.out' });
    gsap.to(heroImg, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });
  }

  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const a = parseFloat(el.dataset.parallax || '0.1');
    gsap.to(el, { yPercent: -a * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  document.querySelectorAll<HTMLElement>('[data-zoom] img').forEach((img) => {
    gsap.fromTo(img, { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

}

// Live clock
document.querySelectorAll<HTMLElement>('[data-clock]').forEach((el) => {
  const fmt = new Intl.DateTimeFormat(document.documentElement.lang === 'ar' ? 'ar' : 'ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: el.dataset.clock });
  const tick = () => (el.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 1000);
});
