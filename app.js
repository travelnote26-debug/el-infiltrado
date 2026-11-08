(function () {
  'use strict';

  var appEl = document.getElementById('app');
  var modalRoot = document.getElementById('modal-root');
  var toastEl = document.getElementById('toast');

  var WORD_BANK = window.WORD_BANK || {};
  var CATEGORY_META = window.CATEGORY_META || {};
  var TIME_OPTIONS = [60, 90, 120, 180];
  var STORAGE = {
    custom: 'infiltrado.customPairs.v1',
    history: 'infiltrado.history.v1',
    sound: 'infiltrado.sound.v1',
    setup: 'infiltrado.setup.v1'
  };

  var ICONS = {
    volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m16 9 5 5"/><path d="m21 9-5 5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M8 5.3v13.4L19 12 8 5.3Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3.5 12a8.5 8.5 0 1 0 2.9-6.4"/><path d="M3.5 4.5V10h5.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" class="w-5 h-5"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2-2.6 3.6"/><path d="M12 17.3h.01"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M3.5 6h17"/><path d="M8.5 6V4h7v2"/><path d="m6 6 1 14h10l1-14"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><rect x="4.5" y="10.5" width="15" height="10" rx="2.4"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7"/><path d="M12 14.5v2.2"/></svg>',
    install: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M12 3v11"/><path d="m7 10 5 5 5-5"/><path d="M4 17v3h16v-3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="M2.5 12s3.6-6.2 9.5-6.2S21.5 12 21.5 12s-3.6 6.2-9.5 6.2S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3.2 12a8.8 8.8 0 1 0 2.6-6.2"/><path d="M3.2 4.2v5.4h5.4"/><path d="M12 7.5V12l3 2"/></svg>'
  };

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {}
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function pick(list) {
    return list[randInt(list.length)];
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = randInt(i + 1);
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatTime(seconds) {
    var total = Math.max(0, Math.ceil(seconds));
    return Math.floor(total / 60) + ':' + pad2(total % 60);
  }

  function countLabel(count, singular, plural) {
    return count + ' ' + (count === 1 ? singular : plural);
  }

  function formatHistoryDate(timestamp) {
    var date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (err) {
      return date.toLocaleString();
    }
  }

  function initials(name) {
    var clean = String(name || '?').trim();
    return escapeHtml(clean.slice(0, 2).toUpperCase() || '?');
  }

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {}
    }
  }

  function timeLabel(value) {
    if (value === 60) return '1 min';
    if (value === 90) return '1:30';
    if (value === 120) return '2 min';
    return '3 min';
  }

  function maxImpostors(count) {
    if (count <= 5) return 1;
    if (count <= 8) return 2;
    return 3;
  }

  var lastScreen = null;

  function render() {
    if (state.screen !== 'debate') {
      stopTimerLoop();
    }
    if (lastScreen !== state.screen) {
      window.scrollTo(0, 0);
      lastScreen = state.screen;
    }
    if (state.screen === 'home') renderHome();
    else if (state.screen === 'history') renderHistory();
    else if (state.screen === 'setup') renderSetup();
    else if (state.screen === 'reveal-pass') renderRevealPass();
    else if (state.screen === 'reveal') renderReveal();
    else if (state.screen === 'debate') renderDebate();
    else if (state.screen === 'vote-pass') renderVotePass();
    else if (state.screen === 'vote-select') renderVoteSelect();
    else if (state.screen === 'tally') renderTally();
    else if (state.screen === 'elimination') renderElimination();
    else if (state.screen === 'tie') renderTie();
    else if (state.screen === 'results') renderResults();
    refreshSoundIcons();
  }

  function setScreen(name) {
    state.screen = name;
    render();
  }

  var Sound = {
    enabled: load(STORAGE.sound, true) !== false,
    ctx: null,
    init: function () {
      if (!this.ctx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        this.ctx = new Ctx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(function () {});
      }
      return this.ctx;
    },
    tone: function (freq, duration, options) {
      if (!this.enabled) return;
      var ctx = this.init();
      if (!ctx) return;
      var opts = options || {};
      var type = opts.type || 'sine';
      var volume = opts.volume == null ? 0.05 : opts.volume;
      var delay = opts.delay || 0;
      var attack = opts.attack || 0.006;
      var start = ctx.currentTime + delay;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), start);
      if (opts.slide != null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), start + duration);
      }
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.04);
    },
    chord: function (freqs, duration, options) {
      var self = this;
      freqs.forEach(function (freq, index) {
        var opts = Object.assign({}, options || {});
        opts.delay = (opts.delay || 0) + index * 0.055;
        self.tone(freq, duration, opts);
      });
    },
    toggle: function () {
      this.enabled = !this.enabled;
      save(STORAGE.sound, this.enabled);
      if (this.enabled) {
        this.init();
        this.click();
      }
    },
    click: function () {
      this.tone(640, 0.055, { type: 'triangle', volume: 0.038, slide: 880 });
    },
    reveal: function () {
      this.tone(460, 0.13, { type: 'sine', volume: 0.05, slide: 820 });
      this.tone(1040, 0.18, { type: 'sine', volume: 0.028, delay: 0.09 });
    },
    start: function () {
      this.chord([329.63, 440, 523.25, 659.25], 0.42, { type: 'triangle', volume: 0.038 });
    },
    vote: function () {
      this.tone(392, 0.09, { type: 'triangle', volume: 0.05 });
      this.tone(587.33, 0.14, { type: 'triangle', volume: 0.04, delay: 0.08 });
    },
    suspense: function () {
      this.tone(110, 0.35, { type: 'sine', volume: 0.04 });
      this.tone(146.83, 0.35, { type: 'sine', volume: 0.03, delay: 0.18 });
    },
    tick: function () {
      this.tone(720, 0.035, { type: 'square', volume: 0.012 });
    },
    urgentTick: function () {
      this.tone(1040, 0.055, { type: 'square', volume: 0.032 });
      this.tone(1560, 0.035, { type: 'sine', volume: 0.018 });
    },
    timeUp: function () {
      this.tone(220, 0.55, { type: 'sawtooth', volume: 0.05, slide: 80 });
      this.chord([164.81, 220, 329.63], 0.4, { type: 'triangle', volume: 0.03 });
    },
    eliminate: function (isImpostor) {
      this.tone(300, 0.5, { type: 'sawtooth', volume: 0.05, slide: 70 });
      this.tone(120, 0.45, { type: 'sine', volume: 0.06, delay: 0.07 });
      if (isImpostor) {
        this.tone(880, 0.18, { type: 'triangle', volume: 0.035, delay: 0.28 });
      }
    },
    victory: function () {
      this.chord([523.25, 659.25, 783.99, 1046.5], 0.7, { type: 'triangle', volume: 0.04 });
      this.tone(1567.98, 0.5, { type: 'sine', volume: 0.025, delay: 0.3 });
    },
    defeat: function () {
      this.chord([392, 311.13, 261.63, 196], 0.7, { type: 'sawtooth', volume: 0.028 });
      this.tone(98, 0.7, { type: 'sine', volume: 0.05, delay: 0.1 });
    },
    result: function (winner) {
      if (winner === 'citizens') this.victory();
      else this.defeat();
    }
  };

  var customPairs = (load(STORAGE.custom, []) || []).filter(function (pair) {
    return pair && typeof pair.a === 'string' && typeof pair.b === 'string';
  });

  var historyEntries = (function () {
    var raw = load(STORAGE.history, []);
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (entry) {
      return entry && typeof entry === 'object' &&
        (entry.winner === 'citizens' || entry.winner === 'impostors') &&
        Array.isArray(entry.players) && entry.players.length > 0 &&
        Number.isFinite(entry.endedAt);
    }).map(function (entry) {
      var players = entry.players.map(function (player) {
        return {
          name: String(player && player.name ? player.name : '?'),
          role: player && player.role === 'impostor' ? 'impostor' : 'civil',
          word: player && player.word != null ? String(player.word) : null,
          alive: !player || player.alive !== false
        };
      });
      return {
        id: String(entry.id || ('g' + entry.endedAt)),
        endedAt: entry.endedAt,
        startedAt: Number.isFinite(entry.startedAt) ? entry.startedAt : entry.endedAt,
        winner: entry.winner,
        mode: entry.mode === 'blind' ? 'blind' : 'undercover',
        rounds: Math.max(1, parseInt(entry.rounds, 10) || 1),
        debateTime: parseInt(entry.debateTime, 10) || 90,
        civilWord: String(entry.civilWord || '—'),
        impostorWord: entry.impostorWord == null ? null : String(entry.impostorWord),
        survivors: players.filter(function (player) { return player.alive; }).length,
        players: players
      };
    }).sort(function (a, b) {
      return b.endedAt - a.endedAt;
    }).slice(0, 50);
  })();

  var savedSetup = load(STORAGE.setup, {}) || {};
  var defaultNames = [];
  for (var n = 1; n <= 12; n += 1) defaultNames.push('Jugador ' + n);

  var setup = {
    count: clamp(parseInt(savedSetup.count, 10) || 6, 3, 12),
    names: defaultNames.map(function (fallback, index) {
      var value = savedSetup.names && savedSetup.names[index];
      return String(value || fallback).slice(0, 14);
    }),
    mode: savedSetup.mode === 'blind' ? 'blind' : 'undercover',
    debateTime: TIME_OPTIONS.indexOf(savedSetup.debateTime) >= 0 ? savedSetup.debateTime : 90,
    impostors: 1,
    categories: new Set()
  };

  function allCategories() {
    var keys = Object.keys(WORD_BANK);
    if (customPairs.length) keys.push('personalizado');
    return keys;
  }

  (function restoreCategories() {
    var valid = allCategories();
    var stored = Array.isArray(savedSetup.categories) ? savedSetup.categories : valid;
    stored.forEach(function (key) {
      if (valid.indexOf(key) >= 0) setup.categories.add(key);
    });
    if (!setup.categories.size) valid.forEach(function (key) { setup.categories.add(key); });
  })();

  setup.impostors = clamp(parseInt(savedSetup.impostors, 10) || 1, 1, maxImpostors(setup.count));

  var state = {
    screen: 'home',
    game: null,
    timerLoop: null,
    tallyTimer: null,
    hold: null
  };

  var deferredInstallPrompt = null;

  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
  }

  function persistSetup() {
    save(STORAGE.setup, {
      count: setup.count,
      names: setup.names,
      impostors: setup.impostors,
      mode: setup.mode,
      debateTime: setup.debateTime,
      categories: Array.from(setup.categories)
    });
  }

  function refreshSoundIcons() {
    document.querySelectorAll('[data-sound-icon]').forEach(function (el) {
      el.innerHTML = Sound.enabled ? ICONS.volume : ICONS.mute;
      el.setAttribute('aria-label', Sound.enabled ? 'Silenciar sonido' : 'Activar sonido');
    });
  }

  function soundButton() {
    return '<button type="button" data-action="toggle-sound" data-sound-icon class="icon-btn" aria-label="' +
      (Sound.enabled ? 'Silenciar sonido' : 'Activar sonido') + '">' +
      (Sound.enabled ? ICONS.volume : ICONS.mute) + '</button>';
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toastEl.classList.remove('is-show');
    }, 2300);
  }

  function renderHome() {
    var historyCount = historyEntries.length;
    appEl.innerHTML =
      '<section class="screen">' +
        '<header class="flex items-start justify-between gap-3 pt-1">' +
          '<div class="min-w-0 flex-1">' +
            '<p class="label text-cyan-300/70">Pass &amp; Play</p>' +
            '<h1 class="neon-title font-display text-[clamp(30px,10.5vw,42px)] font-black leading-[0.92] mt-2">EL<br>INFILTRADO</h1>' +
            '<p class="text-sm text-slate-400 mt-3 max-w-[280px]">Descubre al impostor antes de que te elimine.</p>' +
          '</div>' +
          '<div class="flex flex-none gap-2">' +
            '<button type="button" data-action="show-rules" class="icon-btn" aria-label="Cómo jugar">' + ICONS.help + '</button>' +
            soundButton() +
          '</div>' +
        '</header>' +

        '<div class="grid grid-cols-3 gap-2 mt-6">' +
          '<div class="card p-3 text-center">' +
            '<p class="font-display text-[18px] font-bold text-cyan-200">3–12</p>' +
            '<p class="mt-1 text-[9px] uppercase tracking-[0.16em] text-slate-500">Jugadores</p>' +
          '</div>' +
          '<div class="card p-3 text-center">' +
            '<p class="font-display text-[18px] font-bold text-pink-200">1–3</p>' +
            '<p class="mt-1 text-[9px] uppercase tracking-[0.16em] text-slate-500">Infiltrados</p>' +
          '</div>' +
          '<div class="card p-3 text-center">' +
            '<p class="font-display text-[18px] font-bold text-violet-200">2</p>' +
            '<p class="mt-1 text-[9px] uppercase tracking-[0.16em] text-slate-500">Modos</p>' +
          '</div>' +
        '</div>' +

        '<div class="flex-1 flex flex-col justify-center py-7">' +
          '<button type="button" data-action="new-game" class="btn-primary flex items-center justify-center gap-2">' +
            ICONS.play + ' NUEVA PARTIDA' +
          '</button>' +
          '<button type="button" data-action="open-history" class="btn-ghost mt-3 flex items-center justify-between gap-3 px-5">' +
            '<span class="flex items-center gap-2">' + ICONS.history + ' HISTORIAL DE PARTIDAS</span>' +
            (historyCount
              ? '<span class="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200">' + historyCount + '</span>'
              : '') +
          '</button>' +
          (!isStandalone()
            ? '<button type="button" data-action="install-app" class="mx-auto mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500">' +
                ICONS.install + ' Instalar como app' +
              '</button>'
            : '') +
        '</div>' +

        '<p class="text-center text-[10px] text-slate-600">Un solo dispositivo · Pasa el teléfono</p>' +
      '</section>';
  }

  function renderHistory() {
    var count = historyEntries.length;
    var cards = historyEntries.map(historyCardMarkup).join('');
    var emptyBlock =
      '<div class="card mt-7 p-8 text-center">' +
        '<div class="icon-btn mx-auto" style="width:56px;height:56px;border-radius:18px">' + ICONS.history + '</div>' +
        '<p class="font-display text-lg font-bold text-white mt-4">Todavía no hay partidas</p>' +
        '<p class="text-[12px] leading-relaxed text-slate-400 mt-2 max-w-[250px] mx-auto">Cuando terminéis una partida, se guardará aquí con el resultado y los roles.</p>' +
        '<button type="button" data-action="new-game" class="btn-primary mt-6">NUEVA PARTIDA</button>' +
      '</div>';

    appEl.innerHTML =
      '<section class="screen">' +
        '<div class="flex items-center justify-between gap-3">' +
          '<button type="button" data-action="go-home" class="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">' + ICONS.back + ' Inicio</button>' +
          soundButton() +
        '</div>' +
        '<header class="mt-5">' +
          '<p class="label text-cyan-300/70">Tus partidas</p>' +
          '<h1 class="font-display text-[30px] font-bold text-white leading-none mt-2">Historial</h1>' +
          '<p class="text-sm text-slate-400 mt-3">' +
            (count
              ? countLabel(count, 'partida guardada', 'partidas guardadas') + ' en este dispositivo.'
              : 'Aquí aparecerán las partidas terminadas.') +
          '</p>' +
        '</header>' +
        (count
          ? '<div class="flex items-center justify-between gap-3 mt-5">' +
              '<p class="label">Guardadas</p>' +
              '<button type="button" data-action="clear-history" class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-300/90">' + ICONS.trash + ' Borrar todo</button>' +
            '</div>' +
            '<div class="grid gap-3 mt-3">' + cards + '</div>'
          : emptyBlock) +
      '</section>';
  }

  function historyCardMarkup(entry) {
    var citizensWin = entry.winner === 'citizens';
    var modeLabel = entry.mode === 'blind' ? 'Ciego' : 'Undercover';
    var impostorWord = entry.impostorWord || 'Sin palabra';
    var playerTags = entry.players.map(function (player) {
      var isImpostor = player.role === 'impostor';
      return '<span class="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] ' +
        (isImpostor
          ? 'border-pink-400/25 bg-pink-400/[0.08] text-pink-100'
          : 'border-cyan-400/20 bg-cyan-400/[0.05] text-cyan-100') +
        '"><span class="h-1.5 w-1.5 rounded-full ' + (isImpostor ? 'bg-pink-400' : 'bg-cyan-400') + '"></span>' +
        escapeHtml(player.name) + '</span>';
    }).join('');

    return '<article class="card history-card ' + (citizensWin ? '' : 'is-impostors') + ' p-4">' +
      '<div class="flex items-start justify-between gap-3">' +
        '<div class="min-w-0">' +
          '<div class="flex flex-wrap items-center gap-2">' +
            '<span class="mini-badge ' + (citizensWin ? 'civil' : 'impostor') + '">' + (citizensWin ? 'Ciudadanos' : 'Infiltrados') + '</span>' +
            '<span class="text-[10px] uppercase tracking-[0.14em] text-slate-500">' + escapeHtml(formatHistoryDate(entry.endedAt)) + '</span>' +
          '</div>' +
          '<h2 class="font-display text-[18px] font-bold text-white mt-2">' +
            (citizensWin ? 'Victoria ciudadana' : 'Victoria infiltrada') +
          '</h2>' +
          '<p class="text-[11px] text-slate-500 mt-1">' +
            countLabel(entry.players.length, 'jugador', 'jugadores') + ' · ' +
            countLabel(entry.rounds, 'ronda', 'rondas') + ' · ' +
            countLabel(entry.survivors, 'superviviente', 'supervivientes') + ' · ' + modeLabel +
          '</p>' +
        '</div>' +
        '<button type="button" data-action="delete-history" data-id="' + escapeHtml(entry.id) + '" class="history-delete" aria-label="Borrar esta partida del historial">' + ICONS.trash + '</button>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2 mt-3">' +
        '<div class="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-2.5">' +
          '<p class="text-[8px] uppercase tracking-[0.16em] text-cyan-300/70">Ciudadanos</p>' +
          '<p class="font-display text-[12px] font-bold text-cyan-100 mt-1 break-words">' + escapeHtml(entry.civilWord) + '</p>' +
        '</div>' +
        '<div class="rounded-xl border border-pink-400/20 bg-pink-400/[0.06] p-2.5">' +
          '<p class="text-[8px] uppercase tracking-[0.16em] text-pink-300/70">Infiltrados</p>' +
          '<p class="font-display text-[12px] font-bold text-pink-100 mt-1 break-words">' + escapeHtml(impostorWord) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="flex flex-wrap gap-1.5 mt-3">' + playerTags + '</div>' +
    '</article>';
  }

  function renderSetup() {
    var maxImp = maxImpostors(setup.count);
    setup.impostors = clamp(setup.impostors, 1, maxImp);
    var cats = allCategories();
    var allSelected = cats.every(function (key) { return setup.categories.has(key); });

    var playerRows = '';
    for (var i = 0; i < setup.count; i += 1) {
      playerRows += '<label class="player-row">' +
        '<span class="avatar">' + (i + 1) + '</span>' +
        '<input type="text" data-player-index="' + i + '" maxlength="14" autocomplete="off" spellcheck="false" ' +
        'value="' + escapeHtml(setup.names[i] || '') + '" placeholder="Jugador ' + (i + 1) + '" ' +
        'aria-label="Nombre del jugador ' + (i + 1) + '">' +
        '</label>';
    }

    var impostorChips = '';
    for (var imp = 1; imp <= maxImp; imp += 1) {
      impostorChips += '<button type="button" class="chip ' + (setup.impostors === imp ? 'is-active' : '') + '" ' +
        'data-action="impostor" data-count="' + imp + '" style="--chip:var(--pink)" aria-pressed="' +
        (setup.impostors === imp) + '"><span class="chip-dot"></span>' + imp + ' ' +
        (imp === 1 ? 'infiltrado' : 'infiltrados') + '</button>';
    }

    var categoryChips = cats.map(function (key) {
      var meta = CATEGORY_META[key] || { label: key, color: '#22d3ee' };
      var active = setup.categories.has(key);
      return '<button type="button" class="chip ' + (active ? 'is-active' : '') + '" data-action="category" ' +
        'data-category="' + key + '" style="--chip:' + meta.color + '" aria-pressed="' + active + '">' +
        '<span class="chip-dot"></span>' + escapeHtml(meta.label) + '</button>';
    }).join('');

    var timeChips = TIME_OPTIONS.map(function (value) {
      return '<button type="button" class="chip ' + (setup.debateTime === value ? 'is-active' : '') + '" ' +
        'data-action="time" data-time="' + value + '" style="--chip:var(--violet)" aria-pressed="' +
        (setup.debateTime === value) + '"><span class="chip-dot"></span>' + timeLabel(value) + '</button>';
    }).join('');

    appEl.innerHTML =
      '<section class="screen">' +
        '<div class="flex items-center justify-between gap-3">' +
          '<button type="button" data-action="go-home" class="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">' + ICONS.back + ' Inicio</button>' +
          '<div class="flex gap-2">' +
            '<button type="button" data-action="show-rules" class="icon-btn" aria-label="Cómo jugar">' + ICONS.help + '</button>' +
            soundButton() +
          '</div>' +
        '</div>' +
        '<header class="mt-3">' +
          '<p class="label text-cyan-300/70">Nueva partida</p>' +
          '<h1 class="neon-title font-display text-[clamp(28px,8vw,34px)] font-black leading-none mt-1">EL INFILTRADO</h1>' +
        '</header>' +

        '<div class="flex-1 min-h-0 overflow-y-auto scroll-thin mt-4">' +

          '<div class="card p-3">' +
            '<div class="flex items-center justify-between gap-3">' +
              '<div><p class="label">Jugadores</p><p class="hint mt-0.5">De 3 a 12</p></div>' +
              '<div class="flex items-center gap-2">' +
                '<button type="button" data-action="player-dec" class="stepper" ' + (setup.count <= 3 ? 'disabled' : '') + ' aria-label="Quitar jugador">&minus;</button>' +
                '<span class="font-display text-2xl font-bold text-white tabular-nums w-7 text-center">' + setup.count + '</span>' +
                '<button type="button" data-action="player-inc" class="stepper" ' + (setup.count >= 12 ? 'disabled' : '') + ' aria-label="Añadir jugador">+</button>' +
              '</div>' +
            '</div>' +
            '<div class="grid gap-1.5 mt-3">' + playerRows + '</div>' +
          '</div>' +

          '<div class="card mt-3 p-3">' +
            '<div class="flex items-center justify-between gap-3">' +
              '<p class="label">Infiltrados</p>' +
              '<p class="hint">Máximo ' + maxImp + '</p>' +
            '</div>' +
            '<div class="flex flex-wrap gap-2 mt-2">' + impostorChips + '</div>' +
            '<div class="h-px bg-white/10 my-3"></div>' +
            '<p class="label">Modo de juego</p>' +
            '<div class="grid grid-cols-2 gap-2 mt-2">' +
              '<button type="button" class="mode-card ' + (setup.mode === 'undercover' ? 'is-active' : '') + '" data-action="mode" data-mode="undercover" aria-pressed="' + (setup.mode === 'undercover') + '">' +
                '<span class="font-display text-[12px] font-bold tracking-wide text-white">UNDERCOVER</span>' +
                '<span class="text-[10px] leading-snug text-slate-400 mt-1">Palabra parecida para infiltrados.</span>' +
              '</button>' +
              '<button type="button" class="mode-card ' + (setup.mode === 'blind' ? 'is-active' : '') + '" data-action="mode" data-mode="blind" aria-pressed="' + (setup.mode === 'blind') + '">' +
                '<span class="font-display text-[12px] font-bold tracking-wide text-white">CIEGO</span>' +
                '<span class="text-[10px] leading-snug text-slate-400 mt-1">Sin palabra para infiltrados.</span>' +
              '</button>' +
            '</div>' +
            '<div class="h-px bg-white/10 my-3"></div>' +
            '<p class="label">Tiempo de debate</p>' +
            '<div class="flex flex-wrap gap-2 mt-2">' + timeChips + '</div>' +
          '</div>' +

          '<div class="card mt-3 p-3 mb-1">' +
            '<div class="flex items-center justify-between">' +
              '<p class="label">Categorías</p>' +
              '<button type="button" data-action="all-categories" class="text-[11px] font-semibold text-cyan-300/80">' +
                (allSelected ? 'Quitar todas' : 'Todas') +
              '</button>' +
            '</div>' +
            '<div class="flex flex-wrap gap-2 mt-2">' + categoryChips + '</div>' +
            '<button type="button" data-action="open-custom" class="mt-3 w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-2.5 text-[12px] font-semibold text-slate-300 active:scale-[0.99]">' +
              '+ Añadir palabras personalizadas' +
            '</button>' +
          '</div>' +

        '</div>' +

        '<div class="pt-3 mt-2 border-t border-white/10">' +
          '<button type="button" data-action="start-game" class="btn-primary">COMENZAR PARTIDA</button>' +
        '</div>' +
      '</section>';
  }

  function renderRevealPass() {
    var game = state.game;
    if (!game) return;
    var player = game.players[game.revealIndex];
    if (!player) return;
    var progress = (game.revealIndex / game.players.length) * 100;

    appEl.innerHTML =
      '<section class="screen screen-fit">' +
        '<header class="flex items-center justify-between gap-3">' +
          '<button type="button" data-action="quit" class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Salir</button>' +
          '<p class="label">Reparto de roles</p>' +
          soundButton() +
        '</header>' +
        '<div class="mt-4">' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + progress + '%"></div></div>' +
          '<div class="flex items-center justify-between mt-2">' +
            '<p class="text-[11px] text-slate-500">Jugador ' + (game.revealIndex + 1) + ' de ' + game.players.length + '</p>' +
            '<p class="text-[11px] text-cyan-300/70">' + Math.round(progress) + '%</p>' +
          '</div>' +
        '</div>' +
        '<div class="flex-1 min-h-0 flex flex-col items-center justify-center py-2 text-center">' +
          '<div class="h-20 w-20 rounded-3xl grid place-items-center font-display text-2xl font-black text-[#061018]" style="background:linear-gradient(135deg,#22d3ee,#a3e635);box-shadow:0 0 40px -10px rgba(34,211,238,.8)">' + initials(player.name) + '</div>' +
          '<p class="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-4">Pasa el teléfono a</p>' +
          '<h2 class="font-display text-[clamp(36px,11vw,54px)] font-bold text-white mt-1 mb-2 text-center break-words max-w-full leading-[1.05]">' + escapeHtml(player.name) + '</h2>' +
          '<p class="text-[13px] text-slate-400 max-w-[280px]">Cuando ' + escapeHtml(player.name) + ' tenga el móvil en sus manos, confirma para ver la palabra en privado.</p>' +
          '<div class="card mt-4 p-3 w-full">' +
            '<div class="flex items-center gap-3 text-left">' +
              '<div class="icon-btn" style="pointer-events:none">' + ICONS.lock + '</div>' +
              '<div>' +
                '<p class="text-[12px] font-semibold text-slate-200">La palabra sigue oculta</p>' +
                '<p class="text-[11px] text-slate-500 mt-0.5">No pases el móvil a nadie más hasta terminar.</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button type="button" data-action="confirm-reveal" class="btn-primary w-full mb-2">CONFIRMAR Y VER PALABRA</button>' +
      '</section>';
  }

  function renderReveal() {
    var game = state.game;
    if (!game) return;
    var player = game.players[game.revealIndex];
    if (!player) return;
    var isImpostor = player.role === 'impostor';
    var blind = game.mode === 'blind';
    var seen = player.seen;
    var progress = ((game.revealIndex + (seen ? 1 : 0)) / game.players.length) * 100;
    var word = isImpostor && blind ? 'SIN PALABRA' : player.word;
    var subtitle = isImpostor
      ? (blind
        ? 'No conoces la palabra. Escucha, improvisa y no te descubran.'
        : 'Tu palabra es parecida. No la digas tal cual.')
      : 'Describe tu palabra sin decirla y descubre al infiltrado.';
    var badge = isImpostor
      ? '<span class="role-badge impostor">INFILTRADO</span>'
      : '<span class="role-badge civil">CIUDADANO</span>';
    var nextBlock = seen
      ? '<button type="button" data-action="next-reveal" class="btn-primary mt-5">' +
          (game.revealIndex === game.players.length - 1 ? 'EMPEZAR DEBATE' : 'SIGUIENTE JUGADOR') +
        '</button>'
      : '<p class="text-[11px] text-slate-500 text-center mt-5">Mantén pulsado para desbloquear</p>';

    appEl.innerHTML =
      '<section class="screen screen-fit">' +
        '<header class="flex items-center justify-between gap-3">' +
          '<button type="button" data-action="quit" class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Salir</button>' +
          '<p class="label">Reparto de roles</p>' +
          soundButton() +
        '</header>' +
        '<div class="mt-4">' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + progress + '%"></div></div>' +
          '<div class="flex items-center justify-between mt-2">' +
            '<p class="text-[11px] text-slate-500">Jugador ' + (game.revealIndex + 1) + ' de ' + game.players.length + '</p>' +
            '<p class="text-[11px] text-cyan-300/70">' + Math.round(progress) + '%</p>' +
          '</div>' +
        '</div>' +
        '<div class="flex-1 min-h-0 flex flex-col items-center justify-center py-1">' +
          '<p class="text-[10px] uppercase tracking-[0.3em] text-slate-500">Ahora es el turno de</p>' +
          '<h2 class="font-display text-[clamp(34px,10.5vw,50px)] font-bold text-white mt-1 mb-3 text-center break-words max-w-full leading-[1.05]">' + escapeHtml(player.name) + '</h2>' +
          '<div class="role-shell">' +
            '<div class="role-card ' + (isImpostor ? 'is-impostor' : 'is-civil') + '" id="role-card">' +
              '<div class="role-hint">' +
                '<div class="icon-btn" style="pointer-events:none">' + ICONS.lock + '</div>' +
                '<p class="text-sm font-semibold text-slate-200">Palabra oculta</p>' +
                '<p class="text-[11px] text-slate-500 max-w-[210px]">Mantén pulsado el botón para verla en privado.</p>' +
              '</div>' +
              '<div class="secret" id="role-secret" hidden>' +
                badge +
                '<p class="text-[9px] uppercase tracking-[0.3em] text-slate-500 mt-3">' + (isImpostor && blind ? 'Tu rol' : 'Tu palabra') + '</p>' +
                '<p class="font-display font-black leading-[1.04] mt-1 break-words max-w-[260px] ' +
                  (isImpostor ? 'text-pink-200' : 'text-cyan-200') + ' ' +
                  (String(word).length > 14 ? 'text-[26px]' : 'text-[34px]') + '" ' +
                  'style="text-shadow:0 0 26px ' + (isImpostor ? 'rgba(244,114,182,.55)' : 'rgba(34,211,238,.5)') + '">' +
                  escapeHtml(word) +
                '</p>' +
                '<p class="text-[11px] leading-snug text-slate-400 mt-3 max-w-[240px]">' + subtitle + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="hold-btn mt-4" data-hold="1" aria-label="Mantén pulsado para ver tu palabra">' +
            '<span class="hold-inner">' + ICONS.eye + '<span id="hold-label">MANTÉN PULSADO</span></span>' +
          '</button>' +
          '<p class="text-[11px] text-slate-500 text-center mt-3 max-w-[240px]">Al soltar, la palabra se oculta al instante.</p>' +
        '</div>' +
        nextBlock +
      '</section>';
  }

  function renderDebate() {
    var game = state.game;
    if (!game) return;
    var alive = game.players.filter(function (p) { return p.alive; });
    var order = game.speakingOrder.map(function (id) {
      return game.players.find(function (p) { return p.id === id; });
    }).filter(Boolean);

    var orderPills = order.map(function (player, index) {
      return '<span class="order-pill"><span class="order-num">' + (index + 1) + '</span>' +
        '<span class="truncate">' + escapeHtml(player.name) + '</span></span>';
    }).join('');

    appEl.innerHTML =
      '<section class="screen">' +
        '<header class="flex items-start justify-between gap-3">' +
          '<div>' +
            '<p class="label text-cyan-300/70">Ronda ' + game.round + '</p>' +
            '<h1 class="font-display text-[28px] font-bold text-white leading-none mt-2">Debate</h1>' +
          '</div>' +
          '<div class="flex gap-2">' +
            '<button type="button" data-action="quit" class="icon-btn" aria-label="Salir de la partida">' + ICONS.close + '</button>' +
            soundButton() +
          '</div>' +
        '</header>' +
        '<div class="card mt-5 p-4">' +
          '<div class="flex items-center justify-between">' +
            '<p class="label">Orden de palabra</p>' +
            '<p class="text-[10px] uppercase tracking-widest text-slate-500">' + alive.length + ' en juego</p>' +
          '</div>' +
          '<div class="flex flex-wrap gap-2 mt-3">' + orderPills + '</div>' +
        '</div>' +
        '<div class="flex-1 flex flex-col items-center justify-center py-5">' +
          '<div class="timer-wrap" id="timer-wrap">' +
            '<svg class="timer-svg" viewBox="0 0 240 240" aria-hidden="true">' +
              '<defs><linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">' +
                '<stop offset="0%" stop-color="#22d3ee"/><stop offset="55%" stop-color="#a3e635"/><stop offset="100%" stop-color="#a78bfa"/>' +
              '</linearGradient></defs>' +
              '<circle class="timer-track" cx="120" cy="120" r="104"/>' +
              '<circle class="timer-progress" id="timer-ring" cx="120" cy="120" r="104" transform="rotate(-90 120 120)"/>' +
            '</svg>' +
            '<div class="timer-center">' +
              '<p id="timer-time" class="font-display text-[46px] font-bold text-white tabular-nums leading-none">' + formatTime(game.timer.remaining) + '</p>' +
              '<p id="timer-state" class="text-[9px] uppercase tracking-[0.26em] text-slate-500 mt-2">Listo</p>' +
            '</div>' +
          '</div>' +
          '<div class="flex items-center justify-center gap-3 mt-5">' +
            '<button type="button" data-action="timer-add" class="timer-btn" aria-label="Añadir 30 segundos">+30s</button>' +
            '<button type="button" data-action="timer-toggle" id="timer-toggle" class="timer-btn is-primary" aria-label="Iniciar temporizador">' + ICONS.play + '</button>' +
            '<button type="button" data-action="timer-reset" class="timer-btn" aria-label="Reiniciar temporizador">' + ICONS.reset + '</button>' +
          '</div>' +
          '<p class="text-[11px] text-slate-500 mt-4 text-center max-w-[250px]">Da pistas sin decir la palabra. El infiltrado intentará pasar desapercibido.</p>' +
        '</div>' +
        '<button type="button" data-action="go-vote" class="btn-primary mb-2">IR A VOTACIÓN</button>' +
      '</section>';

    updateTimerUI();
    if (game.timer.running) startTimerLoop();
  }

  function aliveVoters() {
    return state.game.players.filter(function (p) { return p.alive; });
  }

  function renderVotePass() {
    var game = state.game;
    if (!game) return;
    var voters = aliveVoters();
    var voter = voters[game.voteTurn];
    if (!voter) return;

    appEl.innerHTML =
      '<section class="screen">' +
        '<header class="flex items-start justify-between gap-3">' +
          '<div><p class="label text-pink-300/70">Ronda ' + game.round + '</p>' +
            '<h1 class="font-display text-[28px] font-bold text-white leading-none mt-2">Votación</h1></div>' +
          soundButton() +
        '</header>' +
        '<div class="flex-1 flex flex-col items-center justify-center py-6 text-center">' +
          '<p class="text-[10px] uppercase tracking-[0.3em] text-slate-500">Voto secreto · ' + (game.voteTurn + 1) + ' de ' + voters.length + '</p>' +
          '<div class="mt-6 h-16 w-16 rounded-2xl grid place-items-center font-display text-xl font-bold text-[#061018]" style="background:linear-gradient(135deg,#f472b6,#a78bfa);box-shadow:0 0 36px -8px rgba(244,114,182,.8)">' + initials(voter.name) + '</div>' +
          '<h2 class="font-display text-[28px] font-bold text-white mt-4 break-words max-w-full">' + escapeHtml(voter.name) + '</h2>' +
          '<p class="text-sm text-slate-400 mt-2 max-w-[280px]">Pasa el teléfono. Nadie más debería ver esta pantalla.</p>' +
          '<div class="card mt-7 p-4 w-full">' +
            '<p class="text-[10px] uppercase tracking-[0.25em] text-slate-500">Voto privado</p>' +
            '<p class="text-[13px] text-slate-300 mt-2">Selecciona a quien crees que es el infiltrado.</p>' +
          '</div>' +
          '<button type="button" data-action="vote-ready" class="btn-primary mt-7 w-full">VOTAR EN PRIVADO</button>' +
        '</div>' +
      '</section>';
  }

  function renderVoteSelect() {
    var game = state.game;
    if (!game) return;
    var voters = aliveVoters();
    var voter = voters[game.voteTurn];
    if (!voter) return;
    var suspects = game.players.filter(function (p) {
      return p.alive && p.id !== voter.id;
    });
    var selected = game.voteChoice;

    var grid = suspects.map(function (player) {
      var isSelected = selected === player.id;
      return '<button type="button" class="suspect ' + (isSelected ? 'is-selected' : '') + '" data-action="select-suspect" data-id="' + player.id + '" aria-pressed="' + isSelected + '">' +
        '<span class="avatar">' + initials(player.name) + '</span>' +
        '<span class="min-w-0 flex-1"><span class="block text-sm font-semibold truncate">' + escapeHtml(player.name) + '</span>' +
        '<span class="block text-[10px] text-slate-500">' + (isSelected ? 'Sospechoso seleccionado' : 'Seleccionar') + '</span></span>' +
      '</button>';
    }).join('');

    appEl.innerHTML =
      '<section class="screen">' +
        '<header class="flex items-center justify-between gap-3">' +
          '<button type="button" data-action="quit-vote" class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Salir</button>' +
          '<p class="label">Voto de ' + escapeHtml(voter.name) + '</p>' +
          soundButton() +
        '</header>' +
        '<div class="mt-6">' +
          '<p class="text-[10px] uppercase tracking-[0.3em] text-slate-500">¿Quién es el infiltrado?</p>' +
          '<h1 class="font-display text-[26px] font-bold text-white mt-2">Elige un sospechoso</h1>' +
          '<p class="text-[12px] text-slate-500 mt-2">Tu voto es secreto. Elige bien.</p>' +
        '</div>' +
        '<div class="grid grid-cols-1 gap-2 mt-5">' + grid + '</div>' +
        '<div class="flex-1"></div>' +
        '<button type="button" data-action="confirm-vote" class="btn-primary mt-4 mb-2" ' + (selected ? '' : 'disabled') + '>CONFIRMAR VOTO</button>' +
      '</section>';
  }

  function renderTally() {
    var game = state.game;
    if (!game) return;
    appEl.innerHTML =
      '<section class="screen">' +
        '<header class="flex items-center justify-between gap-3">' +
          '<p class="label text-pink-300/70">Ronda ' + game.round + '</p>' +
          soundButton() +
        '</header>' +
        '<div class="flex-1 flex flex-col items-center justify-center text-center py-8">' +
          '<div class="loader-dots"><span></span><span></span><span></span></div>' +
          '<h1 class="font-display text-[34px] font-bold text-white mt-8 danger-text">CONTANDO VOTOS</h1>' +
          '<p class="text-sm text-slate-400 mt-3 max-w-[260px]">El grupo ha hablado. Que no tiemble nadie...</p>' +
        '</div>' +
      '</section>';
  }

  function renderElimination() {
    var game = state.game;
    var elim = game.lastEliminated;
    if (!elim) return;
    var isImpostor = elim.role === 'impostor';
    var winner = game.winner;

    appEl.innerHTML =
      '<section class="screen">' +
        '<header class="flex items-center justify-between gap-3">' +
          '<p class="label text-rose-300/70">Ronda ' + game.round + '</p>' +
          soundButton() +
        '</header>' +
        '<div class="flex-1 flex flex-col items-center justify-center py-5 text-center">' +
          '<p class="text-[10px] uppercase tracking-[0.32em] text-slate-500">Veredicto del grupo</p>' +
          '<h1 class="font-display text-[42px] font-black text-rose-300 danger-text mt-2 leading-none">ELIMINADO</h1>' +
          '<div class="card elimination-card mt-6 p-6 w-full" style="border-color:' + (isImpostor ? 'rgba(244,114,182,.55)' : 'rgba(34,211,238,.45)') + '">' +
            '<div class="h-16 w-16 rounded-2xl grid place-items-center mx-auto font-display text-xl font-bold text-[#061018]" style="background:linear-gradient(135deg,' + (isImpostor ? '#f472b6,#a78bfa' : '#22d3ee,#a3e635') + ');box-shadow:0 0 36px -8px ' + (isImpostor ? 'rgba(244,114,182,.8)' : 'rgba(34,211,238,.8)') + '">' + initials(elim.name) + '</div>' +
            '<h2 class="font-display text-[26px] font-bold text-white mt-4 break-words">' + escapeHtml(elim.name) + '</h2>' +
            '<span class="mini-badge ' + (isImpostor ? 'impostor' : 'civil') + ' mt-2 inline-flex">' + (isImpostor ? 'Infiltrado' : 'Ciudadano') + '</span>' +
            '<p class="text-[11px] text-slate-500 mt-3">Eliminado con ' + elim.votes + ' ' + (elim.votes === 1 ? 'voto' : 'votos') + '</p>' +
            '<div class="h-px bg-white/10 my-4"></div>' +
            '<p class="text-[9px] uppercase tracking-[0.28em] text-slate-500">Rol revelado</p>' +
            '<p class="font-display text-[17px] font-bold mt-2 break-words ' + (isImpostor ? 'text-pink-200' : 'text-cyan-200') + '">' + (isImpostor ? 'EL GRUPO ACIERTA' : 'EL GRUPO SE EQUIVOCA') + '</p>' +
            '<p class="text-[12px] text-slate-400 mt-2 leading-snug">' + (isImpostor ? '¡Habéis desenmascarado a un infiltrado!' : 'Era un ciudadano inocente... los infiltrados respiran tranquilos.') + '</p>' +
          '</div>' +
        '</div>' +
        '<button type="button" data-action="after-elimination" class="btn-primary mb-2">' + (winner ? 'VER RESULTADOS' : 'SIGUIENTE RONDA') + '</button>' +
      '</section>';
  }

  function renderTie() {
    var game = state.game;
    var tie = game.tie || { names: [], votes: 0 };
    var names = tie.names.map(function (name) {
      return '<span class="order-pill"><span class="truncate">' + escapeHtml(name) + '</span></span>';
    }).join('');

    appEl.innerHTML =
      '<section class="screen">' +
        '<header class="flex items-center justify-between gap-3">' +
          '<p class="label text-amber-300/70">Ronda ' + game.round + '</p>' +
          soundButton() +
        '</header>' +
        '<div class="flex-1 flex flex-col items-center justify-center py-6 text-center">' +
          '<p class="text-[10px] uppercase tracking-[0.32em] text-slate-500">Votos empatados</p>' +
          '<h1 class="font-display text-[46px] font-black text-amber-300 mt-2 leading-none" style="text-shadow:0 0 34px rgba(251,191,36,.55)">EMPATE</h1>' +
          '<p class="text-sm text-slate-400 mt-4 max-w-[270px]">Nadie será eliminado en esta ronda. El debate continúa.</p>' +
          '<div class="card mt-6 p-4 w-full">' +
            '<p class="label">Sospechosos igualados</p>' +
            '<p class="text-[12px] text-slate-400 mt-2">' + tie.votes + ' votos cada uno</p>' +
            '<div class="flex flex-wrap justify-center gap-2 mt-3">' + names + '</div>' +
          '</div>' +
        '</div>' +
        '<button type="button" data-action="next-round" class="btn-primary mb-2">SIGUIENTE RONDA</button>' +
      '</section>';
  }

  function confettiMarkup(winner) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return '';
    var palette = winner === 'citizens'
      ? ['#22d3ee', '#a3e635', '#a78bfa', '#ffffff', '#67e8f9']
      : ['#f472b6', '#fb7185', '#a78bfa', '#facc15', '#fda4af'];
    var pieces = '';
    for (var i = 0; i < 38; i += 1) {
      var left = Math.random() * 100;
      var delay = Math.random() * 2.2;
      var duration = 2.4 + Math.random() * 2.2;
      var width = 5 + Math.random() * 6;
      var height = width * (1.4 + Math.random());
      pieces += '<span style="left:' + left.toFixed(2) + '%;background:' + pick(palette) + ';animation-delay:' + delay.toFixed(2) + 's;animation-duration:' + duration.toFixed(2) + 's;width:' + width.toFixed(1) + 'px;height:' + height.toFixed(1) + 'px"></span>';
    }
    return '<div class="confetti">' + pieces + '</div>';
  }

  function renderResults() {
    var game = state.game;
    if (!game) return;
    var citizensWin = game.winner === 'citizens';
    var alive = game.players.filter(function (p) { return p.alive; }).length;
    var impWord = game.impostorWord || (game.mode === 'blind' ? 'Sin palabra' : '—');

    var rows = game.players.map(function (player) {
      var isImpostor = player.role === 'impostor';
      var word = isImpostor && game.mode === 'blind' ? 'Sin palabra' : player.word;
      return '<div class="reveal-row ' + (isImpostor ? 'impostor' : '') + ' ' + (player.alive ? '' : 'dead') + '">' +
        '<span class="avatar">' + initials(player.name) + '</span>' +
        '<div class="min-w-0 flex-1">' +
          '<p class="text-sm font-semibold text-slate-100 truncate">' + escapeHtml(player.name) + '</p>' +
          '<p class="text-[10px] text-slate-500 truncate">' + escapeHtml(word) + (player.alive ? '' : ' · Eliminado') + '</p>' +
        '</div>' +
        '<span class="mini-badge ' + (isImpostor ? 'impostor' : 'civil') + '">' + (isImpostor ? 'Infiltrado' : 'Ciudadano') + '</span>' +
      '</div>';
    }).join('');

    appEl.innerHTML =
      '<section class="screen">' +
        '<header class="flex items-center justify-between gap-3">' +
          '<p class="label text-slate-400">Fin de la partida</p>' +
          '<div class="flex gap-2">' +
            '<button type="button" data-action="go-home" class="icon-btn" aria-label="Volver al inicio">' + ICONS.home + '</button>' +
            soundButton() +
          '</div>' +
        '</header>' +
        '<div class="result-banner ' + (citizensWin ? 'citizens' : 'impostors') + ' mt-4">' +
          confettiMarkup(game.winner) +
          '<div class="relative z-10">' +
            '<p class="text-[10px] uppercase tracking-[0.32em] text-slate-400">' + (citizensWin ? 'Victoria ciudadana' : 'Victoria infiltrada') + '</p>' +
            '<h1 class="font-display text-[34px] font-black mt-2 leading-[1.05] ' + (citizensWin ? 'neon-title' : 'neon-pink') + '">' +
              (citizensWin ? 'GANAN LOS<br>CIUDADANOS' : 'GANAN LOS<br>INFILTRADOS') +
            '</h1>' +
            '<p class="text-sm text-slate-400 mt-3 max-w-[280px] mx-auto">' +
              (citizensWin ? 'Habéis desenmascarado a todos los infiltrados.' : 'Los infiltrados han tomado el control de la partida.') +
            '</p>' +
            '<div class="grid grid-cols-2 gap-2 mt-5 text-left">' +
              '<div class="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-3">' +
                '<p class="text-[9px] uppercase tracking-[0.2em] text-cyan-300/70">Ciudadanos</p>' +
                '<p class="font-display text-[13px] font-bold text-cyan-100 mt-1 break-words">' + escapeHtml(game.civilWord) + '</p>' +
              '</div>' +
              '<div class="rounded-xl border border-pink-400/20 bg-pink-400/[0.06] p-3">' +
                '<p class="text-[9px] uppercase tracking-[0.2em] text-pink-300/70">Infiltrados</p>' +
                '<p class="font-display text-[13px] font-bold text-pink-100 mt-1 break-words">' + escapeHtml(impWord) + '</p>' +
              '</div>' +
            '</div>' +
            '<p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-4">' + game.round + ' ' + (game.round === 1 ? 'ronda' : 'rondas') + ' · ' + alive + ' supervivientes</p>' +
          '</div>' +
        '</div>' +
        '<div class="card mt-4 p-4">' +
          '<p class="label">Todos los roles</p>' +
          '<div class="grid gap-2 mt-3">' + rows + '</div>' +
        '</div>' +
        '<div class="mt-5 mb-4 grid gap-2">' +
          '<button type="button" data-action="rematch" class="btn-primary">REVANCHA RÁPIDA</button>' +
          '<button type="button" data-action="open-custom" class="btn-ghost">Añadir más palabras</button>' +
          '<button type="button" data-action="new-game" class="btn-ghost">Nueva partida</button>' +
        '</div>' +
      '</section>';
  }

  function getSelectedPairs() {
    var pairs = [];
    setup.categories.forEach(function (key) {
      if (key === 'personalizado') {
        customPairs.forEach(function (pair) { pairs.push([pair.a, pair.b]); });
      } else if (WORD_BANK[key]) {
        WORD_BANK[key].forEach(function (pair) { pairs.push(pair); });
      }
    });
    return pairs;
  }

  function startGame() {
    var pairs = getSelectedPairs();
    if (!pairs.length) {
      toast('Selecciona al menos una categoría con palabras');
      return;
    }
    clearTimeout(state.tallyTimer);
    stopTimerLoop();
    setup.names = setup.names.slice(0, 12).map(function (name, index) {
      return (String(name || '').trim() || ('Jugador ' + (index + 1))).slice(0, 14);
    });
    persistSetup();

    var pair = pick(pairs);
    var civilWord;
    var impostorWord;
    if (setup.mode === 'blind') {
      civilWord = Math.random() < 0.5 ? pair[0] : pair[1];
      impostorWord = null;
    } else if (Math.random() < 0.5) {
      civilWord = pair[0];
      impostorWord = pair[1];
    } else {
      civilWord = pair[1];
      impostorWord = pair[0];
    }

    var playerNames = [];
    for (var i = 0; i < setup.count; i += 1) {
      playerNames.push((String(setup.names[i] || '').trim() || ('Jugador ' + (i + 1))).slice(0, 14));
    }

    var indices = [];
    for (var j = 0; j < setup.count; j += 1) indices.push(j);
    var impostorSlots = new Set(shuffle(indices).slice(0, setup.impostors));

    var players = playerNames.map(function (name, index) {
      var isImpostor = impostorSlots.has(index);
      return {
        id: 'p' + index,
        name: name,
        role: isImpostor ? 'impostor' : 'civil',
        word: isImpostor ? impostorWord : civilWord,
        alive: true,
        seen: false
      };
    });

    state.game = {
      players: players,
      civilWord: civilWord,
      impostorWord: impostorWord,
      mode: setup.mode,
      round: 1,
      revealIndex: 0,
      speakingOrder: [],
      votes: {},
      voteTurn: 0,
      voteChoice: null,
      winner: null,
      lastEliminated: null,
      tie: null,
      startedAt: Date.now(),
      recorded: false,
      debateTime: setup.debateTime,
      timer: {
        base: setup.debateTime,
        max: setup.debateTime,
        remaining: setup.debateTime,
        running: false,
        endAt: 0,
        lastTick: null
      }
    };

    setScreen('reveal');
    Sound.start();
  }

  function beginDebate() {
    var game = state.game;
    game.speakingOrder = shuffle(game.players.filter(function (p) { return p.alive; }).map(function (p) { return p.id; }));
    game.timer = {
      base: game.debateTime,
      max: game.debateTime,
      remaining: game.debateTime,
      running: false,
      endAt: 0,
      lastTick: null
    };
    setScreen('debate');
  }

  function beginVoting() {
    var game = state.game;
    if (game.timer.running) pauseTimer();
    stopTimerLoop();
    game.votes = {};
    game.voteTurn = 0;
    game.voteChoice = null;
    setScreen('vote-pass');
  }

  function confirmVote() {
    var game = state.game;
    var voters = aliveVoters();
    var voter = voters[game.voteTurn];
    if (!voter || !game.voteChoice) return;
    game.votes[voter.id] = game.voteChoice;
    game.voteTurn += 1;
    game.voteChoice = null;
    Sound.vote();
    if (game.voteTurn >= voters.length) {
      finishVoting();
    } else {
      setScreen('vote-pass');
    }
  }

  function finishVoting() {
    setScreen('tally');
    Sound.suspense();
    clearTimeout(state.tallyTimer);
    state.tallyTimer = setTimeout(performTally, 1500);
  }

  function performTally() {
    state.tallyTimer = null;
    var game = state.game;
    if (!game || state.screen !== 'tally') return;
    var alive = game.players.filter(function (p) { return p.alive; });
    var counts = new Map();
    alive.forEach(function (player) {
      var suspect = game.votes[player.id];
      if (suspect) counts.set(suspect, (counts.get(suspect) || 0) + 1);
    });
    var ranked = Array.from(counts.entries()).sort(function (a, b) { return b[1] - a[1]; });

    if (!ranked.length) {
      game.tie = { names: [], votes: 0 };
      setScreen('tie');
      return;
    }

    var topVotes = ranked[0][1];
    var tied = ranked.filter(function (entry) { return entry[1] === topVotes; }).map(function (entry) { return entry[0]; });

    if (tied.length > 1) {
      game.tie = {
        names: tied.map(function (id) {
          var found = game.players.find(function (p) { return p.id === id; });
          return found ? found.name : '?';
        }),
        votes: topVotes
      };
      setScreen('tie');
      Sound.suspense();
      return;
    }

    var eliminated = game.players.find(function (p) { return p.id === ranked[0][0]; });
    if (!eliminated) return;
    eliminated.alive = false;
    game.lastEliminated = {
      id: eliminated.id,
      name: eliminated.name,
      role: eliminated.role,
      word: eliminated.word,
      votes: topVotes,
      round: game.round
    };
    game.winner = computeWinner(game);
    if (game.winner) recordFinishedGame(game);
    setScreen('elimination');
    Sound.eliminate(eliminated.role === 'impostor');
    vibrate([40, 40, 80]);
  }

  function computeWinner(game) {
    var alive = game.players.filter(function (p) { return p.alive; });
    var impostors = alive.filter(function (p) { return p.role === 'impostor'; }).length;
    var citizens = alive.length - impostors;
    if (impostors === 0) return 'citizens';
    if (impostors >= citizens) return 'impostors';
    return null;
  }

  function recordFinishedGame(game) {
    if (!game || game.recorded || !game.winner) return;
    game.recorded = true;
    var entry = {
      id: 'g' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      endedAt: Date.now(),
      startedAt: game.startedAt || Date.now(),
      winner: game.winner,
      mode: game.mode,
      rounds: game.round,
      debateTime: game.debateTime,
      civilWord: game.civilWord,
      impostorWord: game.impostorWord,
      survivors: game.players.filter(function (p) { return p.alive; }).length,
      players: game.players.map(function (p) {
        return { name: p.name, role: p.role, word: p.word, alive: p.alive };
      })
    };
    historyEntries.unshift(entry);
    historyEntries = historyEntries.slice(0, 50);
    save(STORAGE.history, historyEntries);
  }

  function nextRound() {
    var game = state.game;
    game.round += 1;
    game.votes = {};
    game.voteTurn = 0;
    game.voteChoice = null;
    game.tie = null;
    game.lastEliminated = null;
    game.timer = {
      base: game.debateTime,
      max: game.debateTime,
      remaining: game.debateTime,
      running: false,
      endAt: 0,
      lastTick: null
    };
    game.speakingOrder = shuffle(game.players.filter(function (p) { return p.alive; }).map(function (p) { return p.id; }));
    setScreen('debate');
  }

  function afterElimination() {
    var game = state.game;
    if (!game) return;
    if (game.winner) {
      setScreen('results');
      Sound.result(game.winner);
    } else {
      nextRound();
    }
  }

  function quitGame() {
    clearTimeout(state.tallyTimer);
    state.tallyTimer = null;
    stopTimerLoop();
    state.game = null;
    state.hold = null;
    setScreen('setup');
    toast('Partida abandonada');
  }

  function updateTimerUI() {
    if (state.screen !== 'debate' || !state.game) return;
    var timer = state.game.timer;
    var timeEl = document.getElementById('timer-time');
    var ring = document.getElementById('timer-ring');
    var stateEl = document.getElementById('timer-state');
    var wrap = document.getElementById('timer-wrap');
    var toggle = document.getElementById('timer-toggle');
    if (!timeEl || !ring) return;

    timeEl.textContent = formatTime(timer.remaining);
    var radius = 104;
    var circumference = 2 * Math.PI * radius;
    var fraction = timer.max > 0 ? clamp(timer.remaining / timer.max, 0, 1) : 0;
    ring.style.strokeDasharray = String(circumference);
    ring.style.strokeDashoffset = String(circumference * (1 - fraction));

    if (wrap) wrap.classList.toggle('is-danger', timer.remaining <= 10);

    if (stateEl) {
      if (timer.remaining <= 0) stateEl.textContent = '¡Tiempo!';
      else if (timer.running) stateEl.textContent = timer.remaining <= 10 ? 'Últimos segundos' : 'En curso';
      else stateEl.textContent = timer.remaining >= timer.base ? 'Listo' : 'En pausa';
    }

    if (toggle) {
      toggle.innerHTML = timer.running ? ICONS.pause : ICONS.play;
      toggle.setAttribute('aria-label', timer.running ? 'Pausar temporizador' : 'Iniciar temporizador');
    }
  }

  function startTimerLoop() {
    stopTimerLoop();
    state.timerLoop = setInterval(timerTick, 200);
  }

  function stopTimerLoop() {
    if (state.timerLoop) {
      clearInterval(state.timerLoop);
      state.timerLoop = null;
    }
  }

  function timerTick() {
    var game = state.game;
    if (!game || state.screen !== 'debate') {
      stopTimerLoop();
      return;
    }
    var timer = game.timer;
    if (!timer.running) {
      stopTimerLoop();
      return;
    }
    var remaining = Math.max(0, (timer.endAt - performance.now()) / 1000);
    timer.remaining = remaining;
    var seconds = Math.ceil(remaining);
    if (seconds !== timer.lastTick && seconds > 0) {
      timer.lastTick = seconds;
      if (seconds <= 10) Sound.urgentTick();
      else Sound.tick();
    }
    updateTimerUI();
    if (remaining <= 0) {
      timer.remaining = 0;
      timer.running = false;
      stopTimerLoop();
      updateTimerUI();
      Sound.timeUp();
      vibrate([120, 60, 120]);
    }
  }

  function startTimer() {
    var timer = state.game.timer;
    if (timer.remaining <= 0) {
      timer.remaining = timer.base;
      timer.max = timer.base;
    }
    timer.running = true;
    timer.endAt = performance.now() + timer.remaining * 1000;
    timer.lastTick = Math.ceil(timer.remaining);
    startTimerLoop();
    updateTimerUI();
  }

  function pauseTimer() {
    var timer = state.game.timer;
    if (!timer.running) return;
    timer.remaining = Math.max(0, (timer.endAt - performance.now()) / 1000);
    timer.running = false;
    stopTimerLoop();
    updateTimerUI();
  }

  function toggleTimer() {
    if (state.game.timer.running) pauseTimer();
    else startTimer();
  }

  function addTime(seconds) {
    var timer = state.game.timer;
    timer.remaining = Math.max(0, timer.remaining + seconds);
    timer.max = Math.max(timer.max, timer.remaining);
    if (timer.running) timer.endAt += seconds * 1000;
    updateTimerUI();
  }

  function resetTimer() {
    var timer = state.game.timer;
    timer.running = false;
    stopTimerLoop();
    timer.remaining = timer.base;
    timer.max = timer.base;
    timer.lastTick = null;
    updateTimerUI();
  }

  function handleAppAction(action, el) {
    if (action !== 'toggle-sound' && action !== 'start-game' && action !== 'confirm-vote') {
      Sound.click();
    }
    switch (action) {
      case 'toggle-sound':
        Sound.toggle();
        refreshSoundIcons();
        toast(Sound.enabled ? 'Sonido activado' : 'Sonido silenciado');
        break;
      case 'show-rules':
        openRules();
        break;
      case 'open-history':
        setScreen('history');
        break;
      case 'go-home':
        clearTimeout(state.tallyTimer);
        state.tallyTimer = null;
        stopTimerLoop();
        state.hold = null;
        state.game = null;
        setScreen('home');
        break;
      case 'delete-history':
        openHistoryDeleteModal(el.dataset.id);
        break;
      case 'clear-history':
        openClearHistoryModal();
        break;
      case 'install-app':
        promptInstall();
        break;
      case 'player-inc':
        if (setup.count < 12) {
          setup.count += 1;
          setup.impostors = clamp(setup.impostors, 1, maxImpostors(setup.count));
          persistSetup();
          render();
        }
        break;
      case 'player-dec':
        if (setup.count > 3) {
          setup.count -= 1;
          setup.impostors = clamp(setup.impostors, 1, maxImpostors(setup.count));
          persistSetup();
          render();
        }
        break;
      case 'impostor':
        setup.impostors = clamp(parseInt(el.dataset.count, 10) || 1, 1, maxImpostors(setup.count));
        persistSetup();
        render();
        break;
      case 'mode':
        setup.mode = el.dataset.mode === 'blind' ? 'blind' : 'undercover';
        persistSetup();
        render();
        break;
      case 'category':
        if (setup.categories.has(el.dataset.category)) setup.categories.delete(el.dataset.category);
        else setup.categories.add(el.dataset.category);
        persistSetup();
        render();
        break;
      case 'all-categories':
        if (setup.categories.size === allCategories().length) setup.categories.clear();
        else allCategories().forEach(function (key) { setup.categories.add(key); });
        persistSetup();
        render();
        break;
      case 'time':
        setup.debateTime = parseInt(el.dataset.time, 10);
        persistSetup();
        render();
        break;
      case 'open-custom':
        openCustomModal();
        break;
      case 'start-game':
        startGame();
        break;
      case 'quit':
      case 'quit-vote':
        quitGame();
        break;
      case 'next-reveal':
        nextReveal();
        break;
      case 'confirm-reveal':
        setScreen('reveal');
        break;
      case 'timer-add':
        addTime(30);
        break;
      case 'timer-toggle':
        toggleTimer();
        break;
      case 'timer-reset':
        resetTimer();
        break;
      case 'go-vote':
        beginVoting();
        break;
      case 'vote-ready':
        setScreen('vote-select');
        break;
      case 'select-suspect':
        state.game.voteChoice = state.game.voteChoice === el.dataset.id ? null : el.dataset.id;
        render();
        break;
      case 'confirm-vote':
        confirmVote();
        break;
      case 'after-elimination':
        afterElimination();
        break;
      case 'next-round':
        nextRound();
        break;
      case 'rematch':
        startGame();
        break;
      case 'new-game':
        state.game = null;
        setScreen('setup');
        break;
      default:
        break;
    }
  }

  function nextReveal() {
    var game = state.game;
    var player = game.players[game.revealIndex];
    if (!player || !player.seen) {
      toast('Mantén pulsado para ver tu palabra');
      return;
    }
    if (game.revealIndex < game.players.length - 1) {
      game.revealIndex += 1;
      setScreen('reveal-pass');
    } else {
      beginDebate();
    }
  }

  function openRules() {
    document.body.classList.add('modal-open');
    modalRoot.innerHTML =
      '<div class="modal-overlay" data-action="close-modal">' +
        '<div class="modal-card scroll-thin">' +
          '<div class="flex items-start justify-between gap-3">' +
            '<div><p class="label">Instrucciones</p><h2 class="font-display text-xl text-white mt-1">Cómo jugar</h2></div>' +
            '<button type="button" data-action="close-modal" class="icon-btn" aria-label="Cerrar">' + ICONS.close + '</button>' +
          '</div>' +
          '<div class="mt-4 space-y-4 text-[13px] leading-relaxed text-slate-300">' +
            '<div class="rounded-2xl border border-white/10 bg-white/[0.025] p-4">' +
              '<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">Undercover</p>' +
              '<p class="mt-2">Los ciudadanos reciben una palabra. Los infiltrados reciben otra parecida y deben disimular sin saber cuál es la original.</p>' +
            '</div>' +
            '<div class="rounded-2xl border border-white/10 bg-white/[0.025] p-4">' +
              '<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300/80">Infiltrado ciego</p>' +
              '<p class="mt-2">Los infiltrados no reciben ninguna palabra. Escuchan, improvisan y tratan de no ser descubiertos.</p>' +
            '</div>' +
            '<div class="rounded-2xl border border-white/10 bg-white/[0.025] p-4">' +
              '<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/80">Partida</p>' +
              '<ol class="mt-2 space-y-1.5 list-decimal list-inside marker:text-slate-500">' +
                '<li>Pasa el teléfono y mantén pulsado para ver tu rol.</li>' +
                '<li>Debatid siguiendo el orden aleatorio y dad pistas sin decir la palabra.</li>' +
                '<li>Votad en secreto al sospechoso. El más votado es eliminado.</li>' +
              '</ol>' +
            '</div>' +
            '<div class="rounded-2xl border border-white/10 bg-white/[0.025] p-4">' +
              '<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-300/80">Victoria</p>' +
              '<p class="mt-2">Los ciudadanos ganan al eliminar a todos los infiltrados. Los infiltrados ganan cuando igualan o superan el número de ciudadanos vivos.</p>' +
            '</div>' +
          '</div>' +
          '<button type="button" data-action="close-modal" class="btn-primary mt-5">ENTENDIDO</button>' +
        '</div>' +
      '</div>';
  }

  function promptInstall() {
    if (deferredInstallPrompt) {
      var prompt = deferredInstallPrompt;
      deferredInstallPrompt = null;
      prompt.prompt();
      prompt.userChoice.then(function (choice) {
        if (choice && choice.outcome === 'accepted') toast('Instalando app...');
      }).catch(function () {});
      return;
    }
    openInstallHelp();
  }

  function openInstallHelp() {
    document.body.classList.add('modal-open');
    var ua = navigator.userAgent || '';
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/i.test(ua);
    var title = isIOS ? 'En iPhone / iPad (Safari)' : isAndroid ? 'En Android (Chrome)' : 'En tu navegador';
    var steps = isIOS
      ? 'Toca el botón Compartir de Safari y elige <strong>Añadir a pantalla de inicio</strong>. Después pulsa <strong>Añadir</strong>.'
      : isAndroid
        ? 'Abre el menú de tres puntos de Chrome y elige <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.'
        : 'Busca el botón de instalar en la barra de direcciones o la opción <strong>Instalar aplicación</strong> en el menú del navegador.';
    modalRoot.innerHTML =
      '<div class="modal-overlay" data-action="close-modal">' +
        '<div class="modal-card scroll-thin">' +
          '<div class="flex items-start justify-between gap-3">' +
            '<div><p class="label">Aplicación</p><h2 class="font-display text-xl text-white mt-1">Instalar en el móvil</h2></div>' +
            '<button type="button" data-action="close-modal" class="icon-btn" aria-label="Cerrar">' + ICONS.close + '</button>' +
          '</div>' +
          '<p class="text-[13px] leading-relaxed text-slate-400 mt-3">Abre El Infiltrado a pantalla completa y sin la barra del navegador.</p>' +
          '<div class="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">' +
            '<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/80">' + title + '</p>' +
            '<p class="mt-2 text-[13px] leading-relaxed text-slate-300">' + steps + '</p>' +
          '</div>' +
          '<div class="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">' +
            '<p class="text-[12px] leading-relaxed text-slate-400">Si la opción no aparece, recarga la página una vez y vuelve a intentarlo. En iPhone, la instalación debe hacerse desde Safari.</p>' +
          '</div>' +
          '<button type="button" data-action="close-modal" class="btn-primary mt-5">ENTENDIDO</button>' +
        '</div>' +
      '</div>';
  }

  function openHistoryDeleteModal(id) {
    var entry = historyEntries.find(function (item) { return item.id === id; });
    if (!entry) return;
    document.body.classList.add('modal-open');
    modalRoot.innerHTML =
      '<div class="modal-overlay" data-action="close-modal">' +
        '<div class="modal-card">' +
          '<div class="flex items-start justify-between gap-3">' +
            '<div><p class="label text-rose-300/70">Historial</p><h2 class="font-display text-xl text-white mt-1">Borrar partida</h2></div>' +
            '<button type="button" data-action="close-modal" class="icon-btn" aria-label="Cerrar">' + ICONS.close + '</button>' +
          '</div>' +
          '<p class="text-[13px] leading-relaxed text-slate-400 mt-3">Se eliminará esta partida del historial. Esta acción no se puede deshacer.</p>' +
          '<div class="grid grid-cols-2 gap-2 mt-5">' +
            '<button type="button" data-action="close-modal" class="btn-ghost">CANCELAR</button>' +
            '<button type="button" data-action="confirm-delete-history" data-id="' + escapeHtml(entry.id) + '" class="btn-danger">BORRAR</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function openClearHistoryModal() {
    if (!historyEntries.length) return;
    var message = historyEntries.length === 1
      ? 'Se eliminará la única partida guardada en este dispositivo. Esta acción no se puede deshacer.'
      : 'Se eliminarán las ' + historyEntries.length + ' partidas guardadas en este dispositivo. Esta acción no se puede deshacer.';
    document.body.classList.add('modal-open');
    modalRoot.innerHTML =
      '<div class="modal-overlay" data-action="close-modal">' +
        '<div class="modal-card">' +
          '<div class="flex items-start justify-between gap-3">' +
            '<div><p class="label text-rose-300/70">Historial</p><h2 class="font-display text-xl text-white mt-1">Borrar todo</h2></div>' +
            '<button type="button" data-action="close-modal" class="icon-btn" aria-label="Cerrar">' + ICONS.close + '</button>' +
          '</div>' +
          '<p class="text-[13px] leading-relaxed text-slate-400 mt-3">' + message + '</p>' +
          '<div class="grid grid-cols-2 gap-2 mt-5">' +
            '<button type="button" data-action="close-modal" class="btn-ghost">CANCELAR</button>' +
            '<button type="button" data-action="confirm-clear-history" class="btn-danger">BORRAR TODO</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function removeHistoryEntry(id) {
    historyEntries = historyEntries.filter(function (entry) { return entry.id !== id; });
    save(STORAGE.history, historyEntries);
    closeModal();
    if (state.screen === 'history') render();
    toast('Partida borrada');
  }

  function clearHistory() {
    historyEntries = [];
    save(STORAGE.history, historyEntries);
    closeModal();
    if (state.screen === 'history') render();
    toast('Historial borrado');
  }

  function customListMarkup() {
    if (!customPairs.length) {
      return '<p class="text-sm text-slate-500 text-center py-4">Aún no tienes parejas personalizadas.</p>';
    }
    return customPairs.map(function (pair, index) {
      return '<div class="custom-item">' +
        '<div class="min-w-0 flex-1">' +
          '<p class="text-sm text-slate-200 truncate">' + escapeHtml(pair.a) + '</p>' +
          '<p class="text-[11px] text-slate-500 truncate">' + escapeHtml(pair.b) + '</p>' +
        '</div>' +
        '<button type="button" class="del" data-action="delete-custom" data-index="' + index + '" aria-label="Eliminar pareja">' + ICONS.trash + '</button>' +
      '</div>';
    }).join('');
  }

  function customModalMarkup() {
    return '<div class="modal-overlay" data-action="close-modal">' +
      '<div class="modal-card scroll-thin">' +
        '<div class="flex items-start justify-between gap-3">' +
          '<div><p class="label">Biblioteca propia</p><h2 class="font-display text-xl text-white mt-1">Palabras personalizadas</h2></div>' +
          '<button type="button" data-action="close-modal" class="icon-btn" aria-label="Cerrar">' + ICONS.close + '</button>' +
        '</div>' +
        '<p class="text-[12px] text-slate-400 mt-3">Añade parejas para tus partidas. Se guardan en este dispositivo.</p>' +
        '<form id="custom-form" class="mt-4 grid gap-2" autocomplete="off">' +
          '<input id="custom-a" class="field" maxlength="24" required placeholder="Palabra de ciudadanos" aria-label="Palabra de ciudadanos">' +
          '<input id="custom-b" class="field" maxlength="24" required placeholder="Palabra de infiltrados" aria-label="Palabra de infiltrados">' +
          '<button type="submit" class="btn-primary" style="padding:14px">AÑADIR PAREJA</button>' +
        '</form>' +
        '<div class="mt-5">' +
          '<p class="label mb-2">Tus parejas (' + customPairs.length + ')</p>' +
          '<div class="grid gap-2 max-h-[34dvh] overflow-y-auto scroll-thin pr-1">' + customListMarkup() + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function openCustomModal() {
    document.body.classList.add('modal-open');
    modalRoot.innerHTML = customModalMarkup();
    var input = document.getElementById('custom-a');
    if (input) setTimeout(function () { input.focus(); }, 200);
  }

  function closeModal() {
    document.body.classList.remove('modal-open');
    modalRoot.innerHTML = '';
  }

  function handleModalAction(action, el) {
    if (action === 'close-modal') {
      Sound.click();
      closeModal();
      return;
    }
    if (action === 'delete-custom') {
      var index = parseInt(el.dataset.index, 10);
      if (!Number.isNaN(index) && customPairs[index]) {
        Sound.click();
        customPairs.splice(index, 1);
        save(STORAGE.custom, customPairs);
        if (!customPairs.length) setup.categories.delete('personalizado');
        persistSetup();
        modalRoot.innerHTML = customModalMarkup();
        if (state.screen === 'setup' || state.screen === 'results') render();
        toast('Pareja eliminada');
      }
      return;
    }
    if (action === 'confirm-delete-history') {
      Sound.click();
      removeHistoryEntry(el.dataset.id);
      return;
    }
    if (action === 'confirm-clear-history') {
      Sound.click();
      clearHistory();
    }
  }

  function addCustomPair(a, b) {
    var wordA = String(a || '').trim().slice(0, 24);
    var wordB = String(b || '').trim().slice(0, 24);
    if (!wordA || !wordB) {
      toast('Rellena las dos palabras');
      return false;
    }
    customPairs.push({ a: wordA, b: wordB });
    save(STORAGE.custom, customPairs);
    setup.categories.add('personalizado');
    persistSetup();
    modalRoot.innerHTML = customModalMarkup();
    if (state.screen === 'setup' || state.screen === 'results') render();
    toast('Pareja añadida');
    return true;
  }

  function stopHold() {
    if (!state.hold) return;
    var hold = state.hold;
    var held = performance.now() - hold.startedAt;
    var card = document.getElementById('role-card');
    var secret = document.getElementById('role-secret');
    var button = document.querySelector('.hold-btn.is-holding');
    if (card) card.classList.remove('is-revealed');
    if (secret) secret.hidden = true;
    if (button) button.classList.remove('is-holding');
    var label = document.getElementById('hold-label');
    if (label) label.textContent = 'MANTÉN PULSADO';
    state.hold = null;
    var game = state.game;
    if (game && game.players[game.revealIndex]) {
      var player = game.players[game.revealIndex];
      if (held >= 450) {
        if (!player.seen) {
          player.seen = true;
          vibrate(14);
          render();
        }
      } else {
        toast('Mantén pulsado un poco más');
      }
    }
  }

  document.addEventListener('pointerdown', function () {
    Sound.init();
  }, { once: true });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModal();
    Sound.init();
  }, { once: true });

  appEl.addEventListener('click', function (event) {
    var el = event.target.closest('[data-action]');
    if (!el) return;
    handleAppAction(el.dataset.action, el);
  });

  appEl.addEventListener('input', function (event) {
    var input = event.target.closest('[data-player-index]');
    if (!input) return;
    var index = parseInt(input.dataset.playerIndex, 10);
    if (Number.isNaN(index)) return;
    setup.names[index] = input.value.slice(0, 14);
    persistSetup();
  });

  appEl.addEventListener('pointerdown', function (event) {
    var button = event.target.closest('[data-hold]');
    if (!button || state.hold) return;
    var game = state.game;
    if (!game || state.screen !== 'reveal') return;
    event.preventDefault();
    Sound.init();
    var card = document.getElementById('role-card');
    if (!card) return;
    var secret = document.getElementById('role-secret');
    if (secret) {
      secret.hidden = false;
      void secret.offsetHeight;
    }
    state.hold = { startedAt: performance.now() };
    button.classList.add('is-holding');
    card.classList.add('is-revealed');
    var label = document.getElementById('hold-label');
    if (label) label.textContent = 'SUELTA PARA OCULTAR';
    Sound.reveal();
    vibrate(10);
  }, { passive: false });

  document.addEventListener('pointerup', stopHold);
  document.addEventListener('pointercancel', stopHold);
  window.addEventListener('blur', stopHold);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopHold();
  });

  modalRoot.addEventListener('click', function (event) {
    var el = event.target.closest('[data-action]');
    if (!el) return;
    if (el.classList.contains('modal-overlay') && event.target !== el) return;
    handleModalAction(el.dataset.action, el);
  });

  modalRoot.addEventListener('submit', function (event) {
    if (event.target.id !== 'custom-form') return;
    event.preventDefault();
    var a = document.getElementById('custom-a');
    var b = document.getElementById('custom-b');
    Sound.init();
    Sound.click();
    addCustomPair(a ? a.value : '', b ? b.value : '');
  });

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
  });

  window.addEventListener('appinstalled', function () {
    deferredInstallPrompt = null;
    if (state.screen === 'setup') render();
    toast('App instalada');
  });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }

  render();
})();
