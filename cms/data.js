import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {pages} from '../src/routes.js';
export const projectRoot=fileURLToPath(new URL('../',import.meta.url));
export const contentRoot=process.env.MONTECORNO_CONTENT_ROOT?resolve(process.env.MONTECORNO_CONTENT_ROOT):join(projectRoot,'content');
export const collections=JSON.parse(readFileSync(new URL('./collections.json',import.meta.url),'utf8'));
const fail=(path,message)=>{throw new Error(`Contenuto non valido: ${path} — ${message}`);};
function validate(fields,data,path){
 for(const f of fields){const value=data[f.name],p=`${path}.${f.name}`;
  if((value===undefined||value===null||value==='')&&f.required===false)continue;
  if(value===undefined||value===null)fail(p,'campo mancante');
  if(f.widget==='object'){if(typeof value!=='object'||Array.isArray(value))fail(p,'deve essere un oggetto');validate(f.fields,value,p);}
  else if(f.widget==='list'){if(!Array.isArray(value))fail(p,'deve essere un elenco');value.forEach((item,i)=>f.fields?validate(f.fields,item,`${p}[${i}]`):validate([{...f.field,name:'value'}],{value:item},`${p}[${i}]`));}
  else if(f.widget==='boolean'){if(typeof value!=='boolean')fail(p,'deve essere sì/no');}
  else if(f.widget==='number'){if(!Number.isInteger(value)||(f.min!==undefined&&value<f.min)||(f.max!==undefined&&value>f.max))fail(p,'numero fuori intervallo');}
  else if(f.widget==='select'){if(!f.options.some(option=>(typeof option==='string'?option:option.value)===value))fail(p,'opzione non riconosciuta');}
  else if(f.widget!=='hidden'){if(typeof value!=='string'||(!value.trim()&&f.required!==false))fail(p,'testo obbligatorio');if(f.pattern&&!new RegExp(f.pattern[0]).test(value))fail(p,f.pattern[1]);}
  if(f.widget==='image'&&value)validateImage(value,p);
 }
 return data;
}
export function validateImage(value,path){
 if(!/^\/images\/[^?#%\\\u0000-\u001f]+\.(?:jpe?g|png|webp|avif|gif)$/i.test(value)||value.split('/').some(part=>part==='..'||part==='.'))fail(path,'usa una foto JPG, PNG, WebP, AVIF o GIF caricata nella libreria immagini');
 if(!existsSync(join(projectRoot,'public',value)))fail(path,`fotografia non trovata: ${value}`);
}
const parse=relative=>{try{return JSON.parse(readFileSync(join(contentRoot,relative),'utf8'));}catch(error){fail(relative,error.message);}};
export function fileData(file){const definition=collections.flatMap(c=>c.files||[]).find(f=>f.file===file);if(!definition)fail(file,'schema non trovato');return validate(definition.fields,parse(file.replace(/^content\//,'')),file);}
export function folderData(collectionName){const collection=collections.find(c=>c.name===collectionName);const dir=collection.folder.replace(/^content\//,'');return readdirSync(join(contentRoot,dir)).filter(f=>f.endsWith('.json')).map(filename=>{const data=validate(collection.fields,parse(`${dir}/${filename}`),`${dir}/${filename}`);return {...data,_file:filename};}).sort((a,b)=>a.order-b.order||a._file.localeCompare(b._file));}
export const settings=fileData('content/settings.json');
if(!/^[+\d\s().-]{8,30}$/.test(settings.business.phone))fail('settings.business.phone','numero di telefono non valido');
if(settings.business.source&&!/^https:\/\//.test(settings.business.source))fail('settings.business.source','usa un indirizzo HTTPS');
export const coats=JSON.parse(readFileSync(new URL('./coats.json',import.meta.url),'utf8'));
export const allDogs=folderData('dog-records');
for(const dog of allDogs)if(!dog.illustrative&&!dog.image)fail(`dogs/${dog._file}.image`,'carica una foto reale prima di disattivare la scheda dimostrativa');
export const allGallery=folderData('gallery-photos');
export const dogs=allDogs.filter(d=>d.published);
export const photos=allGallery.filter(p=>p.published);
export const content={};
export const seoDetails={};
const pairKeys=new Set(['heroTitle','puppiesTitle','galleryTitle','storyTitle','dogsTitle','championsTitle','retiredTitle','fosterTitle']);
for(const lang of ['it','en']){
 const common=fileData(`content/common.${lang}.json`);
 const c={nav:common.nav,...common.contactSection,...common.enquiry,...common.privacyNotice,...common.interface,seo:{}};
 seoDetails[lang]={};
 for(const {key:page} of pages){
  const data=fileData(`content/pages/${page}.${lang}.json`);
  c.seo[page]=[data.seo.title,data.seo.description];seoDetails[lang][page]=data.seo;
  for(const [key,value] of Object.entries(data)){
   if(key==='seo')continue;
   if(pairKeys.has(key))c[key]=[value.line1,value.line2];
   else if(key==='steps')c[key]=value.map(v=>[v.heading,v.text]);
   else if(key==='faqs')c[key]=value.map(v=>[v.question,v.answer]);
   else if(key==='storyMilestones')c[key]=value.map(v=>[v.year,v.text]);
   else c[key]=value;
  }
 }
 c.heroAlt=settings.photos.hero[lang==='it'?'altIt':'altEn'];
 c.puppyAlt=settings.photos.puppies[lang==='it'?'altIt':'altEn'];
 c.portraitAlt=settings.photos.portrait[lang==='it'?'altIt':'altEn'];
 content[lang]=c;
}
export const business={...settings.business,phoneLink:'+'+settings.business.phone.replace(/\D/g,'')};
export const hasIllustrativePhotos=Object.values(settings.photos).some(p=>p.illustrative)||photos.some(p=>p.illustrative)||dogs.some(d=>d.illustrative);
