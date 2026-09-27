// Real photos and clips per tour. Photos: src/assets/img/<slug>/1.jpg... (1 is the cover).
// Clips: public/media/<slug>-m.mp4 (phone, vertical) and -d.mp4 (desktop), built by scripts/media.mjs.
// Demo media comes from Pexels (free licence); a client's own photos and reels replace them file by file.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/img/**/*.jpg', { eager: true });

export function photos(folder: string): ImageMetadata[] {
  return Object.keys(files)
    .filter((k) => k.startsWith(`/src/assets/img/${folder}/`))
    .sort((a, b) => parseInt(a.split('/').pop()!) - parseInt(b.split('/').pop()!))
    .map((k) => files[k].default);
}

export function sitePhoto(name: string): ImageMetadata {
  return files[`/src/assets/img/site/${name}.jpg`].default;
}

// Which clip files exist for a tour: phone only ('m') or both
export const clips: Record<string, 'both' | 'm'> = {
  'charyn-kolsai-kaindy': 'both', 'big-almaty-lake': 'both', 'kolsai-two-days': 'both',
  'shymbulak-medeu': 'both', 'altyn-emel-dune': 'both', 'eagle-hunters': 'm',
};
