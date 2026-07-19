# 05 — Bricks JSON

Fil: `ampy-testimonials.bricks.json`. Format: `bricksCopiedElements` (samma som originalet)
— klistras in i Bricks (välj ett element → Klistra in).

## Vad den innehåller
Ett **Code-element** som bär HELA blocket självständigt:
* `<link>` till Splide-core-CSS + inbäddad `<style>` med blockets scopade CSS,
* den server-renderade markupen (sektion + 12 kort + tom prick-behållare + badge),
* `<script>` som laddar Splide v4.1.4 + blockets JS (som förhöjer markupen).

Ingen extern beroende utöver Splide (som laddas i elementet). Klistra in → fungerar direkt.
Det är avsiktligt EN Code-nod (inte ett träd av Bricks-element) för att paste-resultatet ska
vara **garanterat identiskt** med de levererade filerna — ingen risk att Bricks-inställningar
driver isär rendering. Sanningskällan är fortfarande `ampy-testimonials.{css,js}`.

## Tre vägar att välja mellan (välj EN)

1. **Code-element (denna JSON)** — snabbast, självständig, 1:1 mot leveransen.
   Innehållet (recensionerna) redigeras i JSON:ens `code`-sträng, inte i Bricks-UI.

2. **Shortcode** — lägg `[ampy_testimonials]` i ett Bricks *Shortcode*-element och använd
   `ampy-testimonials.php`. Data från PHP-arrayen (eller CPT:t). Se `04-PHP.md`.

3. **Bricks-native + CPT** (mest redigerbart, mest jobb) — bygg strukturen i `01-HTML.md`
   med Bricks-element och en **query-loop** på `post_type: testimonial`:
   * `slider-nested` (`.att-slider`): sätt `pagination:false`, `autoplay:true`,
     `interval:4000`, `speed:500`, `pauseOnHover:true`, `perPage 3 / tablet 2 / mobil 1`,
     `perMove:1`, `gap:24px`, loop på. Query-loop renderar korten.
   * Kortfälten: namn = `{post_title}`, citat = `{acf_testimonial}`, datum = ett nytt
     ACF-fält `{review_date}` (finns ej i dagens CPT — lägg till om datum ska visas).
   * `.att-nav` = tom block. Lägg blockets CSS i global classes/`_cssCustom` och JS i ett
     Code-element. **OBS:** eftersom `slider-nested` själv monterar Splide ska JS:en då
     HAKA I den befintliga instansen (`window.bricksData.splideInstances[id]`) i stället
     för att montera en egen — annars dubbelmonteras Splide. Väg 1/2 undviker det problemet.

## Rekommendation
Kör **väg 1 (Code-element)** eller **väg 2 (shortcode)** för produktion — båda ger exakt den
låsta Version 1. Spar väg 3 för när innehållet ska redigeras helt via Bricks-UI + CPT.

## Verifiera efter inklistring
* Rendera på desktop + mobil, kontrollera att de 4 prickarna dyker upp och att den aktiva
  fylls grönt i takt med korten.
* Bekräfta att inga andra block/tema-stilar påverkas (allt är scopat under `.ampy-testimonials`).
* Kör candour-gatesen i `README.md` (5,0-siffran, datum, 5★).
