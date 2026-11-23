/* ==========================================================
   app.js · 北京中考数学领航 运行时核心
   复用英语站的设计系统与档案机制，重写记录层：
   英语站记 {ok, id}，本站记 {result, stuckStep, errorType, timeMs}
   ========================================================== */
(function (global) {
  'use strict';
  var Z = global.BJM = global.BJM || {};

  var esc = Z.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  Z.ready = ready;

  /* ---------------- 提示条 ---------------- */
  var toastEl = null, toastTimer = null;
  Z.toast = function (msg, ms) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, ms || 2200);
  };

  /* ---------------- 音效 ---------------- */
  var sfxOn = load('bj-sfx-v1', true);
  var audioCtx = null;
  Z.sfx = function (kind) {
    if (!sfxOn || !kind) return;
    try {
      if (!audioCtx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var now = audioCtx.currentTime;
      function tone(freq, start, dur, gainVal, type) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, now + start);
        g.gain.setValueAtTime(0, now + start);
        g.gain.linearRampToValueAtTime(gainVal, now + start + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(now + start); o.stop(now + start + dur + 0.02);
      }
      if (kind === 'ok') { tone(660, 0, 0.12, 0.1); tone(880, 0.06, 0.14, 0.08); }
      else if (kind === 'bad') { tone(240, 0, 0.16, 0.09, 'triangle'); }
      else if (kind === 'win') { tone(523, 0, 0.14, 0.09); tone(659, 0.09, 0.14, 0.09); tone(784, 0.18, 0.22, 0.1); }
    } catch (e) {}
  };
  Z.toggleSfx = function (on) { sfxOn = on; store('bj-sfx-v1', on); return sfxOn; };
  Z.sfxOn = function () { return sfxOn; };

  /* ---------------- 主题 ---------------- */
  var THEME_KEY = 'bj-theme-manual';
  function autoTheme() {
    var h = new Date().getHours();
    return (h >= 19 || h < 6) ? 'dark' : 'light';
  }
  Z.applyTheme = function (t, save) {
    document.documentElement.setAttribute('data-theme', t);
    if (save) store(THEME_KEY, t);
  };
  Z.toggleTheme = function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    Z.applyTheme(cur, true);
    var b = document.querySelector('.theme-btn');
    if (b) b.textContent = cur === 'dark' ? '☀' : '☾';
    return cur;
  };

  /* ---------------- 档案 ---------------- */
  var PROFILE_KEY = 'bj-profile-v1';
  var profile = load(PROFILE_KEY, { examDate: '', target: '95', grade: '9' });
  Z.profile = function () { return profile; };
  Z.saveProfile = function (patch) {
    profile = Object.assign({}, profile, patch || {});
    store(PROFILE_KEY, profile);
    document.dispatchEvent(new CustomEvent('bj:profile'));
    return profile;
  };
  Z.daysLeft = function () {
    if (!profile.examDate) return null;
    var t = new Date(profile.examDate + 'T00:00:00');
    if (isNaN(t)) return null;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((t - today) / 86400000);
  };

  /* ---------------- 每日学习量 ---------------- */
  var DAYLOG_KEY = 'bj-daylog-v1';
  var GOAL_KEY = 'bj-goal-v1';
  var daylog = load(DAYLOG_KEY, {});
  var goal = Math.max(1, parseInt(load(GOAL_KEY, 20), 10) || 20);
  function dayKey(d) {
    var t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }
  Z.dayKey = dayKey;
  Z.goal = function () { return goal; };
  Z.setGoal = function (n) { goal = Math.max(1, parseInt(n, 10) || 20); store(GOAL_KEY, goal); document.dispatchEvent(new CustomEvent('bj:goal')); };
  Z.bumpDay = function (field, n) {
    var k = dayKey();
    var rec = daylog[k] || {};
    rec[field] = (rec[field] || 0) + (n == null ? 1 : n);
    daylog[k] = rec;
    store(DAYLOG_KEY, daylog);
    document.dispatchEvent(new CustomEvent('bj:day'));
  };
  Z.today = function (field) {
    var rec = daylog[dayKey()] || {};
    return field ? (rec[field] || 0) : rec;
  };
  Z.todayQuestions = function () { return Z.today('questions'); };
  Z.todayPct = function () { return Math.min(100, Math.round(Z.todayQuestions() / goal * 100)); };
  Z.streak = function () {
    var n = 0, d = new Date();
    for (;;) {
      var rec = daylog[dayKey(d)];
      if (rec && (rec.questions || 0) > 0) { n++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  };
  Z.recentDays = function (days) {
    var out = [], n = days || 7;
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      out.push({ key: dayKey(d), label: (d.getMonth() + 1) + '/' + d.getDate(), rec: daylog[dayKey(d)] || {} });
    }
    return out;
  };

  /* ==========================================================
     作答记录 qlog
     结构（替代英语站的 {ok,id}）：
       stats.byChapter / byMethod / byTier  —— 正确率统计
       wrong[id] = { result, stuckStep, errorType, timeMs, n, due, src }
       errStats = { concept:{n,ok}, method:{}, construct:{}, calc:{}, express:{} }
     ========================================================== */
  var QLOG_KEY = 'bj-qlog-v1';
  var ERR_TYPES = ['concept', 'method', 'construct', 'calc', 'express'];
  var ERR_NAME = {
    concept: '概念不清', method: '方法未掌握', construct: '构造不出',
    calc: '计算失误', express: '表达不规范',
  };
  var qlog = load(QLOG_KEY, null) || {};
  if (!qlog.stats) qlog.stats = {};
  if (!qlog.stats.byChapter) qlog.stats.byChapter = {};
  if (!qlog.stats.byMethod) qlog.stats.byMethod = {};
  if (!qlog.stats.byTier) qlog.stats.byTier = {};
  if (!qlog.wrong) qlog.wrong = {};
  if (!qlog.errStats) qlog.errStats = {};
  if (!qlog.due) qlog.due = {};
  ERR_TYPES.forEach(function (t) { if (!qlog.errStats[t]) qlog.errStats[t] = { n: 0, ok: 0 }; });

  Z.ERR_TYPES = ERR_TYPES;
  Z.ERR_NAME = ERR_NAME;
  Z.errName = function (t) { return ERR_NAME[t] || '未分类'; };
  Z.qLog = function () { return qlog; };

  function bumpStat(bucket, key, ok) {
    if (!key) return;
    var r = qlog.stats[bucket][key] || { n: 0, ok: 0 };
    r.n++; if (ok) r.ok++;
    qlog.stats[bucket][key] = r;
  }

  /**
   * 记录一次作答。
   * @param rec { id, chapter, method, tier, result:'right'|'wrong'|'blank',
   *              stuckStep, errorType, timeMs, src }
   */
  Z.qRecord = function (rec) {
    if (!rec || !rec.id) return;
    var ok = rec.result === 'right';
    bumpStat('byChapter', rec.chapter, ok);
    bumpStat('byMethod', rec.method, ok);
    bumpStat('byTier', rec.tier, ok);

    // 错因统计：只对判过的题计数
    var et = rec.errorType;
    if (et && ERR_TYPES.indexOf(et) >= 0 && rec.result !== 'blank') {
      var es = qlog.errStats[et];
      es.n++; if (ok) es.ok++;
    }

    if (ok) {
      delete qlog.wrong[rec.id];
      // 答对：按 0.5/1/3/7/21/60 天递增排下次复习
      var prev = qlog.due[rec.id] || { n: 0 };
      var steps = [0.5, 1, 3, 7, 21, 60];
      var n = Math.min((prev.n || 0) + 1, steps.length);
      qlog.due[rec.id] = { n: n, due: Date.now() + steps[n - 1] * 86400000 };
    } else {
      var w = qlog.wrong[rec.id] || { n: 0 };
      qlog.wrong[rec.id] = {
        result: rec.result,
        stuckStep: rec.stuckStep == null ? -1 : rec.stuckStep,
        errorType: et || 'method',
        timeMs: rec.timeMs || 0,
        chapter: rec.chapter || '',
        method: rec.method || '',
        tier: rec.tier || '',
        n: (w.n || 0) + 1,
        due: 0,
        src: rec.src || 'drill',
      };
      qlog.due[rec.id] = { n: 0, due: 0 };
    }
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('bj:qlog', { detail: rec }));
  };

  Z.wrongIds = function () { return Object.keys(qlog.wrong); };
  Z.wrongMap = function () { return qlog.wrong; };
  Z.qDueMap = function () { return qlog.due; };
  Z.qClearWrong = function (id) {
    delete qlog.wrong[id];
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('bj:qlog'));
  };

  /** 按错因批量移除（错题本的「清空这一类」） */
  Z.qClearWrongByType = function (type) {
    var n = 0;
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      var t = ERR_TYPES.indexOf(w.errorType) >= 0 ? w.errorType : 'method';
      if (t === type) { delete qlog.wrong[id]; n++; }
    });
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('bj:qlog'));
    return n;
  };

  /** 清空整个错题本（保留统计） */
  Z.qClearAllWrong = function () {
    var n = Object.keys(qlog.wrong).length;
    qlog.wrong = {};
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('bj:qlog'));
    return n;
  };

  /** 批量标记已掌握（一次移除多条） */
  Z.qMasterBatch = function (ids) {
    var n = 0;
    (ids || []).forEach(function (id) {
      if (qlog.wrong[id]) { delete qlog.wrong[id]; n++; }
    });
    if (n) {
      store(QLOG_KEY, qlog);
      document.dispatchEvent(new CustomEvent('bj:qlog'));
    }
    return n;
  };

  /**
   * 错题列表（供错题本页分页/搜索用）。
   * 每条带上原始记录 + 题目元信息摘要，避免页面反复查表。
   */
  Z.wrongList = function () {
    return Object.keys(qlog.wrong).map(function (id) {
      var w = qlog.wrong[id];
      return {
        id: id,
        errorType: w.errorType || 'method',
        chapter: w.chapter || '',
        method: w.method || '',
        tier: w.tier || '',
        stuckStep: w.stuckStep == null ? -1 : w.stuckStep,
        times: w.n || 1,
        timeMs: w.timeMs || 0,
        src: w.src || '',
      };
    });
  };

  /** 按错因分栏 */
  Z.wrongByType = function () {
    var out = {};
    ERR_TYPES.forEach(function (t) { out[t] = []; });
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      var t = ERR_TYPES.indexOf(w.errorType) >= 0 ? w.errorType : 'method';
      out[t].push(Object.assign({ id: id }, w));
    });
    return out;
  };

  /** 各桶正确率，按正确率升序（最弱在前） */
  function rates(bucket) {
    var b = qlog.stats[bucket] || {};
    return Object.keys(b).map(function (k) {
      var r = b[k];
      return { key: k, n: r.n, ok: r.ok, rate: r.n ? r.ok / r.n : 0 };
    }).filter(function (x) { return x.n > 0; })
      .sort(function (a, b2) { return a.rate - b2.rate; });
  }
  Z.chapterRates = function () { return rates('byChapter'); };
  Z.methodRates = function () { return rates('byMethod'); };
  Z.tierRates = function () { return rates('byTier'); };
  Z.errStats = function () {
    return ERR_TYPES.map(function (t) {
      var r = qlog.errStats[t] || { n: 0, ok: 0 };
      return { type: t, name: ERR_NAME[t], n: r.n, ok: r.ok, rate: r.n ? r.ok / r.n : 0 };
    });
  };
  Z.totalAnswered = function () {
    var n = 0, ok = 0;
    Object.keys(qlog.stats.byChapter || {}).forEach(function (k) {
      n += qlog.stats.byChapter[k].n; ok += qlog.stats.byChapter[k].ok;
    });
    return { n: n, ok: ok, rate: n ? ok / n : 0 };
  };

  /* ==========================================================
     弱点聚合：把「错题」变成「可训练的单元」
     ----------------------------------------------------------
     光有横向错因（概念/方法/计算…）不够用——学生知道「我是计算错」，
     但不知道练哪个具体东西。这里按**方法卡**和**章节**两个可训练单元
     聚合，每个单元给出：
       rate      该单元正确率
       wrongN    错题数
       errMix    错因分布（哪类错最多）
       stuckMix  卡点分布（第几步最常卡）
       score     优先级分数（越低越该先练）
     ========================================================== */

  /** 把一条错题记录归到某个桶 */
  function bump(bucket, key, w) {
    if (!key) return;
    var b = bucket[key] || (bucket[key] = {
      key: key, wrongN: 0, totalWrongTimes: 0,
      errMix: {}, stuckMix: {}, steps: {}, ids: [],
    });
    b.wrongN++;
    b.totalWrongTimes += (w.n || 1);
    b.errMix[w.errorType] = (b.errMix[w.errorType] || 0) + 1;
    var st = w.stuckStep >= 0 ? w.stuckStep : -1;
    b.stuckMix[st] = (b.stuckMix[st] || 0) + 1;
    if (st >= 0) b.steps[st] = (b.steps[st] || 0) + 1;
    b.ids.push(w.id);
  }

  /** 取某单元的正确率（来自 stats 桶） */
  function rateOf(bucket, key) {
    var r = (qlog.stats[bucket] || {})[key];
    if (!r || !r.n) return null;
    return { n: r.n, ok: r.ok, rate: r.ok / r.n };
  }

  /**
   * 按方法卡聚合弱点。
   * 只返回「有作答记录」的方法卡——没练过的不算弱点，算未学。
   */
  Z.methodWeakness = function () {
    var buckets = {};
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      if (w.method) bump(buckets, w.method, w);
    });
    // 也纳入「练过但没错题」的方法卡，正确率仍可能低
    Object.keys(qlog.stats.byMethod || {}).forEach(function (m) {
      if (!buckets[m]) buckets[m] = { key: m, wrongN: 0, totalWrongTimes: 0, errMix: {}, stuckMix: {}, steps: {}, ids: [] };
    });
    return Object.keys(buckets).map(function (k) {
      var b = buckets[k];
      var r = rateOf('byMethod', k);
      var rate = r ? r.rate : 1;
      var n = r ? r.n : 0;
      // 优先级：正确率越低、错题越多、练得越少（样本不足但已错）越靠前
      // 用 (1-rate) 为主，错题次数加权，样本少时轻微上调
      var score = (1 - rate) * 100 + Math.min(b.totalWrongTimes, 10) * 2;
      if (n > 0 && n < 3 && b.wrongN > 0) score += 6;   // 样本少但已错，值得早看
      return {
        key: k, rate: rate, answered: n, ok: r ? r.ok : 0,
        wrongN: b.wrongN, totalWrongTimes: b.totalWrongTimes,
        errMix: b.errMix, stuckMix: b.stuckMix, steps: b.steps, ids: b.ids,
        score: Math.round(score),
        topErr: topKey(b.errMix),
        topStuck: topStep(b.stuckMix),
      };
    }).sort(function (a, b2) { return b2.score - a.score; });
  };

  /** 按章节聚合弱点，并汇总该章下的方法卡弱点 */
  Z.chapterWeakness = function () {
    var buckets = {};
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      if (w.chapter) bump(buckets, w.chapter, w);
    });
    Object.keys(qlog.stats.byChapter || {}).forEach(function (c) {
      if (!buckets[c]) buckets[c] = { key: c, wrongN: 0, totalWrongTimes: 0, errMix: {}, stuckMix: {}, steps: {}, ids: [] };
    });
    return Object.keys(buckets).map(function (k) {
      var b = buckets[k];
      var r = rateOf('byChapter', k);
      var rate = r ? r.rate : 1;
      var n = r ? r.n : 0;
      var score = (1 - rate) * 100 + Math.min(b.totalWrongTimes, 12) * 2;
      if (n > 0 && n < 3 && b.wrongN > 0) score += 5;
      return {
        key: k, rate: rate, answered: n, ok: r ? r.ok : 0,
        wrongN: b.wrongN, totalWrongTimes: b.totalWrongTimes,
        errMix: b.errMix, stuckMix: b.stuckMix, steps: b.steps, ids: b.ids,
        score: Math.round(score),
        topErr: topKey(b.errMix),
        topStuck: topStep(b.stuckMix),
      };
    }).sort(function (a, b2) { return b2.score - a.score; });
  };

  function topKey(mix) {
    var best = null, bn = 0;
    Object.keys(mix || {}).forEach(function (k) {
      if (mix[k] > bn) { bn = mix[k]; best = k; }
    });
    return best;
  }
  function topStep(mix) {
    var best = -1, bn = 0;
    Object.keys(mix || {}).forEach(function (k) {
      var v = parseInt(k, 10);
      if (v < 0) return;
      if (mix[k] > bn) { bn = mix[k]; best = v; }
    });
    return best;
  }

  /**
   * 全局「下一步练什么」：给出前 N 个最该练的单元。
   * 这是错因诊断页的核心输出——不是列错题，是给行动。
   */
  Z.nextActions = function (limit) {
    var ms = Z.methodWeakness().filter(function (m) { return m.wrongN > 0 || m.rate < 0.75; });
    var cs = Z.chapterWeakness().filter(function (c) { return c.wrongN > 0 || c.rate < 0.75; });
    var acts = [];
    ms.forEach(function (m) {
      acts.push({
        kind: 'method', key: m.key, score: m.score,
        rate: m.rate, answered: m.answered, wrongN: m.wrongN,
        topErr: m.topErr, topStuck: m.topStuck,
        href: 'drill.html?method=' + encodeURIComponent(m.key) + '&scope=weak',
      });
    });
    cs.forEach(function (c) {
      acts.push({
        kind: 'chapter', key: c.key, score: c.score - 4,   // 章节优先级略低于具体方法
        rate: c.rate, answered: c.answered, wrongN: c.wrongN,
        topErr: c.topErr, topStuck: c.topStuck,
        href: 'drill.html?chapter=' + encodeURIComponent(c.key) + '&scope=weak',
      });
    });
    return acts.sort(function (a, b) { return b.score - a.score; }).slice(0, limit || 5);
  };

  /** 卡点分布（全局）：第几步最容易卡，用于「分层提示」优化与专项 */
  Z.stuckDistribution = function () {
    var dist = {};
    Object.keys(qlog.wrong).forEach(function (id) {
      var w = qlog.wrong[id];
      if (w.stuckStep >= 0) dist[w.stuckStep] = (dist[w.stuckStep] || 0) + 1;
    });
    return dist;
  };

  Z.qReset = function () {
    qlog = { stats: { byChapter: {}, byMethod: {}, byTier: {} }, wrong: {}, errStats: {}, due: {} };
    ERR_TYPES.forEach(function (t) { qlog.errStats[t] = { n: 0, ok: 0 }; });
    store(QLOG_KEY, qlog);
    document.dispatchEvent(new CustomEvent('bj:qlog', { detail: { reset: true } }));
  };

  /* ---------------- 概念卡 SRS ---------------- */
  var CSRS_KEY = 'bj-csrs-v1';
  var csrs = load(CSRS_KEY, {});
  var DAY = 86400000;
  Z.csrsGet = function (id) { return csrs[id] || null; };
  Z.csrsAll = function () { return csrs; };
  Z.csrsDue = function (ids) {
    var now = Date.now();
    return (ids || Object.keys(csrs)).filter(function (id) {
      var r = csrs[id];
      return !r || (r.due || 0) <= now;
    });
  };
  Z.csrsRate = function (id, grade) {
    var r = csrs[id] || { ease: 2.5, ivl: 0, due: 0, reps: 0, lapses: 0, ans: 0, okc: 0 };
    if (grade === 0) {
      r.ease = Math.max(1.3, r.ease - 0.2);
      r.ivl = 0; r.lapses = (r.lapses || 0) + 1;
      r.due = Date.now() + 10 * 60000;
    } else {
      if (grade === 1) r.ease = Math.max(1.3, r.ease - 0.15);
      if (grade === 3) r.ease = Math.min(3.2, r.ease + 0.15);
      if (r.reps === 0) r.ivl = grade === 1 ? 0.5 : grade === 2 ? 1 : 2;
      else if (r.reps === 1) r.ivl = grade === 1 ? 1 : grade === 2 ? 3 : 5;
      else r.ivl = Math.max(1, Math.round(r.ivl * r.ease * (grade === 1 ? 0.8 : grade === 3 ? 1.25 : 1)));
      r.due = Date.now() + r.ivl * DAY;
    }
    r.reps = (r.reps || 0) + 1;
    r.last = Date.now();
    if (grade !== 1) { r.ans = (r.ans || 0) + 1; if (grade >= 2) r.okc = (r.okc || 0) + 1; }
    csrs[id] = r;
    store(CSRS_KEY, csrs);
    document.dispatchEvent(new CustomEvent('bj:csrs', { detail: { id: id } }));
    return r;
  };
  Z.csrsStats = function () {
    var keys = Object.keys(csrs), now = Date.now(), due = 0, mature = 0;
    keys.forEach(function (k) {
      var r = csrs[k];
      if ((r.due || 0) <= now) due++;
      if ((r.ivl || 0) >= 21) mature++;
    });
    return { total: keys.length, due: due, mature: mature, learning: keys.length - mature };
  };

  /* ---------------- 方法卡过关 ---------------- */
  var METHOD_KEY = 'bj-method-v1';
  var methodLog = load(METHOD_KEY, {});
  Z.methodLog = function () { return methodLog; };
  Z.methodRecord = function (methodId, variantId, ok) {
    if (!methodId) return;
    var r = methodLog[methodId] || { variants: {}, done: false };
    r.variants[variantId] = ok;
    var vs = Object.keys(r.variants);
    r.done = vs.length >= 3 && vs.every(function (k) { return r.variants[k]; });
    r.at = Date.now();
    methodLog[methodId] = r;
    store(METHOD_KEY, methodLog);
    document.dispatchEvent(new CustomEvent('bj:method'));
    return r;
  };
  Z.methodDone = function (id) { var r = methodLog[id]; return !!(r && r.done); };

  /* ---------------- 等级 ---------------- */
  Z.levelInfo = function () {
    var t = Z.totalAnswered();
    var xp = t.ok * 3 + (t.n - t.ok) + Z.streak() * 5 + Object.keys(methodLog).filter(function (k) { return methodLog[k].done; }).length * 20;
    var lv = Math.floor(Math.sqrt(xp / 50)) + 1;
    var names = ['起步', '基础过关', '送分稳了', '方法入门', '中档突破', '区分冲刺', '卷面无忧', '满分选手'];
    var next = Math.pow(lv, 2) * 50;
    var prev = Math.pow(lv - 1, 2) * 50;
    return {
      level: lv, xp: xp,
      name: names[Math.min(lv - 1, names.length - 1)],
      next: next, pct: next > prev ? Math.round((xp - prev) / (next - prev) * 100) : 100,
    };
  };

  /* ---------------- 档案导出 / 导入 ---------------- */
  var SCHEMA = 1;
  Z.exportArchive = function () {
    var data = { schemaVersion: SCHEMA, exportedAt: new Date().toISOString(), app: 'bj-math', keys: {} };
    ['bj-profile-v1', 'bj-daylog-v1', 'bj-goal-v1', 'bj-csrs-v1', 'bj-qlog-v1',
      'bj-method-v1', 'bj-exam-v1', 'bj-plan-v1', THEME_KEY].forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v != null) data.keys[k] = v;
    });
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bj-math-archive-' + dayKey() + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  Z.importArchive = function (json) {
    try {
      var data = typeof json === 'string' ? JSON.parse(json) : json;
      if (!data || !data.keys) throw new Error('格式不正确');
      if ((data.schemaVersion || 0) > SCHEMA) throw new Error('档案版本过新');
      Object.keys(data.keys).forEach(function (k) {
        if (k.indexOf('bj-') !== 0) return;
        localStorage.setItem(k, data.keys[k]);
      });
      Z.toast('档案已导入，即将刷新');
      setTimeout(function () { location.reload(); }, 900);
      return true;
    } catch (e) {
      Z.toast('导入失败：' + e.message);
      return false;
    }
  };

  /* ---------------- 通用交互 ---------------- */
  ready(function () {
    // 主题按钮
    var tb = document.querySelector('.theme-btn');
    if (tb) {
      tb.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀' : '☾';
      tb.addEventListener('click', function () { Z.toggleTheme(); });
    }
    // 移动端菜单
    var mb = document.querySelector('.menu-btn');
    var nav = document.querySelector('.hdr-nav');
    if (mb && nav) {
      mb.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    // 当前导航高亮
    var path = location.pathname.split('/').pop() || 'index.html';
    var dir = location.pathname.replace(/[^/]*$/, '').split('/').filter(Boolean).pop() || '';
    document.querySelectorAll('.hdr-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var parts = href.split('/');
      var file = parts.pop();
      var folder = parts.filter(function (p) { return p && p !== '..'; }).pop() || '';
      var match = file === path && (folder === dir || !folder);
      if (match) a.classList.add('on');
    });
    // 滚动进度
    var sp = document.querySelector('.scroll-progress');
    if (sp) {
      var onScroll = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        sp.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      };
      document.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  });
})(window);
