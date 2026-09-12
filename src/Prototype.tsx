import { useEffect, useRef, useState } from "react";
import {
  CalendarIcon,
  CheckCircledIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CopyIcon,
  Cross1Icon,
  ExternalLinkIcon,
  HamburgerMenuIcon,
  HeartIcon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import { BottomSheet, MobileScroll } from "./mobile";

const weddingIban = "";

const glowDots = [
  [7, 16, 3, -1.2], [22, 8, 2, -3.1], [39, 21, 4, -2.2], [61, 11, 2, -.6], [83, 19, 3, -4.1],
  [14, 35, 2, -2.7], [31, 43, 3, -.9], [51, 33, 2, -3.8], [72, 40, 4, -1.8], [92, 35, 2, -4.7],
  [4, 58, 3, -3.4], [25, 64, 2, -1.5], [43, 55, 3, -4.4], [64, 68, 2, -2.5], [84, 57, 3, -.3],
  [12, 82, 2, -4], [34, 88, 4, -2], [56, 79, 2, -5], [75, 91, 3, -1.1], [95, 77, 2, -3],
] as const;

function BotanicalBranch({ className }: { className: string }) {
  return <span className={`forest-detail ${className}`} aria-hidden="true" />;
}

function GlowCluster({ className }: { className: string }) {
  return (
    <span className={`glow-cluster ${className}`} aria-hidden="true">
      {glowDots.map(([left, top, size, delay], index) => (
        <i
          key={index}
          style={{ left: `${left}%`, top: `${top}%`, width: size + 1, height: size + 1, animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

// Build app-specific screens and flows in this file. The surrounding mobile
// runtime is template-owned and intentionally lives outside this component.
export default function Prototype() {
  const [sheet, setSheet] = useState<"menu" | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [attendance, setAttendance] = useState<"yes" | "no" | null>(null);
  const [ibanCopied, setIbanCopied] = useState(false);
  const [loaderPhase, setLoaderPhase] = useState<"closed" | "opening" | "revealed" | "exiting" | "hidden">(() =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "hidden" : "closed",
  );
  const scrollCueRef = useRef<HTMLButtonElement>(null);
  const introWasShownRef = useRef(loaderPhase !== "hidden");

  useEffect(() => {
    if (loaderPhase === "closed") {
      const autoOpenTimer = window.setTimeout(() => setLoaderPhase("opening"), 12000);
      return () => window.clearTimeout(autoOpenTimer);
    }

    if (loaderPhase === "opening") {
      const revealTimer = window.setTimeout(() => setLoaderPhase("revealed"), 1150);
      return () => window.clearTimeout(revealTimer);
    }

    if (loaderPhase === "revealed") {
      const revealHoldTimer = window.setTimeout(() => setLoaderPhase("exiting"), 900);
      return () => window.clearTimeout(revealHoldTimer);
    }

    if (loaderPhase === "exiting") {
      const exitTimer = window.setTimeout(() => setLoaderPhase("hidden"), 700);
      return () => window.clearTimeout(exitTimer);
    }
  }, [loaderPhase]);

  useEffect(() => {
    if (loaderPhase === "hidden" && introWasShownRef.current) {
      scrollCueRef.current?.focus({ preventScroll: true });
    }
  }, [loaderPhase]);

  const scrollToDetails = () => {
    document.getElementById("dettagli")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openRsvp = () => {
    setRsvpOpen(true);
    window.setTimeout(() => {
      document.getElementById("conferma")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const copyIban = async () => {
    if (!weddingIban) return;
    await navigator.clipboard.writeText(weddingIban);
    setIbanCopied(true);
    window.setTimeout(() => setIbanCopied(false), 1800);
  };

  return (
    <>
      {loaderPhase !== "hidden" && (
        <div
          className="invitation-loader"
          data-phase={loaderPhase}
          role="dialog"
          aria-modal="true"
          aria-label="Apertura dell'invito"
        >
          <img
            className="envelope-state envelope-closed"
            src="/assets/wedding/invitation-envelope-closed.webp"
            alt="Busta rosa con sigillo in ceralacca V e R"
          />
          <img
            className="envelope-state envelope-open"
            src="/assets/wedding/invitation-envelope-open-clean.png"
            alt="Invito di Valentina e Riccardo che emerge dalla busta"
          />
          <span className="envelope-transition-wash" aria-hidden="true" />
          <div className="invitation-name-overlay loader-name-overlay" aria-hidden="true">
            <span>Valentina</span>
            <span>&amp; Riccardo</span>
          </div>
          <button
            type="button"
            className="seal-trigger"
            aria-label="Apri l'invito"
            autoFocus
            onClick={() => loaderPhase === "closed" && setLoaderPhase("opening")}
          />
          <p className="loader-hint">Tocca il sigillo</p>
          <div className="loader-scroll-cue" aria-hidden="true">
            <ChevronDownIcon />
          </div>
          <button type="button" className="loader-skip" onClick={() => setLoaderPhase("exiting")}>
            Salta intro
          </button>
        </div>
      )}

      <MobileScroll className="app-screen wedding-scroll">
        <main
          className="wedding-page"
          aria-label="Matrimonio di Valentina e Riccardo"
          aria-hidden={loaderPhase !== "hidden"}
          inert={loaderPhase !== "hidden" ? true : undefined}
        >
          <section className="invitation-hero" aria-label="Invito aperto di Valentina e Riccardo">
            <img
              src="/assets/wedding/invitation-envelope-open-clean.png"
              alt="Invito di Valentina e Riccardo dentro una busta rosa aperta"
              draggable="false"
            />
            <h1 className="invitation-name-overlay">
              <span>Valentina</span>
              <span>&amp; Riccardo</span>
            </h1>
            <button className="icon-button hero-menu-button" type="button" onClick={() => setSheet("menu")} aria-label="Apri il menu">
              <HamburgerMenuIcon />
            </button>
            <button
              ref={scrollCueRef}
              className="scroll-invitation-cue"
              type="button"
              onClick={scrollToDetails}
              aria-label="Scorri verso il basso per accedere alla partecipazione"
            >
              <ChevronDownIcon aria-hidden="true" />
            </button>
          </section>

          <section className="invitation-card-flow" id="dettagli">
            <header className="story-heading">
              <p>Il nostro giorno</p>
              <h1>Vi aspettiamo<br />per festeggiare insieme</h1>
              <span>22 · 05 · 2027</span>
              <BotanicalBranch className="forest-detail-intro" />
              <GlowCluster className="glow-intro" />
            </header>

            <section className="media-story" aria-label="I luoghi del matrimonio">
              <figure className="story-photo church-story">
                <img src="/assets/wedding/church.png" alt="Chiesa di Segrate Santo Stefano" draggable="false" />
                <figcaption>La cerimonia</figcaption>
              </figure>
              <figure className="story-photo venue-story">
                <video src="/assets/wedding/fondaco.mp4" aria-label="Video del Fondaco dei Mercanti" autoPlay muted loop playsInline preload="metadata" />
                <figcaption>La festa</figcaption>
              </figure>
              <figure className="story-photo lights-story">
                <img src="/assets/wedding/dancing-lights.png" alt="Luci della festa" draggable="false" />
              </figure>
            </section>

            <section className="day-section" id="programma" aria-labelledby="programma-title">
              <BotanicalBranch className="forest-detail-program" />
              <GlowCluster className="glow-program" />
              <div className="section-heading">
                <CalendarIcon />
                <p>Il programma</p>
                <h2 id="programma-title">La nostra giornata</h2>
              </div>
              <ol className="day-timeline">
                <li>
                  <span className="timeline-time">15:30</span>
                  <div><strong>Ci sposiamo!</strong><p>Cerimonia nella Chiesa di Santo Stefano.</p></div>
                </li>
                <li>
                  <span className="timeline-time">A seguire</span>
                  <div><strong>Brindisi e cena</strong><p>Ci spostiamo al Fondaco dei Mercanti.</p></div>
                </li>
                <li>
                  <span className="timeline-time">Fino a tardi</span>
                  <div><strong>Musica e festa</strong><p>Balliamo insieme sotto le luci.</p></div>
                </li>
              </ol>
            </section>

            <section className="places-section" id="luoghi" aria-labelledby="luoghi-title">
              <BotanicalBranch className="forest-detail-places" />
              <GlowCluster className="glow-places" />
              <div className="section-heading">
                <SewingPinIcon />
                <p>Come arrivare</p>
                <h2 id="luoghi-title">I luoghi</h2>
              </div>
              <div className="place-list">
                <article className="place-card">
                  <div><span>15:30</span><h3>Chiesa di Santo Stefano</h3><p>Piazza della Chiesa, 8 · Segrate</p></div>
                  <a href="https://www.google.com/maps/search/?api=1&query=Chiesa+di+Santo+Stefano%2C+Piazza+della+Chiesa+8%2C+Segrate" target="_blank" rel="noreferrer">Apri Maps <ExternalLinkIcon /></a>
                </article>
                <article className="place-card">
                  <div><span>A seguire</span><h3>Il Fondaco dei Mercanti</h3><p>Loc. Mulino, 1 · Via Rovereto · Moscazzano</p></div>
                  <a href="https://www.google.com/maps/search/?api=1&query=Il+Fondaco+dei+Mercanti%2C+Loc.+Mulino+1%2C+Moscazzano" target="_blank" rel="noreferrer">Apri Maps <ExternalLinkIcon /></a>
                </article>
              </div>
            </section>

            <section className="gift-section" id="lista-nozze" aria-labelledby="lista-nozze-title">
              <BotanicalBranch className="forest-detail-gift" />
              <GlowCluster className="glow-gift" />
              <HeartIcon />
              <p className="section-kicker">Lista nozze</p>
              <h2 id="lista-nozze-title">Il regalo più bello<br />è avervi con noi</h2>
              <p className="gift-copy">Se desiderate contribuire al nostro viaggio di nozze, qui troverete le coordinate.</p>
              <div className="iban-card" data-empty={!weddingIban}>
                <span>IBAN</span>
                <strong>{weddingIban || "In attesa dell'IBAN definitivo"}</strong>
                {weddingIban && (
                  <button type="button" onClick={copyIban} aria-label="Copia IBAN">
                    {ibanCopied ? <CheckIcon /> : <CopyIcon />}
                    {ibanCopied ? "Copiato" : "Copia"}
                  </button>
                )}
              </div>
            </section>

            <section className="final-rsvp" id="conferma">
              <BotanicalBranch className="forest-detail-rsvp" />
              <GlowCluster className="glow-rsvp" />
              <ClockIcon />
              <p className="section-kicker">Ci sarete?</p>
              <h2>Confermate la vostra presenza</h2>
              <p>Fateci sapere se festeggerete insieme a noi.</p>
              {attendance ? (
                <div className="inline-confirmation" role="status">
                  <CheckCircledIcon />
                  <strong>{attendance === "yes" ? "Che bello, ci sarete!" : "Grazie per averci avvisato"}</strong>
                  <p>{attendance === "yes" ? "Non vediamo l'ora di festeggiare insieme." : "Ci dispiace non avervi con noi, vi penseremo."}</p>
                  <button type="button" onClick={() => { setAttendance(null); setRsvpOpen(true); }}>Modifica risposta</button>
                </div>
              ) : rsvpOpen ? (
                <div className="inline-rsvp-actions" aria-label="Scegli la tua risposta">
                  <button className="primary-action" type="button" onClick={() => setAttendance("yes")}>Sì, ci saremo</button>
                  <button className="secondary-action" type="button" onClick={() => setAttendance("no")}><Cross1Icon /> Non possiamo</button>
                </div>
              ) : (
                <button className="rsvp-button" type="button" onClick={openRsvp}>Conferma presenza</button>
              )}
              <p className="closing-copy">Non vediamo l'ora di festeggiare con voi.</p>
            </section>
          </section>
        </main>
      </MobileScroll>

      <BottomSheet open={sheet === "menu"} onOpenChange={(open) => !open && setSheet(null)} title="Menu" snap={0.44}>
        <nav className="sheet-menu">
          <a href="#programma" onClick={() => setSheet(null)}>Programma</a>
          <a href="#luoghi" onClick={() => setSheet(null)}>I luoghi</a>
          <a href="#lista-nozze" onClick={() => setSheet(null)}>Lista nozze</a>
          <button type="button" onClick={() => { setSheet(null); window.setTimeout(openRsvp, 180); }}>Conferma presenza</button>
        </nav>
      </BottomSheet>
    </>
  );
}
