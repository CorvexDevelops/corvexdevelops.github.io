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
  // Una tela unica con tutta la squadra: si trascina, si ingrandisce e si rimpicciolisce (rotella, pizzico, pulsanti, tastiera).
  // Gli agenti sono raggruppati per squadra, ogni colonna ha la sua conduttura: nessun tubo passa sopra un altro agente.
  const GROUPS = [["web", "piattaforme web"], ["code", "codice"], ["pc", "questo computer"]];
  const COL_W = 250, ROW_H = 100, MAX_ROWS = 6, GROUP_GAP = 70, TOP = 330, BUS_Y = 236, HUB_Y = 104, K_MIN = 0.2, K_MAX = 2.2;
  const trT = s => (window.C && C.tr ? C.tr(s) : s);

  class MapView {
    constructor(el, opts) {
      this.el = el; this.opts = opts || {}; this.packets = []; this.key = ""; this.v = null; this.touched = false;
      this._loop = this._loop.bind(this);
      this._bind();
    }
    label(k) { return this.opts.label ? this.opts.label(k) : trT(k); }
    layout(agents) {
      const by = new Map();
      agents.forEach(a => { const g = a.group || "web"; if (!by.has(g)) by.set(g, []); by.get(g).push(a); });
      // La squadra al lavoro viene per prima, accanto a CORVUS, le dormienti dopo.
      const awake = g => by.get(g).some(a => a.status !== "fuori");
      const order = GROUPS.map(g => g[0]).filter(g => by.has(g)).concat([...by.keys()].filter(g => !GROUPS.some(x => x[0] === g)))
        .sort((x, y) => awake(y) - awake(x));
      const pos = {}, groups = [];
      let x = 70, rows = 1;
      order.forEach(g => {
        const list = by.get(g), nc = Math.ceil(list.length / MAX_ROWS), per = Math.ceil(list.length / nc), gx = x;
        for (let c = 0; c < nc; c++) {
          list.slice(c * per, (c + 1) * per).forEach((a, r) => { pos[a.id] = [x, TOP + r * ROW_H]; rows = Math.max(rows, r + 1); });
          x += COL_W;
        }
        const name = (GROUPS.find(y => y[0] === g) || [g, g])[1];
        groups.push({ id: g, name, x: gx, n: list.length, end: x - COL_W });
        x += GROUP_GAP;
      });
      const W = Math.max(x - GROUP_GAP - COL_W + 290, 900), H = TOP + (rows - 1) * ROW_H + 170; // margine sotto: la nota sui dormienti non copre l'ultima riga
      // CORVUS sta sopra la prima squadra (quella al lavoro), il bersaglio alla sua sinistra.
      const hub = [Math.max(560, Math.min(W / 2, (groups[0] ? groups[0].end : 0) + 120)), HUB_Y];
      return { W, H, pos, groups, hub, target: [Math.max(40, hub[0] - 470), HUB_Y] };
    }
    build(scan) {
      const agents = scan.agents.filter(a => !a.lead);
      const lead = scan.agents.find(a => a.lead) || { id: "corvo", name: "CORVUS" };
      const L = this.L = this.layout(agents);
      const pipes = [], [hx, hy] = L.hub, bx = hx + 120;
      const pipe = (id, d, cls) => pipes.push(`<path id="${id}" class="pipe ${cls || ""}" d="${d}"/>`);
      pipe("p-t", `M${L.target[0] + 230} ${hy} H${hx - 50}`);
      // Collettore: dal fianco di CORVUS scende al bus orizzontale che corre sopra tutte le squadre.
      const xs = Object.values(L.pos).map(p => p[0]);
      pipe("p-bus", `M${hx + 50} ${hy} H${bx} V${BUS_Y} M${Math.min(...xs, bx)} ${BUS_Y} H${Math.max(...xs, bx)}`, "bus");
      agents.forEach(a => { const [x, y] = L.pos[a.id]; pipe("p-" + a.id, `M${hx + 50} ${hy} H${bx} V${BUS_Y} H${x} V${y}`); });
      // corvex-ignore-next-line xss-dom: verificato, i dati dinamici passano da esc() o sono testi fissi/numeri
      this.el.innerHTML = `
        <div class="opmap-vp" tabindex="0" aria-label="${esc(this.label("mappa della squadra: trascina per spostarti, pulsanti più e meno o pizzico per lo zoom"))}">
          <div class="opmap-world" style="width:${L.W}px;height:${L.H}px">
            <svg class="opmap-svg" viewBox="0 0 ${L.W} ${L.H}" width="${L.W}" height="${L.H}"><g class="pipes">${pipes.join("")}</g><g class="packets"></g></svg>
            <div class="op-target" style="left:${L.target[0]}px;top:${L.target[1]}px">
              <span class="tag">${esc(this.label("bersaglio"))}</span><b>${esc(scan.target_name)}</b><code>${esc((scan.location || "").replace(/^https?:\/\//, "").slice(0, 40))}</code>
              <span class="lock">tls · ${hexBytes(4)}</span></div>
            <div class="op-hub" style="left:${hx}px;top:${hy}px" data-agent="${esc(lead.id)}">
              ${cube("lead", "spin")}<span class="chip-lead">${esc(lead.name)} · lead</span><small class="act"></small></div>
            ${L.groups.map(g => `<div class="op-group" data-group="${esc(g.id)}" style="left:${g.x}px;top:${BUS_Y + 30}px"><b>// ${esc(this.label(g.name))}</b><span class="gn"></span></div>`).join("")}
            ${agents.map(a => `<div class="op-node" id="n-${esc(a.id)}" data-agent="${esc(a.id)}" style="left:${L.pos[a.id][0]}px;top:${L.pos[a.id][1]}px">
                <span class="pin"></span>
                <div class="op-card"><span class="nm">${esc(a.name)}<span class="badge"></span></span>
                  <span class="role">// ${esc(String(a.role || "").toLowerCase())}</span><span class="act"></span><span class="hex"></span></div></div>`).join("")}
          </div>
          <div class="op-ctrl" role="toolbar">
            <button type="button" data-z="in" aria-label="${esc(this.label("ingrandisci"))}">+</button>
            <span class="op-k">100%</span>
            <button type="button" data-z="out" aria-label="${esc(this.label("rimpicciolisci"))}">−</button>
            <button type="button" data-z="fit" class="fit">${esc(this.label("adatta"))}</button>
          </div>
          <div class="op-note"><i></i>${esc(this.label("Gli agenti si attivano solo se la loro competenza serve all'analisi, gli altri restano dormienti."))}</div>
          <div class="op-hint">${esc(this.label(/Mac|iPhone|iPad/.test(navigator.platform) ? "// trascina per spostarti · ⌘ + rotella o pizzico per lo zoom" : "// trascina per spostarti · Ctrl + rotella o pizzico per lo zoom"))}</div>
        </div>`;
      this.vp = this.el.querySelector(".opmap-vp");
      this.world = this.el.querySelector(".opmap-world");
      this.kEl = this.el.querySelector(".op-k");
      this.gPackets = this.el.querySelector(".packets");
      this.paths = {};
      this.el.querySelectorAll("path.pipe").forEach(p => (this.paths[p.id] = p));
      this.hubEl = this.el.querySelector(".op-hub");
      this._sz = null; this._pct = null;
      if (this.v) this._apply(); else this._fitSoon();
    }
    // -------------------------------------------------- vista: spostamento e zoom
    // Un solo transform (translate3d + scale) sul livello della tela, scritto una volta per fotogramma.
    // Zoom con rotella, pulsanti e «adatta» scivolano verso la vista d'arrivo, il trascinamento prosegue per inerzia.
    // Durante il gesto si fermano pacchetti, testi che cambiano e linee animate: la tela non si ridisegna, si sposta e basta.
    _size() {
      if (!this._sz || !this._sz[0]) { const r = this.vp.getBoundingClientRect(); this._sz = [r.width, r.height]; }
      return this._sz;
    }
    _fitSoon() { requestAnimationFrame(() => { if (this.vp && this.vp.isConnected && this._size()[0]) this.fit(true); else setTimeout(() => this.vp && this.vp.isConnected && this.fit(true), 120); }); }
    _fitView() {
      const [w, h] = this._size(), L = this.L;
      let k = Math.min(w / L.W, h / L.H) * 0.96;
      if (w < 600) {
        // Su telefono la squadra intera sarebbe illeggibile: si parte da bersaglio, CORVUS e prima squadra a una scala che si legge, il resto si raggiunge trascinando.
        k = Math.max(k, 0.5);
        return { k, x: 14 - Math.min(L.target[0], L.groups.length ? L.groups[0].x : 0) * k + 10 * k, y: 16 - (L.hub[1] - 90) * k };
      }
      return { k, x: (w - L.W * k) / 2, y: (h - L.H * k) / 2 };
    }
    fit(instant) {
      if (!this.vp || !this.L || !this._size()[0]) return;
      const to = this._fitView();
      this.touched = false;
      if (instant || !this.v) { this._stop(); this.v = this._clamp(to); this._schedule(); return; }
      this._tween(to, 420);
    }
    _clamp(v) {
      // Non si perde mai la mappa: almeno 120 px restano sempre visibili.
      const [w, h] = this._size(), L = this.L, k = Math.min(K_MAX, Math.max(K_MIN, v.k));
      return { k, x: Math.min(w - 120, Math.max(120 - L.W * k, v.x)), y: Math.min(h - 120, Math.max(120 - L.H * k, v.y)) };
    }
    _schedule() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(t => { this._raf = 0; this._frame(t); });
    }
    _stop() { this.anim = null; this.glide = null; }
    // Zoom attorno a un punto dello schermo: il punto della tela sotto il cursore resta fermo per tutta l'animazione.
    _zoomTo(k, px, py, dur) {
      if (!this.v) return;
      const [w, h] = this._size();
      if (px == null) { px = w / 2; py = h / 2; }
      const goal = this.anim && this.anim.anchor ? this.anim.k1 : this.v.k;
      k = Math.min(K_MAX, Math.max(K_MIN, k == null ? goal : k));
      const wx = (px - this.v.x) / this.v.k, wy = (py - this.v.y) / this.v.k;
      this.glide = null;
      this.touched = true;
      const fin = { k, x: px - wx * k, y: py - wy * k }, safe = this._clamp(fin);
      if (reduce || !dur) { this.anim = null; this.v = safe; this._schedule(); return; }
      // Vicino ai bordi l'ancora porterebbe la mappa fuori: si scivola direttamente sulla vista consentita, senza scatto finale.
      if (safe.x !== fin.x || safe.y !== fin.y) return this._tween(safe, dur);
      this.anim = { anchor: [px, py, wx, wy], k0: this.v.k, k1: k, t0: performance.now(), dur };
      this._busy();
      this._schedule();
    }
    zoomAt(f, px, py, dur) {
      if (!this.v) return;
      const goal = this.anim && this.anim.anchor ? this.anim.k1 : this.v.k;
      this._zoomTo(goal * f, px, py, dur == null ? 260 : dur);
    }
    _tween(to, dur) {
      to = this._clamp(to);
      this.glide = null;
      if (reduce) { this.anim = null; this.v = to; this._schedule(); return; }
      this.anim = { from: { ...this.v }, to, t0: performance.now(), dur };
      this._busy();
      this._schedule();
    }
    pan(dx, dy) { if (!this.v) return; this.touched = true; this._tween({ k: this.v.k, x: this.v.x + dx, y: this.v.y + dy }, 200); }
    _frame(now) {
      if (!this.world || !this.v) return;
      let more = false;
      const a = this.anim;
      if (a) {
        const p = Math.min(1, (now - a.t0) / a.dur), e = 1 - Math.pow(1 - p, 3); // uscita morbida
        if (a.anchor) {
          const [px, py, wx, wy] = a.anchor, k = Math.exp(Math.log(a.k0) + (Math.log(a.k1) - Math.log(a.k0)) * e);
          this.v = { k, x: px - wx * k, y: py - wy * k };
          if (p >= 1) this.v = this._clamp(this.v);
        } else {
          const f = a.from, t = a.to, k = Math.exp(Math.log(f.k) + (Math.log(t.k) - Math.log(f.k)) * e);
          this.v = { k, x: f.x + (t.x - f.x) * e, y: f.y + (t.y - f.y) * e };
        }
        if (p < 1) more = true; else this.anim = null;
      }
      const g = this.glide;
      if (g && !this.anim) {
        const dt = Math.min(48, now - (g.last || now));
        g.last = now;
        const c = this._clamp({ k: this.v.k, x: this.v.x + g.vx * dt, y: this.v.y + g.vy * dt });
        if (c.x !== this.v.x + g.vx * dt) g.vx = 0;
        if (c.y !== this.v.y + g.vy * dt) g.vy = 0;
        this.v = c;
        const decay = Math.exp(-dt / 210);
        g.vx *= decay; g.vy *= decay;
        if (Math.hypot(g.vx, g.vy) > 0.03) more = true; else this.glide = null;
      }
      this._write();
      if (more) { this._busy(); this._schedule(); }
    }
    _write() {
      const v = this.v;
      // Durante il gesto translate3d sul livello composto, da fermo translate 2D su pixel interi: il browser ridisegna nitido alla scala vera.
      this.world.style.transform = this.moving ? `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.k})` : `translate(${Math.round(v.x)}px, ${Math.round(v.y)}px) scale(${v.k})`;
      const pct = Math.round(v.k * 100);
      if (this.kEl && this._pct !== pct) { this._pct = pct; this.kEl.textContent = pct + "%"; }
      this.vp.style.backgroundSize = `${44 * v.k}px ${44 * v.k}px`;
      this.vp.style.backgroundPosition = `${v.x}px ${v.y}px`;
    }
    _apply() { this._sz = null; if (this.v) { this.v = this._clamp(this.v); this._schedule(); } }
    // Gesto in corso: la tela smette di ridisegnarsi finché non si ferma da 160 ms.
    _busy() {
      if (!this.vp) return;
      if (!this.moving) { this.moving = true; this.vp.classList.add("moving"); }
      clearTimeout(this._idleT);
      this._idleT = setTimeout(() => {
        if (this._held || this.anim || this.glide) return this._busy();
        this.moving = false;
        if (this.vp) this.vp.classList.remove("moving");
        if (this.v && this.world) this._write();  // riscrive in 2D: la tela torna nitida
        if (this._pending) { const s = this._pending; this._pending = null; this.update(s); }
      }, 160);
    }
    _bind() {
      const el = this.el, pts = new Map();
      let start = null, pinch = null, track = [];
      const local = (x, y) => { const r = this.vp.getBoundingClientRect(); return [x - r.left, y - r.top]; };
      el.addEventListener("click", e => {
        // Il clic che chiude un trascinamento non apre nulla. Vale solo subito dopo il rilascio: al tocco il browser spesso non lo invia affatto.
        if (this._dragged && performance.now() - (this._dragEnd || 0) < 350) { this._dragged = false; e.stopPropagation(); e.preventDefault(); return; }
        this._dragged = false;
        const b = e.target.closest("[data-z]");
        if (!b) return;
        e.stopPropagation();
        if (b.dataset.z === "in") this.zoomAt(1.35); else if (b.dataset.z === "out") this.zoomAt(1 / 1.35); else this.fit();
      }, true);
      el.addEventListener("dblclick", e => {
        if (!this.vp || !e.target.closest(".opmap-vp") || e.target.closest(".op-ctrl, [data-agent]")) return;
        const [x, y] = local(e.clientX, e.clientY);
        this.zoomAt(1.7, x, y, 340);
      });
      el.addEventListener("wheel", e => {
        if (!this.vp || !e.target.closest(".opmap-vp")) return;
        // La rotella da sola fa scorrere la pagina: lo zoom vuole Ctrl o ⌘ (il pizzico sul trackpad arriva già con Ctrl).
        if (!e.ctrlKey && !e.metaKey) {
          const h = this.el.querySelector(".op-hint");
          if (h) { h.classList.add("flash"); clearTimeout(this._hintT); this._hintT = setTimeout(() => h.classList.remove("flash"), 1400); }
          return;
        }
        e.preventDefault();
        const [x, y] = local(e.clientX, e.clientY);
        const d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
        // Pizzico sul trackpad: tanti passi piccoli, seguiti quasi subito. Rotella del mouse: scatti più ampi, ammorbiditi.
        const small = Math.abs(d) < 50;
        this.zoomAt(Math.exp(-d * (small ? 0.01 : 0.0018)), x, y, small ? 90 : 220);
      }, { passive: false });
      el.addEventListener("pointerdown", e => {
        if (!this.vp || !e.target.closest(".opmap-vp") || e.target.closest(".op-ctrl")) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        this._sz = null;
        this._stop();
        pts.set(e.pointerId, [e.clientX, e.clientY]);
        this._held = true;
        if (pts.size === 1) { start = { x: e.clientX, y: e.clientY, vx: this.v ? this.v.x : 0, vy: this.v ? this.v.y : 0, moved: false }; track = []; this._dragged = false; }
        if (pts.size === 2 && this.v) {
          const [a, b] = [...pts.values()];
          const [mx, my] = local((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
          pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: this.v.k, wx: (mx - this.v.x) / this.v.k, wy: (my - this.v.y) / this.v.k };
          try { this.vp.setPointerCapture(e.pointerId); } catch (_) { /* puntatore già rilasciato */ }
        }
      });
      el.addEventListener("pointermove", e => {
        if (!pts.has(e.pointerId) || !this.v) return;
        pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pts.size >= 2 && pinch) {
          // Pizzico: le dita restano sopra lo stesso punto della tela, anche spostandosi insieme.
          const [a, b] = [...pts.values()];
          const [mx, my] = local((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
          const k = Math.min(K_MAX, Math.max(K_MIN, pinch.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d));
          this.v = this._clamp({ k, x: mx - pinch.wx * k, y: my - pinch.wy * k });
          this._dragged = true; this.touched = true;
          this._busy(); this._schedule();
          return;
        }
        if (!start) return;
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (!start.moved && Math.hypot(dx, dy) < 5) return;
        if (!start.moved) { start.moved = true; this.vp.classList.add("dragging"); try { this.vp.setPointerCapture(e.pointerId); } catch (_) { /* già rilasciato */ } }
        this._dragged = true; this.touched = true;
        this.v = this._clamp({ k: this.v.k, x: start.vx + dx, y: start.vy + dy });
        const now = performance.now();
        track.push([now, e.clientX, e.clientY]);
        while (track.length > 2 && now - track[0][0] > 90) track.shift();
        this._busy(); this._schedule();
      });
      const end = e => {
        if (!pts.has(e.pointerId)) return;
        pts.delete(e.pointerId);
        if (pts.size < 2) pinch = null;
        if (pts.size === 1 && this.v) { const [p] = [...pts.values()]; start = { x: p[0], y: p[1], vx: this.v.x, vy: this.v.y, moved: true }; track = []; }
        if (!pts.size) {
          // Inerzia: la velocità degli ultimi ~90 ms continua e si spegne da sola.
          if (start && start.moved && !reduce && track.length >= 2) {
            const [t0, x0, y0] = track[0], [t1, x1, y1] = track[track.length - 1], dt = Math.max(1, t1 - t0);
            const vx = (x1 - x0) / dt, vy = (y1 - y0) / dt;
            if (performance.now() - t1 < 60 && Math.hypot(vx, vy) > 0.15) { this.glide = { vx: vx * 0.85, vy: vy * 0.85 }; this._schedule(); }
          }
          if (this._dragged) this._dragEnd = performance.now();
          start = null; this._held = false;
          if (this.vp) this.vp.classList.remove("dragging");
          this._busy();
        }
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
      el.addEventListener("keydown", e => {
        if (!this.vp || e.target !== this.vp) return;
        const step = 80, m = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
        if (m) { e.preventDefault(); this.pan(m[0], m[1]); }
        else if (e.key === "+" || e.key === "=") { e.preventDefault(); this.zoomAt(1.35); }
        else if (e.key === "-") { e.preventDefault(); this.zoomAt(1 / 1.35); }
        else if (e.key === "0") { e.preventDefault(); this.fit(); }
      });
      let rs;
      window.addEventListener("resize", () => {
        this._sz = null;
        clearTimeout(rs);
        rs = setTimeout(() => { this._sz = null; if (this.vp && this.vp.isConnected) { if (this.touched) this._apply(); else this.fit(true); } }, 150);
      });
    }
    update(scan) {
      // Durante il gesto la tela non cambia: lo stato nuovo arriva appena la mappa si ferma.
      if (this.moving && this.world && this.world.isConnected) { this._pending = scan; return; }
      const key = scan.id + "|" + scan.agents.map(a => a.id + ":" + (a.group || "")).join(",");
      if (key !== this.key) {
        const sameScan = this.key.split("|")[0] === scan.id;
        this.key = key; this.packets.forEach(k => k.g.remove()); this.packets = [];
        if (!sameScan) this.v = null;
        this.build(scan);
      }
      this.scan = scan;
      const lead = scan.agents.find(a => a.lead);
      if (lead) scramble(this.hubEl.querySelector(".act"), lead.activity);
      const live = {};
      scan.agents.filter(a => !a.lead).forEach(a => {
        const n = this.el.querySelector("#n-" + CSS.escape(a.id));
        if (!n) return;
        n.className = "op-node st-" + a.status;
        if (a.status !== "fuori") live[a.group || "web"] = (live[a.group || "web"] || 0) + 1;
        scramble(n.querySelector(".act"), a.activity);
        const b = n.querySelector(".badge");
        b.textContent = a.found || "";
        b.classList.toggle("on", !!a.found);
        const p = this.paths["p-" + a.id];
        if (p) p.setAttribute("class", "pipe st-" + a.status);
      });
      (this.L ? this.L.groups : []).forEach(g => {
        const el = this.el.querySelector(`.op-group[data-group="${CSS.escape(g.id)}"]`);
        if (!el) return;
        el.classList.toggle("off", !live[g.id]);
        el.querySelector(".gn").textContent = !live[g.id] ? this.label("dormienti") : live[g.id] < g.n ? `${live[g.id]}/${g.n} ${this.label("attivi")}` : `${g.n} ${this.label("attivi")}`;
      });
      const tp = this.paths["p-t"];
      if (tp) tp.setAttribute("class", "pipe " + (scan.status === "in_corso" ? "st-lavoro" : "st-finito"));
      // La tela può nascere nascosta (sezione non ancora visibile): appena ha una dimensione si adatta.
      if (!this.v && this.vp && this.vp.isConnected) { this._sz = null; if (this._size()[0]) this.fit(true); }
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
      if (this.moving) { requestAnimationFrame(this._loop); return; }
      const sc = this.scan;
      if (sc && !reduce) {
        if (sc.status === "in_corso" && Math.random() < 0.05) this._spawn("p-t", "w");
        sc.agents.filter(a => !a.lead).forEach(a => {
          const r = a.status === "lavoro" ? 0.03 : a.status === "pensa" ? 0.01 : 0; // «fuori»: nessun pacchetto
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
