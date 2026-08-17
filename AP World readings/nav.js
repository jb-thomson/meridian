(function () {
  'use strict';

  /* ── Full AP World History Modern navigation structure ── */
  var NAV = [
    { unit: 1, title: 'The Global Tapestry', period: 'c. 1200\u20131450', topics: [
      { num: '1.1', title: 'Developments in East Asia',                  url: 'topic-1-1-east-asia.html' },
      { num: '1.2', title: 'Developments in Dar al-Islam',               url: 'topic-1-2-dar-al-islam.html' },
      { num: '1.3', title: 'Developments in South and Southeast Asia',   url: 'topic-1-3-south-southeast-asia.html' },
      { num: '1.4', title: 'State Building in the Americas',             url: 'topic-1-4-state-building-americas.html' },
      { num: '1.5', title: 'State Building in Africa',                   url: 'topic-1-5-state-building-africa.html' },
      { num: '1.6', title: 'Developments in Europe',                     url: 'topic-1-6-developments-europe.html' },
      { num: '1.7', title: 'Comparison: c. 1200\u20131450',              url: 'topic-1-7-comparison-state-building.html' },
    ]},
    { unit: 2, title: 'Networks of Exchange', period: 'c. 1200\u20131450', topics: [
      { num: '2.1', title: 'The Silk Roads',              url: 'topic-2-1-silk-roads.html' },
      { num: '2.2', title: 'The Mongol Empire',           url: 'topic-2-2-mongol-empire.html' },
      { num: '2.3', title: 'Indian Ocean Exchange',       url: 'topic-2-3-indian-ocean-exchange.html' },
      { num: '2.4', title: 'Trans-Saharan Trade Routes',  url: 'topic-2-4-trans-saharan-trade.html' },
      { num: '2.5', title: 'Cultural Consequences of Connectivity', url: 'topic-2-5-cultural-consequences.html' },
      { num: '2.6', title: 'Environmental Consequences of Connectivity', url: 'topic-2-6-environmental-consequences.html' },
      { num: '2.7', title: 'Comparison of Economic Exchange', url: 'topic-2-7-comparison-economic-exchange.html' },
    ]},
    { unit: 3, title: 'Land-Based Empires', period: 'c. 1450\u20131750', topics: [
      { num: '3.1', title: 'Empires Expand',                          url: 'topic-3-1-empires-expand.html' },
      { num: '3.2', title: 'Empires: Administration',                 url: 'topic-3-2-empires-administration.html' },
      { num: '3.3', title: 'Empires: Belief Systems',                 url: 'topic-3-3-empires-belief-systems.html' },
      { num: '3.4', title: 'Comparison: Land-Based Empires',          url: 'topic-3-4-comparison-land-based-empires.html' },
    ]},
    { unit: 4, title: 'Transoceanic Interconnections', period: 'c. 1450\u20131750', topics: [
      { num: '4.1', title: 'Technological Innovations',              url: 'topic-4-1-technological-innovations.html' },
      { num: '4.2', title: 'Exploration: Causes and Events',         url: 'topic-4-2-exploration-causes.html' },
      { num: '4.3', title: 'The Columbian Exchange',                 url: 'topic-4-3-columbian-exchange.html' },
      { num: '4.4', title: 'Maritime Empires Established',           url: 'topic-4-4-maritime-empires-established.html' },
      { num: '4.5', title: 'Maritime Empires Maintained',            url: 'topic-4-5-maritime-empires-maintained.html' },
      { num: '4.6', title: 'Challenges to State Power',              url: 'topic-4-6-challenges-state-power.html' },
      { num: '4.7', title: 'Changing Social Hierarchies',            url: 'topic-4-7-changing-social-hierarchies.html' },
      { num: '4.8', title: 'Continuity and Change: 1450\u20131750',  url: 'topic-4-8-continuity-change-1450-1750.html' },
    ]},
    { unit: 5, title: 'Revolutions', period: 'c. 1750\u20131900', topics: [
      { num: '5.1',  title: 'The Enlightenment',                       url: 'topic-5-1-enlightenment.html' },
      { num: '5.2',  title: 'Nationalism and Revolutions',             url: 'topic-5-2-nationalism-revolutions.html' },
      { num: '5.3',  title: 'Industrial Revolution Begins',            url: 'topic-5-3-industrial-revolution-begins.html' },
      { num: '5.4',  title: 'Industrialization Spreads',               url: 'topic-5-4-industrialization-spreads.html' },
      { num: '5.5',  title: 'Technology in the Industrial Age',        url: 'topic-5-5-technology-industrial-age.html' },
      { num: '5.6',  title: 'Industrialization: Government\u2019s Role', url: 'topic-5-6-industrialization-government.html' },
      { num: '5.7',  title: 'Economic Developments and Innovations',   url: 'topic-5-7-economic-developments.html' },
      { num: '5.8',  title: 'Reactions to the Industrial Economy',     url: 'topic-5-8-reactions-industrial-economy.html' },
      { num: '5.9',  title: 'Society and the Industrial Age',          url: 'topic-5-9-society-industrial-age.html' },
      { num: '5.10', title: 'Continuity and Change: 1750\u20131900',   url: 'topic-5-10-continuity-change.html' },
    ]},
    { unit: 6, title: 'Consequences of Industrialization', period: 'c. 1750\u20131900', topics: [
      { num: '6.1', title: 'Rationales for Imperialism',  url: 'topic-6-1-rationales-imperialism.html' },
      { num: '6.2', title: 'State Expansion',             url: 'topic-6-2-state-expansion.html' },
      { num: '6.3', title: 'Indigenous Responses',        url: 'topic-6-3-indigenous-responses.html' },
      { num: '6.4', title: 'Global Economic Development', url: 'topic-6-4-global-economic-development.html' },
      { num: '6.5', title: 'Economic Imperialism',        url: 'topic-6-5-economic-imperialism.html' },
      { num: '6.6', title: 'Causes of Migration',         url: 'topic-6-6-causes-migration.html' },
      { num: '6.7', title: 'Effects of Migration',        url: 'topic-6-7-effects-migration.html' },
      { num: '6.8', title: 'Causation: The Imperial Age', url: 'topic-6-8-causation-imperial-age.html' },
    ]},
    { unit: 7, title: 'Global Conflict', period: 'c. 1900\u2013Present', topics: [
      { num: '7.1', title: 'Shifting Power After 1900',          url: 'topic-7-1-shifting-power.html' },
      { num: '7.2', title: 'Causes of World War I',              url: 'topic-7-2-causes-wwi.html' },
      { num: '7.3', title: 'Conducting World War I',             url: 'topic-7-3-conducting-wwi.html' },
      { num: '7.4', title: 'Economy in the Interwar Period',     url: 'topic-7-4-interwar-economy.html' },
      { num: '7.5', title: 'Unresolved Tensions After WWI',      url: 'topic-7-5-unresolved-tensions.html' },
      { num: '7.6', title: 'Causes of World War II',             url: 'topic-7-6-causes-wwii.html' },
      { num: '7.7', title: 'Conducting World War II',            url: 'topic-7-7-conducting-wwii.html' },
      { num: '7.8', title: 'Mass Atrocities After 1900',         url: 'topic-7-8-mass-atrocities.html' },
      { num: '7.9', title: 'Causation in Global Conflict',       url: 'topic-7-9-causation-global-conflict.html' },
    ]},
    { unit: 8, title: 'Cold War and Decolonization', period: 'c. 1900\u2013Present', topics: [
      { num: '8.1', title: 'Setting the Stage for the Cold War and Decolonization', url: 'topic-8-1-cold-war-stage.html' },
      { num: '8.2', title: 'The Cold War',                                          url: 'topic-8-2-cold-war.html' },
      { num: '8.3', title: 'Effects of the Cold War',                               url: 'topic-8-3-effects-cold-war.html' },
      { num: '8.4', title: 'Spread of Communism After 1900',                        url: 'topic-8-4-spread-communism.html' },
      { num: '8.5', title: 'Decolonization After 1900',                             url: 'topic-8-5-decolonization.html' },
      { num: '8.6', title: 'Newly Independent States',                              url: 'topic-8-6-newly-independent-states.html' },
      { num: '8.7', title: 'Global Resistance to Established Power After 1900',     url: 'topic-8-7-global-resistance.html' },
      { num: '8.8', title: 'End of the Cold War',                                   url: 'topic-8-8-end-cold-war.html' },
      { num: '8.9', title: 'Causation: Cold War and Decolonization',                url: 'topic-8-9-causation-cold-war.html' },
    ]},
    { unit: 9, title: 'Globalization', period: 'c. 1900\u2013Present', topics: [
      { num: '9.1', title: 'Advances in Technology and Exchange After 1900',          url: 'topic-9-1-technology-exchange.html' },
      { num: '9.2', title: 'Technological Advances and Limitations: Disease',         url: 'topic-9-2-disease.html' },
      { num: '9.3', title: 'Technological Advances: Debates About the Environment',   url: 'topic-9-3-environment.html' },
      { num: '9.4', title: 'Economics in the Global Age',                             url: 'topic-9-4-global-economy.html' },
      { num: '9.5', title: 'Calls for Reform and Responses After 1900',               url: 'topic-9-5-calls-for-reform.html' },
      { num: '9.6', title: 'Globalized Culture After 1900',                           url: 'topic-9-6-globalized-culture.html' },
      { num: '9.7', title: 'Resistance to Globalization After 1900',                  url: 'topic-9-7-resistance-globalization.html' },
      { num: '9.8', title: 'Institutions Developing in a Globalized World',           url: 'topic-9-8-global-institutions.html' },
      { num: '9.9', title: 'Continuity and Change in a Globalized World',             url: 'topic-9-9-continuity-change.html' },
    ]},
  ];

  /* ── Detect current page ── */
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';

  var currentUnitNum = null;
  NAV.forEach(function (u) {
    u.topics.forEach(function (t) {
      if (t.url === currentFile) currentUnitNum = u.unit;
    });
  });

  /* ── Build sidebar HTML ── */
  var html = '<aside class="ap-nav" id="ap-nav">';
  html += '<a href="index.html" class="ap-nav-brand">AP World History<span>Modern</span></a>';
  html += '<div class="ap-nav-copyright">\u00a9\u202f2026 Meridian</div>';
  html += '<nav class="ap-nav-inner">';

  NAV.forEach(function (u) {
    var isOpen = (u.unit === currentUnitNum);
    html += '<details class="ap-nav-unit"' + (isOpen ? ' open' : '') + '>';
    html += '<summary class="ap-nav-unit-hd">';
    html += '<span class="ap-nav-unit-badge">Unit ' + u.unit + '</span>';
    html += '<span class="ap-nav-unit-name">' + u.title + '</span>';
    html += '</summary>';
    html += '<ul class="ap-nav-topics">';

    u.topics.forEach(function (t) {
      var isActive = (t.url === currentFile);
      if (t.url) {
        html += '<li class="ap-nav-topic' + (isActive ? ' active' : '') + '">';
        html += '<a href="' + t.url + '"><span class="ap-topic-num">' + t.num + '</span>' + t.title + '</a>';
        html += '</li>';
      } else {
        html += '<li class="ap-nav-topic soon">';
        html += '<span class="ap-topic-num">' + t.num + '</span>' + t.title;
        html += '</li>';
      }
    });

    html += '</ul></details>';
  });

  html += '</nav></aside>';

  /* Mobile toggle button */
  html += '<button class="ap-nav-toggle" id="ap-nav-toggle" aria-label="Open navigation menu">\u2630</button>';

  document.body.insertAdjacentHTML('afterbegin', html);
  document.body.classList.add('has-sidebar');

  /* ── Mobile toggle ── */
  var toggleBtn = document.getElementById('ap-nav-toggle');
  var sidebar   = document.getElementById('ap-nav');
  toggleBtn.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    toggleBtn.textContent = sidebar.classList.contains('open') ? '\u00d7' : '\u2630';
  });

  /* ── PDF toolbar (reading pages only) ── */
  if (currentFile !== 'index.html') {
    var page = document.querySelector('.page');
    if (page) {
      var toolbar = document.createElement('div');
      toolbar.className = 'pdf-toolbar';
      toolbar.innerHTML =
        '<span class="pdf-toolbar-label">📥 Save as PDF:</span>' +
        '<button class="pdf-btn" onclick="window._printReading(\'full\')">📄 Full (with pre-test &amp; questions)</button>' +
        '<button class="pdf-btn" onclick="window._printReading(\'brief\')">📄 Reading only</button>' +
        '<span class="pdf-tip">Tip: in the print dialog, choose "Save as PDF"</span>';
      page.insertAdjacentElement('afterbegin', toolbar);
    }

    window.toggleTubPanel = function (id) {
      var panel = document.getElementById('tub-panel-' + id);
      var btn   = document.getElementById('tub-btn-' + id);
      var isOpen = !panel.hidden;
      document.querySelectorAll('.tub-panel').forEach(function(p) { p.hidden = true; });
      document.querySelectorAll('.tub-pill').forEach(function(b) { b.classList.remove('tub-pill-active'); });
      if (!isOpen) { panel.hidden = false; btn.classList.add('tub-pill-active'); }
    };

    window._printReading = function (mode) {
      if (mode === 'brief') {
        document.documentElement.classList.add('print-brief');
      } else {
        document.documentElement.classList.remove('print-brief');
      }
      window.print();
      /* clean up class after the print dialog closes */
      setTimeout(function () {
        document.documentElement.classList.remove('print-brief');
      }, 2000);
    };
  }

  /* ── Mark-as-Read storage helpers ── */
  var READ_KEY = 'apwh:read:';
  function isRead(file) {
    try { return localStorage.getItem(READ_KEY + file) === '1'; }
    catch (e) { return false; }
  }
  function setRead(file, val) {
    try {
      if (val) localStorage.setItem(READ_KEY + file, '1');
      else localStorage.removeItem(READ_KEY + file);
    } catch (e) {}
  }

  /* ── Sidebar progress indicators (✓ next to read topics) ── */
  function updateSidebarProgress() {
    document.querySelectorAll('.ap-nav-topic a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && isRead(href)) a.parentElement.classList.add('is-read');
      else a.parentElement.classList.remove('is-read');
    });
  }
  updateSidebarProgress();

  /* ── Mark-as-Read button (reading pages only) ── */
  var pageEl = document.querySelector('.page');
  if (pageEl && currentFile !== 'index.html') {
    var mrWrap = document.createElement('div');
    mrWrap.className = 'mark-read-wrap';
    var mrBtn = document.createElement('button');
    mrBtn.type = 'button';
    mrBtn.className = 'mark-read-btn';
    function renderMr() {
      if (isRead(currentFile)) {
        mrBtn.classList.add('is-read');
        mrBtn.setAttribute('aria-pressed', 'true');
        mrBtn.innerHTML =
          '<span class="mark-read-icon" aria-hidden="true">✓</span>' +
          '<span class="mark-read-label">Marked as Read</span>' +
          '<span class="mark-read-undo">tap to undo</span>';
      } else {
        mrBtn.classList.remove('is-read');
        mrBtn.setAttribute('aria-pressed', 'false');
        mrBtn.innerHTML =
          '<span class="mark-read-icon" aria-hidden="true">○</span>' +
          '<span class="mark-read-label">Mark as Read</span>';
      }
    }
    mrBtn.addEventListener('click', function () {
      setRead(currentFile, !isRead(currentFile));
      renderMr();
      updateSidebarProgress();
    });
    renderMr();
    mrWrap.appendChild(mrBtn);
    pageEl.appendChild(mrWrap);
  }

  /* ── Image lightbox (historical/real photos only — NOT AI-generated) ── */
  if (pageEl && currentFile !== 'index.html') {
    function findCaption(img) {
      // Look in same parent first
      if (img.parentElement) {
        var c = img.parentElement.querySelector('.img-caption');
        if (c) return c;
      }
      // Otherwise walk forward
      var n = img.nextElementSibling;
      while (n) {
        if (n.classList && n.classList.contains('img-caption')) return n;
        n = n.nextElementSibling;
      }
      return null;
    }
    pageEl.querySelectorAll('img').forEach(function (img) {
      var cap = findCaption(img);
      if (!cap) return;                               // no caption → skip (decorative/icon)
      if (/AI-generated/i.test(cap.textContent)) return; // AI image → skip
      img.classList.add('zoomable');
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Tap to enlarge image');
    });

    var lightbox = null;
    function ensureLightbox() {
      if (lightbox) return lightbox;
      lightbox = document.createElement('div');
      lightbox.className = 'img-lightbox';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', 'Enlarged image');
      lightbox.innerHTML =
        '<button class="img-lightbox-close" type="button" aria-label="Close enlarged image">×</button>' +
        '<img class="img-lightbox-img" alt="" />' +
        '<div class="img-lightbox-caption"></div>';
      document.body.appendChild(lightbox);
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox ||
            e.target.classList.contains('img-lightbox-close') ||
            e.target.classList.contains('img-lightbox-img')) {
          closeLightbox();
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
      });
      return lightbox;
    }
    function openLightbox(img) {
      var lb = ensureLightbox();
      lb.querySelector('.img-lightbox-img').src = img.src;
      lb.querySelector('.img-lightbox-img').setAttribute('alt', img.getAttribute('alt') || '');
      var cap = findCaption(img);
      lb.querySelector('.img-lightbox-caption').textContent = cap ? cap.textContent.trim() : '';
      lb.classList.add('open');
      document.body.classList.add('lightbox-open');
    }
    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      document.body.classList.remove('lightbox-open');
    }
    pageEl.addEventListener('click', function (e) {
      var t = e.target;
      if (t.tagName === 'IMG' && t.classList.contains('zoomable')) {
        e.preventDefault();
        openLightbox(t);
      }
    });
    pageEl.addEventListener('keydown', function (e) {
      var t = e.target;
      if ((e.key === 'Enter' || e.key === ' ') &&
          t.tagName === 'IMG' && t.classList.contains('zoomable')) {
        e.preventDefault();
        openLightbox(t);
      }
    });
  }

  /* ── Footer ── */
  var page = document.querySelector('.page');
  if (page) {
    var footer = document.createElement('footer');
    footer.className = 'reading-footer';
    footer.innerHTML = '&copy; 2026 Meridian &nbsp;&middot;&nbsp; All rights reserved. &nbsp;&middot;&nbsp; Not for redistribution without permission.';
    page.appendChild(footer);
  }

  /* Close sidebar when clicking outside on mobile */
  document.addEventListener('click', function (e) {
    if (window.innerWidth < 1100 &&
        !sidebar.contains(e.target) &&
        e.target !== toggleBtn) {
      sidebar.classList.remove('open');
      toggleBtn.textContent = '\u2630';
    }
  });
}());
