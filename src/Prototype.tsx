import { useEffect, useRef, useState } from "react";
import { ArrowTopRightIcon, CheckCircledIcon, CheckIcon, ChevronDownIcon, CopyIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import { BottomSheet, MobileScroll } from "./mobile";

const weddingIban = "";
const locations = {
  church: {
    name: "Chiesa di Santo Stefano",
    address: "Piazza della Chiesa, 8 · Segrate",
    maps: "https://www.google.com/maps/search/?api=1&query=Chiesa+di+Santo+Stefano%2C+Piazza+della+Chiesa+8%2C+Segrate",
  },
  venue: {
    name: "Fondaco dei Mercanti",
    address: "Loc. Mulino, 1 · Via Rovereto · Moscazzano",
    maps: "https://www.google.com/maps/search/?api=1&query=Il+Fondaco+dei+Mercanti%2C+Loc.+Mulino+1%2C+Moscazzano",
  },
};

function TreeDetail({ className }: { className: string }) {
  return <img className={"tree-detail " + className} src="/assets/wedding/tree-etching-v3.webp" alt="" aria-hidden="true" draggable="false" />;
}
function GoldPoints({ className }: { className: string }) {
  return <img className={"gold-points " + className} src="/assets/wedding/gold-points-v3.webp" alt="" aria-hidden="true" draggable="false" />;
}
function MapsLink({ place }: { place: keyof typeof locations }) {
  return <a className="text-link" href={locations[place].maps} target="_blank" rel="noreferrer" aria-label={"Apri " + locations[place].name + " su Google Maps"}>Apri Maps <ArrowTopRightIcon aria-hidden="true" /></a>;
}
function Signature() {
  return <div className="signature" aria-hidden="true"><span>Valentina</span><span>&amp; Riccardo</span></div>;
}

export default function Prototype() {
  const [sheet, setSheet] = useState<"menu" | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [attendance, setAttendance] = useState<"yes" | "no" | null>(null);
  const [ibanCopied, setIbanCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [loaderPhase, setLoaderPhase] = useState<"closed" | "opening" | "hidden">(reducedMotion ? "hidden" : "closed");
  const scrollCueRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const responseRef = useRef<HTMLButtonElement>(null);
  const answerRef = useRef<HTMLButtonElement>(null);
  const introWasShown = useRef(loaderPhase !== "hidden");

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) setLoaderPhase("hidden");
    if (reducedMotion || loaderPhase !== "hidden") videoRef.current?.pause();
    else videoRef.current?.play().catch(() => { /* The paused first frame is a valid autoplay fallback. */ });
  }, [loaderPhase, reducedMotion]);

  useEffect(() => {
    if (loaderPhase === "hidden") {
      if (introWasShown.current) scrollCueRef.current?.focus({ preventScroll: true });
      return;
    }
    const timer = window.setTimeout(() => setLoaderPhase(loaderPhase === "closed" ? "opening" : "hidden"), loaderPhase === "closed" ? 12000 : 1250);
    return () => window.clearTimeout(timer);
  }, [loaderPhase]);

  useEffect(() => {
    if (attendance) responseRef.current?.focus({ preventScroll: true });
    else if (rsvpOpen) answerRef.current?.focus({ preventScroll: true });
  }, [attendance, rsvpOpen]);

  const goTo = (id: string) => {
    const target = document.getElementById(id);
    const scroll = target?.closest<HTMLElement>(".mobile-scroll");
    if (!target || !scroll) return;
    // Scroll only the invitation. scrollIntoView also moves overflow-hidden
    // device ancestors and can expose the runtime's off-screen keyboard.
    const viewport = scroll.getBoundingClientRect();
    const scale = viewport.height / scroll.clientHeight || 1;
    const inset = id === "programma" ? 0 : 62;
    const top = scroll.scrollTop + (target.getBoundingClientRect().top - viewport.top) / scale - inset;
    scroll.scrollTo({ top: Math.max(0, Math.min(top, scroll.scrollHeight - scroll.clientHeight)), behavior: reducedMotion ? "instant" : "smooth" });
  };
  const openRsvp = () => {
    setRsvpOpen(true);
    window.setTimeout(() => goTo("conferma"), 80);
  };
  const copyIban = async () => {
    if (!weddingIban) return;
    try {
      await navigator.clipboard.writeText(weddingIban);
      setIbanCopied(true);
      setCopyError(false);
      window.setTimeout(() => setIbanCopied(false), 1800);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <>
      {loaderPhase !== "hidden" && (
        <div className="invitation-loader" data-phase={loaderPhase} role="dialog" aria-modal="true" aria-label="Apertura dell'invito">
          <img className="envelope-closed" src="/assets/wedding/invitation-envelope-closed.webp" alt="Busta rosa con sigillo in ceralacca V e R" draggable="false" />
          <button type="button" className="seal-trigger" aria-label="Apri l'invito" autoFocus disabled={loaderPhase !== "closed"} onClick={() => setLoaderPhase("opening")} />
          {loaderPhase === "closed" && <p className="loader-hint">Tocca il sigillo</p>}
          <button type="button" className="loader-skip" onClick={() => setLoaderPhase("hidden")}>Salta intro</button>
        </div>
      )}
      <MobileScroll className="app-screen wedding-scroll">
        <main className="wedding-page" aria-label="Matrimonio di Valentina e Riccardo" aria-hidden={loaderPhase !== "hidden"} inert={loaderPhase !== "hidden" ? true : undefined}>
          <section className="invitation-hero" aria-labelledby="couple-names">
            <img className="tree-detail tree-hero" src="/assets/wedding/hero-branch-v3.webp" alt="" aria-hidden="true" draggable="false" />
            <GoldPoints className="points-hero-left" />
            <GoldPoints className="points-hero-right" />
            <button className="hero-menu-button" type="button" onClick={() => setSheet("menu")} aria-label="Apri il menu"><HamburgerMenuIcon /></button>
            <header className="hero-copy">
              <p className="eyebrow">Il nostro giorno</p>
              <h1 id="couple-names" className="signature"><span>Valentina</span><span>&amp; Riccardo</span></h1>
              <p className="wedding-date"><time dateTime="2027-05-22">22 maggio 2027</time><span>Segrate · ore 15:30</span></p>
            </header>
            <section className="media-collage" aria-label="La cerimonia e la festa">
              <img className="tree-detail branch-collage-left" src="/assets/wedding/hero-branch-v3.webp" alt="" aria-hidden="true" draggable="false" />
              <img className="tree-detail branch-collage-top" src="/assets/wedding/hero-branch-v3.webp" alt="" aria-hidden="true" draggable="false" />
              <figure className="photo-print church-photo"><div className="photo-window"><img src="/assets/wedding/church.png" alt="Il campanile della Chiesa di Santo Stefano a Segrate" draggable="false" /></div></figure>
              <figure className="photo-print venue-photo"><div className="photo-window"><video ref={videoRef} src="/assets/wedding/fondaco.mp4" aria-label="Atmosfera del Fondaco dei Mercanti" autoPlay={!reducedMotion && loaderPhase === "hidden"} muted loop playsInline preload="metadata" /></div></figure>
              <figure className="photo-print lights-photo"><div className="photo-window"><img src="/assets/wedding/dancing-lights.png" alt="Luci calde per festeggiare insieme" draggable="false" /></div></figure>
            </section>
            <button ref={scrollCueRef} className="scroll-invitation-cue" type="button" onClick={() => goTo("programma")} aria-label="Scorri verso il basso per accedere alla partecipazione"><ChevronDownIcon aria-hidden="true" /></button>
          </section>

          <section className="day-section" id="programma" aria-labelledby="programma-title">
            <TreeDetail className="tree-program" />
            <GoldPoints className="points-program" />
            <header className="section-heading"><p className="eyebrow">Il programma</p><h2 id="programma-title">Ci vediamo qui.</h2></header>
            <ol className="day-timeline">
              <li><span className="timeline-number" aria-hidden="true">01</span><div><h3><time dateTime="2027-05-22T15:30:00+02:00">15:30</time><span>Il nostro sì</span></h3><p>Chiesa di Santo Stefano<br />Segrate</p><MapsLink place="church" /></div></li>
              <li><span className="timeline-number" aria-hidden="true">02</span><div><h3><span>A seguire</span><span>Brindisi e cena</span></h3><p>Fondaco dei Mercanti</p><MapsLink place="venue" /></div></li>
              <li><span className="timeline-number" aria-hidden="true">03</span><div><h3><span>Fino a tardi</span><span>Musica e festa</span></h3><p>Balliamo insieme<br />sotto le luci.</p></div></li>
            </ol>
          </section>

          <section className="places-section" id="luoghi" aria-label="Indirizzi e indicazioni">
            <details className="location-details">
              <summary>Indirizzi e indicazioni <ChevronDownIcon aria-hidden="true" /></summary>
              <div className="place-list">{(["church", "venue"] as const).map(place => <article key={place}><h3>{locations[place].name}</h3><p>{locations[place].address}</p><MapsLink place={place} /></article>)}</div>
            </details>
          </section>

          <div className="invitation-closing">
            <TreeDetail className="tree-closing" />
            <GoldPoints className="points-closing-left" />
            <GoldPoints className="points-closing-right" />
            <section className="gift-section" id="lista-nozze" aria-labelledby="lista-nozze-title">
              <p className="eyebrow">Il nostro viaggio</p>
              <h2 id="lista-nozze-title">Il regalo più bello<br />è avervi con noi.</h2>
              <p className="gift-copy">Se desiderate contribuire al nostro viaggio di nozze, qui trovate tutte le informazioni.</p>
              <details className="gift-details">
                <summary><span className="text-link">Lista nozze <ArrowTopRightIcon aria-hidden="true" /></span></summary>
                <div className="iban-details">
                  <p className="small-label">Un pensiero per il nostro viaggio</p>
                  <p>{weddingIban ? "Potete utilizzare queste coordinate per il vostro regalo." : "Presto troverete qui le coordinate per contribuire al nostro viaggio di nozze."}</p>
                  {weddingIban && <><span className="small-label">IBAN</span><strong className="iban-value">{weddingIban}</strong><button type="button" className="text-link" onClick={copyIban}>{ibanCopied ? <CheckIcon /> : <CopyIcon />}{ibanCopied ? "IBAN copiato" : "Copia IBAN"}</button></>}
                  {copyError && <p role="alert">Copia non riuscita. Puoi selezionare e copiare le coordinate qui sopra.</p>}
                </div>
              </details>
            </section>
            <section className="final-rsvp" id="conferma" aria-labelledby="rsvp-title">
              <h2 id="rsvp-title">Ci sarete?</h2>
              <p>Fateci sapere se festeggerete con noi.</p>
              {attendance ? <div className="inline-confirmation" role="status">
                <CheckCircledIcon aria-hidden="true" />
                <h3>{attendance === "yes" ? "Che bello, ci sarete!" : "Ci mancherete."}</h3>
                <p>{attendance === "yes" ? "Non vediamo l'ora di festeggiare insieme." : "Grazie per averci fatto sapere."}</p>
                <p className="prototype-note">Anteprima: la risposta non è ancora inviata agli sposi.</p>
                <button ref={responseRef} className="text-link" type="button" onClick={() => { setAttendance(null); setRsvpOpen(true); }}>Modifica risposta</button>
              </div> : rsvpOpen ? <div className="inline-rsvp-actions" aria-label="Scegli la tua risposta">
                <button ref={answerRef} className="primary-action" type="button" onClick={() => setAttendance("yes")}>Sì, ci saremo</button>
                <button className="secondary-action" type="button" onClick={() => setAttendance("no")}>Non possiamo esserci</button>
              </div> : <button className="primary-action" type="button" onClick={openRsvp}>Conferma presenza</button>}
            </section>
            <footer className="invitation-footer"><Signature /><p className="sr-only">Valentina e Riccardo · 22 maggio 2027</p></footer>
          </div>
        </main>
      </MobileScroll>
      <BottomSheet open={sheet === "menu"} onOpenChange={(open) => !open && setSheet(null)} title="Il nostro giorno" snap={0.48}>
        <nav className="sheet-menu" aria-label="Le sezioni dell'invito">
          {[["programma", "Il programma"], ["luoghi", "Come arrivare"], ["lista-nozze", "Lista nozze"]].map(([id, label]) => <button type="button" key={id} onClick={() => { setSheet(null); window.setTimeout(() => goTo(id), 180); }}>{label}<ArrowTopRightIcon aria-hidden="true" /></button>)}
          <button type="button" onClick={() => { setSheet(null); window.setTimeout(openRsvp, 180); }}>Conferma presenza<ArrowTopRightIcon aria-hidden="true" /></button>
        </nav>
      </BottomSheet>
    </>
  );
}
