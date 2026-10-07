# Inviti NFC, RSVP e pannello riservato

## Come funziona

Ogni nucleo ha un codice casuale alfanumerico di 6 caratteri. Il pannello genera un URL come
`https://valentinaericcardo.world/?invito=ABC234`: scrivere l'intero URL come record URL sul tag NFC.
Il codice è una credenziale di accesso all'invito: chi ha il link può leggere i nomi del nucleo e modificare le sue risposte.
Conservare i link con cura e usare **Rigenera codice** se un tag o un link è stato condiviso per errore.
La rigenerazione invalida subito il vecchio URL; il tag NFC va riscritto.

Senza codice, con codice inesistente o con invito disattivato, il sito resta identico ma non mostra nomi o RSVP del nucleo.
Il destinatario appare sulla busta vicino a «Tocca il sigillo» quando il codice è valido.

## Pannello amministratore

Il pannello separato è su `https://admin.valentinaericcardo.world`.
Richiede **Cloudflare Access** davanti al tunnel e una password applicativa. Al suo interno:

- **Panoramica**: nuclei, persone, conferme e attività recenti.
- **Inviti**: crea nuclei, aggiungi/modifica/disattiva persone, modifica il destinatario, copia il link NFC, disattiva o rigenera il codice.
- **RSVP**: consulta lo stato di ciascuna persona e l'ultima risposta.
- **Attività**: eventi recenti e download completo.
- **CSV e NFC**: esporta nuclei con link NFC, persone, RSVP ed eventi; controlla due CSV prima di importarli.

Per uso locale, avviare `npm run dev:api` con `WEDDING_ADMIN_PASSWORD` impostata (almeno 12 caratteri),
`npm run dev -- --host 127.0.0.1 --port 5173`, poi compilare con `npm run build` e aprire
`http://127.0.0.1:8787/admin/`. La password semplice è permessa **solo** nel processo di sviluppo.

## Database e migrazioni

SQLite è la fonte dei dati operativi (`WEDDING_DB_PATH`, di default `./data/wedding.sqlite` in locale,
`/data/wedding.sqlite` nel container). Le migrazioni versionate sono in `server/migrations/` e vengono applicate all'avvio.
Il database usa WAL e chiavi esterne. Le tabelle principali sono:

| Tabella | Scopo |
| --- | --- |
| `households` | ID stabile, codice NFC univoco, destinatario della busta, stato attivo |
| `guests` | ID stabile, nucleo, nome, cognome, ordine, presenza, esigenze alimentari, menù bambino e data della risposta |
| `invitation_events` | Evento, nucleo, codice usato in quel momento, bersaglio, data UTC e chiave di deduplicazione |
| `rsvp_requests` | Chiave di idempotenza e risultato di ogni salvataggio RSVP |
| `admin_sessions` | Sessioni amministrative con token cifrato tramite hash |

Gli RSVP si salvano in una transazione unica per tutte le persone attive del nucleo. Una ritrasmissione
della stessa richiesta restituisce lo stesso risultato senza aggiungere risposte o eventi. Una risposta successiva
con lo stesso link può modificare le presenze e le informazioni per il menù. Ogni persona presente indica
esplicitamente se ha esigenze alimentari e può richiedere il menù bambino. Allergie, intolleranze e scelte
alimentari sono raccolte come nota libera (massimo 500 caratteri) per la persona interessata. Le date nel database sono ISO 8601 in UTC; il pannello le mostra
in ora locale.

## CSV per Excel

I CSV sono UTF-8 con BOM, separatore `;` e fine riga CRLF. Esportare i file dal pannello prima di modificarli.
Quando Excel chiede il tipo delle colonne, trattare `household_id`, `person_id` e `code` come **testo**.
Per l'importazione servono due file completi, con intestazioni:

```text
nuclei.csv: household_id;code;display_name;active
persone.csv: person_id;household_id;first_name;last_name;sort_order;active
```

`nuclei.csv` esportato include anche `nfc_url` per scrivere i tag; questa colonna è ignorata all'importazione.
Una famiglia occupa **una riga** in `nuclei.csv` e **una riga per invitato** in `persone.csv`, tutte con lo stesso
`household_id`. Usare un ID stabile a scelta (lettere, numeri, `_`, `-`, massimo 64 caratteri), per esempio
`rossi-01` e `rossi-01-giulia`. Non cambiare gli ID per rinominare qualcuno: così la risposta RSVP resta associata
alla persona. `active` vale `1` o `0`. `code` può rimanere vuoto per un nucleo nuovo: il server lo genera; per
un nucleo esistente, lasciare il codice esportato. Ogni nucleo del file deve avere almeno una persona attiva.

L'importazione fa **upsert** dei record elencati e non cancella quelli omessi. Per disattivare un nucleo o una
persona, impostare `active=0`. Il pannello controlla intestazioni, ID, collegamenti e codici prima di applicare
una transazione. Dopo l'importazione, esportare di nuovo `nuclei.csv` per ottenere i codici appena creati.

Esempio:

```csv
household_id;code;display_name;active
rossi-01;;Per la famiglia Rossi;1
```

```csv
person_id;household_id;first_name;last_name;sort_order;active
rossi-01-giulia;rossi-01;Giulia;Rossi;0;1
rossi-01-marco;rossi-01;Marco;Rossi;1;1
```

`rsvps.csv` include `dietary_choice` (`none`, `needs`, `unanswered`), `dietary_note` e `child_menu` per ogni persona.
`unanswered` segnala le vecchie risposte per cui il menù non è ancora stato indicato. I CSV `rsvps.csv` ed
`events.csv` sono esportazioni di sola lettura. I nomi e destinatari che iniziano con
caratteri di formula Excel sono rifiutati dall'importazione.

## Eventi e informativa

L'app registra `link_opened`, `envelope_opened`, `section_viewed`, `registry_opened`,
`bank_details_viewed`, `rsvp_opened`, `rsvp_submitted`, `rsvp_modified` e `external_link_clicked`.
Ogni evento ha codice del nucleo (tramite relazione), data UTC e un bersaglio limitato. Link e visite delle
sezioni sono deduplicati per sessione; gli invii RSVP sono registrati dal server solo quando modificano dati.
Non sono salvate digitazioni, coordinate, movimenti del puntatore o IP nel database. L'informativa sintetica
è nell'invito sotto «Privacy e attività dell'invito».

## Backup e ripristino

`wedding-backup` crea una copia SQLite coerente ogni 24 ore nel volume `wedding-backups` e mantiene le ultime
14 copie. Per un backup immediato sulla VM:

```sh
sudo docker compose exec wedding-backup node -e "import('./server/backup.mjs').then(m => m.backupDatabase('/data/wedding.sqlite', '/backups').then(console.log))"
```

Conservare anche copie cifrate **fuori dalla VM** e provare periodicamente il ripristino. Per ripristinare:
fermare `wedding-api` e `wedding-backup`, copiare una copia `.sqlite` verificata sopra `/data/wedding.sqlite`
nel volume `wedding-data`, eliminare i relativi `-wal`/`-shm` solo a servizi fermi, quindi riavviare i servizi.
Il restore va prima provato su una copia di staging. Non inserire database, CSV reali, password o backup in Git.
