// Encodes the web clips from the raw downloads in media/raw (Pexels, free licence) into public/media.
// Phone files are 720x1280, desktop files 1920x1080 or 1280x720, H.264 without sound, plus a WebP poster.
// Usage: node scripts/media.mjs [name]   (ffmpeg path from FFMPEG or the ffmpeg-static package)
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, rmSync, writeFileSync } from 'node:fs';

const ff = process.env.FFMPEG || 'ffmpeg';
const raw = 'media/raw/';
const out = 'public/media/';
mkdirSync(out, { recursive: true });

// A clip is either one source [file, start, seconds] or a reel of several cut together.
// crop: true takes a 9:16 slice out of a landscape source for the phone file.
const jobs = {
  'hero-m': { size: [720, 1280], parts: [['kaindy-37675266.mp4', 0.5, 2.6], ['hiker-35367899.mp4', 3, 2.6], ['yurt-38302284.mp4', 1, 2.6], ['kolsai-28927581.mp4', 9, 2.6]] },
  'hero-d': { size: [1920, 1080], crf: 27, parts: [['hd-33173922.mp4', 12, 2.6], ['hd-28236381.mp4', 1, 2.6], ['hd-34162348.mp4', 4, 2.6], ['hd-15191742.mp4', 1, 2.6]] },
  'charyn-kolsai-kaindy-m': { size: [720, 1280], parts: [['kaindy-37675266.mp4', 0, 7]] },
  'charyn-kolsai-kaindy-d': { size: [1920, 1080], crf: 27, parts: [['hd-28236381.mp4', 0, 8]] },
  'big-almaty-lake-m': { size: [720, 1280], parts: [['hiker-35367899.mp4', 2, 8]] },
  'big-almaty-lake-d': { size: [1280, 720], parts: [['lake-34293606.mp4', 0, 9]] },
  'kolsai-two-days-m': { size: [720, 1280], parts: [['kolsai-28927581.mp4', 4, 8]] },
  'kolsai-two-days-d': { size: [1920, 1080], crf: 27, parts: [['hd-33173922.mp4', 20, 9]] },
  'shymbulak-medeu-m': { size: [720, 1280], parts: [['cable-39538160.mp4', 1, 8]] },
  'shymbulak-medeu-d': { size: [1920, 1080], crf: 27, parts: [['hd-15191742.mp4', 0, 6]] },
  'altyn-emel-dune-m': { size: [720, 1280], crop: true, parts: [['dune-18187168.mp4', 2, 8]] },
  'altyn-emel-dune-d': { size: [1920, 1080], crf: 27, parts: [['hd-34162348.mp4', 2, 9]] },
  'eagle-hunters-m': { size: [720, 1280], parts: [['eagle-38220255.mp4', 0, 7.5]] },
  'steppe-m': { size: [720, 1280], parts: [['yurt-38302284.mp4', 0, 10]] },
  'steppe-d': { size: [1280, 720], parts: [['horses-37984596.mp4', 0, 7.2]] },
};

const only = process.argv[2];
for (const [name, j] of Object.entries(jobs)) {
  if (only && !name.startsWith(only)) continue;
  const [w, h] = j.size;
  // Bitrate caps keep every file small enough for 4G: about 1.6 MB per 10 s on phones
  const cap = w === 720 ? '1300k' : w === 1920 ? '2400k' : '1500k';
  const fit = j.crop ? `crop=ih*9/16:ih,scale=${w}:${h}` : `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`;
  const args = ['-y', '-loglevel', 'error'];
  j.parts.forEach(([f, ss, t]) => args.push('-ss', String(ss), '-t', String(t), '-i', raw + f));
  const chains = j.parts.map((_, i) => `[${i}:v]${fit},fps=30,setsar=1,format=yuv420p[v${i}]`);
  const concat = j.parts.map((_, i) => `[v${i}]`).join('') + `concat=n=${j.parts.length}:v=1:a=0[v]`;
  // Soft fade between reel shots would need xfade offsets; hard cuts on a beat read fine for a 10 s loop.
  args.push('-filter_complex', [...chains, concat].join(';'), '-map', '[v]', '-an',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(j.crf || 28), '-maxrate', cap, '-bufsize', cap.replace(/\d+/, (n) => String(n * 2)), '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out + name + '.mp4');
  execFileSync(ff, args, { stdio: 'inherit' });
  // Poster: a frame from the first shot
  const png = out + name + '.png';
  execFileSync(ff, ['-y', '-loglevel', 'error', '-ss', '0.4', '-i', out + name + '.mp4', '-frames:v', '1', png]);
  execFileSync(ff, ['-y', '-loglevel', 'error', '-i', png, '-c:v', 'libwebp', '-quality', '62', out + name + '.webp']);
  rmSync(png);
  console.log(name.padEnd(26), (statSync(out + name + '.mp4').size / 1024).toFixed(0) + ' KB', (statSync(out + name + '.webp').size / 1024).toFixed(0) + ' KB poster');
}
writeFileSync(out + 'CREDITS.txt', 'Video: Pexels contributors (pexels.com/license). Encoded by scripts/media.mjs from media/raw.\n');
