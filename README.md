# Valentina e Riccardo — sito matrimonio

Versione di riferimento: invito con apertura della busta rosa e collage fotografico, selezionata il 12 settembre 2026. Questa repository sostituisce il precedente sito Next.js e contiene il progetto React/Vite scelto.

## Avvio locale

Richiede Node.js 22.12+ e npm.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

Aprire http://127.0.0.1:5173/.

## Verifica e build

```sh
npm run build
npm run test:sites
```

La build statica viene generata in `dist/client`. `vercel.json` configura Vite e questa directory di output. Gli script conservano anche il supporto al formato Sites del progetto originale.

## Codice

- `src/Prototype.tsx`: invito, animazione iniziale e sezioni del sito.
- `src/prototype.css`: stile e animazioni.
- `public/assets/wedding`: fotografie, video, buste e font.
- `src/mobile`: ambiente di anteprima mobile, mantenuto come nella versione selezionata.

RSVP attualmente gestito nello stato locale del browser; nessun invio al server. IBAN da compilare nel codice. Il vecchio sito rimane recuperabile nella cronologia Git.
