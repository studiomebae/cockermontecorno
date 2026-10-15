import '@fontsource/inter-tight/latin-400.css';
import '@fontsource/inter-tight/latin-500.css';
import '@fontsource/inter-tight/latin-600.css';
import '@fontsource/source-serif-4/latin-400.css';
import '@fontsource/source-serif-4/latin-400-italic.css';
import './style.css';
const menuButton=document.querySelector('.menu-button');
const mobileNav=document.querySelector('#mobile-nav');
function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{const expanded=menuButton.getAttribute('aria-expanded')==='true';mobileNav.hidden=expanded;menuButton.setAttribute('aria-expanded',String(!expanded));});
mobileNav.querySelectorAll('a,button').forEach(a=>a.addEventListener('click',closeMenu));
window.matchMedia('(min-width: 1101px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const contactDialog=document.querySelector('#contact-dialog');
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{
 const select=document.querySelector('#topic');
 if(button.dataset.topic!==undefined)select.selectedIndex=Number(button.dataset.topic);
 contactDialog.showModal();
}));
document.querySelector('[data-privacy]').addEventListener('click',()=>document.querySelector('#privacy-dialog').showModal());
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
});
const form=document.querySelector('#enquiry-form');
form.addEventListener('submit',event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const data=new FormData(form),en=document.documentElement.lang==='en';
 const name=String(data.get('name')).trim(),message=String(data.get('message')).trim();
 if(!name||!message){const input=!name?form.elements.name:form.elements.message;input.setCustomValidity(en?'Please enter more than spaces.':'Inserisci un testo, non solo spazi.');input.reportValidity();return;}
 const contactName=document.body.dataset.contactName;
 const text=en?`Hello ${contactName}! I’m ${name}.\n${data.get('topic')}\n\n${message}`:`Ciao ${contactName}! Sono ${name}.\n${data.get('topic')}\n\n${message}`;
 const url=`https://wa.me/${document.body.dataset.whatsapp}?text=${encodeURIComponent(text)}`;
 document.querySelector('#whatsapp-link').href=url;
 document.querySelector('.message-ready').hidden=false;form.hidden=true;
 window.open(url,'_blank','noopener,noreferrer');
});
form.querySelectorAll('input,textarea').forEach(input=>input.addEventListener('input',()=>input.setCustomValidity('')));
contactDialog.addEventListener('close',()=>{form.hidden=false;document.querySelector('.message-ready').hidden=true;});
const coatFilter=document.querySelector('#coat-filter');
if(coatFilter)coatFilter.addEventListener('change',()=>{
 const cards=[...document.querySelectorAll('.dog-card')];
 cards.forEach(card=>{card.hidden=coatFilter.value!=='all'&&card.dataset.coat!==coatFilter.value;});
 document.querySelector('#dog-count').textContent=String(cards.filter(card=>!card.hidden).length);
});
const galleryDialog=document.querySelector('#gallery-dialog');
if(galleryDialog){
 const buttons=[...document.querySelectorAll('[data-gallery-index]')];
 const image=document.querySelector('#lightbox-image');let index=0;
 function show(next){
  index=(next+buttons.length)%buttons.length;
  const thumbnail=buttons[index].querySelector('img');
  image.src=thumbnail.src;image.alt=thumbnail.alt;
  document.querySelector('#lightbox-caption').textContent=buttons[index].closest('figure').querySelector('figcaption span').textContent;
  document.querySelector('#lightbox-count').textContent=`${index+1} / ${buttons.length}`;
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{show(i);galleryDialog.showModal();}));
 galleryDialog.querySelector('.lightbox-prev').addEventListener('click',()=>show(index-1));
 galleryDialog.querySelector('.lightbox-next').addEventListener('click',()=>show(index+1));
 galleryDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}});
}
