/* Sito pubblico di Corvex: lingua, menu, comparsa allo scorrimento e demo animate con i componenti della dashboard (assets/viste.js).
   Ogni pagina usa solo i pezzi che contiene: le funzioni controllano da sole se il loro elemento c'è. */
(function () {
  document.documentElement.classList.add("js");
  const V = window.CorvexViste;
  const $ = id => document.getElementById(id);
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* archivio non disponibile */ } };

  // ================================================================ lingua
  // L'italiano è nella pagina, l'inglese nell'attributo data-en dello stesso elemento.
  let lang = get("corvex-sito-lang") || "en";  // inglese di default, l'italiano con il pulsante IT
  const T = (it, en) => lang === "en" ? en : it;
  const redraw = [];

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-en]").forEach(el => {
      if (el.dataset.it === undefined) el.dataset.it = el.innerHTML;
      // corvex-ignore-next-line xss-dom: verificato, testi fissi scritti nelle pagine del sito
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.it;
    });
    document.querySelectorAll("meta[data-en-content]").forEach(m => {
      if (m.dataset.itContent === undefined) m.dataset.itContent = m.getAttribute("content");
      m.setAttribute("content", lang === "en" ? m.dataset.enContent : m.dataset.itContent);
    });
    document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
    document.querySelectorAll("img[data-badge]").forEach(img => { img.src = `assets/badge-${img.dataset.badge}-${lang}.svg`; });
    redraw.forEach(f => f());
  }
  document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => { lang = b.dataset.lang; set("corvex-sito-lang", lang); applyLang(); });

  // ================================================================ menu su schermi stretti
  function menu() {
    const b = $("s-mm"), top = $("top");
    if (!b || !top) return;
    const close = () => { top.classList.remove("s-menu-open"); b.setAttribute("aria-expanded", "false"); };
    b.onclick = () => { const open = top.classList.toggle("s-menu-open"); b.setAttribute("aria-expanded", String(open)); };
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    document.addEventListener("click", e => { if (!top.contains(e.target)) close(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 1080) close(); });
  }

  // ================================================================ nastro (demo)
  const FEED = [
    ["09:41", "crit", ["falla", "issue"], ["shop.esempio.it", "shop.example.com"], ["File .env scaricabile da chiunque", ".env file downloadable by anyone"]],
    ["09:41", "warn", ["falla", "issue"], ["pannello.esempio.it", "panel.example.com"], ["Area riservata: dati di altri clienti leggibili per id", "Private area: other customers' data readable by id"]],
    ["09:43", "ok", ["corretta", "fixed"], ["api-ordini", "orders-api"], ["lodash aggiornato alla 4.17.21", "lodash upgraded to 4.17.21"]],
    ["09:44", "ok", ["pull request", "pull request"], ["api-ordini", "orders-api"], ["Controllo superato: nessuna falla nuova", "Check passed: no new issues"]],
    ["09:46", "ok", ["completata", "completed"], ["pannello.esempio.it", "panel.example.com"], ["Difese 86/100 · +14 dalla scorsa scansione", "Defenses 86/100 · +14 since the last scan"]],
    ["09:47", "warn", ["chat", "chat"], ["#sicurezza", "#security"], ["Giulia ha assegnato una falla a Marco", "Giulia assigned an issue to Marco"]],
    ["09:47", "crit", ["falla", "issue"], ["sistema", "system"], ["Firewall spento", "Firewall turned off"]],
    ["09:48", "ok", ["bloccata", "blocked"], ["sistema", "system"], ["Programma collegato a un server malevolo fermato", "Program connected to a malicious server stopped"]],
    ["09:49", "ok", ["corretta", "fixed"], ["api-ordini", "orders-api"], ["Pull request aperta: corvex/fix-segreti", "Pull request opened: corvex/fix-secrets"]],
    ["09:52", "warn", ["falla", "issue"], ["app-mobile", "mobile-app"], ["Chiave AI negli script del sito", "AI key in the site's scripts"]],
  ];
  function drawTicker() {
    const el = $("tk");
    if (!el) return;
    const seg = FEED.map(([tm, k, kind, tg, msg]) => `<span class="it"><span class="tm">${tm}</span><span class="k ${k}">${esc(T(kind[0], kind[1]))}</span><b>${esc(T(tg[0], tg[1]))}</b>${esc(T(msg[0], msg[1]))}</span>`).join("");
    // corvex-ignore-next-line xss-dom: verificato, testi fissi passati da esc()
    el.innerHTML = seg + seg;
  }
  redraw.push(drawTicker);

  // ================================================================ mappa operativa (demo)
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
    ["vault", "VAULT", ["Supabase e Firebase", "Supabase and Firebase"], [["Legge gli script serviti", "Reading the served scripts"], ["Cerca la chiave service_role", "Looking for the service_role key"]], 0],
    ["leech", "LEECH", ["Costi degli endpoint AI", "AI endpoint costs"], [["Cerca gli endpoint AI", "Looking for AI endpoints"], ["Prova /api/chat senza accesso", "Trying /api/chat without sign-in"]], 1],
  ];
  const DORMANT = [
    ["skeleton", "SKELETON", "code", ["Segreti e chiavi", "Secrets and keys"]], ["cipher", "CIPHER", "code", ["Crittografia", "Cryptography"]],
    ["daemon", "DAEMON", "code", ["Configurazione", "Configuration"]], ["chain", "CHAIN", "code", ["Dipendenze", "Dependencies"]],
    ["rewind", "REWIND", "code", ["Cronologia git", "Git history"]], ["blueprint", "BLUEPRINT", "code", ["Infrastruttura come codice", "Infrastructure as code"]],
    ["ledger", "LEDGER", "code", ["SBOM e licenze", "SBOM and licences"]], ["oracle", "ORACLE", "code", ["Audit AI del codice", "AI code audit"]],
    ["bastion", "BASTION", "pc", ["Postura del sistema", "System posture"]], ["warden", "WARDEN", "pc", ["Antimalware sui file", "File antimalware"]],
    ["sonar", "SONAR", "pc", ["Porte e connessioni", "Ports and connections"]], ["tide", "TIDE", "pc", ["Traffico e rete locale", "Traffic and local network"]],
    ["vigil", "VIGIL", "pc", ["Protezione in tempo reale", "Real-time protection"]],
  ];
  const MAP_EN = {
    "bersaglio": "target", "piattaforme web": "web platforms", "codice": "code", "questo computer": "system", "sistema": "system",
    "dormienti": "dormant", "attivi": "active", "ingrandisci": "zoom in", "rimpicciolisci": "zoom out", "adatta": "fit",
    "// trascina per spostarti · ⌘ + rotella o pizzico per lo zoom": "// drag to move · ⌘ + wheel or pinch to zoom",
    "// trascina per spostarti · Ctrl + rotella o pizzico per lo zoom": "// drag to move · Ctrl + wheel or pinch to zoom",
    "mappa della squadra: trascina per spostarti, pulsanti più e meno o pizzico per lo zoom": "team map: drag to move, plus and minus buttons or pinch to zoom",
    "Gli agenti si attivano solo se la loro competenza serve all'analisi, gli altri restano dormienti.": "Agents wake up only when their skill is needed for the analysis, the others stay dormant.",
  };
  let map = null;
  const t0 = performance.now(), CYCLE = 21;
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
    const host = T("shop.esempio.it", "shop.example.com");
    return { id: "scn_demo00", target_name: host, location: "https://" + host, status: all ? "completata" : "in_corso", agents: [lead].concat(agents) };
  }
  function tickMap() { if (map) map.update(scanAt(reduce ? 30 : ((performance.now() - t0) / 1000) % CYCLE)); }
  redraw.push(() => { if (map) { map.key = ""; tickMap(); } });

  // ================================================================ registro (demo)
  const LOG = [
    ["SPECTER", "", "Accesso con il profilo del bersaglio · sessione valida", "Signed in with the target's profile · session valid"],
    ["SPECTER", "", "Area riservata: 23 pagine e 9 parametri in mappa", "Private area: 23 pages and 9 parameters mapped"],
    ["VECTOR", "", "Legge le intestazioni di 12 pagine", "Reading the headers of 12 pages"],
    ["VECTOR", "finding", "Trovato: manca la Content-Security-Policy", "Found: missing Content-Security-Policy"],
    ["HANDSHAKE", "", "TLS 1.3 · certificato valido per altri 71 giorni", "TLS 1.3 · certificate valid for 71 more days"],
    ["JACKAL", "finding", "Trovato: cookie «sessione» senza HttpOnly", "Found: «session» cookie without HttpOnly"],
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
    if (!b) return;
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
  redraw.push(() => { const b = $("term"); if (b && b.childElementCount) { b.textContent = ""; for (let i = 0; i < 6; i++) logLine(); } });

  // ================================================================ chat con CORVUS (demo)
  const ANSWER = [
    "Parti dal file .env pubblico su shop.esempio.it: espone la password del database, quindi toglilo subito dal sito e cambia la password. Poi il cookie di sessione: la correzione è pronta, ti basta approvarla. Le altre due falle possono aspettare la prossima settimana.",
    "Start with the public .env file on shop.example.com: it exposes the database password, so take it off the site right away and change the password. Then the session cookie: the fix is ready, you just need to approve it. The other two issues can wait until next week.",
  ];
  const SOURCES = ["// fonti: File .env scaricabile · Cookie senza protezioni", "// sources: Downloadable .env file · Cookie without protections"];
  let chatT = null, chatSeen = false;
  function chatStart() {
    const el = $("chat-a"), src = $("chat-src");
    if (!el) return;
    clearTimeout(chatT);
    const text = T(ANSWER[0], ANSWER[1]);
    if (src) { src.textContent = T(SOURCES[0], SOURCES[1]); src.classList.remove("on"); }
    if (!chatSeen) { el.textContent = ""; return; }
    if (reduce) { el.textContent = text; if (src) src.classList.add("on"); return; }
    let i = 0;
    const step = () => {
      el.textContent = text.slice(0, i); i += 2;
      if (i <= text.length + 1) chatT = setTimeout(step, 18);
      else if (src) src.classList.add("on");
    };
    step();
  }
  redraw.push(chatStart);

  // ================================================================ team: una scheda che si apre per ogni agente
  // Ruolo, compiti, competenze e controlli vengono dal catalogo della dashboard (assets/agenti.js). Qui si aggiunge cosa puoi fare tu.
  const DO = {
    corvus: [["Chiedergli in chat da dove iniziare, con le fonti sotto ogni risposta", "Ask it in chat where to start, with sources under every answer"], ["Scaricare il rapporto PDF col tuo marchio o in Markdown", "Download the PDF report with your branding, or Markdown"], ["Ricevere gli avvisi nella campanella, sul computer, via email e nelle integrazioni", "Get alerts in the bell, on your computer, by email and in your integrations"]],
    specter: [["Scansionare anche l'area riservata con un profilo di accesso cifrato", "Scan the private area too, with an encrypted sign-in profile"], ["Vedere nel registro la mappa di pagine e parametri", "See the map of pages and parameters in the log"]],
    vector: [["Copiare l'intestazione consigliata dalla procedura di correzione", "Copy the recommended header from the fix procedure"], ["Riprovare la falla con un clic dopo averla chiusa", "Re-test the issue in one click after closing it"]],
    handshake: [["Sapere quanti giorni mancano alla scadenza del certificato", "Know how many days are left before the certificate expires"]],
    jackal: [["Ripetere la prova con la richiesta esatta e il comando curl", "Repeat the check with the exact request and the curl command"], ["Sapere se il cookie di sessione cambia dopo il login", "Know whether the session cookie changes after sign-in"]],
    nullbyte: [["Vedere la prova con i segreti mascherati", "See the evidence with secrets masked"], ["Sapere quali segreti cambiare subito", "Know which secrets to rotate right away"]],
    mirror: [["Riprovare la richiesta con l'origine usata dall'agente", "Re-run the request with the origin the agent used"]],
    payload: [["Applicare la correzione pronta nel codice, con anteprima e backup", "Apply the ready fix in the code, with preview and backup"], ["Riprovare la sonda sul sito dopo il rilascio", "Re-run the probe on the site after release"]],
    relic: [["Sapere a quale versione aggiornare la libreria", "Know which version to upgrade the library to"]],
    hammer: [["Verificare il limite ai tentativi senza toccare gli utenti veri", "Check the attempt limit without touching real users"]],
    schema: [["Vedere quali endpoint rispondono senza autenticazione", "See which endpoints answer without authentication"]],
    spoof: [["Copiare i record DNS consigliati per SPF, DMARC e DKIM", "Copy the recommended DNS records for SPF, DMARC and DKIM"]],
    hijack: [["Sapere quale record DNS togliere prima che qualcuno lo prenda", "Know which DNS record to remove before someone claims it"]],
    skeleton: [["Bloccare la pull request che aggiunge un segreto, prima del merge", "Block the pull request that adds a secret, before merging"], ["Trovare anche le chiavi di GitHub, OpenAI, Supabase e Slack nei file di configurazione", "Find GitHub, OpenAI, Supabase and Slack keys in config files too"]],
    cipher: [["Vedere la riga esatta e l'alternativa sicura", "See the exact line and the safe alternative"]],
    daemon: [["Correggere la configurazione con la procedura passo per passo", "Fix the configuration with the step-by-step procedure"]],
    chain: [["Aggiornare da solo le dipendenze alla prima versione sicura", "Upgrade dependencies to the first safe version automatically"], ["Ricevere le correzioni come pull request", "Get the fixes as a pull request"]],
    rewind: [["Sapere in quale commit è rimasto il segreto e cambiarlo", "Know which commit kept the secret and rotate it"]],
    blueprint: [["Controllare i workflow in ogni pull request, prima del merge", "Check workflows in every pull request, before merging"]],
    ledger: [["Scaricare lo SBOM CycloneDX del progetto", "Download the project's CycloneDX SBOM"], ["Vedere le licenze incompatibili con un prodotto chiuso", "See licences incompatible with a closed product"]],
    vault: [["Chiudere le regole Firebase aperte con la correzione automatica", "Close open Firebase rules with the automatic fix"], ["Sapere quali tabelle Supabase non hanno Row Level Security", "Know which Supabase tables have no Row Level Security"]],
    leech: [["Evitare bollette a sorpresa sugli endpoint AI", "Avoid surprise bills on AI endpoints"], ["Spostare le chiavi AI fuori dal browser", "Move AI keys out of the browser"]],
    oracle: [["Avere un audit AI del controllo accessi e della logica, con corvexai", "Get an AI audit of access control and logic, with corvexai"], ["Leggere la riga citata e il ragionamento di ogni falla", "Read the quoted line and the reasoning behind every issue"]],
    bastion: [["Sapere quali programmi aggiornare e a quale versione", "Know which programs to update and to which version"], ["Vedere per prime le vulnerabilità già sfruttate dagli attaccanti", "See vulnerabilities attackers already exploit first"]],
    warden: [["Mettere in quarantena un file e ripristinarlo se serve", "Quarantine a file and restore it if needed"], ["Scoprire le estensioni del browser con permessi su ogni sito", "Spot browser extensions with access to every site"]],
    sonar: [["Fermare il programma collegato a un server malevolo", "Stop the program connected to a malicious server"], ["Bloccare indirizzi e domini, sempre annullabile", "Block addresses and domains, always undoable"]],
    tide: [["Caricare una cattura di rete o registrarla dal vivo", "Upload a network capture or record one live"], ["Sapere se una password NTLM viaggia verso internet", "Know whether an NTLM password travels to the internet"]],
    vigil: [["Ricevere l'avviso in pochi secondi quando arriva un file pericoloso", "Get alerted within seconds when a dangerous file lands"], ["Scegliere la quarantena automatica", "Choose automatic quarantine"]],
  };
  // Una riga per la scheda chiusa: il testo completo dei compiti compare quando la scheda si apre.
  const SHORT = {
    corvus: ["coordina, passa a ogni agente le skill della sua biblioteca, scrive il rapporto", "coordinates, hands each agent the skills from its library, writes the report"],
    specter: ["ricognizione di pagine, sitemap, API negli script e CMS", "reconnaissance of pages, sitemaps, APIs in scripts and CMS"],
    vector: ["qualità della CSP, HSTS, SRI e clickjacking", "CSP quality, HSTS, SRI and clickjacking"],
    handshake: ["certificato, redirect e prova vera di TLS 1.0 e 1.1", "certificate, redirects and a real TLS 1.0 and 1.1 probe"],
    jackal: ["cookie del login, session fixation, flag mancanti", "sign-in cookies, session fixation, missing flags"],
    nullbyte: [".env, .git, .DS_Store, log, profiler e source map", ".env, .git, .DS_Store, logs, profilers and source maps"],
    mirror: ["CORS con origini simili, provato sulle API", "CORS with look-alike origins, tested on APIs"],
    payload: ["XSS in ogni contesto, SQL injection, SSTI, path traversal", "XSS in every context, SQL injection, SSTI, path traversal"],
    relic: ["librerie con falle note, anche da CDN e nei bundle", "libraries with known flaws, from CDNs and inside bundles"],
    hammer: ["login senza limite, recupero password, utenti pubblici", "sign-in without limits, password reset, public user names"],
    schema: ["API senza autenticazione, OpenAPI e GraphQL", "unauthenticated APIs, OpenAPI and GraphQL"],
    spoof: ["SPF, DMARC e DKIM, con selettori dedotti dall'MX", "SPF, DMARC and DKIM, with selectors read from MX"],
    hijack: ["sottodomini dirottabili e domini scaduti", "hijackable subdomains and expired domains"],
    skeleton: ["segreti e chiavi moderne in codice e configurazioni", "secrets and modern keys in code and config"],
    cipher: ["hash deboli, JWT non verificati, password con SHA-256", "weak hashes, unverified JWTs, passwords with SHA-256"],
    daemon: ["Dockerfile, segreti nelle immagini, CSRF e cookie", "Dockerfiles, secrets in images, CSRF and cookies"],
    chain: ["dipendenze vulnerabili da ogni lockfile", "vulnerable dependencies from every lockfile"],
    rewind: ["segreti in tutti i rami, i tag e 2000 commit", "secrets across all branches, tags and 2000 commits"],
    blueprint: ["Actions, Compose, Kubernetes, Terraform e bucket pubblici", "Actions, Compose, Kubernetes, Terraform and public buckets"],
    ledger: ["SBOM CycloneDX e licenze incompatibili", "CycloneDX SBOM and incompatible licences"],
    vault: ["Supabase e Firebase: regole aperte, RLS, viste e chiavi", "Supabase and Firebase: open rules, RLS, views and keys"],
    leech: ["costi AI: chiavi esposte, route senza limite o tetto", "AI costs: exposed keys, routes with no limit or cap"],
    oracle: ["audit AI: ogni falla cita il codice esatto ed è confermata due volte", "AI audit: every issue quotes the exact code and is confirmed twice"],
    bastion: ["postura di Windows e macOS, vulnerabilità sfruttate", "Windows and macOS posture, exploited vulnerabilities"],
    warden: ["malware, persistenza ed estensioni dei browser", "malware, persistence and browser extensions"],
    sonar: ["servizi esposti e connessioni sospette, anche UDP", "exposed services and suspicious connections, UDP too"],
    tide: ["traffico: NTLM, Kerberoasting, beacon, ARP spoofing", "traffic: NTLM, Kerberoasting, beacons, ARP spoofing"],
    vigil: ["file nuovi in tempo reale, anche dentro le app", "new files in real time, even inside apps"],
  };
  const NEW_AGENTS = new Set(["vault", "leech"]);
  // Sul sito niente piani né prezzi: le frasi del catalogo che li citano non compaiono.
  const noPlans = t => String(t).split(/(?<=\.)\s+/).filter(x => !/\b(piano|plan)\b/i.test(x)).join(" ");
  const GROUP = g => (g.includes("web") && g.includes("code") ? ["web · codice", "web · code"] : g === "web" ? ["web", "web"] : g === "code" ? ["codice", "code"] : g === "pc" ? ["sistema", "system"] : ["coordina", "lead"]);
  let teamFilter = "all";
  const openCards = new Set();
  function drawTeam() {
    const box = $("team");
    if (!box || !window.C || !C.AGENTI) return;
    const list = C.AGENTI.filter(a => teamFilter === "all" || a.group === "coord" || a.group.split(" ").includes(teamFilter));
    const card = a => {
      const t = a[lang] || a.it, g = GROUP(a.group), open = openCards.has(a.id), lead = a.group === "coord";
      const dos = (DO[a.id] || []).map(d => `<li>${esc(T(d[0], d[1]))}</li>`).join("");
      return `<article class="s-ag-card${lead ? " s-ag-lead" : ""}${open ? " open" : ""}" data-id="${esc(a.id)}">
        <button type="button" aria-expanded="${open}" aria-controls="ag-${esc(a.id)}">${lead ? '<img src="assets/corvus.svg" alt="">' : ""}
          <span class="hd"><span class="s-ag">${esc(a.name)}</span><span class="fr">${esc(T(g[0], g[1]))}</span>${NEW_AGENTS.has(a.id) ? `<span class="fr nw">${esc(T("nuovo", "new"))}</span>` : ""}</span><span class="tg" aria-hidden="true">+</span>
          <h3>${esc(t.role)}</h3><p class="one">${esc(SHORT[a.id] ? T(SHORT[a.id][0], SHORT[a.id][1]) : noPlans(t.tasks))}</p></button>
        <div class="bd" id="ag-${esc(a.id)}">
          <div><h4>${esc(T("cosa fa", "what it does"))}</h4><p>${esc(noPlans(t.tasks))}</p></div>
          <div><h4>${esc(T("competenze", "skills"))}</h4><div class="sk">${t.skills.map(s => `<span>${esc(s)}</span>`).join("")}</div></div>
          <div><h4>${esc(T("cosa controlla", "what it checks"))}</h4><ul>${t.checks.map(c => `<li>${esc(noPlans(c))}</li>`).join("")}</ul></div>
          ${dos ? `<div><h4>${esc(T("cosa puoi fare", "what you can do"))}</h4><ul class="do">${dos}</ul></div>` : ""}
        </div></article>`;
    };
    // corvex-ignore-next-line xss-dom: verificato, catalogo fisso passato da esc()
    box.innerHTML = list.map(card).join("");
    const n = $("team-n");
    if (n) n.textContent = T(`${list.length} di ${C.AGENTI.length} agenti`, `${list.length} of ${C.AGENTI.length} agents`);
    box.querySelectorAll(".s-ag-card > button").forEach(b => b.onclick = () => {
      const c = b.parentElement, id = c.dataset.id, open = !c.classList.contains("open");
      c.classList.toggle("open", open);
      b.setAttribute("aria-expanded", String(open));
      if (open) openCards.add(id); else openCards.delete(id);
    });
  }
  redraw.push(drawTeam);
  function teamFilters() {
    document.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => {
      teamFilter = b.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(x => x.classList.toggle("on", x === b));
      drawTeam();
    });
  }

  // ================================================================ updates: le notizie di Corvex (assets/news.js, copiate da news.json)
  const TAGS = { "novità": ["novità", "new", ""], release: ["release", "release", "rel"], correzione: ["correzione", "fix", "fix"], sicurezza: ["sicurezza", "security", "fix"] };
  function drawUpdates() {
    const box = $("updates");
    if (!box || !Array.isArray(window.CORVEX_NEWS)) return;
    const fmt = d => { try { return new Date(d + "T12:00:00").toLocaleDateString(T("it-IT", "en-GB"), { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return d; } };
    // corvex-ignore-next-line xss-dom: verificato, notizie firmate di Corvex passate da esc()
    box.innerHTML = window.CORVEX_NEWS.map(n => {
      const tag = TAGS[n.tag] || [n.tag, n.tag, ""];
      const body = String((n.body || {})[lang] || (n.body || {}).it || "").split("\n").filter(Boolean).map(p => `<p>${esc(p)}</p>`).join("");
      const ags = (n.agents || []).map(a => `<span class="s-ag">${esc(a)}</span>`).join("");
      return `<article class="s-up"><div class="when"><b>${esc(fmt(n.date))}</b>${n.version ? `v${esc(n.version)}` : ""}<br><span class="tag ${tag[2]}">${esc(T(tag[0], tag[1]))}</span></div>
        <div><h3>${esc((n.title || {})[lang] || (n.title || {}).it || "")}</h3><div class="bd">${ags ? `<div class="ags">${ags}</div>` : ""}${body}</div></div></article>`;
    }).join("");
  }
  redraw.push(drawUpdates);

  // ================================================================ chiusura: diagnostica che si scrive
  function boot() {
    const el = $("boot");
    if (!el) return;
    const lines = [["$ corvex --stato", ""], [T("firme_corvex ........... pronte", "corvex_signatures ...... ready"), "ok"],
      [T("agenti ................. 28/28", "agents ................. 28/28"), "ok"], [T("corvexai ............... pronto", "corvexai ............... ready"), "ok"],
      [T("download ............... in arrivo", "download ............... coming soon"), "w"]];
    el.innerHTML = "";
    lines.forEach(([t, c], i) => setTimeout(() => {
      const d = document.createElement("div");
      d.className = c;
      d.textContent = t;
      el.appendChild(d);
    }, reduce ? 0 : 350 + i * 420));
  }

  // ================================================================ titoli che si decifrano
  // Ogni parola resta larga quanto il testo finale, così i simboli casuali non spostano gli a capo né la pagina.
  const GLYPHS = "0123456789ABCDEF#:/<>=+";
  function decode(el, dur) {
    const text = el.textContent;
    if (reduce || !text.trim() || el.children.length) return;
    const words = text.split(" ");
    // corvex-ignore-next-line xss-dom: verificato, parole del titolo passate da esc()
    el.innerHTML = words.map(w => `<span class="s-w">${esc(w)}</span>`).join(" ");
    const spans = [...el.children];
    spans.forEach(s => { s.style.width = s.getBoundingClientRect().width + "px"; });
    const start = performance.now();
    const step = now => {
      if (!el.contains(spans[0])) return;  // la lingua è cambiata nel frattempo
      const p = Math.max(0, Math.min(1, (now - start) / dur));
      let lock = Math.floor(p * text.length);
      spans.forEach((s, i) => {
        const w = words[i];
        s.textContent = w.slice(0, Math.max(0, lock)) + Array.from(w.slice(Math.max(0, lock)), () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("");
        lock -= w.length + 1;
      });
      if (p < 1) requestAnimationFrame(step); else el.textContent = text;
    };
    requestAnimationFrame(step);
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
      el.querySelectorAll("h2.cm [data-en]").forEach(h => decode(h, 700));
      if (el.id === "chat") { chatSeen = true; chatStart(); }
      if (el.closest && el.closest(".s-end")) boot();
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".s-rv").forEach(el => io.observe(el));
  }

  // ================================================================ anteprima video
  // Parte da sola senza audio quando entra nello schermo e si ferma quando esce. Il pulsante la fa ripartire dall'inizio con l'audio.
  function preview() {
    const v = $("vid"), play = $("vid-play"), snd = $("vid-snd");
    if (!v) return;
    let seen = false;
    const label = () => {
      $("vid-play-t").textContent = T("guarda_anteprima()", "watch_preview()");
      snd.textContent = v.muted ? T("attiva_audio()", "sound_on()") : T("togli_audio()", "sound_off()");
      v.setAttribute("aria-label", T("Anteprima video di Corvex, in inglese", "Corvex preview video"));
    };
    redraw.push(label);
    const withSound = () => { v.muted = false; v.currentTime = 0; v.controls = true; play.hidden = true; snd.hidden = false; v.play().catch(() => {}); label(); };
    play.onclick = withSound;
    snd.onclick = () => { if (v.muted) withSound(); else { v.muted = true; label(); } };
    label();
    if (reduce || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) {
        if (!seen) { seen = true; v.preload = "auto"; }
        if (v.paused && (v.muted || v.dataset.on)) { v.play().then(() => { play.hidden = true; snd.hidden = false; v.dataset.on = "1"; }).catch(() => {}); }
      } else if (!v.paused) v.pause();
    }), { threshold: 0.45 }).observe(v);
  }

  // ================================================================ avvio
  function start() {
    menu();
    teamFilters();
    applyLang();
    reveal();
    if (V) {
      if ($("hero-ascii")) V.asciiArt($("hero-ascii"), { fill: true, shape: "brackets", cx: 0.46, scale: 0.84, narrowScale: 0.86, narrowCy: -0.32, bg: 0.05 });
      if ($("end-ascii")) V.asciiArt($("end-ascii"), { fill: true, shape: "brackets", cx: 0.58, scale: 0.7, narrowScale: 0.7, narrowCy: 0, bg: 0.03 });
      document.querySelectorAll(".s-ph-bg").forEach(el => V.asciiArt(el, { fill: true, shape: el.dataset.shape || "brackets", cx: 0.78, scale: 0.62, narrowScale: 0.6, narrowCy: -0.2, bg: 0.03 }));
      if ($("map")) { map = new V.MapView($("map"), { label: k => (lang === "en" && MAP_EN[k]) || k }); tickMap(); setInterval(tickMap, 700); }
    }
    if ($("term")) { for (let i = 0; i < 6; i++) logLine(); if (!reduce) setInterval(() => { if (!document.hidden) logLine(); }, 1300); }
    preview();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
