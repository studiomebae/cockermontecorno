import {test,expect} from '@playwright/test';
import {pages} from '../src/routes.js';

for(const target of pages){
 test(`${target.key}: both languages are indexable, readable and responsive`,async({page,request})=>{
  for(const lang of ['it','en']){
   const path=target.paths[lang];const response=await request.get(path);expect(response.status()).toBe(200);
   const html=await response.text();expect(html).toContain('<h1>');expect(html).toContain('Allevamento Cocker Montecorno');
   await page.goto(path);await page.evaluate(()=>document.fonts.ready);
   await expect(page.locator('html')).toHaveAttribute('lang',lang);await expect(page.locator('h1')).toHaveCount(1);
   expect(await page.locator('body').innerText()).not.toMatch(/podere/i);
   await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/.{65,}/);
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`https://montecorno.example${path}`);
   for(const other of ['it','en'])await expect(page.locator(`link[hreflang="${other}"]`)).toHaveAttribute('href',`https://montecorno.example${target.paths[other]}`);
   const schemas=await page.locator('script[type="application/ld+json"]').evaluateAll(es=>es.flatMap(e=>JSON.parse(e.textContent)));
   expect(schemas.find(s=>s['@type']==='LocalBusiness').name).toBe('Allevamento Cocker Montecorno');
   if(target.key==='puppies')expect(schemas.find(s=>s['@type']==='FAQPage').mainEntity).toHaveLength(3);
   const fonts=await page.evaluate(()=>({body:getComputedStyle(document.body).fontFamily,title:getComputedStyle(document.querySelector('h1')).fontFamily,padding:parseFloat(getComputedStyle(document.querySelector('.wrap')).paddingLeft)}));
   expect(fonts.body).toContain('Inter Tight');expect(fonts.title).toContain('Source Serif 4');expect(fonts.padding).toBeLessThanOrEqual(25);
   for(const width of [360,390,768,1024,1440]){
    await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path} overflow at ${width}px`).toBe(true);
   }
   for(const img of await page.locator('main img:not(#lightbox-image)').all()){
    await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
   }
  }
 });
}

test('navigation opens separate pages and language switching preserves the page',async({page,isMobile})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 if(isMobile){await page.getByRole('button',{name:'Apri menu'}).click();await expect(page.locator('#mobile-nav')).toBeVisible();await page.locator('#mobile-nav a[href="/i-nostri-cani/"]').click();}
 else await page.locator('.header-left a[href="/i-nostri-cani/"]').click();
 await expect(page).toHaveURL(/\/i-nostri-cani\/$/);
 for(const target of pages){
  await page.goto(target.paths.it);await page.locator('.language a[lang="en"]').click();await expect(page).toHaveURL(new RegExp(`${target.paths.en}$`));await expect(page.locator('html')).toHaveAttribute('lang','en');
 }
 expect(errors).toEqual([]);
});

test('ten demonstration dog profiles contain requested fields and coat filtering works',async({page})=>{
 for(const path of ['/i-nostri-cani/','/en/our-dogs/']){
  await page.goto(path);await expect(page.locator('.dog-card')).toHaveCount(10);await expect(page.locator('.demo-note')).toBeVisible();await expect(page.locator('.dog-name h2')).toHaveText(['Miele','Olimpia','Bruno','Nora','Arturo','Bianca','Otto','Adele','Teo','Livia']);
  for(const card of await page.locator('.dog-card').all()){
   await expect(card.locator('dl>div')).toHaveCount(2);await expect(card.locator('dl')).toContainText(/20\d\d/);await expect(card.locator('.dog-checks svg')).toHaveCount(2);
  }
  await page.getByLabel(path.startsWith('/en/')?'Coat':'Mantello',{exact:true}).selectOption('black');await expect(page.locator('.dog-card:visible')).toHaveCount(2);await expect(page.locator('#dog-count')).toHaveText('2');
  await page.locator('#coat-filter').selectOption('golden');await expect(page.locator('.dog-card:visible')).toHaveCount(3);await expect(page.locator('#dog-count')).toHaveText('3');
  await page.locator('#coat-filter').selectOption('all');await expect(page.locator('.dog-card:visible')).toHaveCount(10);
 }
});

test('gallery opens photos, cycles both ways and closes with Escape',async({page})=>{
 await page.goto('/galleria/');await page.locator('[data-gallery-index="0"]').click();await expect(page.locator('#gallery-dialog')).toBeVisible();await expect(page.locator('#lightbox-count')).toHaveText('1 / 3');
 await expect(page.locator('#lightbox-image')).toHaveAttribute('src',/cocker-editorial.webp/);
 await page.getByRole('button',{name:'Foto successiva'}).click();await expect(page.locator('#lightbox-count')).toHaveText('2 / 3');await expect(page.locator('#lightbox-image')).toHaveAttribute('src',/cocker-linen-puppies.webp/);
 await page.keyboard.press('ArrowRight');await expect(page.locator('#lightbox-count')).toHaveText('3 / 3');await page.keyboard.press('ArrowRight');await expect(page.locator('#lightbox-count')).toHaveText('1 / 3');
 await page.getByRole('button',{name:'Foto precedente'}).click();await expect(page.locator('#lightbox-count')).toHaveText('3 / 3');await page.keyboard.press('Escape');await expect(page.locator('#gallery-dialog')).toBeHidden();
 await page.locator('[data-gallery-index="1"]').click();await page.getByRole('button',{name:'Chiudi fotografia'}).click();await expect(page.locator('#gallery-dialog')).toBeHidden();
});

test('puppy FAQ and WhatsApp enquiry validation work',async({page,context})=>{
 await context.route('https://wa.me/**',route=>route.fulfill({status:200,body:'Mock WhatsApp destination'}));
 await page.goto('/cuccioli/');const faq=page.locator('.faq details').first();await faq.locator('summary').click();await expect(faq).toHaveAttribute('open','');await expect(faq.locator('p')).toBeVisible();
 await page.locator('.litter-info [data-contact]').click();await expect(page.locator('#contact-dialog')).toBeVisible();
 await page.locator('#enquiry-form button[type=submit]').click();await expect(page.locator('.message-ready')).toBeHidden();
 await page.getByLabel('Il tuo nome',{exact:true}).fill('Giulia & Marco');await page.getByLabel('Il tuo messaggio',{exact:true}).fill('Vorremmo conoscere i cuccioli. Possiamo venire sabato?');
 const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:'Continua su WhatsApp'}).click();const popup=await popupPromise;
 const url=new URL(await page.locator('#whatsapp-link').getAttribute('href'));expect(url.hostname).toBe('wa.me');expect(url.pathname).toBe('/393473351061');expect(url.searchParams.get('text')).toContain('Giulia & Marco');expect(url.searchParams.get('text')).toContain('Possiamo venire sabato?');
 await expect(page.locator('.message-ready')).toBeVisible();await popup.close();await page.keyboard.press('Escape');await expect(page.locator('#contact-dialog')).toBeHidden();
});

test('all internal links resolve and the sitemap includes all ten pages',async({page,request})=>{
 const paths=new Set(pages.flatMap(p=>Object.values(p.paths)));
 const sitemap=await request.get('/sitemap.xml');expect(sitemap.status()).toBe(200);const xml=await sitemap.text();expect(xml.match(/<loc>/g)).toHaveLength(10);
 const titles=new Set();
 for(const path of paths){
  expect(xml).toContain(`<loc>https://montecorno.example${path}</loc>`);await page.goto(path);titles.add(await page.title());
  const bad=await page.locator('a[href^="/"] , a[href^="#"]').evaluateAll((links,allowed)=>links.map(a=>a.getAttribute('href')).filter(h=>h.startsWith('#')?!document.getElementById(h.slice(1)):!allowed.includes(h)),[...paths]);expect(bad).toEqual([]);
 }
 expect(titles.size).toBe(10);expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://montecorno.example/sitemap.xml');
});

test('contact details and privacy dialog remain available',async({page})=>{
 await page.goto('/en/our-story/');await expect(page.locator('a[href="tel:+393473351061"]')).toBeVisible();await expect(page.locator('a[href="mailto:allevamentomontecorno@gmail.com"]')).toBeVisible();
 await page.getByRole('button',{name:'Privacy',exact:true}).click();await expect(page.locator('#privacy-dialog')).toBeVisible();await page.locator('#privacy-dialog').getByRole('button',{name:'Close',exact:true}).click();await expect(page.locator('#privacy-dialog')).toBeHidden();
});
