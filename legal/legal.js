/* Lingua delle pagine Termini, Privacy e Sicurezza: la stessa scelta sul sito o nella dashboard, oppure quella del browser. */
(function () {
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* archivio non disponibile */ } };
  const q = new URLSearchParams(location.search).get("lang");
  let lang = q || get("corvex-sito-lang") || get("corvex-lang") || ((navigator.language || "it").toLowerCase().startsWith("it") ? "it" : "en");
  function apply() {
    lang = lang === "en" ? "en" : "it";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-l]").forEach(el => { el.hidden = el.dataset.l !== lang; });
    document.querySelectorAll("[data-lang]").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
    const t = document.querySelector(`meta[name="title-${lang}"]`);
    if (t) document.title = t.content;
  }
  document.querySelectorAll("[data-lang]").forEach(b => b.onclick = () => { lang = b.dataset.lang; set("corvex-sito-lang", lang); set("corvex-lang", lang); apply(); });
  apply();
})();
