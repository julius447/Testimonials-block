<?php
/**
 * AMPY TESTIMONIALS — produktions-PHP (FluentSnippets)
 * Version 1 (låst 2026-07-19).
 *
 * Gör TVÅ saker:
 *   1) Enquear Splide (v4) + blockets CSS/JS (villkorat, bara när shortcoden används).
 *   2) Registrerar shortcoden [ampy_testimonials] som SERVER-renderar korten
 *      (bra för SEO — recensionerna finns i HTML:en direkt; JS förhöjer bara).
 *
 * MARKUP-KONTRAKT (måste matcha ampy-testimonials.js exakt):
 *   .ampy-testimonials > .ampy-testimonials__inner
 *       > .att-head (h2.att-heading + p.att-sub)
 *       > .att-slider.splide > .splide__track > ul.splide__list > li.splide__slide > figure.att-card
 *       > .att-nav               (tom; JS injicerar de 4 prickarna)
 *       > .att-rating > a.att-badge
 *
 * BEROENDEN som redan finns i Ampys tema: Outfit (self-hostad), html{62.5%}, ap*-tokens.
 *
 * ⚑ DATA: recensionerna ligger som statisk array nedan (fungerar direkt). För
 *   CPT-driven data (post_type 'testimonial'), se den utkommenterade varianten i
 *   ampy_testimonials_get_reviews(). En 4★-recension av 27 finns — bekräfta att
 *   ingen VISAD är den (alla renderas som 5★). "5 av 5" = aktuellt Google-snitt.
 */

if (!defined('ABSPATH')) { exit; }

/* -------------------------------------------------------------------------
 * 1) Assets — registrera en gång, enquea först när shortcoden faktiskt körs.
 *    Justera $base till mappen där du lägger CSS/JS (eller lägg dem i temat).
 * ---------------------------------------------------------------------- */
add_action('wp_enqueue_scripts', function () {
    // Mapp i child-temat där du lägger CSS/JS + de self-hostade splide.min.*-filerna.
    $dir = get_stylesheet_directory_uri() . '/ampy-testimonials';
    $ver = '1.0.0';

    // Splide v4 — återanvänd temats/Bricks handtag om det FINNS, annars vår self-hostade
    // kopia. Vi enquear sedan det RESOLVED handtaget i shortcoden (så Splide faktiskt
    // laddas även om det bara var registrerat, t.ex. bricks-splide på en sida utan slider).
    $handle = 'ampy-splide';
    if (wp_script_is('splide', 'registered'))            { $handle = 'splide'; }
    elseif (wp_script_is('bricks-splide', 'registered')) { $handle = 'bricks-splide'; }
    else { wp_register_script('ampy-splide', $dir . '/splide.min.js', array(), '4.1.4', true); }
    $GLOBALS['ampy_testimonials_splide_handle'] = $handle;

    // Splide-core-CSS: alltid vår egen (liten; ofarlig även om temat har en).
    wp_register_style('ampy-splide-css', $dir . '/splide.min.css', array(), '4.1.4');

    wp_register_style('ampy-testimonials', $dir . '/ampy-testimonials.css', array(), $ver);
    wp_register_script('ampy-testimonials', $dir . '/ampy-testimonials.js', array($handle), $ver, true);
}, 20);

/* -------------------------------------------------------------------------
 * 2) Data
 * ---------------------------------------------------------------------- */
function ampy_testimonials_get_reviews() {
    /* Statisk data — 12 äkta Google-recensioner (ordagrant, 2026-07-19). */
    return array(
        array('name' => 'Filip Eriksson',        'text' => 'Blev rekommenderad av en granne att gå via Ampy. Är otroligt nöjd med det valet.', 'date' => 'mars 2026'),
        array('name' => 'Jan Fernström',         'text' => 'Ampy visade sig i konkurrens med andra aktörer både kunnigare och billigare. Genomförandet av offererat arbete skedde inom utlovad tid snabbt och utan problem. Följdfrågor som uppstått efter en tids användning har besvarats kunnigt och utan dröjsmål.', 'date' => 'juni 2026'),
        array('name' => 'Daniel Hellström',      'text' => 'Professionell firma! Oskar gjorde ett kanonjobb på uppfarten, var en annan firma här tidigare men dem klarade inte av det.', 'date' => 'mars 2026'),
        array('name' => 'Mohammed Abduljaleel',  'text' => 'Kan verkligen rekommendera Ampy. Trevlig kontakt, punktliga och noggranna. Arbetet blev riktigt bra och priset var rimligt. Kommer definitivt att anlita dom igen i framtiden.', 'date' => 'juni 2026'),
        array('name' => 'Alexandra Kamona',      'text' => 'Vi är supernöjda med de som installerade vår elbox! Väldigt proffsiga och trevliga att ha att göra med. Rekommenderas varmt!', 'date' => 'maj 2026'),
        array('name' => 'Mathias Franzen',       'text' => 'Sökte en helhetslösning för hembatteri. Ampy levererade över förväntan. Snabbt, smidigt och tryggt!', 'date' => 'mars 2026'),
        array('name' => 'Moa Olaussen',          'text' => 'Snabb hjälp när elcentralen strulade. Ampy dök upp direkt och löste allt med högsta precision. Rekommenderas!', 'date' => 'mars 2026'),
        array('name' => 'Sofia Hamren',          'text' => 'Jättebra och professionell service! Elektrikern förstod direkt vad som behövde göras och utförde arbetet effektivt och med mycket bra resultat. Rekommenderas!', 'date' => 'april 2026'),
        array('name' => 'Hugo Grafström Olsson', 'text' => 'Från start till mål levererades en service i världsklass!', 'date' => 'mars 2026'),
        array('name' => 'Josephine Lundqvist',   'text' => 'Fick hjälp med belysningen i hela lägenheten under min renovering. Väldigt nöjd.', 'date' => 'maj 2026'),
        array('name' => 'dany Hanna',            'text' => 'Supernöjd, bra gäng, trevliga pålitliga och snabba.', 'date' => 'juni 2026'),
        array('name' => 'Adam Andersson',        'text' => 'Proffsig rådgivning inför vår installation. Känns tryggt att anlita experter.', 'date' => 'mars 2026'),
    );

    /* --- CPT-variant (avkommentera för att driva från post_type 'testimonial') ---
    $out = array();
    $q = get_posts(array('post_type' => 'testimonial', 'posts_per_page' => -1, 'orderby' => 'date', 'order' => 'DESC'));
    foreach ($q as $p) {
        $out[] = array(
            'name' => get_the_title($p),
            'text' => (function_exists('get_field') ? (string) get_field('testimonial', $p->ID) : ''),
            // Kräver ett datumfält på CPT:t (finns ej i nuläget) — annars härlett/utelämnat:
            'date' => (function_exists('get_field') ? (string) get_field('review_date', $p->ID) : ''),
        );
    }
    return $out;
    ------------------------------------------------------------------------ */
}

/* -------------------------------------------------------------------------
 * 3) Shortcode
 * ---------------------------------------------------------------------- */
add_shortcode('ampy_testimonials', function ($atts) {
    $atts = shortcode_atts(array(
        'heading'      => 'Vad säger dina grannar om Ampy?',
        'subline'      => 'Riktiga omdömen från riktiga jobb.',
        'rating'       => '5 av 5',
        'google_url'   => 'https://www.google.com/maps/place/Ampy/@59.3576299,17.9842061,17z/data=!3m1!4b1!4m6!3m5!1s0x2bec1ce5c4ed9ce9:0xfce1752e84a1bfee!8m2!3d59.3576272!4d17.986781!16s%2Fg%2F11ypjy9rrm',
        'google_icon'  => 'https://ampy.se/wp-content/uploads/Google-2015-Favicon.svg',
    ), $atts, 'ampy_testimonials');

    $reviews = ampy_testimonials_get_reviews();
    if (empty($reviews)) { return ''; }

    // Ladda assets nu (footer). Enquea det RESOLVED Splide-handtaget så Splide garanterat
    // laddas — även om det (t.ex. bricks-splide) bara var registrerat på sidan.
    $splide_handle = isset($GLOBALS['ampy_testimonials_splide_handle']) ? $GLOBALS['ampy_testimonials_splide_handle'] : 'ampy-splide';
    wp_enqueue_script($splide_handle);
    wp_enqueue_style('ampy-splide-css');
    wp_enqueue_style('ampy-testimonials');
    wp_enqueue_script('ampy-testimonials');

    $star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17l-6.2 3.9 1.6-7L2 9.2l7.1-.6z"/></svg>';
    $stars5 = str_repeat($star, 5);

    ob_start();
    ?>
    <section class="ampy-testimonials" aria-label="Omdömen från Ampys kunder">
      <div class="ampy-testimonials__inner">

        <header class="att-head">
          <h2 class="att-heading"><?php echo esc_html($atts['heading']); ?></h2>
          <?php if (!empty($atts['subline'])) : ?>
            <p class="att-sub"><?php echo esc_html($atts['subline']); ?></p>
          <?php endif; ?>
        </header>

        <div class="att-slider splide" aria-label="Kundomdömen">
          <div class="splide__track">
            <ul class="splide__list">
              <?php foreach ($reviews as $r) : ?>
                <li class="splide__slide">
                  <figure class="att-card">
                    <div class="att-card__top">
                      <span class="att-card__quote" aria-hidden="true">&ldquo;</span>
                      <img class="att-card__google" src="<?php echo esc_url($atts['google_icon']); ?>" alt="Google-omdöme" width="22" height="22" loading="lazy">
                    </div>
                    <div class="att-card__body">
                      <blockquote class="att-card__text"><?php echo esc_html($r['text']); ?></blockquote>
                    </div>
                    <figcaption class="att-card__foot">
                      <div class="att-card__name"><?php echo esc_html($r['name']); ?></div>
                      <hr class="att-card__divider">
                      <div class="att-card__meta">
                        <span class="att-card__stars" role="img" aria-label="5 av 5 stjärnor"><?php echo $stars5; // phpcs:ignore ?></span>
                        <?php if (!empty($r['date'])) : ?>
                          <span class="att-card__date"><?php echo esc_html($r['date']); ?></span>
                        <?php endif; ?>
                      </div>
                    </figcaption>
                  </figure>
                </li>
              <?php endforeach; ?>
            </ul>
          </div>
        </div>

        <div class="att-nav" role="group" aria-label="Bläddra bland omdömen"></div>

        <div class="att-rating">
          <a class="att-badge" href="<?php echo esc_url($atts['google_url']); ?>" target="_blank" rel="noopener noreferrer" aria-label="Läs Ampys omdömen på Google, öppnas i ny flik">
            <span class="att-badge__stars" role="img" aria-label="5 av 5 stjärnor"><?php echo $stars5; // phpcs:ignore ?></span>
            <span class="att-badge__text"><strong><?php echo esc_html($atts['rating']); ?></strong>Betyg på Google</span>
          </a>
        </div>

      </div>
    </section>
    <?php
    return ob_get_clean();
});
