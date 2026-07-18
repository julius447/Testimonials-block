/* slider.js — runtime for the testimonials 1:1 clone.
   Parts marked VERBATIM are copied byte-for-byte from ampy.se (2026-07-18).
   Parts marked STAND-IN replicate what Bricks/FlyingPress runtime does on live,
   since we don't ship bricks.min.js here. Behaviour, not implementation, is cloned. */

/* === STAND-IN 1: FlyingPress lazy-render — remove .bricks-lazy-hidden when the section
   nears the viewport (live: FlyingPress strips the class chunk-wise as the page section
   approaches; the class suppresses background-image, i.e. the card gradient). === */
(function () {
  var sections = document.querySelectorAll('section.testimonial');
  var reveal = function (sec) {
    sec.classList.remove('bricks-lazy-hidden');
    sec.querySelectorAll('.bricks-lazy-hidden').forEach(function (el) {
      el.classList.remove('bricks-lazy-hidden');
    });
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
    });
  }, { rootMargin: '600px' });
  sections.forEach(function (sec) { io.observe(sec); });
})();

/* === STAND-IN 2: Bricks interactions — enterView -> fadeIn animation.
   Live: bricks.min.js reads data-interactions and applies .brx-animated + .brx-animate-fadeIn
   with the configured duration (container: 0.3s runOnce; inner block: default 1s). === */
(function () {
  var els = document.querySelectorAll('[data-interactions]');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var conf = [];
      try { conf = JSON.parse(el.getAttribute('data-interactions')) || []; } catch (err) {}
      conf.forEach(function (i) {
        if (i.trigger !== 'enterView' || i.action !== 'startAnimation') return;
        if (i.animationDuration) el.style.animationDuration = i.animationDuration + 's';
        el.classList.add('brx-animated', 'brx-animate-' + i.animationType);
        el.removeAttribute('data-interaction-hidden-on-load');
      });
      io.unobserve(el);
    });
  }, { threshold: 0.05 });
  els.forEach(function (el) { io.observe(el); });
})();

/* === STAND-IN 3: Bricks nested-slider init — mount Splide from data-splide.
   Live: bricks.min.js adds .splide__slide to each loop item, mounts Splide and stores the
   instance in window.bricksData.splideInstances[elementId]. Replicated so the two verbatim
   scripts below find (or, exactly like live, fail to find) what they expect. === */
document.addEventListener('DOMContentLoaded', function () {
  var el = document.querySelector('.brxe-slider-nested.splide');
  if (!el || typeof Splide === 'undefined') return;
  var options = {};
  try { options = JSON.parse(el.getAttribute('data-splide')) || {}; } catch (err) {}
  var list = el.querySelector('.splide__list');
  if (list) {
    Array.prototype.forEach.call(list.children, function (child) {
      if (!child.classList.contains('brx-query-trail')) child.classList.add('splide__slide');
    });
  }
  var instance = new Splide(el, options).mount();
  window.bricksData = window.bricksData || {};
  window.bricksData.splideInstances = window.bricksData.splideInstances || {};
  window.bricksData.splideInstances[el.id || 'brxe-cb3d3d'] = instance;
});

/* === VERBATIM: data-highlight script (wraps the last word in a gradient span and
   clears the gradient from the rest of the heading) === */
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-highlight]').forEach(function(el) {
        const config = el.dataset.highlight;
        const parts = config.split('-');
        const position = parts[0];
        const count = parseInt(parts[1]);

        const computed = window.getComputedStyle(el);
        const backgroundImage = computed.backgroundImage;
        const textDecoration = computed.textDecorationLine;
        const color = computed.color;

        const hasGradient = backgroundImage && backgroundImage !== 'none' && backgroundImage.includes('gradient');
        const hasUnderline = textDecoration && textDecoration.includes('underline');

        // NEW: Add a class to the parent element if it has a gradient
        if (hasGradient) {
            el.classList.add('has-gradient-highlight');
        }

        // Extract first color from gradient to use on underline
        let underlineColor = color;
        if (hasGradient) {
            const match = backgroundImage.match(/rgba?([^)]+)|#[0-9a-fA-F]+/);
            if (match) underlineColor = match[0];
        }

        let spanStyle = '';
        if (hasGradient) {
            spanStyle += `background: ${backgroundImage}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;`;
        }
        if (hasUnderline) {
            spanStyle += `text-decoration: underline; text-decoration-color: ${underlineColor}; text-decoration-thickness: 2px; text-underline-offset: 5px;`;
        }

        const words = el.innerHTML.trim().split(' ');

        if (position === 'last') {
            const rest = words.slice(0, words.length - count).join(' ');
            const highlighted = `<span style="${spanStyle}">${words.slice(-count).join(' ')}</span>`;
            el.innerHTML = rest + (rest ? ' ' : '') + highlighted;
        } else if (position === 'first') {
            const highlighted = `<span style="${spanStyle}">${words.slice(0, count).join(' ')}</span>`;
            const rest = words.slice(count).join(' ');
            el.innerHTML = highlighted + (rest ? ' ' : '') + rest;
        }

        if (hasGradient) {
            el.style.backgroundImage = 'none';
            el.style.webkitTextFillColor = 'unset';
        }
        if (hasUnderline) {
            el.style.textDecoration = 'none';
        }
    });
});

/* === VERBATIM: testimonial pagination loading-bar script. ⚑ Targets '.testimonial-carousel',
   a class no element carries (slider = .testimonial__slider-nested) — dead on live, cloned as-is. === */
(function() {
  'use strict';

  const SPLIDE_CHECK_INTERVAL = 50;
  const MAX_ATTEMPTS = 60;
  const processedSliders = new WeakSet();

  function initAllTestimonialPaginations() {
    const sliders = document.querySelectorAll('.testimonial-carousel');
    if (!sliders.length) return;

    sliders.forEach(slider => {
      if (!processedSliders.has(slider)) {
        initTestimonialPagination(slider);
      }
    });
  }

  function initTestimonialPagination(slider) {
    if (!slider) return;

    let attempts = 0;
    
    const checkSplide = setInterval(() => {
      const splideInstance = getSplideInstance(slider);
      attempts++;

      if (splideInstance) {
        clearInterval(checkSplide);
        processedSliders.add(slider);
        setupPagination(slider, splideInstance);
      } else if (attempts >= MAX_ATTEMPTS) {
        clearInterval(checkSplide);
        console.warn('Testimonial slider: Splide instance not found');
      }
    }, SPLIDE_CHECK_INTERVAL);
  }

  function getSplideInstance(slider) {
    if (slider.splide) return slider.splide;
    
    if (window.bricksData?.splideInstances) {
      const elementId = slider.id;
      return window.bricksData.splideInstances[elementId];
    }
    
    const splideEl = slider.querySelector('.splide');
    if (splideEl?.splide) return splideEl.splide;
    
    return null;
  }

  function setupPagination(slider, splide) {
    // Get autoplay interval
    let autoplayInterval = 3000;
    if (splide.options.autoplay) {
      autoplayInterval = splide.options.interval || 3000;
    }

    // Get transition speed
    const transitionSpeed = splide.options.speed || 300;

    // Total duration
    const totalDuration = autoplayInterval + transitionSpeed;

    // Set CSS variable
    slider.style.setProperty('--pagination-loading-duration', `${totalDuration}ms`);

    // Restart animation on slide change
    splide.on('move', () => {
      restartAnimation(slider);
    });

    // Pause on hover
    slider.addEventListener('mouseenter', () => {
      pauseAnimation(slider);
      if (splide.Components.Autoplay) {
        splide.Components.Autoplay.pause();
      }
    });

    // Resume on mouse leave
    slider.addEventListener('mouseleave', () => {
      resumeAnimation(slider);
      if (splide.Components.Autoplay) {
        splide.Components.Autoplay.play();
      }
    });

    // Start animation
    restartAnimation(slider);
  }

  function restartAnimation(slider) {
    const activeBullet = slider.querySelector('.splide__pagination__page.is-active');
    if (!activeBullet) return;

    activeBullet.classList.remove('paused');
    activeBullet.style.animation = 'none';
    activeBullet.offsetHeight;
    activeBullet.style.animation = null;
  }

  function pauseAnimation(slider) {
    const activeBullet = slider.querySelector('.splide__pagination__page.is-active');
    if (activeBullet) {
      activeBullet.classList.add('paused');
    }
  }

  function resumeAnimation(slider) {
    const activeBullet = slider.querySelector('.splide__pagination__page.is-active');
    if (activeBullet) {
      activeBullet.classList.remove('paused');
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllTestimonialPaginations);
  } else {
    initAllTestimonialPaginations();
  }

  window.addEventListener('load', initAllTestimonialPaginations);

  // Watch for dynamic content
  if (window.MutationObserver) {
    const observer = new MutationObserver(() => {
      initAllTestimonialPaginations();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
