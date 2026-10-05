(() => {
  const ambient = document.getElementById('ambientAudio');
  const cold = document.getElementById('coldAudio');
  const toggle = document.getElementById('musicToggle');
  const mute = document.getElementById('musicMute');
  const volume = document.getElementById('musicVolume');
  const progress = document.getElementById('audioProgress');
  const name = document.getElementById('trackName');
  const soundToggle = document.getElementById('soundToggle');
  const tracks = [ambient, cold].filter(Boolean);
  let active = ambient || cold || null;
  let pendingPlayback = false;
  const labels = new Map([[ambient, 'EYES OFF YOU — AMBIENT'], [cold, 'COLD BLOODED — SPED UP']]);

  function isMuted() {
    return active ? active.muted : tracks.length > 0 && tracks.every(track => track.muted);
  }

  function syncControls() {
    if (toggle) {
      toggle.textContent = active && !active.paused ? '❚❚' : '▶';
      toggle.setAttribute('aria-label', active && !active.paused ? 'Pause' : 'Play');
    }
    if (mute) {
      mute.textContent = isMuted() ? '🔇' : '🔊';
      mute.setAttribute('aria-label', isMuted() ? 'Unmute' : 'Mute');
    }
    if (soundToggle) {
      soundToggle.textContent = isMuted() ? 'SOUND OFF' : 'SOUND ON';
      soundToggle.setAttribute('aria-pressed', String(!isMuted()));
    }
    if (volume && active) volume.value = String(active.volume);
    if (progress) {
      const percentage = active?.duration ? active.currentTime / active.duration * 100 : 0;
      progress.style.width = `${percentage}%`;
    }
    if (name && active) name.textContent = labels.get(active) || 'AUDIO ARCHIVE';
  }

  async function play() {
    if (!active) return false;
    try {
      await active.play();
      pendingPlayback = false;
      syncControls();
      return true;
    } catch {
      pendingPlayback = true;
      syncControls();
      return false;
    }
  }

  function pause() {
    if (active) active.pause();
    pendingPlayback = false;
    syncControls();
  }

  function setActive(audio) {
    if (!audio) return false;
    if (active !== audio) {
      const muted = isMuted();
      active?.pause();
      if (active) active.currentTime = 0;
      active = audio;
      tracks.forEach(track => { track.muted = muted; });
    }
    syncControls();
    return true;
  }

  function setMuted(muted) {
    tracks.forEach(track => { track.muted = muted; });
    syncControls();
  }

  toggle?.addEventListener('click', () => {
    if (!active) return;
    if (active.paused) play();
    else pause();
  });
  mute?.addEventListener('click', () => setMuted(!isMuted()));
  volume?.addEventListener('input', () => {
    const level = Math.max(0, Math.min(1, Number(volume.value) || 0));
    tracks.forEach(track => { track.volume = level; });
    syncControls();
  });
  tracks.forEach(track => {
    ['play', 'pause', 'volumechange', 'timeupdate', 'loadedmetadata', 'ended', 'error'].forEach(event => {
      track.addEventListener(event, () => {
        if (track === active) syncControls();
      });
    });
  });
  document.addEventListener('pointerdown', event => {
    if (event.target instanceof Element && event.target.closest('#musicToggle')) return;
    if (pendingPlayback) play();
  });
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof Element && event.target.closest('#musicToggle')) return;
    if (pendingPlayback) play();
  });

  if (active) {
    const initialVolume = Math.max(0, Math.min(1, Number(volume?.value ?? 0.45)));
    tracks.forEach(track => { track.volume = initialVolume; });
  }
  syncControls();

  window.VenomAudio = {
    play, pause,
    unlock() { pendingPlayback = true; return play(); },
    setMuted,
    isMuted,
    toggleMute() { setMuted(!isMuted()); },
    setAmbient() { if (setActive(ambient)) play(); },
    setCold() { if (setActive(cold)) play(); }
  };
})();
