/** Prefix a root-absolute path with the configured base (for GitHub Pages project sites). */
export function url(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
