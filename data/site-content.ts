import { buildMapsQueryUrl } from "@/lib/utils";

export type Couple = {
  partnerOne: string;
  partnerTwo: string;
};

export type NavigationItem = {
  label: string;
  href: `#${string}`;
};

export type IntroContent = {
  sceneEyebrow: string;
  sceneTitle: string;
  sceneDescription: string;
  skipLabel: string;
  closedHint: string;
  closedDescription: string;
  openHint: string;
  openDescription: string;
  enterLabel: string;
  letter: {
    eyebrow: string;
    title: string;
    body: string;
    signature: string;
  };
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: {
    label: string;
    href: `#${string}`;
  };
  secondaryCta: {
    label: string;
    href: `#${string}`;
  };
  note: string;
  summaryTitle: string;
  summaryDetails: Array<{
    label: string;
    value: string;
  }>;
  quoteEyebrow: string;
  quote: string;
  quoteNote: string;
};

export type CeremonyContent = {
  eyebrow: string;
  title: string;
  description: string;
  dateCard: {
    weekday: string;
    day: string;
    month: string;
    year: string;
  };
  details: Array<{
    label: string;
    value: string;
  }>;
  note: string;
};

export type ReceptionContent = {
  eyebrow: string;
  title: string;
  description: string;
  venueLabel: string;
  venue: string;
  venueDescription: string;
  addressLabel: string;
  address: string;
  logisticsNote: string;
  mapLabel: string;
  mapUrl: string;
};

type BaseGiftOption = {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  note: string;
};

export type GiftOption =
  | (BaseGiftOption & {
      key: "iban";
      beneficiaryLabel: string;
      beneficiary: string;
      valueLabel: string;
      value: string;
      placeholder: string;
      copyLabel: string;
    })
  | (BaseGiftOption & {
      key: "registry";
      linkLabel: string;
      linkDescription: string;
      href: string;
      placeholder: string;
      ctaLabel: string;
    });

export type GiftContent = {
  eyebrow: string;
  title: string;
  description: string;
  defaultOption: GiftOption["key"];
  copyFeedbackSuccess: string;
  copyFeedbackError: string;
  options: GiftOption[];
};

export type FinaleContent = {
  eyebrow: string;
  title: string;
  description: string;
  signature: string;
};

export const siteContent = {
  couple: {
    partnerOne: "Valentina",
    partnerTwo: "Riccardo",
  } satisfies Couple,
  navigation: [
    { label: "Inizio", href: "#hero" },
    { label: "Cerimonia", href: "#cerimonia" },
    { label: "Ricevimento", href: "#ricevimento" },
    { label: "Regalo", href: "#regalo" },
    { label: "Finale", href: "#finale" },
  ] satisfies NavigationItem[],
  intro: {
    sceneEyebrow: "Una promessa che mette radici",
    sceneTitle: "Ogni storia che conta inizia con un gesto da aprire.",
    sceneDescription:
      "Abbiamo immaginato questo invito come si immagina un albero: con radici profonde, una crescita silenziosa e la luce che accompagna ogni nuova stagione.",
    skipLabel: "Salta l'introduzione",
    closedHint: "Tocca la lettera",
    closedDescription:
      "Un invito da aprire con calma, pensato per accompagnarti nel nostro giorno.",
    openHint: "La lettera si apre",
    openDescription:
      "Quando sei pronta o pronto, entra nel sito e scorri tutti i dettagli della giornata.",
    enterLabel: "Entra nel nostro giorno",
    letter: {
      eyebrow: "22 maggio 2027",
      title: "Ci ritroveremo per dire si, con voi accanto.",
      body:
        "Ci sono legami che crescono piano, stagione dopo stagione, finche trovano una forma capace di chiamarsi casa. Il 22 maggio 2027 celebreremo il nostro si: una giornata fatta di luce, presenza e tempo condiviso.",
      signature: "Valentina e Riccardo",
    },
  } satisfies IntroContent,
  hero: {
    eyebrow: "Valentina e Riccardo",
    title: "Dove le radici incontrano il futuro.",
    description:
      "Abbiamo pensato questo giorno come un albero che cresce: saldo nelle sue origini, aperto alla luce, rivolto verso cio che verra. Qui trovate i dettagli essenziali per accompagnarci con la stessa cura con cui lo stiamo preparando.",
    primaryCta: {
      label: "Scopri il programma",
      href: "#cerimonia",
    },
    secondaryCta: {
      label: "Vai al ricevimento",
      href: "#ricevimento",
    },
    note:
      "Una pagina unica, semplice da consultare e pensata soprattutto per il mobile, per avere tutto con voi in ogni momento.",
    summaryTitle: "Sabato 22 maggio 2027",
    summaryDetails: [
      { label: "Cerimonia", value: "Ore 15:30" },
      { label: "Luogo", value: "Chiesa di S. Stefano a Segrate" },
      { label: "Ricevimento", value: "Fondaco dei Mercanti" },
      { label: "Atmosfera", value: "Elegante, luminosa, essenziale" },
    ],
    quoteEyebrow: "Il tono della giornata",
    quote:
      "Un giorno costruito con misura, luce morbida e dettagli che sanno restare.",
    quoteNote:
      "Vogliamo accogliervi in un ritmo sobrio e pieno, dove ogni momento abbia spazio per essere vissuto davvero.",
  } satisfies HeroContent,
  ceremony: {
    eyebrow: "Cerimonia",
    title: "L'inizio del nostro giorno.",
    description:
      "Ci incontreremo nel pomeriggio, in una chiesa raccolta e luminosa, per dare voce a una promessa che da tempo cresce con noi.",
    dateCard: {
      weekday: "Sabato",
      day: "22",
      month: "Maggio",
      year: "2027",
    },
    details: [
      { label: "Data", value: "22 maggio 2027" },
      { label: "Ora", value: "15:30" },
      { label: "Luogo", value: "Chiesa di S. Stefano a Segrate" },
      {
        label: "Tono",
        value: "Un rito intimo, essenziale e pieno di luce.",
      },
    ],
    note:
      "Vi consigliamo di arrivare con qualche minuto di anticipo, per iniziare insieme con calma e lasciarci guidare dal ritmo della cerimonia.",
  } satisfies CeremonyContent,
  reception: {
    eyebrow: "Ricevimento",
    title: "La festa continua al Fondaco dei Mercanti.",
    description:
      "Dopo la cerimonia ci sposteremo per condividere la sera tra brindisi, tavola e musica, in un luogo pensato per prolungare la bellezza del giorno con naturalezza.",
    venueLabel: "Secondo capitolo",
    venue: "Fondaco dei Mercanti",
    venueDescription:
      "Un contesto elegante e conviviale, dove il ricevimento prende il suo tempo e la giornata puo aprirsi alla festa.",
    addressLabel: "Indirizzo completo",
    address: "In aggiornamento. Aggiungeremo qui il riferimento definitivo appena confermato.",
    logisticsNote:
      "Troverete presto anche il punto mappa e un'eventuale nota logistica utile per raggiungerci con facilita.",
    mapLabel: "Apri la mappa",
    mapUrl: buildMapsQueryUrl("Fondaco dei Mercanti"),
  } satisfies ReceptionContent,
  gift: {
    eyebrow: "Un pensiero per noi",
    title: "La vostra presenza e gia un dono.",
    description:
      "Se desiderate accompagnarci con un gesto, abbiamo predisposto due modalita semplici e discrete. Scegliete quella che sentite piu vostra.",
    defaultOption: "iban",
    copyFeedbackSuccess: "IBAN copiato negli appunti.",
    copyFeedbackError: "Impossibile copiare ora. Riprova tra poco.",
    options: [
      {
        key: "iban",
        label: "Bonifico",
        eyebrow: "Con delicatezza",
        title: "Un contributo al nostro viaggio insieme",
        description:
          "Per chi preferisce questa modalita, qui troverete l'IBAN dedicato. Il tono resta semplice: un gesto discreto, pensato con gratitudine.",
        note:
          "Aggiornate questo valore nel file dati appena sara disponibile l'IBAN definitivo.",
        beneficiaryLabel: "Intestazione",
        beneficiary: "Valentina e Riccardo",
        valueLabel: "IBAN",
        value: "",
        placeholder: "Inserire qui l'IBAN definitivo",
        copyLabel: "Copia IBAN",
      },
      {
        key: "registry",
        label: "Lista nozze",
        eyebrow: "Per una scelta guidata",
        title: "Una lista nozze da consultare online",
        description:
          "Se preferite una selezione gia costruita, qui comparira il link dedicato alla lista nozze.",
        note:
          "Anche questo collegamento puo essere aggiornato rapidamente dal file dati centrale.",
        linkLabel: "Link dedicato",
        linkDescription: "Apri la lista nozze online.",
        href: "",
        placeholder: "Il link alla lista nozze verra aggiunto qui a breve.",
        ctaLabel: "Link in arrivo",
      },
    ],
  } satisfies GiftContent,
  finale: {
    eyebrow: "Con affetto",
    title: "Grazie per essere parte di queste radici.",
    description:
      "Ogni presenza, ogni sguardo e ogni voce renderanno questo giorno piu pieno. Non vediamo l'ora di viverlo con voi, con la calma e la gioia delle cose che restano.",
    signature: "22 maggio 2027",
  } satisfies FinaleContent,
};
