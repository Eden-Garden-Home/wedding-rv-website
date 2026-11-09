import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowTopRightIcon, CheckCircledIcon, CheckIcon, ChevronDownIcon, CopyIcon } from "@radix-ui/react-icons";
import "@fontsource/cutive-mono/400.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import signaturePaths from "./signature-paths.json";
import { KeyboardTextarea, MobileScroll, useKeyboard } from "./mobile";
import { invitationCodeFromUrl, loadInvitation, recordEvent, submitRsvp, type DietaryChoice, type Invitation, type RsvpResponse } from "./inviteApi";

const weddingIban = "";
const lucaWhatsappNumber = "+39 348 453 7261";
const surpriseMessage = "Ciao Luca, vorremmo fare una sorpresa al matrimonio di Valentina e Riccardo del 22 Maggio 2027...";
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
    name: "Il Fondaco dei Mercanti",
    address: "Loc. Mulino, 1 · Via Rovereto · Moscazzano",
    maps: "https://www.google.com/maps/search/?api=1&query=Il+Fondaco+dei+Mercanti%2C+Loc.+Mulino+1%2C+Moscazzano",
  },
};

function GoldPoints({ className }: { className: string }) {
  return <img className={"gold-points " + className} src="/assets/wedding/gold-points-v3.webp" alt="" aria-hidden="true" draggable="false" />;
}
// One watercolor family, with transparent artwork cropped in SVG to each icon.
const watercolorViews = {
  church: '20 30 364 450', venue: '400 120 360 340', party: '790 80 330 385', dress: '1170 55 340 435',
  patagonia: '10 580 380 380', rsvp: '405 580 345 365', pin: '815 575 275 375', whatsapp: '1165 580 340 355',
};
function WatercolorIcon({ kind, className }: { kind: keyof typeof watercolorViews; className: string }) {
  const clipId = useId();
  const animated = kind === "dress" || kind === "patagonia" || kind === "rsvp";
  const [x, y, width, height] = watercolorViews[kind].split(' ').map(Number);
  return <svg className={`${className} watercolor-icon${animated ? " watercolor-scene" : ""}`} viewBox={watercolorViews[kind]} aria-hidden="true" focusable="false">
    <defs><clipPath id={clipId}><rect x={x} y={y} width={width} height={height} /></clipPath></defs>
    <g clipPath={`url(#${clipId})`}>
      <g className={`watercolor-art watercolor-art-${kind}`}><image href="/assets/wedding/watercolor-icons.png" width="1536" height="1024" /></g>
      {kind === 'patagonia' && <g className="watercolor-water" fill="none" stroke="#fff9e9" strokeWidth="2.5" strokeLinecap="round"><path d="M105 852h36m25 13h52m-87 14h30m35 15h48m-87 12h24" /></g>}
      {kind === 'rsvp' && <svg x="451" y="650" width="264" height="115" viewBox="451 650 264 115" className="watercolor-letter"><image href="/assets/wedding/watercolor-icons.png" width="1536" height="1024" /></svg>}
    </g>
  </svg>;
}
function WhatsAppIcon() {
  return <WatercolorIcon kind="whatsapp" className="whatsapp-icon" />;
}
function MapsLink({ place, onClick }: { place: keyof typeof locations; onClick?: () => void }) {
  return <a className="text-link maps-link" href={locations[place].maps} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" onClick={onClick} aria-label={"Apri " + locations[place].name + " su Google Maps"}><WatercolorIcon kind="pin" className="google-maps-icon" /><span>Apri Google Maps</span><ArrowTopRightIcon aria-hidden="true" /></a>;
}
function Signature() {
  return <div className="signature" aria-hidden="true"><span>Valentina</span><span>&amp; Riccardo</span></div>;
}
function ClosingIcon({ kind }: { kind: "patagonia" | "rsvp" }) {
  return <WatercolorIcon kind={kind} className={`closing-icon closing-icon-${kind}`} />;
}
function ThemeIcon() {
  return <WatercolorIcon kind="dress" className="theme-icon dress-icon" />;
}

function WoodlandSign({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    if (reducedMotion || arrived) return;
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setArrived(true); observer.disconnect(); }
    }, { root: element.closest('.wedding-scroll'), rootMargin: '0px 0px 180px 0px', threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [arrived, reducedMotion]);
  // Independent transparent artwork keeps both silhouettes intact throughout the drop.
  return <svg ref={ref} className="woodland-sign" data-arrival={reducedMotion ? 'still' : arrived ? 'falling' : 'waiting'} viewBox="250 330 800 710" aria-hidden="true" focusable="false">
    <g className="woodland-sign-post">
      <image href="/assets/wedding/woodland-sign-post.png" width="1280" height="1280" />
    </g>
    <g className="woodland-sign-board"><image href="/assets/wedding/woodland-sign-board.png" width="1280" height="1280" /></g>
  </svg>;
}

function WritingSignature({ started, reducedMotion, onFinishing }: { started: boolean; reducedMotion: boolean; onFinishing: () => void }) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const finished = useRef(false);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const strokes = [...svg.querySelectorAll<SVGPathElement>('[data-ink-stroke]')];
    const pen = svg.querySelector<SVGGElement>('[data-fountain-pen]')!;
    const complete = () => {
      onFinishing();
      strokes.forEach(path => { path.style.strokeDashoffset = '0'; });
      pen.style.opacity = '0';
      svg.dataset.writing = 'complete';
      finished.current = true;
    };
    if (reducedMotion || finished.current) { complete(); return; }
    if (!started) return;
    const segments = strokes.map(path => ({path, length: path.getTotalLength()}));
    const totalLength = segments.reduce((sum, item) => sum + item.length, 0);
    let clock = 60;
    const schedule = segments.map((item, index) => {
      const from = index ? segments[index - 1].path.getPointAtLength(segments[index - 1].length) : item.path.getPointAtLength(0);
      const to = item.path.getPointAtLength(0);
      const travel = index ? (Math.abs(from.y - to.y) > 40 ? 100 : 15) : 60;
      const moveStart = clock;
      clock += travel;
      const start = clock;
      clock += item.length / totalLength * 1900;
      return {...item, from, to, moveStart, start, end: clock};
    });
    let frame = 0;
    let epoch: number | undefined;
    let current = 0;
    let finishingAnnounced = false;
    svg.dataset.writing = 'active';
    const tick = (now: number) => {
      epoch ??= now;
      const elapsed = now - epoch;
      if (!finishingAnnounced && elapsed >= clock - 380) {
        finishingAnnounced = true;
        onFinishing();
      }
      if (document.hidden) { complete(); return; }
      while (current < schedule.length && elapsed >= schedule[current].end) {
        schedule[current].path.style.strokeDashoffset = '0';
        current++;
      }
      if (current === schedule.length) {
        const fade = Math.min(1, (elapsed - clock) / 160);
        pen.style.opacity = String(1 - fade);
        if (fade === 1) { complete(); return; }
      } else {
        const step = schedule[current];
        let x: number, y: number, lift = 0;
        if (elapsed < step.start) {
          const t = Math.max(0, (elapsed - step.moveStart) / (step.start - step.moveStart));
          const eased = t * t * (3 - 2 * t);
          lift = Math.sin(t * Math.PI);
          x = step.from.x + (step.to.x - step.from.x) * eased;
          y = step.from.y + (step.to.y - step.from.y) * eased - lift * 12;
        } else {
          const progress = Math.min(1, (elapsed - step.start) / (step.end - step.start));
          step.path.style.strokeDashoffset = String(1 - progress);
          const point = step.path.getPointAtLength(progress * step.length);
          x = point.x; y = point.y;
        }
        pen.setAttribute('transform', `translate(${x} ${y}) rotate(${28 + lift * 5})`);
        pen.style.opacity = String(Math.max(0, Math.min(1, (elapsed - 60) / 60)));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, reducedMotion, onFinishing]);
  return <h1 id="couple-names" className="signature signature-writing" aria-label="Valentina & Riccardo">
    <span className="signature-spacing" aria-hidden="true">Valentina</span><span className="signature-spacing" aria-hidden="true">&amp; Riccardo</span>
    <svg ref={svgRef} className="signature-ink" viewBox="0 0 360 170" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-barrel`} x1="0" x2="1"><stop stopColor="#192d27"/><stop offset=".4" stopColor="#496154"/><stop offset=".6" stopColor="#243d33"/><stop offset="1" stopColor="#14231e"/></linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" x2="1"><stop stopColor="#8d6a35"/><stop offset=".45" stopColor="#ead5a2"/><stop offset="1" stopColor="#b39153"/></linearGradient>
        {signaturePaths.map((glyph, index) => <mask key={index} id={`${id}-ink-${index}`} maskUnits="userSpaceOnUse" x="0" y="-20" width="360" height="210">
          {glyph.contours.map((d, part) => <path key={part} data-ink-stroke d={d} pathLength="1" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1" strokeDashoffset={reducedMotion ? 0 : 1}/>) }
        </mask>)}
      </defs>
      {signaturePaths.map((glyph, index) => <path key={index} d={glyph.d} fill="currentColor" mask={`url(#${id}-ink-${index})`}/>)}
      <g data-fountain-pen className="fountain-pen" opacity="0">
        <path d="M-4-30Q-7-53-5-79Q0-86 5-79Q7-53 4-30Z" fill={`url(#${id}-barrel)`} stroke="#22382e" strokeWidth=".6"/>
        <path d="M-5-72H5M-5-31H5" stroke={`url(#${id}-gold)`} strokeWidth="2"/>
        <path d="M3-75V-48Q3-44 1-43" fill="none" stroke="#d5bc80" strokeWidth="1.2"/>
        <path d="M-3.8-29H3.8L3-18H-3Z" fill="#23382f"/>
        <path d="M-3-18Q-7-11 0 0Q7-11 3-18Z" fill={`url(#${id}-gold)`} stroke="#9b7c43" strokeWidth=".65"/>
        <path d="M0-1V-11M-2-15 0-13 2-15" fill="none" stroke="#715c39" strokeWidth=".65"/>
        <circle cy="-11" r="1" fill="#635136"/>
        <path d="M-2-76V-38" stroke="#fff5d9" strokeWidth=".55" opacity=".38"/>
      </g>
    </svg>
  </h1>;
}

export default function Prototype() {
  const keyboard = useKeyboard();
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
  const [polaroidsReleased, setPolaroidsReleased] = useState(reducedMotion);
  const releasePolaroids = useCallback(() => setPolaroidsReleased(true), []);
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
    for (const id of ["programma", "tema", "sorprese", "lista-nozze", "conferma"]) {
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

  useEffect(() => {
    const timeline = timelineRef.current;
    const scroll = timeline?.closest<HTMLElement>('.mobile-scroll');
    const reveal = timeline?.querySelector<SVGRectElement>('.route-reveal');
    if (!timeline || !scroll || !reveal || reducedMotion) return;
    const items = [...timeline.querySelectorAll<HTMLElement>('li')];
    timeline.classList.add('route-building');
    let frame = 0;
    let drawn = 0;
    let target = 0;
    const paint = () => {
      const viewport = scroll.getBoundingClientRect();
      const bounds = timeline.getBoundingClientRect();
      const scale = bounds.height / timeline.offsetHeight || 1;
      target = Math.max(target, Math.min(timeline.offsetHeight, (viewport.bottom - bounds.top - 65) / scale));
      drawn += (target - drawn) * .18;
      if (Math.abs(target - drawn) < .5) drawn = target;
      reveal.setAttribute('height', String(Math.max(0, drawn)));
      items.forEach(item => {
        if (drawn >= item.offsetTop) item.classList.add('stop-arrived');
      });
      frame = drawn < target ? requestAnimationFrame(paint) : 0;
    };
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(paint); };
    const arrivalObserver = new IntersectionObserver(update, { root: scroll, rootMargin: "0px 0px 100px 0px" });
    items.forEach(item => arrivalObserver.observe(item));
    scroll.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      arrivalObserver.disconnect();
      scroll.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      timeline.classList.remove('route-building');
      reveal.setAttribute('height', '100%');
    };
  }, [reducedMotion, timelineRoute.height]);

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
      setTimelineRoute({ height, path, gaps: [] });
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
        <div className="invitation-loader" data-phase={loaderPhase} role="dialog" aria-modal={loaderPhase === "closed"} aria-hidden={loaderPhase === "opening"} aria-label="Apertura dell'invito">
          <img className="envelope-closed" src="/assets/wedding/invitation-envelope-blank-wax.png" alt="Busta rosa con sigillo in ceralacca V e R" draggable="false" />
          <button type="button" className="seal-trigger" aria-label="Apri l'invito" autoFocus disabled={loaderPhase !== "closed"} onClick={() => { track("envelope_opened"); setLoaderPhase("opening"); }}><span className="wax-monogram" aria-hidden="true"><span className="wax-v">V</span><span className="wax-amp">&amp;</span><span className="wax-r">R</span></span></button>
          {loaderPhase === "closed" && <div className="loader-caption">{invitation && <p className="loader-recipient">{invitation.displayName}</p>}<p className="loader-hint">Tocca il sigillo</p></div>}
        </div>
      )}
      <MobileScroll className="app-screen wedding-scroll">
        <main className="wedding-page" aria-label="Matrimonio di Valentina e Riccardo" aria-hidden={loaderPhase === "closed"} inert={loaderPhase === "closed" ? true : undefined}>
          <section className="invitation-hero" aria-labelledby="couple-names">
            <GoldPoints className="points-hero-left" />
            <GoldPoints className="points-hero-right" />
            <header className="hero-copy">
              <p className="eyebrow">Il nostro giorno</p>
              <WritingSignature started={loaderPhase !== "closed"} reducedMotion={reducedMotion} onFinishing={releasePolaroids} />
              <p className="wedding-date"><time dateTime="2027-05-22">22 Maggio 2027</time><span>Segrate · ore 15:00</span></p>
            </header>
            <section className="media-collage polaroid-collage" data-arrival={reducedMotion ? "still" : polaroidsReleased ? "falling" : "waiting"} aria-label="Le nostre Polaroid">
              <figure className="original-polaroid polaroid-kiss"><img src="/assets/wedding/polaroid-kiss.png" alt="Polaroid di Valentina e Riccardo che si baciano a Natale" draggable="false" /></figure>
              <figure className="original-polaroid polaroid-ring"><img src="/assets/wedding/polaroid-ring.png" alt="Polaroid di Valentina sorridente con il suo anello" draggable="false" /></figure>
            </section>
            <button ref={scrollCueRef} className="scroll-invitation-cue" type="button" onClick={() => goTo("programma")} aria-label="Scorri verso il basso per accedere alla partecipazione"><ChevronDownIcon aria-hidden="true" /></button>
          </section>

          <section className="day-section" id="programma" aria-label="Programma del matrimonio">
            <GoldPoints className="points-program" />
            <ol className="day-timeline" ref={timelineRef}>
              <svg className="timeline-route" viewBox={`0 0 62 ${timelineRoute.height}`} preserveAspectRatio="none" aria-hidden="true"><defs><clipPath id={`${routeMaskId}-reveal`}><rect className="route-reveal" width="62" height="100%" /></clipPath><mask id={routeMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="62" height={timelineRoute.height}><rect width="62" height={timelineRoute.height} fill="white" />{timelineRoute.gaps.map((y, index) => <rect key={index} x="0" y={y} width="62" height="80" fill="black" />)}</mask></defs><g clipPath={`url(#${routeMaskId}-reveal)`}><path d={timelineRoute.path} mask={`url(#${routeMaskId})`} /></g></svg>
              <li><span className="timeline-stop" aria-hidden="true"></span><div><h3><time dateTime="2027-05-22T15:00:00+02:00">15:00</time></h3><p>Chiesa di Santo Stefano<br />Segrate</p><MapsLink place="church" onClick={() => track("external_link_clicked", "church_maps")} /><figure className="program-photo program-photo-church"><img src="/assets/wedding/church.png" alt="Il campanile della Chiesa di Santo Stefano a Segrate" loading="lazy" draggable="false" /><figcaption>Il nostro Sì!</figcaption></figure></div></li>
              <li><span className="timeline-stop" aria-hidden="true"></span><div><h3><span>A seguire</span></h3><p>Il Fondaco dei Mercanti</p><MapsLink place="venue" onClick={() => track("external_link_clicked", "venue_maps")} /><figure className="program-photo program-photo-venue"><video ref={videoRef} src="/assets/wedding/fondaco.mp4" aria-label="Atmosfera del Fondaco dei Mercanti" autoPlay={!reducedMotion && loaderPhase === "hidden"} muted loop playsInline preload="metadata" /><figcaption>Ricevimento</figcaption></figure></div></li>
              <li><span className="timeline-stop" aria-hidden="true"></span><div><h3><span>Fino a tardi</span></h3><p>Balliamo insieme<br />sotto le luci.</p><figure className="program-photo program-photo-party"><img src="/assets/wedding/dancing-lights.png" alt="Luci calde per festeggiare insieme" loading="lazy" draggable="false" /><figcaption>Musica e Festa</figcaption></figure></div></li>
            </ol>
          </section>

          <section className="theme-section" id="tema" aria-labelledby="tema-title">
            <WoodlandSign reducedMotion={reducedMotion} />
            <h2 id="tema-title">Benvenuti nel<br />Bosco Incantato</h2>
            <p>Abbiamo scelto il bosco come simbolo del nostro amore: un luogo in cui ogni elemento trova il proprio spazio, tra alberi, radici intrecciate, foglie mosse dal vento e sentieri che si incontrano.</p>
            <p>Un ambiente in cui ogni cosa, con la propria bellezza e unicità, contribuisce a creare qualcosa di speciale. Proprio come l’amore, che nasce dall’incontro di due mondi e cresce attraverso tutto ciò che si sceglie di condividere.</p>
            <div className="theme-dress"><ThemeIcon /><p>Nessun dress code e nessun colore tema: scegliete ciò che vi rappresenta e vi fa sentire belli, felici e luminosi.</p></div>
          </section>

          <section className="surprise-section" id="sorprese" aria-labelledby="sorprese-title">
            <h2 id="sorprese-title">Dediche e sorprese</h2>
            <p className="surprise-copy">Avete in mente una canzone da dedicarci, una coreografia o un discorso durante il ricevimento?</p>
            <p className="surprise-copy">Luca Ferro, il conduttore della festa, raccoglierà le vostre idee per inserirle nella scaletta della serata. Contattatelo per tempo per aiutarci a organizzare al meglio ogni momento!</p>
            <div className="surprise-contact">
              <p className="small-label">Il vostro complice alla festa</p>
              <p className="surprise-contact-name">Luca Ferro</p>
              <p className="surprise-contact-number">{lucaWhatsappNumber}</p>
              {lucaWhatsappUrl ? <a className="surprise-whatsapp" href={lucaWhatsappUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" onClick={() => track("external_link_clicked", "luca_whatsapp")} aria-label="Scrivi a Luca Ferro su WhatsApp con un messaggio precompilato (si apre in una nuova scheda)"><WhatsAppIcon /><span className="contact-button-copy"><strong>Scrivi a Luca</strong><small>su WhatsApp</small></span><ArrowTopRightIcon aria-hidden="true" /></a>
                : <div className="surprise-whatsapp surprise-whatsapp-pending" aria-label="Contatto WhatsApp di Luca Ferro in arrivo"><WhatsAppIcon /><span>Contatto WhatsApp in arrivo</span></div>}
            </div>
          </section>

          <div className="invitation-closing">
            <GoldPoints className="points-closing-left" />
            <GoldPoints className="points-closing-right" />
            <section className="gift-section" id="lista-nozze" aria-labelledby="lista-nozze-title">
              {giftView === "choices" ? <>
                <h2 id="lista-nozze-title" ref={giftHeadingRef} tabIndex={-1}>Un pensiero per noi</h2>
                <p className="gift-copy">Gradiamo i regali sentiti, pensati con cura, che raccontano qualcosa di noi e racchiudono un pezzetto di chi li sceglie. Se avete un’idea speciale, saremo felici di scoprirla!</p>
                <p className="gift-copy">In tanti ci avete chiesto come contribuire ai nostri sogni:</p>
                <div className="gift-choices" aria-label="Un contributo al nostro viaggio">
                  <button className="gift-choice" type="button" onClick={() => showGiftView("bank")}>
                    <ClosingIcon kind="patagonia" />
                    <strong>Verso la fine del mondo</strong>
                    <span className="gift-choice-description">Un piccolo contributo al nostro viaggio in Patagonia.</span>
                    <span className="gift-choice-action">Vai alle coordinate <ArrowTopRightIcon aria-hidden="true" /></span>
                  </button>

                </div>
              </> : <div className="gift-detail" id="gift-detail">
                <button className="gift-back" type="button" onClick={() => showGiftView("choices")}>← Torna al nostro viaggio</button>
                <>
                  <p className="eyebrow">Il nostro viaggio</p>
                  <ClosingIcon kind="patagonia" />
                  <h2 id="lista-nozze-title" ref={giftHeadingRef} tabIndex={-1}>Verso la fine del mondo</h2>
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
                <p className="rsvp-intro">Indica la presenza e le esigenze per ogni persona del nucleo. Potrai modificare tutto riaprendo questo link.</p>
                {invitation.guests.map((guest) => <div className="rsvp-person" key={guest.id}><p className="rsvp-person-name">{guest.firstName} {guest.lastName}</p><div className="rsvp-options" role="group" aria-label={`Presenza di ${guest.firstName} ${guest.lastName}`}>
                  <button type="button" ref={guest.id === invitation.guests[0]?.id ? answerRef : undefined} aria-pressed={answers[guest.id] === true} className={answers[guest.id] === true ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [guest.id]: true }); setRsvpError(""); }}><span aria-hidden="true">✓</span> Presente</button>
                  <button type="button" aria-pressed={answers[guest.id] === false} className={answers[guest.id] === false ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [guest.id]: false }); setRsvpError(""); }}><span aria-hidden="true">−</span> Assente</button>
                </div>{answers[guest.id] === true && <div className="rsvp-meal" role="group" aria-label={`Menù di ${guest.firstName} ${guest.lastName}`}>
                  <p className="small-label">Menù ed esigenze alimentari</p>
                  <div className="meal-choices">
                    <button type="button" className={mealAnswers[guest.id]?.choice === 'none' ? 'selected' : ''} aria-pressed={mealAnswers[guest.id]?.choice === 'none'} onClick={() => updateMeal(guest.id, { choice: 'none', note: '' })}>Nessuna esigenza</button>
                    <button type="button" className={mealAnswers[guest.id]?.choice === 'needs' ? 'selected' : ''} aria-pressed={mealAnswers[guest.id]?.choice === 'needs'} onClick={() => updateMeal(guest.id, { choice: 'needs' })}>Ho esigenze alimentari</button>
                  </div>
                  {mealAnswers[guest.id]?.choice === 'needs' && <label className="meal-note">Allergie, intolleranze o scelte alimentari di {guest.firstName}<KeyboardTextarea value={mealAnswers[guest.id].note} maxLength={500} rows={3} placeholder="Per esempio: allergia alla frutta a guscio, vegetariano…" onChange={(event) => updateMeal(guest.id, { note: event.target.value })} onBlur={() => keyboard.hide()} /></label>}
                  <label className="child-menu"><input type="checkbox" checked={mealAnswers[guest.id]?.childMenu ?? false} onChange={(event) => updateMeal(guest.id, { childMenu: event.target.checked })} /> Menù bambino per {guest.firstName}</label>
                </div>}</div>)}
                {rsvpError && <p className="rsvp-error" role="alert">{rsvpError}</p>}
                <button className="primary-action" type="button" disabled={rsvpSaving || invitation.guests.length === 0 || !invitation.guests.every(rsvpComplete)} onClick={() => void saveAnswers()}>{rsvpSaving ? "Salvataggio…" : "Salva le risposte"}</button>
                <button className="secondary-action" type="button" onClick={() => { keyboard.hide(); setRsvpOpen(false); }}>Annulla</button>
              </div> : <div className="rsvp-ready">{rsvpSaved && <p className="rsvp-success" role="status"><CheckCircledIcon aria-hidden="true" />Risposte salvate.</p>}<button className="primary-action" type="button" onClick={openRsvp}>Conferma Presenza</button></div>
                : <div className="rsvp-unavailable"><p>{inviteState === "loading" ? "Caricamento dell'invito…" : inviteState === "missing" ? "Apri il link personale presente sulla partecipazione per confermare la presenza." : inviteState === "error" ? "Non riusciamo a caricare il vostro invito. Controlla la connessione e riprova." : "Invito non disponibile. Contatta gli sposi per verificare il link."}</p>{inviteState === "error" && <button type="button" className="secondary-action" onClick={() => window.location.reload()}>Riprova</button>}</div>}
            </section>
            <footer className="invitation-footer"><Signature /><p className="sr-only">Valentina e Riccardo · 22 Maggio 2027</p></footer>
          </div>
        </main>
      </MobileScroll>

    </>
  );
}
