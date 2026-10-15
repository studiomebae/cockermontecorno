import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import {pages} from './src/routes.js';
const input=Object.fromEntries(pages.flatMap(p=>Object.entries(p.paths).map(([lang,path])=>[`${p.key}-${lang}`,resolve('.'+path+'index.html')])));
export default defineConfig({server:{host:'0.0.0.0',port:5173},build:{rollupOptions:{input}}});
