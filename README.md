# Podere Montecorno

A responsive Italian and English website for Natascia’s English Cocker Spaniel breeding home in Grosseto, Tuscany. Built with Vite and plain JavaScript, with complete HTML generated before development and production builds so the content is available to search engines without executing JavaScript.

## Develop

Requires Node.js 22.12+ (verified with Node 24).

```sh
npm ci --cache /tmp/montecorno-npm-cache
npm run dev
```

Italian: `/`. English: `/en/`. The default development port is 5173.

## Build and deploy

Set `SITE_URL` to the final public HTTPS origin, without a path, before building:

```sh
SITE_URL=https://your-domain.example npm run build
npm run preview
```

Deploy the `dist/` directory to a static web host. No database, API keys, form service, or server runtime is required. The `/en/` directory must be served as a normal directory index; no SPA fallback is required.

### Netlify

Import `studiomebae/cockermontecorno` from GitHub and select the `main` branch. The included `netlify.toml` sets Node.js 24, the build command, and the `dist` publish directory. No manual build settings are needed.

Netlify's primary site URL (`URL`) is automatically used for canonical URLs, language alternates, social images, and the sitemap. An explicitly configured `SITE_URL` takes precedence. When adding a custom domain, make it the primary domain and trigger a new production build so the SEO URLs update.

With `SITE_URL` set, the build includes absolute canonical and Open Graph URLs, language alternates, and `sitemap.xml`. `robots.txt` is always generated. Without a final domain, the build deliberately omits canonical URLs and the sitemap rather than inventing a production address. Submit the sitemap to Google Search Console after deployment.

## Content and images

- Edit `src/content.js` for Italian and English copy, phone, email, and business facts.
- `scripts/generate.mjs` generates both HTML pages. Generated `index.html` and `en/index.html` are ignored; edit the generator rather than its output.
- `src/style.css` contains the responsive design; fonts and photographs are hosted locally.
- Facts were provided by the owner in the setup conversation, referencing the existing Jimdo website. The October 2026 litter is an enquiry invitation, not a real-time inventory. Update both languages when it changes.
- The two photographs were generated for this design. They are explicitly labelled as illustrative and do not represent Natascia’s own dogs or litters. Replace them with owner-supplied photos in `public/images/` before publication if available, and update image labels and alt text accordingly. The JPG version of the hero is used for social previews.
- Enquiries prepare an encoded message to the supplied WhatsApp number. Visitors must send it themselves in WhatsApp. No data is submitted to or stored by this website. Telephone and email links use the supplied contact details.
- Confirm privacy text and current business information before publishing.

## Verify

```sh
# First-time browser install on machines without system Chromium:
npx playwright install chromium
npm test
```

The test runner builds the site and starts a production preview. It uses `/usr/bin/chromium` when available, otherwise Playwright’s installed browser. Ten checks across desktop and mobile cover static translated content, metadata, structured data, images, script errors, layouts from 360 to 1440 pixels, language and section navigation, FAQs, required enquiry fields, correctly encoded WhatsApp messages, and privacy controls. WhatsApp navigation is intercepted during tests so no real enquiry is sent.
