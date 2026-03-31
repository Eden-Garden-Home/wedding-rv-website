# Wedding RV Website

Single-page wedding website per Valentina e Riccardo, costruito con Next.js 16, React 19, TypeScript, Tailwind CSS 4 e Framer Motion.

Il progetto punta a un tono editoriale e premium: palette calda, texture carta, tipografia elegante, animazioni morbide e una intro iniziale a forma di lettera da aprire.

## Panoramica

Il sito e pensato come landing page unica, consultabile soprattutto da mobile, con le informazioni principali del matrimonio raccolte in un solo flusso:

- intro immersiva con lettera animata
- hero section con riepilogo rapido della giornata
- sezione cerimonia
- sezione ricevimento con link mappa
- sezione regalo con switch tra bonifico e lista nozze
- chiusura finale con messaggio degli sposi

L'identita visiva ruota attorno al tema dell'albero: radici, crescita, luce e futuro condiviso.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- `next/font` per il caricamento ottimizzato dei font
- metadata statici in `app/layout.tsx`
- output `standalone` per deploy Node/Docker

## Caratteristiche principali

- Intro cinematic con stato persistito in `sessionStorage`, cosi non viene riproposta a ogni refresh.
- Supporto a `prefers-reduced-motion` per ridurre animazioni invasive.
- Contenuti centralizzati in un singolo file dati.
- Architettura semplice: pagina unica assemblata da sezioni riusabili.
- Deploy facilitato tramite Docker multi-stage.

## Requisiti

- Node.js 22 consigliato
- npm 10+

Non sono richieste variabili ambiente per l'avvio base del progetto.

## Avvio in locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Script disponibili

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Dove modificare i contenuti

Quasi tutto il contenuto editoriale del sito e centralizzato in:

```text
data/site-content.ts
```

Da qui puoi aggiornare:

- nomi degli sposi
- testi introduttivi e finali
- data, ora e dettagli della cerimonia
- location e logistica del ricevimento
- link Google Maps
- IBAN
- link lista nozze
- voci della navigazione

## Checklist prima di andare online

Nel contenuto attuale ci sono alcuni placeholder che conviene completare prima del deploy definitivo:

1. Inserire l'indirizzo completo del ricevimento.
2. Verificare che il link Google Maps punti al luogo esatto.
3. Compilare l'IBAN definitivo.
4. Inserire il link reale della lista nozze, se previsto.
5. Ricontrollare metadata SEO e descrizioni social in `app/layout.tsx`.

## Struttura del progetto

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  ambient-backdrop.tsx
  ceremony-section.tsx
  final-section.tsx
  floating-nav.tsx
  gift-section.tsx
  hero-section.tsx
  intro-letter.tsx
  reception-section.tsx
data/
  site-content.ts
lib/
  utils.ts
public/
  decor/
  textures/
Dockerfile
docker-compose.yml
```

## Note di implementazione

- La homepage e composta in `app/page.tsx` assemblando sezioni pure e contenuto tipizzato.
- I metadata della pagina sono definiti in `app/layout.tsx`.
- I font Google sono gestiti tramite `next/font/google`, quindi vengono ottimizzati dal framework.
- Il progetto usa `output: "standalone"` in `next.config.ts` per una build piu leggera in produzione.

## Docker

### Build immagine

```bash
docker build -t wedding-rv-website .
```

### Avvio con Docker Compose

```bash
docker compose up -d --build
```

Il sito sara disponibile su [http://localhost:3000](http://localhost:3000).

### Stop dei container

```bash
docker compose down
```

## Deploy

Il progetto puo essere pubblicato in due modi semplici:

### 1. Node.js server

```bash
npm install
npm run build
npm run start
```

### 2. Container Docker

Usa il `Dockerfile` incluso. La build finale copia solo i file necessari a runtime grazie all'output standalone di Next.js.

## Qualita e verifica

Prima di aprire o aggiornare una PR:

```bash
npm run lint
npm run typecheck
npm run build
```

## Possibili estensioni

- OG image dedicata per condivisioni WhatsApp e social
- favicon personalizzata del matrimonio
- RSVP o form conferma presenza
- countdown alla data
- gallery fotografica post-evento

## Licenza

Repository privato per uso interno.
