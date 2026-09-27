import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowTopRightIcon, CheckCircledIcon, CheckIcon, ChevronDownIcon, CopyIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import "@fontsource/cutive-mono/400.css";
import { BottomSheet, MobileScroll } from "./mobile";
import { invitationCodeFromUrl, loadInvitation, recordEvent, submitRsvp, type Invitation } from "./inviteApi";

const weddingIban = "";
const lucaWhatsappNumber = "+39 348 453 7261";
const surpriseMessage = "Ciao Luca, vorrei fare una sorpresa al matrimonio di Valentina e Riccardo del 22 Maggio 2027...";
const lucaWhatsappUrl = lucaWhatsappNumber
  ? `https://wa.me/${lucaWhatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(surpriseMessage)}`
  : null;
const registryExamples = [
  {
    name: "Robot aspirapolvere e lavapavimenti",
    description: "Un piccolo aiutante per la nostra casa.",
    href: "https://www.amazon.it/s?k=robot+aspirapolvere+lavapavimenti",
  },
  {
    name: "Macchina per il caffè",
    description: "Per iniziare insieme le nostre mattine.",
    href: "https://www.amazon.it/s?k=macchina+per+il+caffe",
  },
  {
    name: "Set di valigie",
    description: "Per i viaggi che ci aspettano.",
    href: "https://www.amazon.it/s?k=set+valigie",
  },
];
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

function GoldPoints({ className }: { className: string }) {
  return <img className={"gold-points " + className} src="/assets/wedding/gold-points-v3.webp" alt="" aria-hidden="true" draggable="false" />;
}
function WhatsAppIcon() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <path d="M16 3.5a12.5 12.5 0 0 0-10.8 18.8L3.5 28.5l6.4-1.7A12.5 12.5 0 1 0 16 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M11.1 10.1c-.6-.5-1.2-.4-1.6.2-.6.8-.7 1.8-.3 2.8 1.4 3.7 4.6 6.9 8.3 8.3 1 .4 2 .3 2.8-.3.6-.4.7-1 .2-1.6l-1.4-1.6c-.4-.5-1-.5-1.5-.2l-1 .7a9.6 9.6 0 0 1-4.9-4.9l.7-1c.3-.5.3-1.1-.2-1.5l-1.1-.9Z" fill="currentColor" />
  </svg>;
}
function MapsLink({ place, onClick }: { place: keyof typeof locations; onClick?: () => void }) {
  return <a className="text-link" href={locations[place].maps} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" onClick={onClick} aria-label={"Apri " + locations[place].name + " su Google Maps"}>Apri Maps <ArrowTopRightIcon aria-hidden="true" /></a>;
}
function Signature() {
  return <div className="signature" aria-hidden="true"><span>Valentina</span><span>&amp; Riccardo</span></div>;
}

export default function Prototype() {
  const [sheet, setSheet] = useState<"menu" | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [inviteState, setInviteState] = useState<"loading" | "ready" | "missing" | "unavailable" | "error">("loading");
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [rsvpSaved, setRsvpSaved] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [giftView, setGiftView] = useState<"choices" | "bank" | "registry">("choices");
  const [ibanCopied, setIbanCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [timelineRoute, setTimelineRoute] = useState({ height: 1, path: "" });
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [loaderPhase, setLoaderPhase] = useState<"closed" | "opening" | "hidden">(reducedMotion ? "hidden" : "closed");
  const scrollCueRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const answerRef = useRef<HTMLButtonElement>(null);
  const pendingRsvpRef = useRef<{ signature: string; requestId: string } | null>(null);
  const giftHeadingRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<HTMLOListElement>(null);
  const giftViewChanged = useRef(false);
  const introWasShown = useRef(loaderPhase !== "hidden");

  const track = (name: string, target = "") => {
    if (invitation) recordEvent(invitation.code, name, target);
  };

  useEffect(() => {
    const code = invitationCodeFromUrl();
    if (!code) { setInviteState("missing"); return; }
    const controller = new AbortController();
    loadInvitation(code, controller.signal).then((data) => {
      setInvitation(data);
      setAnswers(Object.fromEntries(data.guests.map((guest) => [guest.id, guest.attending])));
      setInviteState("ready");
      recordEvent(data.code, "link_opened");
    }).catch((error) => {
      if (controller.signal.aborted) return;
      setInviteState(error.message === "Invito non disponibile" ? "unavailable" : "error");
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!invitation || loaderPhase !== "hidden") return;
    const scroll = document.querySelector<HTMLElement>(".wedding-scroll");
    if (!scroll) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) recordEvent(invitation.code, "section_viewed", entry.target.id);
    }, { root: scroll, threshold: 0.35 });
    for (const id of ["programma", "luoghi", "sorprese", "lista-nozze", "conferma"]) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [invitation, loaderPhase]);

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
    if (rsvpOpen) answerRef.current?.focus({ preventScroll: true });
  }, [rsvpOpen]);

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    let active = true;
    const measureRoute = () => {
      if (!active) return;
      const stops = [...timeline.querySelectorAll<HTMLElement>(".timeline-stop")];
      if (stops.length !== 3) return;
      const points = stops.map((stop) => {
        const item = stop.closest<HTMLElement>("li");
        return {
          x: (item?.offsetLeft ?? 0) + stop.offsetLeft + stop.offsetWidth / 2,
          y: (item?.offsetTop ?? 0) + stop.offsetTop + stop.offsetHeight / 2,
        };
      });
      const [first, second, third] = points;
      const firstMid = (first.y + second.y) / 2;
      const secondMid = (second.y + third.y) / 2;
      const height = timeline.offsetHeight;
      const path = `M ${first.x} ${Math.max(0, first.y - 18)} L ${first.x} ${first.y} C ${first.x} ${firstMid} ${second.x} ${firstMid} ${second.x} ${second.y} C ${second.x} ${secondMid} ${third.x} ${secondMid} ${third.x} ${third.y} L ${third.x} ${Math.min(height, third.y + 58)}`;
      setTimelineRoute({ height, path });
    };
    const observer = new ResizeObserver(measureRoute);
    observer.observe(timeline);
    timeline.querySelectorAll("li").forEach((item) => observer.observe(item));
    window.addEventListener("resize", measureRoute);
    document.fonts.ready.then(measureRoute);
    measureRoute();
    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener("resize", measureRoute);
    };
  }, []);

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
  useEffect(() => {
    if (!giftViewChanged.current) return;
    const frame = window.requestAnimationFrame(() => {
      giftHeadingRef.current?.focus({ preventScroll: true });
      goTo(giftView === "choices" ? "lista-nozze" : "gift-detail");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [giftView]);
  const showGiftView = (view: "choices" | "bank" | "registry") => {
    giftViewChanged.current = true;
    setGiftView(view);
    if (view === "bank") track("bank_details_viewed", "bank");
    if (view === "registry") track("registry_opened", "registry");
  };
  const openRsvp = () => {
    setRsvpOpen(true);
    setRsvpSaved(false);
    setRsvpError("");
    track("rsvp_opened", "rsvp");
    window.setTimeout(() => goTo("conferma"), 80);
  };
  const saveAnswers = async () => {
    if (!invitation || rsvpSaving || invitation.guests.some((guest) => answers[guest.id] === null || answers[guest.id] === undefined)) return;
    const responses = invitation.guests.map((guest) => ({ guestId: guest.id, attending: answers[guest.id] as boolean }));
    const signature = JSON.stringify(responses);
    if (pendingRsvpRef.current?.signature !== signature) pendingRsvpRef.current = { signature, requestId: crypto.randomUUID() };
    setRsvpSaving(true);
    setRsvpError("");
    try {
      const saved = await submitRsvp(invitation.code, responses, pendingRsvpRef.current.requestId);
      setInvitation({ ...invitation, guests: invitation.guests.map((guest) => ({ ...guest, attending: answers[guest.id], respondedAt: saved.savedAt })) });
      setRsvpSaved(true);
      setRsvpOpen(false);
      pendingRsvpRef.current = null;
    } catch (error) { setRsvpError((error as Error).message); }
    finally { setRsvpSaving(false); }
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
          <button type="button" className="seal-trigger" aria-label="Apri l'invito" autoFocus disabled={loaderPhase !== "closed"} onClick={() => { track("envelope_opened"); setLoaderPhase("opening"); }} />
          {loaderPhase === "closed" && <div className="loader-caption">{invitation && <p className="loader-recipient">{invitation.displayName}</p>}<p className="loader-hint">Tocca il sigillo</p></div>}
        </div>
      )}
      <MobileScroll className="app-screen wedding-scroll">
        <main className="wedding-page" aria-label="Matrimonio di Valentina e Riccardo" aria-hidden={loaderPhase !== "hidden"} inert={loaderPhase !== "hidden" ? true : undefined}>
          <section className="invitation-hero" aria-labelledby="couple-names">
            <GoldPoints className="points-hero-left" />
            <GoldPoints className="points-hero-right" />
            <button className="hero-menu-button" type="button" onClick={() => setSheet("menu")} aria-label="Apri il menu"><HamburgerMenuIcon /></button>
            <header className="hero-copy">
              <p className="eyebrow">Il nostro giorno</p>
              <h1 id="couple-names" className="signature"><span>Valentina</span><span>&amp; Riccardo</span></h1>
              <p className="wedding-date"><time dateTime="2027-05-22">22 maggio 2027</time><span>Segrate · ore 15:30</span></p>
            </header>
            <section className="media-collage" aria-label="La cerimonia e la festa">
              <figure className="photo-print church-photo"><div className="photo-window"><img src="/assets/wedding/church.png" alt="Il campanile della Chiesa di Santo Stefano a Segrate" draggable="false" /></div></figure>
              <figure className="photo-print venue-photo"><div className="photo-window"><video ref={videoRef} src="/assets/wedding/fondaco.mp4" aria-label="Atmosfera del Fondaco dei Mercanti" autoPlay={!reducedMotion && loaderPhase === "hidden"} muted loop playsInline preload="metadata" /></div></figure>
              <figure className="photo-print lights-photo"><div className="photo-window"><img src="/assets/wedding/dancing-lights.png" alt="Luci calde per festeggiare insieme" draggable="false" /></div></figure>
            </section>
            <button ref={scrollCueRef} className="scroll-invitation-cue" type="button" onClick={() => goTo("programma")} aria-label="Scorri verso il basso per accedere alla partecipazione"><ChevronDownIcon aria-hidden="true" /></button>
          </section>

          <section className="day-section" id="programma" aria-labelledby="programma-title">
            <GoldPoints className="points-program" />
            <header className="section-heading"><p id="programma-title" className="eyebrow">Il programma</p></header>
            <ol className="day-timeline" ref={timelineRef}>
              <svg className="timeline-route" viewBox={`0 0 62 ${timelineRoute.height}`} preserveAspectRatio="none" aria-hidden="true"><path d={timelineRoute.path} /></svg>
              <li><span className="timeline-stop" aria-hidden="true" /><div><h3><time dateTime="2027-05-22T15:30:00+02:00">15:30</time><span>Il nostro sì</span></h3><p>Chiesa di Santo Stefano<br />Segrate</p><MapsLink place="church" onClick={() => track("external_link_clicked", "church_maps")} /></div></li>
              <li><span className="timeline-stop" aria-hidden="true" /><div><h3><span>A seguire</span><span>Brindisi e cena</span></h3><p>Fondaco dei Mercanti</p><MapsLink place="venue" onClick={() => track("external_link_clicked", "venue_maps")} /></div></li>
              <li><span className="timeline-stop" aria-hidden="true" /><div><h3><span>Fino a tardi</span><span>Musica e festa</span></h3><p>Balliamo insieme<br />sotto le luci.</p></div></li>
            </ol>
          </section>

          <section className="places-section" id="luoghi" aria-label="Indirizzi e indicazioni">
            <details className="location-details">
              <summary>Indirizzi e indicazioni <ChevronDownIcon aria-hidden="true" /></summary>
              <div className="place-list">{(["church", "venue"] as const).map(place => <article key={place}><h3>{locations[place].name}</h3><p>{locations[place].address}</p><MapsLink place={place} onClick={() => track("external_link_clicked", `${place}_maps`)} /></article>)}</div>
            </details>
          </section>

          <section className="surprise-section" id="sorprese" aria-labelledby="sorprese-title">
            <h2 id="sorprese-title">Fate una sorpresa agli sposi...</h2>
            <p className="surprise-copy">Avete in mente un discorso, una dedica o una sorpresa? Luca Ferro, il conduttore della festa, vi aiuterà a prepararla per il ricevimento.</p>
            <div className="surprise-contact">
              <p className="small-label">Il vostro complice alla festa</p>
              <p className="surprise-contact-name">Luca Ferro</p>
              <p className="surprise-contact-number">{lucaWhatsappNumber}</p>
              {lucaWhatsappUrl ? <a className="surprise-whatsapp" href={lucaWhatsappUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" onClick={() => track("external_link_clicked", "luca_whatsapp")} aria-label="Scrivi a Luca Ferro su WhatsApp con un messaggio precompilato (si apre in una nuova scheda)"><WhatsAppIcon /><span>Scrivi a Luca su WhatsApp</span><ArrowTopRightIcon aria-hidden="true" /></a>
                : <div className="surprise-whatsapp surprise-whatsapp-pending" aria-label="Contatto WhatsApp di Luca Ferro in arrivo"><WhatsAppIcon /><span>Contatto WhatsApp in arrivo</span></div>}
            </div>
          </section>

          <div className="invitation-closing">
            <GoldPoints className="points-closing-left" />
            <GoldPoints className="points-closing-right" />
            <section className="gift-section" id="lista-nozze" aria-labelledby="lista-nozze-title">
              {giftView === "choices" ? <>
                <h2 id="lista-nozze-title" ref={giftHeadingRef} tabIndex={-1}>Il regalo più bello<br />è avervi con noi.</h2>
                <p className="gift-copy">Se desiderate farci un regalo, scegliete ciò che preferite.</p>
                <div className="gift-choices" aria-label="Scegli come fare un regalo">
                  <button className="gift-choice" type="button" onClick={() => showGiftView("bank")}>
                    <strong>Fai un bonifico</strong>
                    <span className="gift-choice-description">Un pensiero per la nostra prossima avventura.</span>
                    <span className="gift-choice-action">Vai alle coordinate <ArrowTopRightIcon aria-hidden="true" /></span>
                  </button>
                  <button className="gift-choice" type="button" onClick={() => showGiftView("registry")}>
                    <strong>Scegli dalla lista nozze</strong>
                    <span className="gift-choice-description">Qualche idea da scegliere con il cuore.</span>
                    <span className="gift-choice-action">Sfoglia la lista <ArrowTopRightIcon aria-hidden="true" /></span>
                  </button>
                </div>
              </> : <div className="gift-detail" id="gift-detail">
                <button className="gift-back" type="button" onClick={() => showGiftView("choices")}>← Torna alle opzioni</button>
                {giftView === "bank" ? <>
                  <p className="eyebrow">Il nostro viaggio</p>
                  <h2 id="lista-nozze-title" ref={giftHeadingRef} tabIndex={-1}>Un regalo per la nostra prossima avventura.</h2>
                  <p className="gift-copy">Se preferite farci un bonifico, troverete qui le coordinate.</p>
                  <div className="bank-coordinates">
                    <p className="small-label">Coordinate bancarie · IBAN</p>
                    {weddingIban ? <>
                      <strong className="iban-value">{weddingIban}</strong>
                      <button type="button" className="text-link" onClick={copyIban}>{ibanCopied ? <CheckIcon /> : <CopyIcon />}{ibanCopied ? "IBAN copiato" : "Copia IBAN"}</button>
                      {copyError && <p role="alert">Copia non riuscita. Puoi selezionare e copiare le coordinate qui sopra.</p>}
                    </> : <p className="bank-pending">IBAN in arrivo<span>Le coordinate saranno aggiunte presto.</span></p>}
                  </div>
                </> : <>
                  <p className="eyebrow">La nostra lista nozze</p>
                  <h2 id="lista-nozze-title" ref={giftHeadingRef} tabIndex={-1}>Piccole cose,<br />grandi ricordi.</h2>
                  <p className="gift-copy">Qualche idea per la nostra casa e per i viaggi che ci aspettano.</p>
                  <p className="registry-note">Questi sono esempi: i link aprono ricerche Amazon, non prodotti già scelti.</p>
                  <ol className="registry-list">{registryExamples.map((item, index) => <li key={item.name}>
                    <span className="registry-number">{String(index + 1).padStart(2, "0")}</span>
                    <div><h3>{item.name}</h3><p>{item.description}</p><a className="text-link" href={item.href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" onClick={() => track("external_link_clicked", `registry_${index + 1}`)} aria-label={`Cerca ${item.name} su Amazon (esempio, si apre in una nuova scheda)`}>Cerca su Amazon <ArrowTopRightIcon aria-hidden="true" /></a></div>
                  </li>)}</ol>
                </>}
              </div>}
            </section>
            <section className="final-rsvp" id="conferma" aria-labelledby="rsvp-title">
              <h2 id="rsvp-title">Ci sarete?</h2>
              <p>Fateci sapere se festeggerete con noi.</p>
              {invitation ? rsvpOpen ? <div className="rsvp-form" aria-label="Risposta per ogni persona invitata">
                <p className="rsvp-intro">Selezionate una risposta per ciascuna persona. Potrete modificarla riaprendo questo link.</p>
                {invitation.guests.map((guest) => <div className="rsvp-person" key={guest.id}><p>{guest.firstName} {guest.lastName}</p><div className="rsvp-options" role="group" aria-label={`Presenza di ${guest.firstName} ${guest.lastName}`}>
                  <button type="button" ref={guest.id === invitation.guests[0]?.id ? answerRef : undefined} aria-pressed={answers[guest.id] === true} className={answers[guest.id] === true ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [guest.id]: true }); setRsvpError(""); }}>Ci sarò</button>
                  <button type="button" aria-pressed={answers[guest.id] === false} className={answers[guest.id] === false ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [guest.id]: false }); setRsvpError(""); }}>Non ci sarò</button>
                </div></div>)}
                {rsvpError && <p className="rsvp-error" role="alert">{rsvpError}</p>}
                <button className="primary-action" type="button" disabled={rsvpSaving || invitation.guests.length === 0 || invitation.guests.some((guest) => answers[guest.id] === null || answers[guest.id] === undefined)} onClick={() => void saveAnswers()}>{rsvpSaving ? "Salvataggio…" : "Salva le risposte"}</button>
                <button className="secondary-action" type="button" onClick={() => setRsvpOpen(false)}>Annulla</button>
              </div> : <div className="rsvp-ready">{rsvpSaved && <p className="rsvp-success" role="status"><CheckCircledIcon aria-hidden="true" />Risposte salvate.</p>}{invitation.guests.some((guest) => guest.attending !== null) && <p className="rsvp-existing">{invitation.guests.map((guest) => `${guest.firstName}: ${guest.attending === true ? "presente" : guest.attending === false ? "assente" : "in attesa"}`).join(" · ")}</p>}<button className="primary-action" type="button" onClick={openRsvp}>{invitation.guests.some((guest) => guest.attending !== null) ? "Modifica le risposte" : "Conferma presenza"}</button></div>
                : <div className="rsvp-unavailable"><p>{inviteState === "loading" ? "Caricamento dell'invito…" : inviteState === "missing" ? "Apri il link personale presente sulla partecipazione per confermare la presenza." : inviteState === "error" ? "Non riusciamo a caricare il tuo invito. Controlla la connessione e riprova." : "Invito non disponibile. Contatta gli sposi per verificare il link."}</p>{inviteState === "error" && <button type="button" className="secondary-action" onClick={() => window.location.reload()}>Riprova</button>}</div>}
            </section>
            <footer className="invitation-footer"><Signature /><p className="sr-only">Valentina e Riccardo · 22 maggio 2027</p><details className="privacy-note"><summary>Privacy e attività dell'invito</summary><p>Per organizzare il matrimonio, associamo al codice della partecipazione l'apertura dell'invito, le sezioni visitate, i clic sui link e le risposte RSVP. Questi dati sono consultabili dagli sposi nel pannello riservato. Non registriamo digitazioni, movimenti del puntatore o posizione.</p></details></footer>
          </div>
        </main>
      </MobileScroll>
      <BottomSheet open={sheet === "menu"} onOpenChange={(open) => !open && setSheet(null)} title="Il nostro giorno" snap={0.48}>
        <nav className="sheet-menu" aria-label="Le sezioni dell'invito">
          {[["programma", "Il programma"], ["luoghi", "Come arrivare"], ["sorprese", "Fate una sorpresa"], ["lista-nozze", "I regali"]].map(([id, label]) => <button type="button" key={id} onClick={() => { setSheet(null); window.setTimeout(() => { if (id === "lista-nozze") showGiftView("choices"); goTo(id); }, 180); }}>{label}<ArrowTopRightIcon aria-hidden="true" /></button>)}
          <button type="button" onClick={() => { setSheet(null); window.setTimeout(openRsvp, 180); }}>Conferma presenza<ArrowTopRightIcon aria-hidden="true" /></button>
        </nav>
      </BottomSheet>
    </>
  );
}
