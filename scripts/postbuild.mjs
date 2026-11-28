import {writeFile} from 'node:fs/promises';
import {pages,siteOrigin} from '../src/routes.js';
const origin=siteOrigin();
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n${origin?`Sitemap: ${origin}/sitemap.xml\n`:''}`);
if(origin)await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${pages.flatMap(page=>Object.values(page.paths).map(path=>`<url><loc>${origin}${path}</loc><xhtml:link rel="alternate" hreflang="it" href="${origin}${page.paths.it}"/><xhtml:link rel="alternate" hreflang="en" href="${origin}${page.paths.en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin}${page.paths.it}"/></url>`)).join('')}</urlset>`);
else console.log('Set SITE_URL to the final HTTPS domain to generate absolute canonical URLs and sitemap.xml.');
// llms.txt: riassunto leggibile dagli assistenti AI (GEO), generato dai contenuti del CMS.
import {content,business} from '../src/content.js';
import {pathFor} from '../src/routes.js';
{
 const it=content.it,en=content.en,o=origin||'';
 const l=it.currentLitter,n=it.nextLitter;
 const faq=(c)=>(c.homeFaqs||[]).map(([q,a])=>`### ${q}\n${a}`).join('\n\n');
 const pagesList=(lang,c)=>['home','puppies','dogs','champions','story','foster','gallery','retired'].map(k=>`- [${c.nav[k]}](${o}${pathFor(k,lang)}): ${c.seo[k][1]}`).join('\n');
 const txt=`# ${business.name}

> ${it.seo.home[1]}

Allevamento amatoriale e familiare di Cocker Spaniel Inglesi a ${business.town} (${business.region}, Italia), attivo dal ${business.foundingYear}, riconosciuto ENCI e FCI dal 2010. Referente: ${business.contactName}. Contatto: solo messaggi WhatsApp al ${business.phone} (non risponde alle chiamate), email ${business.email}. Accoglie famiglie da tutta Italia e, quando possibile, dall'estero.

## Cucciolate
- ${l.label}: ${l.bornLabel} ${l.bornPeriod}; ${l.readyLabel} ${l.readyPeriod}. ${l.malesLabel}: ${l.males} ${l.femalesLabel}: ${l.females}
- ${n.label}: ${n.period}. ${n.coloursLabel}: ${n.colours}

## Pagine (italiano)
${pagesList('it',it)}

## Pages (English)
${pagesList('en',en)}

## Domande frequenti
${faq(it)}

## Frequently asked questions
${faq(en)}
`;
 await writeFile('dist/llms.txt',txt);
}
