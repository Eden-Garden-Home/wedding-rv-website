# Audit UX — apertura dell'invito

## Ambito

Flusso mobile dalla busta chiusa al primo contenuto dell'invito, verificato nel simulatore iPhone locale.

## Verdetto

La direzione è coerente e memorabile: l'apertura conduce a una schermata che sembra davvero l'interno della stessa busta. Il flusso ha però due attriti importanti: l'invito a toccare il sigillo è poco leggibile e, durante il loader, il contenuto sottostante rimane esposto alle tecnologie assistive.

## Passaggi

1. **Busta chiusa — buona con riserva.** Il sigillo è il naturale punto focale e l'azione è comprensibile, ma “Tocca il sigillo” ha contrasto insufficiente e si sovrappone visivamente al sigillo. “Salta intro” è utile, ma compete con l'effetto cerimoniale.
2. **Apertura — buona.** Il passaggio è morbido e comunica chiaramente la rivelazione. Il sigillo passa però dal centro alla parte alta tramite dissolvenza: è più una trasformazione grafica che un'apertura fisica della busta.
3. **Invito rivelato — molto buona.** Palette, carta, nomi e data rimangono nello stesso mondo visivo. La freccia senza testo è elegante e il movimento aiuta a comprenderla; il contrasto volutamente tenue può renderla poco evidente in alcune condizioni.
4. **Primo scroll — buona.** L'arrivo mostra subito titolo, data e collage, quindi conferma bene che l'utente è entrato nell'invito. Il salto è abbastanza ampio e perde completamente la busta: una piccola sovrapposizione della carta durante lo scroll renderebbe ancora più forte la continuità.

## Priorità consigliate

1. Spostare “Tocca il sigillo” subito sotto il sigillo e aumentarne leggermente contrasto e dimensione, senza trasformarlo in un pulsante.
2. Rendere il contenuto sottostante `inert`/nascosto alle tecnologie assistive finché l'intro è attiva; dopo la chiusura, spostare il focus sull'invito o sulla freccia.
3. Alleggerire la pausa dopo la rivelazione di circa mezzo secondo, mantenendo l'apertura abbastanza lenta da sembrare intenzionale.
4. Conservare la freccia attuale, ma aumentare appena l'opacità minima per evitare che sparisca sul rosa chiaro.

## Limiti

Il controllo accessibilità è basato sulla struttura DOM osservata e sulle schermate. Contrasto numerico, lettura con screen reader reale, navigazione completa da tastiera e comportamento su dispositivi fisici richiedono test dedicati.
