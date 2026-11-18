/* Sito pubblico di Corvex: lingua, comparsa allo scorrimento e demo animate con i componenti della dashboard (assets/viste.js). */
(function () {
  document.documentElement.classList.add("js");
  const V = window.CorvexViste;
  const $ = id => document.getElementById(id);
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* archivio non disponibile */ } };

  // ================================================================ lingua
  const EN = {
    brand_sub: "// platform defense", nav_fronti: "fronts", nav_squadra: "team", nav_computer: "computer", nav_privacy: "privacy", cta_top: "coming_soon()",
    hero_label: "coming_soon · early_access", hero_t1: "Your platforms", hero_t2: "deserve real defenses",
    hero_sub: "Corvex puts the dashboards, software and computer you work on to the test.<br>A team of agents hunts for gaps, alerts you and tells you how to close them.<br>When it's safe to do so, it fixes them on its own.",
    cta_download: "download()", presto: "soon", cta_scopri: "explore_corvex()", st_agenti: "agents", st_fronti: "fronts", st_codice: "code sent to third parties", st_zero: "0 bytes",
    tk_head: "demo · latest activity", fr_label: "three_fronts", fr_t: "One team, everything you build",
    fr1_k: "web", fr1_t: "Dashboards and websites",
    fr1_p: "Headers, TLS, cookies, CORS, exposed files, injections, outdated libraries, open APIs, spoofable email and hijackable subdomains.<br>Gentle checks, only on what's yours.",
    fr2_k: "code", fr2_t: "Code and repositories",
    fr2_p: "Secrets in the code and in git history, weak cryptography, vulnerable dependencies and incompatible licences, infrastructure as code.<br>An AI audit hunts for logic and access-control flaws, and every pull request is checked before merging.",
    fr3_k: "computer", fr3_t: "The computer you work on",
    fr3_p: "Malware in new files, system posture, services exposed on the network.<br>Works alongside Defender and XProtect as a second opinion.",
    mp_label: "operations_map · demo", mp_t: "A team that works while you write code",
    mp_p: "Each agent has a single job and does it well. It wakes up only when its skill is needed for the analysis, the others stay dormant.<br>CORVUS coordinates, hands each one the skills from its library and writes the report. Drag the map and zoom to see the whole team.",
    rg_label: "log", rg_t: "Every step, right before your eyes",
    rg_p: "The live log shows what each agent is testing, what it found and why.<br>At the end you get a PDF report with your branding, in English or Italian.",
    rg_l1: "alerts in the dashboard, on your computer and by email", rg_l2: "automatic comparison with the previous scan", rg_l3: "a 0 to 100 score and a badge for your website",
    fx_label: "fixes_ready", fx_t: "It doesn't just find. It fixes",
    fx_p: "For many issues the fix is already written.<br>You approve it and Corvex applies it while keeping a copy of the original, or it opens a pull request on a separate branch.",
    fx_l1: "no change without your consent", fx_l2: "dependencies upgraded to the first safe version", fx_l3: "works with Claude Code, Cursor and Windsurf through MCP",
    fx_file: "automatic fix", fx_why: "session cookie readable by JavaScript", fx_bak: "// backup: server.js.corvex.bak", sev_alta: "high",
    pc_label: "this_computer", pc_t: "And it protects the machine you work on",
    pc_p: "Four agents watch over the computer running Corvex.<br>No file ever leaves the machine.",
    pc1_t: "Malware in files", pc1_p: "Downloads, Desktop, temporary folders and startup items, even inside .zip archives.<br>Corvex signatures updated every week.",
    pc2_t: "In real time", pc2_p: "Every new file is checked as soon as it finishes writing.<br>If you want, it goes straight into a restorable quarantine.",
    pc3_t: "System posture", pc3_p: "Antivirus, firewall, disk encryption, updates and operating system protections, with the steps to fix them.",
    pc4_t: "Network", pc4_p: "Services reachable from the local network and connections to known malicious addresses.",
    pc_note: "// alongside Defender and XProtect, never instead of them",
    cv_label: "corvus_ai", cv_t: "Ask CORVUS, in plain words",
    cv_p: "The assistant knows the results of the open scan and tells you where to start.<br>It answers with corvexai, a security-specialised model that runs on your own infrastructure.",
    cv_q: "Where do I start?",
    cv_l1: "a library of more than 650 defensive security procedures", cv_l2: "at every scan it hands each agent the skills it needs",
    cv_l3: "every issue with a deep dive and MITRE ATT&amp;CK and NIST references",
    pv_label: "security_and_privacy", pv_t: "A security tool should be secure first",
    pv1_t: "Only what's yours", pv1_p: "Corvex only tests platforms you own or are authorised to test, and for public websites it checks before starting.",
    pv2_t: "Gentle checks", pv2_p: "Agents observe and probe without changing or deleting data, at a light pace that doesn't disturb your users.",
    pv3_t: "Your code stays with you", pv3_p: "Corvex runs on your machine or your server.<br>Your code, files and results are never uploaded anywhere else.",
    pv4_t: "Two-step sign-in", pv4_p: "Password plus a temporary code, always.<br>Sessions expire on their own after a period of inactivity.",
    pv5_t: "Encrypted secrets", pv5_p: "Tokens, keys and second-factor secrets are stored encrypted or as irreversible hashes.",
    pv6_t: "Signed updates", pv6_p: "Every update is digitally signed and installs without touching your data.",
    end_label: "status · polishing", end_t: "Coming soon",
    end_p: "We're putting the finishing touches on it.<br>Downloads and plans open soon, with a free version to try it on your own projects.",
    cta_piani: "plans()", foot: "© 2026 Corvex · platform defense",
  };
  const META = {
    it: ["Corvex · difesa delle piattaforme", "Corvex mette alla prova le tue dashboard, il tuo codice e il tuo computer. Una squadra di agenti trova le falle, ti avvisa e le corregge. In arrivo."],
    en: ["Corvex · platform defense", "Corvex puts your dashboards, code and computer to the test. A team of agents finds the gaps, alerts you and fixes them. Coming soon."],
  };
  let lang = get("corvex-sito-lang") || ((navigator.language || "it").toLowerCase().startsWith("it") ? "it" : "en");

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-k]").forEach(el => {
      if (el.dataset.it === undefined) el.dataset.it = el.innerHTML;
      // corvex-ignore-next-line xss-dom: verificato, testi fissi scritti in questo file o nella pagina
      el.innerHTML = lang === "en" && EN[el.dataset.k] ? EN[el.dataset.k] : el.dataset.it;
    });
    document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
    if (map) { map.key += "~"; tickMap(); } // stessa scansione: si ridisegna nella nuova lingua e la vista resta dov'era
    document.title = META[lang][0];
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", META[lang][1]);
    $("badge-a").src = `assets/badge-92-${lang}.svg`;
    $("badge-b").src = `assets/badge-64-${lang}.svg`;
    drawAgents();
    drawTicker();
    if (map) { map.key = ""; tickMap(); }
    if ($("term").childElementCount) { $("term").textContent = ""; for (let i = 0; i < 6; i++) logLine(); }  // il registro riparte nella lingua scelta
    chatStart();
  }
  document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => { lang = b.dataset.lang; set("corvex-sito-lang", lang); applyLang(); });
  const T = (it, en) => lang === "en" ? en : it;

  // ================================================================ la squadra
  const TEAM = [
    ["CORVUS", "*", "coordina, passa a ogni agente le skill della sua biblioteca, scrive il rapporto", "coordinates, hands each agent the skills from its library, writes the report"],
    ["SPECTER", "web", "ricognizione di pagine, parametri, script e versioni esposte", "reconnaissance of pages, parameters, scripts and exposed versions"],
    ["VECTOR", "web", "CSP, clickjacking, HSTS e intestazioni di sicurezza", "CSP, clickjacking, HSTS and security headers"],
    ["HANDSHAKE", "web", "HTTPS, redirect, certificato e versione TLS", "HTTPS, redirects, certificate and TLS version"],
    ["JACKAL", "web", "cookie senza HttpOnly, Secure o SameSite", "cookies missing HttpOnly, Secure or SameSite"],
    ["NULLBYTE", "web", ".env, .git, backup, pagine di debug, source map", ".env, .git, backups, debug pages, source maps"],
    ["MIRROR", "web", "CORS che riflette l'origine o accetta null", "CORS reflecting the origin or accepting null"],
    ["PAYLOAD", "web · code", "XSS, SQL injection, open redirect, eval e SSTI", "XSS, SQL injection, open redirects, eval and SSTI"],
    ["RELIC", "web", "librerie JavaScript con falle note", "JavaScript libraries with known flaws"],
    ["HAMMER", "web", "login senza limite ai tentativi", "sign-in without attempt limits"],
    ["SCHEMA", "web", "API senza autenticazione, OpenAPI e GraphQL esposti", "unauthenticated APIs, exposed OpenAPI and GraphQL"],
    ["SPOOF", "web", "SPF, DMARC e DKIM del dominio", "the domain's SPF, DMARC and DKIM"],
    ["HIJACK", "web", "sottodomini dirottabili", "hijackable subdomains"],
    ["SKELETON", "code", "segreti, chiavi cloud e chiavi private nel codice", "secrets, cloud keys and private keys in code"],
    ["CIPHER", "code", "hash deboli, casualità prevedibile, TLS non verificato", "weak hashes, predictable randomness, unverified TLS"],
    ["DAEMON", "code", "debug attivo, CORS aperto, container come root", "debug left on, open CORS, containers running as root"],
    ["CHAIN", "code", "dipendenze vulnerabili, con aggiornamento automatico", "vulnerable dependencies, with automatic upgrades"],
    ["REWIND", "code", "segreti rimasti nella cronologia git", "secrets left in git history"],
    ["BLUEPRINT", "code", "GitHub Actions, Docker Compose, Kubernetes e Terraform", "GitHub Actions, Docker Compose, Kubernetes and Terraform"],
    ["LEDGER", "code", "SBOM CycloneDX e licenze incompatibili delle dipendenze", "CycloneDX SBOM and incompatible dependency licences"],
    ["ORACLE", "code", "audit AI: logica, controllo accessi, falle confermate due volte", "AI audit: logic, access control, issues confirmed twice"],
    ["BASTION", "pc", "postura: antivirus, firewall, cifratura, aggiornamenti", "posture: antivirus, firewall, encryption, updates"],
    ["WARDEN", "pc", "malware nei file, anche dentro gli archivi", "malware in files, even inside archives"],
    ["SONAR", "pc", "servizi esposti e connessioni sospette", "exposed services and suspicious connections"],
    ["VIGIL", "pc", "controllo in tempo reale dei file nuovi", "real-time checks on new files"],
  ];
  function drawAgents() {
    const F = { "*": T("tutti", "all"), web: "web", code: T("codice", "code"), "web · code": T("web · codice", "web · code"), pc: "computer" };
    // corvex-ignore-next-line xss-dom: verificato, testi fissi passati da esc()
    $("agents").innerHTML = TEAM.map(([n, f, it, en]) => `<div><span class="f">${esc(F[f])}</span><b>${esc(n)}</b><span>${esc(T(it, en))}</span></div>`).join("");
  }

  // ================================================================ nastro (demo)
  const FEED = [
    ["09:41", "crit", ["falla", "issue"], "shop.esempio.it", ["File .env scaricabile da chiunque", ".env file downloadable by anyone"]],
    ["09:41", "warn", ["falla", "issue"], "shop.esempio.it", ["Cookie di sessione senza HttpOnly", "Session cookie without HttpOnly"]],
    ["09:43", "ok", ["corretta", "fixed"], "api-ordini", ["lodash aggiornato alla 4.17.21", "lodash upgraded to 4.17.21"]],
    ["09:44", "warn", ["falla", "issue"], "pannello.esempio.it", ["Manca la Content-Security-Policy", "Missing Content-Security-Policy"]],
    ["09:46", "ok", ["completata", "completed"], "pannello.esempio.it", ["Difese 86/100 · +14 dalla scorsa scansione", "Defenses 86/100 · +14 since the last scan"]],
    ["09:47", "crit", ["falla", "issue"], "questo computer", ["Firewall spento", "Firewall turned off"]],
    ["09:49", "ok", ["corretta", "fixed"], "api-ordini", ["Pull request aperta: corvex/fix-segreti", "Pull request opened: corvex/fix-secrets"]],
    ["09:52", "warn", ["falla", "issue"], "app-mobile", ["Chiave API scritta nel codice", "API key hardcoded in the source"]],
  ];
  function drawTicker() {
    const seg = FEED.map(([tm, k, kind, tg, msg]) => `<span class="it"><span class="tm">${tm}</span><span class="k ${k}">${esc(T(kind[0], kind[1]))}</span><b>${esc(tg === "questo computer" ? T(tg, "this computer") : tg)}</b>${esc(T(msg[0], msg[1]))}</span>`).join("");
    // corvex-ignore-next-line xss-dom: verificato, testi fissi passati da esc()
    $("tk").innerHTML = seg + seg;
  }

  // ================================================================ mappa operativa (demo)
  // Tutta la squadra sulla stessa tela della dashboard: per un sito si sveglia la squadra web, gli altri restano dormienti.
  const MAP_AGENTS = [
    ["specter", "SPECTER", ["Ricognizione", "Reconnaissance"], [["Bussa alla porta", "Knocking on the door"], ["Legge robots.txt", "Reading robots.txt"], ["Mappa 41 parametri", "Mapping 41 parameters"]], 0],
    ["vector", "VECTOR", ["Intestazioni", "Headers"], [["Legge le intestazioni", "Reading the headers"], ["Prova a incorniciare la pagina", "Trying to frame the page"]], 2],
    ["handshake", "HANDSHAKE", ["Trasporto TLS", "TLS transport"], [["Stringe la mano TLS", "Shaking hands over TLS"], ["Controlla il certificato", "Checking the certificate"]], 0],
    ["jackal", "JACKAL", ["Cookie e sessioni", "Cookies and sessions"], [["Assaggia i cookie", "Tasting the cookies"], ["Controlla SameSite", "Checking SameSite"]], 1],
    ["nullbyte", "NULLBYTE", ["Esposizione file", "File exposure"], [["Sbircia nelle cartelle", "Peeking into folders"], ["Cerca le source map", "Looking for source maps"]], 1],
    ["mirror", "MIRROR", ["CORS", "CORS"], [["Si presenta da un altro sito", "Posing as another site"], ["Prova l'origine null", "Trying the null origin"]], 0],
    ["payload", "PAYLOAD", ["Iniezioni", "Injections"], [["Inietta un marcatore innocuo", "Injecting a harmless marker"], ["Prova i parametri della ricerca", "Testing the search parameters"]], 0],
    ["relic", "RELIC", ["Librerie JavaScript", "JavaScript libraries"], [["Riconosce jQuery 1.12", "Spotting jQuery 1.12"], ["Confronta con le falle note", "Matching known flaws"]], 1],
    ["hammer", "HAMMER", ["Tentativi di accesso", "Sign-in attempts"], [["Conta i tentativi permessi", "Counting allowed attempts"], ["Cerca il blocco dopo gli errori", "Looking for a lockout"]], 0],
    ["schema", "SCHEMA", ["API", "APIs"], [["Cerca OpenAPI e GraphQL", "Looking for OpenAPI and GraphQL"], ["Chiama le API senza chiave", "Calling the APIs without a key"]], 1],
    ["spoof", "SPOOF", ["Email del dominio", "Domain email"], [["Legge SPF e DMARC", "Reading SPF and DMARC"], ["Cerca i selettori DKIM", "Looking for DKIM selectors"]], 0],
    ["hijack", "HIJACK", ["Sottodomini", "Subdomains"], [["Elenca i sottodomini", "Listing subdomains"], ["Segue i CNAME", "Following the CNAMEs"]], 0],
  ];
  const DORMANT = [
    ["skeleton", "SKELETON", "code", ["Segreti e chiavi", "Secrets and keys"]], ["cipher", "CIPHER", "code", ["Crittografia", "Cryptography"]],
    ["daemon", "DAEMON", "code", ["Configurazione", "Configuration"]], ["chain", "CHAIN", "code", ["Dipendenze", "Dependencies"]],
    ["rewind", "REWIND", "code", ["Cronologia git", "Git history"]], ["blueprint", "BLUEPRINT", "code", ["Infrastruttura come codice", "Infrastructure as code"]],
    ["ledger", "LEDGER", "code", ["SBOM e licenze", "SBOM and licences"]], ["oracle", "ORACLE", "code", ["Audit AI del codice", "AI code audit"]],
    ["bastion", "BASTION", "pc", ["Postura del sistema", "System posture"]], ["warden", "WARDEN", "pc", ["Antimalware sui file", "File antimalware"]],
    ["sonar", "SONAR", "pc", ["Porte e connessioni", "Ports and connections"]], ["vigil", "VIGIL", "pc", ["Protezione in tempo reale", "Real-time protection"]],
  ];
  const MAP_EN = {
    "bersaglio": "target", "piattaforme web": "web platforms", "codice": "code", "questo computer": "this computer",
    "dormienti": "dormant", "attivi": "active", "ingrandisci": "zoom in", "rimpicciolisci": "zoom out", "adatta": "fit",
    "// trascina per spostarti · ⌘ + rotella o pizzico per lo zoom": "// drag to move · ⌘ + wheel or pinch to zoom",
    "// trascina per spostarti · Ctrl + rotella o pizzico per lo zoom": "// drag to move · Ctrl + wheel or pinch to zoom",
    "mappa della squadra: trascina per spostarti, pulsanti più e meno o pizzico per lo zoom": "team map: drag to move, plus and minus buttons or pinch to zoom",
    "Gli agenti si attivano solo se la loro competenza serve all'analisi, gli altri restano dormienti.": "Agents wake up only when their skill is needed for the analysis, the others stay dormant.",
  };
  let map = null, t0 = performance.now();
  const CYCLE = 21;
  function scanAt(sec) {
    let done = 0, found = 0;
    const agents = MAP_AGENTS.map(([id, name, role, acts, f], i) => {
      const start = 0.8 + i * 0.7, work = 3.6 + (i % 3) * 1.3, think = 1.5;
      let status = "coda", activity = T("In coda", "Queued");
      if (sec >= start) { status = "lavoro"; activity = T(...acts[Math.floor((sec - start) / 1.9) % acts.length]); }
      if (sec >= start + work) { status = "pensa"; activity = T("Ci ragiona sopra", "Thinking it over"); }
      if (sec >= start + work + think) { status = "finito"; activity = f ? T(`${f} da vedere`, `${f} to review`) : T("Tutto in ordine", "All clear"); done++; found += f; }
      return { id, name, group: "web", role: T(role[0], role[1]), status, activity, found: status === "finito" ? f : 0 };
    }).concat(DORMANT.map(([id, name, group, role]) => ({ id, name, group, role: T(role[0], role[1]), status: "fuori", found: 0,
      activity: T("Dormiente: si attiva quando serve la sua competenza", "Dormant: wakes up when its skill is needed") })));
    const all = done === MAP_AGENTS.length;
    const lead = { id: "corvo", name: "CORVUS", lead: true, status: "lavoro",
      activity: all ? T(`Rapporto pronto · ${found} falle`, `Report ready · ${found} issues`) : sec < 1 ? T("Studia il bersaglio", "Studying the target") : T("Sveglia la squadra web", "Waking the web team") };
    return { id: "scn_demo00", target_name: "shop.esempio.it", location: "https://shop.esempio.it", status: all ? "completata" : "in_corso", agents: [lead].concat(agents) };
  }
  function tickMap() {
    if (!map) return;
    const sec = reduce ? 30 : ((performance.now() - t0) / 1000) % CYCLE;
    map.update(scanAt(sec));
  }

  // ================================================================ registro (demo)
  const LOG = [
    ["SPECTER", "", "Bussa alla porta · HTTP 200 · 38 ms", "Knocking on the door · HTTP 200 · 38 ms"],
    ["SPECTER", "", "robots.txt letto: aggiunti 6 percorsi", "robots.txt read: 6 paths added"],
    ["VECTOR", "", "Legge le intestazioni di 12 pagine", "Reading the headers of 12 pages"],
    ["VECTOR", "finding", "Trovato: manca la Content-Security-Policy", "Found: missing Content-Security-Policy"],
    ["HANDSHAKE", "", "TLS 1.3 · certificato valido per altri 71 giorni", "TLS 1.3 · certificate valid for 71 more days"],
    ["JACKAL", "finding", "Trovato: cookie «sessione» senza HttpOnly", "Found: «sessione» cookie without HttpOnly"],
    ["NULLBYTE", "", "Sbircia in /backup, /.git, /debug", "Peeking into /backup, /.git, /debug"],
    ["NULLBYTE", "finding", "Trovato: /.env scaricabile (credenziali del database)", "Found: /.env downloadable (database credentials)"],
    ["MIRROR", "", "Origine «null» rifiutata: bene", "«null» origin rejected: good"],
    ["PAYLOAD", "", "Marcatore innocuo nel parametro q: non riflesso", "Harmless marker in parameter q: not reflected"],
    ["RELIC", "finding", "Trovato: jQuery 1.12.4 con falle note", "Found: jQuery 1.12.4 with known flaws"],
    ["CORVUS", "done", "Confronto con ieri: 2 falle chiuse, 1 nuova", "Compared with yesterday: 2 issues closed, 1 new"],
    ["CORVUS", "done", "Rapporto pronto · difese 64/100", "Report ready · defenses 64/100"],
    ["CORVUS", "fix", "Correzione pronta per il cookie: in attesa della tua approvazione", "Fix ready for the cookie: waiting for your approval"],
  ];
  let logI = 0, clock = 9 * 3600 + 41 * 60;
  function logLine() {
    const b = $("term");
    const [ag, lvl, it, en] = LOG[logI % LOG.length];
    logI++;
    clock += 3 + (logI % 4);
    const tm = [Math.floor(clock / 3600) % 24, Math.floor(clock / 60) % 60, clock % 60].map(n => String(n).padStart(2, "0")).join(":");
    const ln = document.createElement("div");
    ln.className = "ln " + lvl;
    // corvex-ignore-next-line xss-dom: verificato, testi fissi passati da esc()
    ln.innerHTML = `<span class="tm">${tm}</span><span class="ag">${esc(ag)}</span><span class="msg">${esc(T(it, en))}</span>`;
    b.appendChild(ln);
    while (b.children.length > 16) b.firstChild.remove();
    b.scrollTop = b.scrollHeight;
  }

  // ================================================================ chat con CORVUS (demo)
  const ANSWER = [
    "Parti dal file .env pubblico su shop.esempio.it: espone la password del database, quindi toglilo subito dal sito e cambia la password. Poi il cookie di sessione: la correzione è pronta, ti basta approvarla. Le altre due falle possono aspettare la prossima settimana.",
    "Start with the public .env file on shop.esempio.it: it exposes the database password, so take it off the site right away and change the password. Then the session cookie: the fix is ready, you just need to approve it. The other two issues can wait until next week.",
  ];
  let chatT = null, chatSeen = false;
  function chatStart() {
    const el = $("chat-a");
    if (!el) return;
    clearTimeout(chatT);
    const text = lang === "en" ? ANSWER[1] : ANSWER[0];
    if (!chatSeen) { el.textContent = ""; return; }
    if (reduce) { el.textContent = text; return; }
    let i = 0;
    const step = () => { el.textContent = text.slice(0, i); i += 2; if (i <= text.length + 1) chatT = setTimeout(step, 18); };
    step();
  }

  // ================================================================ chiusura: diagnostica che si scrive
  function boot() {
    const el = $("boot");
    const lines = [["$ corvex --stato", ""], [T("firme_corvex ........... pronte", "corvex_signatures ...... ready"), "ok"],
      [T("agenti ................. 25/25", "agents ................. 25/25"), "ok"], [T("download ............... in arrivo", "download ............... coming soon"), "w"]];
    el.innerHTML = "";
    lines.forEach(([t, c], i) => setTimeout(() => {
      const d = document.createElement("div");
      d.className = c;
      d.textContent = t;
      el.appendChild(d);
    }, reduce ? 0 : 350 + i * 420));
  }

  // ================================================================ comparsa allo scorrimento
  function countUp(el) {
    const end = +el.dataset.count;
    if (reduce || !end) return;
    const t = performance.now();
    const f = now => { const p = Math.min(1, (now - t) / 900); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  function reveal() {
    const groups = new Map();
    document.querySelectorAll(".s-rv").forEach(el => {
      const p = el.parentElement;
      const n = groups.get(p) || 0;
      el.style.setProperty("--i", Math.min(n, 6));
      groups.set(p, n + 1);
    });
    if (!("IntersectionObserver" in window)) { document.querySelectorAll(".s-rv").forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");
      io.unobserve(el);
      el.querySelectorAll("[data-count]").forEach(countUp);
      el.querySelectorAll("h2.cm [data-k]").forEach(h => V.scramble(h, h.textContent, 700));
      if (el.id === "chat") { chatSeen = true; chatStart(); }
      if (el.closest && el.closest(".s-end")) boot();
    }), { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".s-rv").forEach(el => io.observe(el));
  }

  // ================================================================ avvio
  function start() {
    applyLang();
    reveal();
    V.asciiArt($("hero-ascii"), { fill: true, shape: "brackets", cx: 0.46, scale: 0.84, narrowScale: 0.86, narrowCy: -0.32, bg: 0.05 });
    V.asciiArt($("end-ascii"), { fill: true, shape: "brackets", cx: 0.58, scale: 0.7, narrowScale: 0.7, narrowCy: 0, bg: 0.03 });
    map = new V.MapView($("map"), { label: k => (lang === "en" && MAP_EN[k]) || k });
    tickMap();
    setInterval(tickMap, 700);
    for (let i = 0; i < 6; i++) logLine();
    if (!reduce) setInterval(() => { if (!document.hidden) logLine(); }, 1300);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
