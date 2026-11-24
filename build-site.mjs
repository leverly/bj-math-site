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
    if (s.label) x.labelHtml = C(R.math.render(s.label));
    if (s.hint) x.hintHtml = C(R.math.render(s.hint));
    if (s.why) x.whyHtml = C(R.math.render(s.why));
    if (s.answer) x.answerHtml = C(R.math.render(s.answer));
    // selfcheck 模式的分层提示是数组
    if (s.hints) x.hintsHtml = s.hints.map((h) => C(R.math.render(h)));
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
  const totalQ = STATS.questions;
  const totalM = STATS.methods;
  const totalC = STATS.chapters;
  const totalConcept = STATS.concepts;

  /* ---------- 提分路径：三层分区（紧凑三列） ---------- */
  const TIER_GOAL = { send: '目标 100%', mid: '目标 90%', dist: '目标 50–70%' };
  const TIER_DESC = {
    send: '选 1–7 / 填 9–15 / 17–22',
    mid: '23 圆 / 24 二次 / 25 统计 / 26 含参二次',
    dist: '8 / 16 / 27 / 28 四道题',
  };
  const tierRows = ['send', 'mid', 'dist'].map((t) => {
    const qs = QUESTIONS.filter((q) => q.tier === t);
    const methods = METHODS.filter((m) => m.tier === t);
    return `<div class="tier-mini ${t}">
      <div class="tier-mini-score">${t === 'send' ? '58' : t === 'mid' ? '24' : '18'}<span>分</span></div>
      <div class="tier-mini-name">${TIER_NAME[t]}</div>
      <div class="tier-mini-desc">${TIER_DESC[t]}</div>
      <div class="tier-mini-goal">${TIER_GOAL[t]}</div>
      <div class="tier-mini-count">${qs.length} 题 · ${methods.length} 张卡</div>
    </div>`;
  }).join('');

  /* ---------- 方法卡示例（4 张，覆盖三层） ---------- */
  /* 三层各取代表：送分（因式分解，最基础）+ 中档（反比例 k 的几何意义）+ 区分（区间最值、中点）
     按 tier 从易到难排列，让读者一眼看到难度递进 */
  const sampleIds = ['m-factor-4', 'm-k-meaning', 'm-quad-interval', 'm-midpoint-4'];
  const sampleMethods = sampleIds.map((id) => METHODS.find((m) => m.id === id)).filter(Boolean);
  /* 紧凑行：一行一张卡，只留名称 + 识别信号首句 + 层级 */
  const methodRows = sampleMethods.map((m) => {
    const ch = CH_BY_ID.get(m.chapter);
    return `<a class="mrow" href="method/${m.id}.html">
      <span class="mrow-tier ${m.tier}">${TIER_NAME[m.tier]}</span>
      <span class="mrow-main">
        <b>${esc(m.name)}</b>
        <span class="mrow-signal">${R.math.render(m.signal)}</span>
      </span>
      <span class="mrow-meta">${(m.steps || []).length} 步 · ${(m.pitfalls || []).length} 个误用</span>
      <span class="mrow-go">→</span>
    </a>`;
  }).join('');

  /* ---------- 问题 → 机制 ---------- */
  const sellRows = [
    {
      no: '01',
      pain: '刷了三本题，换个问法又不会',
      painSub: '题量上去了，识别能力没上去',
      tag: '方法卡',
      fix: '每张卡第一行不是知识点名，是<b>「题面出现什么时该想到它」</b>。先练认题，再练解题——这才是换问法也认得出的能力。',
      href: 'method.html',
      link: '看方法卡怎么写',
    },
    {
      no: '02',
      pain: '答案看得懂，自己做还是没思路',
      painSub: '「懂了」和「会做」之间差着几步',
      tag: '步骤级判定',
      fix: '判题的单位是<b>步</b>不是题。答错时系统记下你卡在<b>第几步</b>，而不是只记一个「错」。卡在第 1 步是概念问题，卡在第 3 步是计算问题——补救方式完全不同。',
      href: 'drill.html',
      link: '试一组分步刷题',
    },
    {
      no: '03',
      pain: '错题记了一堆，不知道从哪补',
      painSub: '「计算差」这种结论没法执行',
      tag: '弱点诊断',
      fix: '错题按<b>可训练单元</b>聚合，直接告诉你：<b>二次函数区间最值 · 正确率 0% · 主因概念不清 · 常卡第 1 步</b>，然后一键进该单元的题。不是给结论，是给下一步动作。',
      href: 'wrong.html',
      link: '看诊断长什么样',
    },
  ];

  const sellHtml = sellRows.map((r) => `<div class="sell-row">
    <div class="sell-pain">
      <span class="sell-no">${r.no}</span>
      <b>${r.pain}</b>
      <span class="sell-pain-sub">${r.painSub}</span>
    </div>
    <div class="sell-fix">
      <span class="sell-tag">${r.tag}</span>
      <p>${r.fix}</p>
      <a class="sell-link" href="${r.href}">${r.link} →</a>
    </div>
  </div>`).join('');

  /* ---------- 与普通题库的差别 ---------- */
  const diffRows = [
    ['组织方式', '按章节 / 知识点罗列', '<b>按方法 + 识别信号</b>'],
    ['判题粒度', '对 / 错', '<b>步骤级，记卡在第几步</b>'],
    ['错题', '收集起来，自己去翻', '<b>聚合到可训练单元，给下一步</b>'],
    ['解答题批改', '号称 AI 批改', '<b>明确不批改，走自查 + 完整解答对照</b>'],
    ['内容口径', '通用题库', '<b>对齐北京卷 28 题结构</b>'],
  ];
  const diffHtml = diffRows.map(([k, a, b]) => `<tr>
    <td class="diff-k">${k}</td>
    <td class="diff-old">${a}</td>
    <td class="diff-new">${b}</td>
  </tr>`).join('');

  /* ---------- 三步上手 ---------- */
  const steps = [
    { n: '1', t: '先做一组题', d: '10 道送分区题，或直接看一章的题。不用注册，答完就有记录。', href: 'drill.html', cta: '开始做题' },
    { n: '2', t: '看诊断说补什么', d: '弱点清单会告诉你最该补的方法卡、主因错因、常卡第几步。', href: 'wrong.html', cta: '看错因诊断' },
    { n: '3', t: '进专项练', d: '点「专项训练」直接出那个单元的题。练完回来看正确率有没有上去。', href: 'drill.html?scope=weak', cta: '专攻最弱' },
  ];
  const stepsHtml = steps.map((s) => `<div class="step-mini">
    <span class="step-mini-no">${s.n}</span>
    <div>
      <b>${s.t}</b>
      <p>${s.d}</p>
      <a class="sell-link" href="${s.href}">${s.cta} →</a>
    </div>
  </div>`).join('');

  const body = `
<section class="hero">
  <div class="hero-split">
    <div>
      <div class="hero-badge"><span class="dot-live"></span>北京中考数学 · 对齐卷面 28 题结构</div>
      <h1>刷了很多题，<br><span class="accent-word">同类型的还是错</span></h1>
      <p class="lede">
 问题通常不在题量，而在<b>看到题不知道用哪个方法</b>。
 本站按<b>方法</b>组织，不按知识点罗列：每张方法卡第一行写清「题面出现什么时该想到它」；
 刷题按<b>步骤</b>判定，记下你卡在第几步；错题自动聚合成<b>可训练单元</b>，直接告诉你下一步练什么。
 </p>
      <div class="hero-cta">
        <a class="btn primary" href="drill.html">免费开始做题 <span aria-hidden="true">→</span></a>
        <a class="btn" href="wrong.html">先看诊断示例</a>
      </div>
      <div class="hero-trust">
        <span><b>✓</b> 无需注册</span>
        <span><b>✓</b> 离线可用</span>
        <span><b>✓</b> 记录只存本地</span>
        <span><b>✓</b> 无广告</span>
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
          <span class="mi-main"><b>错因诊断</b><small>聚合到可训练单元，给下一步动作</small></span>
          <span class="mi-go">查看 →</span>
        </a>
      </div>
    </div>
  </div>
</section>

<section class="section reveal" id="why">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">为什么刷题没效果</span>
      <h2>三个问题，对应三个机制</h2>
      <span class="sub">这三个问题不是「题不够多」，是刷题的粒度太粗——只记对错，不记为什么错</span>
    </div>
  </div>
  <div class="sell-rows">${sellHtml}</div>
</section>

<section class="section reveal" id="diff">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">与普通题库的区别</span>
      <h2>同样是刷题，粒度不一样</h2>
    </div>
  </div>
  <div class="tbl-wrap">
    <table class="gtable diff-table">
      <thead><tr><th style="width:20%"></th><th style="width:36%">普通题库</th><th style="width:44%">本站</th></tr></thead>
      <tbody>${diffHtml}</tbody>
    </table>
  </div>
</section>

<section class="section reveal" id="tiers">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">提分路径</span>
      <h2>100 分不是均匀分布的</h2>
      <span class="sub">三层目标不同，练法也不同。站内 <b>${totalQ}</b> 题 / <b>${totalM}</b> 张方法卡 / <b>${totalC}</b> 章 / <b>${totalConcept}</b> 条概念卡 / <b>${FORMULAS.length}</b> 条公式</span>
    </div>
  </div>
  <div class="tier-minis">${tierRows}</div>
</section>

<section class="section reveal" id="sample">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">方法卡 · 示例 4 / ${METHODS.length}</span>
      <h2>先认题型，再谈方法</h2>
      <span class="sub">第一行是「识别信号」——什么题面出现时该想到它。下面按送分 → 中档 → 区分排列，看难度递进</span>
    </div>
    <a class="btn sm soft" href="method.html">查看全部 ${METHODS.length} 张 →</a>
  </div>
  <div class="mrows">${methodRows}</div>
</section>

<section class="section reveal" id="start">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">三步上手</span>
      <h2>10 分钟知道该补什么</h2>
      <span class="sub">不用先看教程，做题的过程就在采集诊断数据</span>
    </div>
  </div>
  <div class="step-minis">${stepsHtml}</div>
  <div class="final-cta">
    <div>
      <b>现在就开始，第一组题不用注册</b>
      <span>记录只存你自己的浏览器，随时可导出备份</span>
    </div>
    <a class="btn primary lg" href="drill.html">免费开始 →</a>
  </div>
</section>

<section class="section reveal" id="honest">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">边界</span>
      <h2>本站不做什么</h2>
    </div>
  </div>
  <div class="honest-list">
    <div><b>不宣称覆盖全部考点</b><span>理科题目无穷变式，只标注每块分值与当前题量。</span></div>
    <div><b>不做解答题 AI 批改</b><span>AI 判步骤一旦判错信任就崩了。走自查模式，对照完整解答。</span></div>
    <div><b>不做视频课</b><span>只做「练」这一环，不做「讲」。</span></div>
    <div><b>例题为原创</b><span>按北京卷题型结构编写，不是真题搬运。</span></div>
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

  const html = page({ active: 'index.html', title: '北京中考数学分步备考系统', desc: '按方法卡组织、步骤级判定、弱点诊断的北京中考数学备考站。' + STATS.questions + ' 题、' + STATS.methods + ' 张方法卡、' + STATS.chapters + ' 章。', body, script });
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 2：方法卡索引
   ========================================================== */
function buildMethodIndex() {
  const R = newRenderers();
  const PAGE_SIZE = 9;

  /* 扁平列表 + 分页。分页与搜索共存：搜索时忽略页码，显示全部命中。 */
  const all = METHODS.map((m) => {
    const ch = CH_BY_ID.get(m.chapter);
    return {
      id: m.id, name: m.name, tier: m.tier,
      chapterName: ch ? ch.name : '',
      block: (ch || {}).block || '其他',
      signalHtml: R.math.render(m.signal),
      steps: (m.steps || []).length,
      pitfalls: (m.pitfalls || []).length,
      qCount: (m.variantIds || []).length + 1,
      search: (m.name + ' ' + m.signal + ' ' + (ch ? ch.name : '')).replace(/\s+/g, ''),
    };
  });

  const cardHtml = (m) => `<a class="card mcard" data-id="${m.id}" data-tier="${m.tier}" data-search="${esc(m.search)}" href="method/${m.id}.html">
    <div class="mcard-top">
      <div class="card-ico ${m.tier === 'dist' ? 'rose' : 'purple'}">${m.tier === 'dist' ? '🎯' : '📐'}</div>
      <span class="mcard-tier ${m.tier}">${TIER_NAME[m.tier]}</span>
    </div>
    <h3>${esc(m.name)}</h3>
    <div class="meta">${esc(m.chapterName)} · ${m.steps} 步 · ${m.pitfalls} 个误用 · ${m.qCount} 题</div>
    <p class="desc" style="margin-top:8px;font-size:.85rem">${m.signalHtml}</p>
  </a>`;

  const cardsHtml = all.map(cardHtml).join('');

  const tierChips = ['all', 'send', 'mid', 'dist'].map((t) =>
    `<button class="chip${t === 'all' ? ' on' : ''}" data-tier="${t}">${t === 'all' ? '全部' : TIER_NAME[t]}</button>`
  ).join('');

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 方法卡</div>
  <h1>方法卡索引</h1>
  <p class="lede">共 <b>${METHODS.length}</b> 张。按<b>方法</b>组织，不按章节。搜索框支持输入题面片段——学生记不住「二次函数区间最值」这个名字，但记得「m≤x≤n」。</p>
</div>

<section class="section" style="margin-top:20px">
  <div class="card" style="padding:18px 20px">
    <label class="field" style="display:flex;gap:10px;align-items:center">
      <span class="kicker" style="white-space:nowrap">按信号搜索</span>
      <input id="mSearch" type="text" placeholder="输入题面片段，如：三条线段 / 中点 / 切线 / 面积" style="flex:1;padding:11px 14px;border-radius:10px;border:1.5px solid var(--border-2);background:var(--surface);color:var(--text);font-size:.95rem">
    </label>
    <div class="chips" id="tierChips" style="margin-top:12px">${tierChips}</div>
    <div id="mHint" class="setup-hint" style="margin-top:10px">共 ${METHODS.length} 张卡 · 每页 ${PAGE_SIZE} 张</div>
  </div>
</section>

<section class="section" style="margin-top:22px">
  <div class="grid c3" id="mGrid">${cardsHtml}</div>
  <div class="pager" id="mPager"></div>
</section>
`;

  const script = `
(function(){
  var PAGE_SIZE = ${PAGE_SIZE};
  var input = document.getElementById('mSearch');
  var hint = document.getElementById('mHint');
  var grid = document.getElementById('mGrid');
  var pager = document.getElementById('mPager');
  var cards = [].slice.call(grid.querySelectorAll('.mcard'));
  var tier = 'all';
  var page = 1;

  function filtered(){
    var q = input.value.trim().replace(/\\s+/g, '');
    return cards.filter(function(c){
      var okTier = tier === 'all' || c.getAttribute('data-tier') === tier || true;
      // tier 从卡片里取不到，用 data-tier 属性（下面补）
      var t = c.getAttribute('data-tier');
      okTier = tier === 'all' || t === tier;
      var okQ = !q || (c.getAttribute('data-search') || '').indexOf(q) >= 0;
      return okTier && okQ;
    });
  }

  function render(){
    var q = input.value.trim().replace(/\\s+/g, '');
    var list = filtered();
    var searching = !!q;
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;

    // 搜索时显示全部命中，不分页（结果本来就不多）
    var show = searching ? list : list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    cards.forEach(function(c){ c.style.display = 'none'; });
    show.forEach(function(c){ c.style.display = ''; });

    // 分页控件
    if (searching) {
      pager.innerHTML = '';
      hint.textContent = '命中 ' + list.length + ' / ' + cards.length + ' 张卡';
      return;
    }
    hint.textContent = '共 ' + list.length + ' 张卡 · 第 ' + page + ' / ' + totalPages + ' 页';
    if (totalPages <= 1) { pager.innerHTML = ''; return; }
    var html = '';
    html += '<button class="pg-btn" data-p="' + Math.max(1, page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>← 上一页</button>';
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="pg-num' + (i === page ? ' on' : '') + '" data-p="' + i + '">' + i + '</button>';
    }
    html += '<button class="pg-btn" data-p="' + Math.min(totalPages, page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>下一页 →</button>';
    pager.innerHTML = html;
    [].forEach.call(pager.querySelectorAll('button[data-p]'), function(b){
      b.addEventListener('click', function(){
        page = parseInt(b.getAttribute('data-p'), 10);
        render();
        document.querySelector('#mGrid').scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
  }

  input.addEventListener('input', function(){ page = 1; render(); });

  [].forEach.call(document.querySelectorAll('#tierChips .chip'), function(c){
    c.addEventListener('click', function(){
      [].forEach.call(document.querySelectorAll('#tierChips .chip'), function(x){ x.classList.remove('on'); });
      c.classList.add('on');
      tier = c.getAttribute('data-tier');
      page = 1;
      render();
    });
  });

  render();
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
  var urlScope = params.get('scope');
  var scope = (urlScope === 'weak' || urlScope === 'wrong') ? urlScope : 'all';
  var len = parseInt(params.get('n'), 10) || 8;

  // URL 预填（方法卡页跳过来时带 ?method=&mode=）
  var preMethod = params.get('method') || '';
  var preChapter = params.get('chapter') || '';
  if (preMethod) {
    var sel = document.getElementById('methodSel');
    if (sel) sel.value = preMethod;
  }
  if (preChapter) {
    var csel = document.getElementById('chapterSel');
    if (csel) csel.value = preChapter;
  }
  [].forEach.call(document.querySelectorAll('#modeChips .chip'), function(c){
    c.classList.toggle('on', c.getAttribute('data-m') === mode);
  });
  [].forEach.call(document.querySelectorAll('#scopeChips .chip'), function(c){
    c.classList.toggle('on', c.getAttribute('data-s') === scope);
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
    if (el) {
      var tag = '';
      if (preMethod) {
        var m = (META.methods || []).find(function(x){ return x.id === preMethod; });
        if (m) tag = '【' + m.name + '】';
      } else if (preChapter) {
        var c = (META.chapters || []).find(function(x){ return x.id === preChapter; });
        if (c) tag = '【' + c.name + '】';
      }
      el.textContent = tag + '当前筛选下 ' + n + ' 题可练';
    }
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
      /* 专攻最弱：优先用弱点聚合选单元，而不是只看方法卡正确率。
         若已用 URL 指定 method/chapter，就在该范围内找最弱。 */
      if (!mid && !cid) {
        var acts = BJM.nextActions(1);
        if (acts.length) {
          var a = acts[0];
          if (a.kind === 'method') out = out.filter(function(q){ return q.method === a.key; });
          else out = out.filter(function(q){ return q.chapter === a.key; });
          return out;
        }
      }
      /* 范围内找最弱方法卡 */
      var inRange = {};
      out.forEach(function(q){ if (q.method) inRange[q.method] = 1; });
      var mr = BJM.methodRates().filter(function(x){ return inRange[x.key]; });
      if (mr.length) out = out.filter(function(q){ return q.method === mr[0].key; });
    }
    return out;
  }

  document.getElementById('methodSel').addEventListener('change', refreshHint);
  document.getElementById('chapterSel').addEventListener('change', refreshHint);
  [].forEach.call(document.querySelectorAll('#scopeChips .chip'), function(c){
    c.addEventListener('click', refreshHint);
  });
  /* 分片是异步加载的，QS 为空时算出的题量是 0。
     先预加载一次再刷新提示，避免显示「0 题可练」却实际能出题。 */
  loadAllQuestions().then(refreshHint).catch(function(){ refreshHint(); });

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

  /* 每章一个掌握度环。数据在运行时注入（localStorage 读不到构建期），
     所以这里输出占位环 + data-chapter，由脚本填充。 */
  const ring = (id) => `<span class="mastery-ring" data-chapter="${id}" aria-label="掌握度">
      <svg viewBox="0 0 36 36" width="36" height="36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--bg-3)" stroke-width="4"/>
        <circle class="ring-fill" cx="18" cy="18" r="15" fill="none" stroke="var(--accent)"
          stroke-width="4" stroke-dasharray="94.2" stroke-dashoffset="94.2"
          stroke-linecap="round" transform="rotate(-90 18 18)"/>
      </svg>
      <b class="ring-num">—</b>
    </span>`;

  const blockHtml = blocks.map((block) => {
    const list = CHAPTERS.filter((c) => c.block === block);
    const cards = list.map((c) => {
      const qn = (Q_BY_CHAPTER.get(c.id) || []).length;
      const mn = (c.methods || []).length;
      const cn = (C_BY_CHAPTER.get(c.id) || []).length;
      return `<a class="card chapter-card" href="map/${c.id}.html" data-chapter="${c.id}">
        <div class="ch-card-top">
          <div class="card-ico">${c.no}</div>
          ${ring(c.id)}
        </div>
        <h3>${esc(c.name)}</h3>
        <div class="meta">${qn} 题 · ${mn} 张方法卡 · ${cn} 条概念</div>
        <div class="ch-status" data-status="${c.id}"></div>
        ${(c.prereq || []).length ? `<div class="meta ch-prereq" style="margin-top:6px;font-size:.78rem;color:var(--text-3)">前置：${
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
  <p class="lede">${CHAPTERS.length} 章按课标知识块划分。每个环是本章正确率，<b>红环</b>表示这章要补。<b>前置依赖</b>是本页的重点：某一章弱，可能不是这一章的问题，而是前置章拖累。</p>
</div>

<section class="section" style="margin-top:18px" id="weakSec">
  <div class="card" style="padding:18px 20px;border-left:4px solid var(--rose)">
    <div class="kicker" style="margin-bottom:8px">诊断</div>
    <div id="weakDiag"><p style="margin:0;font-size:.94rem;color:var(--text-2)">练几组题后，这里会指出「最该补的章」以及是否被前置章拖累。</p></div>
  </div>
</section>

<div id="chapters">${blockHtml}</div>
`;

  const script = `
(function(){
  var META = window.BJM.META || { chapters: [], methods: [] };
  var CH = function(){ return window.BJM.CH || {}; };
  var loaded = false;

  function loadAll(){
    if (loaded) return Promise.resolve();
    var ids = (META.chapters || []).map(function(c){ return c.id; });
    return Promise.all(ids.map(function(id){
      return new Promise(function(res){
        var s = document.createElement('script');
        s.src = 'dist/data/ch/' + id + '.js';
        s.onload = res; s.onerror = res;
        document.head.appendChild(s);
      });
    })).then(function(){ loaded = true; });
  }

  var CIRC = 2 * Math.PI * 15;   // r=15

  function paint(){
    var cw = BJM.chapterWeakness();
    var byCh = {};
    cw.forEach(function(x){ byCh[x.key] = x; });

    document.querySelectorAll('.mastery-ring').forEach(function(el){
      var id = el.getAttribute('data-chapter');
      var w = byCh[id];
      var fill = el.querySelector('.ring-fill');
      var num = el.querySelector('.ring-num');
      if (!w || !w.answered) {
        fill.setAttribute('stroke-dashoffset', CIRC);
        fill.setAttribute('stroke', 'var(--border-2)');
        num.textContent = '—';
        return;
      }
      var pct = w.rate;
      fill.setAttribute('stroke-dashoffset', String(CIRC * (1 - pct)));
      fill.setAttribute('stroke', pct >= 0.85 ? 'var(--ok)' : pct >= 0.6 ? 'var(--gold)' : 'var(--rose)');
      num.textContent = Math.round(pct * 100) + '%';
    });

    // 章节状态文案 + 薄弱方法卡数
    document.querySelectorAll('.ch-status').forEach(function(el){
      var id = el.getAttribute('data-status');
      var w = byCh[id];
      var ch = CH()[id];
      if (!w || !w.answered) { el.innerHTML = '<span class="ch-tag">未练</span>'; return; }
      var mw = BJM.methodWeakness().filter(function(m){
        var mch = (META.methods || []).find(function(x){ return x.id === m.key; });
        return mch && mch.chapter === id && m.wrongN > 0;
      });
      var errTxt = w.topErr ? ('主因 ' + (BJM.ERR_NAME[w.topErr] || '')) : '';
      el.innerHTML = '<span class="ch-tag ' + (w.rate >= 0.85 ? 'ok' : w.rate >= 0.6 ? 'warn' : 'bad') + '">' +
        (w.rate >= 0.85 ? '较稳' : w.rate >= 0.6 ? '需巩固' : '薄弱') + '</span>' +
        (mw.length ? '<span class="ch-tag rose">' + mw.length + ' 张方法卡待补</span>' : '') +
        (errTxt ? '<span class="ch-tag">' + errTxt + '</span>' : '');
    });

    // 诊断：最该补的章 + 前置拖累
    var acts = BJM.nextActions(99).filter(function(a){ return a.kind === 'chapter'; });
    var diag = document.getElementById('weakDiag');
    if (!acts.length) {
      diag.innerHTML = '<p style="margin:0;font-size:.94rem;color:var(--text-2)">还没练够。先去 <a href="drill.html">分步刷题</a> 练两组，这里会指出最该补的章。</p>';
      return;
    }
    var worst = acts[0];
    var chMeta = (META.chapters || []).find(function(c){ return c.id === worst.key; });
    var html = '<p style="margin:0 0 8px;font-size:.98rem">最该补：<b>' +
      (chMeta ? (chMeta.no + '. ' + chMeta.name) : worst.key) + '</b>　正确率 <b class="' +
      (worst.rate >= 0.85 ? 'ok' : worst.rate >= 0.6 ? 'warn' : 'bad') + '">' +
      Math.round(worst.rate * 100) + '%</b>　错 ' + worst.wrongN + ' 题</p>';

    // 前置拖累：若前置章正确率也低于 70%，提示先补前置
    if (chMeta && (chMeta.prereq || []).length) {
      var drags = [];
      chMeta.prereq.forEach(function(p){
        var pw = byCh[p];
        if (pw && pw.answered && pw.rate < 0.7) {
          var pm = (META.chapters || []).find(function(x){ return x.id === p; });
          drags.push({ id: p, name: pm ? pm.name : p, rate: pw.rate });
        }
      });
      if (drags.length) {
        html += '<p style="margin:0 0 8px;font-size:.9rem;color:var(--rose)">⚠ 前置章也弱，可能是被拖累：' +
          drags.map(function(d){ return '<a href="map/' + d.id + '.html">' + d.name + '（' + Math.round(d.rate*100) + '%）</a>'; }).join('、') +
          '　建议先补前置。</p>';
      }
    }
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">' +
      '<a class="btn primary sm" href="drill.html?chapter=' + worst.key + '&scope=weak">补这一章 →</a>' +
      '<a class="btn soft sm" href="wrong.html">看完整错因诊断</a></div>';
    diag.innerHTML = html;
  }

  BJM.ready(function(){ paint(); loadAll().then(paint); });
  document.addEventListener('bj:qlog', function(){ loadAll().then(paint); });
})();
`;

  const html = page({ active: 'map.html', title: '知识图谱', desc: '北京中考数学 18 章知识结构、掌握度与前置依赖。', body, script, data: ['meta'] });
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

  const methodCards = methods.map((m) => `<div class="card method-mastery" data-method="${m.id}">
    <a class="mm-link" href="../method/${m.id}.html">
      <div class="mm-top">
        <div class="card-ico ${m.tier === 'dist' ? 'rose' : 'purple'}">${m.tier === 'dist' ? '🎯' : '📐'}</div>
        <span class="mm-ring">
          <svg viewBox="0 0 32 32" width="30" height="30">
            <circle cx="16" cy="16" r="13" fill="none" stroke="var(--bg-3)" stroke-width="3.5"/>
            <circle class="mm-fill" cx="16" cy="16" r="13" fill="none" stroke="var(--accent)"
              stroke-width="3.5" stroke-dasharray="81.7" stroke-dashoffset="81.7"
              stroke-linecap="round" transform="rotate(-90 16 16)"/>
          </svg>
          <b class="mm-num">—</b>
        </span>
      </div>
      <h3>${esc(m.name)}</h3>
      <div class="meta">${(m.steps || []).length} 步 · ${TIER_NAME[m.tier]}</div>
      <p class="desc" style="margin-top:8px;font-size:.85rem">${R.math.render(m.signal)}</p>
    </a>
    <div class="mm-foot" data-mmfoot="${m.id}"></div>
  </div>`).join('') || '<p class="empty">本章方法卡在 P2 补齐</p>';

  const body = `
<div class="page-head">
  <div class="crumb"><a href="../index.html">首页</a> / <a href="../map.html">知识图谱</a> / ${esc(c.name)}</div>
  <h1>${c.no}. ${esc(c.name)}</h1>
  <p class="lede">${esc(c.block)} · ${qs.length} 题 · ${methods.length} 张方法卡${(c.examRefs || []).length ? ` · 关联题号 ${c.examRefs.join('、')}` : ''}</p>
</div>

<section class="section" style="margin-top:18px" id="chDiag">
  <div class="card" style="padding:16px 20px;border-left:4px solid var(--accent)">
    <div class="kicker" style="margin-bottom:6px">本章诊断</div>
    <div id="chDiagBody"><p style="margin:0;font-size:.9rem;color:var(--text-2)">练几题后这里显示本章正确率、最弱方法卡与建议。</p></div>
  </div>
</section>

${prereqs.length ? `<section class="section" style="margin-top:16px">
  <div class="card" style="padding:16px 20px;border-left:4px solid var(--gold)">
    <div class="kicker" style="margin-bottom:6px">前置章节</div>
    <p style="margin:0;font-size:.94rem">学本章之前，先确认这几章没问题：${prereqs.map((p) =>
      `<a href="${p.id}.html" style="font-weight:650">${esc(p.name)}</a>`).join('、')}</p>
    <p style="margin:8px 0 0;font-size:.85rem;color:var(--text-2)" id="prereqNote">如果本章练得吃力，先回前置章做 10 题，看是不是那里的问题。</p>
  </div>
</section>` : ''}

<section class="section" style="margin-top:24px">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">方法卡</span>
      <h2>本章涉及的 ${methods.length} 个方法</h2>
      <span class="sub">每个环是该方法卡的正确率，环下有「练最弱」直达该卡的题</span>
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
    <a class="card tool-card" href="../drill.html?chapter=${c.id}&scope=weak">
      <div class="card-ico rose">🎯</div>
      <h3>练本章 · 专攻最弱</h3>
      <p class="desc">只出本章正确率最低的那张方法卡的题。</p>
      <div class="meta" style="margin-top:10px">按你的错题自动选</div>
    </a>
  </div>
</section>
`;

  const script = `
(function(){
  var CH_ID = ${JSON.stringify(c.id)};
  var META = window.BJM.META || { chapters: [], methods: [] };
  var CIRC = 2 * Math.PI * 13;
  var loaded = false;

  function loadChapter(){
    if (loaded) return Promise.resolve();
    return new Promise(function(res){
      var s = document.createElement('script');
      s.src = '../dist/data/ch/' + CH_ID + '.js';
      s.onload = res; s.onerror = res;
      document.head.appendChild(s);
    }).then(function(){
      var d = window.BJM.CH && window.BJM.CH[CH_ID];
      if (d && d.defs && !document.querySelector('.math-defs')) {
        var box = document.createElement('div');
        box.innerHTML = d.defs;
        document.body.appendChild(box.firstChild || box);
      }
      loaded = true;
    });
  }

  function paint(){
    var mw = BJM.methodWeakness();
    var byM = {};
    mw.forEach(function(x){ byM[x.key] = x; });

    document.querySelectorAll('.method-mastery').forEach(function(card){
      var id = card.getAttribute('data-method');
      var w = byM[id];
      var fill = card.querySelector('.mm-fill');
      var num = card.querySelector('.mm-num');
      var foot = card.querySelector('.mm-foot');
      if (!w || !w.answered) {
        fill.setAttribute('stroke-dashoffset', CIRC);
        fill.setAttribute('stroke', 'var(--border-2)');
        num.textContent = '—';
        foot.innerHTML = '<a class="btn soft xs" href="../drill.html?method=' + id + '&mode=guided">开始练 →</a>';
        return;
      }
      var pct = w.rate;
      fill.setAttribute('stroke-dashoffset', String(CIRC * (1 - pct)));
      fill.setAttribute('stroke', pct >= 0.85 ? 'var(--ok)' : pct >= 0.6 ? 'var(--gold)' : 'var(--rose)');
      num.textContent = Math.round(pct * 100) + '%';
      var errTxt = w.topErr ? (BJM.ERR_NAME[w.topErr] || '') : '';
      var stuckTxt = w.topStuck >= 0 ? ('卡在第 ' + (w.topStuck + 1) + ' 步') : '';
      foot.innerHTML =
        '<span class="mm-stats">练 ' + w.answered + ' · 错 ' + w.wrongN +
          (errTxt ? ' · ' + errTxt : '') + (stuckTxt ? ' · ' + stuckTxt : '') + '</span>' +
        (pct < 0.85 ? '<a class="btn primary xs" href="../drill.html?method=' + id + '&scope=weak">练最弱 →</a>'
                    : '<a class="btn soft xs" href="../drill.html?method=' + id + '&mode=guided">再练 →</a>');
    });

    // 本章诊断
    var cw = BJM.chapterWeakness().find(function(x){ return x.key === CH_ID; });
    var diag = document.getElementById('chDiagBody');
    if (!cw || !cw.answered) {
      diag.innerHTML = '<p style="margin:0;font-size:.9rem;color:var(--text-2)">还没练过本章。' +
        '<a href="../drill.html?chapter=' + CH_ID + '&mode=guided">先练一组</a>，这里会显示诊断。</p>';
      return;
    }
    var pct = Math.round(cw.rate * 100);
    var cls = cw.rate >= 0.85 ? 'ok' : cw.rate >= 0.6 ? 'warn' : 'bad';
    var weakM = mw.filter(function(x){
      var meta = (META.methods || []).find(function(y){ return y.id === x.key; });
      return meta && meta.chapter === CH_ID && x.wrongN > 0;
    });
    var html = '<p style="margin:0 0 8px;font-size:.96rem">本章正确率 <b class="' + cls + '">' + pct + '%</b>' +
      '　练过 ' + cw.answered + ' 题　错 ' + cw.wrongN + ' 题' +
      (cw.topErr ? ('　主因 <b>' + (BJM.ERR_NAME[cw.topErr] || '') + '</b>') : '') + '</p>';
    if (weakM.length) {
      html += '<p style="margin:0 0 8px;font-size:.88rem;color:var(--text-2)">薄弱方法卡：' +
        weakM.slice(0,3).map(function(x){
          var meta = (META.methods || []).find(function(y){ return y.id === x.key; });
          return '<a href="../method/' + x.key + '.html">' + (meta ? meta.name : x.key) + '</a>（' +
            Math.round(x.rate*100) + '%）';
        }).join('、') + '</p>';
    }
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">' +
      (cw.rate < 0.85 ? '<a class="btn primary sm" href="../drill.html?chapter=' + CH_ID + '&scope=weak">专攻本章最弱 →</a>' : '') +
      '<a class="btn soft sm" href="../drill.html?chapter=' + CH_ID + '&mode=guided">再练一组</a>' +
      '<a class="btn ghost sm" href="../wrong.html">看全局错因</a></div>';
    diag.innerHTML = html;

    // 前置章也弱时提示
    var note = document.getElementById('prereqNote');
    if (note) {
      var chMeta = (META.chapters || []).find(function(x){ return x.id === CH_ID; });
      var byCh = {};
      BJM.chapterWeakness().forEach(function(x){ byCh[x.key] = x; });
      var drags = (chMeta && chMeta.prereq || []).filter(function(p){
        var pw = byCh[p]; return pw && pw.answered && pw.rate < 0.7;
      });
      if (drags.length) {
        note.innerHTML = '⚠ 前置章正确率也低于 70%：' + drags.map(function(p){
          var pm = (META.chapters || []).find(function(x){ return x.id === p; });
          return '<a href="' + p + '.html">' + (pm ? pm.name : p) + '</a>';
        }).join('、') + '　建议先补前置。';
        note.style.color = 'var(--rose)';
      }
    }
  }

  BJM.ready(function(){ paint(); loadChapter().then(paint); });
  document.addEventListener('bj:qlog', function(){ loadChapter().then(paint); });
})();
`;

  const html = page({
    base: '../', active: 'map.html',
    title: `${c.name} · 第 ${c.no} 章`, desc: `${c.name}：方法卡掌握度与练习入口。`, body, script,
  });
  return html.replace('<body data-base="../">', `<body data-base="../">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 7：错因诊断
   ========================================================== */
function buildWrong() {
  const R = newRenderers();
  const ERR = [
    ['concept', '概念不清', '定义、定理的适用条件没弄清', '去做条件判断题', 'concept.html'],
    ['method', '方法未掌握', '没思路，或选错了工具', '看识别信号 + 母题', 'method.html'],
    ['construct', '构造不出', '几何题看不出辅助线', '看构造模型', 'method.html'],
    ['calc', '计算失误', '会做但算错', '进计算专项（连对 3 次出册）', 'drill.html?scope=wrong'],
    ['express', '表达不规范', '审题漏条件、步骤跳步', '做找错练习', 'drill.html?scope=wrong'],
  ];

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 智能错题本</div>
  <h1>智能错题本</h1>
  <p class="lede">做错的题自动收录，按错因分组。可以搜索、按每页 10 / 20 / 50 条翻页、<b>整页重做</b>，也能一键打印 A4 错题纸做纸质复盘。<br>
  <span style="color:var(--text-3);font-size:.92em">每题都给出完整解答与各步答案，方便脱离电脑复盘。</span></p>
</div>

<section class="section" style="margin-top:20px">
  <div class="kv">
    <div class="k"><b id="kTotal">0</b><span>累计作答</span></div>
    <div class="k"><b id="kRate" style="color:var(--accent)">—</b><span>综合正确率</span></div>
    <div class="k"><b id="kWrong" style="color:var(--rose)">0</b><span>错题本</span></div>
    <div class="k"><b id="kWeak" style="color:var(--gold)">0</b><span>薄弱单元</span></div>
  </div>
</section>

<section class="section" style="margin-top:22px">
  <div class="chips" id="tabs">
    <button class="chip" data-tab="all">全部 <span id="nAll">0</span></button>
    <button class="chip" data-tab="concept">概念不清 <span id="nConcept">0</span></button>
    <button class="chip" data-tab="method">方法未掌握 <span id="nMethod">0</span></button>
    <button class="chip" data-tab="construct">构造不出 <span id="nConstruct">0</span></button>
    <button class="chip" data-tab="calc">计算失误 <span id="nCalc">0</span></button>
    <button class="chip" data-tab="express">表达不规范 <span id="nExpress">0</span></button>
    <button class="chip" data-tab="diag">弱点诊断</button>
  </div>
  <div class="toolbar" id="wbToolbar" style="margin-top:16px">
    <input class="field" id="wq" type="search" placeholder="在错题本里搜索题干、章节、方法卡…" autocomplete="off">
    <select class="field" id="psize" style="max-width:130px">
      <option value="10">每页 10 条</option>
      <option value="20">每页 20 条</option>
      <option value="50">每页 50 条</option>
    </select>
    <button class="btn primary sm" id="redoBtn">重做本页</button>
    <button class="btn soft sm" id="printBtn">🖨️ 打印错题纸</button>
    <button class="btn ghost sm" id="clearBtn">清空本类</button>
  </div>
  <div class="note" id="wbHint" style="margin-bottom:16px">共 <b>0</b> 条</div>
  <div id="wbList"></div>
  <div class="pager" id="wbPager"></div>
  <div class="empty" id="wbEmpty" style="display:none">
    <b>错题本是空的</b>
    <span>去 <a href="drill.html">分步刷题</a> 或 <a href="concept.html">概念自测</a>，做错的会自动收进来</span>
  </div>
</section>

<section class="section" id="redoZone" style="display:none">
  <div class="section-head">
    <div class="section-head-left">
      <span class="kicker">重做</span>
      <h2 style="font-size:1.15rem">本页错题重做</h2>
      <span class="sub" id="redoInfo"></span>
    </div>
    <button class="btn ghost sm" id="redoClose">收起</button>
  </div>
  <div id="redoHost"></div>
</section>

<div id="pane-diag" style="display:none">
  <section class="section" style="margin-top:18px">
    <div class="section-head">
      <div class="section-head-left">
        <span class="kicker">下一步练什么</span>
        <h2>按优先级排序的薄弱单元</h2>
        <span class="sub">正确率越低、错题越多越靠前。点「专项训练」直接进该单元的题</span>
      </div>
    </div>
    <div id="actions"></div>
  </section>

  <section class="section" style="margin-top:26px">
    <div class="section-head">
      <div class="section-head-left">
        <span class="kicker">错因分布</span>
        <h2>你主要错在哪一层</h2>
      </div>
    </div>
    <div id="errBars" class="traps"></div>
  </section>

  <section class="section" style="margin-top:26px">
    <div class="section-head">
      <div class="section-head-left">
        <span class="kicker">卡点分布</span>
        <h2>你最常卡在第几步</h2>
        <span class="sub">第 1 步就卡 → 多半是概念或读题；第 3 步以后卡 → 多半是计算或收尾</span>
      </div>
    </div>
    <div id="stuckBars" class="card" style="padding:18px 20px"></div>
  </section>
</div>

<!-- 打印专用区：全量条目，不受分页与搜索影响之外的分页限制 -->
<section class="section" id="printZone">
  <div id="printList" class="print-list"></div>
</section>
`;

  const script = `
(function(){
  var ERR_META = ${JSON.stringify(ERR.reduce((a, [k, n, d, fix, href]) => (a[k] = { n, d, fix, href }, a), {}))};
  var ERR_NAME = BJM.ERR_NAME;
  var META = window.BJM.META || { chapters: [], methods: [] };
  var PSIZE_KEY = 'bj-wb-psize';

  var loadedAll = false;
  var page = 0;
  var query = '';
  var PAGE_SIZE = parseInt(localStorage.getItem(PSIZE_KEY) || '10', 10);
  if ([10, 20, 50].indexOf(PAGE_SIZE) < 0) PAGE_SIZE = 10;

  /* ?tab=concept 等深链，便于从别的页面跳进指定错因 */
  var TAB_IDS = ['all','concept','method','construct','calc','express','diag'];
  var tabParam = new URLSearchParams(location.search).get('tab');
  var tab = TAB_IDS.indexOf(tabParam) >= 0 ? tabParam : 'all';

  function CH(){ return window.BJM.CH || {}; }

  function loadAll(){
    if (loadedAll) return Promise.resolve();
    var ids = (META.chapters || []).map(function(c){ return c.id; });
    return Promise.all(ids.map(function(id){
      return new Promise(function(res){
        var s = document.createElement('script');
        s.src = 'dist/data/ch/' + id + '.js';
        s.onload = res; s.onerror = res;
        document.head.appendChild(s);
      });
    })).then(function(){
      var ch = CH(), seen = {};
      Object.keys(ch).forEach(function(id){
        var d = ch[id].defs;
        if (d && !seen[d]) {
          seen[d] = 1;
          var box = document.createElement('div');
          box.innerHTML = d;
          document.body.appendChild(box.firstChild || box);
        }
      });
      loadedAll = true;
      pruneUnresolvable();
    });
  }

  /**
   * 清掉无法渲染的错题记录。
   * 来源：
   *   1) 早期版本把概念题记录成 c-xxx#n，但当时错题本只认题目 id
   *   2) 内容改动后 id 失效（题目被删、概念卡测试减少）
   * 这些记录留着只会在页面上显示「题目数据未找到」，没有复习价值。
   */
  var prunedOnce = false;
  function pruneUnresolvable(){
    if (!loadedAll) return 0;               // 分片没加载完，无法判断有效性
    var list = BJM.wrongList();
    var dead = [];
    list.forEach(function(w){
      if (!resolvable(w)) dead.push(w.id);
    });
    if (!dead.length) return 0;
    var n = BJM.qMasterBatch(dead);
    if (n && !prunedOnce) {
      prunedOnce = true;
      BJM.toast('已清理 ' + n + ' 条失效的错题记录');
    }
    return n;
  }

  function qmap(){
    var m = {}, ch = CH();
    Object.keys(ch).forEach(function(cid){
      (ch[cid].questions || []).forEach(function(q){ m[q.id] = q; });
    });
    return m;
  }
  /* 概念卡索引：id → { claim, tests[], chapter } */
  function cmap(){
    var m = {}, ch = CH();
    Object.keys(ch).forEach(function(cid){
      (ch[cid].concepts || []).forEach(function(c){ m[c.id] = c; });
    });
    return m;
  }
  /* 一条记录能否渲染：概念卡记录要有对应卡与测试序号，题目记录要有题目 */
  function resolvable(w){
    if (w.kind === 'concept') {
      var c = cmap()[w.conceptId];
      return !!(c && c.tests && w.testIdx >= 0 && c.tests[w.testIdx]);
    }
    return !!qmap()[w.id];
  }
  function mname(id){
    var m = (META.methods || []).find(function(x){ return x.id === id; });
    return m ? m.name : '';
  }
  function cname(id){
    var c = (META.chapters || []).find(function(x){ return x.id === id; });
    return c ? (c.no + '. ' + c.name) : '';
  }

  /* ============ 数据 ============ */
  function baseItems(){
    var list = BJM.wrongList();
    if (tab !== 'all' && tab !== 'diag') {
      list = list.filter(function(w){ return w.errorType === tab; });
    }
    list.sort(function(a, b){ return b.times - a.times; });
    return list;
  }
  function currentItems(){
    var list = baseItems();
    if (!query) return list;
    var qm = qmap();
    var t = query.toLowerCase();
    return list.filter(function(w){
      var q = qm[w.id];
      var hay = [
        w.id, w.errorType, ERR_NAME[w.errorType] || '',
        cname(w.chapter), mname(w.method),
        q ? (q.stem || '') : '',
        q ? (q.tierName || '') : '',
        q ? (q.solution || '') : '',
      ].join(' ').toLowerCase();
      return hay.indexOf(t) >= 0;
    });
  }

  /* ============ 单条渲染 ============ */
  /* 每步答案：选择题取 options[key]，填空取 answer */
  function stepAnswerHtml(s){
    if (!s) return '';
    if (s.type === 'choice' || s.type === 'expr') {
      var opts = s.options || [];
      var k = s.key;
      if (k == null || !opts[k]) return '';
      return (s.optionsHtml && s.optionsHtml[k]) ? s.optionsHtml[k] : BJM.esc(opts[k]);
    }
    if (s.type === 'judge') return s.key ? '成立' : '不成立';
    var ans = s.answer != null ? s.answer : ((s.accept || [])[0] || '');
    return ans ? (s.answerHtml || BJM.esc(ans)) : '';
  }

  function itemHtml(w){
    var qm = qmap();
    var q = qm[w.id];
    var meta = ERR_META[w.errorType] || { n: w.errorType };
    var metaLine = [cname(w.chapter), mname(w.method),
      w.stuckStep >= 0 ? ('卡在第 ' + (w.stuckStep + 1) + ' 步') : '',
      '错 ' + w.times + ' 次'].filter(Boolean).join(' · ');

    /* 概念卡错题：用概念卡自己的结构渲染（不是题目，没有 steps/solution） */
    if (w.kind === 'concept') {
      var c = cmap()[w.conceptId];
      var t = c && c.tests ? c.tests[w.testIdx] : null;
      if (!c || !t) {
        // 概念卡已不存在（内容被改过）：不显示脏条目，等清理逻辑移除
        return '';
      }
      var cMetaLine = [cname(w.chapter), '概念卡', '错 ' + w.times + ' 次'].filter(Boolean).join(' · ');
      var verdict = t.a ? '成立' : '不成立';
      return '<div class="wb-item" data-id="' + w.id + '">' +
        '<div class="wb-head">' +
          '<span class="wb-type concept">概念判断</span>' +
          '<span class="wb-tier">' + BJM.esc(c.claim || '') + '</span>' +
          '<span class="wb-head-meta">' + cMetaLine + '</span>' +
        '</div>' +
        '<div class="wb-stem">' + (t.qHtml || BJM.esc(t.q || '')) + '</div>' +
        '<div class="wb-verdict">判断结果：<b class="' + (t.a ? 'ok' : 'bad') + '">' + verdict + '</b></div>' +
        '<div class="wb-why"><b>为什么：</b>' + (t.whyHtml || BJM.esc(t.why || '')) + '</div>' +
        '<div class="wb-foot">' +
          '<span class="wb-act">' +
            '<button class="btn ghost xs" data-master="' + w.id + '">✓ 已掌握</button>' +
            '<a class="btn ghost xs" href="concept.html?chapter=' + w.chapter + '">去练概念 →</a>' +
          '</span>' +
        '</div>' +
      '</div>';
    }

    if (!q) {
      return '';
    }

    // 顶层选项（送分单步题）
    var optsBlock = '';
    var qOpts = q.options;
    var qOptsHtml = q.optionsHtml;
    if (qOpts && qOpts.length) {
      var qKey = q.answer;
      optsBlock = '<div class="wb-opts">' + qOpts.map(function(o, k){
        var cls = (k === qKey) ? ' right' : '';
        var txt = (qOptsHtml && qOptsHtml[k] != null) ? qOptsHtml[k] : BJM.esc(o);
        return '<div class="wb-opt' + cls + '"><span class="wb-key">' + 'ABCD'[k] + '</span><span>' + txt + '</span></div>';
      }).join('') + '</div>';
    }

    // 各步答案（分步题）
    var stepsBlock = '';
    var steps = q.steps || [];
    if (steps.length > 1) {
      stepsBlock = '<div class="wb-steps">' + steps.map(function(s, i){
        var a = stepAnswerHtml(s);
        return '<div class="wb-step">' +
          '<span class="wb-step-no">' + (i + 1) + '</span>' +
          '<span class="wb-step-ask">' + (s.askHtml || BJM.esc(s.ask || '')) + '</span>' +
          (a ? '<span class="wb-step-ans">' + a + '</span>' : '') +
        '</div>';
      }).join('') + '</div>';
    }

    return '<div class="wb-item" data-id="' + w.id + '">' +
      '<div class="wb-head">' +
        '<span class="wb-type ' + w.errorType + '">' + (meta.n || w.errorType) + '</span>' +
        (w.tier ? '<span class="wb-tier">' + (META.tiers[w.tier] || w.tier) + '</span>' : '') +
        '<span class="wb-head-meta">' + metaLine + '</span>' +
      '</div>' +
      '<div class="wb-stem">' + (q.stemHtml || BJM.esc(q.stem || '')) + '</div>' +
      (q.figHtml ? '<div class="wb-fig">' + q.figHtml + '</div>' : '') +
      optsBlock +
      stepsBlock +
      (q.solutionHtml ? '<div class="wb-why"><b>完整解答：</b>' + q.solutionHtml + '</div>' : '') +
      '<div class="wb-foot">' +
        '<span class="wb-act">' +
          '<button class="btn ghost xs" data-master="' + w.id + '">✓ 已掌握</button>' +
          '<a class="btn ghost xs" href="' + ((meta.href) || 'method.html') + '">去补这一类 →</a>' +
        '</span>' +
      '</div>' +
    '</div>';
  }

  /* ============ 打印区：全量（仅受 Tab 与搜索约束，不受分页限制） ============ */
  function drawPrint(){
    var items = currentItems();
    var host = document.getElementById('printList');
    if (!items.length) {
      host.innerHTML = '<div class="empty"><b>当前标签页没有错题</b>没有可打印的内容</div>';
      return;
    }
    var tabName = tab === 'all' ? '全部错题' : (tab === 'diag' ? '错题' : (ERR_META[tab] || {}).n);
    var today = new Date().toLocaleDateString('zh-CN');
    host.innerHTML = '<div class="print-head"><b>北京中考数学领航 · 智能错题本</b>' +
      '<span>' + tabName + ' · 共 ' + items.length + ' 条 · ' + today + '</span></div>' +
      items.map(itemHtml).join('');
  }

  /* ============ 主渲染 ============ */
  function draw(){
    var items = currentItems();
    var all = baseItems();
    var total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (page >= total) page = total - 1;
    if (page < 0) page = 0;
    var slice = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // Tab 计数
    var allWrong = BJM.wrongList();
    var byType = {};
    allWrong.forEach(function(w){ byType[w.errorType] = (byType[w.errorType] || 0) + 1; });
    var setN = function(id, v){ var e = document.getElementById(id); if (e) e.textContent = v; };
    setN('nAll', allWrong.length);
    setN('nConcept', byType.concept || 0);
    setN('nMethod', byType.method || 0);
    setN('nConstruct', byType.construct || 0);
    setN('nCalc', byType.calc || 0);
    setN('nExpress', byType.express || 0);

    var host = document.getElementById('wbList');
    var empty = document.getElementById('wbEmpty');
    var pager = document.getElementById('wbPager');
    var redoBtn = document.getElementById('redoBtn');
    var printBtn = document.getElementById('printBtn');
    var clearBtn = document.getElementById('clearBtn');
    var hint = document.getElementById('wbHint');

    if (!items.length) {
      host.innerHTML = '';
      pager.innerHTML = '';
      empty.style.display = '';
      redoBtn.disabled = true;
      printBtn.disabled = true;
      clearBtn.disabled = true;
      hint.innerHTML = all.length
        ? '共 <b>0</b> 条匹配（已筛选，本类总计 ' + all.length + ' 条）'
        : '共 <b>0</b> 条';
      drawPrint();
      return;
    }
    empty.style.display = 'none';
    redoBtn.disabled = false;
    printBtn.disabled = false;
    clearBtn.disabled = false;
    hint.innerHTML = '共 <b>' + items.length + '</b> 条' +
      (items.length !== all.length ? '（已筛选，本类总计 ' + all.length + ' 条）' : '') +
      ' · 第 ' + (page + 1) + ' / ' + total + ' 页';

    host.innerHTML = slice.map(itemHtml).join('');

    // 分页（>9 页折叠）
    var html = '<button data-pg="' + (page - 1) + '"' + (page === 0 ? ' disabled' : '') + '>‹</button>';
    for (var i = 0; i < total; i++) {
      if (total > 9 && i > 1 && i < total - 2 && Math.abs(i - page) > 1) {
        if (i === 2 || i === total - 3) html += '<span class="pg-dots">…</span>';
        continue;
      }
      html += '<button data-pg="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
    }
    html += '<button data-pg="' + (page + 1) + '"' + (page === total - 1 ? ' disabled' : '') + '>›</button>';
    pager.innerHTML = html;
    [].forEach.call(pager.querySelectorAll('[data-pg]'), function(b){
      b.addEventListener('click', function(){
        var p = parseInt(b.getAttribute('data-pg'), 10);
        if (!isNaN(p)) { page = p; draw(); window.scrollTo({ top: 180, behavior: 'smooth' }); }
      });
    });

    [].forEach.call(host.querySelectorAll('[data-master]'), function(b){
      b.addEventListener('click', function(){
        BJM.qClearWrong(b.getAttribute('data-master'));
        BJM.toast('已移出错题本');
        draw();
      });
    });

    drawPrint();
  }

  /* ============ Tab / 搜索 / 每页条数 ============ */
  function applyTab(t){
    tab = t;
    page = 0;
    document.getElementById('redoZone').style.display = 'none';
    var isDiag = tab === 'diag';
    document.getElementById('wbToolbar').style.display = isDiag ? 'none' : '';
    document.getElementById('wbHint').style.display = isDiag ? 'none' : '';
    document.getElementById('wbList').style.display = isDiag ? 'none' : '';
    document.getElementById('wbPager').style.display = isDiag ? 'none' : '';
    document.getElementById('wbEmpty').style.display = isDiag ? 'none' : '';
    document.getElementById('printZone').style.display = isDiag ? 'none' : '';
    document.getElementById('pane-diag').style.display = isDiag ? '' : 'none';
    if (!isDiag) draw();
  }

  [].forEach.call(document.querySelectorAll('#tabs .chip'), function(c){
    c.classList.toggle('on', c.getAttribute('data-tab') === tab);
    c.addEventListener('click', function(){
      [].forEach.call(document.querySelectorAll('#tabs .chip'), function(x){ x.classList.remove('on'); });
      c.classList.add('on');
      applyTab(c.getAttribute('data-tab'));
    });
  });

  document.getElementById('wq').addEventListener('input', function(e){
    query = e.target.value.trim();
    page = 0;
    draw();
  });

  var psizeSel = document.getElementById('psize');
  psizeSel.value = String(PAGE_SIZE);
  psizeSel.addEventListener('change', function(){
    PAGE_SIZE = parseInt(psizeSel.value, 10);
    try { localStorage.setItem(PSIZE_KEY, String(PAGE_SIZE)); } catch (e) {}
    page = 0;
    draw();
  });

  /* ============ 打印 ============ */
  document.getElementById('printBtn').addEventListener('click', function(){
    drawPrint();
    window.print();
  });

  /* ============ 清空 ============ */
  document.getElementById('clearBtn').addEventListener('click', function(){
    var label = tab === 'all' ? '全部错题' : (ERR_META[tab] || {}).n;
    var n = currentItems().length;
    if (!n) return;
    if (!confirm('确定清空「' + label + '」的 ' + n + ' 道错题？此操作不可撤销。')) return;
    if (tab === 'all') BJM.qClearAllWrong();
    else BJM.qClearWrongByType(tab);
    BJM.toast('已清空 ' + n + ' 道');
    page = 0;
    refreshStats();
    draw();
  });

  /* ============ 重做本页 ============ */
  function redoPage(){
    var items = currentItems();
    var slice = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    if (!slice.length) return;
    var qm = qmap();
    var qs = slice.map(function(w){ return qm[w.id]; }).filter(Boolean);
    if (!qs.length) {
      BJM.toast('本页只有概念判断题，请到「概念自测」重做');
      return;
    }

    var skipped = slice.length - qs.length;
    var zone = document.getElementById('redoZone');
    zone.style.display = '';
    document.getElementById('redoInfo').textContent =
      '本页 ' + qs.length + ' 题 · 答对即移出错题本' +
      (skipped ? '（另有 ' + skipped + ' 条概念判断题需到概念自测重做）' : '');

    // 记录重做前状态，用于完成态统计
    var beforeIds = {};
    qs.forEach(function(q){ beforeIds[q.id] = 1; });
    var beforeWrong = {};
    BJM.wrongList().forEach(function(w){ if (beforeIds[w.id]) beforeWrong[w.id] = 1; });

    var done = 0, released = 0;

    BJM.step({
      mount: '#redoHost',
      questions: qs,
      mode: 'guided',
      shuffle: false,
      onAnswer: function(q, ok, rec){
        BJM.qRecord({
          id: q.id, chapter: q.chapter, method: q.method, tier: q.tier,
          result: rec.result, stuckStep: rec.stuckStep,
          errorType: ok ? null : (rec.stuckStep === 0 ? 'concept' : 'method'),
          timeMs: rec.timeMs, src: 'redo',
        });
        BJM.bumpDay('questions', 1);
        if (ok) {
          done++;
          if (beforeWrong[q.id]) released++;
        }
      },
      onFinish: function(){
        setTimeout(function(){ refreshStats(); draw(); }, 300);
        // 覆盖引擎的默认完成态，显示「答对 x/y · 其中 z 个已移出」
        // 用轮询而不是固定延时：引擎渲染完成态的时机不确定
        var tries = 0;
        (function inject(){
          var host = document.getElementById('redoHost');
          if (!host) return;
          var win = host.querySelector('.se-done-card');
          if (!win) {
            if (tries++ < 40) setTimeout(inject, 60);
            return;
          }
          if (win.querySelector('.redo-summary')) return;   // 已插入
          var extra = document.createElement('div');
          extra.className = 'redo-summary';
          extra.innerHTML = '本页共 ' + qs.length + ' 题 · 答对 <b>' + done + '</b> 题' +
            ' · 其中 <b>' + released + '</b> 题已移出错题本' +
            (done < qs.length ? ' · 答错的题仍保留在错题本' : '');
          var actions = win.querySelector('.se-actions');
          if (actions) win.insertBefore(extra, actions);
          var again = win.querySelector('.se-again');
          if (again) {
            again.textContent = '返回错题本';
            again.addEventListener('click', function(){
              document.getElementById('redoZone').style.display = 'none';
              draw();
              document.getElementById('wbList').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, { once: true });
          }
        })();
      },
    });
    zone.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  document.getElementById('redoBtn').addEventListener('click', redoPage);
  document.getElementById('redoClose').addEventListener('click', function(){
    document.getElementById('redoZone').style.display = 'none';
  });

  /* ============ 弱点诊断 ============ */
  function renderActions(){
    var acts = BJM.nextActions(6);
    var el = document.getElementById('actions');
    if (!acts.length) {
      el.innerHTML = '<div class="empty">还没有足够数据。先去 <a href="drill.html">分步刷题</a> 练两组。</div>';
      return;
    }
    el.innerHTML = acts.map(function(a, i){
      var isM = a.kind === 'method';
      var title = isM ? mname(a.key) : cname(a.key);
      var errName = a.topErr ? (ERR_NAME[a.topErr] || a.topErr) : '—';
      var stuck = a.topStuck >= 0 ? ('第 ' + (a.topStuck + 1) + ' 步') : '—';
      var cls = a.rate >= 0.85 ? 'ok' : a.rate >= 0.6 ? 'warn' : 'bad';
      return '<div class="card weak-card" style="margin-bottom:12px;padding:16px 18px">' +
        '<div class="weak-head">' +
          '<span class="weak-rank">' + (i + 1) + '</span>' +
          '<div class="weak-main">' +
            '<div class="weak-title">' + title + ' <span class="weak-tag">' + (isM ? '方法卡' : '章节') + '</span></div>' +
            '<div class="weak-meta">练过 ' + a.answered + ' 题 · 正确率 <b class="' + cls + '">' + Math.round(a.rate * 100) + '%</b>' +
              ' · 错 ' + a.wrongN + ' 题 · 主因 ' + errName + ' · 常卡 ' + stuck + '</div>' +
          '</div>' +
          '<a class="btn primary sm" href="' + a.href + '">专项训练 →</a>' +
        '</div></div>';
    }).join('');
  }

  function renderErrBars(){
    var stats = BJM.errStats();
    var total = stats.reduce(function(a, s){ return a + s.n; }, 0);
    var maxN = Math.max.apply(null, stats.map(function(s){ return s.n; }).concat([1]));
    var sorted = stats.slice().sort(function(a, b){ return b.n - a.n; });
    document.getElementById('errBars').innerHTML = sorted.map(function(s){
      var meta = ERR_META[s.type] || { n: s.type, d: '', fix: '', href: 'drill.html' };
      if (!s.n) {
        return '<div class="trap" style="border-left-color:var(--border);opacity:.6">' +
          '<div class="trap-t">' + meta.n + ' <span style="font-weight:400;color:var(--text-3);font-size:.8rem">暂无记录</span></div>' +
          '<div class="trap-why">' + meta.d + '</div></div>';
      }
      var share = total ? Math.round(s.n / total * 100) : 0;
      var rateP = Math.round(s.rate * 100);
      var barW = Math.max(3, Math.round(s.n / maxN * 100));
      var color = rateP >= 75 ? 'var(--ok)' : rateP >= 50 ? 'var(--gold)' : 'var(--rose)';
      return '<div class="trap" style="border-left-color:' + color + '">' +
        '<div class="trap-t">' + meta.n +
          ' <span style="font-weight:400;color:var(--text-3);font-size:.8rem">' +
          s.n + ' 次 · 占 ' + share + '% · 正确率 ' + rateP + '%</span></div>' +
        '<div class="err-bar"><i style="width:' + barW + '%;background:' + color + '"></i></div>' +
        '<div class="trap-why">' + meta.d + '</div>' +
        '<div style="margin-top:8px;font-size:.84rem"><b style="color:var(--accent)">补救：</b><a href="' + meta.href + '">' + meta.fix + '</a></div>' +
      '</div>';
    }).join('');
  }

  function renderStuck(){
    var dist = BJM.stuckDistribution();
    var keys = Object.keys(dist).map(Number).filter(function(k){ return k >= 0; }).sort(function(a,b){ return a-b; });
    var el = document.getElementById('stuckBars');
    if (!keys.length) {
      el.innerHTML = '<div class="empty" style="padding:6px 0">还没有记录到卡点。</div>';
      return;
    }
    var max = Math.max.apply(null, keys.map(function(k){ return dist[k]; }));
    el.innerHTML = '<div class="stuck-chart">' + keys.map(function(k){
      var n = dist[k];
      var h = Math.round(n / max * 100);
      var advice = k === 0 ? '多半是概念或读题' : k === 1 ? '多半是选错方法' : '多半是计算或收尾';
      return '<div class="stuck-col" title="第 ' + (k+1) + ' 步：' + n + ' 次（' + advice + '）">' +
        '<div class="stuck-bar-wrap"><i style="height:' + h + '%"></i></div>' +
        '<div class="stuck-label">第' + (k+1) + '步</div>' +
        '<div class="stuck-num">' + n + '</div></div>';
    }).join('') + '</div>' +
    '<p class="setup-hint" style="margin-top:10px">柱越高说明这一步越常卡。第 1 步卡得多 → 优先回概念卡；中后段卡得多 → 进计算专项。</p>';
  }

  function refreshStats(){
    var t = BJM.totalAnswered();
    var set = function(sel, v){ var e = document.querySelector(sel); if (e) e.textContent = v; };
    set('#kTotal', t.n);
    set('#kRate', t.n ? Math.round(t.rate * 100) + '%' : '—');
    set('#kWrong', BJM.wrongIds().length);
    set('#kWeak', BJM.nextActions(99).length);
  }

  function refresh(){
    pruneUnresolvable();
    refreshStats();
    draw();
    renderActions();
    renderErrBars();
    renderStuck();
  }

  BJM.ready(function(){
    refresh();
    applyTab(tab);          // 深链进入时同步显示状态
    loadAll().then(refresh);
  });
  document.addEventListener('bj:qlog', refresh);
  document.addEventListener('bj:day', refreshStats);
})();
`;

  const html = page({
    active: 'wrong.html', title: '智能错题本',
    desc: '自动收录错题，按错因分组；搜索、分页、整页重做、打印 A4 错题纸。',
    body, script, useStep: true, data: ['meta'],
  });
  return html.replace('<body data-base="">', `<body data-base="">\n${R.math.defs()}`);
}

/* ==========================================================
   页面 8：公式库
   ========================================================== */
function buildGraph() {
  const R = newRenderers();
  const PAGE_SIZE = 15;

  /* 扁平化 + 每条的检索文本（名称 + 公式原文 + 条件 + 误用 + 章名） */
  const all = FORMULAS.map((f, i) => {
    const ch = CH_BY_ID.get(f.chapter) || {};
    return {
      idx: i,
      name: f.name,
      chapter: f.chapter,
      chapterName: ch.name || '',
      chapterNo: ch.no || 99,
      block: ch.block || '其他',
      texHtml: R.math.render(f.tex),
      condHtml: R.math.render(f.cond),
      misuseHtml: R.math.render(f.misuse),
      search: (f.name + ' ' + f.tex + ' ' + f.cond + ' ' + f.misuse + ' ' + (ch.name || '')).replace(/\s+/g, '').toLowerCase(),
    };
  });

  /* Tab：全部 + 有公式的章（按章号排序） */
  const chapterSet = [...new Set(all.map((f) => f.chapter))];
  const chapters = chapterSet
    .map((id) => {
      const c = CH_BY_ID.get(id) || {};
      return { id, name: c.name || id, no: c.no || 99, block: c.block || '其他', n: all.filter((f) => f.chapter === id).length };
    })
    .sort((a, b) => a.no - b.no);

  const tabs = [{ id: 'all', name: '全部', n: all.length }].concat(chapters.map((c) => ({ id: c.id, name: c.name, n: c.n })));

  const tabsHtml = tabs.map((t, i) =>
    `<button class="chip${i === 0 ? ' on' : ''}" data-tab="${t.id}">${esc(t.name)} <span>${t.n}</span></button>`
  ).join('');

  /* data-search 在构建期生成：含名称 + 原始 LaTeX + 条件 + 误用 + 章名。
     不能用 DOM 的 textContent 当检索文本——公式是 SVG，没有文本节点。 */
  const rowHtml = (f) => `<tr data-idx="${f.idx}" data-search="${esc(f.search)}">
    <td class="fg-name">${esc(f.name)}</td>
    <td class="fg-tex">${f.texHtml}</td>
    <td class="fg-cond">${f.condHtml}</td>
    <td class="fg-misuse">${f.misuseHtml}</td>
  </tr>`;

  const body = `
<div class="page-head">
  <div class="crumb"><a href="index.html">首页</a> / 公式库</div>
  <h1>公式定理库</h1>
  <p class="lede">${FORMULAS.length} 条公式定理，按章节分类。重点不在「记住公式」，而在第三、四列的<b>适用条件</b>与<b>常见误用</b>——理科的失分多数是<b>条件不满足还硬套</b>。</p>
</div>

<section class="section" style="margin-top:20px">
  <div class="chips" id="fgTabs">${tabsHtml}</div>
  <div class="toolbar" style="margin-top:16px">
    <input class="field" id="fgSearch" type="search" placeholder="搜索公式名、适用条件或误用，如：判别式 / a≠0 / 垂直" autocomplete="off">
    <select class="field" id="fgSize" style="max-width:130px">
      <option value="15">每页 15 条</option>
      <option value="30">每页 30 条</option>
      <option value="50">每页 50 条</option>
    </select>
  </div>
  <div class="note" id="fgHint" style="margin-bottom:14px">共 <b>${FORMULAS.length}</b> 条</div>

  <div class="tbl-wrap">
    <table class="gtable fg-table">
      <thead><tr>
        <th class="fg-name">名称</th>
        <th class="fg-tex">公式</th>
        <th class="fg-cond">适用条件</th>
        <th class="fg-misuse">常见误用</th>
      </tr></thead>
      <tbody id="fgBody">${all.map(rowHtml).join('')}</tbody>
    </table>
  </div>

  <div class="pager" id="fgPager"></div>
  <div class="empty" id="fgEmpty" style="display:none">
    <b>没有匹配的公式</b>
    <span>换个关键词，或切回「全部」分类</span>
  </div>
</section>
`;

  const script = `
(function(){
  var PAGE_SIZE = 15;
  var PSIZE_KEY = 'bj-fg-psize';
  var saved = parseInt(localStorage.getItem(PSIZE_KEY) || '15', 10);
  if ([15, 30, 50].indexOf(saved) >= 0) PAGE_SIZE = saved;

  var rows = [].slice.call(document.querySelectorAll('#fgBody tr'));
  var tabs = [].slice.call(document.querySelectorAll('#fgTabs .chip'));
  var search = document.getElementById('fgSearch');
  var sizeSel = document.getElementById('fgSize');
  var hint = document.getElementById('fgHint');
  var pager = document.getElementById('fgPager');
  var empty = document.getElementById('fgEmpty');
  var table = document.querySelector('.fg-table');

  var tab = 'all';
  var query = '';
  var page = 0;

  /* 每行记录所属章，供分类筛选 */
  rows.forEach(function(r){
    var idx = parseInt(r.getAttribute('data-idx'), 10);
    r.__chapter = window.BJM.FG_CHAPTERS ? window.BJM.FG_CHAPTERS[idx] : '';
    r.__search = r.getAttribute('data-search') || '';
  });

  function filtered(){
    return rows.filter(function(r){
      var okTab = tab === 'all' || r.__chapter === tab;
      var okQ = !query || r.__search.indexOf(query) >= 0;
      return okTab && okQ;
    });
  }

  function draw(){
    var list = filtered();
    var total = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page >= total) page = total - 1;
    if (page < 0) page = 0;
    var slice = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    rows.forEach(function(r){ r.style.display = 'none'; });
    slice.forEach(function(r){ r.style.display = ''; });

    if (!list.length) {
      table.style.display = 'none';
      pager.innerHTML = '';
      empty.style.display = '';
      hint.innerHTML = query
        ? '共 <b>0</b> 条匹配'
        : '本分类暂无公式';
      return;
    }
    table.style.display = '';
    empty.style.display = 'none';

    hint.innerHTML = '共 <b>' + list.length + '</b> 条' +
      (query ? '（已筛选）' : '') +
      ' · 第 ' + (page + 1) + ' / ' + total + ' 页';

    var html = '<button data-pg="' + (page - 1) + '"' + (page === 0 ? ' disabled' : '') + '>‹</button>';
    for (var i = 0; i < total; i++) {
      if (total > 9 && i > 1 && i < total - 2 && Math.abs(i - page) > 1) {
        if (i === 2 || i === total - 3) html += '<span class="pg-dots">…</span>';
        continue;
      }
      html += '<button data-pg="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + (i + 1) + '</button>';
    }
    html += '<button data-pg="' + (page + 1) + '"' + (page === total - 1 ? ' disabled' : '') + '>›</button>';
    pager.innerHTML = html;
    [].forEach.call(pager.querySelectorAll('[data-pg]'), function(b){
      b.addEventListener('click', function(){
        var p = parseInt(b.getAttribute('data-pg'), 10);
        if (!isNaN(p)) {
          page = p;
          draw();
          document.getElementById('fgTabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  [].forEach.call(tabs, function(t){
    t.addEventListener('click', function(){
      [].forEach.call(tabs, function(x){ x.classList.remove('on'); });
      t.classList.add('on');
      tab = t.getAttribute('data-tab');
      page = 0;
      draw();
    });
  });

  search.addEventListener('input', function(e){
    query = e.target.value.trim().replace(/\\s+/g, '').toLowerCase();
    page = 0;
    draw();
  });

  sizeSel.value = String(PAGE_SIZE);
  sizeSel.addEventListener('change', function(){
    PAGE_SIZE = parseInt(sizeSel.value, 10);
    try { localStorage.setItem(PSIZE_KEY, String(PAGE_SIZE)); } catch (e) {}
    page = 0;
    draw();
  });

  draw();
})();
`;

  /* 把每行所属章以数组形式注入，供脚本筛选（避免在 HTML 里塞 data 属性太长） */
  const fgChapters = JSON.stringify(all.map((f) => f.chapter));
  const html = page({
    active: 'graph.html', title: '公式定理库',
    desc: '含适用条件与常见误用的中考数学公式库，按章节分类。',
    body, script,
  });
  /* FG_CHAPTERS 必须在页面脚本执行前就存在，所以插在 body 开头（紧跟 defs） */
  return html.replace('<body data-base="">',
    `<body data-base="">\n${R.math.defs()}\n<script>window.BJM=window.BJM||{};window.BJM.FG_CHAPTERS=${fgChapters};</script>`);
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
    <h3>当前版本：P1 送分区版</h3>
    <p class="desc">覆盖卷面<b>送分区 58 分</b>与中档区主要题型。内容按课标知识块组织，方法卡按「识别信号」编排，错题按五类错因归类。当前 ${STATS.chapters} 章、${STATS.methods} 张方法卡、${STATS.questions} 题、${STATS.concepts} 条概念卡、${FORMULAS.length} 条公式——<b>不是完整套卷</b>，用于按题型反复练方法与步骤。</p>
    <div class="grid c4" style="margin-top:16px">
      <div><b>${STATS.chapters}</b><br><span style="color:var(--text-2);font-size:.86rem">章节</span></div>
      <div><b>${STATS.methods}</b><br><span style="color:var(--text-2);font-size:.86rem">方法卡</span></div>
      <div><b>${STATS.questions}</b><br><span style="color:var(--text-2);font-size:.86rem">题目</span></div>
      <div><b>${STATS.concepts}</b><br><span style="color:var(--text-2);font-size:.86rem">概念卡</span></div>
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
