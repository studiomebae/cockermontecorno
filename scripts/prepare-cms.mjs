import {mkdir,readFile,readdir,copyFile,writeFile} from 'node:fs/promises';
import {collections,settings} from '../cms/data.js';
import {siteOrigin} from '../src/routes.js';
const output=new URL('../public/admin/',import.meta.url);
await mkdir(new URL('vendor/',output),{recursive:true});
const distribution=new URL('../node_modules/decap-cms/dist/',import.meta.url);
for(const file of await readdir(distribution)){
 if(file.endsWith('.decap-cms.js')||file==='decap-cms.js'||file==='decap-cms.js.LICENSE.txt'||file.endsWith('.wasm'))await copyFile(new URL(file,distribution),new URL('vendor/'+file,output));
}
for(const [family,name] of [['inter-tight','inter-tight-latin-400-normal.woff2'],['source-serif-4','source-serif-4-latin-400-normal.woff2']])await copyFile(new URL(`../node_modules/@fontsource/${family}/files/${name}`,import.meta.url),new URL('vendor/'+name,output));
const locale=await readFile(new URL('../node_modules/decap-cms-locales/dist/esm/it/index.js',import.meta.url),'utf8');
await writeFile(new URL('locale-it.js',output),`/* Decap CMS Italian locale, MIT license. */\n(()=>{${locale.replace('export default it;',"window.CMS.registerLocale('it',it);")}\n})();\n`);
await copyFile(new URL('../node_modules/decap-cms-locales/LICENSE',import.meta.url),new URL('vendor/locales-LICENSE.txt',output));
const configureImages=fields=>fields.map(field=>({...field,...(field.widget==='image'?{media_library:{config:{max_file_size:5000000}}}:{}),...(field.fields?{fields:configureImages(field.fields)}:{})}));
const origin=siteOrigin();
const config={load_config_file:false,backend:{name:'github',repo:'studiomebae/cockermontecorno',branch:'main',base_url:'https://api.netlify.com',auth_endpoint:'auth'},locale:'it',publish_mode:'simple',media_folder:'public/images/uploads',public_folder:'/images/uploads',logo_url:'/admin/logo.svg',...(origin?{site_url:origin,display_url:origin}:{}),show_preview_links:false,slug:{encoding:'ascii',clean_accents:true,sanitize_replacement:'-'},collections:collections.map(collection=>({...collection,...(collection.files?{files:collection.files.map(file=>({...file,fields:configureImages(file.fields)}))}:{fields:configureImages(collection.fields)}),editor:{preview:true}}))};
await writeFile(new URL('config.json',output),JSON.stringify(config,null,2)+'\n');
await writeFile(new URL('preview-settings.json',output),JSON.stringify({photos:settings.photos,business:{name:settings.business.name}},null,2)+'\n');
console.log('Prepared self-hosted Decap CMS, Italian locale and editor configuration.');
