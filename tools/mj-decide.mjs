import { createMathRenderer } from './math-render.mjs';
const mr = createMathRenderer();

// 20 条代表性公式：覆盖分式嵌套、根式、上下标、方程组、区间、向量、角度、不等号、三角、集合
const cases = [
  String.raw`\frac{1}{2}`,
  String.raw`\dfrac{a+b}{a-b}`,
  String.raw`\frac{\frac{1}{x}+1}{x-1}`,
  String.raw`\sqrt{2}`,
  String.raw`\sqrt[3]{-8}`,
  String.raw`\sqrt{x^2+y^2}`,
  String.raw`a^{n+1}\cdot a^{n-1}`,
  String.raw`x_1+x_2=-\frac{b}{a}`,
  String.raw`\begin{cases}2x+y=5\\x-3y=-1\end{cases}`,
  String.raw`x\in[-1,3)`,
  String.raw`\vec{AB}+\vec{BC}=\vec{AC}`,
  String.raw`\angle ABC=90^\circ`,
  String.raw`\triangle ABC\sim\triangle DEF`,
  String.raw`a\ne 0,\ b^2-4ac\ge 0`,
  String.raw`y=a(x-h)^2+k`,
  String.raw`\sin^2\alpha+\cos^2\alpha=1`,
  String.raw`S=\pi r^2`,
  String.raw`\varnothing\subseteq A\subseteq\mathbb{R}`,
  String.raw`\left|a-b\right|\le \left|a\right|+\left|b\right|`,
  String.raw`\overline{AB}\parallel\overline{CD}`,
];

const t0 = Date.now();
let total = 0;
const rows = [];
for (const c of cases) {
  const html = mr.render('$' + c + '$');
  const bytes = Buffer.byteLength(html, 'utf8');
  total += bytes;
  rows.push({ tex: c, bytes, ok: !html.includes('math-err') });
}
const defs = mr.defs();
const stats = mr.stats();
const ms = Date.now() - t0;

console.log('公式条数        ', cases.length);
console.log('去重后不同公式  ', stats.distinct);
console.log('单条平均        ', Math.round(total / cases.length), 'B');
console.log('单条最大        ', Math.max(...rows.map(r => r.bytes)), 'B');
console.log('共享 defs       ', Buffer.byteLength(defs, 'utf8'), 'B');
console.log('30 条公式页面估算', Math.round(total / cases.length * 30 + Buffer.byteLength(defs, 'utf8')), 'B');
console.log('渲染耗时        ', ms, 'ms');
console.log('失败            ', mr.failures().length);
const bad = rows.filter(r => !r.ok);
if (bad.length) console.log('失败项：', bad);
console.log('\n逐条：');
for (const r of rows) console.log('  ', String(r.bytes).padStart(5), 'B', r.tex);
process.exit(mr.failures().length ? 1 : 0);
