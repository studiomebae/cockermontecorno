import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile),root=fileURLToPath(new URL('../',import.meta.url));
async function fixture(t){const dir=await mkdtemp(join(tmpdir(),'montecorno-cms-'));t.after(()=>rm(dir,{recursive:true,force:true}));await cp(join(root,'content'),join(dir,'content'),{recursive:true});await (await import('node:fs/promises')).mkdir(join(dir,'output'));return {dir,content:join(dir,'content'),output:join(dir,'output')};}
async function edit(f,path,change){const full=join(f.content,path);const data=JSON.parse(await readFile(full,'utf8'));await writeFile(full,JSON.stringify(change(data)));}
async function generate(f){return run(process.execPath,[join(root,'scripts/generate.mjs')],{cwd:f.output,env:{...process.env,MONTECORNO_CONTENT_ROOT:f.content,SITE_URL:'https://montecorno.example'}});}
const html=(f,path='index.html')=>readFile(join(f.output,path),'utf8');

test('existing content builds ten pages with original business contacts',async t=>{const f=await fixture(t);await generate(f);assert.match(await html(f),/Una vita insieme\./);assert.match(await html(f,'en/index.html'),/A life together\./);assert.match(await html(f),/data-whatsapp="393473351061"/);assert.equal((await html(f,'i-nostri-cani/index.html')).match(/class="dog-card"/g).length,10);});

test('page text and SEO updates are rendered safely as plain text',async t=>{const f=await fixture(t);await edit(f,'pages/home.it.json',data=>{data.heroTitle.line1='Una nuova <storia> & amicizia';data.seo.title='Cocker "Montecorno" & famiglia';data.seo.description='Una descrizione <script>alert(1)</script> con caratteri speciali.';return data;});await generate(f);const it=await html(f);assert.match(it,/Una nuova &lt;storia&gt; &amp; amicizia/);assert.match(it,/<title>Cocker &quot;Montecorno&quot; &amp; famiglia<\/title>/);assert(!it.includes('<script>alert(1)</script>'));assert.match(await html(f,'en/index.html'),/A life together\./);});

test('main photography and both language descriptions can be replaced',async t=>{const f=await fixture(t);await edit(f,'settings.json',data=>{data.photos.hero.src='/images/cocker-portrait.webp';data.photos.hero.altIt='Una fotografia nuova';data.photos.hero.altEn='A new photograph';return data;});await generate(f);const it=await html(f);assert.match(it,/src="\/images\/cocker-portrait.webp" alt="Una fotografia nuova"/);assert.match(await html(f,'en/index.html'),/alt="A new photograph"/);assert.match(it,/property="og:image" content="https:\/\/montecorno.example\/images\/cocker-portrait.webp"/);});

test('dog records support adding, hiding, custom images and negative checkboxes',async t=>{const f=await fixture(t);for(const file of await readdir(join(f.content,'dogs')))await edit(f,'dogs/'+file,data=>({...data,published:false}));await writeFile(join(f.content,'dogs','luna.json'),JSON.stringify({name:'Luna',coat:'orangeWhite',born:2024,pedigree:false,tests:false,image:'/images/cocker-portrait.webp',illustrative:false,published:true,order:0}));await generate(f);const page=await html(f,'i-nostri-cani/index.html');assert.equal(page.match(/class="dog-card"/g).length,1);assert.match(page,/<h2>Luna<\/h2>/);assert.match(page,/dog-photo-custom/);assert.match(page,/aria-label="Non indicato">—/);assert(!page.includes('class="demo-note"'));assert(!page.includes('<h2>Miele</h2>'));});

test('gallery additions, hiding, order and captions use the editable collection',async t=>{const f=await fixture(t);await edit(f,'gallery/foto-1.json',data=>({...data,published:false}));await writeFile(join(f.content,'gallery','nuova.json'),JSON.stringify({name:'Nuova',image:'/images/cocker-portrait.webp',captionIt:'Il nostro nuovo incontro',captionEn:'Our new hello',altIt:'Una foto nuova',altEn:'A new photo',illustrative:false,published:true,order:0}));await generate(f);const it=await html(f,'galleria/index.html');assert.match(it,/data-gallery-index="0" aria-label="Apri fotografia: Il nostro nuovo incontro"/);assert.match(await html(f,'en/gallery/index.html'),/Open photograph: Our new hello/);assert.equal(it.match(/class="gallery-photo"/g).length,3);});

test('phone, WhatsApp, contact name, branding and SEO location follow settings',async t=>{const f=await fixture(t);await edit(f,'settings.json',data=>{Object.assign(data.business,{phone:'+39 333 1234567',whatsapp:'393331234567',contactName:'Elena',town:'Siena',name:'Allevamento Cocker Montecorno',brandTitle:'Montecorno'});return data;});await generate(f);const page=await html(f);assert.match(page,/href="tel:\+393331234567"/);assert.match(page,/data-whatsapp="393331234567" data-contact-name="Elena"/);assert.match(page,/"addressLocality":"Siena"/);});

test('empty published collections render useful empty states',async t=>{const f=await fixture(t);for(const folder of ['dogs','gallery'])for(const file of await readdir(join(f.content,folder)))await edit(f,folder+'/'+file,data=>({...data,published:false}));await generate(f);assert.match(await html(f,'galleria/index.html'),/Nuove fotografie in arrivo/);assert.match(await html(f,'i-nostri-cani/index.html'),/Presto ti presenteremo i nostri cani/);});

test('missing images, invalid records and unverified photo removal stop bad builds',async t=>{
 for(const [file,change,expected] of [
  ['settings.json',d=>{d.photos.hero.src='/images/non-esiste.jpg';return d;},/fotografia non trovata/],
  ['dogs/miele.json',d=>({...d,born:'ieri'}),/numero fuori intervallo/],
  ['dogs/miele.json',d=>({...d,illustrative:false,image:''}),/carica una foto reale/],
  ['pages/home.it.json',d=>{delete d.heroTitle.line1;return d;},/campo mancante/],
 ]){const f=await fixture(t);await edit(f,file,change);await assert.rejects(generate(f),expected);}
});
