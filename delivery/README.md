# Ampy Testimonials — huvudblock (Version 1, låst 2026-07-19)

Ett auto-roterande omdömesblock byggt för att köras **24/7/365** som huvudblock på
**flera landningssidor** på ampy.se. Sömlös oändlig loop, 4 cyklande prickar där den
aktiva fylls grönt i takt med korten, klickbar navigering, paus vid hover/fokus/touch,
och en Google-betyg-badge som länkar till Ampys profil.

> **Sanningskälla:** de tre filerna `ampy-testimonials.{css,js,php}`. `preview.html`
> visar exakt dessa filer i drift. `ampy-testimonials.bricks.json` är ett struktur-
> scaffold för Bricks. Fullständig dokumentation i `docs/`.

---

## Filmanifest

| Fil | Roll |
|---|---|
| `ampy-testimonials.php`  | WordPress/FluentSnippets: enquear assets + shortcode `[ampy_testimonials]` som **server-renderar** korten. |
| `ampy-testimonials.css`  | All styling, **wrapper-scopad** under `.ampy-testimonials`. Rör aldrig `html`/`body`, gör inga font-requests. |
| `ampy-testimonials.js`   | **Förhöjer** den server-renderade markupen (Splide + de 4 prickarna + fyllningen). Multi-instans-säker. |
| `preview.html`           | Fristående preview som laddar de tre filerna by reference. |
| `ampy-testimonials.bricks.json` | Bricks-export (bricksCopiedElements) — struktur + global classes + Code-element. |
| `assets/`                | Splide v4.1.4 (js+css), `tokens.css` (referens) och `google-g.svg` för preview. |
| `docs/`                  | Detaljerad dokumentation per lager (HTML/CSS/JS/PHP/Bricks). |

---

## Installation (WordPress / FluentSnippets)

1. **Filer:** skapa mappen `/wp-content/themes/bricks-child/ampy-testimonials/` och lägg
   där: `ampy-testimonials.css`, `ampy-testimonials.js`, `splide.min.js`, `splide.min.css`.
   (Splide **self-hostas** — ingen CDN i produktion, GDPR-vänligt.) Justera `$dir` i PHP:n
   om du lägger mappen någon annanstans.
2. **PHP:** klistra in `ampy-testimonials.php` som en FluentSnippet (PHP, kör överallt).
   Den registrerar assets och shortcoden.
3. **Använd:** lägg `[ampy_testimonials]` där blocket ska visas (Bricks: Shortcode-element,
   eller sidans innehåll). Assets laddas bara på sidor där shortcoden körs.
4. **Splide:** PHP:n återanvänder temats/Bricks Splide-handtag om det finns, annars den
   self-hostade kopian — och **enquear alltid det resolved handtaget** så Splide garanterat
   laddas även på sidor utan Bricks-native-slider.

### Alternativ: Bricks-native
Importera `ampy-testimonials.bricks.json` (Bricks → klistra in element) för att bygga
strukturen med Bricks-element + CPT-loop. Se `docs/05-BRICKS.md`.

---

## Konfiguration (shortcode-attribut)

```
[ampy_testimonials
   heading="Vad säger dina grannar om Ampy?"
   subline="Riktiga omdömen från riktiga jobb."
   rating="5 av 5"
   google_url="https://www.google.com/maps/place/Ampy/..."
   google_icon="https://ampy.se/wp-content/uploads/Google-2015-Favicon.svg"]
```

Recensionerna ligger i `ampy_testimonials_get_reviews()` (statisk array som standard;
CPT-variant finns utkommenterad). Se `docs/04-PHP.md`.

---

## Beroenden (finns redan globalt i Ampys Bricks-tema)

* **Outfit** (self-hostad i temat) — blocket importerar aldrig fonter.
* **`html { font-size: 62.5% }`** (1rem = 10px) — blocket sätter det aldrig själv.
* **ap*-tokens** + `--brightgreen`, `--color-2`, `--radius`, `--apmidnight-blue`,
  `--apneon-mint`, `--apteal-core`, `--apradius-full`, `--apspace-*`, `--aptext-*`.
* **Splide v4** (laddas av PHP:n eller temat).
* Ljus sidbakgrund (blocket är transparent och sitter på sidans bg).

---

## ⚑ Candour-gates före go-live

1. **"5 av 5 · Betyg på Google"** — bekräfta att 5,0 är Ampys **aktuella** Google-snitt
   samma dag (siffran är statisk; bryts tyst av första recensionen under 5★). Sätt en
   bevakningsrutin.
2. **Datum** på korten är härledda ur Googles relativa tidsstämplar — spot-checka mot profilen.
3. **Alla visade recensioner renderas som 5★.** En av de 27 är 4★ (ej namngiven) — bekräfta
   att ingen visad är den. Citaten får aldrig kortas (äkthet).

---

## Robusthet (varför det håller 24/7 på flera sidor)

* **Multi-instans:** initierar varje `.ampy-testimonials` för sig, inga globala id:n.
* **Antal-säkert:** 4 prickar cyklar via `index % 4`; klick clampas mot antalet;
  `type:loop` bara när antal > perPage (annars `slide` + ingen autoplay).
* **Självläkande fyllning:** Splides timer driver primärt; en rAF-watchdog tar över inom
  ~1 s om timern tystnar (t.ex. efter en brytpunkts-rebuild).
* **Guards:** saknas Splide eller inga kort → server-korten står kvar (statisk fallback).
* **Ingen theme-bleed:** allt scopat; inga `html`/`body`-regler; inga externa requests.

Granskat av flera kod-agenter (robusthet, animation, CSS/HTML/a11y) 2026-07-19.
