# Design QA — Wedding mobile hero

- Source visual truth: `source-reference.png`
- Implementation top screenshot: `implementation-mobile-screen.png`
- Implementation lower screenshot: `implementation-mobile-bottom.png`
- Combined comparison: `design-qa-comparison.png`
- Source pixels: 864 × 1821
- Implementation capture: 393 × 852 pixels at a 393 × 852 CSS phone screen, device scale factor 1
- Source normalization: resized to 393 × 829 and vertically centered beside the implementation in the combined comparison
- State: iPhone, page top plus lower scrolled state; video autoplaying muted and looping

## Full-view comparison evidence

The side-by-side comparison confirms the same warm cream paper field, torn collage structure, dusty-rose tape, muted sage accents, left-aligned name block, compact detail typography, and sage confirmation CTA. The supplied church replaces the original upper-left image and the supplied video intentionally replaces the original upper-right image. The lower dancing-lights image remains visually consistent with the source and is shifted slightly left per the latest annotation. The larger cream gap between the lower photo and names is an intentional user-requested change.

## Focused region evidence

The lower-state capture verifies the name spacing, date, ceremony/reception details, CTA, closing copy, and readable text scale. A separate focus crop was not needed because all typography and controls are legible at the 393 × 852 capture size.

## Required fidelity surfaces

- Fonts and typography: DM Sans matches the source's relaxed rounded sans-serif direction; the dusty-rose `e` uses a restrained Cormorant Garamond italic accent. Weight, line height, wrapping, and hierarchy remain readable at mobile size.
- Spacing and layout rhythm: collage proportions and overlap follow the source; the name block has intentionally more breathing room from the lower image. Details and CTA have consistent 30px side margins.
- Colors and visual tokens: warm cream, deep green, pastel sage, and dusty antique rose match the source palette. Contrast remains sufficient for body copy and controls.
- Image quality and asset fidelity: the supplied church image is sharp, recognizable, and cropped upward so the people at street level are no longer visible. The supplied MP4 is rendered directly as video, not as a placeholder, and the lower dancing-lights source remains intact. Torn masks preserve the collage art direction.
- Copy and content: names, date, ceremony time/place, reception venue, CTA, and closing line are present and correctly spelled.

## Interaction checks

- Video autoplay, mute, and loop: passed. The visible pause control was removed by request.
- Menu bottom sheet open and close: passed.
- RSVP bottom sheet and confirmation success state: passed.
- Browser console warnings/errors: none.
- Runtime integrity check: passed.

## Comparison history

1. Earlier P1: the first implementation used an editorial serif for the names, unlike the selected source. Fixed by switching the names to DM Sans and restoring lowercase styling. Post-fix evidence: `design-qa-comparison.png`.
2. Earlier P2: the first implementation added a centered header mark, header date, and `Ci sposiamo` pretitle absent from the source. Fixed by retaining only the source-style menu control and removing the extra pretitle. Post-fix evidence: `design-qa-comparison.png`.
3. Earlier interaction issue: the play/pause control overlapped the higher-z lower photo. Fixed by moving it to the unobstructed upper-right of the video frame. Retest passed.
4. Latest annotations: moved the lower lights image 12px left, raised and enlarged the church crop to remove the people, capitalized “Valentina” and “Riccardo”, and removed the video pause control. Retest passed at the mobile viewport.

## Findings

No remaining actionable P0, P1, or P2 differences. The device status bar and bezel are template-owned runtime chrome and intentionally absent from the flat source mockup.

## Follow-up polish

- P3: test alternate video object positions after the user reviews which moments of the supplied footage feel strongest in the crop.

final result: passed

---

# Design QA — Continuous invitation landing

- Source visual truth: the implemented opened-envelope artwork, used both by the reveal overlay and the first landing viewport.
- Implementation screenshots: `qa/continuous-invitation-top.png` and `qa/continuous-invitation-content.png`.
- Implementation viewport: iPhone preset, 393 × 852 CSS pixels.
- State: revealed invitation at the top, then the continued ivory card after activating `Continua sull'invito`.

## Full-view comparison evidence

The reveal overlay and the page beneath use the same `invitation-envelope-open.webp` asset with identical full-cover positioning. When the overlay dissolves there is no visual cut to the former standalone collage. The next viewport continues on a narrow ivory paper card framed by the same dusty-pink envelope color.

## Required fidelity surfaces

- Typography: invitation-style Cormorant Garamond leads the continued card; DM Sans remains limited to small labels and controls.
- Spacing and layout rhythm: the first screen is exactly one device-screen tall on both supported device presets; the continuation begins on the next scroll step.
- Colors and visual tokens: dusty rose envelope edges, warm ivory paper, deep green type, and antique-rose labels remain consistent.
- Image quality and asset fidelity: the exact opened-envelope artwork remains the top-level visual; supplied church, Fondaco video, and dancing-lights assets continue inside the invitation card.
- Copy and content: names/date remain on the revealed card; ceremony, reception, RSVP, and closing copy remain available below.

## Interaction checks

- Seal reveal dissolves onto the identical open-envelope first viewport: passed.
- `Continua sull'invito` scrolls to the ivory card continuation: passed.
- RSVP bottom sheet opens from the continued invitation: passed.
- Runtime integrity and production build: passed.

## Findings

No remaining actionable P0, P1, or P2 differences for the requested continuity direction. The iPhone and Pixel hero heights are mapped to their runtime screen geometries so the reveal handoff stays aligned on both presets.

final result: passed

---

# Design QA — Interactive envelope intro

- Source visual truth: `reference-envelope-video-frame.jpg` and `reference-envelope-video-open.jpg`, captured from the supplied WhatsApp reference video.
- Implementation screenshots: `implementation-envelope-closed.jpg` and `implementation-envelope-open.jpg`.
- Combined comparison: `design-qa-envelope-comparison.jpg`.
- Source video pixels: 464 × 720; normalized into a 393 × 852 comparison panel with letterboxing.
- Implementation pixels: 393 × 852 at a 393 × 852 CSS phone screen, device scale factor 1.
- State: closed envelope before interaction and opened invitation after tapping the seal.

## Full-view comparison evidence

The combined two-state comparison confirms the requested interaction model and visual hierarchy: a full-screen dusty-pink envelope, tactile floral embossing, centered round wax seal, clear triangular flap geometry, and an opened state that reveals the couple's names and date. The implementation intentionally removes the source video's recorded hand, browser chrome, and social-media controls, replacing them with a clean app-native interaction while preserving the core visual idea.

## Focused region evidence

The center seal and invitation lettering are large and legible in the full 393 × 852 captures, so a separate focus crop was not required. The generated seal contains the correct `V&R` monogram; the revealed card contains `Valentina & Riccardo` and `22 maggio 2027`.

## Required fidelity surfaces

- Fonts and typography: the invitation lettering uses refined calligraphic type embedded in the generated stationery asset; the small functional controls use the existing DM Sans/Cormorant system.
- Spacing and layout rhythm: the envelope fills the phone screen edge to edge, the seal is centered, and the invitation reveal preserves a strong vertical axis.
- Colors and visual tokens: dusty rose, warm ivory, and muted deep green extend the existing wedding palette and avoid the previously rejected dark-green full-page treatment.
- Image quality and asset fidelity: both states use optimized 768 × 1365 WebP assets generated specifically for the loader; there are no CSS-drawn envelope or seal substitutes.
- Copy and content: `V&R`, `Valentina & Riccardo`, `22 maggio 2027`, `Tocca il sigillo`, and `Salta intro` are present and correct.

## Interaction checks

- Tap centered seal → opening transition → invitation reveal → landing-page dissolve: passed.
- `Salta intro` dismisses the overlay: passed.
- Automatic fallback opening after inactivity: implemented.
- Reduced-motion preference bypasses the animated intro: implemented.
- Browser console errors: none observed during interaction testing.
- Runtime integrity check: passed.

## Comparison history

1. Initial attempt used a generic stock clip of a hand cracking a wax seal. It did not match the supplied reference's full-screen envelope interaction closely enough.
2. Replaced the passive stock video with two original coordinated stationery assets and a tappable seal interaction. Post-fix evidence: `design-qa-envelope-comparison.jpg`.

## Findings

No remaining actionable P0, P1, or P2 differences. The source's recorded phone, hand, browser bar, and social-media UI are intentionally excluded from the product implementation.

## Follow-up polish

- P3: after review, the reveal hold can be shortened or lengthened without changing the visual design.

final result: passed

---

# Design QA — Option 3, Sotto gli alberi — 12 September 2026

This is the current review. Earlier entries above are preserved as historical work.

## Visual source and evidence

- Exact selected source: `C:/Users/eddaj/.codex/generated_images/01a020b2-aba9-7293-9f45-6e9689badc3c/exec-eba18db5-f0d8-4c13-8a57-c887107fb9f0.png` (third displayed option, 1488 × 1058 pixels).
- Implementation: `http://127.0.0.1:5173/`, official wedding-mobile-prototype project.
- Final comparisons, source and implementation in the SAME image: `qa/option-3/comparison-hero-final.png`, `qa/option-3/comparison-program-final.png`, `qa/option-3/comparison-closing-final.png`.
- Corresponding unscaled screen captures: `qa/option-3/comparison-hero-final-screen.png`, `qa/option-3/comparison-program-final-screen.png`, `qa/option-3/comparison-closing-final-screen.png`.
- Focused typography/link comparison: `qa/option-3/typography-detail.png`.
- Flow evidence: `qa/option-3/closed-final-full.png`, `qa/option-3/locations-final-full.png`, `qa/option-3/gift-expanded-full.png`, `qa/option-3/rsvp-fixed-full.png`.
- Responsive evidence: `qa/option-3/pixel-hero-final-full.png`, `qa/option-3/pixel-program-full.png`.

## Normalization and state

The source is three page excerpts from one continuous invitation, without device chrome. Each 472 × 986 source panel was normalized to 393 × 821, preserving aspect ratio. The implementation phone screen was measured at 393 × 852 CSS pixels, scale 1 (bounding box 392.997 × 851.989). Browser DPR is 1.1, but the screenshot tool returns CSS-density full captures, 2133/2134 × 1145; cropping at the measured screen bounds produces 393 × 852 pixels. A direct clipped tool capture had inconsistent DPR handling and was discarded from comparison. Source and implementation are aligned at their top; the 31px height difference and protected status/camera/home chrome are explicitly excluded from fidelity findings. States are the opened hero, program after the down-arrow action, and gift/RSVP at the bottom with disclosures closed and no response selected.

Pixel was measured at 427 × 952 CSS pixels, scale 1. The app reserves 48px for Android navigation; hero height is 904px and the complete arrow target ends 9px above that reserved region. Desktop canvas width never controls app typography or layout.

## Findings and iteration history

1. **P2, paper continuity.** Initial program and collage botanical images showed white rectangles because blend layers were isolated from the paper. Evidence: `comparison-program-1.png` and the intermediate hero captures. Removed unnecessary stacking isolation; final comparisons show imagery blended into the same ivory surface, with no white rectangles.
2. **P2, hierarchy and rhythm.** Initial names were oversized, program anchor introduced an extra 62px offset, and timeline rows extended beyond the reference composition. Names reduced from 100px to 86px; program offset removed, number/content columns and row spacing calibrated. Evidence: `comparison-hero-2.png`, `comparison-program-1.png`, `comparison-program-2.png`, and the final comparisons.
3. **P2, botanical cropping.** Hero initially had a visibly cut-off trunk; closing roots started at a hard straight edge and approached the signature. Added a dedicated canopy-only asset, softened the real root image's upper mask, moved program roots below the text, and raised the footer signature. Final hero and closing comparisons resolve the collision/crop issues.
4. **P2, closing proportions.** Initial gift text was too wide and signature too large. Narrowed the closing text measure to 257px on iPhone, increased gift title and RSVP heading, retained a slightly wider 273px primary action, and reduced the footer signature. Tightened heading/body/link spacing to the source. Evidence: `comparison-closing-1.png`, `comparison-closing-2.png`, `comparison-closing-final.png`.
5. **P1, navigation moved the device frame.** Native `scrollIntoView` could scroll overflow-hidden device ancestors, expose off-screen keyboard artwork and move status chrome. Replaced it with a clamped, scale-aware scroll of the nearest `.mobile-scroll` only. Retested menu navigation and RSVP selection: device scrollTop remains 0, screen top equals app-viewport top, keyboard state stays false. Evidence: `rsvp-fixed-full.png` and `locations-final-full.png`. Protected runtime files were not changed.
6. **P2, safe areas.** Lowered intro z-index below live device chrome and corrected Pixel hero height from 925px to its 904px available area. Evidence: `closed-final-full.png` and `pixel-hero-final-full.png`; measured arrow bottom 991.5 vs app viewport bottom 1000.5.

No actionable P0/P1/P2 differences remain after the final combined visual comparisons and flow retest.

## Required fidelity surfaces

- **Typography:** supplied Cherolina retained for the couple, Cormorant Garamond 500 for editorial headings/body, DM Sans only for small labels. Names, two-line date, numbered rows, two-line gift heading and RSVP hierarchy are present and legible. Actual font contours differ slightly from the generated mock; retaining the user's font is intentional. Focused comparison verifies number/text separation and Maps affordances.
- **Layout:** continuous paper, narrow pink edges, top embossed corners, centered names above the print collage, left-aligned program and gift, centered final RSVP. No generic cards or section-icon clutter. Touch targets are at least 44px high. Extra address details live in a disclosure rather than a new visual card system.
- **Color:** warm ivory paper, muted olive ink, pale sage numbers, dusty pink edges and restrained green button. Main text #293e30 on #f8f3e8 and CTA ivory on #42523e provide clear contrast. Decorative gold points are deliberately quieter than the mock, without stars or large halos.
- **Images:** actual church, supplied Fondaco video and original lights photo retained; church crop omits street-level people and lights crop excludes the old torn/taped edge. New fine botanical/paper imagery uses optimized WebP totaling 268,062 bytes. Artwork is raster, not CSS or SVG stand-ins. Generated PNG originals remain available. Video frames vary naturally from the static reference. No missing images in either device test.
- **Content:** correct names, 22 maggio 2027, ceremony at 15:30, church and reception names, program, Maps links, gift introduction and RSVP. No invented IBAN. Response success explicitly states that it is a local preview, not a sent confirmation.

## Functional checks

- Seal click, one-time closed hint, skip intro, focus transfer to arrow: passed.
- Down arrow and menu navigation: passed; scroll remains inside the invitation.
- Maps: both existing Google Maps destination URLs and new-tab link semantics verified in the browser DOM; no external navigation or address revalidation was needed for this visual change.
- Address and gift disclosure expansion/collapse: passed.
- RSVP yes/no, response messaging and modify: passed. Local state only, no network submission.
- Video muted autoplay/loop: observed playing with currentTime advancing after reveal; reduced-motion handling pauses video and disables decorative animation in code.
- iPhone and Pixel: no horizontal overflow, unloaded imagery, clipped primary controls, or visible error overlay.
- `npm run check:runtime`: passed, 28 protected files unchanged.
- `npm run build`: passed. `npm run test:sites`: 4/4 passed. `git diff --check`: no whitespace errors (only Windows line-ending notices).
- Console log stream was not exposed by the available browser interface; a full console audit and OS-level reduced-motion emulation were not performed. Build, live browser interactions, resource state and absence of a runtime error overlay were checked instead.

## Follow-up polish / scope

- P3: the tiny gold flecks could be slightly more visible if requested; the current treatment favors subtlety.
- The exact generated handwriting angle and individual leaf shapes are not reproduced pixel-for-pixel; the actual supplied font and coherent botanical raster assets are intentional.
- IBAN and real RSVP delivery remain separate unfinished production tasks, unchanged in scope. No deployment or Git push was performed.

## Implementation checklist

- [x] Selected third visual implemented across the continuous invitation.
- [x] All real and generated assets installed and visually inspected.
- [x] Final source/render comparisons and mobile interaction retests completed.
- [x] Runtime integrity, build and Sites packaging tests passed.
- [x] Local preview retained; no deployment.

final result: passed
