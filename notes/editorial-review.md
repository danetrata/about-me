# Editorial review of about-me

Reviewed 2026-09-06 on branch `detrata/homepage-and-conditional-pages` at commit 7dce4aa.
Nothing has been edited. Every file below was read in full, and every claim about
system behavior was checked against the code or the tool's documentation named in
the "Verification" section.

Pages reviewed: `src/pages/index.astro` (resume), `src/pages/404.astro`,
`src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`,
`src/pages/projects/index.astro`, `src/layouts/BaseLayout.astro`, `README.md`,
`AGENTS.md`, `CLAUDE.md`, `astro.config.mjs`, `.github/workflows/deploy.yml`.
The `src/content/blog/` and `src/content/projects/` directories are empty on this
branch, so the blog and projects pages render no entries.

## 1. Calibrated rules

The brief is written for documentation. These are the calibrations for a resume site.

1. **Resume bullets keep the conventional fragment form.** A bullet starts with a
   past-tense verb and an implied "I". The summary paragraph uses first person and
   present tense for what is true now, past tense for finished work.
2. **Second person appears only where the reader acts**, which on this site is the
   404 page and the README.
3. **Numbers stay.** Commit counts, CVE counts, and coverage figures are the
   author's own claims. I cannot verify them from this repository, so they are
   kept verbatim and listed as unverified in section 6.
4. **Separators.** The resume joined title and company with an em dash, and the
   branch replaced it with a spaced hyphen. Both are banned constructions. The
   calibration is to use a word or a comma that names the relation.
   - Entry headings use "at": "Senior Software Engineer at Ulap.co".
   - The degree uses a comma because "at" is already inside the university name.
   - Featured project entries put the description in its own element after the
     link, with no separator character.
   - The HTML `<title>` is not prose and is not copied by the reader. It uses the
     browser-tab convention "Projects | Daniel Etrata". The regex sweep exempts
     the `title=` attribute for that reason. **Decision for you:** if you would
     rather have no separator at all, the alternative is "Projects by Daniel
     Etrata" and "Daniel Etrata, Senior Software Engineer".
5. **Ranges use an unspaced hyphen**: "2020-2026", "IL2-IL5". The current dates use
   a spaced hyphen ("2020 - 2026"), which is a spaced hyphen the sweep would flag.
6. **Product names keep their own casing**: Certificate to Field, GovCloud,
   Kubernetes, React, Node.js, AngularJS, jQuery, D3.js, DC.js, PostgreSQL,
   MSSQL, CompTIA Security+. Company names stay as given.
7. **Terminology** (one term per concept, checked against every page):

   | Concept | Chosen term | Reject |
   | --- | --- | --- |
   | GitLab change request | merge request | MR, MRs |
   | Browser-driven tests | end-to-end tests | E2E |
   | Frontend framework | React | ReactJS |
   | Server JavaScript | Node.js | NodeJS |
   | Security finding write-ups | mitigations | justifications |
   | Impact levels as a range | IL2-IL5 | IL5/IL4/IL2, IL2 through IL5 |
   | Code repository | repository | repo |
   | Root-less image | nonroot | non-root |
   | The site's home page | resume | homepage, home page |

## 2. Site-wide findings, ranked

### F1. The build emits warnings on every run, which blocks the commit gate

The method requires zero warnings before each commit. The current build prints
two `[WARN] [glob-loader] No files found matching` lines and nine
`The collection "blog" does not exist or is empty` lines (and the same for
"projects"). I read the source of both:

- `node_modules/astro/dist/content/loaders/glob.js:180` warns whenever the base
  directory exists and matches zero files. If the directory does not exist it
  warns with a different message at line 174. There is no option to silence it.
- `node_modules/astro/dist/content/runtime.js:93` warns from every
  `getCollection()` call on a collection with no entries in the data store.
  `BaseLayout.astro` calls it twice per page, so every page adds two warnings.

So zero warnings is unreachable while either collection is empty. Two ways out:

- **Option A, remove the scaffolding until there is content.** Delete
  `src/content.config.ts`, the blog and projects pages, the empty content
  directories, the `hasProjects` and `hasBlog` nav logic, and the Featured
  Projects section. `main` still holds the example post and project for when you
  want them back. Smallest change and no hidden files, but it undoes the
  "conditional pages" work this branch was made for.
- **Option B, keep the scaffolding and give each loader one draft file.**
  Add `src/content/blog/_template.md` and `src/content/projects/_template.md`
  with `draft: true`, add a `draft` field to the projects schema, and filter
  drafts everywhere the collections are read (the nav in `BaseLayout.astro`, the
  resume, both index pages, and `[slug].astro`). The loader finds a file, the
  store has the collection, and nothing renders. The template files double as
  authoring templates. To stop the empty `/blog/` and `/projects/` pages from
  building (see F2), rename each index page to `[...index].astro` with a
  `getStaticPaths()` that returns one path when non-draft entries exist and none
  otherwise.

**Recommendation:** Option B, because it preserves the branch's intent and gives
you a template for the first post and project. **This needs your decision before
pass 0.** If you choose A, pass 0 is a deletion, and I will list the exact files
first and wait.

### F2. Empty `/blog/` and `/projects/` pages still build

Verdict: fix. The nav hides the links when the collections are empty, but the
build still writes `dist/blog/index.html` and `dist/projects/index.html`, each an
`<h1>` over an empty list. That is a placeholder page. The fix is in F1 Option B
(or the pages disappear under Option A).

### F3. Two sentences were broken by the branch's own edit

Verdict: fix. `git diff main` shows both.

- `index.astro:112-117`, the summary. "I shipped Python, Go, and React products
  and builds, hardened, and operated Kubernetes" lost its verbs when the sentence
  was moved to first person.
- `index.astro:40`. "Wrote Selenium E2E test automation to 80%, React Python API
  test coverage to 80%." On `main` it read "Wrote Selenium E2E test automation
  and drove Python API test coverage to 80%." I cannot tell whether you meant to
  add React to the coverage claim. Proposed text below assumes yes.

### F4. Spaced hyphens and semicolons join clauses in 11 places

Verdict: fix. Lines in `index.astro`: 31, 32, 39 (spaced hyphen as aside), 53,
68, 89 (semicolon), 132, 161, 179 (spaced hyphen as separator), and the date
ranges at 27, 47, 60, 74, 85, 168. In `README.md`: lines 3, 12, 13, 34 (semicolon
and a parenthetical aside). Rewrites are in section 3.

### F5. Commit counts are spread across three bullets

Verdict: restructure, your call on the numbers. Bullets at `index.astro:31`, `32`
and `39` each carry commit and merge-request totals. Bullet 39 is the aggregate
and the other two are subsets, so a reader meets the same idea three times. I
propose keeping the per-repository figure only where it makes the point (the
deployment repository bullet) and moving the aggregate to the top of the list
as the frame for the role. No number changes.

### F6. Terminology drifts

Verdict: fix, using the table in section 1. Occurrences: "MRs" (31, 39), "E2E"
(19, 40), "ReactJS" (16, 29, 49), "NodeJS" (49, 52), "justifications" (34),
"IL5/IL4/IL2" (38) against "IL2-IL5" (11), "repo" and "repos" (31, 34, 39).

### F7. The Ulap stack line repeats the Skills section

Verdict: your call. `index.astro:29` lists 19 technologies, all of which appear
again under Skills at lines 10-21. One home per idea says trim the stack line to
what is specific to the role or drop it. The other roles' stack lines are short
and do not repeat Skills, so they can stay. I propose trimming Ulap's line to
"Python, Go, React, Kubernetes on AWS GovCloud, GitLab CI/CD".

### F8. Filler and weak verbs

Verdict: fix. "de facto" (31), "spanning but not limited to" (32), "Utilized"
(54), "always on time" (79). "Shepherded" (38) is figurative. Certificate to
Field has no verb of its own, so the proposal is "Took 3 applications through
Certificate to Field".

### F9. README prose

Verdict: fix. Spaced-hyphen asides, a semicolon, an arrow in a UI path, and
"Node 22+" where `package.json` requires 22.12. Rewrites in section 3.

### F10. Minor

- `index.astro:107` meta description reads "Resume Daniel Etrata"; missing "of".
- `index.astro:183` "All projects →". The arrow is a visual affordance, not a
  clause joiner. Keep unless you want words only.
- `AGENTS.md:13` "Full documentation: https://docs.astro.build" uses a colon to
  introduce a link rather than a list. Low priority since the file addresses
  tooling, not readers.
- `deploy.yml:3` uses "->" for the settings path while `README.md:34` uses "→".
  Pick words: "under Settings, then Pages".

## 3. Page-by-page verdicts

### `src/pages/index.astro` (resume)

| Line | Verdict | Before | After |
| --- | --- | --- | --- |
| 107 | fix | `description="Resume Daniel Etrata, Senior Software Engineer"` | `description="Resume of Daniel Etrata, Senior Software Engineer"` |
| 107 | fix (rule 4) | `title="Daniel Etrata - Senior Software Engineer"` | `title="Daniel Etrata, Senior Software Engineer"` |
| 112-117 | fix (F3) | I am a senior software engineer with 10 years of continuous delivery across commercial multi-cloud SaaS and IL5 DoD platforms. I shipped Python, Go, and React products and builds, hardened, and operated Kubernetes from container build through Certificate to Field. I have a CompTIA Security+ certification. I am currently building and securing agentic AI products for government deployment. | I am a senior software engineer with 10 years of shipping software across commercial multi-cloud SaaS and IL5 DoD platforms. I build Python, Go, and React products. I build, harden, and operate Kubernetes from container build through Certificate to Field. I hold a CompTIA Security+ certification. I am currently building and securing agentic AI products for government deployment. |
| 27 | check | `2020 - 2026` | `2020-2026`, or `2020-present` if the role is current. The summary says "currently building", which reads as current. **Unverified, your call.** |
| 31 | fix (F4, F5, F6, F8) | Served as de facto maintainer of the deployment repo for an IL5 AI/ML platform on AWS GovCloud EKS, gatekeeping merges - 600+ authored commits and 330+ merged MRs on that repo alone. | Maintained the deployment repository for an IL5 AI/ML platform on AWS GovCloud EKS and gated its merges, with 600+ authored commits and 330+ merged merge requests on that repository. |
| 32 | fix (F4, F8) | Developed a commercial multi-cloud Kubernetes management SaaS hosted on GCP across 4 environments - 1,000+ authored commits spanning but not limited to Python APIs, async job infrastructure, and React UI. | Developed a commercial multi-cloud Kubernetes management SaaS hosted on GCP across 4 environments, with 1,000+ authored commits across Python APIs, async job infrastructure, and the React UI. |
| 33 | fix (length) | Rebuilt a production vector database image from 113 CVEs to zero in one release cycle, including a verified irreversible data migration to a distroless, nonroot, major-version-bumped base. | Rebuilt a production vector database image from 113 CVEs to zero in one release cycle. The rebuild moved it to a distroless, nonroot base on a new major version and included a verified irreversible data migration. |
| 34 | fix (F6) | ...with monthly scans, remediations, and justifications. | ...with monthly scans, remediations, and mitigations. |
| 37 | keep | Refactored an LLM-powered security assistant from OpenAI to Claude to fully self-hosted with zero external APIs, then hardened it for deployment. | Migrated an LLM-powered security assistant from OpenAI to Claude and then to a fully self-hosted model with no external APIs, then hardened it for deployment. (Optional. "Refactored" undersells a hosting change.) |
| 38 | fix (F6, F8) | Shepherded 3 applications through Certificate to Field, operating in IL5/IL4/IL2 AWS GovCloud environments. | Took 3 applications through Certificate to Field in IL2, IL4, and IL5 AWS GovCloud environments. |
| 39 | fix (F4, F5, F6) | Developed and maintained 7 products across SaaS and DoD platforms - 4,400+ authored commits and 1,000+ merged MRs across 150 repos over 6 years. | Developed and maintained 7 products across SaaS and DoD platforms over 6 years, with 4,400+ authored commits and 1,000+ merged merge requests across 150 repositories. Move to the top of the Ulap list (F5). |
| 40 | fix (F3, F6) | Wrote Selenium E2E test automation to 80%, React Python API test coverage to 80%. | Wrote Selenium end-to-end tests and raised React and Python API test coverage to 80%. **Confirm the React reading.** |
| 45 | keep | Python & JS Software Developer | Job title as given. |
| 49 | fix (F6) | CentOS, Nginx, MongoDB, NodeJS, ReactJS, AWS | CentOS, Nginx, MongoDB, Node.js, React, AWS |
| 52 | fix (F6) | ...in NodeJS, MSSQL, and D3/DC.js across 3 departments and 20 regions. | ...in Node.js, MSSQL, D3.js, and DC.js across 3 departments and 20 regions. |
| 53 | fix (F4) | Migrated 14 sites from various hosting providers to AWS S3 and EC2; responsible for Logistics and B2B Portal production deploys in AWS Elastic Beanstalk. | Migrated 14 sites from various hosting providers to AWS S3 and EC2. Ran the Logistics and B2B Portal production deploys in AWS Elastic Beanstalk. |
| 54 | fix (F8) | Utilized AWS SDK for application-specific services such as mailing lists and image storage. | Used the AWS SDK for application services such as mailing lists and image storage. |
| 68 | fix (F4) | Maintained bad actor detection and logging; responsible for Tool and Merchant Portal production deploys. | Maintained bad-actor detection and logging. Ran the Tool and Merchant Portal production deploys. |
| 79 | fix (F8) | Delivered marketing and statistical reports from scraped data into spreadsheets and MySQL databases, always on time. | Delivered marketing and statistical reports from scraped data into spreadsheets and MySQL databases. |
| 89 | fix (F4) | Tested point-of-sale systems, back-office servers, and in-store processing units for McDonald's in C#; product released to 5,000+ stores. | Tested point-of-sale systems, back-office servers, and in-store processing units for McDonald's in C#. The product shipped to 5,000+ stores. |
| 100 | reference | Developed the persispy tool for studying invariants of algebraic varieties, abstracted to n dimensions. | Same text, with "persispy" linked to https://github.com/danetrata/persispy (slug verified). Or make it the first Projects entry under F1 Option B. Your call. |
| 132 | fix (rule 4) | `{job.title} - {job.company}` | `{job.title} at {job.company}` |
| 161 | fix (rule 4) | B.S. Mathematics and Computer Science - University of Illinois at Chicago | B.S. Mathematics and Computer Science, University of Illinois at Chicago |
| 168 | fix (rule 5) | `2023 - 2027` | `2023-2027` |
| 179 | fix (rule 4) | `<a>{title}</a> - {description}` | `<a>{title}</a> <span class="project-desc">{description}</span>` with the description on its own line |
| 11 | keep | AWS GovCloud (IL2-IL5) | Already the chosen range form. |
| 16, 29 | fix (F6) | ReactJS | React |
| 19 | fix (F6) | pytest/unittest, Selenium E2E | pytest and unittest, Selenium end-to-end |
| 29 | your call (F7) | 19-item stack line | Python, Go, React, Kubernetes on AWS GovCloud, GitLab CI/CD |

### `src/pages/404.astro`

| Line | Verdict | Before | After |
| --- | --- | --- | --- |
| 6 | fix (rule 4) | `title="Page not found - Daniel Etrata"` | `title="Page not found \| Daniel Etrata"` |
| 8-9 | keep | The page you're looking for doesn't exist or has moved. Back to the resume | Second person, present tense, imperative link. No change. |

### `src/pages/blog/index.astro` and `src/pages/blog/[slug].astro`

| Line | Verdict | Before | After |
| --- | --- | --- | --- |
| index:11 | fix (rule 4) | `title="Blog - Daniel Etrata"` | `title="Blog \| Daniel Etrata"` |
| slug:17 | fix (rule 4) | `` `${post.data.title} - Daniel Etrata` `` | `` `${post.data.title} \| Daniel Etrata` `` |
| index:6 | fix (F1 B) | filters `!data.draft` | Unchanged, but the page becomes `[...index].astro` so it builds only when a non-draft post exists. |

### `src/pages/projects/index.astro`

| Line | Verdict | Before | After |
| --- | --- | --- | --- |
| 14 | fix (rule 4) | `title="Projects - Daniel Etrata"` | `title="Projects \| Daniel Etrata"` |
| 5 | fix (F1 B) | no draft filter | Filter `!data.draft` once the schema has the field. |
| 30-31 | keep | Source, Live | Platform's own words. |

### `src/layouts/BaseLayout.astro`

| Line | Verdict | Before | After |
| --- | --- | --- | --- |
| 10 | keep | Personal site of Daniel Etrata | Fine as a default description. |
| 12-13 | fix (F1 B) | `(await getCollection('projects')).length > 0` | Filter drafts so a template file does not show the nav link. |
| 52 | keep | Design tokens ported from the "hired" WordPress theme (ModernThemes) | Code comment, states provenance. |

### `README.md`

| Line | Verdict | Before | After |
| --- | --- | --- | --- |
| 3 | fix (F4) | Personal site of Daniel Etrata - resume, projects, and blog. | Personal site of Daniel Etrata with a resume, projects, and blog. |
| 12-13 | fix (F4) | Blog posts - one Markdown file per post | Blog posts, one Markdown file per post |
| 25 | fix (F9) | Requires Node 22+. | Requires Node 22.12 or newer. (`package.json` engines is `>=22.12.0`.) |
| 29-31 | keep | Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. The Pages source must be set to "GitHub Actions" in the repo settings. | Verified against `deploy.yml` (push on main, `withastro/action@v3` build, `actions/deploy-pages@v4` deploy) and the Astro GitHub Pages guide ("Choose GitHub Actions as the Source"). Change "repo settings" to "repository settings" for terminology only. |
| 33-36 | fix (F4, F9) | The site is served at the custom domain <https://danetrata.com/> (`public/CNAME` plus the domain setting in repo Settings → Pages); internal links go through `src/utils/url.ts` to stay base-aware, so the site can move back under a base path by setting `site` and `base` in `astro.config.mjs`. | The site is served at the custom domain <https://danetrata.com/>. GitHub Pages reads the domain from `public/CNAME` and from the domain setting under Settings, then Pages. Internal links go through `src/utils/url.ts`, which prefixes each path with `import.meta.env.BASE_URL`, so the site can move back under a base path by setting `site` and `base` in `astro.config.mjs`. (Verified: `url.ts` reads `BASE_URL`, and the Astro config reference says `base` is exposed as `import.meta.env.BASE_URL`.) |

### `astro.config.mjs`, `.github/workflows/deploy.yml`, `AGENTS.md`, `CLAUDE.md`

| File:line | Verdict | Note |
| --- | --- | --- |
| `astro.config.mjs:4-6` | keep | Future-tense warning about a later result, which the voice rules allow. "site/base" is a slash pair naming two keys, not a joined clause. |
| `deploy.yml:3` | fix (F10) | "repo Settings -> Pages -> Build and deployment" becomes "under Settings, then Pages, then Build and deployment". |
| `AGENTS.md:13` | low | "Full documentation: https://docs.astro.build" becomes "The full documentation is at https://docs.astro.build". |
| `CLAUDE.md:3-9` | keep | Verified: Astro 7.1.5 `cli/dev/index.js` defines `--background`, `stop`, `status`, and `logs`, and the CLI reference documents them. |

## 4. Mechanical checklist (run before every commit)

1. **Build with zero warnings.**
   ```bash
   npm run build 2>&1 | grep -Ei 'warn|does not exist' ; echo "warnings above (expect none)"
   ```
2. **Sentinel check** that the key paragraphs still exist. Each string must match
   exactly once in the named file.
   - `index.astro`: "Certificate to Field", "CompTIA Security+", "Ulap.co",
     "BV-USA", "CouponCabin", "RDI Software", "UIC Math Computing Laboratory",
     "persispy", "contact@danetrata.com".
   - `404.astro`: "Back to the resume".
   - `README.md`: "## Deployment", "public/CNAME", "src/utils/url.ts".
3. **Regex sweep** over prose only. Prose means the string literals inside the
   `skills` and `experience` arrays, JSX text nodes, Markdown, and YAML or JS
   comments. CSS and JS syntax lines are excluded, and the `title=` attribute is
   exempt for the "|" separator.
   ```bash
   grep -nP '\x{2014}|\x{2013}| - |; ' src/pages/index.astro src/pages/404.astro README.md AGENTS.md astro.config.mjs .github/workflows/deploy.yml | grep -vE '^\S+:[0-9]+:\s*(import |const |\.|\}|\{|[a-z-]+: |//|/\*|\*|\s*<style|\s*font|\s*margin|\s*padding|\s*color|\s*display)'
   grep -niE '\bplease\b|it is recommended|leverage|aforementioned|in order to|said another way|etc\.' src README.md AGENTS.md
   grep -niE 'treat this as|deliberate|on purpose|intentional|not a bug|business' src README.md AGENTS.md
   grep -niE '\bharvest|\bhit\b|goes green|sits red|\bcut a release|\blever\b' src README.md AGENTS.md
   ```
   Expect no output from any of the four.
4. **Line endings.** `git ls-files --eol` shows every text file as LF today, so
   the CRLF rule has nothing to preserve in this repository. The check runs
   anyway and must show no `crlf` after each pass.
5. **No attribution trailers** in the commit (`git log -1 --format=%B`).

## 5. Suggested order of work

| Pass | Theme | Files | Commit message summary |
| --- | --- | --- | --- |
| 0 | Build gate: F1 and F2 | `content.config.ts`, `BaseLayout.astro`, blog and projects pages, two template files (Option B) | "Give empty collections a draft template so the build has zero warnings and empty sections build no page" |
| 1 | Mechanical: F3, F10 | `index.astro`, `deploy.yml` | "Repair two sentences broken by the first-person rewrite and fix the meta description" |
| 2 | Voice: F8, summary, verb choices | `index.astro` | "Name the actor and drop filler in the resume bullets" |
| 3 | Section themes: F5, F7 | `index.astro` | "Keep one home for the commit totals and trim the Ulap stack line" |
| 4 | Vocabulary: F6, product casing | `index.astro`, `README.md` | "Use one term per concept across the resume" |
| 5 | Punctuation: F4, rule 4 and 5 separators | `index.astro`, `404.astro`, blog and projects pages, `README.md`, `AGENTS.md` | "Replace clause-joining dashes and semicolons with words" |
| 6 | Reference completeness: F9 and the README behavior paragraph, persispy link | `README.md`, `index.astro` | "State how the deploy and base path work as the code does" |

Each pass ends with the checklist in section 4, then one commit.

## 6. Unverified claims kept verbatim

These are the author's own figures and I have no source for them in this
repository. They are kept unchanged in every proposed rewrite.

- All commit, merge request, repository, product, and environment counts in
  `index.astro:31-41`.
- "113 CVEs to zero", "140 images", "3x more than any other author".
- Coverage figures at line 40, and whether "React" belongs in that sentence.
- The Ulap role's end date (2026) against "currently building" in the summary.
- The company name "Ulap.co" as the display form.
- All BV-USA, CouponCabin, RDI, and UIC figures.

## 7. Verification sources

| Claim | Source read |
| --- | --- |
| Build warning causes | `node_modules/astro/dist/content/loaders/glob.js:172-185`, `node_modules/astro/dist/content/runtime.js:74-99` |
| `astro dev --background`, `stop`, `status`, `logs` | `node_modules/astro/dist/cli/dev/index.js:53-58`, Astro CLI reference |
| Deploy on push to main, build and deploy jobs | `.github/workflows/deploy.yml` |
| `withastro/action` accepts `node-version` (default 24) | withastro/action README |
| Pages source must be GitHub Actions | Astro "Deploy to GitHub Pages" guide |
| `url()` prefixes with the configured base | `src/utils/url.ts`, Astro configuration reference for `base` |
| Custom domain needs `public/CNAME` and no `base` | Astro "Deploy to GitHub Pages" guide, `astro.config.mjs`, `public/CNAME` |
| Node version | `package.json` engines `>=22.12.0` |
| persispy repository slug | https://github.com/danetrata/persispy listed on the danetrata profile |
| Line endings all LF | `git ls-files --eol` |
