import {test,expect} from '@playwright/test';
import {openMemoryEditor} from './cms-fixtures.js';

async function publish(page){await page.getByRole('button',{name:'Pubblica',exact:true}).click();await page.getByRole('menuitem',{name:'Pubblica ora',exact:true}).click();await expect(page.getByRole('button',{name:'Pubblicato',exact:true})).toBeVisible();}

test('production admin requires GitHub login and opens the Netlify OAuth provider',async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await context.route('https://api.netlify.com/auth**',route=>route.fulfill({status:200,body:'OAuth destination intercepted for testing'}));
 await page.goto('/admin/');await expect(page).toHaveTitle('Gestione sito | Allevamento Cocker Montecorno');await expect(page.getByRole('button',{name:'Accedi con GitHub'})).toBeVisible();
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
 const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:'Accedi con GitHub'}).click();const popup=await popupPromise;
 const url=new URL(popup.url());expect(url.origin).toBe('https://api.netlify.com');expect(url.pathname).toBe('/auth');expect(url.searchParams.get('provider')).toBe('github');await popup.close();
 expect(errors).toEqual([]);
});

test('client can edit Italian text, preview it and publish without changing English',async({page})=>{
 await openMemoryEditor(page,'#/collections/home/entries/home-it');
 const text='Una nuova storia, scritta dal cliente nel pannello.';
 await page.getByRole('textbox',{name:'Testo di presentazione',exact:true}).fill(text);
 await expect(page.frameLocator('iframe').locator('.preview')).toContainText(text);
 await publish(page);
 const data=await page.evaluate(()=>({it:JSON.parse(window.repoFiles.content.pages['home.it.json'].content),en:JSON.parse(window.repoFiles.content.pages['home.en.json'].content)}));
 expect(data.it.homeIntro).toBe(text);expect(data.en.homeIntro).toContain('We’re Natascia');
});

test('client can update a dog and hide it with a visibility switch',async({page})=>{
 await openMemoryEditor(page,'#/collections/dog-records/entries/miele');
 await page.getByRole('textbox',{name:'Nome',exact:true}).fill('Miele aggiornata');
 await page.getByRole('spinbutton',{name:'Anno di nascita',exact:true}).fill('2023');
 const visibility=page.getByRole('switch',{name:'Mostra sul sito',exact:true});
 await visibility.click();await publish(page);
 const data=await page.evaluate(()=>JSON.parse(window.repoFiles.content.dogs['miele.json'].content));
 expect(data.name).toBe('Miele aggiornata');expect(data.born).toBe(2023);expect(data.published).toBe(false);expect(data.portrait).toBe(0);
});

test('client can manage champions, retired dogs, placements and show results from one record',async({page})=>{
 await openMemoryEditor(page,'#/collections/dog-records/entries/miele');
 await page.getByRole('switch',{name:'Cane ritirato (opzionale)',exact:true}).click();
 await page.getByRole('switch',{name:'Valutiamo l’affido per questo cane (opzionale)',exact:true}).click();
 await page.getByRole('textbox',{name:'Descrizione del cane — Italiano (opzionale)',exact:true}).fill('Una descrizione aggiornata dal cliente.');
 await page.getByRole('textbox',{name:'Gare vinte e riconoscimenti — Italiano (opzionale)',exact:true}).fill('Risultato di prova nel pannello, non pubblicato sul sito reale.');
 await expect(page.frameLocator('iframe').locator('.preview')).toContainText('Una descrizione aggiornata dal cliente.');
 await publish(page);
 const dog=await page.evaluate(()=>JSON.parse(window.repoFiles.content.dogs['miele.json'].content));
 expect(dog.champion).toBe(true);expect(dog.retired).toBe(true);expect(dog.availableForFoster).toBe(true);
 expect(dog.descriptionIt).toContain('aggiornata dal cliente');expect(dog.awardsIt).toContain('Risultato di prova');expect(dog.awardsEn).toBe('');
});

test('client can update the two litter periods and parents in the puppy editor',async({page})=>{
 await openMemoryEditor(page,'#/collections/puppies/entries/puppies-it');
 await page.getByRole('textbox',{name:'Periodo di nascita',exact:true}).fill('Novembre 2026');
 await page.getByRole('textbox',{name:'Periodo pronto per la famiglia',exact:true}).fill('Gennaio 2027');
 await page.getByRole('textbox',{name:'Periodo previsto',exact:true}).fill('Marzo 2027');
 await page.getByRole('textbox',{name:'Nome completo della mamma',exact:true}).fill('Mamma aggiornata');
 await expect(page.frameLocator('iframe').locator('.preview')).toContainText('Marzo 2027');
 await publish(page);
 const litter=await page.evaluate(()=>JSON.parse(window.repoFiles.content.pages['puppies.it.json'].content));
 expect(litter.currentLitter.bornPeriod).toBe('Novembre 2026');expect(litter.currentLitter.readyPeriod).toBe('Gennaio 2027');
 expect(litter.nextLitter.period).toBe('Marzo 2027');expect(litter.nextLitter.mother).toBe('Mamma aggiornata');
});

test('client guide is available and the configuration covers pages, photos, dogs and contacts',async({page,request})=>{
 const config=await (await request.get('/admin/config.json')).json();expect(config.backend.name).toBe('github');expect(config.backend.repo).toBe('studiomebae/cockermontecorno');expect(config.backend.branch).toBe('main');expect(config.locale).toBe('it');expect(config.media_folder).toBe('public/images/uploads');expect(JSON.stringify(config)).not.toMatch(/client_secret|access_token/);
 expect(config.collections.map(c=>c.name)).toEqual(expect.arrayContaining(['settings','dog-records','gallery-photos','home','puppies','gallery','story','dogs','champions','retired','foster','common']));
 for(const key of ['home','puppies','gallery','story','dogs','champions','retired','foster','common'])expect(config.collections.find(c=>c.name===key).files).toHaveLength(2);
 await page.goto('/admin/guida.html');await expect(page.locator('h1')).toContainText('nelle tue mani.');await expect(page.getByRole('heading',{name:'Aggiungere un cane'})).toBeVisible();
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

test('client can upload a photograph and create a bilingual gallery entry',async({page})=>{
 await openMemoryEditor(page,'#/collections/gallery-photos/new');
 await page.getByRole('textbox',{name:'Titolo interno',exact:true}).fill('Una foto del cliente');
 await page.getByRole('textbox',{name:'Didascalia — Italiano',exact:true}).fill('Un pomeriggio insieme');
 await page.getByRole('textbox',{name:'Didascalia — English',exact:true}).fill('An afternoon together');
 await page.getByRole('textbox',{name:'Descrizione della fotografia — Italiano',exact:true}).fill('Un cocker bianco arancio');
 await page.getByRole('textbox',{name:'Descrizione della fotografia — English',exact:true}).fill('An orange and white cocker');
 await page.getByRole('button',{name:"Scegli un'immagine",exact:true}).click();
 const tooLarge=page.waitForEvent('dialog').then(async warning=>{expect(warning.type()).toBe('alert');expect(warning.message()).toContain('5000');await warning.accept();});
 await page.locator('input[type=file]').setInputFiles({name:'foto-troppo-grande.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(5000001)});
 await tooLarge;
 await page.locator('input[type=file]').setInputFiles('public/images/cocker-portrait.webp');
 await page.getByRole('button',{name:'Prendi selezionato',exact:true}).click();
 await publish(page);
 const result=await page.evaluate(()=>({entry:JSON.parse(window.repoFiles.content.gallery['una-foto-del-cliente.json'].content),hasUpload:!!window.repoFiles.public?.images?.uploads?.['cocker-portrait.webp']}));
 expect(result.entry.image).toBe('/images/uploads/cocker-portrait.webp');expect(result.entry.captionIt).toBe('Un pomeriggio insieme');expect(result.entry.captionEn).toBe('An afternoon together');expect(result.entry.published).toBe(true);expect(result.hasUpload).toBe(true);
});
