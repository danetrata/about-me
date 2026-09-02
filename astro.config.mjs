// @ts-check
import { defineConfig } from 'astro/config';

// Custom domain via GitHub Pages (see public/CNAME). If the domain is ever
// dropped, this repo falls back to https://danetrata.github.io/about-me/ and
// needs site/base set back to match.
export default defineConfig({
  site: 'https://danetrata.com',
});
