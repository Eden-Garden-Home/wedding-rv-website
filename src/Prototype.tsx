import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowTopRightIcon, CheckCircledIcon, CheckIcon, ChevronDownIcon, CopyIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import "@fontsource/cutive-mono/400.css";
import { BottomSheet, KeyboardTextarea, MobileScroll, useKeyboard } from "./mobile";
import { invitationCodeFromUrl, loadInvitation, recordEvent, submitRsvp, type DietaryChoice, type Invitation, type RsvpResponse } from "./inviteApi";

const weddingIban = "";
const lucaWhatsappNumber = "+39 348 453 7261";
const surpriseMessage = "Ciao Luca, vorrei fare una sorpresa al matrimonio di Valentina e Riccardo del 22 Maggio 2027...";
const lucaWhatsappUrl = lucaWhatsappNumber
  ? `https://wa.me/${lucaWhatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(surpriseMessage)}`
  : null;
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
function ProgramIcon({ kind }: { kind: "church" | "venue" | "party" }) {
  return <svg className={`program-icon program-icon-${kind}`} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === "church" ? <>
      <path d="M7 55h50M12 55V33l16-12 16 12v22M9 34l19-15 19 15M23 55V43a5 5 0 0 1 10 0v12M44 55V19h11v36M42 19l7.5-10L57 19M49.5 9V3m-3 3h6M47 35v-7a2.5 2.5 0 0 1 5 0v7" />
      <circle cx="28" cy="32" r="3" />
      <path className="church-bell" d="M47 32h5l-1-3h-3l-1 3Zm2.5 0v1" />
    </> : kind === "venue" ? <>
      <path d="M4 53h56M7 53V27h50v26M4 27l9-12h38l9 12ZM7 32h50M11 53V41a5 5 0 0 1 10 0v12m6 0V41a5 5 0 0 1 10 0v12m6 0V41a5 5 0 0 1 10 0v12M17 20h5m8 0h5m8 0h5M13 15v-5h5v5" />
      <path className="venue-light venue-light-one" d="M13 48v-6a3 3 0 0 1 6 0v6Z" stroke="none" fill="currentColor" />
      <path className="venue-light venue-light-two" d="M29 48v-6a3 3 0 0 1 6 0v6Z" stroke="none" fill="currentColor" />
      <path className="venue-light venue-light-three" d="M45 48v-6a3 3 0 0 1 6 0v6Z" stroke="none" fill="currentColor" />
    </> : <>
      <path className="party-glass-left" d="m12 23 15 5-4 12a8 8 0 0 1-15-5l4-12Zm-2 8 14 5M15 43l-4 12m-6-2 12 4" />
      <path className="party-glass-right" d="m52 23-15 5 4 12a8 8 0 0 0 15-5l-4-12Zm2 8-14 5m9 7 4 12m6-2-12 4" />
      <g className="party-notes"><path d="M29 20V9l10-2v11" /><ellipse cx="26" cy="21" rx="3" ry="2" /><ellipse cx="36" cy="19" rx="3" ry="2" /></g>
      <path className="party-confetti" d="m9 12 3 3m43-3-3 3M20 6l1 4m24-5-1 4" />
    </>}
  </svg>;
}
function WhatsAppIcon() {
  return <svg className="whatsapp-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <path d="M16 3.5a12.5 12.5 0 0 0-10.8 18.8L3.5 28.5l6.4-1.7A12.5 12.5 0 1 0 16 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M11.1 10.1c-.6-.5-1.2-.4-1.6.2-.6.8-.7 1.8-.3 2.8 1.4 3.7 4.6 6.9 8.3 8.3 1 .4 2 .3 2.8-.3.6-.4.7-1 .2-1.6l-1.4-1.6c-.4-.5-1-.5-1.5-.2l-1 .7a9.6 9.6 0 0 1-4.9-4.9l.7-1c.3-.5.3-1.1-.2-1.5l-1.1-.9Z" fill="currentColor" />
  </svg>;
}
function MapsLink({ place, onClick }: { place: keyof typeof locations; onClick?: () => void }) {
  const pinId = useId();
  return <a className="text-link maps-link" href={locations[place].maps} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" onClick={onClick} aria-label={"Apri " + locations[place].name + " su Google Maps"}><svg className="google-maps-icon" viewBox="0 0 24 32" aria-hidden="true" focusable="false"><defs><clipPath id={pinId}><path d="M12 1a11 11 0 0 0-11 11c0 7.6 9 13 10 18a1 1 0 0 0 2 0c1-5 10-10.4 10-18A11 11 0 0 0 12 1Z" /></clipPath></defs><g clipPath={`url(#${pinId})`}><path fill="#34a853" d="M0 0h24v32H0z" /><path fill="#4285f4" d="M0 0h24L0 24z" /><path fill="#1a73e8" d="m0 0 13 0L0 13z" /><path fill="#fbbc04" d="m24 0-24 24v8L24 8z" /><path fill="#ea4335" d="M12 1a11 11 0 0 0-11 11l7 5L19 4a11 11 0 0 0-7-3Z" /></g><circle cx="12" cy="12" r="4" fill="#fff" /></svg><span>Apri Google Maps</span><ArrowTopRightIcon aria-hidden="true" /></a>;
}
function Signature() {
  return <div className="signature" aria-hidden="true"><span>Valentina</span><span>&amp; Riccardo</span></div>;
}
function ClosingIcon({ kind }: { kind: "patagonia" | "rsvp" }) {
  return <svg className={`closing-icon closing-icon-${kind}`} viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === "patagonia" ? <><path d="M5 49 24 19l10 16L47 7l10 25 8-12 11 29H5Zm12-18 7 4 6-6m10-6 7 5 6-5" /><path className="patagonia-waves" d="M9 55c9-4 15 4 24 0s15 4 24 0 13 1 17 0M17 61c7-3 12 2 19 0s12 2 19 0" /><circle className="patagonia-sun" cx="14" cy="12" r="4" /></> : <><path d="M10 29h60v29H10zM10 30l30 17 30-17M10 58l22-16m38 16L48 42" /><path className="rsvp-heart" d="M40 24s-10-6-10-12a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 6-10 12-10 12Z" /></>}
  </svg>;
}
function ThemeIcon({ dress = false }: { dress?: boolean }) {
  return <svg className={dress ? "theme-icon dress-icon" : "theme-icon forest-icon"} viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {dress ? <><path d="m29 15-13 7 6 12 7-4v23h23V30l7 4 6-12-13-7c-1 9-22 9-23 0ZM40 5v4m-3-2h6" /><circle cx="61" cy="46" r="12" /><path d="m53 54 16-16" /></> : <><path d="M8 57h64M34 61c1-6 14-5 11-13" /><g className="forest-trees"><path d="M9 39 21 15l12 24H9Zm12 0v16M27 31 40 5l13 26H27Zm13 0v15M52 41l11-23 11 23H52Zm11 0v14" /></g><circle cx="10" cy="13" r="1.4" fill="currentColor" stroke="none" /><circle cx="63" cy="8" r="1.4" fill="currentColor" stroke="none" /><circle cx="73" cy="28" r="1.4" fill="currentColor" stroke="none" /><circle cx="32" cy="43" r="1.4" fill="currentColor" stroke="none" /></>}
  </svg>;
}

export default function Prototype() {
  const keyboard = useKeyboard();
  const [sheet, setSheet] = useState<"menu" | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [inviteState, setInviteState] = useState<"loading" | "ready" | "missing" | "unavailable" | "error">("loading");
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [mealAnswers, setMealAnswers] = useState<Record<string, { choice: DietaryChoice; note: string; childMenu: boolean }>>({});
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [rsvpSaved, setRsvpSaved] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [giftView, setGiftView] = useState<"choices" | "bank">("choices");
  const [ibanCopied, setIbanCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const routeMaskId = useId();
  const [timelineRoute, setTimelineRoute] = useState({ height: 1, path: "", gaps: [] as number[] });
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

  useEffect(() => {
    if (reducedMotion) return;
    const icons = document.querySelectorAll<SVGElement>(".program-icon, .theme-icon, .closing-icon, .google-maps-icon, .whatsapp-icon");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("icon-in-view", entry.isIntersecting));
    }, { threshold: .15 });
    icons.forEach((icon) => observer.observe(icon));
    return () => observer.disconnect();
  }, [reducedMotion, giftView, loaderPhase]);

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
      setMealAnswers(Object.fromEntries(data.guests.map((guest) => [guest.id, { choice: guest.dietaryChoice, note: guest.dietaryNote, childMenu: guest.childMenu }])));
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
    for (const id of ["programma", "luoghi", "tema", "sorprese", "lista-nozze", "conferma"]) {
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
      setTimelineRoute({ height, path, gaps: points.map((point) => point.y + 22) });
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
  const showGiftView = (view: "choices" | "bank") => {
    giftViewChanged.current = true;
    setGiftView(view);
    if (view === "bank") track("bank_details_viewed", "bank");

  };
  const openRsvp = () => {
    setRsvpOpen(true);
    setRsvpSaved(false);
    setRsvpError("");
    track("rsvp_opened", "rsvp");
    window.setTimeout(() => goTo("conferma"), 80);
  };
  const updateMeal = (id: string, update: Partial<{ choice: DietaryChoice; note: string; childMenu: boolean }>) => {
    setMealAnswers((current) => ({ ...current, [id]: { ...current[id], ...update } }));
    setRsvpError("");
  };
  const rsvpComplete = (guest: Invitation['guests'][number]) => {
    const attending = answers[guest.id];
    const meal = mealAnswers[guest.id];
    return attending === false || (attending === true && meal && meal.choice !== 'unanswered' && (meal.choice !== 'needs' || Boolean(meal.note.trim())));
  };
  const saveAnswers = async () => {
    if (!invitation || rsvpSaving || !invitation.guests.every(rsvpComplete)) return;
    keyboard.hide();
    const responses: RsvpResponse[] = invitation.guests.map((guest) => ({
      guestId: guest.id,
      attending: answers[guest.id] as boolean,
      dietaryChoice: mealAnswers[guest.id].choice,
      dietaryNote: mealAnswers[guest.id].choice === 'needs' ? mealAnswers[guest.id].note.trim() : '',
      childMenu: mealAnswers[guest.id].childMenu,
    }));
    const signature = JSON.stringify(responses);
    if (pendingRsvpRef.current?.signature !== signature) pendingRsvpRef.current = { signature, requestId: crypto.randomUUID() };
    setRsvpSaving(true);
    setRsvpError("");
    try {
      const saved = await submitRsvp(invitation.code, responses, pendingRsvpRef.current.requestId);
      setInvitation({ ...invitation, guests: invitation.guests.map((guest) => ({ ...guest, attending: answers[guest.id], dietaryChoice: mealAnswers[guest.id].choice, dietaryNote: mealAnswers[guest.id].choice === 'needs' ? mealAnswers[guest.id].note.trim() : '', childMenu: mealAnswers[guest.id].childMenu, respondedAt: saved.savedAt })) });
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
              <p className="wedding-date"><time dateTime="2027-05-22">22 maggio 2027</time><span>Segrate · ore 15:00</span></p>
            </header>
            <section className="media-collage polaroid-collage" aria-label="Le nostre Polaroid">
              <figure className="original-polaroid polaroid-kiss"><img src="/assets/wedding/polaroid-kiss.png" alt="Polaroid di Valentina e Riccardo che si baciano a Natale" draggable="false" /></figure>
              <figure className="original-polaroid polaroid-ring"><img src="/assets/wedding/polaroid-ring.png" alt="Polaroid di Valentina sorridente con il suo anello" draggable="false" /></figure>
            </section>
            <button ref={scrollCueRef} className="scroll-invitation-cue" type="button" onClick={() => goTo("programma")} aria-label="Scorri verso il basso per accedere alla partecipazione"><ChevronDownIcon aria-hidden="true" /></button>
          </section>

          <section className="day-section" id="programma" aria-labelledby="programma-title">
            <GoldPoints className="points-program" />
            <header className="section-heading"><p id="programma-title" className="eyebrow">Il programma</p></header>
            <ol className="day-timeline" ref={timelineRef}>
              <svg className="timeline-route" viewBox={`0 0 62 ${timelineRoute.height}`} preserveAspectRatio="none" aria-hidden="true"><defs><mask id={routeMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="62" height={timelineRoute.height}><rect width="62" height={timelineRoute.height} fill="white" />{timelineRoute.gaps.map((y, index) => <rect key={index} x="0" y={y} width="62" height="68" fill="black" />)}</mask></defs><path d={timelineRoute.path} mask={`url(#${routeMaskId})`} /></svg>
              <li><span className="timeline-stop" aria-hidden="true"><ProgramIcon kind="church" /></span><div><h3><time dateTime="2027-05-22T15:00:00+02:00">15:00</time><span>Il nostro sì</span></h3><p>Chiesa di Santo Stefano<br />Segrate</p><MapsLink place="church" onClick={() => track("external_link_clicked", "church_maps")} /><figure className="program-photo program-photo-church"><img src="/assets/wedding/church.png" alt="Il campanile della Chiesa di Santo Stefano a Segrate" loading="lazy" draggable="false" /></figure></div></li>
              <li><span className="timeline-stop" aria-hidden="true"><ProgramIcon kind="venue" /></span><div><h3><span>A seguire</span><span>Brindisi e cena</span></h3><p>Fondaco dei Mercanti</p><MapsLink place="venue" onClick={() => track("external_link_clicked", "venue_maps")} /><figure className="program-photo program-photo-venue"><video ref={videoRef} src="/assets/wedding/fondaco.mp4" aria-label="Atmosfera del Fondaco dei Mercanti" autoPlay={!reducedMotion && loaderPhase === "hidden"} muted loop playsInline preload="metadata" /></figure></div></li>
              <li><span className="timeline-stop" aria-hidden="true"><ProgramIcon kind="party" /></span><div><h3><span>Fino a tardi</span><span>Musica e festa</span></h3><p>Balliamo insieme<br />sotto le luci.</p><figure className="program-photo program-photo-party"><img src="/assets/wedding/dancing-lights.png" alt="Luci calde per festeggiare insieme" loading="lazy" draggable="false" /></figure></div></li>
            </ol>
          </section>

          <section className="places-section" id="luoghi" aria-label="Indirizzi e indicazioni">
            <details className="location-details">
              <summary>Indirizzi e indicazioni <ChevronDownIcon aria-hidden="true" /></summary>
              <div className="place-list">{(["church", "venue"] as const).map(place => <article key={place}><h3>{locations[place].name}</h3><p>{locations[place].address}</p><MapsLink place={place} onClick={() => track("external_link_clicked", `${place}_maps`)} /></article>)}</div>
            </details>
          </section>

          <section className="theme-section" id="tema" aria-labelledby="tema-title">
            <ThemeIcon />
            <p className="eyebrow">Il nostro tema</p>
            <h2 id="tema-title">Benvenuti nel<br />bosco incantato.</h2>
            <p>Abbiamo scelto il bosco come simbolo del nostro matrimonio: un luogo in cui ogni cosa trova spazio, tra radici profonde, foglie mosse dal vento e piccole creature che lo rendono vivo.</p>
            <div className="theme-dress"><ThemeIcon dress /><p className="small-label">Come vestirsi</p><p>Nessun dress code e nessun colore tema: scegliete ciò che vi rappresenta e vi fa sentire belli, felici e luminosi.</p></div>
          </section>

          <section className="surprise-section" id="sorprese" aria-labelledby="sorprese-title">
            <h2 id="sorprese-title">Fate una sorpresa agli sposi…</h2>
            <p className="surprise-copy">Avete in mente una canzone da dedicarci, una coreografia o un discorso durante il ricevimento?</p>
            <p className="surprise-copy">Luca Ferro, il conduttore della festa, raccoglierà le vostre idee per inserirle nella scaletta della serata. Contattatelo per tempo per aiutarci a organizzare al meglio ogni momento!</p>
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
                <h2 id="lista-nozze-title" ref={giftHeadingRef} tabIndex={-1}>Un pensiero per noi</h2>
                <p className="gift-copy">Il regalo più bello sarà avervi con noi. Se desiderate dedicarci un pensiero, potete contribuire con un bonifico al nostro viaggio in Patagonia: porteremo un pezzetto di voi fino alla fine del mondo.</p>
                <div className="gift-choices" aria-label="Un contributo al nostro viaggio">
                  <button className="gift-choice" type="button" onClick={() => showGiftView("bank")}>
                    <ClosingIcon kind="patagonia" />
                    <strong>Aiutaci a raggiungere la fine del mondo</strong>
                    <span className="gift-choice-description">Un piccolo contributo al nostro viaggio in Patagonia.</span>
                    <span className="gift-choice-action">Vai alle coordinate <ArrowTopRightIcon aria-hidden="true" /></span>
                  </button>

                </div>
              </> : <div className="gift-detail" id="gift-detail">
                <button className="gift-back" type="button" onClick={() => showGiftView("choices")}>← Torna al nostro viaggio</button>
                <>
                  <p className="eyebrow">Il nostro viaggio</p>
                  <ClosingIcon kind="patagonia" />
                  <h2 id="lista-nozze-title" ref={giftHeadingRef} tabIndex={-1}>Aiutaci a raggiungere la fine del mondo</h2>
                  <p className="gift-copy">Un piccolo contributo al nostro viaggio in Patagonia.</p>
                  <div className="bank-coordinates">
                    <p className="small-label">Coordinate bancarie · IBAN</p>
                    {weddingIban ? <>
                      <strong className="iban-value">{weddingIban}</strong>
                      <button type="button" className="text-link" onClick={copyIban}>{ibanCopied ? <CheckIcon /> : <CopyIcon />}{ibanCopied ? "IBAN copiato" : "Copia IBAN"}</button>
                      {copyError && <p role="alert">Copia non riuscita. Puoi selezionare e copiare le coordinate qui sopra.</p>}
                    </> : <p className="bank-pending">IBAN in arrivo<span>Le coordinate saranno aggiunte presto.</span></p>}
                  </div>
                </>
              </div>}
            </section>
            <section className="final-rsvp" id="conferma" aria-labelledby="rsvp-title">
              <ClosingIcon kind="rsvp" />
              <h2 id="rsvp-title">Ci sarete?</h2>
              <p>Fateci sapere se festeggerete con noi.</p>
              {invitation ? rsvpOpen ? <div className="rsvp-form" aria-label="Risposta per ogni persona invitata">
                <p className="rsvp-intro">Indicate la presenza e le esigenze per ogni persona del nucleo. Potrete modificare tutto riaprendo questo link.</p>
                {invitation.guests.map((guest) => <div className="rsvp-person" key={guest.id}><p>{guest.firstName} {guest.lastName}</p><div className="rsvp-options" role="group" aria-label={`Presenza di ${guest.firstName} ${guest.lastName}`}>
                  <button type="button" ref={guest.id === invitation.guests[0]?.id ? answerRef : undefined} aria-pressed={answers[guest.id] === true} className={answers[guest.id] === true ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [guest.id]: true }); setRsvpError(""); }}>Ci sarò</button>
                  <button type="button" aria-pressed={answers[guest.id] === false} className={answers[guest.id] === false ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [guest.id]: false }); setRsvpError(""); }}>Non ci sarò</button>
                </div>{answers[guest.id] === true && <div className="rsvp-meal" role="group" aria-label={`Menù di ${guest.firstName} ${guest.lastName}`}>
                  <p className="small-label">Menù ed esigenze alimentari</p>
                  <div className="meal-choices">
                    <button type="button" className={mealAnswers[guest.id]?.choice === 'none' ? 'selected' : ''} aria-pressed={mealAnswers[guest.id]?.choice === 'none'} onClick={() => updateMeal(guest.id, { choice: 'none', note: '' })}>Nessuna esigenza</button>
                    <button type="button" className={mealAnswers[guest.id]?.choice === 'needs' ? 'selected' : ''} aria-pressed={mealAnswers[guest.id]?.choice === 'needs'} onClick={() => updateMeal(guest.id, { choice: 'needs' })}>Ho esigenze alimentari</button>
                  </div>
                  {mealAnswers[guest.id]?.choice === 'needs' && <label className="meal-note">Allergie, intolleranze o scelte alimentari di {guest.firstName}<KeyboardTextarea value={mealAnswers[guest.id].note} maxLength={500} rows={3} placeholder="Per esempio: allergia alla frutta a guscio, vegetariano…" onChange={(event) => updateMeal(guest.id, { note: event.target.value })} onBlur={() => keyboard.hide()} /></label>}
                  <label className="child-menu"><input type="checkbox" checked={mealAnswers[guest.id]?.childMenu ?? false} onChange={(event) => updateMeal(guest.id, { childMenu: event.target.checked })} /> Richiedo il menù bambino per {guest.firstName}</label>
                </div>}</div>)}
                {rsvpError && <p className="rsvp-error" role="alert">{rsvpError}</p>}
                <button className="primary-action" type="button" disabled={rsvpSaving || invitation.guests.length === 0 || !invitation.guests.every(rsvpComplete)} onClick={() => void saveAnswers()}>{rsvpSaving ? "Salvataggio…" : "Salva le risposte"}</button>
                <button className="secondary-action" type="button" onClick={() => { keyboard.hide(); setRsvpOpen(false); }}>Annulla</button>
              </div> : <div className="rsvp-ready">{rsvpSaved && <p className="rsvp-success" role="status"><CheckCircledIcon aria-hidden="true" />Risposte salvate.</p>}{invitation.guests.some((guest) => guest.attending !== null) && <p className="rsvp-existing">{invitation.guests.map((guest) => `${guest.firstName}: ${guest.attending === true ? "presente" : guest.attending === false ? "assente" : "in attesa"}`).join(" · ")}</p>}<button className="primary-action" type="button" onClick={openRsvp}>{invitation.guests.some((guest) => guest.attending !== null) ? "Modifica le risposte" : "Conferma presenza"}</button></div>
                : <div className="rsvp-unavailable"><p>{inviteState === "loading" ? "Caricamento dell'invito…" : inviteState === "missing" ? "Apri il link personale presente sulla partecipazione per confermare la presenza." : inviteState === "error" ? "Non riusciamo a caricare il tuo invito. Controlla la connessione e riprova." : "Invito non disponibile. Contatta gli sposi per verificare il link."}</p>{inviteState === "error" && <button type="button" className="secondary-action" onClick={() => window.location.reload()}>Riprova</button>}</div>}
            </section>
            <footer className="invitation-footer"><Signature /><p className="sr-only">Valentina e Riccardo · 22 maggio 2027</p><details className="privacy-note"><summary>Privacy e attività dell'invito</summary><p>Per organizzare il matrimonio, associamo al codice della partecipazione l'apertura dell'invito, le sezioni visitate, i clic sui link, le risposte RSVP e le esigenze alimentari indicate per ciascuna persona. Questi dati sono consultabili dagli sposi nel pannello riservato per organizzare il ricevimento. Non registriamo digitazioni, movimenti del puntatore o posizione.</p></details></footer>
          </div>
        </main>
      </MobileScroll>
      <BottomSheet open={sheet === "menu"} onOpenChange={(open) => !open && setSheet(null)} title="Il nostro giorno" snap={0.48}>
        <nav className="sheet-menu" aria-label="Le sezioni dell'invito">
          {[["programma", "Il programma"], ["luoghi", "Come arrivare"], ["tema", "Il nostro tema"], ["sorprese", "Fate una sorpresa"], ["lista-nozze", "Un pensiero per noi"]].map(([id, label]) => <button type="button" key={id} onClick={() => { setSheet(null); window.setTimeout(() => { if (id === "lista-nozze") showGiftView("choices"); goTo(id); }, 180); }}>{label}<ArrowTopRightIcon aria-hidden="true" /></button>)}
          <button type="button" onClick={() => { setSheet(null); window.setTimeout(openRsvp, 180); }}>Conferma presenza<ArrowTopRightIcon aria-hidden="true" /></button>
        </nav>
      </BottomSheet>
    </>
  );
}
