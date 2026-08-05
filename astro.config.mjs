// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site: https://danetrata.github.io/about-me/
// If the site moves to a custom domain (danetrata.com), set site to
// 'https://danetrata.com', remove base, and add public/CNAME.
export default defineConfig({
  site: 'https://danetrata.github.io',
  base: '/about-me',
});
