import { writeFile } from 'node:fs/promises';
const origin=process.env.SITE_URL?.replace(/\/$/,'');
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n${origin?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
if(origin) await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${['/','/en/'].map(path=>`<url><loc>${origin}${path}</loc><xhtml:link rel="alternate" hreflang="it" href="${origin}/"/><xhtml:link rel="alternate" hreflang="en" href="${origin}/en/"/></url>`).join('')}</urlset>`);
else console.log('Set SITE_URL to the final HTTPS domain when deploying to generate canonical URLs and sitemap.xml.');
