/* ==========================================================
   内容校验 validate.mjs
   用法：node tools/validate.mjs
   退出码：0 全部通过 / 1 有错误

   校验项（P0 版）：
     ① 每题字段完整：id chapter method stem steps[]
     ② steps 长度 ≥ 2，每步有 ask/type/score，choice 有 options 与合法 key
     ③ chapter / method 引用存在
     ④ 变式必须有 variantOf 且指向存在的母题
     ⑤ 每张方法卡恰有 3 个变式（number/condition/reverse 各一）
     ⑥ 方法卡 steps 非空，pitfalls ≥ 2
     ⑦ 章节依赖边无悬空、无自引用
     ⑧ 题目 tier 合法，errorTags 在五类内
     ⑨ 公式：所有含 $...$ 的字段都能渲染成功
     ⑩ 图形：原语类型合法，坐标在 viewBox 内
     ⑪ 生成产物：内部链接可解析，页面存在
   ========================================================== */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CHAPTERS, METHODS, ALL_QUESTIONS as QUESTIONS, ALL_CONCEPTS as CONCEPTS, STATS,
} from '../src/index.js';
import { createMathRenderer } from './math-render.mjs';
import { createFigureRenderer } from './fig-render.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '..');

const errors = [];
const warns = [];
const E = (msg) => errors.push(msg);
const W = (msg) => warns.push(msg);

const CH_IDS = new Set(CHAPTERS.map((c) => c.id));
const M_IDS = new Set(METHODS.map((m) => m.id));
const Q_IDS = new Set(QUESTIONS.map((q) => q.id));
const TIERS = new Set(['send', 'mid', 'dist']);
const ERRS = new Set(['concept', 'method', 'construct', 'calc', 'express']);
const PRIMS = new Set(['pt', 'seg', 'ray', 'poly', 'circle', 'arc', 'angle', 'right',
  'label', 'curve', 'arrow', 'region', 'ticks']);
const STEP_TYPES = new Set(['choice', 'fill', 'judge', 'expr']);

/* ---------------- ① 章节 ---------------- */
/* P0 只建了 3 章样张，前置章节可能尚未建。这种情况降级为警告：
   依赖边本身是完整的（P1 会补齐 18 章），不应因未建而判错。 */
CHAPTERS.forEach((c) => {
  if (!c.id || !c.name) E(`章节缺 id/name：${JSON.stringify(c).slice(0, 60)}`);
  (c.prereq || []).forEach((p) => {
    if (p === c.id) E(`章节 ${c.id} 的前置包含自身`);
    if (!CH_IDS.has(p)) W(`章节 ${c.id} 的前置 ${p} 尚未建（P1 补齐）`);
  });
  (c.methods || []).forEach((m) => {
    if (!M_IDS.has(m)) E(`章节 ${c.id} 引用的方法卡 ${m} 不存在`);
  });
});

/* ---------------- ② 方法卡 ---------------- */
METHODS.forEach((m) => {
  if (!M_IDS.has(m.id)) return;
  if (!CH_IDS.has(m.chapter)) E(`方法卡 ${m.id} 的 chapter ${m.chapter} 不存在`);
  if (!m.signal || m.signal.length < 10) E(`方法卡 ${m.id} 缺识别信号`);
  if (!(m.steps || []).length) E(`方法卡 ${m.id} 缺步骤骨架`);
  if ((m.pitfalls || []).length < 2) W(`方法卡 ${m.id} 的常见误用少于 2 条`);
  if (!TIERS.has(m.tier)) E(`方法卡 ${m.id} 的 tier ${m.tier} 非法`);

  const vs = m.variantIds || [];
  if (vs.length !== 3) E(`方法卡 ${m.id} 应有 3 个变式，实际 ${vs.length}`);
  const kinds = vs.map((id) => {
    const q = QUESTIONS.find((x) => x.id === id);
    return q ? q.changed : null;
  }).filter(Boolean);
  ['number', 'condition', 'reverse'].forEach((k) => {
    if (!kinds.includes(k)) E(`方法卡 ${m.id} 缺少 ${k} 类变式`);
  });
  vs.forEach((id) => { if (!Q_IDS.has(id)) E(`方法卡 ${m.id} 的变式 ${id} 不存在`); });
  if (m.motherId && !Q_IDS.has(m.motherId)) E(`方法卡 ${m.id} 的母题 ${m.motherId} 不存在`);
});

/* ---------------- ③ 题目 ---------------- */
const math = createMathRenderer();
QUESTIONS.forEach((q) => {
  if (!q.id) return E(`题目缺 id：${JSON.stringify(q).slice(0, 60)}`);
  if (!CH_IDS.has(q.chapter)) E(`题目 ${q.id} 的 chapter ${q.chapter} 不存在`);
  /* 送分区章节题按章节组织，不归属任何方法卡（method 为 null），这是合法形态。
     只有标了 method 的题才校验它存在。 */
  if (q.method != null && !M_IDS.has(q.method)) E(`题目 ${q.id} 的 method ${q.method} 不存在`);
  if (!q.stem || q.stem.length < 4) E(`题目 ${q.id} 缺题干`);
  if (!TIERS.has(q.tier)) E(`题目 ${q.id} 的 tier ${q.tier} 非法`);
  if (!(q.errorTags || []).length) E(`题目 ${q.id} 缺 errorTags`);
  (q.errorTags || []).forEach((t) => { if (!ERRS.has(t)) E(`题目 ${q.id} 的错因 ${t} 非法`); });

  const steps = q.steps || [];
  /* 送分区选填题天然只有 1 步（直接给答案），这是卷面真实形态；
     解答题（kind: solve）才要求 ≥2 步的骨架。 */
  const minSteps = q.kind === 'solve' ? 2 : 1;
  if (steps.length < minSteps) {
    E(`题目 ${q.id} 的步骤少于 ${minSteps} 步（实际 ${steps.length}）`);
  }
  steps.forEach((s, i) => {
    const at = `题目 ${q.id} 第 ${i + 1} 步`;
    if (!s.ask) E(`${at} 缺 ask`);
    if (!STEP_TYPES.has(s.type)) E(`${at} 的 type ${s.type} 非法`);
    if (s.score == null) E(`${at} 缺 score`);
    if (s.type === 'choice' || s.type === 'expr') {
      if (!(s.options || []).length) E(`${at} 缺 options`);
      if (s.key == null || s.key < 0 || s.key >= (s.options || []).length) E(`${at} 的 key ${s.key} 越界`);
      if (new Set(s.options || []).size !== (s.options || []).length) E(`${at} 的选项有重复`);
    }
    if (s.type === 'fill') {
      const acc = s.accept || (s.answer != null ? [s.answer] : []);
      if (!acc.length) E(`${at} 缺 accept/answer`);
    }
    if (s.type === 'judge' && typeof s.key !== 'boolean') E(`${at} 的 judge key 必须是布尔`);
  });

  // 变式必须指向存在的母题
  if (q.variantOf) {
    if (!Q_IDS.has(q.variantOf)) E(`题目 ${q.id} 的 variantOf ${q.variantOf} 不存在`);
    const parent = QUESTIONS.find((x) => x.id === q.variantOf);
    if (parent && parent.method !== q.method) E(`变式 ${q.id} 与母题的 method 不一致`);
  }

  // 公式渲染
  const fields = [['stem', q.stem], ['solution', q.solution || '']];
  steps.forEach((s, i) => fields.push([`steps[${i}].ask`, s.ask || '']));
  fields.forEach(([k, v]) => {
    if (typeof v === 'string' && v.includes('$')) math.render(v);
  });

  // 图形
  if (q.fig) {
    const vb = q.fig.viewBox || [0, 0, 240, 180];
    const [vx, vy, vw, vh] = vb;
    (q.fig.elems || []).forEach((e, i) => {
      if (!PRIMS.has(e.t)) E(`题目 ${q.id} 的图形第 ${i} 个原语 ${e.t} 未知`);
      const coords = [];
      if (e.at) coords.push(e.at);
      if (e.a) coords.push(e.a);
      if (e.b) coords.push(e.b);
      if (e.c) coords.push(e.c);
      if (e.pts) coords.push(...e.pts);
      coords.forEach(([x, y]) => {
        if (x < vx - 1 || x > vx + vw + 1 || y < vy - 1 || y > vy + vh + 1) {
          W(`题目 ${q.id} 的图形第 ${i} 个元素坐标 (${x},${y}) 超出 viewBox`);
        }
      });
    });
    const fr = createFigureRenderer({ math });
    fr.render(q.fig);
    fr.failures().forEach((f) => E(`题目 ${q.id} 的图形渲染失败：${f.type} ${f.err}`));
  }
});

math.failures().forEach((f) => E(`公式渲染失败：${f.tex} → ${f.err}`));

/* ---------------- ③b 概念卡 ---------------- */
const C_IDS = new Set();
CONCEPTS.forEach((c) => {
  if (!c.id) return E(`概念卡缺 id`);
  if (C_IDS.has(c.id)) E(`概念卡 id 重复：${c.id}`);
  C_IDS.add(c.id);
  if (!CH_IDS.has(c.chapter)) E(`概念卡 ${c.id} 的 chapter ${c.chapter} 不存在`);
  if (!c.claim) E(`概念卡 ${c.id} 缺 claim`);
  const tests = c.tests || [];
  if (tests.length < 2) E(`概念卡 ${c.id} 的 tests 少于 2 个（实际 ${tests.length}）`);
  tests.forEach((t, i) => {
    if (!t.q) E(`概念卡 ${c.id} 第 ${i + 1} 个判断缺 q`);
    if (typeof t.a !== 'boolean') E(`概念卡 ${c.id} 第 ${i + 1} 个判断的 a 必须是布尔`);
    if (!t.why) E(`概念卡 ${c.id} 第 ${i + 1} 个判断缺 why`);
  });
  if ((c.must || []).length === 0) W(`概念卡 ${c.id} 缺 must（必备条件）`);
});

/* ---------------- ③c 每章覆盖 ---------------- */
const qByCh = new Map(), cByCh = new Map();
QUESTIONS.forEach((q) => qByCh.set(q.chapter, (qByCh.get(q.chapter) || 0) + 1));
CONCEPTS.forEach((c) => cByCh.set(c.chapter, (cByCh.get(c.chapter) || 0) + 1));
CHAPTERS.forEach((c) => {
  const qn = qByCh.get(c.id) || 0;
  const cn = cByCh.get(c.id) || 0;
  if (qn < 2) W(`章节 ${c.id} 题量偏少：${qn}`);
  if (cn < 2) W(`章节 ${c.id} 概念卡偏少：${cn}`);
});

/* ---------------- ③d 渲染字段覆盖 ----------------
   构建期把含公式的字段渲染成 *Html，运行时引擎必须用 *Html 而不是原文。
   两类错误都会让页面显示 "$...$" 原文：
     (a) 有公式但没生成 *Html    → 数据层漏了
     (b) 生成了 *Html 但引擎没用 → 引擎漏了（截图发现的正是这类）

   注意：必须读**构建产物** dist/data/ch/*.js，src/ 里是未渲染的原始数据。 */
const CH_DIR = join(ROOT, 'dist/data/ch');
if (existsSync(CH_DIR)) {
  readdirSync(CH_DIR).filter((f) => f.endsWith('.js')).forEach((f) => {
    const raw = readFileSync(join(CH_DIR, f), 'utf8');
    const m = raw.match(/=(\{.*\});\s*$/s);
    if (!m) return E(`分片 ${f} 无法解析`);
    /* 分片是 JS 对象字面量（key 无引号），不是纯 JSON。
       用 new Function 在隔离作用域里求值——文件是我们自己构建产出的，
       不是外部输入，风险可控。 */
    let data;
    try {
      data = new Function('return (' + m[1] + ');')();
    } catch (e) {
      return E(`分片 ${f} 解析失败：${e.message}`);
    }
    const hasMath = (v) => typeof v === 'string' && v.includes('$');
    (data.questions || []).forEach((q) => {
      if (hasMath(q.stem) && !q.stemHtml) E(`${q.id}.stem 含公式但没有 stemHtml`);
      if (hasMath(q.solution) && !q.solutionHtml) E(`${q.id}.solution 含公式但没有 solutionHtml`);
      if (Array.isArray(q.options)) {
        q.options.forEach((o, i) => {
          if (hasMath(o) && !(q.optionsHtml && q.optionsHtml[i] != null)) E(`${q.id}.options[${i}] 含公式但没有 optionsHtml`);
        });
      }
      (q.steps || []).forEach((s, i) => {
        ['ask', 'hint', 'why', 'answer', 'label'].forEach((k) => {
          if (hasMath(s[k]) && !s[k + 'Html']) E(`${q.id}.steps[${i}].${k} 含公式但没有 ${k}Html`);
        });
        if (Array.isArray(s.options)) {
          s.options.forEach((o, j) => {
            if (hasMath(o) && !(s.optionsHtml && s.optionsHtml[j] != null)) E(`${q.id}.steps[${i}].options[${j}] 含公式但没有 optionsHtml`);
          });
        }
        if (Array.isArray(s.hints)) {
          s.hints.forEach((h, j) => {
            if (hasMath(h) && !(s.hintsHtml && s.hintsHtml[j] != null)) E(`${q.id}.steps[${i}].hints[${j}] 含公式但没有 hintsHtml`);
          });
        }
      });
    });
    (data.concepts || []).forEach((c) => {
      if (hasMath(c.claim) && !c.claimHtml) E(`${c.id}.claim 含公式但没有 claimHtml`);
      (c.must || []).forEach((mm, i) => {
        if (hasMath(mm) && !(c.mustHtml && c.mustHtml[i] != null)) E(`${c.id}.must[${i}] 含公式但没有 mustHtml`);
      });
      (c.tests || []).forEach((t, i) => {
        if (hasMath(t.q) && !t.qHtml) E(`${c.id}.tests[${i}].q 含公式但没有 qHtml`);
        if (hasMath(t.why) && !t.whyHtml) E(`${c.id}.tests[${i}].why 含公式但没有 whyHtml`);
      });
    });
  });
}

/* 引擎源码检查：每个 *Html 字段都必须被引擎引用，否则等于白渲染 */
const ENGINE_PATH = join(ROOT, 'assets/step-engine.js');
if (existsSync(ENGINE_PATH)) {
  const eng = readFileSync(ENGINE_PATH, 'utf8');
  [
    ['stemHtml', '题干'],
    ['solutionHtml', '完整解答'],
    ['askHtml', '步骤提问'],
    ['whyHtml', '解析'],
    ['hintHtml', '提示'],
    ['answerHtml', '参考答案'],
    ['labelHtml', '步骤标签'],
    ['optionsHtml', '选项'],
    ['hintsHtml', '分层提示'],
  ].forEach(([field, label]) => {
    const key = field.replace(/Html$/, '');
    /* 引擎有两种用法：
       (a) 直接取 s.whyHtml
       (b) 通过 fieldHtml(s, 'why') 动态拼字段名
       两种都算用到了。 */
    const direct = eng.includes(field);
    const dynamic = eng.includes(`fieldHtml(`) && eng.includes(`'${key}'`);
    if (!direct && !dynamic) {
      E(`step-engine.js 未使用 ${field}（${label}）——构建期渲染了但引擎没用，会显示公式原文`);
    }
  });
}

/* ---------------- ④ 产物与链接 ---------------- */
const PAGES = ['index.html', 'concept.html', 'drill.html', 'method.html', 'map.html',
  'graph.html', 'wrong.html', 'diag.html', 'content.html', 'dist/data/meta.js',
  'assets/style.css', 'assets/app.js', 'assets/step-engine.js'];
CHAPTERS.forEach((c) => PAGES.push(`dist/data/ch/${c.id}.js`));
PAGES.forEach((p) => { if (!existsSync(join(ROOT, p))) E(`产物缺失：${p}（先跑 node build-site.mjs）`); });

METHODS.forEach((m) => {
  const p = `method/${m.id}.html`;
  if (!existsSync(join(ROOT, p))) E(`产物缺失：${p}`);
});
CHAPTERS.forEach((c) => {
  const p = `map/${c.id}.html`;
  if (!existsSync(join(ROOT, p))) E(`产物缺失：${p}`);
});

// 内部链接可解析
/* href 是相对**页面所在目录**解析的：map/ch-x.html 里的 ../index.html
   指向 ROOT/index.html。所以基准必须是 dirname(file)。 */
function checkLinks(file) {
  if (!existsSync(join(ROOT, file))) return;
  const html = readFileSync(join(ROOT, file), 'utf8');
  const pageDir = dirname(join(ROOT, file));
  const re = /href="([^"#?][^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1];
    if (/^(https?:|mailto:|data:|javascript:|\/\/)/.test(href)) continue;
    /* 跳过脚本里动态拼接的 href（如 'map/' + id + '.html'），
       这些不是静态链接，运行时才成形。 */
    if (href.includes("' +") || href.includes('" +') || href.includes('${')) continue;
    href = href.split('#')[0].split('?')[0];
    if (!href) continue;
    const target = resolve(pageDir, href);
    if (!existsSync(target)) E(`${file} 的死链：${m[1]}`);
  }
}
const allHtml = [];
function walk(dir) {
  readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    if (d.name.startsWith('.') || d.name === 'node_modules' || d.name === 'reference') return;
    const full = join(dir, d.name);
    if (d.isDirectory()) walk(full);
    else if (d.name.endsWith('.html')) allHtml.push(full.replace(ROOT + '/', ''));
  });
}
walk(ROOT);
allHtml.forEach(checkLinks);

/* ---------------- ⑤ 报告 ---------------- */
const sum = {
  章节: CHAPTERS.length,
  方法卡: METHODS.length,
  题目: QUESTIONS.length,
  概念卡: CONCEPTS.length,
  概念判断: CONCEPTS.reduce((a, c) => a + (c.tests || []).length, 0),
  母题: QUESTIONS.filter((q) => !q.variantOf).length,
  变式: QUESTIONS.filter((q) => q.variantOf).length,
  步骤总数: QUESTIONS.reduce((a, q) => a + (q.steps || []).length, 0),
  HTML页面: allHtml.length,
};

console.log('\n内容校验 · ' + new Date().toISOString().slice(0, 19).replace('T', ' '));
console.log('─'.repeat(56));
Object.entries(sum).forEach(([k, v]) => console.log(`${k.padEnd(10)}${v}`));
console.log('─'.repeat(56));

if (warns.length) {
  console.log(`\n⚠ 警告 ${warns.length} 条：`);
  warns.slice(0, 12).forEach((w) => console.log('  ' + w));
  if (warns.length > 12) console.log(`  …还有 ${warns.length - 12} 条`);
}

if (errors.length) {
  console.log(`\n✗ 错误 ${errors.length} 条：`);
  errors.slice(0, 25).forEach((e) => console.log('  ' + e));
  if (errors.length > 25) console.log(`  …还有 ${errors.length - 25} 条`);
  console.log('');
  process.exit(1);
}

console.log('\n✓ 全部校验通过\n');
