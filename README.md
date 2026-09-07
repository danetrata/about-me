# about-me

Personal site of Daniel Etrata with a resume, projects, and blog. Built with
[Astro](https://astro.build), deployed to GitHub Pages at
<https://danetrata.com/>.

## Structure

| Path                    | What it is                                          |
| ----------------------- | --------------------------------------------------- |
| `src/pages/index.astro` | Resume (homepage)                                   |
| `src/content/blog/`     | Blog posts, one Markdown file per post              |
| `src/content/projects/` | Project entries, one Markdown file per project      |
| `src/layouts/`          | Shared layout, nav, and global styles               |
| `src/content.config.ts` | Frontmatter schemas for the content collections     |

## Development

```sh
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
```

Requires Node 22+.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the
site and publishes it to GitHub Pages. The Pages source must be set to
"GitHub Actions" in the repository settings.

The site is served at the custom domain <https://danetrata.com/>. GitHub
Pages reads the domain from `public/CNAME` and from the domain setting under
Settings, then Pages. Internal links go through `src/utils/url.ts`, which
prefixes each path with `import.meta.env.BASE_URL`, so the site can move back
under a base path by setting `site` and `base` in `astro.config.mjs`.
