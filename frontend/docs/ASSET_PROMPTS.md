# RESET — Image / Asset Generation Prompts

These are the assets I can't author well in code. Generate them with an image
tool (Midjourney, DALL·E, Ideogram, Adobe Firefly) or commission a designer,
then drop them into `frontend/public/illustrations/` (or `/public/audio/` for
sound). Filenames are suggested in each section.

**Global style anchor — paste this into every image prompt:**

> Premium wellness app illustration, Apple Health / Calm / Headspace art
> direction. Soft translucent glass and pearl materials, gentle volumetric
> light, lavender (#7C6BF0) and soft blue (#5B7CFA) palette with pink (#F06BA8)
> accents. Minimal, calm, emotionally reassuring. Subtle grain, no harsh
> shadows, no text, no logos, no people's faces. Centered composition on a
> transparent or very soft gradient background. Flat-ish depth, not cartoonish.

Export at 1024×1024 PNG with transparency where possible. Provide a **light** and
a **dark** variant of each (swap the background from pearl-white to deep navy
#0D1020, keep the object glowing).

---

## 1. Editorial illustrations (feature cards / empty states)

**Journal** — `illustrations/journal.png`
> [global style] A notebook made from layered translucent glass panes, softly
> glowing pages, a single ribbon bookmark of lavender light. Floating gently.

**Recovery** — `illustrations/recovery.png`
> [global style] A glowing crystal growing upward from a soft base, faceted
> lavender-blue, internal light, small light particles rising around it.

**Calm Mode** — `illustrations/calm.png`
> [global style] Soft concentric ripples on still water, moonlit, a single
> point of light at the center expanding outward. Serene, minimal.

**Insights** — `illustrations/insights.png`
> [global style] A constellation of softly glowing nodes connected by thin
> luminous lines, forming an abstract pattern. Deep calm background.

**Goals** — `illustrations/goals.png`
> [global style] A minimal mountain silhouette with a soft sunrise glow behind
> the peak, one bright point of light at the summit. Layered glass ridges.

**Achievements** — `illustrations/achievements.png`
> [global style] An elegant crystal shelf holding a few glowing faceted crystals
> of different heights, soft reflections, museum-like calm.

---

## 2. Premium empty-state hero (used when a screen has no data yet)

`illustrations/empty-journal.png`
> [global style] A single blank glass page catching soft light, one faint line
> of light suggesting the first written sentence. Hopeful, quiet, spacious.

`illustrations/empty-garden.png`
> [global style] A single small sprout in soft soil under gentle light, dew
> drops catching lavender highlights. New beginnings, tender.

---

## 3. Achievement showcase art (#7)

`illustrations/orb-rings.png`
> [global style] The RESET recovery orb — a translucent pearl-lavender sphere
> with two soft "eyes" of light — surrounded by concentric glowing rings, each
> ring a subtly different accent (lavender, blue, pink, mint). Rings represent
> unlocked milestones.

`illustrations/crystal-shelf-full.png`
> [global style] The crystal shelf from Achievements, now fully filled with
> glowing crystals of graduated colors, warm ambient light, a sense of
> accomplishment without being flashy.

---

## 4. Ambient sound (#5) — audio, not images

Source royalty-free loops (Pixabay, Freesound CC0, Epidemic Sound) — soft,
seamless, 30–60s loops, normalized to about -20 LUFS. Save as compressed
`.m4a`/`.mp3` in `frontend/public/audio/`:

- `audio/wind.m4a` — soft, distant wind, no gusts
- `audio/rain.m4a` — gentle steady rain, no thunder
- `audio/forest.m4a` — quiet forest ambience, occasional far birdsong
- `audio/ocean.m4a` — slow calm waves, no crashing

Implementation note (when the files exist): add a Settings → Sound section, an
`<audio loop>` element, default OFF, never autoplay — start only on an explicit
tap, and persist the choice. Respect `prefers-reduced-motion` users by keeping
it opt-in.

---

## 5. Living-background particle textures (optional, #1)

If you want richer backgrounds than CSS can do, generate seamless tiles:

`illustrations/particles-calm.png`
> [global style] Seamless tileable texture of tiny soft floating light motes on
> transparent background, very sparse, lavender and white, barely-there.

Use as a low-opacity (3–6%) repeating layer over the app background.

---

## Where they plug in

| Asset | Screen | How |
|---|---|---|
| journal / recovery / calm / insights / goals / achievements | feature cards, Journey tools | replace/augment the Lucide icon in the card's icon container |
| empty-journal / empty-garden | Journal + Garden empty states | full-width hero above the empty-state copy |
| orb-rings / crystal-shelf-full | Achievements | milestone showcase |
| audio/* | Settings → Sound | opt-in ambient loop |

Everything currently ships with tasteful CSS/SVG placeholders, so the app is
complete without these — they're an upgrade, not a dependency.
