# 01 — HTML (markup-kontrakt)

Blocket är **server-renderat** (PHP skriver ut korten i HTML:en direkt — bra för SEO:
recensionerna finns i källan). JS:en bygger inga kort, den **förhöjer** befintlig markup.
JS och CSS förutsätter exakt denna struktur och dessa klassnamn.

## Trädet

```html
<section class="ampy-testimonials" aria-label="Omdömen från Ampys kunder">
  <div class="ampy-testimonials__inner">

    <header class="att-head">
      <h2 class="att-heading">Vad säger dina grannar om Ampy?</h2>
      <p class="att-sub">Riktiga omdömen från riktiga jobb.</p>
    </header>

    <!-- Splide-rot. .att-slider MÅSTE ha klassen .splide. -->
    <div class="att-slider splide" aria-label="Kundomdömen">
      <div class="splide__track">
        <ul class="splide__list">
          <!-- Ett <li> per recension (server-renderat) -->
          <li class="splide__slide">
            <figure class="att-card">
              <div class="att-card__top">
                <span class="att-card__quote" aria-hidden="true">&ldquo;</span>
                <img class="att-card__google" src="…Google-2015-Favicon.svg" alt="Google-omdöme" width="22" height="22" loading="lazy">
              </div>
              <div class="att-card__body">
                <blockquote class="att-card__text">CITAT (ordagrant)</blockquote>
              </div>
              <figcaption class="att-card__foot">
                <div class="att-card__name">NAMN</div>
                <hr class="att-card__divider">
                <div class="att-card__meta">
                  <span class="att-card__stars" role="img" aria-label="5 av 5 stjärnor"><!-- 5× stjärn-SVG --></span>
                  <span class="att-card__date">DATUM</span>
                </div>
              </figcaption>
            </figure>
          </li>
          <!-- … fler <li> … -->
        </ul>
      </div>
    </div>

    <!-- Prickarna: TOM behållare. JS injicerar de 4 knapparna. -->
    <div class="att-nav" role="group" aria-label="Bläddra bland omdömen"></div>

    <!-- Enda CTA:n: Google-betyg, länkad till profilen, ny flik -->
    <div class="att-rating">
      <a class="att-badge" href="…google-profil…" target="_blank" rel="noopener noreferrer"
         aria-label="Läs Ampys omdömen på Google, öppnas i ny flik">
        <span class="att-badge__stars" role="img" aria-label="5 av 5 stjärnor"><!-- 5× stjärn-SVG --></span>
        <span class="att-badge__text"><strong>5 av 5</strong>Betyg på Google</span>
      </a>
    </div>

  </div>
</section>
```

## Regler (får inte brytas)

* **`.ampy-testimonials`** är wrappern — JS letar upp varje sådan på sidan (multi-instans).
* **`.att-slider`** måste ha `.splide` (Splide monteras på den).
* Varje recension = ett **`<li class="splide__slide">`** med en **`<figure class="att-card">`**.
* **`.att-nav`** ska vara TOM i markupen — JS fyller den med exakt 4 `<button class="att-dot">`.
* Stjärnraden: fem inline-SVG med `role="img"` + `aria-label="5 av 5 stjärnor"` (dekorativa i sig).
* Rubrik = **en** `<h2>` per block. Om flera block ligger på samma sida, tänk på rubrik-hierarkin.

## Semantik & tillgänglighet

* `figure`/`figcaption`/`blockquote` bär citatet semantiskt. `hr` = visuell delare.
* Google-G är innehållsbärande (`alt="Google-omdöme"`), inte dekor.
* Prickarna är riktiga `<button>` (fokuserbara, tangentbord). De använder `aria-current="true"`
  på den aktiva (inte `role="tab"` — det är en karusell-indikator, inte flikar).
* `aria-label` på sektion, slider, nav och badge ger skärmläsar-kontext på svenska.
* Rörligt innehåll: se paus-mekanismerna i `03-JS.md` (hover/fokus/touch) + reduced-motion.

## Antal recensioner
Fungerar med valfritt antal. 4 prickar cyklar via `index % 4` — jämnast när antalet är
delbart med 4 (12 → 3 varv). Andra antal fungerar också; se antal-säkerheten i `03-JS.md`.
