/**
 * Chapter Navigation — auto-populates the empty chapter <ul>
 * that fin.ai's SSR left behind (React client JS was stripped).
 *
 * Works generically on any page that has:
 *   1. A [data-chapter-layout="nav"] container with an empty <ul>
 *   2. Sections with id attributes in the main content area
 */
(function () {
  'use strict';

  /* ── 1. Find the chapter nav container ── */
  var navWrap = document.querySelector('[data-chapter-layout="nav"]');
  if (!navWrap) return;               // no chapter nav on this page
  var ul = navWrap.querySelector('ul');
  if (!ul) return;

  /* ── 2. Discover sections ── */
  // Main content area sits next to the nav column
  var mainCol =
    document.querySelector('[data-chapter-layout="main"] > :nth-child(2)') ||
    document.querySelector('[data-ai-engine-content]') ||
    document.querySelector('[data-chapter-layout="main"]');
  if (!mainCol) return;

  // Collect IDs from the main content that represent real sections
  // Skip internal IDs (_xxx, sweo-xxx, ot-xxx, footer-xxx, *-rive, *svg*)
  var skipRe = /^_|^sweo|^ot-|^footer|rive$|svg/;
  var allIds = [];
  var els = mainCol.querySelectorAll('[id]');
  els.forEach(function (el) {
    var id = el.id;
    if (!id || skipRe.test(id)) return;
    // Must be a meaningful block element (not a tiny inline)
    if (el.offsetHeight < 40) return;
    allIds.push(id);
  });

  // Also check style tags for href*="xxx"][aria-current] patterns
  // (ai-engine page stores section slugs this way)
  var styleSections = [];
  var styles = document.querySelectorAll('style');
  styles.forEach(function (s) {
    var matches = s.textContent.match(/href\*="([^"]+)"\]\[aria-current\]/g);
    if (matches) {
      matches.forEach(function (m) {
        var slug = m.match(/href\*="([^"]+)"/)[1];
        if (styleSections.indexOf(slug) === -1) styleSections.push(slug);
      });
    }
  });

  // Prefer style-derived sections if they exist (more intentional order)
  var sectionIds = styleSections.length > 0 ? styleSections : allIds;

  // Filter to sections that actually have a matching element
  sectionIds = sectionIds.filter(function (id) {
    return document.getElementById(id);
  });

  // Remove 'faqs' — it's a generic section, not a chapter
  sectionIds = sectionIds.filter(function (id) { return id !== 'faqs'; });

  if (sectionIds.length === 0) return;

  /* ── 3. Create pretty label from slug ── */
  function slugToLabel(slug) {
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  /* ── 4. Build <li> items ── */
  sectionIds.forEach(function (id, i) {
    var li = document.createElement('li');
    // Match the original Tailwind classes from the SSR markup
    li.className = 'max-md:shrink-0';

    var a = document.createElement('a');
    a.href = '#' + id;
    a.setAttribute('data-chapter-idx', i);
    a.className =
      'chapter-link flex items-center gap-2 py-1.5 text-sm transition-colors ' +
      'text-content-secondary hover:text-content-primary ' +
      'max-md:whitespace-nowrap max-md:px-3 max-md:text-xs';

    var numSpan = document.createElement('span');
    numSpan.className = 'shrink-0 pr-1 opacity-50';
    numSpan.textContent = String(i + 1).padStart(2, '0');

    var labelSpan = document.createElement('span');
    labelSpan.textContent = slugToLabel(id);

    a.appendChild(numSpan);
    a.appendChild(labelSpan);
    li.appendChild(a);
    ul.appendChild(li);
  });

  /* ── 5. Progress bar (reuse the existing one in the DOM) ── */
  var progressBar = navWrap.querySelector('[role="progressbar"]');

  /* ── 6. Scroll tracking ── */
  var links = ul.querySelectorAll('.chapter-link');
  var activeIdx = 0;
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var vh = window.innerHeight;
      var scrollY = window.scrollY;
      var newActive = 0;
      var totalProgress = 0;

      sectionIds.forEach(function (id, i) {
        var el = document.getElementById(id);
        if (!el) return;
        var top = el.offsetTop;
        if (scrollY >= top - vh * 0.5) newActive = i;

        // Per-section progress
        var height = el.offsetHeight || vh;
        var sStart = top - vh * 0.3;
        var sEnd = top + height - vh * 0.3;
        var p = 0;
        if (scrollY >= sEnd) p = 1;
        else if (scrollY > sStart) p = (scrollY - sStart) / (sEnd - sStart);

        if (i <= newActive) totalProgress += (i < newActive ? 1 : p);
      });

      // Update active link
      if (newActive !== activeIdx) {
        links[activeIdx] && links[activeIdx].classList.remove('chapter-link-active');
        links[newActive] && links[newActive].classList.add('chapter-link-active');
        links[newActive] && links[newActive].setAttribute('aria-current', 'location');
        links[activeIdx] && links[activeIdx].removeAttribute('aria-current');
        activeIdx = newActive;
      }

      // Update progress bar
      if (progressBar) {
        var pct = sectionIds.length > 0 ? totalProgress / sectionIds.length : 0;
        progressBar.style.transform = 'scaleX(' + Math.min(pct, 1) + ')';
        progressBar.style.transition = 'transform 60ms linear';
      }

      ticking = false;
    });
  }

  // Smooth scroll on click
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById(this.getAttribute('href').slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Activate
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mark first item active initially
  if (links[0]) {
    links[0].classList.add('chapter-link-active');
    links[0].setAttribute('aria-current', 'location');
  }
})();
