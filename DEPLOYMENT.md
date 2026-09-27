# Deploy ufficiale — valentinaericcardo.world

Il sito statico React/Vite è servito da Nginx in Docker Compose. Nginx ascolta solo
su `127.0.0.1:8080` della VM Ubuntu. `cloudflared` è un servizio systemd sullo
stesso host e inoltra i nomi pubblici a `http://127.0.0.1:8080`. Tailscale è
separato e serve soltanto per l'accesso amministrativo remoto.

## Build e aggiornamento

Sulla VM i file del progetto sono in `/home/wedding-website-prod/wedding-site`.
Trasferire la versione verificata dal repository ufficiale in questa directory,
poi eseguire:

```sh
cd /home/wedding-website-prod/wedding-site
sudo docker compose up -d --build
sudo docker compose ps
curl -fsS http://127.0.0.1:8080/healthz
```

La build esegue `npm run build` e `npm run test:sites`. Il container non monta
file di sviluppo e non espone porte pubbliche sulla LAN o su Internet.

## Tunnel

Configurare un tunnel Cloudflare per i due nomi pubblici:

| Nome pubblico | Origine |
| --- | --- |
| `valentinaericcardo.world` | `http://127.0.0.1:8080` |
| `www.valentinaericcardo.world` | `http://127.0.0.1:8080` |

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

L'RSVP è ancora una dimostrazione locale: non invia risposte agli sposi. L'IBAN
non è presente. Completare questi due punti prima di usare il sito per
raccogliere conferme o contributi.
