# 04 — PHP

Fil: `ampy-testimonials.php`. En FluentSnippet (PHP, kör överallt). Gör två saker:
registrerar/enquear assets och registrerar shortcoden som **server-renderar** korten.

## 1) Assets (`wp_enqueue_scripts`, prio 20)
```php
$dir = get_stylesheet_directory_uri() . '/ampy-testimonials';   // MAPP i child-temat
```
Lägg i mappen: `ampy-testimonials.css`, `ampy-testimonials.js`, `splide.min.js`, `splide.min.css`.

* **Splide-handtag (viktigt för sidor utan Bricks-native-slider):** koden väljer handtag i
  ordning `splide` → `bricks-splide` → egen self-hostad `ampy-splide`, sparar det i
  `$GLOBALS['ampy_testimonials_splide_handle']`, och **enquear det RESOLVED handtaget i
  shortcoden**. Det löser fällan att `bricks-splide` är *registrerat* men inte *enquead* på
  en vanlig landningssida (annars laddas Splide aldrig och blocket faller till statiskt).
* Registrerar `ampy-testimonials` (CSS + JS, JS beroende av det resolved Splide-handtaget) +
  `ampy-splide-css` (alltid vår egen splide-core-CSS).
* Faktisk **enqueue sker i shortcoden** → assets laddas bara på sidor som använder blocket.
* **Justera `$dir`** om du lägger mappen på annan plats.
* **Self-hostad Splide** (ingen CDN) → GDPR-vänligt, inget tredjeparts-driftberoende.

## 2) Data (`ampy_testimonials_get_reviews()`)
Returnerar en array av `['name'=>…, 'text'=>…, 'date'=>…]`.

* **Standard:** 12 statiska, äkta Google-recensioner (ordagrant). Fungerar direkt.
* **CPT-variant (utkommenterad):** hämtar från `post_type 'testimonial'`:
  ```php
  'name' => get_the_title($p),
  'text' => get_field('testimonial', $p->ID),   // ACF
  'date' => get_field('review_date', $p->ID),   // ⚑ kräver ETT nytt datumfält på CPT:t
  ```
  Det gamla blocket drev korten från denna CPT via Bricks query-loop men hade **inget
  datumfält** — lägg till `review_date` (ACF) om du vill CPT-driva med datum, annars
  utelämnas datumet automatiskt (`if (!empty($r['date']))`).

## 3) Shortcode `[ampy_testimonials]`
Attribut (alla har defaults):

| Attribut | Default |
|---|---|
| `heading`     | `Vad säger dina grannar om Ampy?` |
| `subline`     | `Riktiga omdömen från riktiga jobb.` |
| `rating`      | `5 av 5` |
| `google_url`  | Ampys Google Maps-profil |
| `google_icon` | `https://ampy.se/wp-content/uploads/Google-2015-Favicon.svg` |

Renderar exakt markup-kontraktet i `01-HTML.md`, ett `<li>` per recension.

## Säkerhet / escaping
* `esc_html()` på all textdata (namn, citat, datum, rubrik, subline, rating).
* `esc_url()` på `google_url` och `google_icon`.
* `esc_attr()` implicit via markup; inga användarinmatade attribut ekas oescapat.
* Stjärn-SVG:erna är statiska literaler (echo utan escaping är avsiktligt — `// phpcs:ignore`).
* `if (!defined('ABSPATH')) exit;` som direktåtkomst-skydd.
* `shortcode_atts()` vitlistar attributen.

## Prestanda
* Villkorad enqueue (bara där shortcoden körs).
* Splide återanvänds om temat redan har det.
* `loading="lazy"` + `width/height` på Google-G (ingen layout-shift).
* Ingen extern font-request.

## Test
* `php -l ampy-testimonials.php` → inga syntaxfel.
* Lägg `[ampy_testimonials]` på en testsida → 12 kort i HTML-källan (server-renderat),
  Splide + prickar aktiveras av JS:en.
