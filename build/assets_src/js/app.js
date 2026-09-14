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

  // A topic's stored value is either the legacy plain `true` (from before
  // reading/questions were tracked separately, treated as both done) or
  // an { reading, questions } object.
  function statusFromValue(v) {
    if (v === true) return { reading: true, questions: true };
    if (v && typeof v === "object") return { reading: !!v.reading, questions: !!v.questions };
    return { reading: false, questions: false };
  }

  window.AgoraProgress = {
    getStatus: function (course, num) {
      var p = loadProgress();
      return statusFromValue(p[topicKey(course, num)]);
    },
    isDone: function (course, num) {
      return this.getStatus(course, num).reading;
    },
    isFullyDone: function (course, num) {
      var s = this.getStatus(course, num);
      return s.reading && s.questions;
    },
    setPart: function (course, num, part, val) {
      var p = loadProgress();
      var key = topicKey(course, num);
      var cur = statusFromValue(p[key]);
      cur[part] = val;
      if (!cur.reading && !cur.questions) delete p[key]; else p[key] = cur;
      saveProgress(p);
    },
    courseStats: function (course, totalTopics) {
      var p = loadProgress();
      var readDone = 0, fullyDone = 0;
      Object.keys(p).forEach(function (k) {
        if (k.indexOf(course + "::") === 0) {
          var s = statusFromValue(p[k]);
          if (s.reading) readDone++;
          if (s.reading && s.questions) fullyDone++;
        }
      });
      return {
        done: readDone,
        fullyDone: fullyDone,
        total: totalTopics,
        pct: totalTopics ? Math.round((readDone / totalTopics) * 100) : 0
      };
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
    /* ---- display settings: theme (light/dark/auto) + text size,
       present in the topbar on every page. The <head> has an inline
       script that already applied any saved choice before first paint
       (to avoid a flash of the wrong theme); this just wires the UI
       and keeps localStorage in sync. ---- */
    (function () {
      var toggle = document.getElementById("settingsToggle");
      var panel = document.getElementById("settingsPanel");
      if (!toggle || !panel) return;

      function safeGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
      }
      function safeSet(key, val) {
        try {
          if (val === null) localStorage.removeItem(key);
          else localStorage.setItem(key, val);
        } catch (e) { /* storage unavailable — choice just won't persist */ }
      }

      function syncActiveStates() {
        var theme = safeGet("agora-theme") || "system";
        var font = safeGet("agora-font-size") || "md";
        panel.querySelectorAll("[data-theme-choice]").forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-theme-choice") === theme);
        });
        panel.querySelectorAll("[data-font-choice]").forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-font-choice") === font);
        });
      }
      syncActiveStates();

      function closePanel() {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = panel.hidden;
        panel.hidden = !open;
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("click", function (e) {
        if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle) closePanel();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !panel.hidden) closePanel();
      });

      panel.querySelectorAll("[data-theme-choice]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var choice = btn.getAttribute("data-theme-choice");
          if (choice === "system") {
            document.documentElement.removeAttribute("data-theme");
            safeSet("agora-theme", null);
          } else {
            document.documentElement.setAttribute("data-theme", choice);
            safeSet("agora-theme", choice);
          }
          syncActiveStates();
        });
      });
      panel.querySelectorAll("[data-font-choice]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var choice = btn.getAttribute("data-font-choice");
          if (choice === "md") {
            document.documentElement.removeAttribute("data-font");
            safeSet("agora-font-size", null);
          } else {
            document.documentElement.setAttribute("data-font", choice);
            safeSet("agora-font-size", choice);
          }
          syncActiveStates();
        });
      });
    })();

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

    /* ---- vocabulary — tap a term to reveal its definition/importance/example.
       The popover normally opens flush with the pill's left edge; if that
       would push it off the right side of the screen (a pill near the
       right edge), flip it to hang off the pill's right edge instead. ---- */
    document.querySelectorAll(".vocab-term-btn").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var item = btn.closest(".vocab-item");
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        item.classList.remove("open-left");
        if (open) {
          var wrap = item.querySelector(".vocab-body-wrap");
          if (wrap && wrap.getBoundingClientRect().right > window.innerWidth - 8) {
            item.classList.add("open-left");
          }
        }
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

    /* ---- monsoon interactive demo (2.3 pilot): toggle summer/winter wind
       direction, flipping which route arrow + animated ship is shown ---- */
    document.querySelectorAll(".monsoon-demo").forEach(function (demo) {
      var btns = demo.querySelectorAll("[data-season-btn]");
      var captionEl = demo.querySelector(".monsoon-demo-caption");
      var captions = {
        summer: "Summer winds blow southwest to northeast, carrying ships from East Africa and Arabia toward India and Southeast Asia.",
        winter: "Winter winds reverse, blowing northeast to southwest and carrying ships back from India and Southeast Asia toward Africa and Arabia."
      };
      btns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var season = btn.getAttribute("data-season-btn");
          demo.setAttribute("data-season", season);
          btns.forEach(function (b) { b.classList.toggle("active", b === btn); });
          if (captionEl) captionEl.textContent = captions[season] || "";
          var motion = demo.querySelector(
            season === "summer" ? "#monsoonShipSummer" : "#monsoonShipWinter"
          );
          if (motion && motion.beginElement) {
            try { motion.beginElement(); } catch (e) {}
          }
        });
      });
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
      // Trigger right as the element starts entering the viewport. A large
      // positive bottom margin here previously fired the reveal while the
      // element was still well below the fold, so by the time a normal
      // scroll actually brought it into view the whole fade+float
      // transition (0.4s) had already finished off-screen, making the
      // effect invisible no matter how you scrolled. A ~0 margin keeps the
      // motion playing out while the element is actually visible.
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });
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
        var done = window.AgoraProgress.getStatus(course, num).reading;
        completeBtns.forEach(function (btn) {
          btn.textContent = done ? "✓ Marked as read" : "Mark as read";
          btn.classList.toggle("btn-primary", done);
          btn.title = done ? "Click to unmark as read" : "Click to mark as read";
        });
      }
      renderComplete();
      completeBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var nowDone = !window.AgoraProgress.getStatus(course, num).reading;
          window.AgoraProgress.setPart(course, num, "reading", nowDone);
          renderComplete();
          var nextHref = btn.getAttribute("data-advance-next");
          if (nowDone && nextHref) {
            setTimeout(function () { window.location.href = nextHref; }, 500);
          }
        });
      });
    }

    /* ---- mark-questions-done toggle: independent of "mark as read", so
       a student can tell reading a topic apart from having quizzed
       themselves on it and come back to the ones they skipped. ---- */
    var questionsBtns = document.querySelectorAll("[data-questions-course]");
    if (questionsBtns.length) {
      var qCourse = questionsBtns[0].getAttribute("data-questions-course");
      var qNum = questionsBtns[0].getAttribute("data-questions-num");
      function renderQuestions() {
        var done = window.AgoraProgress.getStatus(qCourse, qNum).questions;
        questionsBtns.forEach(function (btn) {
          btn.textContent = done ? "✓ Questions done" : "❓ Mark questions done";
          btn.classList.toggle("btn-primary", done);
          btn.title = done ? "Click to unmark" : "Click to mark the practice questions as done";
        });
      }
      renderQuestions();
      questionsBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var nowDone = !window.AgoraProgress.getStatus(qCourse, qNum).questions;
          window.AgoraProgress.setPart(qCourse, qNum, "questions", nowDone);
          renderQuestions();
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
          var s = window.AgoraProgress.getStatus(courseSlug, a.getAttribute("data-topic-num"));
          a.classList.toggle("is-reading-done", s.reading);
          a.classList.toggle("is-questions-done", s.questions);
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
