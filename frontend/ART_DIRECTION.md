# RESET — Art Direction Briefs (optional hero imagery)

The app is designed to look premium **with zero images** (CSS mesh gradients, glass,
grain, spring motion). These briefs are for *optional* hero art you can generate
(Midjourney / DALL·E / a designer) and drop into reserved slots later.

## Visual language (applies to every asset)
- **Mood:** calm, hopeful, luxurious, dawn-lit. Never clinical, never dark, never literal about the subject matter.
- **Palette:** soft periwinkle `#6E8CFB`, lavender `#7C6BF0`, sky `#4FB6F5`, mint `#34C9A3` on light. Match the app's mesh.
- **Style:** abstract 3D / soft-focus atmosphere. Frosted glass, volumetric light, gentle grain. Think Apple keynote abstract art + Arc Browser + Calm — NOT stock photos, NOT flat vector, NOT cartoon.
- **Finish:** subtle, low-contrast so UI text stays readable on top. Renders should feel like ambient light, not a photo the eye "lands on."

## Slot 1 — Home hero backdrop (behind the recovery ring)
- **Where:** the mesh hero card on Home. Wired via CSS var `--hero-art`.
- **How to enable:** set on `:root` in `globals.css`:
  `--hero-art: url('/hero/home.webp');` (it blends with `mix-blend-mode: screen`).
- **Brief:** *"Abstract 3D frosted-glass sculpture, soft periwinkle and lavender, volumetric dawn light, floating translucent forms, extremely soft focus, subtle film grain, luminous, minimal, negative space in center."*
- **Spec:** 1080×1080 webp, < 120 KB, center kept quiet so the ring reads.

## Slot 2 — Onboarding screen 1 ("a new beginning")
- **Brief:** *"Cinematic sunrise over soft abstract mountains, periwinkle-to-mint gradient sky, volumetric light rays, dreamy haze, no people, painterly, calm, premium."*
- **Spec:** 1170×1400 webp, top-weighted composition (text sits lower third).

## Slot 3 — Onboarding screen 2 ("understanding triggers")
- **Brief:** *"An abstract road of light emerging from a soft dark forest into a glowing lavender dawn, minimal, hopeful, cinematic depth, no text, no people."*

## Slot 4 — Coach hero (AI companion)
- **Brief:** *"A luminous abstract orb of soft blue-lavender light, gentle particles, frosted glass, calm intelligence, dark-free, floating in negative space."*
- **Spec:** 800×800 webp, transparent or matches `#F5F7FC`.

## Slot 5 — "Build a life you enjoy" (values montage)
- **Brief:** a set of 6 abstract-luxe tiles (exercise, reading, meditation, nature, connection, purpose) — *"soft 3D icon-object on frosted glass pedestal, single accent color per tile, dawn light, premium, no text."*
- **Spec:** 600×600 each.

## Delivery rules
- Prefer **webp/avif**, compress hard (these are ambience, not focal).
- Never let an image reduce text contrast below WCAG AA — test on device.
- Keep one consistent render style across all slots so the app feels authored, not assembled.
