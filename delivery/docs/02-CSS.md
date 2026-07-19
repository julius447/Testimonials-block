# 02 — CSS

Fil: `ampy-testimonials.css`. **Allt är wrapper-scopat** under `.ampy-testimonials`.
Blocket rör aldrig `html`/`body`, importerar aldrig fonter och läcker inte ut i temat.

## Beroende tokens (från Ampys tema)
`--brightgreen`, `--color-2`, `--radius`, `--apmidnight-blue`, `--apneon-mint`,
`--apteal-core`, `--apradius-full`, `--apspace-{2xs,xs,s,m,l,xl,2xl}`,
`--aptext-{xs,sm,m,ml,2xl}`. Varje token har en **fallback** i `var(--x, fallback)` så
blocket degraderar snyggt om en token saknas. `html{font-size:62.5%}` (1rem=10px) antas.

## Egna variabler (på wrappern, inte `:root`)
```css
.ampy-testimonials {
  --att-fill-a: var(--brightgreen, #1BD365);   /* prick-fyllningens start */
  --att-fill-b: #00ad48;                        /* prick-fyllningens slut  */
  --att-card-text: clamp(1.7rem, calc(0.21vw + 1.63rem), 1.9rem);  /* citatets storlek */
}
```

## Specificitet (viktigt)
Komponentreglerna skrivs `.ampy-testimonials .att-*` (specificitet **0,2,0**) så de alltid
vinner över de defensiva element-resetsen (`.ampy-testimonials button|figure|hr` = **0,1,1**).
Detta löste en bugg där en scopad `button`-reset annars nollade den aktiva prickens bakgrund.
**Behåll `.ampy-testimonials`-prefixet på varje komponentregel** om du lägger till nya.

## Defensiva resets (skydd mot temat)
```css
.ampy-testimonials, .ampy-testimonials * , … { box-sizing: border-box; }
.ampy-testimonials button { appearance:none; -webkit-appearance:none; font:inherit; color:inherit; }
.ampy-testimonials figure, .ampy-testimonials blockquote, .ampy-testimonials figcaption { margin:0; }
```
Dessa neutraliserar tema-/Bricks-stilar på `<button>`, `<figure>`, `<blockquote>`, `<hr>`.

## Kortet
Mörk gradient `linear-gradient(-27deg,#0b0f30,#2d516d 60%)`, vit text, `--radius`-hörn,
mjuk skugga. `min-height` 360/340/300 (desktop/tablet/mobil). `.att-card__body` är
`flex:1` + `align-items:center` → citatet centreras vertikalt (ägar-önskat). Stjärnor
`--apneon-mint` (#55ff9a), 15px. Datum `rgba(255,255,255,.72)`.

## Prickar (signaturen)
```css
.att-dot        { width:2.4rem; height:.6rem; background:#c7d3eb; transition:width .35s, background-color .35s; }
.att-dot.is-active { width:4.4rem; background:#cfe9d9; }         /* aktiv växer + ljusnar */
.att-dot__fill  { transform:scaleX(var);  background:linear-gradient(90deg,var(--att-fill-a),var(--att-fill-b)); }
.att-dot::before { inset:-1.2rem -.4rem; z-index:2; }            /* osynlig ≥24px-träffyta (WCAG 2.5.8) */
```
* Bara den aktiva pricken har grön fyllning; JS sätter `scaleX(rate)` 0→1.
* `width`-transitionen är den medvetet valda "pill-tillväxten" — kör en gång per 4 s på ett
  litet element (försumbar kostnad; behåll).
* `::before`-träffytan är mindre nedåt (`-1.2rem`) så den inte stjäl klick från badgen;
  `.att-rating` har `z-index:3` som extra skydd.

## Badge
Guldstjärnor `#fbbc04` (med `drop-shadow` för kontur mot ljus bg), svart text, `min-height:44px`
(touch). Länk till Google, hover = understruken text.

## Responsivt
* `>1024`: 3 kort. `760–1024`: 2 kort (`min-height:340`). `≤759`: 1 kort, subline dold,
  lättare/mindre rubrik (`clamp(2.3rem,6.4vw,2.7rem)`), mer luft rubrik→kort.
* Kort-bredd hanteras av Splide (perPage) — CSS sätter aldrig fast kort-bredd, så inga
  "billboard"/peek-problem.

## a11y / edge
* `:focus-visible` med teal outline på prickar + badge; `:focus:not(:focus-visible){outline:none}`.
* `@media (prefers-reduced-motion: reduce)`: prick-transitionen blir momentan (JS stänger autoplay).
* `@media print`: mörka kort inverteras till vitt/svart, prickar döljs.

## Kontrast (WCAG AA, uppmätt mot ljusaste gradientstopp #2d516d / ljus bg)
Vit citattext ~7,5:1 · datum ~5:1 · subline ~6,6:1 · badge-text ~15:1 — alla ≥ AA.
Guldstjärnor är dekorativa (aria-label bär informationen).
