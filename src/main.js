import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import './style.css';
const menuButton=document.querySelector('.menu-button');
const mobileNav=document.querySelector('#mobile-nav');
function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{const expanded=menuButton.getAttribute('aria-expanded')==='true';mobileNav.hidden=expanded;menuButton.setAttribute('aria-expanded',String(!expanded));});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.matchMedia('(min-width: 1001px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
const contactDialog=document.querySelector('#contact-dialog');
document.querySelectorAll('[data-contact]').forEach(b=>b.addEventListener('click',()=>contactDialog.showModal()));
document.querySelector('[data-privacy]').addEventListener('click',()=>document.querySelector('#privacy-dialog').showModal());
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('[data-close]').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
const form=document.querySelector('#enquiry-form');
form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 const data=new FormData(form),en=document.documentElement.lang==='en';
 const name=String(data.get('name')).trim(),message=String(data.get('message')).trim();
 if(!name||!message){const input=!name?form.elements.name:form.elements.message;input.setCustomValidity(en?'Please enter more than spaces.':'Inserisci un testo, non solo spazi.');input.reportValidity();return;}
 const text=en?`Hello Natascia! I’m ${name}.\n${data.get('topic')}\n\n${message}`:`Ciao Natascia! Sono ${name}.\n${data.get('topic')}\n\n${message}`;
 const url=`https://wa.me/393473351061?text=${encodeURIComponent(text)}`;
 const link=document.querySelector('#whatsapp-link');link.href=url;
 document.querySelector('.message-ready').hidden=false;form.hidden=true;
 window.open(url,'_blank','noopener,noreferrer');
});
form.querySelectorAll('input,textarea').forEach(input=>input.addEventListener('input',()=>input.setCustomValidity('')));
contactDialog.addEventListener('close',()=>{form.hidden=false;document.querySelector('.message-ready').hidden=true;});
// Preserve the section when switching languages.
document.querySelectorAll('.language a').forEach(a=>{if(a.getAttribute('aria-current')!=='page')a.addEventListener('click',()=>{a.hash=window.location.hash;});});
