import { test, expect } from '@playwright/test';

test('Italian and English pages contain crawlable content and matching metadata', async ({page,request})=>{
 for(const [path,lang,title,heading] of [['/','it','Allevamento Cocker','Piccole zampe.'],['/en/','en','English Cocker','Little paws.']]) {
  const response=await request.get(path);expect(response.status()).toBe(200);
  const html=await response.text();expect(html).toContain('<h1>');expect(html).toContain(heading);expect(html).toContain('FAQPage');
  await page.goto(path);await expect(page.locator('html')).toHaveAttribute('lang',lang);await expect(page).toHaveTitle(new RegExp(title));
  await expect(page.locator('h1')).toContainText(heading);await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/Grosseto/);
  expect(await page.locator('h1').count()).toBe(1);
  const schemas=await page.locator('script[type="application/ld+json"]').evaluateAll(items=>items.flatMap(el=>JSON.parse(el.textContent)));
  expect(schemas.find(s=>s['@type']==='FAQPage').mainEntity).toHaveLength(6);
 }
});

test('photos load, page has no script errors or overflow at common widths',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/en/']){
  await page.goto(path);await page.evaluate(()=>document.fonts.ready);
  for(const width of [360,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  const photos=page.locator('main img');
  for(const photo of await photos.all()){await photo.scrollIntoViewIfNeeded();await expect.poll(()=>photo.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);}
 }
 expect(errors).toEqual([]);
});

test('section navigation, language switch, and FAQ disclosures work',async({page,isMobile})=>{
 await page.goto('/');
 if(isMobile){await page.getByRole('button',{name:'Apri menu'}).click();await expect(page.locator('#mobile-nav')).toBeVisible();await page.locator('#mobile-nav a[href="#puppies"]').click();await expect(page.locator('#mobile-nav')).toBeHidden();}
 else await page.locator('.desktop-nav a[href="#puppies"]').click();
 await expect(page).toHaveURL(/#puppies$/);
 await page.locator('.language a[lang="en"]').click();await expect(page).toHaveURL(/\/en\/#puppies$/);await expect(page.locator('h1')).toContainText('Little paws.');
 const faq=page.locator('.faq details').first();await faq.locator('summary').click();await expect(faq).toHaveAttribute('open','');await expect(faq.locator('p')).toBeVisible();await faq.locator('summary').click();await expect(faq).not.toHaveAttribute('open','');
 const broken=await page.locator('a[href^="#"]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(href=>!document.getElementById(href.slice(1))));expect(broken).toEqual([]);
});

test('enquiry validates fields and creates a correctly addressed WhatsApp message',async({page,context})=>{
 await context.route('https://wa.me/**',route=>route.fulfill({status:200,body:'Test WhatsApp destination'}));
 await page.goto('/');await page.locator('.puppy-copy [data-contact]').click();
 await expect(page.locator('#contact-dialog')).toBeVisible();
 await page.locator('#enquiry-form button[type="submit"]').click();await expect(page.locator('#enquiry-form')).toBeVisible();await expect(page.locator('.message-ready')).toBeHidden();
 await page.getByLabel('Come ti chiami?').fill('Giulia & Marco');await page.getByLabel('Il tuo messaggio').fill('Vorremmo conoscere i cuccioli. Possiamo venire sabato?');
 const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:'Continua su WhatsApp'}).click();const popup=await popupPromise;
 const url=new URL(await page.locator('#whatsapp-link').getAttribute('href'));
 expect(url.hostname).toBe('wa.me');expect(url.pathname).toBe('/393473351061');expect(url.searchParams.get('text')).toContain('Giulia & Marco');expect(url.searchParams.get('text')).toContain('Possiamo venire sabato?');
 await expect(page.locator('.message-ready')).toBeVisible();await popup.close();await page.keyboard.press('Escape');await expect(page.locator('#contact-dialog')).not.toBeVisible();
 await page.locator('.puppy-copy [data-contact]').click();await expect(page.locator('#enquiry-form')).toBeVisible();
});

test('contact details and privacy dialog are accessible',async({page})=>{
 await page.goto('/en/');await expect(page.locator('a[href="tel:+393473351061"]').first()).toBeAttached();await expect(page.locator('a[href="mailto:allevamentomontecorno@gmail.com"]')).toBeVisible();
 await page.getByRole('button',{name:'Privacy',exact:true}).click();await expect(page.locator('#privacy-dialog')).toBeVisible();await page.locator('#privacy-dialog').getByRole('button',{name:'Close',exact:true}).click();await expect(page.locator('#privacy-dialog')).toBeHidden();
});
