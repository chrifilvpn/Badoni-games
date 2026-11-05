// Presenza: stato del giocatore sulla pagina e audio del sito.
// - attivo: sempre false (il giocatore è sempre sulla partita); onCambio resta per compatibilità con i giochi.
// - silenzio(si): pulsante 🔇 del sito: tutti i suoni sospesi e ogni video o audio parte muto.
window.Presenza = (() => {
  const contesti = new Set();
  const sospesi = new Set();
  let muto = false;
  for (const nome of ['AudioContext', 'webkitAudioContext']) {
    const Originale = window[nome];
    if (!Originale) continue;
    window[nome] = class extends Originale {
      constructor(...a) { super(...a); contesti.add(this); if (muto) { this.suspend(); sospesi.add(this); } }
    };
  }
  const playVero = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) { if (muto) this.muted = true; return playVero.apply(this, a); };
  function silenzio(si) {
    muto = !!si;
    if (muto) {
      contesti.forEach((c) => { if (c.state === 'running') { c.suspend(); sospesi.add(c); } });
      document.querySelectorAll('audio, video').forEach((m) => { m.muted = true; });
    } else {
      sospesi.forEach((c) => c.resume().catch(() => {}));
      sospesi.clear();
      document.querySelectorAll('audio, video').forEach((m) => { m.muted = false; });
    }
  }
  return {
    attiva() {},
    disattiva() {},
    get attivo() { return false; },
    attivita() {},
    config() { return {}; },
    onCambio() {},
    silenzio,
    get muto() { return muto; },
  };
})();
