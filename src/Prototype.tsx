import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowTopRightIcon, CheckCircledIcon, CheckIcon, ChevronDownIcon, CopyIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import "@fontsource/cutive-mono/400.css";
import { BottomSheet, KeyboardTextarea, MobileScroll, useKeyboard } from "./mobile";
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
/* Bespoke invitation illustrations: ink contours, fine engraving and translucent washes.
   Coordinates stay in SVG space so only the intended details move. */
function ProgramIcon({ kind }: { kind: "church" | "venue" | "party" }) {
  return <svg className={`program-icon program-icon-${kind}`} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === "church" ? <>
      <path className="icon-wash" d="M56 22h25v84H56zM21 68l24-15 11 8v45H21z" />
      <path className="icon-shade" d="m81 22 8-5v89h-8ZM45 53l11 8v45H45z" />
      <path d="M14 108h84M18 104h75M23 104V69m0 0 23-15 10 7M19 69l27-19 10 7M26 71l20-13 10 6M56 104V25h25v79M81 25l8-5v84M53 25h31l8-6H56ZM53 19h31l8-6H56ZM58 19V9h22v10M80 9l8-4v9M56 9h26l8-5H59Z" />
      <path d="M61 45V34a7 7 0 0 1 14 0v11ZM60 49h17M56 55h25M56 78h25M60 81v20M77 81v20M35 104V91a6 6 0 0 1 12 0v13M31 104V89a10 10 0 0 1 20 0v15" />
      <circle cx="68.5" cy="66" r="8" /><path d="M68.5 60v6l4 2" />
      <g className="church-bell"><path className="icon-gold-wash" d="M64 41h9l-2-3v-4a2.5 2.5 0 0 0-5 0v4Z" /><path d="M63 42h11m-6 0v2" /></g>
      <path className="icon-detail" d="M64 28v13m-3 5h14M60 57h17M60 75h17M67 86v6M41 90v14M27 75h24M27 78h24M85 28v23m0 5v20m0 5v19M59 11v5m4-5v5m4-5v5m4-5v5m4-5v5M65 59l1 2m8 3-2 1m0 7-1-2m-8-4h-2" />
      <path className="icon-ground" d="M9 112h31m5 0h38m7-3h17" />
    </> : kind === "venue" ? <>
      <path className="icon-wash" d="M14 50h92v52H14z" />
      <path className="icon-gold-wash" d="m10 47 19-22h62l20 22Z" />
      <path d="M8 105h104M14 101V50h92v51M10 47l19-22h62l20 22ZM11 50h98M15 56h90M23 32V17h9v8M21 17h13M19 101V77a10 10 0 0 1 20 0v24m11 0V77a10 10 0 0 1 20 0v24m11 0V77a10 10 0 0 1 20 0v24M16 101h88" />
      <path className="venue-light venue-light-one" d="M23 96V77a6 6 0 0 1 12 0v19Z" />
      <path className="venue-light venue-light-two" d="M54 96V77a6 6 0 0 1 12 0v19Z" />
      <path className="venue-light venue-light-three" d="M85 96V77a6 6 0 0 1 12 0v19Z" />
      <path d="M34 41v-6h9v6Zm22 0v-6h9v6Zm22 0v-6h9v6Z" />
      <path className="icon-detail" d="M17 59h86M29 72v27m31-27v27m31-27v27M20 83h18m13 0h18m13 0h18M43 68v30m3-30v30m28-30v30m3-30v30M26 64h6m23 0h10m21 0h8M30 28h59M26 31h18m5 0h20m6 0h17M17 44h85M18 107h84M23 111h22m29 0h23" />
      <path className="icon-accent" d="M9 80c-5-7-3-14 0-18 5 6 7 13 0 18Zm0 0v21m102-21c-5-7-3-14 0-18 5 6 7 13 0 18Zm0 0v21" />
    </> : <>
      <g className="party-glass-left">
        <path className="icon-wash" d="M21 28h24l-3 30c-1 12-17 12-18 0Z" />
        <path d="M21 28h24l-3 30c-1 12-17 12-18 0ZM33 67v29m-13 4c3-6 23-6 26 0Z" />
        <path className="icon-accent" d="M24 47c6 2 12 2 18 0" />
        <path className="icon-detail" d="m26 33 2 24c0 4 2 6 4 7M24 103h18" />
        <circle className="icon-bubble" cx="33" cy="55" r="1" /><circle className="icon-bubble" cx="36" cy="42" r="1" />
      </g>
      <g className="party-glass-right">
        <path className="icon-gold-wash" d="M75 28h24l-3 30c-1 12-17 12-18 0Z" />
        <path d="M75 28h24l-3 30c-1 12-17 12-18 0ZM87 67v29m-13 4c3-6 23-6 26 0Z" />
        <path className="icon-accent" d="M78 47c6 2 12 2 18 0" />
        <path className="icon-detail" d="m80 33 2 24c0 4 2 6 4 7M78 103h18" />
        <circle className="icon-bubble" cx="87" cy="56" r="1" /><circle className="icon-bubble" cx="90" cy="39" r="1" />
      </g>
      <g className="party-notes icon-accent"><path d="M54 21V10l13-3v11M54 14l13-3" /><ellipse cx="51" cy="22" rx="3" ry="2" /><ellipse cx="64" cy="19" rx="3" ry="2" /></g>
      <path className="party-confetti icon-accent" d="M58 34v-5m-9 7-3-3m21 3 3-3" />
      <path className="icon-ground" d="M20 111c22-3 58-3 80 0" />
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
  return <svg className={`closing-icon closing-icon-${kind}`} viewBox="0 0 144 108" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === "patagonia" ? <>
      <path className="icon-wash" d="m8 76 21-30 10 12 19-29 9 13 12-30 9 31 10-12 13 30 10-12 16 27Z" />
      <path className="icon-shade" d="m79 12-2 37-10 24h24l-7-27 4-3Zm19 19-3 28 8 15h14Z" />
      <path d="m8 76 21-30 10 12 19-29 9 13 12-30 9 31 10-12 13 30 10-12 16 27M7 79c20-4 38 3 58-1s45 3 73 0" />
      <path d="m20 59 9 3 5-9m15-11 9 5 5-9m10-12 6 8 5-6m8 13 6 5 5-3" />
      <path className="icon-detail" d="m29 62-6 10m16-14 7 15m12-26-9 25m18-30-4 19m16-27-2 15-10 24m17-27 7 27m7-27-3 13 8 15m8-13 6 13M12 74h9m17 1h8m67 3h15" />
      <g className="patagonia-waves"><path d="M13 86h26m7 0h45m8 0h31M24 93h39m7 0h49M41 100h28m7 0h24" /><path className="icon-detail" d="M52 82h17m5 8h22m-59 7h12m36 7h8" /></g>
      <circle className="patagonia-sun icon-accent" cx="33" cy="22" r="8" /><path className="icon-detail" d="M11 33h12m-6-4h6M107 19h20m-14-4h7" />
    </> : <>
      <path className="icon-wash" d="M25 47 39 37v20l33 22 33-22V37l14 10v46H25Z" />
      <path className="icon-gold-wash" d="M39 27h66v30L72 79 39 57Z" />
      <path d="M25 47 39 37m66 0 14 10M39 56V27h66v29" />
      <path d="M25 47v46h94V47L72 79ZM25 93l32-24m62 24L87 69" />
      <path className="icon-detail" d="M45 32h54M49 49h46M56 55h32M32 98h80m-68 5h56" />
      <path className="rsvp-heart icon-accent" d="M72 44s-7-4.5-7-8a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 3.5-7 8-7 8Z" />
      {[false, true].map((mirror) => <g key={String(mirror)} className="icon-accent rsvp-wheat" transform={mirror ? "translate(144 0) scale(-1 1)" : undefined}>
        <path d="M19 94C12 84 10 72 10 59" />
        <path d="M10 66C6 63 7 58 10 55c3 3 4 8 0 11ZM11 73c-5-1-8-5-7-9 5 1 8 5 7 9Zm1 7c-5 0-9-3-9-7 5 0 9 3 9 7Zm2 7c-5 1-9-2-10-6 5-1 9 2 10 6M11 73c4-2 6-6 4-10-4 2-6 6-4 10Zm1 7c5-1 8-5 7-9-5 1-8 5-7 9Zm2 7c5 0 8-4 8-8-5 0-8 4-8 8" />
      </g>)}
    </>}
  </svg>;
}
function PineTree({ transform }: { transform: string }) {
  return <g transform={transform}>
    <path className="icon-wash" d="M24 3c-2 8-6 13-10 18l5-1c-3 7-7 12-12 17l8-2C11 44 7 50 2 55l10-2C8 62 3 69-3 75c9 1 18-1 27-5 9 4 18 6 27 5-6-6-11-13-15-22l10 2c-5-5-9-11-13-20l8 2c-5-5-9-10-12-17l5 1C30 16 26 11 24 3Z" />
    <path d="M24 3c-2 8-6 13-10 18l5-1c-3 7-7 12-12 17l8-2C11 44 7 50 2 55l10-2C8 62 3 69-3 75c9 1 18-1 27-5 9 4 18 6 27 5-6-6-11-13-15-22l10 2c-5-5-9-11-13-20l8 2c-5-5-9-10-12-17l5 1C30 16 26 11 24 3ZM22 71l-1 17m5-17 1 17" />
    <path className="icon-detail" d="M24 18v49m0-39-5 3m5 3 6 4m-6 2-10 5m10 2 11 5m-11 3-16 9m16-2 18 8M17 46l-2 4m19 4 3 5M11 65l-2 4m7-7-1 4m18 1 2 4M18 90h12" />
  </g>;
}
function ThemeIcon({ dress = false }: { dress?: boolean }) {
  return <svg className={dress ? "theme-icon dress-icon" : "theme-icon forest-icon"} viewBox="0 0 144 108" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {dress ? <>
      <g className="dress-gown">
        <path className="icon-wash" d="M44 12h7c0 12 18 12 18 0h7l-3 20-7 14c7 16 10 31 24 49-18 8-42 8-60 0 14-18 17-33 24-49l-7-14Z" />
        <path d="M44 12h7c0 12 18 12 18 0h7l-3 20-7 14c7 16 10 31 24 49-18 8-42 8-60 0 14-18 17-33 24-49l-7-14ZM54 46h12" />
        <path className="icon-accent" d="M53 49h14" />
        <path className="icon-detail" d="M48 16l3 14 7 13m14-27-3 14-7 13M54 56c-1 13-6 27-12 37m17-37-3 40m8-40c2 14 6 28 13 38M36 94c15 5 33 5 48 0" />
      </g>
      <g className="dress-freedom icon-accent"><path d="M120 74c-5-7-15-5-15 3 0 8 15 15 15 15s15-7 15-15c0-8-10-10-15-3Z" /><path d="m114 80 4 4 8-8" /></g>
    </> : <>
      <path className="icon-ground" d="M7 94c14-3 27-2 38-1m43 0c17-3 33-2 49 0M57 105c-4-9 19-11 15-20" />
      <g className="forest-trees">
        <PineTree transform="translate(7 29) scale(.66)" />
        <PineTree transform="translate(46 4) scale(.94)" />
        <PineTree transform="translate(99 23) scale(.73)" />
      </g>
      <circle className="icon-accent" cx="37" cy="18" r="1.8" fill="currentColor" stroke="none" /><circle className="icon-accent" cx="94" cy="61" r="1.8" fill="currentColor" stroke="none" /><circle className="icon-accent" cx="132" cy="25" r="1.8" fill="currentColor" stroke="none" /><circle className="icon-accent" cx="9" cy="78" r="1.8" fill="currentColor" stroke="none" />
    </>}
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
              <p className="wedding-date"><time dateTime="2027-05-22">22 Maggio 2027</time><span>Segrate · ore 15:00</span></p>
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
              <svg className="timeline-route" viewBox={`0 0 62 ${timelineRoute.height}`} preserveAspectRatio="none" aria-hidden="true"><defs><mask id={routeMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="62" height={timelineRoute.height}><rect width="62" height={timelineRoute.height} fill="white" />{timelineRoute.gaps.map((y, index) => <rect key={index} x="0" y={y} width="62" height="80" fill="black" />)}</mask></defs><path d={timelineRoute.path} mask={`url(#${routeMaskId})`} /></svg>
              <li><span className="timeline-stop" aria-hidden="true"><ProgramIcon kind="church" /></span><div><h3><time dateTime="2027-05-22T15:00:00+02:00">15:00</time><span>Il nostro Sì!</span></h3><p>Chiesa di Santo Stefano<br />Segrate</p><MapsLink place="church" onClick={() => track("external_link_clicked", "church_maps")} /><figure className="program-photo program-photo-church"><img src="/assets/wedding/church.png" alt="Il campanile della Chiesa di Santo Stefano a Segrate" loading="lazy" draggable="false" /></figure></div></li>
              <li><span className="timeline-stop" aria-hidden="true"><ProgramIcon kind="venue" /></span><div><h3><span>A seguire</span><span>Il Ricevimento</span></h3><p>Il Fondaco dei Mercanti</p><MapsLink place="venue" onClick={() => track("external_link_clicked", "venue_maps")} /><figure className="program-photo program-photo-venue"><video ref={videoRef} src="/assets/wedding/fondaco.mp4" aria-label="Atmosfera del Fondaco dei Mercanti" autoPlay={!reducedMotion && loaderPhase === "hidden"} muted loop playsInline preload="metadata" /></figure></div></li>
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
            <p className="eyebrow">Il nostro bosco incantato 🌿</p>
            <h2 id="tema-title">Benvenuti nel<br />Bosco Incantato</h2>
            <p>Abbiamo scelto il bosco come simbolo del nostro amore: un luogo in cui ogni elemento trova il proprio spazio, tra alberi, radici intrecciate, foglie mosse dal vento e sentieri che si incontrano.</p>
            <p>Un ambiente in cui ogni cosa, con la propria bellezza e unicità, contribuisce a creare qualcosa di speciale. Proprio come l’amore, che nasce dall’incontro di due mondi e cresce attraverso tutto ciò che si sceglie di condividere.</p>
            <div className="theme-dress"><ThemeIcon dress /><p className="small-label">Come vestirsi</p><p>Nessun dress code e nessun colore tema: scegliete ciò che vi rappresenta e vi fa sentire belli, felici e luminosi.</p></div>
          </section>

          <section className="surprise-section" id="sorprese" aria-labelledby="sorprese-title">
            <h2 id="sorprese-title">Dediche e sorprese</h2>
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
                {invitation.guests.map((guest) => <div className="rsvp-person" key={guest.id}><p>{guest.firstName} {guest.lastName}</p><div className="rsvp-options" role="group" aria-label={`Presenza di ${guest.firstName} ${guest.lastName}`}>
                  <button type="button" ref={guest.id === invitation.guests[0]?.id ? answerRef : undefined} aria-pressed={answers[guest.id] === true} className={answers[guest.id] === true ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [guest.id]: true }); setRsvpError(""); }}>Presente</button>
                  <button type="button" aria-pressed={answers[guest.id] === false} className={answers[guest.id] === false ? "selected" : ""} onClick={() => { setAnswers({ ...answers, [guest.id]: false }); setRsvpError(""); }}>Assente</button>
                </div>{answers[guest.id] === true && <div className="rsvp-meal" role="group" aria-label={`Menù di ${guest.firstName} ${guest.lastName}`}>
                  <p className="small-label">Menù ed esigenze alimentari</p>
                  <div className="meal-choices">
                    <button type="button" className={mealAnswers[guest.id]?.choice === 'none' ? 'selected' : ''} aria-pressed={mealAnswers[guest.id]?.choice === 'none'} onClick={() => updateMeal(guest.id, { choice: 'none', note: '' })}>Nessuna esigenza</button>
                    <button type="button" className={mealAnswers[guest.id]?.choice === 'needs' ? 'selected' : ''} aria-pressed={mealAnswers[guest.id]?.choice === 'needs'} onClick={() => updateMeal(guest.id, { choice: 'needs' })}>Esigenze alimentari da indicare</button>
                  </div>
                  {mealAnswers[guest.id]?.choice === 'needs' && <label className="meal-note">Allergie, intolleranze o scelte alimentari di {guest.firstName}<KeyboardTextarea value={mealAnswers[guest.id].note} maxLength={500} rows={3} placeholder="Per esempio: allergia alla frutta a guscio, vegetariano…" onChange={(event) => updateMeal(guest.id, { note: event.target.value })} onBlur={() => keyboard.hide()} /></label>}
                  <label className="child-menu"><input type="checkbox" checked={mealAnswers[guest.id]?.childMenu ?? false} onChange={(event) => updateMeal(guest.id, { childMenu: event.target.checked })} /> Menù bambino per {guest.firstName}</label>
                </div>}</div>)}
                {rsvpError && <p className="rsvp-error" role="alert">{rsvpError}</p>}
                <button className="primary-action" type="button" disabled={rsvpSaving || invitation.guests.length === 0 || !invitation.guests.every(rsvpComplete)} onClick={() => void saveAnswers()}>{rsvpSaving ? "Salvataggio…" : "Salva le risposte"}</button>
                <button className="secondary-action" type="button" onClick={() => { keyboard.hide(); setRsvpOpen(false); }}>Annulla</button>
              </div> : <div className="rsvp-ready">{rsvpSaved && <p className="rsvp-success" role="status"><CheckCircledIcon aria-hidden="true" />Risposte salvate.</p>}{invitation.guests.some((guest) => guest.attending !== null) && <p className="rsvp-existing">{invitation.guests.map((guest) => `${guest.firstName}: ${guest.attending === true ? "presente" : guest.attending === false ? "assente" : "in attesa"}`).join(" · ")}</p>}<button className="primary-action" type="button" onClick={openRsvp}>{invitation.guests.some((guest) => guest.attending !== null) ? "Modifica le risposte" : "Conferma la presenza"}</button></div>
                : <div className="rsvp-unavailable"><p>{inviteState === "loading" ? "Caricamento dell'invito…" : inviteState === "missing" ? "Apri il link personale presente sulla partecipazione per confermare la presenza." : inviteState === "error" ? "Non riusciamo a caricare il vostro invito. Controlla la connessione e riprova." : "Invito non disponibile. Contatta gli sposi per verificare il link."}</p>{inviteState === "error" && <button type="button" className="secondary-action" onClick={() => window.location.reload()}>Riprova</button>}</div>}
            </section>
            <footer className="invitation-footer"><Signature /><p className="sr-only">Valentina e Riccardo · 22 Maggio 2027</p><details className="privacy-note"><summary>Privacy e attività dell'invito</summary><p>Per organizzare il matrimonio, associamo al codice della partecipazione l'apertura dell'invito, le sezioni visitate, i clic sui link, le risposte RSVP e le esigenze alimentari indicate per ciascuna persona. Questi dati sono consultabili dagli sposi nel pannello riservato per organizzare il ricevimento. Non registriamo digitazioni, movimenti del puntatore o posizione.</p></details></footer>
          </div>
        </main>
      </MobileScroll>
      <BottomSheet open={sheet === "menu"} onOpenChange={(open) => !open && setSheet(null)} title="Il nostro giorno" snap={0.48}>
        <nav className="sheet-menu" aria-label="Le sezioni dell'invito">
          {[["programma", "Il programma"], ["luoghi", "Come arrivare"], ["tema", "Il nostro tema"], ["sorprese", "Dediche e sorprese"], ["lista-nozze", "Un pensiero per noi"]].map(([id, label]) => <button type="button" key={id} onClick={() => { setSheet(null); window.setTimeout(() => { if (id === "lista-nozze") showGiftView("choices"); goTo(id); }, 180); }}>{label}<ArrowTopRightIcon aria-hidden="true" /></button>)}
          <button type="button" onClick={() => { setSheet(null); window.setTimeout(openRsvp, 180); }}>Conferma la presenza<ArrowTopRightIcon aria-hidden="true" /></button>
        </nav>
      </BottomSheet>
    </>
  );
}
