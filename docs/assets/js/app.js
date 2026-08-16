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
        ".reading-head, .callout, .section-label, figure.reading-figure, .course-header, .hero, .course-card, .unit"
      );
      revealTargets.forEach(function (el) { el.classList.add("reveal"); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
      revealTargets.forEach(function (el) { io.observe(el); });
    }

    /* ---- mark-as-complete toggle (per topic page) ---- */
    var completeBtn = document.querySelector("[data-complete-course]");
    if (completeBtn) {
      var course = completeBtn.getAttribute("data-complete-course");
      var num = completeBtn.getAttribute("data-complete-num");
      function render() {
        var done = window.AgoraProgress.isDone(course, num);
        completeBtn.textContent = done ? "✓ Marked as read" : "Mark as read";
        completeBtn.classList.toggle("btn-primary", done);
      }
      render();
      completeBtn.addEventListener("click", function () {
        window.AgoraProgress.setDone(course, num, !window.AgoraProgress.isDone(course, num));
        render();
      });
    }

    /* ---- course index: paint checkmarks + progress bar from localStorage ---- */
    var progressBar = document.querySelector("[data-course-progress]");
    if (progressBar) {
      var courseSlug = progressBar.getAttribute("data-course-progress");
      var total = parseInt(progressBar.getAttribute("data-total"), 10);
      var stats = window.AgoraProgress.courseStats(courseSlug, total);
      var fill = progressBar.querySelector(".progress-fill");
      var label = progressBar.querySelector(".progress-label");
      if (fill) fill.style.width = stats.pct + "%";
      if (label) label.textContent = stats.done + " / " + stats.total + " read";
      document.querySelectorAll(".topic-link[data-topic-num]").forEach(function (a) {
        if (window.AgoraProgress.isDone(courseSlug, a.getAttribute("data-topic-num"))) {
          a.classList.add("is-done");
        }
      });
    }

    /* ---- landing page: paint mini progress on course cards ---- */
    document.querySelectorAll("[data-card-progress]").forEach(function (el) {
      var courseSlug = el.getAttribute("data-card-progress");
      var total = parseInt(el.getAttribute("data-total"), 10);
      var stats = window.AgoraProgress.courseStats(courseSlug, total);
      el.textContent = stats.done + " of " + stats.total + " readings completed in this browser";
    });
  });
})();
