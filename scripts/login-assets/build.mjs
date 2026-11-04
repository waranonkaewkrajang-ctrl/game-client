// Rasterises the login UI source SVGs into optimised WebP files in /public/login.
// Usage: node scripts/login-assets/build.mjs   (uses the `sharp` package bundled with Next.js)
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../../public/login");

const jobs = [
  { src: "stage.svg", dest: "stage.webp", width: 1200, quality: 80 },
  { src: "texture.svg", dest: "texture.webp", width: 256, quality: 70, alpha: true },
];

for (const job of jobs) {
  const info = await sharp(path.join(here, job.src), { density: 96 })
    .resize({ width: job.width })
    .webp({ quality: job.quality, alphaQuality: job.alpha ? 60 : 100, effort: 6 })
    .toFile(path.join(out, job.dest));
  console.log(`${job.dest}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} KB`);
}
