# Deploy ufficiale — valentinaericcardo.world

Il sito statico React/Vite è servito da Nginx in Docker Compose. Nginx ascolta solo
su `127.0.0.1:8080` della VM Ubuntu. `cloudflared` è un servizio systemd sullo
stesso host e inoltra i nomi pubblici a `http://127.0.0.1:8080`. Tailscale è
separato e serve soltanto per l'accesso amministrativo remoto.

## Build e aggiornamento

Nella directory del repository sulla VM:

```sh
docker compose up -d --build
docker compose ps
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

Installare `cloudflared` come servizio systemd sul server, con la credenziale
del tunnel conservata fuori dal repository. Il dominio deve usare i nameserver
assegnati da Cloudflare. Prima di cambiarli, verificare che gli eventuali
record e-mail esistenti siano presenti nella zona Cloudflare.

## Stato dei contenuti

L'RSVP è ancora una dimostrazione locale: non invia risposte agli sposi. L'IBAN
non è presente. Completare questi due punti prima di usare il sito per
raccogliere conferme o contributi.
