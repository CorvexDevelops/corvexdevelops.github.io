/* Componenti visivi: decifratura del testo, cubo isometrico, arte ASCII animata, mappa operativa. */
(function () {
  const GLYPHS = "0123456789ABCDEF#:/<>=+";
  const HEX = "0123456789abcdef";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rnd = s => s[Math.floor(Math.random() * s.length)];
  const hexBytes = n => Array.from({ length: n }, () => rnd(HEX) + rnd(HEX)).join(":");

  // ------------------------------------------------------------ testo che si decifra
  function scramble(el, text, dur) {
    if (!el) return;
    text = String(text || "");
    if (el.dataset.final === text) return;
    el.dataset.final = text;
    if (reduce) { el.textContent = text; return; }
    const total = dur || 480, start = performance.now();
    cancelAnimationFrame(el._raf);
    const step = now => {
      const p = Math.max(0, Math.min(1, (now - start) / total));  // il frame può partire prima di start
      const lock = Math.floor(p * text.length);
      let out = text.slice(0, lock);
      for (let i = lock; i < text.length; i++) out += text[i] === " " ? " " : rnd(GLYPHS);
      el.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  // ------------------------------------------------------------ cubo isometrico monocromo
  const CUBE = {
    lead: ["#FFFFFF", "#9A9A9A", "#4A4A4A"], lavoro: ["#FFFFFF", "#9A9A9A", "#4A4A4A"], pensa: ["#BDBDBD", "#6B6B6B", "#383838"],
    aspetta: ["#F2D74A", "#A8932B", "#5E521A"], finito: ["#3A3A3A", "#262626", "#1A1A1A"], coda: ["#2A2A2A", "#1E1E1E", "#151515"],
    pausa: ["#2A2A2A", "#1E1E1E", "#151515"], errore: ["#FF5D5D", "#A63C3C", "#5C2020"],
  };
  function cube(status, cls) {
    const [t, l, r] = CUBE[status] || CUBE.coda;
    return `<svg class="cube ${cls || ""}" viewBox="0 0 60 62" aria-hidden="true">
      <polygon points="30,2 58,16 58,46 30,60 2,46 2,16" fill="none" stroke="currentColor" stroke-dasharray="2 3"/>
      <polygon points="30,8 52,19 30,30 8,19" fill="${t}"/><polygon points="8,19 30,30 30,54 8,43" fill="${l}"/><polygon points="52,19 30,30 30,54 52,43" fill="${r}"/></svg>`;
  }

  // ------------------------------------------------------------ arte ASCII "cifrata"
  // Disegna una forma con caratteri # : 0 1; alcune celle brillano e il campo si rimescola di continuo.
  const SHAPES = {
    shield(x, y) {           // x, y in [-1, 1]
      const top = -0.82, half = 0.78 - Math.max(0, y) * 0.7;
      if (y < top || y > 0.95 || Math.abs(x) > Math.max(0, half)) return 0;
      const edge = Math.min(Math.abs(Math.abs(x) - half), y - top);
      const inner = Math.abs(x) < 0.16 && y > -0.35 && y < 0.35 ? 0.35 : 1;
      return Math.min(1, edge * 6 + 0.25) * inner;
    },
    brackets(x, y) {         // [■] come il logo: stessi rettangoli della griglia 80×80, bordi più chiari verso l'interno
      const u = v => v * 2 / 80 - 1;   // da coordinate del logo (0..80) a [-1, 1]
      const R = [[14, 14, 30, 22], [14, 14, 22, 66], [14, 58, 30, 66], [50, 14, 66, 22], [58, 14, 66, 66], [50, 58, 66, 66], [32, 32, 48, 48]];
      let best = 0;
      for (const [x0, y0, x1, y1] of R) {
        const ax = u(x0), ay = u(y0), bx = u(x1), by = u(y1);
        if (x < ax || x > bx || y < ay || y > by) continue;
        const edge = Math.min(x - ax, bx - x, y - ay, by - y);
        best = Math.max(best, Math.min(1, 0.35 + edge * 9));
      }
      return best;
    },
    c(x, y) {
      const r = Math.hypot(x, y * 1.1);
      if (r > 0.95 || r < 0.5) return 0;
      if (x > 0.25 && Math.abs(y) < 0.38) return 0;
      return 1 - Math.abs(r - 0.72) * 2.2;
    },
  };
  // Misura la dimensione di un carattere nel font dell'elemento.
  function charBox(el) {
    const s = document.createElement("span");
    s.textContent = "0".repeat(20);
    s.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
    el.appendChild(s);
    const r = s.getBoundingClientRect();
    s.remove();
    return { w: r.width / 20 || 7.2, h: r.height || 14.4 };
  }

  function asciiArt(el, opts) {
    if (!el) return;
    if (opts.fill) {
      // Riempie tutto l'elemento e si ridisegna quando cambia la dimensione della finestra.
      if (!el._resize) {
        let t;
        el._resize = () => { clearTimeout(t); t = setTimeout(() => { clearInterval(el._timer); el._timer = null; asciiArt(el, opts); }, 200); };
        window.addEventListener("resize", el._resize);
      }
      if (el._timer) return;
      const box = charBox(el), r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      opts = Object.assign({}, opts, { cols: Math.ceil(r.width / box.w), rows: Math.ceil(r.height / box.h) + 1, aspect: r.width / r.height });
      const narrow = r.width < 860;
      opts.cx = narrow ? 0 : (opts.cx != null ? opts.cx : -0.42);
      opts.scale = narrow ? (opts.narrowScale || 0.78) : (opts.scale || 0.86);
      opts.cy = narrow ? (opts.narrowCy || 0) : (opts.cy || 0);
    }
    if (el._timer) return;
    const cols = opts.cols || 80, rows = opts.rows || 30, shape = SHAPES[opts.shape] || SHAPES.shield;
    const aspect = opts.aspect || 1, cx = opts.cx || 0, cy = opts.cy || 0, scale = opts.scale || 1, bg = opts.bg != null ? opts.bg : 0.035;
    const grid = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = ((i / (cols - 1)) * 2 - 1 - cx) * Math.max(1, aspect) / scale;
      const y = ((j / (rows - 1)) * 2 - 1 - cy) * Math.max(1, 1 / aspect) / scale;
      const d = shape(x, y);
      grid.push({ d, hi: d > 0.75 && Math.random() < 0.12 });
    }
    const pick = c => {
      if (c.d <= 0) return Math.random() < bg ? rnd("..::0101") : " ";
      if (c.d < 0.35) return rnd(":.:");
      if (c.d < 0.6) return rnd("#:0");
      return rnd("#0101#");
    };
    const draw = () => {
      let out = "";
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const c = grid[j * cols + i];
          const ch = pick(c);
          out += c.hi ? `<b>${ch}</b>` : (c.d > 0.6 ? `<em>${ch}</em>` : ch);
        }
        out += "\n";
      }
      // corvex-ignore-next-line xss-dom: verificato, i dati dinamici passano da esc() o sono testi fissi/numeri
      el.innerHTML = out;
    };
    draw();
    if (reduce) return;
    el._timer = setInterval(() => {
      const holder = opts.stopWhenHidden && document.getElementById(opts.stopWhenHidden);
      if (!el.isConnected || (holder && holder.classList.contains("hidden"))) { clearInterval(el._timer); el._timer = null; return; }
      for (let k = 0; k < grid.length * 0.03; k++) { const c = grid[Math.random() * grid.length | 0]; if (c.d > 0.75) c.hi = !c.hi; }
      draw();
    }, opts.fill ? 180 : 160);
  }

  // ============================================================ MAPPA OPERATIVA
  class MapView {
    constructor(el) { this.el = el; this.packets = []; this.key = ""; this._loop = this._loop.bind(this); }
    layout(n, compact) {
      if (compact) {
        // Su schermo stretto la mappa si rimpicciolisce: più spazio verticale tra bersaglio, CORVUS e agenti.
        const W = 420, H = 380 + n * 120, pts = [];
        for (let i = 0; i < n; i++) pts.push([70, 370 + i * 120]);
        return { W, H, target: [210, 66], hub: [210, 225], pts, compact: true };
      }
      // Le righe delle due colonne sono sfalsate: le condutture della seconda passano tra i nodi della prima.
      const W = 1100, H = 600, pts = [];
      const c0 = Math.ceil(n / 2), c1 = n - c0, gap = (H - 120) / Math.max(1, c0 - 1);
      for (let i = 0; i < c0; i++) pts.push([470, 50 + i * gap]);
      for (let i = 0; i < c1; i++) pts.push([760, 50 + gap / 2 + i * gap]);
      return { W, H, target: [60, 300], hub: [300, 300], pts, bus: [420, 710] };
    }
    build(scan) {
      const agents = scan.agents.filter(a => !a.lead);
      const lead = scan.agents.find(a => a.lead) || { id: "corvo", name: "CORVUS" };
      const L = this.layout(agents.length, this.compact);
      const pipes = [];
      const pipe = (id, d) => pipes.push(`<path id="${id}" class="pipe" d="${d}"/>`);
      if (L.compact) {
        pipe("p-t", `M${L.target[0]} ${L.target[1] + 40} V${L.hub[1] - 46}`);
        agents.forEach((a, i) => pipe("p-" + a.id, `M${L.hub[0]} ${L.hub[1] + 74} V${L.hub[1] + 104} H30 V${L.pts[i][1]} H${L.pts[i][0] - 10}`));
      } else {
        pipe("p-t", `M${L.target[0] + 150} ${L.target[1]} H${L.hub[0] - 40}`);
        agents.forEach((a, i) => {
          const mx = i < Math.ceil(agents.length / 2) ? L.bus[0] : L.bus[1];
          pipe("p-" + a.id, `M${L.hub[0] + 40} ${L.hub[1]} H${mx} V${L.pts[i][1]} H${L.pts[i][0] - 10}`);
        });
      }
      const px = x => (x / L.W * 100).toFixed(2) + "%", py = y => (y / L.H * 100).toFixed(2) + "%";
      // corvex-ignore-next-line xss-dom: verificato, i dati dinamici passano da esc() o sono testi fissi/numeri
      this.el.innerHTML = `
        <div class="opmap-scroll"><div class="opmap ${L.compact ? "compact" : ""}" style="aspect-ratio:${L.W} / ${L.H}">
          <svg class="opmap-svg" viewBox="0 0 ${L.W} ${L.H}" preserveAspectRatio="none"><g class="pipes">${pipes.join("")}</g><g class="packets"></g></svg>
          <div class="op-target" style="left:${px(L.compact ? L.target[0] : L.target[0] - 40)};top:${py(L.target[1])}">
            <span class="tag">bersaglio</span><b>${esc(scan.target_name)}</b><code>${esc((scan.location || "").replace(/^https?:\/\//, "").slice(0, 34))}</code>
            <span class="lock">tls · ${hexBytes(4)}</span></div>
          <div class="op-hub" style="left:${px(L.hub[0])};top:${py(L.hub[1])}" data-agent="${esc(lead.id)}">
            ${cube("lead", "spin")}<span class="chip-lead">${esc(lead.name)} · lead</span><small class="act"></small></div>
          ${agents.map((a, i) => `<div class="op-node" id="n-${esc(a.id)}" data-agent="${esc(a.id)}" style="left:${px(L.pts[i][0])};top:${py(L.pts[i][1])}">
              <span class="pin"></span>
              <div class="op-card"><span class="nm">${esc(a.name)}<span class="badge"></span></span>
                <span class="role">// ${esc(a.role.toLowerCase())}</span><span class="act"></span><span class="hex"></span></div></div>`).join("")}
        </div></div>`;
      this.gPackets = this.el.querySelector(".packets");
      this.paths = {};
      this.el.querySelectorAll("path.pipe").forEach(p => (this.paths[p.id] = p));
      this.hubEl = this.el.querySelector(".op-hub");
    }
    update(scan) {
      // Sotto la larghezza minima dello schema (860 px) si passa alla colonna compatta: niente scorrimento laterale.
      this.compact = (this.el.clientWidth || window.innerWidth) < 880;
      const key = scan.id + "|" + scan.agents.map(a => a.id).join(",") + "|" + this.compact;
      if (key !== this.key) { this.key = key; this.packets.forEach(k => k.g.remove()); this.packets = []; this.build(scan); }
      this.scan = scan;
      const lead = scan.agents.find(a => a.lead);
      if (lead) scramble(this.hubEl.querySelector(".act"), lead.activity);
      scan.agents.filter(a => !a.lead).forEach(a => {
        const n = this.el.querySelector("#n-" + CSS.escape(a.id));
        if (!n) return;
        n.className = "op-node st-" + a.status;
        scramble(n.querySelector(".act"), a.activity);
        const b = n.querySelector(".badge");
        b.textContent = a.found || "";
        b.classList.toggle("on", !!a.found);
        const p = this.paths["p-" + a.id];
        if (p) p.setAttribute("class", "pipe st-" + a.status);
      });
      const tp = this.paths["p-t"];
      if (tp) tp.setAttribute("class", "pipe " + (scan.status === "in_corso" ? "st-lavoro" : "st-finito"));
      if (!this.running) { this.running = true; requestAnimationFrame(this._loop); }
    }
    _spawn(pathId, kind) {
      const p = this.paths[pathId];
      if (!p) return;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "pkt " + kind);
      // corvex-ignore-next-line xss-dom: verificato, i dati dinamici passano da esc() o sono testi fissi/numeri
      g.innerHTML = `<rect x="-14" y="-8" width="28" height="16"/><text y="3.5" text-anchor="middle">${rnd(HEX)}${rnd(HEX)}</text>`;
      this.gPackets.appendChild(g);
      this.packets.push({ g, p, len: p.getTotalLength(), t: 0, speed: 0.003 + Math.random() * 0.002, tick: 0 });
    }
    _loop() {
      if (!this.el.isConnected) { this.running = false; return; }
      const sc = this.scan;
      if (sc && !reduce) {
        if (sc.status === "in_corso" && Math.random() < 0.05) this._spawn("p-t", "w");
        sc.agents.filter(a => !a.lead).forEach(a => {
          const r = a.status === "lavoro" ? 0.03 : a.status === "pensa" ? 0.01 : 0;
          if (Math.random() < r) this._spawn("p-" + a.id, a.found ? "y" : "b");
        });
        if (Math.random() < 0.2) this.el.querySelectorAll(".op-node.st-lavoro .hex, .op-node.st-pensa .hex").forEach(h => (h.textContent = hexBytes(5)));
      }
      this.packets = this.packets.filter(k => {
        k.t += k.speed;
        if (k.t >= 1) { k.g.remove(); return false; }
        const pt = k.p.getPointAtLength(k.t * k.len);
        k.g.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        if (++k.tick % 6 === 0) k.g.lastChild.textContent = rnd(HEX) + rnd(HEX);
        return true;
      });
      requestAnimationFrame(this._loop);
    }
  }

  window.CorvexViste = { scramble, cube, asciiArt, MapView, hexBytes };
})();
