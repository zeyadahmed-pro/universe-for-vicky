(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const warning = $('#warning');
  const login = $('#login');
  const loading = $('#loading');
  const world = $('#world');
  const panel = $('#panel');
  const content = $('#panel-content');
  const CONFIG = window.VENOM_CONFIG || { password: 'myvicky', qualities: [], finalMessage: '' };
  let idleTimer;
  let warningTimer;
  let loadingTimer;
  let lastFocused;
  let vickyClicks = 0;
  let venom = false;
  let finaleStarted = false;
  let panelHistoryOpen = false;
  let panelHistoryId = 0;
  let activePanelHistoryId = null;
  let lastPointerX = null;
  let lastPointerY = null;

  function show(element) { element?.classList.remove('hidden'); }
  function hide(element) { element?.classList.add('hidden'); }
  function bind(element, event, handler) { element?.addEventListener(event, handler); }

  function toast(message) {
    const element = $('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(element._timer);
    element._timer = setTimeout(() => element.classList.remove('show'), 2200);
  }

  function startIdleTimer() {
    clearTimeout(idleTimer);
    if (!world || world.classList.contains('hidden')) return;
    idleTimer = setTimeout(() => window.VenomSecrets?.stillness(), 10000);
  }

  function openPanel(type) {
    if (!panel || !content) return;
    const panels = {
      memory: `<span class="eyebrow">MEMORY ARCHIVE</span><h2>FRAGMENTS WORTH KEEPING</h2><p>Little moments can become the safest places to return to.</p><div class="memory-grid"><div><b>03 SEP</b><p>The first conversation — the first spark.</p></div><div><b>24 SEP</b><p>The connection became official.</p></div><div><b>NOW</b><p>The archive keeps growing, just like this feeling.</p></div></div>`,
      story: `<span class="eyebrow">TIMELINE // 001</span><h2>THE SIGNAL</h2><p>Every love story has a first hello. This one has a place to keep it safe.</p><div class="timeline"><div><b>03 SEPTEMBER</b><p>First conversation — the archive begins.</p></div><div><b>24 SEPTEMBER</b><p>The relationship becomes official.</p></div><div><b>∞</b><p>Everything after that belongs to us.</p></div></div><button id="dateSecret" class="primary-btn" type="button">VERIFY OUR DATE</button>`,
      her: `<span class="eyebrow">IDENTITY PROFILE</span><h2>VICKY</h2><p class="big-copy">Kindness. Care. Personality. Eyes. Presence. The kind of person who makes a whole room feel softer.</p><div class="qualities">${(CONFIG.qualities || []).map((quality, index) => `<span style="--i:${index}">${quality}</span>`).join('')}</div><div class="eye-visual"><div class="iris"><i></i></div><div class="iris"><i></i></div></div>`,
      music: `<span class="eyebrow">AUDIO ARCHIVE</span><h2>THE SOUND LAYER</h2><p>For the moments when words are not enough: <b>EYES OFF YOU</b> for softness, <b>COLD BLOODED — SPED UP</b> for a little fire.</p><button id="ambientBtn" class="primary-btn" type="button">PLAY THE SOFT VERSION</button><button id="coldBtn" class="ghost-btn" type="button">BRING BACK THE FIRE</button><div class="equalizer">${Array.from({ length: 28 }, (_, index) => `<i style="--i:${index}"></i>`).join('')}</div>`,
      secret: `<span class="eyebrow">RESTRICTED AREA</span><h2>SECRET LAYER</h2><p>There are ten signals hidden across the archive. Take your time — this place is meant to be explored, not rushed.</p><button id="secretPulse" class="primary-btn" type="button">SEARCH FOR A SIGNAL</button>`
    };

    if (!panels[type]) return;
    lastFocused = document.activeElement;
    content.innerHTML = panels[type];
    show(panel);
    panel.setAttribute('aria-hidden', 'false');
    if (!panelHistoryOpen) {
      try {
        activePanelHistoryId = ++panelHistoryId;
        history.pushState({ venomPanel: activePanelHistoryId }, '', location.href);
        panelHistoryOpen = true;
      } catch {}
    }
    $('.panel-close')?.focus();

    bind($('#dateSecret'), 'click', () => window.VenomSecrets?.dates());
    bind($('#ambientBtn'), 'click', () => window.VenomAudio?.setAmbient());
    bind($('#coldBtn'), 'click', () => window.VenomAudio?.setCold());
    bind($('#secretPulse'), 'click', () => {
      window.VenomSecrets?.portal();
      toast('A deeper layer is listening.');
    });
    if (type === 'music') window.VenomSecrets?.music();
  }

  function closePanel(fromHistory = false) {
    if (!panel || panel.classList.contains('hidden')) return;
    const shouldGoBack = panelHistoryOpen && !fromHistory;
    const closingHistoryId = activePanelHistoryId;
    panelHistoryOpen = false;
    activePanelHistoryId = null;
    hide(panel);
    panel.setAttribute('aria-hidden', 'true');
    lastFocused?.focus();
    if (shouldGoBack && history.state?.venomPanel === closingHistoryId) history.back();
  }

  function enterLogin() {
    hide(warning);
    show(login);
    $('#password')?.focus();
  }

  function startWarning() {
    if (warning) warningTimer = setTimeout(enterLogin, 8000);
    bind($('#warningContinue'), 'click', () => {
      clearTimeout(warningTimer);
      enterLogin();
    });
  }

  bind($('#showPassword'), 'click', () => {
    const input = $('#password');
    const button = $('#showPassword');
    if (!input || !button) return;
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    button.textContent = visible ? 'SHOW' : 'HIDE';
    button.setAttribute('aria-label', visible ? 'Show archive key' : 'Hide archive key');
  });

  bind($('#loginForm'), 'submit', event => {
    event.preventDefault();
    const password = $('#password');
    const error = $('#loginError');
    if (!password) return;
    if (!password.value) {
      if (error) error.textContent = 'Enter the archive key to continue.';
      password.focus();
      return;
    }
    if (password.value !== CONFIG.password) {
      if (error) error.textContent = 'That key missed the signal — try myvicky.';
      password.focus();
      password.select();
      return;
    }

    if (error) error.textContent = '';
    window.VenomSecrets?.discover('01', 'ARCHIVE ACCESS GRANTED');
    window.VenomAudio?.unlock();
    window.scrollTo(0, 0);
    hide(login);
    show(loading);
    let progress = 0;
    const bar = $('#loadingBar');
    const status = $('#loadingStatus');
    const statuses = [
      'Gathering every soft little memory...',
      'Following the signal back to the first hello...',
      'Making room for something beautiful...'
    ];
    clearInterval(loadingTimer);
    loadingTimer = setInterval(() => {
      progress = Math.min(100, progress + 5);
      if (bar) bar.style.width = `${progress}%`;
      if (status) status.textContent = statuses[Math.min(statuses.length - 1, Math.floor(progress / 35))];
      if (progress >= 100) {
        clearInterval(loadingTimer);
        hide(loading);
        show(world);
        startIdleTimer();
      }
    }, 70);
  });

  bind(document, 'click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const portal = target?.closest('.portal');
    const panelTrigger = target?.closest('[data-panel]');
    if (!panelTrigger) return;
    if (portal) window.VenomSecrets?.portalStep(portal.dataset.panel);
    openPanel(panelTrigger.dataset.panel);
  });

  bind($('.panel-close'), 'click', () => closePanel());
  bind($('.panel-backdrop'), 'click', () => closePanel());
  bind($('#core'), 'click', () => {
    window.VenomSecrets?.clickCore();
    toast('VENOM CORE // SIGNAL RESPONDED');
  });
  bind($('#pinkStar'), 'click', () => window.VenomSecrets?.hiddenStar());
  bind($('#vickyTrigger'), 'click', () => {
    vickyClicks++;
    window.VenomSecrets?.vicky();
    toast(`VICKY SIGNAL ${vickyClicks}`);
    if (vickyClicks >= 3) openPanel('her');
  });
  bind($('#venomButton'), 'click', () => {
    venom = !venom;
    world?.classList.toggle('venom-mode', venom);
    const status = $('#statusText');
    if (status) status.textContent = venom ? 'VENOM OVERRIDE ACTIVE' : 'CONNECTION STABLE';
    window.VenomSecrets?.venom();
    toast(venom ? 'VENOM MODE // ONLINE' : 'VENOM MODE // OFFLINE');
  });
  bind($('#soundToggle'), 'click', () => window.VenomAudio?.toggleMute());
  bind($('#archiveLogo'), 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  bind(document, 'pointermove', event => {
    if (event.clientX === lastPointerX && event.clientY === lastPointerY) return;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    startIdleTimer();
  });
  bind(document, 'pointerdown', startIdleTimer);
  bind(document, 'keydown', startIdleTimer);
  document.addEventListener('wheel', startIdleTimer, { passive: true });
  bind(document, 'keydown', event => {
    if (event.key === 'Escape') closePanel();
    if (panel && !panel.classList.contains('hidden') && event.key === 'Tab') {
      const focusable = [...panel.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  bind(window, 'popstate', () => {
    if (panel && !panel.classList.contains('hidden') && activePanelHistoryId !== null && history.state?.venomPanel !== activePanelHistoryId) closePanel(true);
  });

  function finale() {
    const element = $('#finale');
    if (finaleStarted || !element) return;
    finaleStarted = true;
    show(element);
    const phase = $('#finalePhase');
    const name = $('#finaleName');
    const nickname = $('#finaleNickname');
    const message = $('#finaleMessage');
    if (phase) phase.textContent = 'SIGNAL LOST…';
    setTimeout(() => { if (phase) phase.textContent = 'SIGNAL FOUND.'; }, 1400);
    setTimeout(() => name?.classList.add('visible'), 2300);
    setTimeout(() => nickname?.classList.add('visible'), 3100);
    setTimeout(() => {
      if (message) {
        message.textContent = CONFIG.finalMessage || '';
        message.classList.add('visible');
      }
    }, 3900);
  }

  bind($('#replay'), 'click', () => location.reload());
  window.VenomMain = { toast, finale };
  startWarning();
})();
