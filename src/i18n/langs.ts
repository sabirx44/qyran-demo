// English is the default: this site is for foreign tourists coming to Almaty
export const langs = ['en', 'ru', 'kk', 'ar', 'zh', 'hi'] as const;
export type Lang = (typeof langs)[number];
export const defaultLang: Lang = 'en';

export const langMeta: Record<Lang, { label: string; name: string; dir: 'ltr' | 'rtl'; locale: string; currency: string }> = {
  en: { label: 'EN', name: 'English', dir: 'ltr', locale: 'en-GB', currency: 'USD' },
  ru: { label: 'RU', name: 'Русский', dir: 'ltr', locale: 'ru-RU', currency: 'KZT' },
  kk: { label: 'KZ', name: 'Қазақша', dir: 'ltr', locale: 'kk-KZ', currency: 'KZT' },
  ar: { label: 'AR', name: 'العربية', dir: 'rtl', locale: 'ar', currency: 'AED' },
  zh: { label: '中文', name: '中文', dir: 'ltr', locale: 'zh-CN', currency: 'CNY' },
  hi: { label: 'हिं', name: 'हिन्दी', dir: 'ltr', locale: 'hi-IN', currency: 'INR' },
};

export const prefix = (l: Lang) => (l === defaultLang ? '' : `/${l}`);
export const path = (l: Lang, p = '/') => `${prefix(l)}${p}`;
export const staticLangPaths = () => langs.map((l) => ({ params: { lang: l === defaultLang ? undefined : l }, props: { lang: l } }));
