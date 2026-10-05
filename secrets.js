(() => {
  const found = new Set();
  const portalOrder = ['memory', 'story', 'her', 'music', 'secret'];
  let coreClicks = 0;
  let portalProgress = 0;

  function discover(id, message) {
    if (found.has(id)) return false;
    found.add(id);
    const counter = document.getElementById('discoveryCount');
    if (counter) counter.textContent = `${found.size} / 10`;
    window.VenomMain?.toast(message || `SECRET ${id} DISCOVERED`);
    if (found.size === 10) window.VenomMain?.finale();
    return true;
  }

  window.VenomSecrets = {
    discover,
    portalStep(portal) {
      if (portal === portalOrder[portalProgress]) {
        portalProgress++;
        if (portalProgress === portalOrder.length) {
          portalProgress = 0;
          discover('06', 'CLICK SEQUENCE ACCEPTED');
        }
      } else {
        portalProgress = portal === portalOrder[0] ? 1 : 0;
      }
    },
    clickCore() { coreClicks++; if (coreClicks >= 5) discover('03', 'CORE RESPONSE DETECTED'); },
    hiddenStar() { discover('02', 'HIDDEN STAR FOUND'); },
    stillness() { discover('04', 'STILLNESS SIGNAL FOUND'); },
    music() { discover('05', 'AUDIO FREQUENCY MATCHED'); },
    vicky() { discover('07', 'VICKY SIGNAL FOUND'); },
    dates() { discover('08', 'DATE SIGNAL VERIFIED'); },
    venom() { discover('09', 'VENOM OVERRIDE ACCEPTED'); },
    portal() { discover('10', 'HIDDEN PORTAL UNLOCKED'); }
  };
})();
