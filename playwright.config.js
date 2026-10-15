import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: existsSync('/usr/bin/chromium') ? { executablePath:'/usr/bin/chromium', args:['--no-sandbox'] } : {},
  },
  projects: [
    { name:'desktop', testMatch:'site.spec.js', use:{ viewport:{width:1440,height:1000} } },
    { name:'mobile', testMatch:'site.spec.js', use:{ viewport:{width:390,height:844}, isMobile:true, hasTouch:true } },
    { name:'cms', testMatch:'cms.spec.js', use:{ viewport:{width:1440,height:1000} } },
  ],
  webServer: { command:'SITE_URL=https://montecorno.example npm run build && npm run preview -- --port 4173 --strictPort', url:'http://127.0.0.1:4173', reuseExistingServer:false },
});
