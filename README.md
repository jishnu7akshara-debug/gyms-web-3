# Still Point — Pilates & yoga studio

Static landing page: open `index.html` in a browser. No build step.

## Folder layout
```
index.html        page markup
css/style.css     all styles (palette tokens at the top)
js/main.js        all interactions and animations
assets/img/       photos   (filled by get-assets.ps1)
assets/video/     videos   (filled by get-assets.ps1)
get-assets.ps1    downloads every photo and video into assets/
```

## Photos and videos
Every image and video points to `assets/...` first. Until you run `get-assets.ps1`, the page automatically
falls back to the online source (Unsplash photos, Pexels videos), so it works straight away when online.
Run the script once to make the site fully self-contained:

```
powershell -ExecutionPolicy Bypass -File get-assets.ps1
```

To swap a photo or clip, drop your own file into `assets/img` or `assets/video` with the same name.

## Design
- 60-30-10 palette: Sage mist #E6EBE3 (60%) · Forest #2E4036 (30%) · Ochre #C8922E (10%)
- Type: Cormorant Garamond + Outfit
- Motion: Breathing-orb loader, circular video ring with 8-second breathing halo and Inhale/Exhale cue, Lenis smooth scroll, arch-image parallax, expanding practice panels, filterable timetable, testimonial crossfade
- Libraries (CDN): GSAP 3.12 + ScrollTrigger, Lenis 1.1
- Responsive to mobile, keyboard focus styles, respects reduced-motion settings.
