import { createMathRenderer } from './math-render.mjs';
import { createFigureRenderer } from './fig-render.mjs';

const math = createMathRenderer();
const fr = createFigureRenderer({ math });

// 图 1：直角三角形带直角标记
const fig1 = {
  viewBox: [0, 0, 220, 170], alt: '直角三角形',
  elems: [
    { t:'poly', pts:[[30,140],[170,140],[30,40]], closed:true },
    { t:'right', at:[30,140], from:'right', to:'up' },
    { t:'pt', at:[30,140], label:'B', pos:'bl' },
    { t:'pt', at:[170,140], label:'C', pos:'br' },
    { t:'pt', at:[30,40], label:'A', pos:'tl' },
    { t:'angle', at:[170,140], from:'left', to:'ul', r:26, label:'$\\theta$' },
  ],
};

// 图 2：圆与切线
const fig2 = {
  viewBox: [0, 0, 220, 180], alt: '圆与切线',
  elems: [
    { t:'circle', c:[110,90], r:60 },
    { t:'seg', a:[110,90], b:[170,90] },
    { t:'seg', a:[170,90], b:[170,20] },
    { t:'right', at:[170,90], from:'left', to:'up' },
    { t:'pt', at:[110,90], label:'O', pos:'bl' },
    { t:'pt', at:[170,90], label:'A', pos:'br' },
    { t:'pt', at:[170,20], label:'P', pos:'tr' },
    { t:'label', at:[140,68], text:'$r$' },
  ],
};

// 图 3：抛物线与区间阴影
const fig3 = {
  viewBox: [0, 0, 240, 180], alt: '二次函数区间',
  elems: [
    { t:'seg', a:[20,150], b:[220,150] },
    { t:'seg', a:[120,170], b:[120,20] },
    // 抛物线 y=x² 型：SVG y 向下，开口向上（∪）要顶点取最大 y
    { t:'curve', fn:(x)=>{ const t=(x-120)/22; return 130 - t*t*50; }, domain:[76,164] },
    { t:'region', pts:[[92,150],[148,150],[148,60],[92,60]], opacity:.18 },
    { t:'seg', a:[92,150], b:[92,60], dash:true },
    { t:'seg', a:[148,150], b:[148,60], dash:true },
    { t:'label', at:[92,166], text:'$m$' },
    { t:'label', at:[148,166], text:'$n$' },
    { t:'label', at:[205,160], text:'$x$' },
  ],
};

// 图 4：三角形中线与中点
const fig4 = {
  viewBox: [0, 0, 220, 170], alt: '中点',
  elems: [
    { t:'poly', pts:[[30,140],[190,140],[110,30]], closed:true },
    { t:'seg', a:[110,30], b:[110,140], dash:true },
    { t:'pt', at:[110,30], label:'A', pos:'tr' },
    { t:'pt', at:[30,140], label:'B', pos:'bl' },
    { t:'pt', at:[190,140], label:'C', pos:'br' },
    { t:'pt', at:[110,140], label:'D', pos:'br' },
    { t:'ticks', a:[30,140], b:[110,140], n:2, size:5 },
    { t:'ticks', a:[110,140], b:[190,140], n:2, size:5 },
  ],
};

// 图 5：三帧动点对比（三个小 viewBox 并排）
const fig5a = { viewBox:[0,0,120,120], elems:[
  { t:'poly', pts:[[20,100],[100,100],[20,30]], closed:true },
  { t:'pt', at:[20,100], label:'B', pos:'bl' },
  { t:'pt', at:[100,100], label:'C', pos:'br' },
  { t:'pt', at:[20,30], label:'A', pos:'tl' },
  { t:'pt', at:[60,65], label:'P', pos:'tr', fill:'var(--rose)' },
  { t:'label', at:[60,112], text:'初始' },
]};
const fig5b = { viewBox:[0,0,120,120], elems:[
  { t:'poly', pts:[[20,100],[100,100],[20,30]], closed:true },
  { t:'pt', at:[20,100], label:'B', pos:'bl' },
  { t:'pt', at:[100,100], label:'C', pos:'br' },
  { t:'pt', at:[20,30], label:'A', pos:'tl' },
  { t:'pt', at:[60,65], label:'P', pos:'tr', fill:'var(--rose)' },
  { t:'seg', a:[20,100], b:[60,65], dash:true },
  { t:'label', at:[60,112], text:'中点' },
]};

const figs = { fig1, fig2, fig3, fig4, fig5a, fig5b };
const out = {};
let total = 0;
for (const [k, f] of Object.entries(figs)) {
  const s = fr.render(f);
  out[k] = s;
  total += Buffer.byteLength(s, 'utf8');
  console.log(k.padEnd(6), String(Buffer.byteLength(s,'utf8')).padStart(6), 'B');
}
console.log('failures:', fr.failures());
console.log('avg bytes:', Math.round(total/Object.keys(figs).length));

import { writeFileSync } from 'node:fs';
writeFileSync('tools/fig-preview.html',
`<!doctype html><meta charset="utf-8"><title>fig preview</title>
<style>
body{background:#f6f8fc;font-family:system-ui;padding:24px;color:#0f172a}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px}
.cell{background:#fff;border:1px solid rgba(15,23,42,.1);border-radius:14px;padding:12px}
.cell h4{margin:0 0 8px;font-size:12px;color:#64748b}
.cell > svg{width:100%;height:auto;display:block;color:#0f172a}
.math-defs{position:absolute;width:0;height:0;overflow:hidden}
</style>
${math.defs()}
<div class="grid">
${Object.entries(out).map(([k,s])=>`<div class="cell"><h4>${k}</h4>${s}</div>`).join('')}
</div>`);
console.log('wrote tools/fig-preview.html');
