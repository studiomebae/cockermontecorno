# Attivazione e consegna del CMS

Il sito include **Decap CMS**, con editor in italiano all’indirizzo `/admin/`. La guida da consegnare al cliente è `/admin/guida.html` sul dominio del sito.

Il codice e i contenuti sono già collegati. Per abilitare l’accesso di produzione serve una configurazione una tantum negli account del proprietario. Non è stata attivata da questa sessione: non è disponibile un accesso al relativo account Netlify.

## 1. Collegamento Netlify e GitHub

- Il progetto Netlify deve pubblicare `studiomebae/cockermontecorno`, branch `main`, usando il `netlify.toml` incluso.
- Invita l’account GitHub del cliente come collaboratore del repository con permesso di scrittura, oppure assegna l’accesso tramite il team dell’organizzazione. Il cliente deve accettare l’invito.
- Se l’organizzazione applica restrizioni alle applicazioni OAuth o SSO, un amministratore deve autorizzare l’app per questo repository.

## 2. Provider OAuth GitHub per Netlify

Segui la documentazione ufficiale del [backend GitHub di Decap](https://decapcms.org/docs/github-backend/), sezione autenticazione tramite Netlify.

1. In GitHub, nelle **Developer settings → OAuth Apps**, crea una OAuth App per questo sito.
2. Come Homepage URL usa l’indirizzo definitivo del sito Netlify o il suo dominio personalizzato.
3. Come **Authorization callback URL** usa `https://api.netlify.com/auth/done`.
4. Nelle impostazioni del progetto Netlify, sezione **OAuth / Authentication providers**, installa il provider GitHub inserendo il Client ID e Client Secret dell’app.
5. Conserva il Client Secret solo nelle impostazioni sicure di Netlify. Non inserirlo nei file del repository, nel browser, nelle variabili pubbliche o in chat.
6. Apri `/admin/` sul dominio effettivo, scegli **Accedi con GitHub** e completa l’autorizzazione.

Il CMS utilizza il backend `github` con l’autenticazione ospitata da Netlify. **Non richiede Netlify Identity o Git Gateway.** Il suo pannello di accesso è pubblico, ma lettura e scrittura sul repository sono autorizzate da GitHub.

Il dominio effettivo viene passato dall’autenticatore a Netlify. Verifica l’accesso dal dominio usato dal cliente; un pannello aperto su localhost non prova che il provider di produzione sia configurato.

## 3. Verifica prima della consegna

- Accedi come cliente e apri Home → Italiano.
- Cambia temporaneamente una breve frase, controlla l’anteprima e pubblica.
- Verifica che venga creato il commit su `main`, che Netlify avvii la build e che la frase cambi sul sito.
- Ripristina la frase iniziale e pubblica di nuovo.
- Carica una foto reale e verifica la sostituzione; rimuovi i dati dimostrativi solo dopo averli verificati.
- Controlla che il cliente possa aggiornare anche l’inglese, aggiungere/nascondere un cane e aggiungere una foto in galleria.

Questa verifica con accesso reale rimane necessaria: i test automatizzati usano un backend in memoria e non attestano l’autorizzazione del cliente o una pubblicazione Netlify reale.

## Consegna al cliente

Invia soltanto:

- il link `DOMINIO/admin/`;
- il link `DOMINIO/admin/guida.html`;
- l’indicazione dell’account GitHub già abilitato.

La guida spiega foto, testi IT/EN, cucciolate, cani, ordine/visibilità, SEO e pubblicazione. Il cliente non deve intervenire sul codice o sulle impostazioni di build. Non condividere password o token.

## Manutenzione

Il CMS è ospitato localmente, con versione fissata in `package-lock.json`; la preparazione copia il bundle e i suoi chunk da `node_modules`. Nessuna dipendenza CDN è necessaria per il pannello. Le foto nuove sono salvate in `public/images/uploads/`.

I campi del CMS sono definiti in `cms/collections.json`; la build legge i dati da `content/`. Il generatore valida campi e immagini, esegue l’escape del testo e aggiorna anche i dati strutturati SEO. Le immagini mancanti o i dati non validi interrompono la build con un messaggio riferito al campo, mantenendo online il precedente deploy riuscito.
