# Allevamento Cocker Montecorno

A photographic Italian/English static website with a client-facing **Decap CMS** at `/admin/`. The site uses Inter Tight and Source Serif 4, beige/terracotta/dark brown, generous spacing and margins no wider than 25 pixels.

## Develop

Node.js 22.12+ is required (verified with Node 24).

```sh
npm ci --cache /tmp/montecorno-npm-cache
npm run dev
```

The default port is 5173. Changes to content JSON regenerate the HTML in development. The editor itself is at `/admin/`; production authentication must be configured separately as described below.

| Page | Italian | English |
| --- | --- | --- |
| Home | `/` | `/en/` |
| Puppies | `/cuccioli/` | `/en/puppies/` |
| Gallery | `/galleria/` | `/en/gallery/` |
| Story | `/storia/` | `/en/our-story/` |
| Dogs | `/i-nostri-cani/` | `/en/our-dogs/` |
| Champions | `/campioni/` | `/en/champions/` |
| Retired dogs | `/cani-ritirati/` | `/en/retired-dogs/` |
| Family placements | `/affido/` | `/en/family-placements/` |

## Client handoff

- **Editor:** `/admin/`.
- **Client guide:** `/admin/guida.html`.
- **Owner setup:** [docs/ATTIVAZIONE-CMS.md](docs/ATTIVAZIONE-CMS.md).

The editor manages main photographs, bilingual page text and SEO, gallery uploads/captions/order/visibility, dog records/photos/checkboxes/order/visibility, champion/retired/placement categories and bilingual show results, contacts, menu, privacy and the enquiry form labels. Publishing writes content and media to GitHub `main`; a connected Netlify project rebuilds the site automatically. The CMS has an Italian interface and content previews. It uses a locally hosted, pinned Decap bundle and its Italian locale, with no CDN dependency.

**Production login is not activated by adding the code.** The owner must configure a GitHub OAuth provider in Netlify and give the client repository write access. This integration uses the GitHub backend and Netlify’s OAuth service, not Netlify Identity/Git Gateway. No secret belongs in browser code or content files. The final authenticated save → GitHub commit → Netlify deploy must be checked in the owner’s account before client handoff.

## Build and deploy

```sh
SITE_URL=https://your-domain.example npm run build
npm run preview
```

Deploy `dist/` to a static host. No application database or API server is needed. Serve directory indexes normally; no SPA fallback is required.

`SITE_URL` is the final HTTPS origin without a path. A configured build generates canonical and language URLs, social metadata, structured business/page/breadcrumb data, puppy FAQ schema, `robots.txt` and a sixteen-page bilingual sitemap. Without a domain, canonical URLs and the sitemap are omitted. The admin and guide have `noindex`; admin responses have no-store/noindex headers on Netlify and are excluded from the sitemap.

### Netlify

Connect `studiomebae/cockermontecorno`, branch `main`. `netlify.toml` specifies Node 24, build command and `dist`. Netlify’s primary `URL` is used for SEO unless `SITE_URL` overrides it. After changing the primary domain, rebuild the site.

## Content model

- `content/settings.json`: business contacts, branding, SEO location, main photographs and bilingual alt text.
- `content/pages/{page}.{it|en}.json`: each page’s copy and SEO.
- `content/common.{it|en}.json`: shared interface, contact and privacy copy.
- `content/dogs/*.json`: records with name, coat, optional male/female sex, birth year, photo, pedigree/test flags, demonstration status, categories, bilingual description/show results, order and visibility. A retired dog leaves the active-dogs list; champion and placement flags are independent. All categories use the same record. The optional sex selector supports male/female without assigning a value to existing dogs; unspecified records display a localized placeholder. The coat options cover solids, particolours, roans, tan markings and tricolours.
- `content/gallery/*.json`: photos with Italian/English captions and descriptions, order and visibility.
- `public/images/uploads/`: CMS-uploaded media.
- `cms/collections.json`: stable CMS fields and validation schema.
- `cms/data.js`: validates and loads content for the static build.
- `src/templates.js`, `src/style.css`, `src/main.js`: rendering, design and interactions.
- `scripts/prepare-cms.mjs`: copies the pinned editor/chunks and writes its public configuration. Generated vendor/config/locale files are ignored.

HTML in content is displayed as plain text. Missing photos and invalid records stop builds with field-specific messages. Required real photos prevent a demonstration portrait being silently presented as a verified dog. The previous successful Netlify deploy stays live when a new build fails.

Business facts were supplied by the user. Ten fictional dog profiles and generated portraits were explicitly requested and remain labelled as demonstrations. Replace those records/photos with verified information before presenting them as actual dogs. The original generated portraits use a shared sprite; individual uploaded photos take precedence. Public text, contacts and gallery/dog counts are not hardcoded in the renderer.

The puppy page manages the latest litter (birth, ready date, coats and optional photo) and the next planned litter (period, colours and parents). Home automatically reads these periods from the puppy content for its language. FAQ and SEO copy remain separately editable. Placement conditions use the owner-supplied text; no dog is marked available by default.

The phone number always links to WhatsApp and is accompanied by a messages-only notice. The WhatsApp composer reads its recipient and contact name from settings. Visitors must send their prepared message themselves. This website stores no enquiry data and uses no analytics or marketing cookies. The authenticated CMS uses its own necessary session storage.

## Verify

```sh
# Only if system Chromium and a Playwright browser are both absent:
npx playwright install chromium
npm test
```

Eleven isolated content tests check edits to copy/SEO/photos/contacts, dog/gallery creation and visibility, empty states, safe text rendering and invalid-data rejection. Thirty-four public-site browser checks cover all sixteen localized pages, layouts, SEO, language switching, navigation, gallery, filters and contact actions. CMS browser checks cover production login routing, Italian editing/preview/publishing, dog visibility/categories/show results, coat/sex selection, litter dates/parents, guide/configuration and media uploads. Editor saves use an in-memory backend; OAuth is intercepted. They never push test edits or send real messages and do not prove production authentication is activated.

The browser runner uses a reserved canonical domain for its production preview on port 4173. Run `npm run build` afterwards to replace ignored local test output with a normal build. Generated HTML routes are ignored; edit content or templates rather than HTML output.
