/* ==========================================================================
   Agora Readings — interactive economics models
   Pure client-side SVG + JS. No backend, no external libraries.
   Currently ships: supply & demand curve shifter.
   ========================================================================== */
(function () {
  "use strict";

  // Renders a draggable supply-and-demand chart into #containerId.
  // Students drag two sliders (demand shift, supply shift) and watch the
  // equilibrium price/quantity point move on the chart in real time.
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
      var dShift = parseInt(dSlider.value, 10); // positive = demand increases (shifts right)
      var sShift = parseInt(sSlider.value, 10); // positive = supply increases (shifts right)

      // Demand: downward-sloping line, shifted horizontally by dShift.
      var dx1 = PAD + 10 + dShift, dy1 = 14;
      var dx2 = PAD + 150 + dShift, dy2 = H - PAD - 10;
      // Supply: upward-sloping line, shifted horizontally by sShift.
      var sx1 = PAD + 10 - sShift, sy1 = H - PAD - 10;
      var sx2 = PAD + 150 - sShift, sy2 = 14;

      demandLine.setAttribute("x1", dx1); demandLine.setAttribute("y1", dy1);
      demandLine.setAttribute("x2", dx2); demandLine.setAttribute("y2", dy2);
      supplyLine.setAttribute("x1", sx1); supplyLine.setAttribute("y1", sy1);
      supplyLine.setAttribute("x2", sx2); supplyLine.setAttribute("y2", sy2);

      // Find intersection of the two line segments (basic line-line intersection).
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

  window.AgoraEconModels = { supplyDemandModel: supplyDemandModel };
})();
