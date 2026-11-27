# Passaggio da Netlify a Cloudflare Pages

Obiettivo: nessun limite di crediti, e un CMS dove si lavora in **bozza con anteprima** prima di pubblicare.

## Cosa cambia nel codice (ramo `cloudflare-cms-bozze`)

- **Bozze**: il CMS usa `publish_mode: editorial_workflow`. Ogni salvataggio crea un ramo `cms/...` con una pull request su GitHub. `main`, e quindi il sito online, cambia solo con **Pubblica**.
- **Anteprima**: Cloudflare Pages costruisce un sito di anteprima per ogni ramo di bozza. Il workflow `.github/workflows/cloudflare-preview-status.yml` trasforma il check di Cloudflare in uno stato commit, così nel CMS compare **Vedi anteprima**. Le schede cane aprono `/i-nostri-cani/`, le foto `/galleria/`.
- **Login**: `scripts/prepare-cms.mjs` legge `CMS_AUTH_URL`, cioè l'URL del Worker di autenticazione su Cloudflare. Senza variabile usa ancora il provider Netlify, quindi il sito attuale continua a funzionare durante il passaggio.
- **Intestazioni**: `public/_headers` replica su Cloudflare il `noindex`/`no-store` del pannello. `.node-version` fissa Node 24.
- **Guida cliente**: `/admin/guida.html` spiega bozze, anteprima e pubblicazione.

## 1. Unisci il ramo

Su GitHub apri la pull request `cloudflare-cms-bozze` e uniscila in `main`. Netlify continuerà a funzionare come prima finché non sposti il dominio.

## 2. Crea il progetto Cloudflare Pages

1. Crea un account gratuito su cloudflare.com.
2. **Workers & Pages → Create → Pages → Connect to Git** e collega `studiomebae/cockermontecorno`.
3. Impostazioni di build:
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **Variabili d'ambiente** (Production *e* Preview):
   - `SITE_URL` = `https://allevamentococker.com`
   - `CMS_AUTH_URL` = da aggiungere al punto 4
5. In **Settings → Builds → Branch control** lascia attive le anteprime per tutti i rami non di produzione.

Il sito sarà online su un indirizzo tipo `cockermontecorno.pages.dev`.

## 3. Worker di login (gratis, una volta sola)

1. Apri github.com/sveltia/sveltia-cms-auth e premi **Deploy to Cloudflare Workers**.
2. Copia l'URL del Worker, tipo `https://sveltia-cms-auth.TUONOME.workers.dev`.

## 4. App OAuth su GitHub

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**. Se il repo è dell'organizzazione `studiomebae`, crea l'app dalle impostazioni dell'organizzazione.
   - Homepage URL: `https://allevamentococker.com`
   - Authorization callback URL: `URL-DEL-WORKER/callback`
2. Copia il Client ID e genera un Client Secret.
3. Nel Worker su Cloudflare, **Settings → Variables and Secrets**:
   - `GITHUB_CLIENT_ID` = Client ID
   - `GITHUB_CLIENT_SECRET` = Client Secret (tipo *Secret*)
   - `ALLOWED_DOMAINS` = `allevamentococker.com, cockermontecorno.pages.dev`
4. Nel progetto Pages imposta `CMS_AUTH_URL` = URL del Worker e rilancia il deploy (**Deployments → Retry deployment**).

Il Client Secret resta solo nelle impostazioni del Worker: mai nel codice, in chat o nel browser.

## 5. Collaudo sull'indirizzo `.pages.dev`

1. Apri `https://cockermontecorno.pages.dev/admin/` e accedi con GitHub.
2. Modifica una frase della Home e premi **Salva**: il sito non deve cambiare.
3. Dopo 2–3 minuti premi **Vedi anteprima** e controlla la frase.
4. Imposta lo stato su **Pronto**, poi **Pubblica → Pubblica ora**. Dopo la build la frase compare sul sito.
5. Ripristina la frase originale.

## 6. Accesso per tua mamma

L'account GitHub di tua mamma deve essere collaboratore del repository con permesso **Write**. Se l'organizzazione limita le app OAuth, approva l'app creata al punto 4.

## 7. Sposta il dominio

1. In Pages: **Custom domains → Set up a domain** → `allevamentococker.com` (e `www`).
2. Per il dominio principale (senza `www`) Cloudflare chiede di gestire il DNS: aggiungi il dominio a Cloudflare e cambia i nameserver presso il registrar indicato. Prima copia eventuali record email (MX) esistenti.
3. Quando il sito risponde da Cloudflare, sul progetto Netlify ferma le build (**Build settings → Stop builds**) o elimina il sito.

## Note

- Piano gratuito Cloudflare Pages: 500 build al mese. Ogni salvataggio di bozza e ogni pubblicazione è una build.
- Le anteprime `.pages.dev` sono raggiungibili da chi ha il link, ma il canonical punta al dominio vero, quindi per Google restano copie del sito principale. Per renderle private si può aggiungere Cloudflare Access (gratis fino a 50 utenti).
- I test in memoria (`npm test`) girano in modalità di pubblicazione semplice. La configurazione reale delle bozze è verificata dal test di configurazione.
