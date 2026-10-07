# Deploy ufficiale — valentinaericcardo.world

Il sito e il pannello React/Vite sono serviti da Nginx in Docker Compose. L'API Node
usa SQLite su un volume persistente. Nginx ascolta solo su `127.0.0.1:8080` per
il sito e `127.0.0.1:8081` per il pannello. `cloudflared` resta un servizio
systemd sull'host. Tailscale è separato e serve soltanto per l'accesso remoto.

Questa configurazione è stata pubblicata sulla VM il 27 settembre 2026.
L'aggiornamento del 7 ottobre 2026 aggiunge il tema del bosco, rende esplicita
la lista nozze provvisoria e introduce la migrazione `003_guest_meals.sql` per
le esigenze alimentari e il menù bambino per persona. Gli RSVP precedenti
restano validi; nel pannello il menù appare come «Da indicare» finché l'ospite
non aggiorna la risposta.
Le funzioni e il formato dei CSV sono documentati in [docs/INVITI_NFC.md](docs/INVITI_NFC.md).

## Build e aggiornamento

Sulla VM i file del progetto sono in `/home/wedding-website-prod/wedding-site`.
Prima della prima accensione, creare `.env` sulla VM con
`WEDDING_ADMIN_PASSWORD_HASH=<hash>`. Generare l'hash con
`WEDDING_ADMIN_PASSWORD='<password lunga e unica>' npm run hash:admin-password`
nel repository; in PowerShell impostare prima `$env:WEDDING_ADMIN_PASSWORD`.
Il file `.env` non va in Git e deve essere leggibile solo dall'utenza di deploy.
Trasferire la versione verificata dal repository ufficiale in questa directory,
poi eseguire:

```sh
cd /home/wedding-website-prod/wedding-site
sudo docker compose up -d --build
sudo docker compose ps
curl -fsS http://127.0.0.1:8080/healthz
curl -fsS http://127.0.0.1:8081/healthz
```

La build esegue `npm run build`, `npm run test:sites` e `npm run test:invites`.
Il container API non pubblica porte host; Nginx espone solo le due origini loopback.
`wedding-data` conserva SQLite e `wedding-backups` conserva 14 copie giornaliere.

## Tunnel

Configurare un tunnel Cloudflare per i due nomi pubblici:

| Nome pubblico | Origine |
| --- | --- |
| `valentinaericcardo.world` | `http://127.0.0.1:8080` |
| `www.valentinaericcardo.world` | `http://127.0.0.1:8080` |
| `admin.valentinaericcardo.world` | `http://127.0.0.1:8081` |

Per il nome `admin` è attiva l'applicazione **Cloudflare Access self-hosted**
`Valentina e Riccardo - Admin inviti`, con policy che consente solo
`aleric.machine@gmail.com`. La rotta del tunnel ha **Protect with Access** attivo
e verifica il token di questa applicazione. Una richiesta senza autenticazione
riceve un redirect alla pagina Cloudflare Access; la password applicativa resta
un secondo controllo.

Il tunnel `wedding-rv-production` gira come servizio systemd sulla VM. Il token
è conservato in `/etc/cloudflared/token` con permessi riservati a root, fuori
dal repository. I nameserver del dominio sono `bryce.ns.cloudflare.com` e
`desi.ns.cloudflare.com`. La zona Cloudflare contiene anche i record MX e SPF
di inoltro e-mail. Il certificato Universal SSL è attivo e Cloudflare reindirizza
HTTP a HTTPS.

L'accesso SSH alla VM richiede una chiave pubblica autorizzata; l'accesso SSH
con password è disabilitato. Tailscale è installato ma il servizio è disabilitato
su richiesta degli sposi.

## Stato dei contenuti

L'RSVP di questa versione salva le risposte nel database. L'IBAN non è ancora
presente: la relativa vista continua a mostrare che le coordinate arriveranno.
Prima di distribuire i tag NFC, creare i nuclei reali nel pannello, verificare
nomi e URL esportati e provare almeno un RSVP con un tag di prova. Il backup
giornaliero in volume Docker va affiancato a una copia cifrata esterna alla VM.
