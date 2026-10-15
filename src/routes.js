export const pages = [
  { key:'home', paths:{it:'/',en:'/en/'} },
  { key:'puppies', paths:{it:'/cuccioli/',en:'/en/puppies/'} },
  { key:'gallery', paths:{it:'/galleria/',en:'/en/gallery/'} },
  { key:'story', paths:{it:'/storia/',en:'/en/our-story/'} },
  { key:'dogs', paths:{it:'/i-nostri-cani/',en:'/en/our-dogs/'} },
  { key:'champions', paths:{it:'/campioni/',en:'/en/champions/'} },
  { key:'retired', paths:{it:'/cani-ritirati/',en:'/en/retired-dogs/'} },
  { key:'foster', paths:{it:'/affido/',en:'/en/family-placements/'} },
];
export const menuPages=['home','story','dogs','champions','retired','puppies','foster','gallery'];
export const pathFor=(key,lang)=>pages.find(p=>p.key===key).paths[lang];
export function siteOrigin(){
 const value=process.env.SITE_URL?.replace(/\/$/,'')||'';
 if(!value)return '';
 const url=new URL(value);
 if(url.protocol!=='https:'||url.origin!==value)throw new Error('SITE_URL must be an HTTPS origin without a path.');
 return url.origin;
}
