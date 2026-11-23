/* ==========================================================
   北京中考数学领航 · 静态站点生成器
   用法：node build-site.mjs [--only=home|method|drill]
   输出：根目录各页面、method/ drill/ map/ 子目录

   与英语站的差别：
     ① 数据不内联到每个页面（题量大），改为 classic script 分片 dist/data/*.js
     ② 构建期预渲染公式（MathJax SVG）与图形（声明式 elems）
     ③ 每页用独立公式渲染器实例，只渲染该页公式，避免 defs 膨胀
   ========================================================== */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FORMULAS } from './src/data-formulas.js';
import {
  CHAPTERS, METHODS, ALL_QUESTIONS as QUESTIONS, ALL_CONCEPTS as CONCEPTS,
  CH_BY_ID, M_BY_ID, Q_BY_ID, Q_BY_METHOD, Q_BY_CHAPTER, C_BY_CHAPTER,
  STATS, EXAM_STRUCTURE, TIERS,
} from './src/index.js';
import { createMathRenderer } from './tools/math-render.mjs';
import { createFigureRenderer } from './tools/fig-render.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = __dir;
const SITE_NAME = '北京中考数学领航';
const BRAND_SHORT = '数学领航';

const args = process.argv.slice(2);
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);

const assetHash = (rel) => createHash('sha256').update(readFileSync(join(__dir, rel))).digest('hex').slice(0, 8);
const CSS_VER = assetHash('assets/style.css');
const JS_VER = assetHash('assets/app.js');
const SE_VER = assetHash('assets/step-engine.js');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const report = { pages: [], mathFailures: [], figFailures: [], bytes: {} };

/* ---------------- 派生索引 ---------------- */
const TIER_NAME = { send: '送分区', mid: '中档区', dist: '区分区' };
const TIER_NOTE = {
  send: '选 1–7 / 填 9–15 / 17–22，58 分，目标 100%',
  mid: '23 圆 / 24 二次函数 / 25 统计 / 26 含参二次，24 分，目标 90%',
  dist: '8 / 16 / 27 / 28 四道题，18 分，目标 50–70%',
};

/* ==========================================================
   页面骨架
   ========================================================== */
const NAV = [
  ['index.html', '首页'],
  ['concept.html', '概念自测'],
  ['drill.html', '分步刷题'],
  ['method.html', '方法卡'],
  ['map.html', '知识图谱'],
  ['graph.html', '公式库'],
  ['wrong.html', '错因诊断'],
];

function header(base, active) {
  const links = NAV.map(([href, label]) => {
    const on = href === active ? ' class="on"' : '';
    return `<a href="${base}${href}"${on}>${label}</a>`;
  }).join('');
  return `<header class="hdr">
  <div class="hdr-in">
    <a class="logo" href="${base}index.html">
      <span class="logo-mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20 L9 8 L13 14 L16 9 L21 20 Z"/><path d="M3 20 L21 20"/></svg></span>
      <span>${SITE_NAME}</span>
      <span class="logo-badge">数学</span>
    </a>
    <nav class="hdr-nav">${links}</nav>
    <div class="hdr-tools">
      <button class="theme-btn" aria-label="切换主题">☾</button>
      <button class="menu-btn" aria-label="菜单" aria-expanded="false">☰</button>
    </div>
  </div>
</header>`;
}

function footer(base) {
  return `<footer class="foot">
  <div class="foot-in">
    <div class="col">
      <div class="logo" style="margin-bottom:10px">
        <span class="logo-mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20 L9 8 L13 14 L16 9 L21 20 Z"/><path d="M3 20 L21 20"/></svg></span>
        <span>${SITE_NAME}</span>
        <span class="logo-badge">数学</span>
      </div>
      <p style="line-height:1.7;margin:0;color:var(--text-2)">面向北京中考数学的分步备考站：方法卡按「识别信号」组织，刷题按步骤判定，错题按错因归类。</p>
    </div>
    <div class="col">
      <h4>学习</h4>
      <a href="${base}drill.html">分步刷题</a>
      <a href="${base}method.html">方法卡</a>
      <a href="${base}map.html">知识图谱</a>
      <a href="${base}graph.html">公式库</a>
    </div>
    <div class="col">
      <h4>复盘</h4>
      <a href="${base}wrong.html">错因诊断</a>
      <a href="${base}index.html#tiers">三层分区</a>
    </div>
    <div class="col">
      <h4>说明</h4>
      <a href="${base}content.html">内容与口径</a>
    </div>
  </div>
  <div class="foot-bottom">
    <span>${SITE_NAME} · 对齐北京卷题型结构</span>
    <span>例题为原创 · 非真题 · 解答题不自动判分</span>
  </div>
</footer>`;
}

/** 每页独立渲染器：只收集该页公式，defs 才不会膨胀 */
function newRenderers() {
  const math = createMathRenderer();
  const fig = createFigureRenderer({ math });
  return { math, fig };
}

function page({ base = '', active = '', title, desc = '', body, script = '', data = [], useStep = false }) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  const dataTags = data.map((p) => `<script src="${base}dist/data/${p}.js?v=${JS_VER}"></script>`).join('');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%232563eb'/%3E%3Cstop offset='1' stop-color='%234f46e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='9' fill='url(%23g)'/%3E%3Ctext x='16' y='22' font-family='system-ui,sans-serif' font-size='14' font-weight='800' fill='%23fff' text-anchor='middle'%3E%E6%95%B0%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${base}assets/style.css?v=${CSS_VER}">
<script>try{var m=JSON.parse(localStorage.getItem('bj-theme-manual')||'null');var h=new Date().getHours();var t=(m==='light'||m==='dark')?m:((h>=19||h<6)?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){var h2=new Date().getHours();document.documentElement.setAttribute('data-theme',(h2>=19||h2<6)?'dark':'light');}</script>
</head>
<body data-base="${base}">
<div class="scroll-progress"></div>
${header(base, active)}
<main class="main">
<div class="wrap">
${body}
</div>
</main>
${footer(base)}
<script src="${base}assets/app.js?v=${JS_VER}"></script>
${useStep ? `<script src="${base}assets/step-engine.js?v=${SE_VER}"></script>` : ''}
${dataTags}
${script ? `<script>${script}</script>` : ''}
</body>
</html>`;
}

function emit(relPath, html) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
  const bytes = Buffer.byteLength(html, 'utf8');
  report.pages.push(relPath);
  report.bytes[relPath] = bytes;
  return bytes;
}

/* ==========================================================
   公式与图形：渲染进数据（供运行时与静态 HTML 共用）
   ========================================================== */
/** 把一题的 stem/steps/solution 渲染成 *Html 字段 */
function renderQuestion(q, R) {
  const C = R.math.compact;
  const o = Object.assign({}, q);
  o.stemHtml = C(R.math.render(q.stem || ''));
  o.solutionHtml = C(R.math.render(q.solution || ''));
  if (q.fig) o.figHtml = C(R.fig.render(q.fig));
  o.steps = (q.steps || []).map((s) => {
    const x = Object.assign({}, s, { askHtml: C(R.math.render(s.ask || '')) });
    if (s.hint) x.hintHtml = C(R.math.render(s.hint));
    if (s.why) x.whyHtml = C(R.math.render(s.why));
    // 选项也必须构建期渲染，否则引擎里只能显示 $...$ 原文
    if (s.options) x.optionsHtml = s.options.map((opt) => C(R.math.render(opt)));
    return x;
  });
  // 顶层选项（送分区单步题、timed 模式用）
  if (q.options) o.optionsHtml = q.options.map((opt) => C(R.math.render(opt)));
  return o;
}

/* ==========================================================
   数据分片
   ========================================================== */
function emitShards() {
  mkdirSync(join(OUT, 'dist/data'), { recursive: true });
  mkdirSync(join(OUT, 'dist/data/ch'), { recursive: true });

  /* meta：只有索引信息，不含任何题干正文 */
  const meta = {
    chapters: CHAPTERS.map((c) => ({
      id: c.id, no: c.no, name: c.name, block: c.block,
      prereq: c.prereq || [], examRefs: c.examRefs || [], tier: c.tier || [],
      methods: c.methods || [], summary: c.summary || '',
      qCount: (Q_BY_CHAPTER.get(c.id) || []).length,
      cCount: (C_BY_CHAPTER.get(c.id) || []).length,
    })),
    methods: METHODS.map((m) => ({
      id: m.id, chapter: m.chapter, name: m.name, tier: m.tier,
      motherId: m.motherId, variantIds: m.variantIds || [],
      qCount: (Q_BY_METHOD.get(m.id) || []).length,
    })),
    tiers: TIER_NAME,
    exam: EXAM_STRUCTURE,
    stats: STATS,
  };
  writeFileSync(join(OUT, 'dist/data/meta.js'),
    'window.BJM=window.BJM||{};window.BJM.META=' + JSON.stringify(meta) + ';');

  /* 按章分片：每章一个文件，含该章的题与概念卡。
     这样 drill 页可以按需加载，单章页只引自己的分片。
     每章用独立渲染器，defs 不会跨章膨胀。 */
  const sizes = {};
  let totalBytes = 0;
  CHAPTERS.forEach((c) => {
    const R = newRenderers();
    const C = R.math.compact;
    const qs = (Q_BY_CHAPTER.get(c.id) || []).map((q) => renderQuestion(q, R));
    const cs = (C_BY_CHAPTER.get(c.id) || []).map((x) => ({
      id: x.id, chapter: x.chapter,
      claim: x.claim, claimHtml: C(R.math.render(x.claim || '')),
      must: x.must || [], mustHtml: (x.must || []).map((m) => C(R.math.render(m))),
      tests: (x.tests || []).map((t) => ({
        q: t.q, a: t.a, why: t.why,
        qHtml: C(R.math.render(t.q || '')), whyHtml: C(R.math.render(t.why || '')),
      })),
    }));
    /* 关键：构建期渲染的 <use href="#MJX-..."> 依赖共享字形 defs。
       分片被 drill 页动态加载时，页面本身没有这些 defs，公式会全部不可见。
       所以每个分片自带 defs，加载时注入到 body。 */
    const defsHtml = R.math.defs();
    const payload = 'window.BJM=window.BJM||{};window.BJM.CH=window.BJM.CH||{};' +
      'window.BJM.CH[' + JSON.stringify(c.id) + ']={questions:' + JSON.stringify(qs) +
      ',concepts:' + JSON.stringify(cs) + ',defs:' + JSON.stringify(defsHtml) + '};';
    writeFileSync(join(OUT, `dist/data/ch/${c.id}.js`), payload);
    const b = Buffer.byteLength(payload, 'utf8');
    sizes[c.id] = b;
    totalBytes += b;
    report.mathFailures.push(...R.math.failures());
    report.figFailures.push(...R.fig.failures());
  });

  return {
    renderedCount: QUESTIONS.length,
    conceptCount: CONCEPTS.length,
    sizes,
    shardBytes: totalBytes,
  };
}

/* ==========================================================
   页面 1：首页
   ========================================================== */
function buildHome() {
  const R = newRenderers();
  const totalQ = QUESTIONS.length;
  const totalM = METHODS.length;
  const totalC = CHAPTERS.length;

  const tierRows = ['send', 'mid', 'dist'].map((t) => {
    const qs = QUESTIONS.filter((q) => q.tier === t);
    const methods = METHODS.filter((m) => m.tier === t);
    const ready = qs.length > 0;
    return `<div class="coverage-row ${ready ? 'on' : 'off'}">
      <span class="cv-score">${t === 'send' ? '58' : t === 'mid' ? '24' : '18'}</span>
      <span class="cv-part">${TIER_NAME[t]}</span>
      <span class="cv-note">${TIER_NOTE[t]}<span class="cv-own">本站：${qs.length} 题 · ${methods.length} 张方法卡</span></span>
      <span class="cv-flag">${ready ? '✓ 已覆盖' : '建设中'}</span>
    </div>`;
  }).join('');

  const methodCards = METHODS.map((m) => {
    const ch = CH_BY_ID.get(m.chapter);
    return `<a class="card track-card" href="method/${m.id}.html">
      <div class="track-head">
        <span class="track-ico ${m.tier === 'dist' ? 'rose' : 'purple'}">${m.tier === 'dist' ? '🎯' : '📐'}</span>
        <div>
          <span class="track-step">${esc(ch ? ch.name : '')} · ${TIER_NAME[m.tier]}</span>
          <h3>${esc(m.name)}</h3>
        </div>
      </div>
      <p class="desc">${R.math.render(m.signal)}</p>
      <div class="track-meta">
        <span>${(m.steps || []).length} 步</span>
        <span>${(m.pitfalls || []).length} 个误用</span>
        <span>${(m.variantIds || []).length + 1} 题</span>
      </div>
      <span class="track-go">看方法卡 →</span>
    </a>`;
  }).join('');

  const body = `
<section class="hero">
  <div class="hero-split">
    <div>
      <div class="hero-badge"><span class="dot-live"></span>P0 管线验证版 · 对齐北京卷 28 题结构</div>
      <h1>北京中考数学，<br><span class="accent-word">先看懂题，再动手算</span></h1>
      <p class="lede">
 本站不按「知识点清单」组织，而按<b>方法</b>组织：每张方法卡第一行写的是
 <b>「题面出现什么时该想到它」</b>，然后给 3–5 步标准流程、常见误用、母题精讲与三个变式。
 刷题按<b>步骤</b>判定——答错时系统记下你卡在第几步，而不是只记一个「错」。
 </p>
      <div class="hero-cta">
        <a class="btn primary" href="drill.html">开始分步刷题 <span aria-hidden="true">→</span></a>
        <a class="btn" href="method.html">看方法卡</a>
        <a class="btn ghost" href="map.html">知识图谱</a>
      </div>
      <div class="hero-trust">
        <span><b>✓</b> 步骤级判定，不只对错</span>
        <span><b>✓</b> 错题按五类错因归类</span>
        <span><b>✓</b> 离线可用 · 档案备份</span>
      </div>
    </div>

    <div class="cockpit-card" id="today">
      <div class="cockpit-top">
        <span class="level-pill" id="cLevel">🏅 Lv.1 起步 · 0 XP</span>
        <button class="countdown-pill" data-open-exam="1" id="cCountdown">📅 <span>设置中考倒计时</span></button>
      </div>
      <div class="cockpit-metrics">
        <div class="streak-box"><b id="tStreak">0</b><span>天连学</span></div>
        <div class="today-goal">
          <div class="today-goal-row">
            <span>今日题量 <b id="tQ">0</b> / <b id="tGoal">20</b> 题</span>
            <span class="today-pct" id="tPct">0%</span>
          </div>
          <div class="bar"><i id="tBar" style="width:0%"></i></div>
          <div class="cockpit-sub">
            <span id="cTarget">目标：95 分以上</span>
            <a href="wrong.html" style="font-weight:600">看错因诊断 →</a>
          </div>
        </div>
      </div>
      <div class="mission-list">
        <a class="mission-item" href="drill.html">
          <span class="mi-ico blue">📝</span>
          <span class="mi-main"><b>分步刷题</b><small>按分层 / 章节 / 方法筛选，逐步判定</small></span>
          <span class="mi-go">去练 →</span>
        </a>
        <a class="mission-item" href="method.html">
          <span class="mi-ico purple">📐</span>
          <span class="mi-main"><b>方法卡</b><small>按「识别信号」找方法，不是按章节</small></span>
          <span class="mi-go">去看 →</span>
        </a>
        <a class="mission-item" href="wrong.html">
          <span class="mi-ico rose">🎯</span>
          <span class="mi-main"><b>错因诊断</b><small>五类错因分栏，各给不同补救</small></span>
          <span class="mi-go">查看 →</span>
        </a>
      </div>
    </div>
  </div>
</section>

<section class="section reveal" id="tiers">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">卷面分层</span>
      <h2>100 分不是均匀分布的</h2>
      <span class="sub">送分区 58 分要拿满，中档区 24 分靠方法，区分区 18 分只求拿一半——三层目标完全不同，练法也不同</span>
    </div>
  </div>
  <div class="coverage-list">${tierRows}</div>
  <div class="coverage-total">
    <span>当前站内题量 <b>${totalQ}</b> 题 · <b>${totalM}</b> 张方法卡 · <b>${totalC}</b> 章</span>
  </div>
</section>

<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">方法卡</span>
      <h2>先认题型，再谈方法</h2>
      <span class="sub">每张卡第一行是「识别信号」——什么题面出现时该想到它。这是理科与背单词最不一样的地方</span>
    </div>
    <a class="btn sm soft" href="method.html">全部方法卡 →</a>
  </div>
  <div class="grid c2 track-grid">${methodCards}</div>
</section>

<section class="section reveal">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">这个版本做了什么</span>
      <h2>P0：先证明管线成立</h2>
      <span class="sub">公式、图形、分步引擎三件技术未知，各用最小内容验证。内容规模在 P1 之后铺开</span>
    </div>
  </div>
  <div class="grid c3">
    <div class="card tool-card">
      <div class="card-ico blue">∑</div>
      <h3>公式构建期预渲染</h3>
      <p class="desc">MathJax 在构建时输出内联 SVG，共享字形缓存。运行时零依赖、零字体文件，<code>file://</code> 直接可读。</p>
      <div class="meta" style="margin-top:12px">单条约 1.4 KB · 全局字形 defs</div>
    </div>
    <div class="card tool-card">
      <div class="card-ico purple">△</div>
      <h3>几何图声明式生成</h3>
      <p class="desc">数据里只写坐标与元素类型，构建期编译成 SVG。不用 foreignObject，<code>file://</code> 下也不错位。</p>
      <div class="meta" style="margin-top:12px">13 种原语 · 单图约 1.6 KB</div>
    </div>
    <div class="card tool-card">
      <div class="card-ico ok">⋯</div>
      <h3>步骤级判定</h3>
      <p class="desc">判定的单位是「步」不是「题」。答错时记下卡在第几步——这是错因诊断的原始数据，四选一记不出来。</p>
      <div class="meta" style="margin-top:12px">三种模式 · stuckStep 落库</div>
    </div>
  </div>
</section>
`;

  const script = `
(function(){
  function refresh(){
    var li = BJM.levelInfo();
    var lv = document.getElementById('cLevel');
    if (lv) lv.textContent = '🏅 Lv.' + li.level + ' ' + li.name + ' · ' + li.xp + ' XP';
    var ts = document.getElementById('tStreak'); if (ts) ts.textContent = BJM.streak();
    var tq = document.getElementById('tQ'); if (tq) tq.textContent = BJM.todayQuestions();
    var tg = document.getElementById('tGoal'); if (tg) tg.textContent = BJM.goal();
    var tp = document.getElementById('tPct'); if (tp) tp.textContent = BJM.todayPct() + '%';
    var tb = document.getElementById('tBar'); if (tb) tb.style.width = BJM.todayPct() + '%';
    var cd = document.getElementById('cCountdown');
    var d = BJM.daysLeft();
    if (cd) cd.innerHTML = d == null ? '📅 <span>设置中考倒计时</span>'
      : (d >= 0 ? '📅 距中考 <b>' + d + '</b> 天' : '📅 中考已过 <b>' + (-d) + '</b> 天');
    var pf = BJM.profile();
    var ct = document.getElementById('cTarget');
    if (ct) ct.textContent = '目标：' + (pf.target || '95') + ' 分以上';
  }
  BJM.ready(refresh);
  document.addEventListener('bj:day', refresh);
  document.addEventListener('bj:qlog', refresh);
  document.addEventListener('bj:profile', refresh);
  document.addEventListener('bj:goal', refresh);

  document.querySelectorAll('[data-open-exam]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      var pf = BJM.profile();
      var d = window.prompt('请输入中考日期（格式 2027-06-24）', pf.examDate || '');
      if (d === null) return;
      var t = window.prompt('目标总分（如 95）', pf.target || '95');
      if (t === null) return;
      BJM.saveProfile({ examDate: d.trim(), target: t.trim() });
      BJM.toast('已保存中考倒计时');
      refresh();
    });
  });
})();
`;

  const html = page({ active: 'index.html', title: '北京中考数学分步备考系统', desc: '按方法卡组织、步骤级判定、错因分类的北京中考数学备考站。', body, script });
  // 首页需要公式 defs（方法卡信号里有公式）
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 2：方法卡索引
   ========================================================== */
function buildMethodIndex() {
  const R = newRenderers();
  const blocks = [...new Set(METHODS.map((m) => (CH_BY_ID.get(m.chapter) || {}).block || '其他'))];

  const groups = blocks.map((block) => {
    const list = METHODS.filter((m) => ((CH_BY_ID.get(m.chapter) || {}).block || '其他') === block);
    const cards = list.map((m) => {
      const ch = CH_BY_ID.get(m.chapter);
      return `<a class="card" href="method/${m.id}.html">
        <div class="card-ico ${m.tier === 'dist' ? 'rose' : 'purple'}">${m.tier === 'dist' ? '🎯' : '📐'}</div>
        <h3>${esc(m.name)}</h3>
        <div class="meta">${esc(ch ? ch.name : '')} · ${TIER_NAME[m.tier]}</div>
        <p class="desc" style="margin-top:8px;font-size:.86rem">${R.math.render(m.signal)}</p>
      </a>`;
    }).join('');
    return `<section class="section">
      <div class="section-head">
        <div class="section-head-left">
          <span class="kicker">${esc(block)}</span>
          <h2>${list.length} 张方法卡</h2>
        </div>
      </div>
      <div class="grid c3">${cards}</div>
    </section>`;
  }).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 方法卡</div>
  <h1>方法卡索引</h1>
  <p class="lede">按<b>方法</b>组织，不按章节。搜索框支持输入题面片段——学生记不住「二次函数区间最值」这个名字，但记得「m≤x≤n」。</p>
</div>

<section class="section" style="margin-top:20px">
  <div class="card" style="padding:18px 20px">
    <label class="field" style="display:flex;gap:10px;align-items:center">
      <span class="kicker" style="white-space:nowrap">按信号搜索</span>
      <input id="mSearch" type="text" placeholder="输入题面片段，如：三条线段 / 中点 / m≤x≤n / 切线" style="flex:1;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border-2);background:var(--surface);color:var(--text);font-size:.95rem">
    </label>
    <div id="mHint" class="setup-hint" style="margin-top:10px">共 ${METHODS.length} 张卡 · 输入关键词实时过滤</div>
  </div>
</section>

<div id="mGroups">${groups}</div>
`;

  const script = `
(function(){
  var input = document.getElementById('mSearch');
  var hint = document.getElementById('mHint');
  var groups = document.getElementById('mGroups');
  var cards = [].slice.call(groups.querySelectorAll('.card'));
  // 建立每张卡的检索文本（含识别信号纯文本）
  var meta = window.BJM.META || { methods: [] };
  cards.forEach(function(c){
    c.__text = (c.textContent || '').replace(/\\s+/g, '');
  });
  input.addEventListener('input', function(){
    var q = input.value.trim().replace(/\\s+/g, '');
    var shown = 0;
    cards.forEach(function(c){
      var hit = !q || c.__text.indexOf(q) >= 0;
      c.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    // 隐藏空分组
    [].forEach.call(groups.querySelectorAll('.section'), function(sec){
      var any = [].some.call(sec.querySelectorAll('.card'), function(c){ return c.style.display !== 'none'; });
      sec.style.display = any ? '' : 'none';
    });
    hint.textContent = q ? ('命中 ' + shown + ' / ' + cards.length + ' 张卡') : ('共 ' + cards.length + ' 张卡 · 输入关键词实时过滤');
  });
})();
`;

  const html = page({ active: 'method.html', title: '方法卡索引', desc: '按识别信号组织的中考数学方法卡。', body, script, data: ['meta'] });
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 3：单张方法卡
   ========================================================== */
function buildMethodCard(m) {
  const R = newRenderers();
  const B = '../';   // 方法卡在 method/ 子目录，正文链接都要带 ../
  const ch = CH_BY_ID.get(m.chapter);
  const qs = Q_BY_METHOD.get(m.id) || [];
  const mother = Q_BY_ID.get(m.motherId) || qs.find((q) => !q.variantOf);
  const variants = (m.variantIds || []).map((id) => Q_BY_ID.get(id)).filter(Boolean);

  const stepsHtml = (m.steps || []).map((s, i) => `<li class="flow-item">
    <span class="flow-no">${i + 1}</span>
    <div class="flow-body">
      <h4>${esc(s.label)}</h4>
      ${s.ask ? `<p>${R.math.render(s.ask)}</p>` : ''}
    </div>
    <span class="flow-score">${s.score || 1} 分</span>
  </li>`).join('');

  const trapsHtml = (m.pitfalls || []).map((p) => `<div class="trap">
    <div class="trap-t">${esc(p.t)}</div>
    <div class="trap-row bad"><span class="mark">✕</span><span>${R.math.render(p.bad)}</span></div>
    <div class="trap-row good"><span class="mark">✓</span><span>${R.math.render(p.good)}</span></div>
    <div class="trap-why">${R.math.render(p.why)}</div>
  </div>`).join('');

  const motherHtml = mother ? renderQuestion(mother, R) : null;
  const variantHtml = variants.map((v) => renderQuestion(v, R));

  const motherBlock = motherHtml ? `
  <details class="gcard" style="margin-top:16px">
    <summary>
      <span class="gcard-name">母题精讲</span>
      <span class="lv lv-b2">${esc(motherHtml.tierName || '')}</span>
      <span class="gcard-meta">${motherHtml.score || 0} 分</span>
    </summary>
    <div class="gcard-body">
      <div class="gsec"><div class="gsec-t">题目</div><div class="se-stem">${motherHtml.stemHtml}</div>
        ${motherHtml.figHtml ? `<div class="se-fig">${motherHtml.figHtml}</div>` : ''}</div>
      <div class="gsec"><div class="gsec-t">完整解答</div><div style="font-size:.92rem;line-height:1.9;white-space:pre-wrap">${motherHtml.solutionHtml}</div></div>
      <a class="btn primary sm" href="${B}drill.html?method=${m.id}&mode=guided">按步骤做这道题 →</a>
    </div>
  </details>` : '';

  const variantBlock = variantHtml.length ? `
<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">变式链</span>
      <h2>同一套步骤，三种改法</h2>
      <span class="sub">改数字练熟练、改条件练敏感、逆向问练迁移——三个都做对，这张卡才算过关</span>
    </div>
  </div>
  <div class="grid c3">
    ${variantHtml.map((v) => `<div class="card">
      <div class="card-ico ${v.changed === 'condition' ? 'purple' : v.changed === 'reverse' ? 'rose' : 'blue'}">${
        v.changed === 'condition' ? '⇄' : v.changed === 'reverse' ? '↺' : '#'
      }</div>
      <h3>${v.changed === 'number' ? '改数字' : v.changed === 'condition' ? '改条件' : '逆向问'}</h3>
      <p class="desc" style="margin-top:8px;font-size:.88rem">${v.stemHtml}</p>
      <div class="meta" style="margin-top:10px">${v.score || 0} 分 · ${(v.steps || []).length} 步</div>
    </div>`).join('')}
  </div>
  <div style="margin-top:16px;text-align:center">
    <a class="btn primary" href="${B}drill.html?method=${m.id}&mode=guided">连做母题 + 3 变式 →</a>
  </div>
</section>` : '';

  const body = `
<div class="page-head">
  <div class="crumb"><a href="${B}index.html">首页</a> / <a href="${B}method.html">方法卡</a> / ${esc(m.name)}</div>
  <h1>${esc(m.name)}</h1>
  <p class="lede">${esc(ch ? ch.name : '')} · ${TIER_NAME[m.tier]} · ${(m.steps || []).length} 步 · ${qs.length} 题</p>
</div>

<section class="section" style="margin-top:18px">
  <div class="card" style="padding:20px 22px;border-left:4px solid var(--accent)">
    <div class="kicker" style="margin-bottom:8px">① 识别信号 · 看到这些就该想到它</div>
    <p style="margin:0;font-size:1.02rem;line-height:1.85">${R.math.render(m.signal)}</p>
  </div>
</section>

<section class="section" style="margin-top:20px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">② 标准步骤</span>
      <h2>${(m.steps || []).length} 步，每步一个给分点</h2>
      <span class="sub">步骤只写「做什么」，不写「答案是什么」——这样自查时才知道自己卡在哪一步</span>
    </div>
  </div>
  <ol class="step-flow">${stepsHtml}</ol>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">③ 常见误用</span>
      <h2>${(m.pitfalls || []).length} 个高频错误</h2>
    </div>
  </div>
  <div class="traps">${trapsHtml}</div>
</section>

<section class="section" style="margin-top:8px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">④ 母题精讲</span>
      <h2>这道题完整走一遍</h2>
      <span class="sub">默认折叠：先自己在纸上做，做不出来再展开</span>
    </div>
  </div>
  ${motherBlock}
</section>

${variantBlock}

<section class="section" style="margin-top:28px">
  <div class="grid c2">
    <a class="card tool-card" href="${B}drill.html?method=${m.id}&mode=guided">
      <div class="card-ico blue">📝</div>
      <h3>引导模式：逐步作答</h3>
      <p class="desc">每一步问一次，答错立刻给提示。适合刚看完方法卡、还不熟的时候。</p>
      <div class="meta" style="margin-top:10px">答错会记下卡在第几步</div>
    </a>
    <a class="card tool-card" href="${B}drill.html?method=${m.id}&mode=selfcheck">
      <div class="card-ico purple">✓</div>
      <h3>自查模式：先做后对</h3>
      <p class="desc">只给步骤骨架，你在纸上做完再逐步勾选。适合已经会、只缺熟练度的时候。</p>
      <div class="meta" style="margin-top:10px">勾「卡住」给分层提示</div>
    </a>
  </div>
</section>
`;

  const html = page({
    base: '../', active: 'method.html',
    title: `${m.name} · 方法卡`,
    desc: `${m.name}：识别信号、${(m.steps || []).length} 步标准流程、常见误用、母题与三个变式。`,
    body,
  });
  return html.replace('<body data-base="../">', `<body data-base="../">\n${R.math.defs()}`);
}

/* ==========================================================
   页面：概念自测
   只考条件，不考背诵。三题型：给条件判结论 / 反推缺条件 / 判断命题真假。
   ========================================================== */
function buildConcept() {
  const R = newRenderers();
  const blocks = [...new Set(CHAPTERS.map((c) => c.block))];

  const blockHtml = blocks.map((block) => {
    const list = CHAPTERS.filter((c) => c.block === block);
    const rows = list.map((c) => {
      const n = (C_BY_CHAPTER.get(c.id) || []).length;
      const t = (C_BY_CHAPTER.get(c.id) || []).reduce((a, x) => a + (x.tests || []).length, 0);
      return `<a class="card" href="concept.html?chapter=${c.id}">
        <div class="card-ico">${c.no}</div>
        <h3>${esc(c.name)}</h3>
        <div class="meta">${n} 条概念 · ${t} 个判断</div>
      </a>`;
    }).join('');
    return `<section class="section">
      <div class="section-head"><div class="section-head-left">
        <span class="kicker">${esc(block)}</span><h2>${list.length} 章</h2>
      </div></div>
      <div class="grid c3">${rows}</div>
    </section>`;
  }).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 概念自测</div>
  <h1>概念自测</h1>
  <p class="lede">理科的失分多数不是「记不住」，而是<b>条件不满足还硬套</b>。这一页不考背诵定义，只考三件事：给条件判结论、给结论反推缺什么条件、判断命题真假。</p>
</div>

<section class="section" style="margin-top:20px" id="setup">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>开始自测</h3>
      <div class="setup-actions">
        <button class="btn primary" id="startBtn">开始 →</button>
      </div>
    </div>
    <div class="setup-grid">
      <div class="setup-group">
        <div class="kicker">范围</div>
        <div class="chips" id="scopeChips">
          <button class="chip on" data-s="all">全部章节</button>
          <button class="chip" data-s="wrong">只练答错的</button>
          <button class="chip" data-s="due">到期复习</button>
        </div>
        <p class="setup-hint" id="scopeHint">共 ${STATS.conceptTests} 个判断</p>
      </div>
      <div class="setup-group">
        <div class="kicker">本组题量</div>
        <div class="chips" id="lenChips">
          <button class="chip" data-l="10">10</button>
          <button class="chip on" data-l="20">20</button>
          <button class="chip" data-l="30">30</button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="zone" style="display:none;margin-top:24px">
  <div id="stage"></div>
</section>

<div id="chapters">${blockHtml}</div>
`;

  const script = `
(function(){
  /* 关键：不能在这里快照 window.BJM.CH——分片是点击后才异步加载的，
     快照会永远指向空对象。每次用都现读。 */
  function CH(){ return window.BJM.CH || {}; }
  var params = new URLSearchParams(location.search);
  var onlyChapter = params.get('chapter') || '';
  var scope = 'all', len = 20;
  var loaded = {};

  var defsInjected = {};
  function loadAll(){
    var meta = window.BJM.META;
    var ids = meta.chapters.map(function(c){ return c.id; });
    return Promise.all(ids.map(function(id){
      if (loaded[id]) return null;
      return new Promise(function(res){
        var s = document.createElement('script');
        s.src = 'dist/data/ch/' + id + '.js';
        s.onload = function(){
          loaded[id] = 1;
          // 注入字形 defs，否则公式不可见
          var d = window.BJM.CH[id] && window.BJM.CH[id].defs;
          if (d && !defsInjected[d]) {
            defsInjected[d] = 1;
            var box = document.createElement('div');
            box.innerHTML = d;
            document.body.appendChild(box.firstChild || box);
          }
          res();
        };
        s.onerror = function(){ res(); };
        document.head.appendChild(s);
      });
    }));
  }

  function allConcepts(){
    var out = [];
    var ch = CH();
    Object.keys(ch).forEach(function(id){
      (ch[id].concepts || []).forEach(function(c){ out.push(c); });
    });
    return out;
  }

  function buildPool(){
    var cs = allConcepts();
    if (onlyChapter) cs = cs.filter(function(c){ return c.chapter === onlyChapter; });
    // 展开成单个判断
    var items = [];
    cs.forEach(function(c){
      (c.tests || []).forEach(function(t, i){
        items.push({ cid: c.id, idx: i, chapter: c.chapter, claim: c.claim,
          claimHtml: c.claimHtml, q: t.q, qHtml: t.qHtml, a: t.a, why: t.why, whyHtml: t.whyHtml });
      });
    });
    if (scope === 'wrong') {
      var w = BJM.csrsAll();
      items = items.filter(function(x){ return w[x.cid + '#' + x.idx] && !w[x.cid + '#' + x.idx].lastOk; });
    } else if (scope === 'due') {
      var due = BJM.csrsDue(items.map(function(x){ return x.cid + '#' + x.idx; }));
      var set = {}; due.forEach(function(k){ set[k] = 1; });
      items = items.filter(function(x){ return set[x.cid + '#' + x.idx]; });
    }
    return items;
  }

  function pick(sel, attr, cb){
    [].forEach.call(document.querySelectorAll(sel + ' .chip'), function(c){
      c.addEventListener('click', function(){
        [].forEach.call(document.querySelectorAll(sel + ' .chip'), function(x){ x.classList.remove('on'); });
        c.classList.add('on'); cb(c.getAttribute(attr));
      });
    });
  }
  pick('#scopeChips', 'data-s', function(v){ scope = v; refreshHint(); });
  pick('#lenChips', 'data-l', function(v){ len = parseInt(v, 10); });

  function refreshHint(){
    var n = buildPool().length;
    var el = document.getElementById('scopeHint');
    if (el) el.textContent = '当前范围 ' + n + ' 个判断';
  }

  // 概念题的「步骤」就是单个判断
  function toQuestion(x){
    return {
      id: x.cid + '#' + x.idx,
      chapter: x.chapter,
      tier: 'send',
      tierName: x.claim || '概念判断',
      stem: '',
      stemHtml: '<div class="c-claim">' + (x.claimHtml || x.claim || '') + '</div><div class="c-q">' + (x.qHtml || x.q) + '</div>',
      steps: [{
        label: '判断正误',
        ask: '这个说法成立吗？',
        type: 'judge',
        key: x.a,
        score: 1,
        why: x.why,
        whyHtml: x.whyHtml || x.why,
      }],
      solution: x.why,
      solutionHtml: x.whyHtml || x.why,
      errorTags: ['concept'],
      __conceptId: x.cid,
      __testIdx: x.idx,
    };
  }

  document.getElementById('startBtn').addEventListener('click', function(){
    loadAll().then(function(){
      var pool = buildPool();
      if (!pool.length) { BJM.toast('当前范围没有概念题'); return; }
      document.getElementById('setup').style.display = 'none';
      document.getElementById('zone').style.display = '';
      document.getElementById('chapters').style.display = 'none';
      var qs = pool.map(toQuestion);
      BJM.step({
        mount: '#stage',
        questions: qs,
        mode: 'guided',
        limit: len,
        shuffle: true,
        backHref: 'concept.html',
        backLabel: '重新选范围',
        onAnswer: function(q, ok, rec){
          var key = q.__conceptId + '#' + q.__testIdx;
          var r = BJM.csrsRate(key, ok ? 2 : 0);
          r.lastOk = ok;
          BJM.qRecord({ id: key, chapter: q.chapter, tier: 'send', result: rec.result,
            stuckStep: rec.stuckStep, errorType: ok ? null : 'concept', timeMs: rec.timeMs, src: 'concept' });
          BJM.bumpDay('questions', 1);
        },
        onFinish: function(res){ if (res.rate >= 90) BJM.sfx('win'); }
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  if (onlyChapter) {
    var c = (window.BJM.META.chapters || []).find(function(x){ return x.id === onlyChapter; });
    if (c) {
      var banner = document.createElement('div');
      banner.className = 'note';
      banner.style.cssText = 'margin:18px 0;border-left-color:var(--accent)';
      banner.innerHTML = '当前范围：<b>' + c.name + '</b>（' + c.cCount + ' 条概念）· <a href="concept.html">切回全部 →</a>';
      document.getElementById('setup').parentNode.insertBefore(banner, document.getElementById('setup'));
      document.getElementById('chapters').style.display = 'none';
    }
  }

  BJM.ready(refreshHint);
})();
`;

  const html = page({
    active: 'concept.html', title: '概念自测',
    desc: '只考条件不考背诵：给条件判结论、反推缺条件、判断命题真假。',
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 4：刷题配置页
   ========================================================== */
function buildDrill() {
  const R = newRenderers();
  const methodOpts = METHODS.map((m) =>
    `<option value="${m.id}">${esc(m.name)}（${TIER_NAME[m.tier]}）</option>`).join('');
  const chapterOpts = CHAPTERS.map((c) =>
    `<option value="${c.id}">${c.no}. ${esc(c.name)}</option>`).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 分步刷题</div>
  <h1>分步刷题</h1>
  <p class="lede">判定的单位是<b>步骤</b>，不是整题。答错时系统记下你卡在第几步，这是错因诊断的依据。</p>
</div>

<section class="section" style="margin-top:20px" id="setup">
  <div class="card setup-card">
    <div class="setup-head">
      <h3>配置本组练习</h3>
      <div class="setup-actions">
        <button class="btn primary" id="startBtn">开始 →</button>
      </div>
    </div>

    <div class="setup-grid">
      <div class="setup-group">
        <div class="kicker">作答模式</div>
        <div class="chips" id="modeChips">
          <button class="chip on" data-m="guided">引导 · 逐步作答</button>
          <button class="chip" data-m="selfcheck">自查 · 先做后对</button>
        </div>
        <p class="setup-hint"><b>引导</b>每步一问，答错给提示；<b>自查</b>只给步骤骨架，你勾选做出来/卡住</p>
      </div>

      <div class="setup-group">
        <div class="kicker">练习范围</div>
        <div class="chips" id="scopeChips">
          <button class="chip on" data-s="all">全部</button>
          <button class="chip" data-s="wrong">只练错题</button>
          <button class="chip" data-s="weak">专攻最弱方法</button>
        </div>
        <p class="setup-hint" id="scopeHint">共 ${QUESTIONS.length} 题可练</p>
      </div>

      <div class="setup-group">
        <div class="kicker">方法卡</div>
        <select id="methodSel" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--border-2);background:var(--surface);color:var(--text);font-size:.92rem">
          <option value="">不限方法（全部）</option>
          ${methodOpts}
        </select>
      </div>

      <div class="setup-group">
        <div class="kicker">章节</div>
        <select id="chapterSel" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--border-2);background:var(--surface);color:var(--text);font-size:.92rem">
          <option value="">不限章节（全部）</option>
          ${chapterOpts}
        </select>
      </div>

      <div class="setup-group">
        <div class="kicker">本组题量</div>
        <div class="chips" id="lenChips">
          <button class="chip" data-l="4">4 题</button>
          <button class="chip on" data-l="8">8 题</button>
          <button class="chip" data-l="12">12 题</button>
          <button class="chip" data-l="20">20 题</button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="zone" style="display:none;margin-top:24px">
  <div id="stage"></div>
</section>
`;

  const script = `
(function(){
  var META = (window.BJM && window.BJM.META) || { methods: [], chapters: [] };
  var QS = [];
  var loadedAll = false;

  /** 按需加载全部章节分片，拼成扁平题库 */
  function loadAllQuestions(){
    if (loadedAll) return Promise.resolve(QS);
    var ids = (META.chapters || []).map(function(c){ return c.id; });
    return Promise.all(ids.map(function(id){
      return new Promise(function(res){
        var s = document.createElement('script');
        s.src = 'dist/data/ch/' + id + '.js';
        s.onload = res; s.onerror = res;
        document.head.appendChild(s);
      });
    })).then(function(){
      var CH = window.BJM.CH || {};
      QS = [];
      var seenDefs = {};
      Object.keys(CH).forEach(function(id){
        (CH[id].questions || []).forEach(function(q){ QS.push(q); });
        // 注入该章的字形 defs（只注入一次，按内容去重）
        var d = CH[id].defs;
        if (d && !seenDefs[d]) {
          seenDefs[d] = 1;
          var box = document.createElement('div');
          box.innerHTML = d;
          document.body.appendChild(box.firstChild || box);
        }
      });
      loadedAll = true;
      return QS;
    });
  }
  var params = new URLSearchParams(location.search);
  var mode = params.get('mode') === 'selfcheck' ? 'selfcheck' : 'guided';
  var scope = 'all';
  var len = parseInt(params.get('n'), 10) || 8;

  // URL 预填（方法卡页跳过来时带 ?method=&mode=）
  var preMethod = params.get('method') || '';
  if (preMethod) {
    var sel = document.getElementById('methodSel');
    if (sel) sel.value = preMethod;
    var sc = document.querySelector('#scopeChips .chip[data-s="all"]');
    if (sc) sc.classList.add('on');
  }
  [].forEach.call(document.querySelectorAll('#modeChips .chip'), function(c){
    c.classList.toggle('on', c.getAttribute('data-m') === mode);
  });

  function pick(sel, attr, cb){
    [].forEach.call(document.querySelectorAll(sel + ' .chip'), function(c){
      c.addEventListener('click', function(){
        [].forEach.call(document.querySelectorAll(sel + ' .chip'), function(x){ x.classList.remove('on'); });
        c.classList.add('on'); cb(c.getAttribute(attr));
      });
    });
  }
  pick('#modeChips', 'data-m', function(v){ mode = v; });
  pick('#scopeChips', 'data-s', function(v){ scope = v; });
  pick('#lenChips', 'data-l', function(v){ len = parseInt(v, 10); });

  function refreshHint(){
    var n = pool().length;
    var el = document.getElementById('scopeHint');
    if (el) el.textContent = '当前筛选下 ' + n + ' 题可练';
  }

  function pool(){
    var out = QS.slice();
    var mid = document.getElementById('methodSel').value;
    var cid = document.getElementById('chapterSel').value;
    if (mid) out = out.filter(function(q){ return q.method === mid; });
    if (cid) out = out.filter(function(q){ return q.chapter === cid; });
    if (scope === 'wrong') {
      var w = BJM.wrongMap();
      out = out.filter(function(q){ return !!w[q.id]; });
    } else if (scope === 'weak') {
      var rates = BJM.methodRates();
      if (rates.length) {
        var weakest = rates[0].key;
        out = out.filter(function(q){ return q.method === weakest; });
      }
    }
    return out;
  }

  document.getElementById('methodSel').addEventListener('change', refreshHint);
  document.getElementById('chapterSel').addEventListener('change', refreshHint);
  [].forEach.call(document.querySelectorAll('#scopeChips .chip'), function(c){
    c.addEventListener('click', refreshHint);
  });
  refreshHint();

  document.getElementById('startBtn').addEventListener('click', function(){
    loadAllQuestions().then(function(){
    var p = pool();
    if (!p.length) { BJM.toast('当前筛选下没有题目，换个条件试试'); return; }
    document.getElementById('setup').style.display = 'none';
    document.getElementById('zone').style.display = '';

    BJM.step({
      mount: '#stage',
      questions: p,
      mode: mode,
      limit: len,
      shuffle: true,
      wrongHref: 'wrong.html',
      backHref: 'drill.html',
      backLabel: '重新配置',
      onStep: function(q, idx, ok){ /* 步骤级埋点，P3 用于卡点统计 */ },
      onAnswer: function(q, ok, rec){
        // 自动推断错因：guided 模式可按 stuckStep 位置判断
        var et = 'method';
        if (rec.stuckStep === 0) et = 'concept';
        else if (rec.stuckStep >= 0 && rec.stuckStep >= (q.steps || []).length - 1) et = 'calc';
        BJM.qRecord({
          id: q.id, chapter: q.chapter, method: q.method, tier: q.tier,
          result: rec.result, stuckStep: rec.stuckStep, errorType: ok ? null : et,
          timeMs: rec.timeMs, src: mode
        });
        if (q.variantOf && BJM.methodRecord) {
          BJM.methodRecord(q.method, q.id, ok);
        }
        BJM.bumpDay('questions', 1);
      },
      onFinish: function(res){
        if (res.rate >= 90) BJM.sfx('win');
      }
    });
    var zone = document.getElementById('zone');
    window.scrollTo({ top: Math.max(0, zone.getBoundingClientRect().top + window.scrollY - 80), behavior: 'smooth' });
    });
  });
})();
`;

  const html = page({
    active: 'drill.html', title: '分步刷题',
    desc: '按步骤判定的中考数学刷题：引导模式与自查模式。',
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 5：知识图谱
   ========================================================== */
function buildMap() {
  const R = newRenderers();
  const blocks = [...new Set(CHAPTERS.map((c) => c.block))];

  const blockHtml = blocks.map((block) => {
    const list = CHAPTERS.filter((c) => c.block === block);
    const cards = list.map((c) => {
      const qn = (Q_BY_CHAPTER.get(c.id) || []).length;
      const mn = (c.methods || []).length;
      return `<a class="card" href="map/${c.id}.html">
        <div class="card-ico">${c.no}</div>
        <h3>${esc(c.name)}</h3>
        <div class="meta">${qn} 题 · ${mn} 张方法卡</div>
        ${(c.prereq || []).length ? `<div class="meta" style="margin-top:6px;font-size:.78rem;color:var(--text-3)">前置：${
          (c.prereq || []).map((p) => esc((CH_BY_ID.get(p) || {}).name || p)).join('、')
        }</div>` : ''}
      </a>`;
    }).join('');
    return `<section class="section">
      <div class="section-head">
        <div class="section-head-left">
          <span class="kicker">${esc(block)}</span>
          <h2>${list.length} 章</h2>
        </div>
      </div>
      <div class="grid c3">${cards}</div>
    </section>`;
  }).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 知识图谱</div>
  <h1>知识图谱</h1>
  <p class="lede">${CHAPTERS.length} 章按课标知识块划分。<b>前置依赖</b>是本页的重点：某一章弱，可能不是这一章的问题，而是前置章拖累。</p>
</div>
${blockHtml}
`;

  const html = page({ active: 'map.html', title: '知识图谱', desc: '北京中考数学 18 章知识结构与前置依赖。', body, data: ['meta'] });
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 6：单章页
   ========================================================== */
function buildChapter(c) {
  const R = newRenderers();
  const methods = (c.methods || []).map((id) => M_BY_ID.get(id)).filter(Boolean);
  const qs = Q_BY_CHAPTER.get(c.id) || [];
  const prereqs = (c.prereq || []).map((p) => CH_BY_ID.get(p)).filter(Boolean);

  const methodCards = methods.map((m) => `<a class="card" href="../method/${m.id}.html">
    <div class="card-ico ${m.tier === 'dist' ? 'rose' : 'purple'}">${m.tier === 'dist' ? '🎯' : '📐'}</div>
    <h3>${esc(m.name)}</h3>
    <div class="meta">${(m.steps || []).length} 步 · ${TIER_NAME[m.tier]}</div>
    <p class="desc" style="margin-top:8px;font-size:.85rem">${R.math.render(m.signal)}</p>
  </a>`).join('') || '<p class="empty">本章方法卡在 P2 补齐</p>';

  const body = `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../map.html">知识图谱</a> / ${esc(c.name)}</div>
  <h1>${c.no}. ${esc(c.name)}</h1>
  <p class="lede">${esc(c.block)} · ${qs.length} 题 · ${methods.length} 张方法卡${(c.examRefs || []).length ? ` · 关联题号 ${c.examRefs.join('、')}` : ''}</p>
</div>

${prereqs.length ? `<section class="section" style="margin-top:18px">
  <div class="card" style="padding:16px 20px;border-left:4px solid var(--gold)">
    <div class="kicker" style="margin-bottom:6px">前置章节</div>
    <p style="margin:0;font-size:.94rem">学本章之前，先确认这几章没问题：${prereqs.map((p) =>
      `<a href="${p.id}.html" style="font-weight:650">${esc(p.name)}</a>`).join('、')}</p>
    <p style="margin:8px 0 0;font-size:.85rem;color:var(--text-2)">如果本章练得吃力，先回前置章做 10 题，看是不是那里的问题。</p>
  </div>
</section>` : ''}

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">方法卡</span>
      <h2>本章涉及的 ${methods.length} 个方法</h2>
    </div>
  </div>
  <div class="grid c3">${methodCards}</div>
</section>

<section class="section" style="margin-top:24px">
  <div class="grid c2">
    <a class="card tool-card" href="../drill.html?chapter=${c.id}&mode=guided">
      <div class="card-ico blue">📝</div>
      <h3>练本章 · 引导模式</h3>
      <p class="desc">逐步作答，答错给提示，记下卡点。</p>
      <div class="meta" style="margin-top:10px">${qs.length} 题可用</div>
    </a>
    <a class="card tool-card" href="../drill.html?chapter=${c.id}&mode=selfcheck">
      <div class="card-ico purple">✓</div>
      <h3>练本章 · 自查模式</h3>
      <p class="desc">先做后对，只给步骤骨架。</p>
      <div class="meta" style="margin-top:10px">适合已会只缺熟练</div>
    </a>
  </div>
</section>
`;

  const html = page({
    base: '../', active: 'map.html',
    title: `${c.name} · 第 ${c.no} 章`, desc: `${c.name}：方法卡与练习入口。`, body,
  });
  return html.replace('<body data-base="../">', `<body data-base="../">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 7：错因诊断
   ========================================================== */
function buildWrong() {
  const R = newRenderers();
  const ERR = [
    ['concept', '概念不清', '定义、定理的适用条件没弄清', '去做条件判断题'],
    ['method', '方法未掌握', '没思路，或选错了工具', '看识别信号 + 母题'],
    ['construct', '构造不出', '几何题看不出辅助线', '看构造模型'],
    ['calc', '计算失误', '会做但算错', '进计算专项（连对 3 次出册）'],
    ['express', '表达不规范', '审题漏条件、步骤跳步', '做找错练习'],
  ];

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 错因诊断</div>
  <h1>错因诊断</h1>
  <p class="lede">「做错了」不是一个信息。<b>错在哪一层</b>才决定下一步练什么——五类错因的补救动作完全不同，出册规则也不同。</p>
</div>

<section class="section" style="margin-top:20px">
  <div class="kv">
    <div class="k"><b id="kTotal">0</b><span>累计作答</span></div>
    <div class="k"><b id="kRate" style="color:var(--accent)">—</b><span>综合正确率</span></div>
    <div class="k"><b id="kWrong" style="color:var(--rose)">0</b><span>待清错题</span></div>
  </div>
</section>

<section class="section" style="margin-top:26px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">五类错因</span>
      <h2>每一栏的补救动作都不一样</h2>
      <span class="sub">概念错 → 回概念卡；方法错 → 看识别信号；构造错 → 看模型；计算错 → 限时练；表达错 → 做找错</span>
    </div>
  </div>
  <div id="errBars" class="traps"></div>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">错题清单</span>
      <h2>按错因分组</h2>
      <span class="sub">每题显示卡在第几步。P3 会在这里接上「一键跳补救目标」</span>
    </div>
    <button class="btn ghost sm" id="resetBtn">清空记录</button>
  </div>
  <div id="wrongList"></div>
</section>
`;

  const script = `
(function(){
  function refresh(){
    var t = BJM.totalAnswered();
    var set = function(id, v){ var e = document.getElementById(id); if (e) e.textContent = v; };
    set('#kTotal', t.n);
    set('#kRate', t.n ? Math.round(t.rate * 100) + '%' : '—');
    set('#kWrong', BJM.wrongIds().length);

    // 五类错因条
    var stats = BJM.errStats();
    var bars = document.getElementById('errBars');
    var ERR_META = ${JSON.stringify(ERR.reduce((a, [k, n, d, fix]) => (a[k] = { n, d, fix }, a), {}))};
    bars.innerHTML = stats.map(function(s){
      var meta = ERR_META[s.type] || { n: s.type, d: '', fix: '' };
      var pct = s.n ? Math.round(s.rate * 100) : null;
      return '<div class="trap" style="border-left-color:' + (s.n ? 'var(--rose)' : 'var(--border)') + '">' +
        '<div class="trap-t">' + meta.n + ' <span style="font-weight:400;color:var(--text-3);font-size:.8rem">' +
        (s.n ? s.n + ' 次作答 · 正确率 ' + pct + '%' : '暂无记录') + '</span></div>' +
        '<div class="trap-why">' + meta.d + '</div>' +
        '<div style="margin-top:8px;font-size:.84rem"><b style="color:var(--accent)">补救：</b>' + meta.fix + '</div>' +
      '</div>';
    }).join('');

    // 错题清单
    var byType = BJM.wrongByType();
    var qmap = {};
    var CH = window.BJM.CH || {};
    Object.keys(CH).forEach(function(cid){
      (CH[cid].questions || []).forEach(function(q){ qmap[q.id] = q; });
    });
    var list = document.getElementById('wrongList');
    var any = false;
    var html = '';
    BJM.ERR_TYPES.forEach(function(t){
      var items = byType[t] || [];
      if (!items.length) return;
      any = true;
      var meta = ERR_META[t] || { n: t };
      html += '<div class="card" style="margin-bottom:14px;padding:16px 18px">' +
        '<h3 style="margin:0 0 10px;font-size:1rem">' + meta.n + ' <span style="color:var(--text-3);font-weight:400;font-size:.82rem">' + items.length + ' 题</span></h3>';
      items.forEach(function(w){
        var q = qmap[w.id];
        var stepTxt = w.stuckStep >= 0 ? ('卡在第 ' + (w.stuckStep + 1) + ' 步') : '未记录卡点';
        html += '<div style="padding:9px 0;border-top:1px solid var(--border);font-size:.88rem">' +
          '<div style="font-weight:600">' + (q ? q.stemHtml : w.id) + '</div>' +
          '<div style="color:var(--text-3);font-size:.78rem;margin-top:4px">' + stepTxt +
          ' · 错 ' + w.n + ' 次' + (q && q.method ? (' · ' + q.method) : '') + '</div>' +
        '</div>';
      });
      html += '</div>';
    });
    list.innerHTML = any ? html : '<div class="empty">还没有错题。先去 <a href="drill.html">分步刷题</a> 练一组。</div>';
  }
  BJM.ready(refresh);
  document.addEventListener('bj:qlog', refresh);

  document.getElementById('resetBtn').addEventListener('click', function(){
    if (confirm('确定清空全部作答记录与错题？')) { BJM.qReset(); refresh(); BJM.toast('已清空'); }
  });
})();
`;

  const html = page({
    active: 'wrong.html', title: '错因诊断',
    desc: '五类错因分栏的中考数学错题诊断。',
    body, script, data: ['meta'],
  });
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 8：公式库
   ========================================================== */
function buildGraph() {
  const R = newRenderers();
  /* 公式数据来自 src/data-formulas.js（94 条，含适用条件与常见误用） */


  const byBlock = new Map();
  FORMULAS.forEach((f) => {
    const blk = (CH_BY_ID.get(f.chapter) || {}).block || '其他';
    if (!byBlock.has(blk)) byBlock.set(blk, []);
    byBlock.get(blk).push(f);
  });
  const rows = [...byBlock.entries()].map(([blk, list]) => {
    const head = `<tr class="fgrp"><td colspan="4">${esc(blk)} · ${list.length} 条</td></tr>`;
    const body = list.map((f) => `<tr>
      <td style="font-weight:650">${esc(f.name)}</td>
      <td style="text-align:center">${R.math.render(f.tex)}</td>
      <td style="font-size:.86rem;color:var(--text-2)">${R.math.render(f.cond)}</td>
      <td style="font-size:.86rem;color:var(--rose)">${R.math.render(f.misuse)}</td>
    </tr>`).join('');
    return head + body;
  }).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 公式库</div>
  <h1>公式定理库</h1>
  <p class="lede">${FORMULAS.length} 条公式定理，按知识块分组。与英语站词库最大的差别是第三、四列：<b>适用条件</b>和<b>常见误用</b>——理科的失分多数不是记不住公式，而是<b>条件不满足还硬套</b>。</p>
</div>

<section class="section" style="margin-top:20px">
  <div class="tbl-wrap">
    <table class="gtable">
      <thead><tr>
        <th style="width:20%">名称</th>
        <th style="width:22%;text-align:center">公式</th>
        <th style="width:28%">适用条件</th>
        <th style="width:30%">常见误用</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <p class="setup-hint" style="margin-top:12px">共 ${FORMULAS.length} 条，按知识块分组。P2 目标 220 条。</p>
</section>
`;

  const html = page({ active: 'graph.html', title: '公式定理库', desc: '含适用条件与常见误用的中考数学公式库。', body });
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 9：内容说明
   ========================================================== */
function buildContent() {
  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 内容说明</div>
  <h1>内容与口径说明</h1>
  <p class="lede">这个站做了什么、没做什么、判分边界在哪——写清楚，避免「什么都包了」的错觉。</p>
</div>

<section class="section" style="margin-top:20px">
  <div class="card" style="padding:22px 24px">
    <h3>当前版本：P0 管线验证版</h3>
    <p class="desc">这一版的目的不是覆盖考点，而是验证三件技术未知：公式能否离线渲染、几何图能否声明式生成、解答题能否做步骤级判定。内容规模（${METHODS.length} 张方法卡、${QUESTIONS.length} 题）只够压测，不够备考。</p>
    <div class="grid c3" style="margin-top:16px">
      <div><b>${METHODS.length}</b><br><span style="color:var(--text-2);font-size:.86rem">方法卡</span></div>
      <div><b>${QUESTIONS.length}</b><br><span style="color:var(--text-2);font-size:.86rem">题目</span></div>
      <div><b>${CHAPTERS.length}</b><br><span style="color:var(--text-2);font-size:.86rem">章节</span></div>
    </div>
  </div>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head"><div class="section-head-left"><span class="kicker">判分边界</span><h2>哪些能自动判，哪些不能</h2></div></div>
  <div class="tbl-wrap">
    <table class="gtable">
      <thead><tr><th>题型</th><th>能否自动判</th><th>做法</th></tr></thead>
      <tbody>
        <tr><td>选择题</td><td style="color:var(--ok)">✓ 可以</td><td>但问法改成「第一步做什么」「这个条件的作用」，不只问答案</td></tr>
        <tr><td>数值填空</td><td style="color:var(--ok)">✓ 可以</td><td>规范化 + 容差 1e-6，<code>1/2</code> ≡ <code>0.5</code></td></tr>
        <tr><td>表达式填空</td><td style="color:var(--gold)">⚠ 有限</td><td>不做通用等价判定；改成「从 4 个等价形式里选」</td></tr>
        <tr><td>解答题</td><td style="color:var(--rose)">✗ 不自动判</td><td>走「自查模式」：给步骤骨架，用户勾做出来/卡住，系统记卡点</td></tr>
      </tbody>
    </table>
  </div>
  <p class="setup-hint" style="margin-top:12px">最后一行的取舍：<b>放弃自动判分，换取过程诊断</b>。纯前端能做，而且比假判分有用——得到的是「第 2 步卡住」这种真数据。</p>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head"><div class="section-head-left"><span class="kicker">已知限制</span><h2>这一版明确不做的</h2></div></div>
  <div class="traps">
    <div class="trap"><div class="trap-t">不宣称覆盖全部考点</div>
      <div class="trap-why">理科题目无穷变式，「全覆盖」无法证明。本站只标注每一块的分值与当前题量。</div></div>
    <div class="trap"><div class="trap-t">不做解答题自动批改</div>
      <div class="trap-why">AI 判步骤一旦判错，信任就崩了。全站不出现「AI 批改」字样。</div></div>
    <div class="trap"><div class="trap-t">不做动态几何</div>
      <div class="trap-why">动点用「三帧快照」表达临界，不做滑块拖拽。P0 验证阶段不值得投入。</div></div>
    <div class="trap"><div class="trap-t">例题为原创，非真题</div>
      <div class="trap-why">按北京卷题型结构编写的原创题，用于练方法与步骤，不是真题搬运。</div></div>
    <div class="trap"><div class="trap-t">不做「背公式」主线</div>
      <div class="trap-why">理科背公式的边际收益远低于英语背单词。公式库带「适用条件」与「常见误用」两列，考的是条件判断。</div></div>
  </div>
</section>

<section class="section" style="margin-top:24px">
  <div class="section-head"><div class="section-head-left"><span class="kicker">数据</span><h2>记录存在哪、怎么备份</h2></div></div>
  <div class="card" style="padding:20px 22px">
    <p class="desc">全部学习记录存在浏览器 <code>localStorage</code>，键前缀 <code>bj-</code>。换设备或清缓存会丢失，请定期导出档案。</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
      <button class="btn primary" id="expBtn">导出学习档案</button>
      <label class="btn soft" style="cursor:pointer">导入档案<input type="file" id="impFile" accept=".json" hidden></label>
    </div>
  </div>
</section>
`;

  const script = `
(function(){
  document.getElementById('expBtn').addEventListener('click', function(){ BJM.exportArchive(); });
  document.getElementById('impFile').addEventListener('change', function(e){
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function(){ BJM.importArchive(r.result); };
    r.readAsText(f);
  });
})();
`;

  const html = page({ active: '', title: '内容与口径说明', desc: '本站做了什么、没做什么、判分边界在哪。', body, script });
  return html.replace('<body data-base="">', `<body data-base="">\n`);
}

/* ==========================================================
   主流程
   ========================================================== */
function main() {
  const t0 = Date.now();
  const shard = emitShards();

  const tasks = [
    ['home', () => emit('index.html', buildHome())],
    ['method', () => {
      emit('method.html', buildMethodIndex());
      METHODS.forEach((m) => emit(`method/${m.id}.html`, buildMethodCard(m)));
    }],
    ['drill', () => emit('drill.html', buildDrill())],
    ['concept', () => emit('concept.html', buildConcept())],
    ['map', () => {
      emit('map.html', buildMap());
      CHAPTERS.forEach((c) => emit(`map/${c.id}.html`, buildChapter(c)));
    }],
    ['wrong', () => emit('wrong.html', buildWrong())],
    ['graph', () => emit('graph.html', buildGraph())],
    ['content', () => emit('content.html', buildContent())],
  ];

  for (const [name, fn] of tasks) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    fn();
  }

  const ms = Date.now() - t0;
  const totalBytes = Object.values(report.bytes).reduce((a, b) => a + b, 0);

  console.log(`\n${SITE_NAME} · 构建完成 (${ms} ms)`);
  console.log('─'.repeat(62));
  console.log(`页面            ${report.pages.length}`);
  console.log(`题目            ${QUESTIONS.length}（已渲染公式与图形）`);
  console.log(`方法卡          ${METHODS.length}`);
  console.log(`章节            ${CHAPTERS.length}`);
  console.log(`题目分片        ${(shard.shardBytes / 1024).toFixed(1)} KB`);
  console.log(`全站 HTML       ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log('─'.repeat(62));

  const big = Object.entries(report.bytes).sort((a, b) => b[1] - a[1]).slice(0, 6);
  console.log('最大的页面：');
  big.forEach(([p, b]) => console.log(`  ${String((b / 1024).toFixed(1)).padStart(7)} KB  ${p}`));

  if (report.mathFailures.length) {
    console.log(`\n⚠ 公式渲染失败 ${report.mathFailures.length} 条：`);
    report.mathFailures.slice(0, 5).forEach((f) => console.log(`  ${f.tex} → ${f.err}`));
  }
  if (report.figFailures.length) {
    console.log(`\n⚠ 图形渲染失败 ${report.figFailures.length} 条：`);
    report.figFailures.slice(0, 5).forEach((f) => console.log(`  [${f.index}] ${f.type} → ${f.err}`));
  }
  if (!report.mathFailures.length && !report.figFailures.length) {
    console.log('\n✓ 公式与图形全部渲染成功');
  }

  // 体积预算检查
  const budget = { 'index.html': 200 * 1024, 'drill.html': 500 * 1024, 'method.html': 400 * 1024 };
  let over = 0;
  Object.entries(budget).forEach(([p, lim]) => {
    if (report.bytes[p] && report.bytes[p] > lim) {
      console.log(`⚠ 超出体积预算：${p} ${(report.bytes[p] / 1024).toFixed(1)} KB > ${lim / 1024} KB`);
      over++;
    }
  });
  if (!over) console.log('✓ 体积预算全部达标');

  writeFileSync(join(OUT, 'build-report.json'), JSON.stringify({
    at: new Date().toISOString(), ms,
    pages: report.pages.length,
    bytes: report.bytes,
    mathFailures: report.mathFailures,
    figFailures: report.figFailures,
    shardBytes: shard.shardBytes,
  }, null, 2));

  process.exit(report.mathFailures.length || report.figFailures.length ? 1 : 0);
}

main();
