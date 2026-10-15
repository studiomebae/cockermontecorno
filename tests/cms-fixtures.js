import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
export async function cmsFixture(){const tree={};async function walk(directory){for(const ent of await readdir(directory,{withFileTypes:true})){const path=join(directory,ent.name);if(ent.isDirectory())await walk(path);else if(ent.name.endsWith('.json')){let node=tree;const parts=path.split('/');for(const part of parts.slice(0,-1))node=node[part]||(node[part]={});node[parts.at(-1)]={path,content:await readFile(path,'utf8')};}}}await walk('content');return tree;}
export async function openMemoryEditor(page,path=''){
 const tree=await cmsFixture();
 await page.addInitScript(data=>{window.repoFiles=data;},tree);
 await page.route('**/admin/config.json',async route=>{const config=JSON.parse(await readFile('public/admin/config.json','utf8'));config.backend={name:'test-repo',login:false};await route.fulfill({json:config});});
 await page.goto('/admin/'+path);
 return tree;
}
