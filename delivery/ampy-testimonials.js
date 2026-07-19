/*!
 * AMPY TESTIMONIALS — produktions-JS (FluentSnippets / Bricks)
 * Version 1 (låst 2026-07-19). Kräver Splide v4 (window.Splide).
 *
 * FÖRHÖJER server-renderad markup (bygger INTE korten själv → SEO/CPT-vänligt).
 * Robust för 24/7 på FLERA landningssidor:
 *  • Multi-instans: initierar VARJE .ampy-testimonials separat (inga globala id:n).
 *  • Antal-säkert: 4 prickar cyklar via index % 4; klick clampas mot antalet;
 *    type:loop bara om antal > perPage (annars slide + ingen autoplay).
 *  • Självläkande fyllning: Splides timer ('autoplay:playing') driver primärt;
 *    en rAF-watchdog tar över inom ~1 s om timern tystnar (t.ex. efter rebuild).
 *  • Guards: saknas Splide/inga kort → server-korten står kvar (statisk fallback).
 *  • WCAG: paus vid hover + fokus (Splide) + tap-to-pause på touch.
 */
(function () {
  'use strict';

  var INTERVAL = 4000, SPEED = 500, DOTS = 4;

  function perfNow() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function clamp01(r) { return r < 0 ? 0 : (r > 1 ? 1 : r); }

  function initBlock(root) {
    var sliderEl = root.querySelector('.att-slider');
    var list = root.querySelector('.splide__list');
    var nav = root.querySelector('.att-nav');
    if (!sliderEl || !list || !nav) return;

    var count = list.querySelectorAll('.splide__slide').length;
    if (!count) { nav.style.display = 'none'; return; }

    // Splide saknas → lämna de server-renderade korten synliga (statisk fallback)
    if (typeof Splide === 'undefined') { root.setAttribute('data-att-static', '1'); return; }

    var mqMobile = window.matchMedia('(max-width: 759px)');
    var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Bygg de 4 prickarna en gång (klickbara)
    var html = '';
    for (var i = 0; i < DOTS; i++) {
      html += '<button class="att-dot" type="button" aria-label="Bläddra bland omdömen, prick ' + (i + 1) + ' av ' + DOTS + '"><span class="att-dot__fill"></span></button>';
    }
    nav.innerHTML = html;
    var dots = Array.prototype.slice.call(nav.querySelectorAll('.att-dot'));
    function fillOf(n) { return dots[n].querySelector('.att-dot__fill'); }

    var splide = null, paused = false, cycleStart = 0, curRate = 0;
    var lastPlaying = -Infinity, autoplayOn = false;

    function activeDotIdx() { return splide ? (((splide.index % DOTS) + DOTS) % DOTS) : 0; }

    function refreshDots() {
      var a = activeDotIdx();
      for (var n = 0; n < dots.length; n++) {
        var on = n === a;
        dots[n].classList.toggle('is-active', on);
        if (on) dots[n].setAttribute('aria-current', 'true'); else dots[n].removeAttribute('aria-current');
        if (!on) fillOf(n).style.transform = 'scaleX(0)';
      }
    }
    function setRate(r) { curRate = clamp01(r); var f = fillOf(activeDotIdx()); if (f) f.style.transform = 'scaleX(' + curRate + ')'; }

    // Klick på prick → omdöme i nuvarande grupp om 4, clampat mot antalet
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () {
        if (!splide) return;
        var target = Math.floor(splide.index / DOTS) * DOTS + n;
        if (target >= count) return;                                  // ofullständig sista grupp → död prick
        if (target === splide.index) { setRate(0); cycleStart = perfNow(); } // redan aktiv → starta om fyllningen
        else splide.go(target);
      });
    });

    function build() {
      var mobile = mqMobile.matches, reduce = mqReduce.matches;
      var perPage = mobile ? 1 : 3;
      var canLoop = count > perPage;                                   // loop kräver fler kort än perPage
      autoplayOn = !reduce && canLoop;

      if (splide) { try { splide.destroy(true); } catch (e) {} }
      try {
        splide = new Splide(sliderEl, {
          type: canLoop ? 'loop' : 'slide',
          perPage: perPage, perMove: 1, gap: '24px',
          autoplay: autoplayOn, interval: INTERVAL, speed: SPEED,
          pauseOnHover: true, pauseOnFocus: true, resetProgress: false,
          arrows: false, pagination: false,
          mediaQuery: 'max',
          breakpoints: mobile ? {} : { 1024: { perPage: 2 } }
        }).mount();
      } catch (e) { if (window.console) console.warn('[ampy-testimonials] mount misslyckades', e); return; }

      refreshDots();
      setRate(autoplayOn ? 0 : 1);                                     // ingen autoplay → statisk full markör
      cycleStart = perfNow();
      lastPlaying = -Infinity;

      splide.on('move', function () { refreshDots(); setRate(0); cycleStart = perfNow(); });
      splide.on('autoplay:playing', function (rate) { lastPlaying = perfNow(); setRate(rate); });
      // Synka paus-flaggan med Splides egen paus (t.ex. pauseOnFocus) → watchdogen driver
      // aldrig fyllningen medan autoplay faktiskt är pausad.
      splide.on('autoplay:pause', function () { paused = true; });
      splide.on('autoplay:play', function () { paused = false; cycleStart = perfNow() - curRate * (INTERVAL + SPEED); });
    }

    // Hover-paus (för watchdog-fallbacken; Splide sköter sin egen autoplay-paus)
    sliderEl.addEventListener('mouseenter', function () { paused = true; });
    sliderEl.addEventListener('mouseleave', function () { paused = false; cycleStart = perfNow() - curRate * (INTERVAL + SPEED); });

    // WCAG 2.2.2: tap-to-pause på touch (osynligt, ingen designändring). Prickarna
    // ligger utanför .att-slider → tap på kort pausar, tap på prick navigerar.
    sliderEl.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'touch' || !splide) return;
      var ap = splide.Components.Autoplay;
      if (!ap) return;
      if (ap.isPaused()) { ap.play(); paused = false; cycleStart = perfNow() - curRate * (INTERVAL + SPEED); }
      else { ap.pause(); paused = true; }
    });

    // Watchdog: om Splides timer tystnar >900 ms medan autoplay ska köra → driv själv.
    // Självläker över alla rebuilds; slutar aldrig schemalägga, men gör inget i onödan.
    function rafTick() {
      if (splide && autoplayOn && !paused && !mqReduce.matches && (perfNow() - lastPlaying > 900)) {
        setRate((perfNow() - cycleStart) / (INTERVAL + SPEED));
      }
      requestAnimationFrame(rafTick);
    }
    requestAnimationFrame(rafTick);

    // Snyggare återkomst efter flikbyte
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && splide) { setRate(0); cycleStart = perfNow(); }
    });

    mqMobile.addEventListener('change', build);
    mqReduce.addEventListener('change', build);
    build();
  }

  function initAll() {
    var blocks = document.querySelectorAll('.ampy-testimonials');
    for (var i = 0; i < blocks.length; i++) initBlock(blocks[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
