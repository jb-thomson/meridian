/* ==========================================================================
   Agora Readings — interactive economics models
   Pure client-side SVG + JS. No backend, no external libraries.
   ========================================================================== */
(function () {
  "use strict";

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function svgEl(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function fmtUSD(n, opts) {
    opts = opts || {};
    var v = Math.round(n);
    return "$" + v.toLocaleString("en-US");
  }

  // ------------------------------------------------------------------
  // Supply & demand curve shifter (topic 2.3 and earlier). Unchanged.
  // ------------------------------------------------------------------
  function supplyDemandModel(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    var W = 320, H = 260, PAD = 34;
    el.innerHTML =
      '<div class="ui-font" style="font-size:.8rem;color:var(--ink-soft);margin-bottom:8px;">' +
      "Drag the two sliders below to shift demand or supply, and watch the equilibrium point move." +
      "</div>" +
      '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;max-width:420px;display:block;margin:0 auto;background:var(--paper);border:1px solid var(--line);border-radius:8px;">' +
        '<line x1="' + PAD + '" y1="10" x2="' + PAD + '" y2="' + (H - PAD) + '" stroke="#999" stroke-width="1"/>' +
        '<line x1="' + PAD + '" y1="' + (H - PAD) + '" x2="' + (W - 10) + '" y2="' + (H - PAD) + '" stroke="#999" stroke-width="1"/>' +
        '<text x="6" y="20" font-size="9" fill="#777">Price</text>' +
        '<text x="' + (W - 66) + '" y="' + (H - 14) + '" font-size="9" fill="#777">Quantity</text>' +
        '<line id="' + containerId + '-supply" stroke="#2f6b4f" stroke-width="2.5"/>' +
        '<line id="' + containerId + '-demand" stroke="#8a4b2f" stroke-width="2.5"/>' +
        '<circle id="' + containerId + '-eq" r="5" fill="#1f6fb2"/>' +
      "</svg>" +
      '<div class="econ-model-controls ui-font" style="margin-top:12px;font-size:.85rem;">' +
        '<label style="display:block;margin-bottom:10px;">Demand shift: <span id="' + containerId + '-dval">no change</span><br>' +
        '<input type="range" min="-40" max="40" value="0" id="' + containerId + '-dslider" style="width:100%;"></label>' +
        '<label style="display:block;">Supply shift: <span id="' + containerId + '-sval">no change</span><br>' +
        '<input type="range" min="-40" max="40" value="0" id="' + containerId + '-sslider" style="width:100%;"></label>' +
        '<p id="' + containerId + '-readout" style="margin-top:12px;font-size:.85rem;color:var(--ink-soft);"></p>' +
      "</div>";

    var supplyLine = document.getElementById(containerId + "-supply");
    var demandLine = document.getElementById(containerId + "-demand");
    var eqDot = document.getElementById(containerId + "-eq");
    var dSlider = document.getElementById(containerId + "-dslider");
    var sSlider = document.getElementById(containerId + "-sslider");
    var dVal = document.getElementById(containerId + "-dval");
    var sVal = document.getElementById(containerId + "-sval");
    var readout = document.getElementById(containerId + "-readout");

    function render() {
      var dShift = parseInt(dSlider.value, 10);
      var sShift = parseInt(sSlider.value, 10);

      var dx1 = PAD + 10 + dShift, dy1 = 14;
      var dx2 = PAD + 150 + dShift, dy2 = H - PAD - 10;
      var sx1 = PAD + 10 - sShift, sy1 = H - PAD - 10;
      var sx2 = PAD + 150 - sShift, sy2 = 14;

      demandLine.setAttribute("x1", dx1); demandLine.setAttribute("y1", dy1);
      demandLine.setAttribute("x2", dx2); demandLine.setAttribute("y2", dy2);
      supplyLine.setAttribute("x1", sx1); supplyLine.setAttribute("y1", sy1);
      supplyLine.setAttribute("x2", sx2); supplyLine.setAttribute("y2", sy2);

      function intersect(p1, p2, p3, p4) {
        var denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
        if (Math.abs(denom) < 1e-6) return null;
        var t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
        return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
      }
      var eq = intersect(
        { x: dx1, y: dy1 }, { x: dx2, y: dy2 },
        { x: sx1, y: sy1 }, { x: sx2, y: sy2 }
      );
      if (eq && eq.x > PAD && eq.x < W - 10 && eq.y > 10 && eq.y < H - PAD) {
        eqDot.setAttribute("cx", eq.x);
        eqDot.setAttribute("cy", eq.y);
        eqDot.style.display = "";
      } else {
        eqDot.style.display = "none";
      }

      dVal.textContent = dShift === 0 ? "no change" : (dShift > 0 ? "demand increases (shifts right)" : "demand decreases (shifts left)");
      sVal.textContent = sShift === 0 ? "no change" : (sShift > 0 ? "supply increases (shifts right)" : "supply decreases (shifts left)");

      var priceMove = eq ? (H - PAD - eq.y) : 0;
      var qtyMove = eq ? (eq.x - (PAD + 80)) : 0;
      var priceWord = Math.abs(priceMove) < 6 ? "stays about the same" : (priceMove > 0 ? "rises" : "falls");
      var qtyWord = Math.abs(qtyMove) < 6 ? "stays about the same" : (qtyMove > 0 ? "rises" : "falls");
      readout.textContent = "At this equilibrium, price " + priceWord + " and quantity " + qtyWord + " compared to the starting point.";
    }

    dSlider.addEventListener("input", render);
    sSlider.addEventListener("input", render);
    render();
  }

  // ------------------------------------------------------------------
  // 1.2 — Production Possibilities Curve
  // ------------------------------------------------------------------
  function ppcChartModel(containerId) {
    var host = document.getElementById(containerId);
    if (!host) return;

    var SVG_W = 500, SVG_H = 310, ML = 60, MR = 20, MT = 20, MB = 50;
    var PW = SVG_W - ML - MR, PH = SVG_H - MT - MB;
    var CAR_MAX = 100, CLOTH_MAX = 500;
    function xs(clothing) { return ML + (clothing / CLOTH_MAX) * PW; }
    function ys(cars) { return MT + PH - (cars / CAR_MAX) * PH; }

    var CX = 440.4, CY = 95.6;
    var GCX = CX * 1.18, GCY = CY * 1.18;

    function ppcPath(cx, cy) {
      var pts = [], N = 120;
      for (var i = 0; i <= N; i++) {
        var t = i / N;
        var clothing = t * cx;
        var cars = cy * Math.sqrt(Math.max(0, 1 - t * t));
        pts.push(xs(clothing).toFixed(1) + "," + ys(cars).toFixed(1));
      }
      return "M " + pts.join(" L ");
    }

    var POINTS = [
      { id: "A", label: "A", clothing: 300, cars: 70, color: "#2563eb", buttonLabel: "Point A",
        title: "Point A — On the Curve",
        description: "Alpha produces 70 cars and 300 units of clothing. Every resource is fully employed — this combination sits right on the frontier. Efficient." },
      { id: "B", label: "B", clothing: 400, cars: 40, color: "#16a34a", buttonLabel: "Point B",
        title: "Point B — On the Curve (Different Mix)",
        description: "Resources shift toward clothing: 40 cars and 400 units of clothing. Still fully efficient, just a different allocation. The opportunity cost of moving from A to B is 30 cars." },
      { id: "inside", label: "C", clothing: 215, cars: 35, color: "#dc2626", buttonLabel: "Inside the Curve",
        title: "Inside the Curve — Inefficient",
        description: "Workers are unemployed, land sits unused, and factories stand idle. The economy produces less than it is capable of. Every point inside the curve represents wasted potential." },
      { id: "outside", label: "D", clothing: 350, cars: 82, color: "#9333ea", buttonLabel: "Outside the Curve",
        title: "Outside the Curve — Currently Impossible",
        description: "No combination of today's resources and technology can reach this point. It is impossible right now. Only economic growth can push the frontier outward to make it reachable." }
    ];

    var originalPath = ppcPath(CX, CY);
    var growthPath = ppcPath(GCX, GCY);

    host.innerHTML =
      '<div class="em-kicker">Interactive Model</div>' +
      '<div class="em-title">Production Possibilities Curve — Country Alpha</div>' +
      '<div class="em-hint">Select a point below to explore each location on the curve.</div>' +
      '<div class="em-svg-wrap"><svg id="' + containerId + '-svg" viewBox="0 0 ' + SVG_W + " " + SVG_H + '" style="max-width:460px;" aria-label="Production possibilities curve for Country Alpha"></svg></div>' +
      '<div class="em-pill-row" id="' + containerId + '-controls"></div>' +
      '<div class="em-readout" id="' + containerId + '-readout"><div class="em-readout-title" id="' + containerId + '-rt"></div><div class="em-readout-body" id="' + containerId + '-rb"></div></div>' +
      '<div class="em-empty" id="' + containerId + '-empty">Select a point above to see what it means.</div>';

    var svg = document.getElementById(containerId + "-svg");
    var controlsEl = document.getElementById(containerId + "-controls");
    var readoutEl = document.getElementById(containerId + "-readout");
    var rtEl = document.getElementById(containerId + "-rt");
    var rbEl = document.getElementById(containerId + "-rb");
    var emptyEl = document.getElementById(containerId + "-empty");

    var selected = null, grown = false;
    var xTicks = [0, 100, 200, 300, 400, 500];
    var yTicks = [0, 20, 40, 60, 80, 100];

    var defs = svgEl("defs", {});
    var clip = svgEl("clipPath", { id: containerId + "-clip" });
    clip.appendChild(svgEl("rect", { x: ML, y: MT, width: PW, height: PH }));
    defs.appendChild(clip);
    svg.appendChild(defs);

    svg.appendChild(svgEl("rect", { x: ML, y: MT, width: PW, height: PH, fill: "#f8fafc", rx: 2 }));

    xTicks.forEach(function (c) {
      svg.appendChild(svgEl("line", { x1: xs(c), y1: MT, x2: xs(c), y2: MT + PH, stroke: "#e4ddd0", "stroke-width": c === 0 ? 0 : 1 }));
      var t = svgEl("text", { x: xs(c), y: MT + PH + 16, "text-anchor": "middle", "font-size": 10, fill: "#94a3b8" });
      t.textContent = c; svg.appendChild(t);
    });
    yTicks.forEach(function (v) {
      svg.appendChild(svgEl("line", { x1: ML, y1: ys(v), x2: ML + PW, y2: ys(v), stroke: "#e4ddd0", "stroke-width": v === 0 ? 0 : 1 }));
      var t = svgEl("text", { x: ML - 8, y: ys(v) + 4, "text-anchor": "end", "font-size": 10, fill: "#94a3b8" });
      t.textContent = v; svg.appendChild(t);
    });

    svg.appendChild(svgEl("line", { x1: ML, y1: MT, x2: ML, y2: MT + PH, stroke: "#64748b", "stroke-width": 1.5 }));
    svg.appendChild(svgEl("line", { x1: ML, y1: MT + PH, x2: ML + PW, y2: MT + PH, stroke: "#64748b", "stroke-width": 1.5 }));

    var xLabel = svgEl("text", { x: ML + PW / 2, y: SVG_H - 8, "text-anchor": "middle", "font-size": 11, fill: "#475569", "font-weight": 500 });
    xLabel.textContent = "Clothing (units)"; svg.appendChild(xLabel);
    var yLabel = svgEl("text", { x: 13, y: MT + PH / 2, "text-anchor": "middle", "font-size": 11, fill: "#475569", "font-weight": 500, transform: "rotate(-90, 13, " + (MT + PH / 2) + ")" });
    yLabel.textContent = "Cars"; svg.appendChild(yLabel);

    var growthG = svgEl("g", { "clip-path": "url(#" + containerId + "-clip)" });
    growthG.style.display = "none";
    growthG.appendChild(svgEl("path", { d: growthPath, fill: "none", stroke: "#16a34a", "stroke-width": 2, "stroke-dasharray": "6 3", opacity: 0.7 }));
    var growthLabel = svgEl("text", { x: xs(10), y: ys(GCY * 0.97), "font-size": 9, fill: "#16a34a", "font-weight": 600 });
    growthLabel.textContent = "New frontier";
    growthG.appendChild(growthLabel);
    svg.appendChild(growthG);

    var curveG = svgEl("g", { "clip-path": "url(#" + containerId + "-clip)" });
    curveG.appendChild(svgEl("path", { d: originalPath, fill: "none", stroke: "#0f172a", "stroke-width": 2.5 }));
    svg.appendChild(curveG);

    var pointsG = svgEl("g", { "clip-path": "url(#" + containerId + "-clip)" });
    POINTS.forEach(function (pt) {
      var g = svgEl("g", { "data-point": pt.id });
      var halo = svgEl("circle", { cx: xs(pt.clothing), cy: ys(pt.cars), r: 14, fill: pt.color, opacity: 0.15, class: "halo" });
      halo.style.display = "none";
      g.appendChild(halo);
      g.appendChild(svgEl("circle", { cx: xs(pt.clothing), cy: ys(pt.cars), r: 5, fill: pt.color, stroke: "white", "stroke-width": 2, class: "dot" }));
      var label = svgEl("text", { x: xs(pt.clothing) + 12, y: ys(pt.cars) - 8, "font-size": 11, fill: pt.color, "font-weight": 700 });
      label.textContent = pt.label;
      g.appendChild(label);
      pointsG.appendChild(g);
    });
    svg.appendChild(pointsG);

    POINTS.forEach(function (pt) {
      var btn = el("button", { type: "button", class: "em-pill" });
      btn.style.setProperty("--pt-color", pt.color);
      btn.innerHTML = '<span class="em-swatch"></span>' + pt.buttonLabel;
      btn.dataset.point = pt.id;
      btn.addEventListener("click", function () {
        selected = (selected === pt.id) ? null : pt.id;
        render();
      });
      controlsEl.appendChild(btn);
    });
    var growBtn = el("button", { type: "button", class: "em-pill", id: containerId + "-grow" });
    growBtn.innerHTML = '<span style="color:#16a34a">↗</span> Grow the economy';
    growBtn.addEventListener("click", function () { grown = !grown; render(); });
    controlsEl.appendChild(growBtn);

    function render() {
      growthG.style.display = grown ? "" : "none";
      growBtn.classList.toggle("active", grown);
      if (grown) growBtn.style.setProperty("--pt-color", "#16a34a");
      else growBtn.style.removeProperty("--pt-color");

      POINTS.forEach(function (pt) {
        var g = svg.querySelector('g[data-point="' + pt.id + '"]');
        var isSel = selected === pt.id;
        g.querySelector(".halo").style.display = isSel ? "" : "none";
        g.querySelector(".dot").setAttribute("r", isSel ? 7 : 5);
        var btn = controlsEl.querySelector('button[data-point="' + pt.id + '"]');
        btn.classList.toggle("active", isSel);
      });

      var active = POINTS.filter(function (p) { return p.id === selected; })[0];
      if (active) {
        readoutEl.classList.add("visible");
        readoutEl.style.setProperty("--pt-color", active.color);
        rtEl.textContent = active.title;
        rbEl.textContent = active.description;
        emptyEl.style.display = "none";
      } else if (grown) {
        readoutEl.classList.add("visible");
        readoutEl.style.setProperty("--pt-color", "#16a34a");
        rtEl.textContent = "Economic Growth — The Frontier Shifts Outward";
        rbEl.textContent = "More resources, better technology, or a more skilled workforce pushes the entire curve outward. Combinations that were impossible yesterday become achievable today.";
        emptyEl.style.display = "none";
      } else {
        readoutEl.classList.remove("visible");
        emptyEl.style.display = "";
      }
    }
    render();
  }

  // ------------------------------------------------------------------
  // 1.3 — Command/market spectrum diagram
  // ------------------------------------------------------------------
  function spectrumDiagramModel(containerId) {
    var host = document.getElementById(containerId);
    if (!host) return;

    var COUNTRIES = [
      { name: "North Korea", cx: 90, cy: 61, labelY: 30, below: false, color: "#c0392b",
        fact: "The state controls nearly all production, sets prices, and rations food. Citizens cannot own private businesses or freely choose their occupation." },
      { name: "Cuba", cx: 164, cy: 61, labelY: 30, below: false, color: "#c0392b",
        fact: "The government owns most industries and sets wages. Since the 1990s, limited private markets in agriculture and small businesses have been quietly tolerated." },
      { name: "Denmark", cx: 364, cy: 61, labelY: 100, below: true, color: "#e67e22",
        fact: "A free-market economy with one of the world's most generous welfare states, funded by high taxes. Universal healthcare and free university education are paid for collectively." },
      { name: "United States", cx: 484, cy: 61, labelY: 30, below: false, color: "#27ae60",
        fact: "Primarily market-driven — prices set by supply and demand, most businesses privately owned. Government still shapes the economy through Social Security, Medicare, and industry regulation." },
      { name: "Hong Kong", cx: 612, cy: 61, labelY: 100, below: true, color: "#27ae60",
        fact: "One of the world's freest economies: low taxes, minimal trade barriers, and strong legal protections for private property. Government spending as a share of the economy is among the lowest in the developed world." }
    ];

    host.innerHTML =
      '<div class="em-kicker">Interactive Model</div>' +
      '<div class="em-title">Where Do Real Economies Fall on the Spectrum?</div>' +
      '<div class="em-hint">Tap or hover a country marker to read a fact about its economic system.</div>' +
      '<div class="em-svg-wrap"><svg id="' + containerId + '-svg" viewBox="0 0 700 130" style="max-width:700px;" aria-label="Spectrum from pure command to pure market economies"></svg></div>' +
      '<div class="em-spectrum-panel" id="' + containerId + '-panel"><div class="em-spectrum-panel-hint">Tap or hover a country marker to learn more</div></div>';

    var svg = document.getElementById(containerId + "-svg");
    var panel = document.getElementById(containerId + "-panel");

    var defs = svgEl("defs", {});
    var grad = svgEl("linearGradient", { id: containerId + "-grad", x1: "0%", y1: "0%", x2: "100%", y2: "0%" });
    grad.appendChild(svgEl("stop", { offset: "0%", "stop-color": "#c0392b" }));
    grad.appendChild(svgEl("stop", { offset: "50%", "stop-color": "#e67e22" }));
    grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": "#27ae60" }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    svg.appendChild(svgEl("rect", { x: 40, y: 52, width: 620, height: 18, rx: 9, fill: "url(#" + containerId + "-grad)" }));
    var leftLabel = svgEl("text", { x: 40, y: 45, "text-anchor": "middle", "font-size": 11, fill: "#888" });
    leftLabel.textContent = "Pure Command"; svg.appendChild(leftLabel);
    var rightLabel = svgEl("text", { x: 660, y: 45, "text-anchor": "middle", "font-size": 11, fill: "#888" });
    rightLabel.textContent = "Pure Market"; svg.appendChild(rightLabel);

    var active = null;

    function setActive(name) {
      active = name;
      COUNTRIES.forEach(function (c) {
        var g = svg.querySelector('g[data-country="' + c.name.replace(/"/g, "") + '"]');
        var isActive = active === c.name;
        g.querySelector(".stem").setAttribute("stroke", isActive ? c.color : "#333");
        g.querySelector(".glow").style.display = isActive ? "" : "none";
        g.querySelector(".dot").setAttribute("r", isActive ? 8 : 6);
        g.querySelector(".dot").setAttribute("fill", isActive ? c.color : "#fff");
        var label = g.querySelector(".label");
        label.setAttribute("fill", isActive ? c.color : "#333");
      });
      if (active) {
        var c = COUNTRIES.filter(function (x) { return x.name === active; })[0];
        panel.innerHTML =
          '<div class="em-spectrum-panel-content"><span class="em-dot" style="background:' + c.color + '"></span>' +
          '<div><span class="em-spectrum-panel-name" style="color:' + c.color + '">' + c.name + '</span>' +
          '<span class="em-spectrum-panel-fact">' + c.fact + '</span></div></div>';
      } else {
        panel.innerHTML = '<div class="em-spectrum-panel-hint">Tap or hover a country marker to learn more</div>';
      }
    }

    COUNTRIES.forEach(function (c) {
      var g = svgEl("g", { "data-country": c.name, tabindex: "0", role: "button", "aria-label": c.name + ": " + c.fact, style: "cursor:pointer;outline:none;" });
      if (c.below) {
        g.appendChild(svgEl("line", { x1: c.cx, y1: 70, x2: c.cx, y2: 86, stroke: "#333", "stroke-width": 1.5, class: "stem" }));
      } else {
        g.appendChild(svgEl("line", { x1: c.cx, y1: 52, x2: c.cx, y2: 38, stroke: "#333", "stroke-width": 1.5, class: "stem" }));
      }
      var glow = svgEl("circle", { cx: c.cx, cy: c.cy, r: 11, fill: "none", stroke: c.color, "stroke-width": 2, opacity: 0.35, class: "glow" });
      glow.style.display = "none";
      g.appendChild(glow);
      g.appendChild(svgEl("circle", { cx: c.cx, cy: c.cy, r: 6, fill: "#fff", stroke: c.color, "stroke-width": 2, class: "dot" }));
      var label = svgEl("text", { x: c.cx, y: c.labelY, "text-anchor": "middle", "font-size": 11, "font-weight": "bold", fill: "#333", class: "label" });
      label.textContent = c.name;
      g.appendChild(label);

      g.addEventListener("mouseenter", function () { setActive(c.name); });
      g.addEventListener("mouseleave", function () { setActive(null); });
      g.addEventListener("focus", function () { setActive(c.name); });
      g.addEventListener("blur", function () { setActive(null); });
      g.addEventListener("click", function () { setActive(active === c.name ? null : c.name); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(active === c.name ? null : c.name); }
      });
      svg.appendChild(g);
    });
  }

  // ------------------------------------------------------------------
  // 1.4 — GDP per capita line chart
  // ------------------------------------------------------------------
  function gdpChartModel(containerId) {
    var host = document.getElementById(containerId);
    if (!host) return;

    var data = [
      { year: 1960, usa: 3007, korea: 158, china: 89, russia: null },
      { year: 1965, usa: 3828, korea: 114, china: 98, russia: null },
      { year: 1970, usa: 5234, korea: 280, china: 115, russia: null },
      { year: 1975, usa: 7801, korea: 613, china: 178, russia: null },
      { year: 1980, usa: 12553, korea: 1715, china: 194, russia: null },
      { year: 1985, usa: 18236, korea: 2556, china: 294, russia: null },
      { year: 1990, usa: 23889, korea: 6516, china: 349, russia: 3485 },
      { year: 1995, usa: 28690, korea: 12564, china: 605, russia: 2584 },
      { year: 1998, usa: 31399, korea: 8138, china: 828, russia: 1834 },
      { year: 2000, usa: 36317, korea: 11948, china: 959, russia: 1775 },
      { year: 2005, usa: 44122, korea: 18640, china: 1753, russia: 5323 },
      { year: 2010, usa: 48358, korea: 22087, china: 4550, russia: 10675 },
      { year: 2015, usa: 56803, korea: 27195, china: 8069, russia: 9313 },
      { year: 2020, usa: 63544, korea: 31631, china: 10434, russia: 10127 }
    ];
    var COUNTRIES = ["usa", "korea", "china", "russia"];
    var COLORS = { usa: "#2563eb", korea: "#16a34a", china: "#dc2626", russia: "#d97706" };
    var LABELS = { usa: "United States", korea: "South Korea", china: "China", russia: "Russia" };

    host.innerHTML =
      '<div class="em-kicker">Data Chart</div>' +
      '<div class="em-title">GDP Per Capita, 1960–2020</div>' +
      '<div class="em-hint">Current USD. Click a country below to show or hide it. Hover a point to see the year’s value.</div>' +
      '<div class="em-svg-wrap"><svg id="' + containerId + '-svg" viewBox="0 0 560 300" style="max-width:560px;" aria-label="GDP per capita 1960 to 2020 for four countries"></svg></div>' +
      '<div id="' + containerId + '-tip" style="font-family:-apple-system,sans-serif;font-size:0.8rem;color:var(--ink-soft);min-height:1.4em;margin-top:6px;text-align:center;"></div>' +
      '<div class="em-legend-row" id="' + containerId + '-legend"></div>';

    var SVG_W = 560, SVG_H = 300, ML = 54, MR = 16, MT = 14, MB = 34;
    var PW = SVG_W - ML - MR, PH = SVG_H - MT - MB;
    var YEAR_MIN = 1960, YEAR_MAX = 2020;
    var maxVal = 65000;

    function lx(year) { return ML + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * PW; }
    function ly(val) { return MT + PH - (val / maxVal) * PH; }

    var svg = document.getElementById(containerId + "-svg");
    var tip = document.getElementById(containerId + "-tip");
    var legend = document.getElementById(containerId + "-legend");
    var hidden = {};

    var yTicks = [0, 15000, 30000, 45000, 60000];
    yTicks.forEach(function (v) {
      svg.appendChild(svgEl("line", { x1: ML, y1: ly(v), x2: ML + PW, y2: ly(v), stroke: v === 0 ? "#94a3b8" : "#e4ddd0", "stroke-width": v === 0 ? 1.5 : 1 }));
      var t = svgEl("text", { x: ML - 6, y: ly(v) + 4, "text-anchor": "end", "font-size": 9, fill: "#94a3b8" });
      t.textContent = "$" + Math.round(v / 1000) + "k";
      svg.appendChild(t);
    });
    [1960, 1970, 1980, 1990, 2000, 2010, 2020].forEach(function (y) {
      var t = svgEl("text", { x: lx(y), y: MT + PH + 16, "text-anchor": "middle", "font-size": 9, fill: "#94a3b8" });
      t.textContent = y;
      svg.appendChild(t);
    });

    var refLines = [
      { year: 1978, color: COLORS.china, label: "Deng's reforms", key: "china" },
      { year: 1991, color: COLORS.russia, label: "USSR collapse", key: "russia" }
    ];
    refLines.forEach(function (r) {
      var g = svgEl("g", { "data-ref": r.key });
      g.appendChild(svgEl("line", { x1: lx(r.year), y1: MT, x2: lx(r.year), y2: MT + PH, stroke: r.color, "stroke-width": 1, "stroke-dasharray": "4 3", opacity: 0.6 }));
      var t = svgEl("text", { x: lx(r.year) + 3, y: MT + 10, "font-size": 9, fill: r.color, "font-weight": 600 });
      t.textContent = r.label;
      g.appendChild(t);
      svg.appendChild(g);
    });

    var lineGroup = svgEl("g", {});
    svg.appendChild(lineGroup);
    var paths = {};
    COUNTRIES.forEach(function (key) {
      var pts = data.filter(function (d) { return d[key] !== null; })
        .map(function (d) { return lx(d.year).toFixed(1) + "," + ly(d[key]).toFixed(1); });
      var path = svgEl("path", { d: "M " + pts.join(" L "), fill: "none", stroke: COLORS[key], "stroke-width": 2 });
      lineGroup.appendChild(path);
      paths[key] = path;
    });

    var guideLine = svgEl("line", { y1: MT, y2: MT + PH, stroke: "#94a3b8", "stroke-width": 1, "stroke-dasharray": "3 2", opacity: 0 });
    svg.appendChild(guideLine);

    var hoverDots = {};
    var hoverDotsGroup = svgEl("g", {});
    svg.appendChild(hoverDotsGroup);
    COUNTRIES.forEach(function (key) {
      var dot = svgEl("circle", { r: 4, fill: COLORS[key], stroke: "white", "stroke-width": 1.5, opacity: 0 });
      hoverDotsGroup.appendChild(dot);
      hoverDots[key] = dot;
    });

    // One continuous hit area — always resolves to the nearest actual data
    // point by x-distance, so hover feels smooth across the whole chart
    // instead of jumping between fixed zones.
    var hitRect = svgEl("rect", { x: ML, y: MT, width: PW, height: PH, fill: "transparent", style: "cursor:crosshair;" });
    svg.appendChild(hitRect);

    function nearestPoint(mouseX) {
      var best = data[0], bestDist = Infinity;
      data.forEach(function (d) {
        var dist = Math.abs(lx(d.year) - mouseX);
        if (dist < bestDist) { bestDist = dist; best = d; }
      });
      return best;
    }

    hitRect.addEventListener("mousemove", function (evt) {
      var rect = svg.getBoundingClientRect();
      var scaleX = SVG_W / rect.width;
      var mouseX = (evt.clientX - rect.left) * scaleX;
      var d = nearestPoint(mouseX);
      var px = lx(d.year);
      guideLine.setAttribute("x1", px);
      guideLine.setAttribute("x2", px);
      guideLine.setAttribute("opacity", 1);
      COUNTRIES.forEach(function (key) {
        var dot = hoverDots[key];
        if (hidden[key] || d[key] === null || d[key] === undefined) {
          dot.setAttribute("opacity", 0);
        } else {
          dot.setAttribute("cx", px);
          dot.setAttribute("cy", ly(d[key]));
          dot.setAttribute("opacity", 1);
        }
      });
      showTip(d);
    });
    hitRect.addEventListener("mouseleave", function () {
      guideLine.setAttribute("opacity", 0);
      COUNTRIES.forEach(function (key) { hoverDots[key].setAttribute("opacity", 0); });
      tip.textContent = "";
    });

    function showTip(d) {
      var parts = COUNTRIES.filter(function (k) { return !hidden[k] && d[k] !== null && d[k] !== undefined; })
        .sort(function (a, b) { return d[b] - d[a]; })
        .map(function (k) { return LABELS[k] + ": " + fmtUSD(d[k]); });
      tip.textContent = d.year + "  —  " + parts.join("  ·  ");
    }

    COUNTRIES.forEach(function (key) {
      var btn = el("button", { type: "button", class: "em-legend-btn", id: containerId + "-leg-" + key });
      btn.innerHTML = '<span class="em-dot" style="background:' + COLORS[key] + '"></span><span class="em-legend-label">' + LABELS[key] + '</span>';
      btn.addEventListener("click", function () {
        hidden[key] = !hidden[key];
        paths[key].style.display = hidden[key] ? "none" : "";
        btn.classList.toggle("dim", !!hidden[key]);
        var refG = svg.querySelector('g[data-ref="' + key + '"]');
        if (refG) refG.style.opacity = hidden[key] ? 0.15 : 1;
      });
      legend.appendChild(btn);
    });
  }

  // ------------------------------------------------------------------
  // 1.5a — Budget calculator (needs / wants / savings)
  // ------------------------------------------------------------------
  function budgetCalculatorModel(containerId) {
    var host = document.getElementById(containerId);
    if (!host) return;

    host.innerHTML =
      '<div class="em-kicker">Interactive Calculator</div>' +
      '<div class="em-title">50/30/20 Budget Calculator</div>' +
      '<div class="em-hint">Enter your take-home pay and adjust the percentages to fit your situation.</div>' +
      '<div class="em-toggle-row"><button type="button" class="active" data-mode="monthly">Monthly take-home</button><button type="button" data-mode="hourly">Hourly wage</button></div>' +
      '<div id="' + containerId + '-inputs"></div>' +
      '<div class="em-bar" id="' + containerId + '-bar" style="margin:14px 0;"></div>' +
      '<div class="em-donut-row">' +
        '<svg viewBox="0 0 100 100" id="' + containerId + '-donut" aria-hidden="true"></svg>' +
        '<div class="em-donut-legend" id="' + containerId + '-donut-legend"></div>' +
      '</div>' +
      '<div class="em-two-col" id="' + containerId + '-buckets"></div>';

    var mode = "monthly";
    var monthly = 3000, hourly = 15, hours = 40;
    var pcts = { needs: 50, wants: 30, savings: 20 };

    var inputsEl = document.getElementById(containerId + "-inputs");
    var barEl = document.getElementById(containerId + "-bar");
    var donut = document.getElementById(containerId + "-donut");
    var donutLegend = document.getElementById(containerId + "-donut-legend");
    var bucketsEl = document.getElementById(containerId + "-buckets");
    var toggleBtns = host.querySelectorAll(".em-toggle-row button");

    var BUCKETS = [
      { key: "needs", label: "Needs", color: "#2563eb", examples: "Rent, utilities, groceries, transportation, minimum debt payments" },
      { key: "wants", label: "Wants", color: "#ea580c", examples: "Dining out, entertainment, subscriptions, non-essential clothing" },
      { key: "savings", label: "Savings", color: "#16a34a", examples: "Emergency fund, retirement, extra debt payments" }
    ];

    toggleBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        mode = btn.dataset.mode;
        toggleBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
        renderInputs();
        render();
      });
    });

    function renderInputs() {
      if (mode === "monthly") {
        inputsEl.innerHTML =
          '<div class="em-field"><label>Monthly take-home ($)</label><input type="number" min="0" step="100" id="' + containerId + '-monthly" value="' + monthly + '"></div>';
        document.getElementById(containerId + "-monthly").addEventListener("input", function (e) {
          monthly = parseFloat(e.target.value) || 0; render();
        });
      } else {
        inputsEl.innerHTML =
          '<div class="em-field"><label>Hourly rate ($)</label><input type="number" min="0" step="0.25" id="' + containerId + '-hourly" value="' + hourly + '">' +
          '<label>Hours/week</label><input type="number" min="0" max="168" step="1" id="' + containerId + '-hours" value="' + hours + '"></div>';
        document.getElementById(containerId + "-hourly").addEventListener("input", function (e) {
          hourly = parseFloat(e.target.value) || 0; render();
        });
        document.getElementById(containerId + "-hours").addEventListener("input", function (e) {
          hours = parseFloat(e.target.value) || 0; render();
        });
      }
    }

    function redistribute(changed, newVal) {
      var clamped = Math.max(0, Math.min(100, newVal));
      var remaining = 100 - clamped;
      var others = BUCKETS.map(function (b) { return b.key; }).filter(function (k) { return k !== changed; });
      var otherTotal = pcts[others[0]] + pcts[others[1]];
      var next = {}; next[changed] = clamped;
      if (otherTotal === 0) {
        var half = Math.floor(remaining / 2);
        next[others[0]] = half;
        next[others[1]] = remaining - half;
      } else {
        next[others[0]] = Math.round((remaining * pcts[others[0]]) / otherTotal);
        next[others[1]] = remaining - next[others[0]];
      }
      pcts = next;
    }

    BUCKETS.forEach(function (b) {
      var card = el("div", { class: "em-bucket", style: "background:color-mix(in srgb," + b.color + " 8%, var(--paper-raised));border-left:4px solid " + b.color + ";" });
      card.innerHTML =
        '<div class="em-bucket-head"><span class="em-bucket-label" style="color:' + b.color + '">' + b.label + '</span><span class="em-bucket-amount" style="color:' + b.color + '" id="' + containerId + '-amt-' + b.key + '"></span></div>' +
        '<div class="em-bucket-row"><input type="range" min="0" max="100" step="1" id="' + containerId + '-sl-' + b.key + '" style="accent-color:' + b.color + '">' +
        '<input type="number" min="0" max="100" step="1" id="' + containerId + '-num-' + b.key + '"><span style="font-size:0.78rem;color:var(--ink-soft);">%</span></div>' +
        '<div class="em-bucket-examples">' + b.examples + '</div>';
      bucketsEl.appendChild(card);
      var slider = card.querySelector("#" + containerId + "-sl-" + b.key);
      var num = card.querySelector("#" + containerId + "-num-" + b.key);
      slider.addEventListener("input", function () { redistribute(b.key, parseInt(slider.value, 10)); render(); });
      num.addEventListener("change", function () { redistribute(b.key, parseInt(num.value, 10) || 0); render(); });
    });

    BUCKETS.forEach(function (b) {
      barEl.appendChild(el("div", { class: "em-bar-seg", id: containerId + "-bar-" + b.key, style: "background:" + b.color + ";width:0%;" }));
    });
    var barEmpty = el("div", { class: "em-bar-empty", id: containerId + "-bar-empty" }, "Enter income above to see your breakdown");
    barEl.appendChild(barEmpty);

    BUCKETS.forEach(function (b) {
      var row = el("div", {});
      row.innerHTML = '<span class="em-swatch-sq" style="background:' + b.color + '"></span><span style="color:' + b.color + ';font-weight:600;">' + b.label + '</span> <span id="' + containerId + '-dl-' + b.key + '" style="color:var(--ink-soft);"></span>';
      donutLegend.appendChild(row);
    });

    function render() {
      var takeHome = mode === "monthly" ? monthly : Math.round((hourly * hours * 52) / 12);
      var hasIncome = takeHome > 0;

      BUCKETS.forEach(function (b) {
        var slider = document.getElementById(containerId + "-sl-" + b.key);
        var num = document.getElementById(containerId + "-num-" + b.key);
        slider.value = pcts[b.key];
        num.value = pcts[b.key];
        var amount = Math.round(takeHome * (pcts[b.key] / 100));
        document.getElementById(containerId + "-amt-" + b.key).textContent = hasIncome ? fmtUSD(amount) : "";
        var barSeg = document.getElementById(containerId + "-bar-" + b.key);
        barSeg.style.width = (hasIncome ? pcts[b.key] : 0) + "%";
        barSeg.textContent = hasIncome ? pcts[b.key] + "%" : "";
        document.getElementById(containerId + "-dl-" + b.key).textContent =
          pcts[b.key] + "%" + (hasIncome ? " — " + fmtUSD(amount) + "/mo" : "");
      });
      barEmpty.style.display = hasIncome ? "none" : "flex";

      // donut
      donut.innerHTML = "";
      donut.appendChild(svgEl("circle", { cx: 50, cy: 50, r: 40, fill: "none", stroke: "#e2e8f0", "stroke-width": 18 }));
      var circumference = 2 * Math.PI * 40;
      var offset = circumference / 4;
      BUCKETS.forEach(function (b) {
        var dash = hasIncome ? circumference * (pcts[b.key] / 100) : 0;
        donut.appendChild(svgEl("circle", {
          cx: 50, cy: 50, r: 40, fill: "none", stroke: b.color, "stroke-width": 18,
          "stroke-dasharray": dash + " " + (circumference - dash), "stroke-dashoffset": offset
        }));
        offset -= dash;
      });
      donut.appendChild(svgEl("circle", { cx: 50, cy: 50, r: 28, fill: "var(--paper-raised)" }));
      if (hasIncome) {
        var t1 = svgEl("text", { x: 50, y: 47, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: "#1e293b" });
        t1.textContent = fmtUSD(takeHome);
        donut.appendChild(t1);
        var t2 = svgEl("text", { x: 50, y: 59, "text-anchor": "middle", "font-size": 6, fill: "#64748b" });
        t2.textContent = "/mo";
        donut.appendChild(t2);
      }
    }

    renderInputs();
    render();
  }

  // ------------------------------------------------------------------
  // 1.5b — Compound interest calculator
  // ------------------------------------------------------------------
  function compoundInterestCalculatorModel(containerId) {
    var host = document.getElementById(containerId);
    if (!host) return;

    function calcFV(monthlyPmt, annualRate, years) {
      if (annualRate === 0) return monthlyPmt * 12 * years;
      var r = annualRate / 100 / 12;
      var n = years * 12;
      return monthlyPmt * ((Math.pow(1 + r, n) - 1) / r);
    }
    function fmtShort(n) {
      if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
      if (n >= 1000) return "$" + Math.round(n / 1000) + "k";
      return "$" + Math.round(n);
    }

    host.innerHTML =
      '<div class="em-kicker">Interactive Calculator</div>' +
      '<div class="em-title">Compound Interest — What Will Your Savings Grow To?</div>' +
      '<div class="em-hint" id="' + containerId + '-hint">Adjust the sliders to explore how monthly contributions, return rate, and time affect the final balance.</div>' +
      '<div class="em-toggle-row"><button type="button" class="active" data-mode="single">Single scenario</button><button type="button" data-mode="compare">Early vs. late saver</button></div>' +
      '<div id="' + containerId + '-body"></div>';

    var mode = "single";
    var single = { monthly: 100, rate: 7, years: 30 };
    var compare = { rate: 7, aMonthly: 200, aYears: 40, bMonthly: 400, bYears: 20 };

    var hint = document.getElementById(containerId + "-hint");
    var body = document.getElementById(containerId + "-body");
    var toggleBtns = host.querySelectorAll(".em-toggle-row button");
    toggleBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        mode = btn.dataset.mode;
        toggleBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
        hint.textContent = mode === "single"
          ? "Adjust the sliders to explore how monthly contributions, return rate, and time affect the final balance."
          : "Compare two savers with different start times or contribution amounts to see the impact of starting early.";
        renderBody();
      });
    });

    function sliderRow(id, label, value, min, max, step, format) {
      return '<div class="em-slider-row"><div class="em-slider-label"><span>' + label + '</span><span class="em-slider-val" id="' + id + '-val">' + format(value) + '</span></div>' +
        '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></div>';
    }

    function renderBody() {
      if (mode === "single") {
        body.innerHTML =
          '<div class="em-two-col">' +
            sliderRow(containerId + "-monthly", "Monthly contribution", single.monthly, 10, 500, 10, function (v) { return "$" + v; }) +
            sliderRow(containerId + "-rate", "Annual return rate", single.rate, 1, 12, 0.5, function (v) { return v + "%"; }) +
            sliderRow(containerId + "-years", "Years invested", single.years, 5, 50, 1, function (v) { return v + " yr"; }) +
          '</div>' +
          '<div class="em-svg-wrap"><svg id="' + containerId + '-chart" viewBox="0 0 500 220" style="max-width:500px;" aria-label="Growth of savings over time"></svg></div>' +
          '<div class="em-stat-grid" id="' + containerId + '-stats"></div>';

        var mSlider = document.getElementById(containerId + "-monthly");
        var rSlider = document.getElementById(containerId + "-rate");
        var ySlider = document.getElementById(containerId + "-years");
        mSlider.addEventListener("input", function () { single.monthly = parseFloat(mSlider.value); renderSingle(); });
        rSlider.addEventListener("input", function () { single.rate = parseFloat(rSlider.value); renderSingle(); });
        ySlider.addEventListener("input", function () { single.years = parseInt(ySlider.value, 10); renderSingle(); });
        renderSingle();
      } else {
        body.innerHTML =
          sliderRow(containerId + "-crate", "Annual return rate (shared)", compare.rate, 1, 12, 0.5, function (v) { return v + "%"; }) +
          '<div class="em-two-col" style="margin-top:8px;">' +
            '<div style="border:2px solid #3b82f6;border-radius:10px;padding:12px;">' +
              '<div style="font-weight:800;color:#3b82f6;font-size:0.8rem;text-transform:uppercase;margin-bottom:8px;">Saver A — starts early</div>' +
              sliderRow(containerId + "-amonthly", "Monthly contribution", compare.aMonthly, 10, 500, 10, function (v) { return "$" + v; }) +
              sliderRow(containerId + "-ayears", "Years invested", compare.aYears, 5, 50, 1, function (v) { return v + " yr"; }) +
            '</div>' +
            '<div style="border:2px solid #a855f7;border-radius:10px;padding:12px;">' +
              '<div style="font-weight:800;color:#a855f7;font-size:0.8rem;text-transform:uppercase;margin-bottom:8px;">Saver B — starts later</div>' +
              sliderRow(containerId + "-bmonthly", "Monthly contribution", compare.bMonthly, 10, 500, 10, function (v) { return "$" + v; }) +
              sliderRow(containerId + "-byears", "Years invested", compare.bYears, 5, 50, 1, function (v) { return v + " yr"; }) +
            '</div>' +
          '</div>' +
          '<div class="em-svg-wrap"><svg id="' + containerId + '-chart" viewBox="0 0 500 220" style="max-width:500px;" aria-label="Comparison of two savers"></svg></div>' +
          '<div class="em-stat-grid" id="' + containerId + '-stats"></div>' +
          '<div id="' + containerId + '-compare-msg" style="margin-top:10px;font-size:0.82rem;padding:10px 12px;border-radius:8px;"></div>';

        ["crate", "amonthly", "ayears", "bmonthly", "byears"].forEach(function (id) {
          document.getElementById(containerId + "-" + id).addEventListener("input", function (e) {
            var v = parseFloat(e.target.value);
            if (id === "crate") compare.rate = v;
            if (id === "amonthly") compare.aMonthly = v;
            if (id === "ayears") compare.aYears = Math.round(v);
            if (id === "bmonthly") compare.bMonthly = v;
            if (id === "byears") compare.bYears = Math.round(v);
            renderCompare();
          });
        });
        renderCompare();
      }
    }

    function updateSliderVal(id, text) {
      var v = document.getElementById(id + "-val");
      if (v) v.textContent = text;
    }

    function renderSingle() {
      updateSliderVal(containerId + "-monthly", "$" + single.monthly);
      updateSliderVal(containerId + "-rate", single.rate + "%");
      updateSliderVal(containerId + "-years", single.years + " yr");

      var milestones = Array.from(new Set([
        Math.round(single.years / 4), Math.round(single.years / 2), Math.round((single.years * 3) / 4), single.years
      ].filter(function (p) { return p > 0; })));
      var data = milestones.map(function (y) {
        var fv = calcFV(single.monthly, single.rate, y);
        var contributed = single.monthly * 12 * y;
        return { y: y, fv: fv, contributed: contributed, growth: fv - contributed };
      });
      var maxFV = Math.max.apply(null, data.map(function (d) { return d.fv; }).concat([1]));

      var SVG_W = 500, SVG_H = 220, ML = 46, MR = 14, MT = 14, MB = 40;
      var PW = SVG_W - ML - MR, PH = SVG_H - MT - MB;
      var svg = document.getElementById(containerId + "-chart");
      svg.innerHTML = "";
      [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
        var y = MT + PH - t * PH, val = t * maxFV;
        svg.appendChild(svgEl("line", { x1: ML, y1: y, x2: ML + PW, y2: y, stroke: t === 0 ? "#94a3b8" : "#e4ddd0", "stroke-width": t === 0 ? 1.5 : 1 }));
        var lbl = svgEl("text", { x: ML - 6, y: y + 3, "text-anchor": "end", "font-size": 9, fill: "#94a3b8" });
        lbl.textContent = fmtShort(val); svg.appendChild(lbl);
      });
      var numBars = data.length, gap = 16;
      var barW = Math.min(70, (PW - gap * (numBars + 1)) / numBars);
      var totalW = numBars * barW + (numBars - 1) * gap;
      var startX = ML + (PW - totalW) / 2;
      data.forEach(function (d, i) {
        var x = startX + i * (barW + gap);
        var contribH = (d.contributed / maxFV) * PH;
        var growthH = (d.growth / maxFV) * PH;
        svg.appendChild(svgEl("rect", { x: x, y: MT + PH - contribH, width: barW, height: contribH, fill: "#2c3e50", rx: 2 }));
        if (growthH > 0) svg.appendChild(svgEl("rect", { x: x, y: MT + PH - contribH - growthH, width: barW, height: growthH, fill: "#27ae60", rx: 2 }));
        var vt = svgEl("text", { x: x + barW / 2, y: MT + PH - contribH - growthH - 5, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: "#334155" });
        vt.textContent = fmtShort(d.fv); svg.appendChild(vt);
        var yt = svgEl("text", { x: x + barW / 2, y: MT + PH + 16, "text-anchor": "middle", "font-size": 10, "font-weight": 600, fill: "#475569" });
        yt.textContent = d.y + (d.y === 1 ? " yr" : " yrs"); svg.appendChild(yt);
      });
      svg.appendChild(svgEl("rect", { x: ML, y: SVG_H - 14, width: 10, height: 10, fill: "#2c3e50" }));
      var l1 = svgEl("text", { x: ML + 14, y: SVG_H - 5, "font-size": 9, fill: "#555" }); l1.textContent = "Amount contributed"; svg.appendChild(l1);
      svg.appendChild(svgEl("rect", { x: ML + 140, y: SVG_H - 14, width: 10, height: 10, fill: "#27ae60" }));
      var l2 = svgEl("text", { x: ML + 154, y: SVG_H - 5, "font-size": 9, fill: "#555" }); l2.textContent = "Investment growth"; svg.appendChild(l2);

      var final = data[data.length - 1];
      var statsEl = document.getElementById(containerId + "-stats");
      statsEl.innerHTML = "";
      [
        { label: "Total contributed", value: fmtUSD(final.contributed), color: "#2c3e50" },
        { label: "Investment growth", value: fmtUSD(final.growth), color: "#27ae60" },
        { label: "Final balance", value: fmtUSD(final.fv), color: "#2563eb" }
      ].forEach(function (s) {
        var d = el("div", { class: "em-stat", style: "--pt-color:" + s.color + ";" });
        d.innerHTML = '<div class="em-stat-label">' + s.label + '</div><div class="em-stat-value">' + s.value + '</div>';
        statsEl.appendChild(d);
      });
    }

    function renderCompare() {
      updateSliderVal(containerId + "-crate", compare.rate + "%");
      updateSliderVal(containerId + "-amonthly", "$" + compare.aMonthly);
      updateSliderVal(containerId + "-ayears", compare.aYears + " yr");
      updateSliderVal(containerId + "-bmonthly", "$" + compare.bMonthly);
      updateSliderVal(containerId + "-byears", compare.bYears + " yr");

      var maxYears = Math.max(compare.aYears, compare.bYears);
      var milestones = Array.from(new Set([
        Math.round(maxYears / 4), Math.round(maxYears / 2), Math.round((maxYears * 3) / 4), maxYears
      ].filter(function (p) { return p > 0; })));

      function seriesFor(monthlyAmt, years) {
        return milestones.map(function (y) {
          var clampedY = Math.min(y, years);
          var fv = calcFV(monthlyAmt, compare.rate, clampedY);
          var contributed = monthlyAmt * 12 * clampedY;
          return { y: y, fv: fv, contributed: contributed, growth: fv - contributed };
        });
      }
      var dataA = seriesFor(compare.aMonthly, compare.aYears);
      var dataB = seriesFor(compare.bMonthly, compare.bYears);
      var maxFV = Math.max.apply(null, dataA.concat(dataB).map(function (d) { return d.fv; }).concat([1]));

      var SVG_W = 500, SVG_H = 220, ML = 46, MR = 14, MT = 14, MB = 40;
      var PW = SVG_W - ML - MR, PH = SVG_H - MT - MB;
      var svg = document.getElementById(containerId + "-chart");
      svg.innerHTML = "";
      [0, 0.25, 0.5, 0.75, 1].forEach(function (t) {
        var y = MT + PH - t * PH, val = t * maxFV;
        svg.appendChild(svgEl("line", { x1: ML, y1: y, x2: ML + PW, y2: y, stroke: t === 0 ? "#94a3b8" : "#e4ddd0", "stroke-width": t === 0 ? 1.5 : 1 }));
        var lbl = svgEl("text", { x: ML - 6, y: y + 3, "text-anchor": "end", "font-size": 9, fill: "#94a3b8" });
        lbl.textContent = fmtShort(val); svg.appendChild(lbl);
      });

      var numGroups = milestones.length, groupGap = 18, pairGap = 4;
      var barW = Math.min(28, (PW - groupGap * (numGroups + 1)) / (numGroups * 2.25));
      var groupW = barW * 2 + pairGap;
      var totalW = numGroups * groupW + (numGroups - 1) * groupGap;
      var startX = ML + (PW - totalW) / 2;

      milestones.forEach(function (m, i) {
        var gx = startX + i * (groupW + groupGap);
        var dA = dataA[i], dB = dataB[i];
        var aContribH = (dA.contributed / maxFV) * PH, aGrowthH = (dA.growth / maxFV) * PH;
        var bContribH = (dB.contributed / maxFV) * PH, bGrowthH = (dB.growth / maxFV) * PH;
        svg.appendChild(svgEl("rect", { x: gx, y: MT + PH - aContribH, width: barW, height: aContribH, fill: "#1e3a5f", rx: 2 }));
        if (aGrowthH > 0) svg.appendChild(svgEl("rect", { x: gx, y: MT + PH - aContribH - aGrowthH, width: barW, height: aGrowthH, fill: "#3b82f6", rx: 2 }));
        var bx = gx + barW + pairGap;
        svg.appendChild(svgEl("rect", { x: bx, y: MT + PH - bContribH, width: barW, height: bContribH, fill: "#4a1942", rx: 2 }));
        if (bGrowthH > 0) svg.appendChild(svgEl("rect", { x: bx, y: MT + PH - bContribH - bGrowthH, width: barW, height: bGrowthH, fill: "#a855f7", rx: 2 }));
        var yt = svgEl("text", { x: gx + groupW / 2, y: MT + PH + 16, "text-anchor": "middle", "font-size": 10, "font-weight": 600, fill: "#475569" });
        yt.textContent = m + " yr" + (m !== 1 ? "s" : ""); svg.appendChild(yt);
      });
      svg.appendChild(svgEl("rect", { x: ML, y: SVG_H - 14, width: 10, height: 10, fill: "#3b82f6" }));
      var la = svgEl("text", { x: ML + 14, y: SVG_H - 5, "font-size": 9, fill: "#555" }); la.textContent = "Saver A"; svg.appendChild(la);
      svg.appendChild(svgEl("rect", { x: ML + 80, y: SVG_H - 14, width: 10, height: 10, fill: "#a855f7" }));
      var lb = svgEl("text", { x: ML + 94, y: SVG_H - 5, "font-size": 9, fill: "#555" }); lb.textContent = "Saver B"; svg.appendChild(lb);

      var finalA = dataA[dataA.length - 1], finalB = dataB[dataB.length - 1];
      var statsEl = document.getElementById(containerId + "-stats");
      statsEl.innerHTML = "";
      [
        { label: "Saver A final balance", value: fmtUSD(finalA.fv), color: "#3b82f6" },
        { label: "Saver B final balance", value: fmtUSD(finalB.fv), color: "#a855f7" }
      ].forEach(function (s) {
        var d = el("div", { class: "em-stat", style: "--pt-color:" + s.color + ";" });
        d.innerHTML = '<div class="em-stat-label">' + s.label + '</div><div class="em-stat-value">' + s.value + '</div>';
        statsEl.appendChild(d);
      });

      var msg = document.getElementById(containerId + "-compare-msg");
      if (finalA.fv > finalB.fv) {
        msg.style.background = "#eff6ff"; msg.style.border = "1px solid #bfdbfe"; msg.style.color = "#1e40af";
        msg.textContent = "Starting early gives Saver A " + fmtUSD(finalA.fv - finalB.fv) + " more, " + Math.round(((finalA.fv - finalB.fv) / finalB.fv) * 100) + "% ahead of Saver B.";
      } else {
        msg.style.background = "#faf5ff"; msg.style.border = "1px solid #e9d5ff"; msg.style.color = "#6b21a8";
        msg.textContent = "With the current settings, Saver B ends up " + fmtUSD(finalB.fv - finalA.fv) + " ahead. Try giving Saver A more years and a smaller contribution to see the power of starting early.";
      }
    }

    renderBody();
  }

  // ------------------------------------------------------------------
  // 1-review — scenario quiz game (14 mixed Unit 1 scenarios)
  // ------------------------------------------------------------------
  var UNIT1_QUESTIONS = [
    { category: "Opportunity Cost?", emoji: "📚", scenario: "Marcus turns down a $120 work shift and skips a friend's party to spend Saturday studying for his economics exam. What is the opportunity cost of his decision to study?", choices: ["The knowledge he gains from studying — the main output of the choice", "The $120 wage from the shift — the highest-value alternative he gave up", "The cost of his economics textbook", "Both the $120 and the party equally — all foregone options count as opportunity cost"], correctIndex: 1, explanation: "Opportunity cost is the value of the single best alternative foregone, not all alternatives combined. Marcus had two other options: work ($120) and the party. The $120 shift is worth more than the party (presumably), so it is the opportunity cost. Always identify the highest-valued next-best option." },
    { category: "Opportunity Cost?", emoji: "🌳", scenario: "A city uses a prime downtown lot to build a public park. The land could have been sold to a developer for $2,000,000. The park itself costs $500,000 to construct. What is the opportunity cost of the decision to build the park?", choices: ["$500,000 — the explicit cost of building the park", "$2,500,000 — the total of land value plus construction cost", "$2,000,000 — the value of the land's best alternative use (sale to developer)", "$0 — public parks have no economic cost since they are free to visit"], correctIndex: 2, explanation: "The opportunity cost of using the land for a park is the $2,000,000 the city gave up by not selling to the developer. The $500,000 construction cost is an explicit dollar cost, but opportunity cost asks: what is the value of the next-best thing you did not do?" },
    { category: "Factor of Production?", emoji: "👨‍🍳", scenario: "A bakery employs eight people who mix dough, operate ovens, frost cakes, and serve customers. When economists classify the inputs to this business, these eight workers are classified as which factor of production?", choices: ["Land", "Capital", "Labor", "Entrepreneurship"], correctIndex: 2, explanation: "Labor is the factor of production consisting of human effort, physical and mental, applied to production. The employees who perform the work are the labor factor." },
    { category: "Factor of Production?", emoji: "⚙️", scenario: "The same bakery uses industrial stand mixers, commercial ovens, refrigerated display cases, and a delivery van. These tools and machines are which factor of production?", choices: ["Land", "Capital", "Labor", "Entrepreneurship"], correctIndex: 1, explanation: "Capital, in economics, means manufactured equipment used in production, machines, tools, buildings. Economists use 'capital' to mean productive equipment, not money." },
    { category: "Factor of Production?", emoji: "💡", scenario: "The bakery's founder came up with the concept, secured a $200,000 bank loan, developed all the recipes, decides what products to offer each season, hires and fires employees, and personally bears the financial risk if the business fails. This role is classified as which factor?", choices: ["Labor", "Capital", "Land", "Entrepreneurship"], correctIndex: 3, explanation: "Entrepreneurship is the organizing factor: combining land, labor, and capital to produce output and bearing the financial risk. Entrepreneurs earn profit (or absorb losses) rather than wages, rent, or interest." },
    { category: "Economic System?", emoji: "🏛️", scenario: "A government planning bureau sets annual production targets for every factory: 50,000 tons of steel, 200,000 refrigerators, 1.2 million pairs of shoes. Factories must sell all output to state-run stores at government-set prices.", choices: ["Market economy — the government is responding to consumer demand signals", "Traditional economy — production follows long-established cultural patterns", "Command economy — a central authority controls what, how, and for whom production happens", "Mixed economy — the government and private firms share production decisions"], correctIndex: 2, explanation: "A command economy has government control of the factors of production and centrally answers what, how, and for whom. Production quotas and government-set prices are the defining features." },
    { category: "Economic System?", emoji: "🎣", scenario: "For seven generations, a coastal fishing village has passed its nets, boats, and fishing techniques from parent to child. They fish the same waters their grandparents fished, and roles are determined by which family one is born into.", choices: ["Market economy — they trade with neighboring villages", "Command economy — village elders dictate production roles", "Mixed economy — they combine traditional fishing with modern markets", "Traditional economy — custom, habit, and birth determine economic roles"], correctIndex: 3, explanation: "Traditional economies answer economic questions through custom, habit, and inherited roles. Production methods rarely change and roles are determined by family rather than individual choice." },
    { category: "Smart Finance?", emoji: "💰", scenario: "Jaylen earns $2,800/month after tax. His employer matches 100% of his 401(k) contributions up to 3% of salary. He currently contributes 0% and is paying off a car loan at 8% APR. What should he prioritize FIRST?", choices: ["Pay the car loan aggressively — 8% interest is expensive", "Build a savings account first — keep 3 months of expenses liquid", "Contribute at least 3% to his 401(k) to capture the full employer match — an immediate 100% guaranteed return", "Wait until he earns more before thinking about retirement"], correctIndex: 2, explanation: "A 100% employer match is an immediate, guaranteed 100% return on every dollar contributed, far exceeding the 8% cost of the car loan. Capturing the full match is always the first priority when one is available." },
    { category: "Smart Finance?", emoji: "💳", scenario: "Sofia has a $3,500 credit card balance at 26% APR. She pays only the $50 monthly minimum. At this rate it will take over 20 years and more than $12,000 in total payments to pay off $3,500. What BEST explains why?", choices: ["The card company made a math error — minimum payments should be sufficient", "Compound interest works against borrowers: unpaid interest is added to the principal, and future interest is charged on the larger total", "26% APR is lower than average, so the payoff time is actually good", "Credit cards should never be used to pay for ongoing expenses, only emergencies"], correctIndex: 1, explanation: "This is compound interest working against a borrower. A $50 payment barely covers the monthly interest, so the balance barely shrinks. Each month, unpaid interest is added to principal, and next month interest is charged on the larger total." },
    { category: "Inflation Type?", emoji: "💸", scenario: "During a period of very strong economic growth, Congress passes a major stimulus package putting $1.9 trillion into consumers' hands. With more money chasing roughly the same supply of goods, prices across nearly every category start rising quickly.", choices: ["Cost-push inflation — rising input costs are pushing prices up from the supply side", "Demand-pull inflation — excess consumer spending exceeds productive capacity, pulling prices up", "Wage-price spiral — workers demand raises to keep up with prices", "Hyperinflation — prices are rising so fast the currency becomes worthless"], correctIndex: 1, explanation: "Demand-pull inflation occurs when aggregate spending exceeds the economy's productive capacity, too much money chasing too few goods. The stimulus added spending power without adding equivalent production capacity." },
    { category: "Inflation Type?", emoji: "🛢️", scenario: "OPEC nations cut global oil production sharply. Since oil is an input to transportation, plastics, fertilizer, and heating, production costs rise across almost every industry simultaneously. Companies raise prices to protect their margins.", choices: ["Demand-pull inflation — consumers demanded more oil-dependent products", "Hyperinflation — the oil shock causes runaway price increases", "Cost-push inflation — rising input costs (oil) push prices up throughout the economy", "Money supply inflation — the government is printing too much currency"], correctIndex: 2, explanation: "Cost-push inflation starts on the supply side: when a key input becomes more expensive, production costs rise and companies pass the increase to consumers. Oil is the classic cost-push input." },
    { category: "PPC?", emoji: "✈️", scenario: "An economy can produce a maximum of 200 aircraft or 4,000 trucks, or any combination along its production possibilities frontier. It currently produces 80 aircraft and 2,500 trucks. What does this production point indicate?", choices: ["The economy is on its PPC — 80 aircraft and 2,500 trucks is an efficient combination", "The economy is outside its PPC — this combination is unattainable", "The economy is inside its PPC — resources are underutilized or being used inefficiently", "The economy is at its optimal point — any other combination would be worse"], correctIndex: 2, explanation: "A point inside the production possibilities frontier represents underutilization or inefficiency. The economy could produce more of one or both goods if operating on the frontier." },
    { category: "PPC?", emoji: "🔬", scenario: "Scientists develop a new manufacturing process that lets the same workers and raw materials produce 40% more output per hour. This technological improvement affects the economy's production possibilities frontier by:", choices: ["Moving the economy from inside to a point on the existing PPC", "Shifting the PPC inward — efficient production requires fewer resources, reducing capacity", "Shifting the PPC outward — the economy can now produce more of all goods, reaching combinations that were previously impossible", "Having no effect on the PPC — only more workers or natural resources can shift the curve"], correctIndex: 2, explanation: "Technological improvement is a main driver of economic growth and an outward PPC shift: the same inputs can now produce more output, so the economy can reach combinations that were previously unattainable." }
  ];

  function unit1ScenarioGameModel(containerId) {
    var host = document.getElementById(containerId);
    if (!host) return;
    var Q = UNIT1_QUESTIONS;
    var current = 0, selected = null, score = 0, done = false, wrong = [];

    function messageFor(s, total) {
      var pct = s / total;
      if (pct === 1) return "Perfect score. You've mastered Unit 1.";
      if (pct >= 0.85) return "Strong work. Review the few you missed and you're ready for the test.";
      if (pct >= 0.69) return "Solid foundation. Go back over the sections where you struggled.";
      if (pct >= 0.50) return "Halfway there. The flashcard deck is a good next step.";
      return "More practice needed. Work through the key concepts section again, then try this again.";
    }

    function render() {
      if (done) {
        var pct = Math.round((score / Q.length) * 100);
        host.innerHTML =
          '<div class="em-kicker">Interactive Model</div>' +
          '<div class="em-quiz-done">' +
          '<div class="em-quiz-score">' + score + ' / ' + Q.length + '</div>' +
          '<div class="em-quiz-pct" style="color:var(--course-color,var(--good));">' + pct + '%</div>' +
          '<div class="em-quiz-msg">' + messageFor(score, Q.length) + '</div>' +
          (wrong.length ? '<div style="text-align:left;max-width:32em;margin:0 auto 16px;background:var(--accent-soft);border-radius:10px;padding:12px 14px;font-size:0.82rem;"><strong>Review these scenarios:</strong><ul style="margin:8px 0 0;padding-left:1.2em;">' +
            wrong.map(function (i) { return '<li>Q' + (i + 1) + ': ' + Q[i].scenario.slice(0, 70) + '…</li>'; }).join('') + '</ul></div>' : '') +
          '<button type="button" class="btn btn-primary" id="' + containerId + '-retry">Try again</button>' +
          '</div>';
        document.getElementById(containerId + "-retry").addEventListener("click", function () {
          current = 0; selected = null; score = 0; done = false; wrong = []; render();
        });
        return;
      }

      var q = Q[current];
      var isAnswered = selected !== null;
      var isCorrect = selected === q.correctIndex;

      host.innerHTML =
        '<div class="em-kicker">Interactive Model</div>' +
        '<div class="em-quiz-head"><span>Score: ' + score + '</span><span>' + (current + 1) + ' / ' + Q.length + '</span></div>' +
        '<div class="em-quiz-progress"><div class="em-quiz-progress-fill" style="width:' + ((current / Q.length) * 100) + '%;"></div></div>' +
        '<div class="em-quiz-badge">' + q.category + '</div>' +
        '<div class="em-quiz-scenario' + (isAnswered ? (isCorrect ? ' correct' : ' wrong') : '') + '">' +
        '<div class="em-quiz-emoji">' + q.emoji + '</div><div>' + q.scenario + '</div></div>' +
        '<div class="em-quiz-choices" id="' + containerId + '-choices"></div>' +
        (isAnswered ? '<div class="em-quiz-explain' + (isCorrect ? '' : ' wrong') + '"><div class="em-quiz-explain-title">' + (isCorrect ? 'Correct.' : 'Not quite.') + '</div>' + q.explanation + '</div>' +
          '<div class="em-quiz-next-row"><button type="button" class="btn btn-primary" id="' + containerId + '-next">' + (current + 1 >= Q.length ? 'See results' : 'Next scenario') + '</button></div>' : '');

      var choicesEl = document.getElementById(containerId + "-choices");
      q.choices.forEach(function (choice, idx) {
        var cls = "em-quiz-choice";
        if (isAnswered && idx === q.correctIndex) cls += " correct";
        if (isAnswered && idx === selected && idx !== q.correctIndex) cls += " wrong";
        var btn = el("button", { type: "button", class: cls });
        if (isAnswered) btn.disabled = true;
        btn.innerHTML = '<span class="em-quiz-letter">' + String.fromCharCode(65 + idx) + '.</span><span>' + choice + '</span>';
        btn.addEventListener("click", function () {
          if (selected !== null) return;
          selected = idx;
          if (idx === q.correctIndex) score++; else wrong.push(current);
          render();
        });
        choicesEl.appendChild(btn);
      });

      if (isAnswered) {
        document.getElementById(containerId + "-next").addEventListener("click", function () {
          if (current + 1 >= Q.length) { done = true; } else { current++; selected = null; }
          render();
        });
      }
    }
    render();
  }

  // ------------------------------------------------------------------
  // Flashcard deck (Unit review pages) — data supplied via a JSON
  // <script> tag on the page, id="flashcard-data-<topic-num-slug>".
  // ------------------------------------------------------------------
  function flashcardDeckModel(containerId, cards) {
    var host = document.getElementById(containerId);
    if (!host || !cards || !cards.length) return;

    var STORAGE_PREFIX = "meridian-flashcards-" + containerId + "-";
    function load(key, fallback) {
      try {
        var v = localStorage.getItem(STORAGE_PREFIX + key);
        return v !== null ? JSON.parse(v) : fallback;
      } catch (e) { return fallback; }
    }
    function save(key, val) {
      try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val)); } catch (e) {}
    }

    var ratings = load("ratings", {});
    var filterSection = load("filter", "all");
    var viewMode = load("viewmode", "all");
    var index = load("index", 0);
    var flipped = false;

    var sectionOptions = [];
    var seen = {};
    cards.forEach(function (c) {
      if (!seen[c.sectionNumber]) { seen[c.sectionNumber] = true; sectionOptions.push([c.sectionNumber, c.sectionLabel]); }
    });

    host.innerHTML =
      '<div class="em-kicker">Interactive Model</div>' +
      '<div class="em-title">Unit 1 Flashcard Deck</div>' +
      '<div class="em-hint">Click a card to flip it, then rate yourself.</div>' +
      '<div class="em-flashcard-controls">' +
        '<select id="' + containerId + '-filter"></select>' +
        '<button type="button" class="btn btn-sm" id="' + containerId + '-shuffle">🔀 Shuffle</button>' +
      '</div>' +
      '<div class="em-flashcard-score" id="' + containerId + '-score"></div>' +
      '<div id="' + containerId + '-cardwrap"></div>';

    var filterSel = document.getElementById(containerId + "-filter");
    filterSel.appendChild(el("option", { value: "all" }, "All sections — " + cards.length + " terms"));
    sectionOptions.forEach(function (opt) {
      var count = cards.filter(function (c) { return c.sectionNumber === opt[0]; }).length;
      filterSel.appendChild(el("option", { value: opt[0] }, opt[0] + " — " + opt[1] + " (" + count + " terms)"));
    });
    filterSel.value = filterSection;
    filterSel.addEventListener("change", function () {
      filterSection = filterSel.value; save("filter", filterSection);
      viewMode = "all"; save("viewmode", viewMode);
      index = 0; save("index", index); flipped = false;
      render();
    });
    document.getElementById(containerId + "-shuffle").addEventListener("click", function () {
      for (var i = cards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp;
      }
      index = 0; save("index", index); flipped = false;
      render();
    });

    function currentDeck() {
      var deck = filterSection === "all" ? cards : cards.filter(function (c) { return c.sectionNumber === filterSection; });
      if (viewMode === "learning-only") deck = deck.filter(function (c) { return ratings[c.word] === "learning"; });
      return deck;
    }

    function render() {
      var deck = currentDeck();
      var total = deck.length;
      var safeIndex = total > 0 ? index % total : 0;
      var card = deck[safeIndex];

      var sectionScoped = filterSection === "all" ? cards : cards.filter(function (c) { return c.sectionNumber === filterSection; });
      var gotCount = sectionScoped.filter(function (c) { return ratings[c.word] === "got"; }).length;
      var learningCount = sectionScoped.filter(function (c) { return ratings[c.word] === "learning"; }).length;

      var scoreEl = document.getElementById(containerId + "-score");
      scoreEl.innerHTML =
        '<span>✓ ' + gotCount + ' got it</span><span>✗ ' + learningCount + ' still learning</span>' +
        (learningCount > 0 ? '<button type="button" class="btn btn-sm" id="' + containerId + '-reviewbtn">' + (viewMode === "learning-only" ? "← Back to full deck" : "Review still-learning (" + learningCount + ")") + '</button>' : '');
      var reviewBtn = document.getElementById(containerId + "-reviewbtn");
      if (reviewBtn) reviewBtn.addEventListener("click", function () {
        viewMode = viewMode === "learning-only" ? "all" : "learning-only";
        save("viewmode", viewMode); index = 0; save("index", index); flipped = false; render();
      });

      var wrap = document.getElementById(containerId + "-cardwrap");
      if (!card) {
        wrap.innerHTML = '<div class="em-empty" style="padding:20px 0;">No cards to show in this view.</div>';
        return;
      }

      var ratingClass = ratings[card.word] === "got" ? " got" : ratings[card.word] === "learning" ? " learning" : "";
      wrap.innerHTML =
        '<div class="em-flashcard-meta"><span>' + (safeIndex + 1) + ' of ' + total + '</span><span>' + card.sectionNumber + '</span></div>' +
        '<div class="em-flashcard' + ratingClass + '" id="' + containerId + '-card" tabindex="0">' +
        '<span class="em-flashcard-side">' + (flipped ? "DEFINITION" : "TERM") + '</span>' +
        (flipped ? '<span class="em-flashcard-def">' + card.definition + '</span>' : '<span class="em-flashcard-word">' + card.word + '</span>') +
        '<span class="em-flashcard-hint">' + (flipped ? "Click to flip back" : "Click to reveal definition") + '</span>' +
        '</div>' +
        '<div class="em-flashcard-rate-row" style="' + (flipped ? "" : "visibility:hidden;") + '">' +
        '<button type="button" class="btn btn-sm" id="' + containerId + '-got">✓ Got it</button>' +
        '<button type="button" class="btn btn-sm" id="' + containerId + '-learning">✗ Still learning</button>' +
        '</div>' +
        '<div class="em-flashcard-nav-row">' +
        '<button type="button" class="btn btn-sm" id="' + containerId + '-prev">← Prev</button>' +
        '<button type="button" class="btn btn-sm" id="' + containerId + '-next">Next →</button>' +
        '</div>';

      document.getElementById(containerId + "-card").addEventListener("click", function () {
        flipped = !flipped; render();
      });
      document.getElementById(containerId + "-prev").addEventListener("click", function (e) {
        e.stopPropagation(); flipped = false;
        index = (safeIndex - 1 + total) % total; save("index", index); render();
      });
      document.getElementById(containerId + "-next").addEventListener("click", function (e) {
        e.stopPropagation(); flipped = false;
        index = (safeIndex + 1) % total; save("index", index); render();
      });
      var gotBtn = document.getElementById(containerId + "-got");
      var learningBtn = document.getElementById(containerId + "-learning");
      if (gotBtn) gotBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        ratings[card.word] = "got"; save("ratings", ratings);
        flipped = false; index = (safeIndex + 1) % total; save("index", index); render();
      });
      if (learningBtn) learningBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        ratings[card.word] = "learning"; save("ratings", ratings);
        flipped = false; index = (safeIndex + 1) % total; save("index", index); render();
      });
    }
    render();
  }

  // ------------------------------------------------------------------
  // Dispatcher — scans the page for [data-econ-model] containers.
  // ------------------------------------------------------------------
  var REGISTRY = {
    "supply-demand": function (id) { supplyDemandModel(id); },
    "ppc-chart": ppcChartModel,
    "spectrum-diagram": spectrumDiagramModel,
    "gdp-chart": gdpChartModel,
    "budget-calculator": budgetCalculatorModel,
    "compound-interest-calculator": compoundInterestCalculatorModel,
    "unit1-scenario-game": unit1ScenarioGameModel,
    "flashcard-deck": function (id) {
      var script = document.querySelector('script[id^="flashcard-data-"]');
      var cards = [];
      if (script) {
        try { cards = JSON.parse(script.textContent); } catch (e) { cards = []; }
      }
      flashcardDeckModel(id, cards);
    }
  };

  function initAll() {
    var nodes = document.querySelectorAll("[data-econ-model]");
    nodes.forEach(function (node) {
      var kind = node.getAttribute("data-econ-model");
      var fn = REGISTRY[kind];
      if (fn) fn(node.id);
    });
  }

  window.AgoraEconModels = {
    supplyDemandModel: supplyDemandModel,
    ppcChartModel: ppcChartModel,
    spectrumDiagramModel: spectrumDiagramModel,
    gdpChartModel: gdpChartModel,
    budgetCalculatorModel: budgetCalculatorModel,
    compoundInterestCalculatorModel: compoundInterestCalculatorModel,
    unit1ScenarioGameModel: unit1ScenarioGameModel,
    flashcardDeckModel: flashcardDeckModel,
    initAll: initAll
  };
})();
