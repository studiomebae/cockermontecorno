import {writeFile} from 'node:fs/promises';
import {pages,siteOrigin} from '../src/routes.js';
const origin=siteOrigin();
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n${origin?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
if(origin)await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${pages.flatMap(page=>Object.values(page.paths).map(path=>`<url><loc>${origin}${path}</loc><xhtml:link rel="alternate" hreflang="it" href="${origin}${page.paths.it}"/><xhtml:link rel="alternate" hreflang="en" href="${origin}${page.paths.en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin}${page.paths.it}"/></url>`)).join('')}</urlset>`);
else console.log('Set SITE_URL to the final HTTPS domain to generate absolute canonical URLs and sitemap.xml.');
