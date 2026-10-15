(async()=>{
 try{
  const response=await fetch('/admin/config.json',{cache:'no-store'});if(!response.ok)throw new Error('Configurazione non disponibile');
  const config=await response.json();
  const previewResponse=await fetch('/admin/preview-settings.json',{cache:'no-store'});
  const presentation=previewResponse.ok?await previewResponse.json():{photos:{},business:{name:'Allevamento Cocker Montecorno'}};
  const CMS=window.CMS,h=window.h;
  CMS.registerPreviewStyle('/admin/preview.css');
  function asset(getAsset,path){if(!path)return '';try{return String(getAsset(path)||path);}catch{return path;}}
  function pair(value){return value&&typeof value==='object'?`${value.line1||''}\n${value.line2||''}`:value;}
  function pagePreview(key){return function Preview({entry,getAsset}){
   const data=entry.get('data').toJS();
   const title=pair(data[`${key==='home'?'hero':key}Title`])||data.name||data.seo?.title||'Anteprima';
   const image=data.image||(key==='puppies'?presentation.photos.puppies?.src:key==='story'?presentation.photos.portrait?.src:presentation.photos.hero?.src);
   const nodes=[h('div',{className:'preview-brand',key:'brand'},presentation.business.name),h('h1',{style:{whiteSpace:'pre-line'},key:'title'},title)];
   if(image)nodes.push(h('img',{src:asset(getAsset,image),alt:'',key:'image'}));
   if(key==='dog-records'){
    nodes.push(h('div',{className:'specs',key:'specs'},h('p',{},`Mantello: ${data.coat||'—'}`),h('p',{},`Anno di nascita: ${data.born||'—'}`),h('p',{},`Pedigree: ${data.pedigree?'✓':'—'} · Test: ${data.tests?'✓':'—'}`)));
    if(data.illustrative)nodes.push(h('p',{className:'demo',key:'demo'},'Scheda dimostrativa'));
   }else if(key==='gallery-photos'){
    nodes.push(h('p',{key:'it'},data.captionIt),h('p',{key:'en'},data.captionEn));
   }else{
    const sections={home:['homeIntroTitle','homeIntro','worldTitle','worldNote','homePuppyTitle','homePuppyText'],puppies:['puppiesIntro','litter','colours','availability','careTitle','careText','europeTitle','europeText'],story:['storyIntro','storyFirstTitle','storyFirst','storySecond','storyQuote','storyEnd'],gallery:['galleryIntro','galleryNote'],dogs:['dogsIntro','demoNote']}[key]||[];
    for(const field of sections){if(data[field])nodes.push(h(/Title$|^litter$/.test(field)?'h2':'p',{key:field},pair(data[field])));}
    if(data.checks)nodes.push(h('ul',{key:'checks'},...data.checks.map((v,i)=>h('li',{key:i},v))));
    if(data.faqs)for(const [i,item] of data.faqs.entries())nodes.push(h('h2',{key:'q'+i},item.question),h('p',{key:'a'+i},item.answer));
    if(key==='settings')for(const [name,photo] of Object.entries(data.photos||{}))nodes.push(h('h2',{key:name},({hero:'Copertina',puppies:'Cuccioli',portrait:'Storia'})[name]),h('img',{key:name+'img',src:asset(getAsset,photo.src),alt:photo.altIt||''}));
    if(key==='common'){for(const [field,text] of Object.entries(data.contactSection||{}))if(['contactTitle','contactText','location'].includes(field))nodes.push(h(field==='contactTitle'?'h2':'p',{key:field},text));}
   }
   if(data.seo)nodes.push(h('div',{className:'seo',key:'seo'},h('h3',{},'Anteprima ricerca'),h('strong',{},data.seo.title),h('p',{},data.seo.description)));
   return h('article',{className:'preview'},...nodes);
  };}
  for(const collection of config.collections){CMS.registerPreviewTemplate(collection.name,pagePreview(collection.name));for(const file of collection.files||[])CMS.registerPreviewTemplate(file.name,pagePreview(collection.name));}
  CMS.registerEventListener({name:'preSave',handler:({entry})=>{
   const collection=config.collections.find(c=>c.name===entry.get('collection'));
   const definition=collection?.files?.find(file=>file.name===entry.get('slug'))||collection;
   const data=entry.get('data').toJS();
   const validatePhotos=(fields,values)=>{for(const field of fields||[]){const value=values[field.name];if(field.widget==='image'&&typeof value==='string'&&value&&(!/^\/images\/[^?#%\\\u0000-\u001f]+\.(jpe?g|png|webp|avif|gif)$/i.test(value)||value.split('/').some(part=>part==='..'||part==='.')))throw new Error('Usa una foto JPG, PNG, WebP, AVIF o GIF caricata nella libreria immagini.');if(field.widget==='object'&&value)validatePhotos(field.fields,value);}};
   validatePhotos(definition?.fields,data);
   if(collection?.name==='dog-records'&&!data.illustrative&&!data.image)throw new Error('Carica una fotografia reale prima di disattivare Scheda dimostrativa.');
  }});
  CMS.init({config});
 }catch(error){console.error('CMS:',error.message);document.querySelector('#cms-load-error').hidden=false;}
})();
