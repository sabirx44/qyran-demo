// Starts background clips when they scroll into view and pauses them when they leave.
// Skipped on Save-Data, 2G and reduced motion: the poster image stays instead.
const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
const slow = !!nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType || '');
const still = slow || matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('qa');

export function pickSrc(v: HTMLVideoElement) {
  const box = v.parentElement!;
  return box.clientWidth > box.clientHeight ? v.dataset.clipD! : v.dataset.clipM!;
}

export function playClip(v: HTMLVideoElement) {
  if (still) return;
  const src = pickSrc(v);
  if (v.dataset.src !== src) { v.dataset.src = src; v.src = src; }
  v.onplaying = () => v.classList.remove('opacity-0');
  v.play().catch(() => {});
}

if (!still) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) playClip(v); else if (!v.paused) v.pause();
    }
  }, { rootMargin: '200px 0px' });
  document.querySelectorAll<HTMLVideoElement>('video[data-clip-m]').forEach((v) => io.observe(v));
}

export const clipsAllowed = !still;
