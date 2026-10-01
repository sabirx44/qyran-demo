// Round flags for the language switchers, drawn on a 24×24 grid and clipped to a circle by the caller.
// Language is not a country, so each language shows the flag its readers here expect:
// English UK, Arabic UAE (Gulf clients), Chinese PRC, Hindi India.
const s = (w: number, h: number, body: string) => `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>`;
const stripes = (cols: string[]) => cols.map((c, i) => `<rect y="${(i * 24) / cols.length}" width="36" height="${24 / cols.length + 0.2}" fill="${c}"/>`).join('');

export const flags: Record<string, string> = {
  ru: s(36, 24, stripes(['#fff', '#0039A6', '#D52B1E'])),
  kk: s(36, 24, `<rect width="36" height="24" fill="#00AFCA"/><g fill="#FEC50C"><circle cx="18" cy="10" r="4.2"/>${Array.from({ length: 16 }, (_, i) => `<rect x="17.6" y="3.2" width=".8" height="2" transform="rotate(${i * 22.5} 18 10)"/>`).join('')}<path d="M9.5 16.5c3-1.6 5.8-1.6 8.5 0 2.7-1.6 5.5-1.6 8.5 0-2.6.2-5.4 1-8.5 2.6-3.1-1.6-5.9-2.4-8.5-2.6z"/><rect x="2.6" y="2" width="1.3" height="20"/></g>`),
  uz: s(36, 24, `<rect width="36" height="8" fill="#0099B5"/><rect y="8" width="36" height="8" fill="#fff"/><rect y="16" width="36" height="8" fill="#1EB53A"/><rect y="7.5" width="36" height=".7" fill="#CE1126"/><rect y="15.8" width="36" height=".7" fill="#CE1126"/><circle cx="6" cy="4" r="2.7" fill="#fff"/><circle cx="7" cy="4" r="2.3" fill="#0099B5"/><g fill="#fff">${[[11, 2], [13.4, 2], [15.8, 2], [11, 4.2], [13.4, 4.2], [15.8, 4.2], [13.4, 6.2], [15.8, 6.2], [11, 6.2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".5"/>`).join('')}</g>`),
  tg: s(36, 24, `<rect width="36" height="24" fill="#fff"/><rect width="36" height="6.9" fill="#CC0000"/><rect y="17.1" width="36" height="6.9" fill="#006600"/><g fill="#F8C300"><path d="M15.4 13.6h5.2l-.3 1.2h-4.6z"/><path d="M15.6 13.4c.3-1.3 1.3-2.2 2.4-2.2s2.1.9 2.4 2.2z"/>${[[13.4, 11.2], [14.4, 9.6], [16.1, 8.7], [18, 8.4], [19.9, 8.7], [21.6, 9.6], [22.6, 11.2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".45"/>`).join('')}</g>`),
  en: s(36, 24, `<rect width="36" height="24" fill="#012169"/><path d="M0 0l36 24M36 0L0 24" stroke="#fff" stroke-width="4.8"/><path d="M0 0l36 24M36 0L0 24" stroke="#C8102E" stroke-width="1.6"/><path d="M18 0v24M0 12h36" stroke="#fff" stroke-width="8"/><path d="M18 0v24M0 12h36" stroke="#C8102E" stroke-width="4.8"/>`),
  ar: s(36, 24, `<rect width="36" height="8" fill="#00732F"/><rect y="8" width="36" height="8" fill="#fff"/><rect y="16" width="36" height="8" fill="#000"/><rect width="10" height="24" fill="#FF0000"/>`),
  zh: s(36, 24, `<rect width="36" height="24" fill="#EE1C25"/><g fill="#FFFF00"><path d="M6 2.4l1.2 3.6H11L7.9 8.2 9.1 11.8 6 9.6 2.9 11.8 4.1 8.2 1 6h3.8z"/>${[[12, 2.4], [14.4, 4.8], [14.4, 8.4], [12, 10.8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9"/>`).join('')}</g>`),
  hi: s(36, 24, `${stripes(['#FF9933', '#fff', '#138808'])}<circle cx="18" cy="12" r="3" fill="none" stroke="#000080" stroke-width=".7"/><circle cx="18" cy="12" r=".6" fill="#000080"/>`),
};

// Shown when a language has no flag above
export const globe = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/></svg>`;
export const flagFor = (lang: string) => flags[lang] ?? globe;
