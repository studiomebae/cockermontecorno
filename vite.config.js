import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {pages} from './src/routes.js';
const run=promisify(execFile);
const input=Object.fromEntries(pages.flatMap(p=>Object.entries(p.paths).map(([lang,path])=>[`${p.key}-${lang}`,resolve('.'+path+'index.html')])));
function editableContent(){return {name:'editable-content',configureServer(server){
 server.middlewares.use((req,res,next)=>{if(req.url?.split('?')[0]==='/admin/'||req.url?.split('?')[0]==='/admin')req.url=req.url.replace(/^\/admin\/?/,'/admin/index.html');next();});
 const directory=resolve('content')+'/';server.watcher.add(directory);let timer,running=false,again=false;
 const regenerate=async()=>{if(running){again=true;return;}running=true;try{await run(process.execPath,['scripts/generate.mjs']);server.ws.send({type:'full-reload'});}catch(error){server.config.logger.error(error.stderr||error.message);}finally{running=false;if(again){again=false;regenerate();}}};
 const listener=(event,file)=>{if(['add','change','unlink'].includes(event)&&file.startsWith(directory)&&file.endsWith('.json')){clearTimeout(timer);timer=setTimeout(regenerate,120);}};
 server.watcher.on('all',listener);server.httpServer?.on('close',()=>{clearTimeout(timer);server.watcher.off('all',listener);});
}};}
export default defineConfig({appType:'mpa',plugins:[editableContent()],server:{host:'0.0.0.0',port:5173},build:{rollupOptions:{input}}});
