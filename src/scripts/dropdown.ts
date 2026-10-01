// Designed dropdowns. Every <select> (except [data-native]) gets a button and an option list drawn in the site's
// own style, instead of the operating system's grey menu. The native select stays in the form, hidden, so values,
// form data and existing change listeners keep working. Colours come from CSS variables set by each site:
//   --dd-bg, --dd-fg, --dd-muted, --dd-hover, --dd-accent, --dd-line, --dd-radius, --dd-shadow
const chevron = '<svg class="dd-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const tick = '<svg class="dd-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
let closeOpen: (() => void) | null = null;
let n = 0;

export function initDropdowns(root: ParentNode = document) {
  root.querySelectorAll<HTMLSelectElement>('select:not([data-native]):not([data-dd])').forEach(enhance);
}

function enhance(sel: HTMLSelectElement) {
  sel.dataset.dd = '';
  const id = `dd-${++n}`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `${sel.className} dd-btn`;
  // Keep Astro's scoped-style attributes so the site's own rules for this control still apply
  for (const a of [...sel.attributes]) if (a.name.startsWith('data-astro-cid')) btn.setAttribute(a.name, a.value);
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', id);
  const label = sel.getAttribute('aria-label') || sel.dataset.label || sel.closest('label')?.querySelector('span')?.textContent?.trim();
  const val = document.createElement('span');
  val.className = 'dd-val';
  btn.append(val);
  btn.insertAdjacentHTML('beforeend', chevron);
  sel.after(btn);
  sel.hidden = true;
  sel.tabIndex = -1;
  // A sibling chevron drawn for the old native select is no longer needed
  sel.parentElement?.querySelectorAll(':scope > svg').forEach((s) => s.remove());

  const list = document.createElement('ul');
  list.id = id;
  list.className = 'dd-list';
  list.setAttribute('role', 'listbox');
  if (label) list.setAttribute('aria-label', label);
  list.setAttribute('data-lenis-prevent', '');
  list.hidden = true;
  document.body.append(list);

  const build = () => {
    list.innerHTML = '';
    [...sel.options].forEach((o, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.tabIndex = -1;
      li.dataset.i = String(i);
      li.className = `dd-opt ${o.className}`.trim();
      if (o.disabled) li.setAttribute('aria-disabled', 'true');
      const t = document.createElement('span');
      t.textContent = o.textContent;
      li.append(t);
      li.insertAdjacentHTML('beforeend', tick);
      list.append(li);
    });
    sync();
  };
  const sync = () => {
    const o = sel.options[sel.selectedIndex];
    val.textContent = o?.textContent ?? '';
    btn.classList.toggle('dd-placeholder', !!o && o.value === '' && sel.options.length > 1);
    list.querySelectorAll<HTMLElement>('.dd-opt').forEach((li) => li.setAttribute('aria-selected', String(+li.dataset.i! === sel.selectedIndex)));
  };
  // Scripts that set .value or .selectedIndex directly update the button too
  for (const prop of ['value', 'selectedIndex'] as const) {
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, prop)!;
    Object.defineProperty(sel, prop, { configurable: true, get() { return d.get!.call(sel); }, set(v) { d.set!.call(sel, v); sync(); } });
  }
  sel.addEventListener('change', sync);
  new MutationObserver(build).observe(sel, { childList: true, subtree: true, characterData: true });
  build();

  const place = () => {
    const r = btn.getBoundingClientRect();
    const w = Math.min(Math.max(r.width, 180), innerWidth - 24);
    list.style.minWidth = `${w}px`;
    list.style.maxWidth = `${Math.min(380, innerWidth - 24)}px`;
    const below = innerHeight - r.bottom - 12, above = r.top - 12;
    const up = below < Math.min(list.scrollHeight, 320) && above > below;
    list.style.maxHeight = `${Math.max(160, Math.min(360, up ? above : below) - 8)}px`;
    const rtl = getComputedStyle(btn).direction === 'rtl';
    let left = rtl ? r.right - list.offsetWidth : r.left;
    left = Math.min(Math.max(12, left), innerWidth - list.offsetWidth - 12);
    list.style.left = `${left}px`;
    list.style.top = up ? `${r.top - 8 - list.offsetHeight}px` : `${r.bottom + 8}px`;
    list.classList.toggle('dd-up', up);
  };
  const close = (focus = false) => {
    if (list.hidden) return;
    list.classList.remove('dd-open');
    btn.setAttribute('aria-expanded', 'false');
    list.hidden = true;
    closeOpen = null;
    removeEventListener('scroll', onScroll, true);
    removeEventListener('resize', onScroll);
    if (focus) btn.focus();
  };
  const onScroll = (e: Event) => { if (!list.contains(e.target as Node)) close(); };
  const open = () => {
    if (!list.hidden) return close();
    closeOpen?.();
    sync();
    list.hidden = false;
    place();
    requestAnimationFrame(() => list.classList.add('dd-open'));
    btn.setAttribute('aria-expanded', 'true');
    closeOpen = () => close();
    addEventListener('scroll', onScroll, true);
    addEventListener('resize', onScroll);
    const cur = list.querySelector<HTMLElement>('[aria-selected="true"]') ?? list.querySelector<HTMLElement>('.dd-opt');
    cur?.focus({ preventScroll: true });
    cur?.scrollIntoView({ block: 'nearest' });
  };
  const choose = (li: HTMLElement) => {
    if (li.getAttribute('aria-disabled') === 'true') return;
    const i = +li.dataset.i!;
    if (i !== sel.selectedIndex) {
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    navigator.vibrate?.(6);
    close(true);
  };

  btn.addEventListener('click', open);
  btn.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); open(); }
  });
  sel.closest('label')?.addEventListener('click', (e) => {
    if (!btn.contains(e.target as Node) && !list.contains(e.target as Node)) { e.preventDefault(); btn.focus(); open(); }
  });
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('.dd-opt');
    if (li) choose(li);
  });
  let typed = '', typedAt = 0;
  list.addEventListener('keydown', (e) => {
    const items = [...list.querySelectorAll<HTMLElement>('.dd-opt:not([aria-disabled="true"])')];
    const at = items.indexOf(document.activeElement as HTMLElement);
    const go = (k: number) => { const el = items[Math.max(0, Math.min(items.length - 1, k))]; el?.focus(); el?.scrollIntoView({ block: 'nearest' }); };
    if (e.key === 'ArrowDown') { e.preventDefault(); go(at + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); go(at - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(items.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (items[at]) choose(items[at]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'Tab') close();
    else if (e.key.length === 1) {
      typed = (Date.now() - typedAt > 700 ? '' : typed) + e.key.toLowerCase();
      typedAt = Date.now();
      const k = items.findIndex((li) => (li.textContent || '').trim().toLowerCase().startsWith(typed));
      if (k >= 0) go(k);
    }
  });
  document.addEventListener('pointerdown', (e) => {
    if (!list.hidden && !list.contains(e.target as Node) && !btn.contains(e.target as Node)) close();
  });
}
