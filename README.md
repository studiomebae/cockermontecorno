# Allevamento Cocker Montecorno

A photographic Italian and English website for Natascia’s English Cocker Spaniel breeding home in Grosseto, Tuscany. The design uses beige, terracotta and dark brown, locally hosted Inter Tight and Source Serif 4, restrained copy, generous vertical spacing, and outer margins no wider than 25 pixels.

## Develop

Requires Node.js 22.12+ (verified with Node 24).

```sh
npm ci --cache /tmp/montecorno-npm-cache
npm run dev
```

The default development port is 5173. Each page is generated as complete HTML for visitors and search engines:

| Page | Italian | English |
| --- | --- | --- |
| Home | `/` | `/en/` |
| Puppies | `/cuccioli/` | `/en/puppies/` |
| Gallery | `/galleria/` | `/en/gallery/` |
| Story | `/storia/` | `/en/our-story/` |
| Dogs | `/i-nostri-cani/` | `/en/our-dogs/` |

## Build and deploy

```sh
SITE_URL=https://your-domain.example npm run build
npm run preview
```

Deploy `dist/` to a static host. No database, API keys, or server runtime is required. Serve directory indexes normally; no SPA fallback is needed. `SITE_URL` must be the final HTTPS origin without a path.

The build generates unique translated titles/descriptions, canonical URLs and language alternates for each page, Open Graph metadata, business and page structured data, breadcrumbs, a puppy FAQ schema, `robots.txt`, and a bilingual sitemap containing all ten pages. Without `SITE_URL`, canonical URLs and the sitemap are omitted instead of inventing a domain.

### Netlify

Connect `studiomebae/cockermontecorno`, branch `main`. The included `netlify.toml` specifies Node 24, the build command, and `dist`. Netlify’s primary site URL (`URL`) is used automatically for SEO. An explicitly configured `SITE_URL` takes precedence. After making a custom domain primary, trigger a production rebuild to update canonical URLs and the sitemap.

## Content

- `src/content.js`: Italian/English copy and actual business contact information.
- `src/routes.js`: matching page routes and production origin validation.
- `src/templates.js`: shared header, footer, page layouts, and dialogs.
- `src/dogs.js`: ten **fictional demonstration profiles**, explicitly requested by the user. Each has a name, coat, birth year, pedigree flag and test flag. The visible page labels these records as examples. Replace with verified records before presenting them as actual breeding dogs. No individual health-test names are displayed.
- `src/style.css`: responsive styles.
- `src/main.js`: navigation, WhatsApp composer, coat filter, gallery lightbox.
- `scripts/generate.mjs`: writes all ten HTML files before dev/build. Generated routes are ignored; edit the source templates rather than generated HTML.

General business facts and contact details were supplied by the user. The October 2026 litter is an enquiry invitation; confirm current availability with Natascia. The original source website remains linked in structured data under its existing URL.

All displayed photographs were generated for the design and labelled as illustrative. They do not depict the breeder’s actual dogs. `public/images/cocker-portraits.webp` is a 5×2 contact sheet; each demonstration profile uses one distinct cell, cropped in CSS without downloading ten separate files. Replace these images with owner-supplied photographs when available. JPG versions of the hero and puppy photographs support social previews.

The contact composer opens a message addressed to Natascia’s supplied WhatsApp number; visitors must send it in WhatsApp themselves. The website stores no form data and uses no analytics or marketing cookies. Telephone and email actions use the supplied contact details.

## Verify

```sh
# Only needed if neither system Chromium nor a Playwright browser is installed:
npx playwright install chromium
npm test
```

The runner builds with a reserved example domain and starts its own production preview on port 4173. Twenty-two browser checks across desktop and mobile cover all ten routes, fonts, margins, layouts at 360–1440 pixels, images, metadata, canonical URLs, language pairs, sitemap and internal links, the ten demonstration dog records and coat filtering, keyboard gallery controls, FAQs, WhatsApp form validation and encoding, and privacy controls. WhatsApp navigation is intercepted; no real message is sent.

Run `npm run build` after testing if you want to replace the ignored local test output with a build for your own domain.
