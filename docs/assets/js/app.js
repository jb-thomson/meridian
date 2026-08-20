/* ==========================================================================
   Agora Readings — shared client-side behavior
   No backend: all progress is stored in this browser only, via localStorage.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "agora-progress-v1";

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveProgress(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* storage unavailable — fails silently */ }
  }
  function topicKey(course, num) { return course + "::" + num; }

  window.AgoraProgress = {
    isDone: function (course, num) {
      var p = loadProgress();
      return !!p[topicKey(course, num)];
    },
    setDone: function (course, num, done) {
      var p = loadProgress();
      var key = topicKey(course, num);
      if (done) p[key] = true; else delete p[key];
      saveProgress(p);
    },
    courseStats: function (course, totalTopics) {
      var p = loadProgress();
      var done = 0;
      Object.keys(p).forEach(function (k) {
        if (k.indexOf(course + "::") === 0) done++;
      });
      return { done: done, total: totalTopics, pct: totalTopics ? Math.round((done / totalTopics) * 100) : 0 };
    },
    resetCourse: function (course) {
      var p = loadProgress();
      Object.keys(p).forEach(function (k) {
        if (k.indexOf(course + "::") === 0) delete p[k];
      });
      saveProgress(p);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    /* ---- unit accordions on course index pages ---- */
    document.querySelectorAll(".unit-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.closest(".unit").classList.toggle("open");
      });
    });
    // auto-open the first unit that has an unfinished/active topic, else the first unit
    var firstUnit = document.querySelector(".unit");
    if (firstUnit && !document.querySelector(".unit.open")) firstUnit.classList.add("open");

    /* ---- persistent course sidebar: unit accordion + mobile drawer ---- */
    document.querySelectorAll(".sidebar-unit-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.closest(".sidebar-unit").classList.toggle("open");
      });
    });
    var sidebar = document.getElementById("courseSidebar");
    if (sidebar && !sidebar.querySelector(".sidebar-unit.open")) {
      var activeUnit = sidebar.querySelector(".sidebar-topic-link.active");
      var toOpen = activeUnit ? activeUnit.closest(".sidebar-unit") : sidebar.querySelector(".sidebar-unit");
      if (toOpen) toOpen.classList.add("open");
    }
    var sidebarToggle = document.getElementById("sidebarToggle");
    var sidebarOverlay = document.getElementById("sidebarOverlay");
    function closeSidebar() {
      if (sidebar) sidebar.classList.remove("open");
      if (sidebarOverlay) sidebarOverlay.classList.remove("open");
      if (sidebarToggle) sidebarToggle.setAttribute("aria-expanded", "false");
    }
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", function () {
        var open = sidebar.classList.toggle("open");
        if (sidebarOverlay) sidebarOverlay.classList.toggle("open", open);
        sidebarToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

    /* ---- utility bar: TL;DR / Pre-Test toggle pills, one panel open at a
       time (matches the reference design's toggleTubPanel behavior) ---- */
    document.querySelectorAll("[data-util-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-util-toggle");
        var panel = document.querySelector("[data-util-panel='" + key + "']");
        if (!panel) return;
        var wasOpen = !panel.hidden;
        document.querySelectorAll("[data-util-panel]").forEach(function (p) { p.hidden = true; });
        document.querySelectorAll("[data-util-toggle]").forEach(function (b) { b.classList.remove("util-pill-active"); });
        if (!wasOpen) {
          panel.hidden = false;
          btn.classList.add("util-pill-active");
        }
      });
    });

    /* ---- practice-group accordions (Multiple Choice / Short Answer /
       Long Essay / Check Your Understanding) — one colored bar per type,
       label swaps between "Show" and "Collapse". ---- */
    document.querySelectorAll(".practice-group-toggle").forEach(function (btn) {
      var actionLabel = btn.querySelector(".group-action");
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var item = btn.closest(".practice-group");
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        if (actionLabel) actionLabel.textContent = open ? "Collapse" : "Show";
      });
    });

    /* ---- generic expand/collapse (discussion Qs, SAQ/LEQ/essay reveal, etc.) ---- */
    document.querySelectorAll(".expand-toggle").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var item = btn.closest(".expand-item");
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    /* ---- callouts (TL;DR, Fun Fact, AP/Study Tip) — collapsed by default ---- */
    document.querySelectorAll(".callout-toggle").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var item = btn.closest(".callout");
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    /* ---- vocabulary — tap a term to reveal its definition/importance/example ---- */
    document.querySelectorAll(".vocab-term-btn").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var item = btn.closest(".vocab-item");
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    /* ---- image lightbox ---- */
    var lightbox = document.getElementById("lightbox");
    if (lightbox) {
      var lightboxImg = lightbox.querySelector("img");
      document.querySelectorAll("figure.reading-figure img").forEach(function (img) {
        img.addEventListener("click", function () {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
          lightbox.classList.add("open");
        });
      });
      lightbox.addEventListener("click", function () { lightbox.classList.remove("open"); });
    }

    /* ---- AI image regenerate-prompt toggle ---- */
    document.querySelectorAll(".regen-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-target"));
        if (target) target.classList.toggle("open");
      });
    });

    /* ---- MCQs: collapsed header by default; tap opens the question+choices;
       correct answer/explanation stay hidden until "Show Answer" is tapped
       (or the student picks a choice, which reveals it immediately). ---- */
    document.querySelectorAll(".mcq").forEach(function (mcqEl) {
      var correctIndex = parseInt(mcqEl.getAttribute("data-correct"), 10);
      var header = mcqEl.querySelector(".mcq-header");
      var opts = mcqEl.querySelectorAll(".mcq-opt");
      var revealBtn = mcqEl.querySelector(".mcq-reveal-btn");

      if (header) {
        header.setAttribute("aria-expanded", "false");
        header.addEventListener("click", function () {
          var open = mcqEl.classList.toggle("open");
          header.setAttribute("aria-expanded", open ? "true" : "false");
        });
      }
      opts.forEach(function (opt, i) {
        opt.addEventListener("click", function () {
          if (mcqEl.classList.contains("answered")) return;
          mcqEl.classList.add("answered");
          opt.classList.add(i === correctIndex ? "correct" : "incorrect");
          if (i !== correctIndex) opts[correctIndex].classList.add("correct");
        });
      });
      if (revealBtn) {
        revealBtn.addEventListener("click", function () {
          mcqEl.classList.add("answer-shown");
          opts[correctIndex].classList.add("correct");
        });
      }
    });

    /* ---- print buttons: "Reading Only" vs "Full Version" ---- */
    document.querySelectorAll("[data-action='print']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-print-mode") || "full";
        document.body.classList.toggle("print-reading-only", mode === "reading-only");
        window.print();
      });
    });

    /* ---- gentle scroll-in animation (progressive enhancement only) ----
       Content is fully visible by default in plain CSS. We only arm the
       fade+float-up effect by adding html.js-anim when JS actually runs,
       IntersectionObserver exists, and the visitor hasn't asked for
       reduced motion — so a JS failure or a reduced-motion preference both
       fall back to plain, always-visible content, never a blank wait. ---- */
    var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      document.documentElement.classList.add("js-anim");
      var revealTargets = document.querySelectorAll(
        ".reading-head, .callout, .section-label, figure.reading-figure, .course-header, .unit, " +
        ".theme-chip-row, .util-bar, .vocab-box, .info-box, .practice-group, .video-resources, .econ-model, " +
        ".landing-feature, .landing-row"
      );
      // Only animate elements that are actually below the fold on load.
      // Some templates bake the "reveal" class straight into the markup
      // (landing rows, topic-page blocks), so an element already sitting
      // in the initial viewport needs that class stripped back off —
      // otherwise it "reveals" instantly on page load instead of staying
      // plainly visible, and the float-up effect is reserved for content
      // genuinely brought into view by scrolling, not just cropped to fit
      // above the fold.
      revealTargets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
        el.classList.toggle("reveal", !alreadyVisible);
      });
      // Trigger well before an element actually enters the viewport (a
      // positive bottom margin, not a negative one) so the float-up
      // motion has already started, or finished, by the time it scrolls
      // into view. A trigger point tied to the visible edge reads as
      // "snapped into place" during a fast scroll instead of a float,
      // since there's no time left to see it move.
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: "0px 0px 35% 0px" });
      document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
    }

    /* ---- mark-as-complete toggle (per topic page) ----
       Two buttons exist on a reading (one above the text, one below the
       practice questions), so every one matching this selector needs its
       own click handler and needs to stay in sync with the others. ---- */
    var completeBtns = document.querySelectorAll("[data-complete-course]");
    if (completeBtns.length) {
      var course = completeBtns[0].getAttribute("data-complete-course");
      var num = completeBtns[0].getAttribute("data-complete-num");
      function renderComplete() {
        var done = window.AgoraProgress.isDone(course, num);
        completeBtns.forEach(function (btn) {
          btn.textContent = done ? "✓ Marked as read" : "Mark as read";
          btn.classList.toggle("btn-primary", done);
          btn.title = done ? "Click to unmark as read" : "Click to mark as read";
        });
      }
      renderComplete();
      completeBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var nowDone = !window.AgoraProgress.isDone(course, num);
          window.AgoraProgress.setDone(course, num, nowDone);
          renderComplete();
          var nextHref = btn.getAttribute("data-advance-next");
          if (nowDone && nextHref) {
            setTimeout(function () { window.location.href = nextHref; }, 500);
          }
        });
      });
    }

    /* ---- course index: paint checkmarks + progress bar from localStorage,
       with a reset control to clear all progress for this course ---- */
    var progressBar = document.querySelector("[data-course-progress]");
    if (progressBar) {
      var courseSlug = progressBar.getAttribute("data-course-progress");
      var total = parseInt(progressBar.getAttribute("data-total"), 10);
      var fill = progressBar.querySelector(".progress-fill");
      var label = progressBar.querySelector(".progress-label");
      function renderCourseProgress() {
        var stats = window.AgoraProgress.courseStats(courseSlug, total);
        if (fill) fill.style.width = stats.pct + "%";
        if (label) label.textContent = stats.done + " / " + stats.total + " read";
        document.querySelectorAll(".topic-link[data-topic-num]").forEach(function (a) {
          a.classList.toggle("is-done", window.AgoraProgress.isDone(courseSlug, a.getAttribute("data-topic-num")));
        });
      }
      renderCourseProgress();

      var resetBtn = document.querySelector("[data-reset-course]");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          if (!window.confirm("Reset your reading progress for this course? This can't be undone.")) return;
          window.AgoraProgress.resetCourse(courseSlug);
          renderCourseProgress();
        });
      }
    }

    /* ---- landing page: paint live per-browser progress on course rows,
       both the desktop text line and the mobile bar/percentage ---- */
    document.querySelectorAll("[data-card-progress]").forEach(function (row) {
      var courseSlug = row.getAttribute("data-card-progress");
      var total = parseInt(row.getAttribute("data-total"), 10);
      var published = parseInt(row.getAttribute("data-published"), 10) || 0;
      var stats = window.AgoraProgress.courseStats(courseSlug, total);
      var pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

      // "Coming soon" only ever describes whether readings have been
      // published for this course (a build-time fact) - never whether
      // this particular browser has personally read any of them yet.
      if (published === 0) return;

      var meta = row.querySelector(".landing-meta");
      if (meta) meta.textContent = stats.done + " of " + stats.total + " readings completed in this browser";

      var label = row.querySelector(".landing-progress-label");
      if (label) label.textContent = stats.done + " of " + stats.total + " read";
      var pctEl = row.querySelector(".landing-progress-pct");
      if (pctEl) pctEl.textContent = pct + "%";
      var fill = row.querySelector(".landing-bar-fill");
      if (fill) fill.style.width = pct + "%";
    });
  });
})();
