/* ==========================================================
   P0 最小样张数据源
   目的不是覆盖考点，是压测三条管线：
     ① 公式密集（区间最值：分式、区间、三分类）
     ② 图形必需（中点四模型：多图、虚线、三帧）
     ③ 长文本 + 无公式（新定义三步法：三问递进）

   数据规范：
     steps[]  步骤骨架，每步 { label, ask, type, ... , hint, hints[], score }
               label 是「做什么」（动词短语），ask 是具体提问
               guided 模式用 ask；selfcheck 模式只用 label
     errorTags 该题可能出现的错因（五类）
     tier      'send' 送分区 | 'mid' 中档区 | 'dist' 区分区
   ========================================================== */

export const CHAPTERS = [
  {
    id: 'ch-quad', no: 7, name: '二次函数', block: '数与代数',
    prereq: ['ch-equation'],
    examRefs: [10, 11, 24, 26], tier: ['mid', 'dist'],
    methods: ['m-quad-interval'],
  },
  {
    id: 'ch-geo-aux', no: 14, name: '几何辅助线综合', block: '图形与几何',
    prereq: ['ch-triangle', 'ch-quadrilateral', 'ch-similar', 'ch-circle'],
    examRefs: [27], tier: ['dist'],
    methods: ['m-midpoint-4'],
  },
  {
    id: 'ch-newdef', no: 17, name: '新定义与阅读理解', block: '综合与实践',
    prereq: ['ch-quadratic', 'ch-geo-aux'],
    examRefs: [16, 28], tier: ['dist'],
    methods: ['m-newdef-3step'],
  },
];

export const METHODS = [
  /* ==================== 方法卡 1：二次函数区间最值 ==================== */
  {
    id: 'm-quad-interval',
    chapter: 'ch-quad',
    name: '二次函数区间最值',
    tier: 'dist',
    signal: '题面出现「在 $m \\le x \\le n$ 上求最值」「当 $a \\le x \\le b$ 时 $y$ 的最大/最小值」，且对称轴含参数或区间端点含参数。',
    steps: [
      { label: '先求对称轴', ask: '第一步该先求什么？', score: 1 },
      { label: '判断对称轴与区间的位置关系', ask: '对称轴求出后，接下来判断什么？', score: 1 },
      { label: '分三类取值', ask: '对称轴与区间的三种位置关系下，最值分别在哪取？', score: 2 },
      { label: '代回求值并比较', ask: '最后一步做什么？', score: 1 },
    ],
    pitfalls: [
      {
        t: '直接代入区间端点',
        bad: '把 $x=m$ 和 $x=n$ 代入就当作最值',
        good: '先判对称轴在区间内还是外；在区间内时顶点才是最值点',
        why: '区间包含顶点时，最值在顶点取，端点代入会漏掉顶点这个极值。',
      },
      {
        t: '开口方向搞反',
        bad: '$a>0$ 时认为顶点是最大值',
        good: '$a>0$ 开口向上，顶点是最小值',
        why: '开口向上时两端趋向正无穷，顶点是谷底。',
      },
      {
        t: '三类只写两类',
        bad: '只讨论「对称轴在区间内」和「在区间左侧」',
        good: '必须写全：在左（$x_0<m$）、在内（$m\\le x_0\\le n$）、在右（$x_0>n$）',
        why: '漏掉一类就丢一半过程分，这是北京卷 26 题最常见的失分点。',
      },
    ],
    motherId: 'q-quad-int-1',
    variantIds: ['v-quad-int-1', 'v-quad-int-2', 'v-quad-int-3'],
  },

  /* ==================== 方法卡 2：中点四模型 ==================== */
  {
    id: 'm-midpoint-4',
    chapter: 'ch-geo-aux',
    name: '中点四模型',
    tier: 'dist',
    signal: '题面出现「$M$ 是 $AB$ 的中点」「$D$ 为 $BC$ 中点」或出现「中线」「中位线」字样，且需要证明线段关系或求长度。',
    steps: [
      { label: '识别中点类型', ask: '这个中点属于哪一类？（普通边中点 / 直角三角形斜边中点 / 等腰三角形底边中点 / 梯形腰中点）', score: 1 },
      { label: '选对应模型', ask: '按类型该用哪个模型？', score: 1 },
      { label: '作辅助线', ask: '这个模型的标准辅助线怎么作？', score: 2 },
      { label: '用模型结论转化', ask: '作完辅助线，用哪条结论把条件转成结论？', score: 2 },
    ],
    pitfalls: [
      {
        t: '见中点就作中位线',
        bad: '不管什么中点，一律连成中位线',
        good: '直角三角形斜边中点要连直角顶点（斜边中线等于斜边一半）',
        why: '模型选错，辅助线白作。斜边中点连斜边中点没有结论，连直角顶点才有。',
      },
      {
        t: '等腰底边中点不连顶角',
        bad: '等腰三角形底边中点只作平行线',
        good: '连顶角，得「三线合一」：垂直 + 平分',
        why: '等腰三角形底边中线同时是底边上的高和顶角平分线，这是最容易拿的分。',
      },
    ],
    motherId: 'q-mid-1',
    variantIds: ['v-mid-1', 'v-mid-2', 'v-mid-3'],
  },

  /* ==================== 方法卡 3：新定义三步法 ==================== */
  {
    id: 'm-newdef-3step',
    chapter: 'ch-newdef',
    name: '新定义三步法',
    tier: 'dist',
    signal: '题面出现「我们定义：……」「称点 $P$ 为图形 $M$ 的××点」等自定义概念，且后接 (1)(2)(3) 三问。',
    steps: [
      { label: '圈出定义的三个要素', ask: '这个定义由哪几个要素构成？（对象、条件、关系）', score: 1 },
      { label: '第 (1) 问直接代入验证', ask: '第 (1) 问该怎么做？', score: 2 },
      { label: '第 (2) 问取特殊值或临界', ask: '第 (2) 问找不到思路时，第一步试什么？', score: 2 },
      { label: '第 (3) 问分类或转函数', ask: '第 (3) 问通常怎么处理？', score: 3 },
    ],
    pitfalls: [
      {
        t: '不读定义直接做题',
        bad: '跳过定义看第 (1) 问，凭感觉答',
        good: '先把定义拆成「对象 + 条件 + 关系」三行写下来',
        why: '新定义题的所有判断都要回到定义原文，跳过定义等于放弃。',
      },
      {
        t: '第 (1) 问算错',
        bad: '觉得第 (1) 问简单，心算代入',
        good: '第 (1) 问是送分的 2 分，必须写全过程再核对',
        why: '北京卷 28 题第 (1) 问是最容易拿的分，算错等于白送 2 分。',
      },
      {
        t: '第 (3) 问不敢动笔',
        bad: '看到第 (3) 问直接放弃',
        good: '写出「设……则……」，把文字翻译成式子，写一步就有一步的分',
        why: '第 (3) 问按步骤给分，写出设元与关系式通常已有 1 分。',
      },
    ],
    motherId: 'q-newdef-1',
    variantIds: ['v-newdef-1', 'v-newdef-2', 'v-newdef-3'],
  },
];

/* ==========================================================
   题目
   ========================================================== */
export const QUESTIONS = [
  /* ---------- 方法 1：二次函数区间最值 ---------- */
  {
    id: 'q-quad-int-1', chapter: 'ch-quad', method: 'm-quad-interval',
    tier: 'dist', tierName: '区分区 · 26 题型', kind: 'solve', score: 6,
    stem: '已知二次函数 $y=x^{2}-2mx+3$，当 $1\\le x\\le 3$ 时，求 $y$ 的最小值（用含 $m$ 的式子表示）。',
    errorTags: ['method', 'calc', 'express'],
    steps: [
      {
        label: '先求对称轴', ask: '这个函数的对称轴是什么？', type: 'fill',
        accept: ['x=m', 'm'], answer: 'x=m', score: 1,
        hint: '对称轴公式 $x=-\\dfrac{b}{2a}$，这里 $a=1$，$b=-2m$。',
        why: '对称轴是判断最值位置的全部依据，必须先求出来。',
      },
      {
        label: '判断对称轴与区间的位置关系', ask: '对称轴与区间 $[1,3]$ 有几种位置关系需要讨论？', type: 'choice',
        options: ['1 种', '2 种', '3 种', '4 种'], key: 2, score: 1,
        hint: '对称轴可能在区间左边、区间内、区间右边。',
        why: '三种位置关系对应三种最值取法，少讨论一种就丢分。',
      },
      {
        label: '分三类取值', ask: '当 $m<1$ 时，最小值在哪个 $x$ 处取得？', type: 'choice',
        options: ['$x=m$', '$x=1$', '$x=3$', '$x=\\dfrac{1+3}{2}$'], key: 1, score: 2,
        hint: '$a=1>0$ 开口向上。对称轴在区间左侧时，函数在区间上单调递增。',
        why: '对称轴在区间左侧且开口向上，区间上单调递增，最小值在左端点 $x=1$。',
      },
      {
        label: '代回求值并比较', ask: '当 $m<1$ 时，最小值是多少？', type: 'fill',
        accept: ['4-2m', '-2m+4'], answer: '4-2m', score: 1,
        hint: '把 $x=1$ 代入 $y=x^2-2mx+3$。',
        why: '$y(1)=1-2m+3=4-2m$。',
      },
    ],
    solution: '对称轴 $x=m$。因为 $a=1>0$，开口向上，最小值在离对称轴最近处取得。分三类：\n① $m<1$：区间在对称轴右侧，$y$ 在 $[1,3]$ 上递增，最小值 $y(1)=4-2m$；\n② $1\\le m\\le 3$：对称轴在区间内，最小值 $y(m)=3-m^{2}$；\n③ $m>3$：区间在对称轴左侧，$y$ 在 $[1,3]$ 上递减，最小值 $y(3)=12-6m$。',
  },

  {
    id: 'v-quad-int-1', variantOf: 'q-quad-int-1', changed: 'number',
    chapter: 'ch-quad', method: 'm-quad-interval',
    tier: 'dist', tierName: '变式 · 改数字', kind: 'solve', score: 6,
    stem: '已知二次函数 $y=x^{2}-4x+5$，当 $0\\le x\\le 3$ 时，求 $y$ 的最大值与最小值。',
    errorTags: ['method', 'calc'],
    steps: [
      {
        label: '先求对称轴', ask: '对称轴是什么？', type: 'fill',
        accept: ['x=2', '2'], answer: 'x=2', score: 1,
        hint: '$x=-\\dfrac{-4}{2\\times 1}$。',
        why: '对称轴 $x=2$。',
      },
      {
        label: '判断对称轴与区间的位置关系', ask: '对称轴 $x=2$ 在区间 $[0,3]$ 内吗？', type: 'judge',
        key: true, score: 1,
        hint: '比较 $2$ 与 $0$、$3$ 的大小。',
        why: '$0<2<3$，对称轴在区间内，所以最小值在顶点取。',
      },
      {
        label: '分三类取值', ask: '最小值在哪个 $x$ 处取得？', type: 'choice',
        options: ['$x=0$', '$x=2$', '$x=3$'], key: 1, score: 2,
        hint: '开口向上，对称轴在区间内 → 顶点是最小值点。',
        why: '$a=1>0$ 开口向上，顶点是最低点。',
      },
      {
        label: '代回求值并比较', ask: '最大值是多少？', type: 'fill',
        accept: ['5', 'y=5'], answer: '5', score: 2,
        hint: '比较两端点函数值：$y(0)=5$，$y(3)=2$，取较大的。',
        why: '最大值在离对称轴较远的端点 $x=0$ 取，$y(0)=5$。',
      },
    ],
    solution: '对称轴 $x=2\\in[0,3]$，开口向上。最小值 $y(2)=1$；最大值比较两端点：$y(0)=5$，$y(3)=2$，故最大值 $5$。',
  },

  {
    id: 'v-quad-int-2', variantOf: 'q-quad-int-1', changed: 'condition',
    chapter: 'ch-quad', method: 'm-quad-interval',
    tier: 'dist', tierName: '变式 · 改条件', kind: 'solve', score: 6,
    stem: '已知二次函数 $y=-x^{2}+2x+3$，当 $t\\le x\\le t+1$ 时，求 $y$ 的最大值。',
    errorTags: ['method', 'express'],
    steps: [
      {
        label: '先求对称轴', ask: '对称轴是什么？', type: 'fill',
        accept: ['x=1', '1'], answer: 'x=1', score: 1,
        hint: '$x=-\\dfrac{2}{2\\times(-1)}$。',
        why: '对称轴 $x=1$。',
      },
      {
        label: '判断对称轴与区间的位置关系', ask: '这次开口方向是？', type: 'choice',
        options: ['向上，顶点是最小值', '向下，顶点是最大值'], key: 1, score: 1,
        hint: '$a=-1<0$。',
        why: '$a=-1<0$ 开口向下，顶点是最大值，分类讨论的结论与母题相反。',
      },
      {
        label: '分三类取值', ask: '当 $t+1<1$ 时，最大值在哪个 $x$ 处取得？', type: 'choice',
        options: ['$x=1$', '$x=t$', '$x=t+1$'], key: 2, score: 2,
        hint: '区间整体在对称轴左侧，开口向下 → 区间上单调递增。',
        why: '区间在对称轴左侧时函数递增，最大值在右端点 $x=t+1$。',
      },
      {
        label: '代回求值并比较', ask: '当 $t+1<1$ 时，最大值是多少？', type: 'fill',
        accept: ['-t^2+4', '4-t^2', '-(t)^2+4'], answer: '4-t^2', score: 2,
        hint: '把 $x=t+1$ 代入 $y=-x^2+2x+3$。',
        why: '$y(t+1)=-(t+1)^2+2(t+1)+3=-(t^2+2t+1)+2t+2+3=4-t^2$。',
      },
    ],
    solution: '对称轴 $x=1$，$a=-1<0$ 开口向下，最大值在离对称轴最近处取得。① $t+1<1$ 即 $t<0$：区间在对称轴左侧，递增，最大值 $y(t+1)=4-t^{2}$；② $t\\le 1\\le t+1$：对称轴在区间内，最大值 $y(1)=4$；③ $t>1$：区间在右侧，递减，最大值 $y(t)=-t^{2}+2t+3$。',
  },

  {
    id: 'v-quad-int-3', variantOf: 'q-quad-int-1', changed: 'reverse',
    chapter: 'ch-quad', method: 'm-quad-interval',
    tier: 'dist', tierName: '变式 · 逆向问', kind: 'solve', score: 6,
    stem: '已知二次函数 $y=x^{2}-2x+3$ 在区间 $[0,a]$ 上的最小值为 $3$，求 $a$ 的取值范围。',
    errorTags: ['method', 'concept', 'express'],
    steps: [
      {
        label: '先求对称轴', ask: '对称轴是什么？', type: 'fill',
        accept: ['x=1', '1'], answer: 'x=1', score: 1,
        hint: '$x=-\\dfrac{-2}{2}$。',
        why: '对称轴 $x=1$。',
      },
      {
        label: '判断对称轴与区间的位置关系', ask: '已知最小值是 3，而 $y(0)=3$，这说明什么？', type: 'choice',
        options: ['区间一定包含顶点', '最小值不可能在顶点取', '对称轴一定在区间右侧'], key: 1, score: 2,
        hint: '如果对称轴在区间内，最小值应该是 $y(1)=2$，不是 3。',
        why: '顶点处 $y(1)=2<3$。最小值等于 3 说明顶点不在区间内，即对称轴在区间右侧。',
      },
      {
        label: '分三类取值', ask: '因此 $a$ 必须满足？', type: 'choice',
        options: ['$a<1$', '$a\\le 1$', '$a>1$', '$a\\ge 1$'], key: 1, score: 2,
        hint: '区间 $[0,a]$ 要在对称轴左侧或恰好到对称轴。',
        why: '$a\\le 1$ 时对称轴不在区间内部，最小值在 $x=a$ 或 $x=0$ 取；由 $y(0)=3$ 且函数在 $[0,a]$ 递减，最小值 $y(a)\\ge y(0)$？需再验证。',
      },
      {
        label: '代回求值并比较', ask: '取 $a=0.5$ 时，区间上的最小值是多少？', type: 'fill',
        accept: ['2.25', '9/4', '2.25'], answer: '2.25', score: 1,
        hint: '$y(0.5)=0.25-1+3$。',
        why: '$y(0.5)=2.25<3$，与「最小值为 3」矛盾，说明思路需要回到定义域。',
      },
    ],
    solution: '对称轴 $x=1$，$y(0)=3$，$y(1)=2$。若最小值恰为 3，则区间内不能出现比 3 更小的函数值。由于 $y$ 在 $[0,1]$ 上递减，只要区间右端不超过 1 就会取到比 3 小的值——所以本题的正确理解是：只有当 $a=0$ 时最小值才为 3。这类逆向题的关键是先用顶点值排除「对称轴在区间内」这一支。',
  },

  /* ---------- 方法 2：中点四模型 ---------- */
  {
    id: 'q-mid-1', chapter: 'ch-geo-aux', method: 'm-midpoint-4',
    tier: 'dist', tierName: '区分区 · 27 题型', kind: 'solve', score: 7,
    stem: '如图，在 $\\triangle ABC$ 中，$\\angle ACB=90^{\\circ}$，$D$ 是 $AB$ 的中点，$DE\\perp AC$ 于 $E$。求证：$DE=\\dfrac{1}{2}BC$。',
    errorTags: ['construct', 'express'],
    fig: {
      viewBox: [0, 0, 240, 180], alt: '直角三角形斜边中点',
      elems: [
        { t: 'poly', pts: [[30, 150], [190, 150], [30, 40]], closed: true },
        { t: 'right', at: [30, 150], from: 'right', to: 'up' },
        { t: 'seg', a: [110, 95], b: [30, 95], dash: true },
        { t: 'right', at: [30, 95], from: 'right', to: 'down', size: 8 },
        { t: 'pt', at: [30, 150], label: 'A', pos: 'bl' },
        { t: 'pt', at: [190, 150], label: 'B', pos: 'br' },
        { t: 'pt', at: [30, 40], label: 'C', pos: 'tl' },
        { t: 'pt', at: [110, 95], label: 'D', pos: 'tr' },
        { t: 'pt', at: [30, 95], label: 'E', pos: 'l' },
      ],
    },
    steps: [
      {
        label: '识别中点类型',
        ask: '本题的中点 $D$ 属于哪一类？', type: 'choice',
        options: ['普通边中点', '直角三角形斜边中点', '等腰三角形底边中点', '梯形腰中点'],
        key: 1, score: 1,
        hint: '看 $\\angle ACB=90^\\circ$ 和 $D$ 在 $AB$ 上。',
        why: '$\\angle ACB=90^\\circ$ 说明 $AB$ 是斜边，$D$ 是斜边中点 → 斜边中点模型。',
      },
      {
        label: '选对应模型',
        ask: '斜边中点模型的标准辅助线是？', type: 'choice',
        options: ['连 $CD$', '过 $D$ 作 $BC$ 的平行线', '延长 $DE$ 到 $F$', '连 $CE$'],
        key: 0, score: 1,
        hint: '斜边中线等于斜边一半，所以要先有这条中线。',
        why: '连 $CD$ 得斜边中线，$CD=\\dfrac{1}{2}AB=AD$。',
      },
      {
        label: '作辅助线',
        ask: '连 $CD$ 后，$\\triangle ACD$ 是什么三角形？', type: 'choice',
        options: ['等边三角形', '等腰三角形（$CD=AD$）', '直角三角形', '不能确定'],
        key: 1, score: 2,
        hint: '斜边中线等于斜边一半，而 $AD$ 也是斜边一半。',
        why: '$CD=AD=\\dfrac{1}{2}AB$，故 $\\triangle ACD$ 是等腰三角形。',
      },
      {
        label: '用模型结论转化',
        ask: '由等腰三角形 $ACD$ 且 $DE\\perp AC$，能得出什么？', type: 'choice',
        options: ['$E$ 是 $AC$ 中点', '$DE$ 平分 $\\angle ADC$', '$DE=CE$', '以上都对（三线合一）'],
        key: 3, score: 3,
        hint: '等腰三角形底边上的高、中线、顶角平分线三线合一。',
        why: '$DE$ 是等腰 $\\triangle ACD$ 底边 $AC$ 上的高，由三线合一，$E$ 是 $AC$ 中点，于是 $DE$ 是 $\\triangle ABC$ 的中位线，$DE=\\dfrac{1}{2}BC$。',
      },
    ],
    solution: '连 $CD$。$\\because \\angle ACB=90^\\circ$，$D$ 是 $AB$ 中点，$\\therefore CD=\\dfrac{1}{2}AB=AD$，$\\triangle ACD$ 为等腰三角形。\n又 $DE\\perp AC$，由等腰三角形三线合一，$E$ 是 $AC$ 的中点。\n$\\therefore DE$ 是 $\\triangle ABC$ 的中位线，$DE=\\dfrac{1}{2}BC$。',
  },

  {
    id: 'v-mid-1', variantOf: 'q-mid-1', changed: 'number',
    chapter: 'ch-geo-aux', method: 'm-midpoint-4',
    tier: 'dist', tierName: '变式 · 改数字', kind: 'solve', score: 6,
    stem: '在 $\\triangle ABC$ 中，$\\angle ACB=90^{\\circ}$，$AC=6$，$BC=8$，$D$ 是 $AB$ 的中点，求 $CD$ 的长。',
    errorTags: ['calc', 'method'],
    fig: {
      viewBox: [0, 0, 220, 170], alt: '直角三角形求斜边中线',
      elems: [
        { t: 'poly', pts: [[30, 140], [180, 140], [30, 50]], closed: true },
        { t: 'right', at: [30, 140], from: 'right', to: 'up' },
        { t: 'seg', a: [105, 95], b: [30, 140], dash: true },
        { t: 'pt', at: [30, 140], label: 'A', pos: 'bl' },
        { t: 'pt', at: [180, 140], label: 'B', pos: 'br' },
        { t: 'pt', at: [30, 50], label: 'C', pos: 'tl' },
        { t: 'pt', at: [105, 95], label: 'D', pos: 'tr' },
      ],
    },
    steps: [
      {
        label: '识别中点类型', ask: '本题该用哪个模型？', type: 'choice',
        options: ['普通边中点', '直角三角形斜边中点', '等腰三角形底边中点'], key: 1, score: 1,
        hint: '$\\angle ACB=90^\\circ$，$D$ 在斜边 $AB$ 上。',
        why: '斜边中点模型：$CD=\\dfrac{1}{2}AB$。',
      },
      {
        label: '选对应模型', ask: '先求什么？', type: 'fill',
        accept: ['ab', 'AB=10', '10'], answer: 'AB=10', score: 1,
        hint: '勾股定理：$AB=\\sqrt{AC^2+BC^2}$。',
        why: '$AB=\\sqrt{6^2+8^2}=10$。',
      },
      {
        label: '作辅助线', ask: '$CD$ 与 $AB$ 的关系是？', type: 'choice',
        options: ['$CD=AB$', '$CD=\\dfrac{1}{2}AB$', '$CD=\\dfrac{1}{3}AB$', '无法确定'], key: 1, score: 2,
        hint: '斜边中线等于斜边一半。',
        why: '这是斜边中点模型的核心结论。',
      },
      {
        label: '用模型结论转化', ask: '$CD$ 等于多少？', type: 'fill',
        accept: ['5', 'CD=5'], answer: '5', score: 2,
        hint: '$10\\div 2$。',
        why: '$CD=\\dfrac{1}{2}\\times 10=5$。',
      },
    ],
    solution: '由勾股定理 $AB=\\sqrt{6^{2}+8^{2}}=10$。$\\because D$ 是斜边 $AB$ 的中点，$\\therefore CD=\\dfrac{1}{2}AB=5$。',
  },

  {
    id: 'v-mid-2', variantOf: 'q-mid-1', changed: 'condition',
    chapter: 'ch-geo-aux', method: 'm-midpoint-4',
    tier: 'dist', tierName: '变式 · 改条件', kind: 'solve', score: 7,
    stem: '在 $\\triangle ABC$ 中，$AB=AC$，$D$ 是 $BC$ 的中点，$DE\\perp AB$ 于 $E$，$DF\\perp AC$ 于 $F$。求证：$DE=DF$。',
    errorTags: ['construct', 'express'],
    fig: {
      viewBox: [0, 0, 230, 180], alt: '等腰三角形底边中点',
      elems: [
        { t: 'poly', pts: [[30, 145], [200, 145], [115, 35]], closed: true },
        { t: 'seg', a: [115, 35], b: [115, 145], dash: true },
        { t: 'seg', a: [115, 145], b: [72, 90] },
        { t: 'seg', a: [115, 145], b: [158, 90] },
        { t: 'right', at: [72, 90], from: 'dr', to: 'ul', size: 8 },
        { t: 'right', at: [158, 90], from: 'dl', to: 'ur', size: 8 },
        { t: 'pt', at: [30, 145], label: 'B', pos: 'bl' },
        { t: 'pt', at: [200, 145], label: 'C', pos: 'br' },
        { t: 'pt', at: [115, 35], label: 'A', pos: 'tl' },
        { t: 'pt', at: [115, 145], label: 'D', pos: 'br' },
        { t: 'pt', at: [72, 90], label: 'E', pos: 'l' },
        { t: 'pt', at: [158, 90], label: 'F', pos: 'r' },
      ],
    },
    steps: [
      {
        label: '识别中点类型', ask: '本题的中点 $D$ 属于哪一类？', type: 'choice',
        options: ['普通边中点', '直角三角形斜边中点', '等腰三角形底边中点', '梯形腰中点'],
        key: 2, score: 1,
        hint: '$AB=AC$ 说明是等腰三角形，$D$ 在底边 $BC$ 上。',
        why: '等腰三角形底边中点模型。',
      },
      {
        label: '选对应模型', ask: '等腰底边中点该连哪条线？', type: 'choice',
        options: ['连 $AD$', '连 $BD$', '过 $D$ 作 $AB$ 平行线', '不作辅助线'], key: 0, score: 1,
        hint: '底边中点连顶角，得三线合一。',
        why: '连 $AD$ 得底边中线，由三线合一同时是角平分线。',
      },
      {
        label: '作辅助线', ask: '连 $AD$ 后，$AD$ 与 $\\angle BAC$ 的关系是？', type: 'choice',
        options: ['$AD$ 平分 $\\angle BAC$', '$AD$ 与 $\\angle BAC$ 无关', '$AD$ 是 $\\angle BAC$ 的一半'], key: 0, score: 2,
        hint: '等腰三角形底边中线 = 顶角平分线。',
        why: '$AD$ 平分 $\\angle BAC$。',
      },
      {
        label: '用模型结论转化', ask: '$DE=DF$ 的依据是什么？', type: 'choice',
        options: ['角平分线上的点到角两边距离相等', '全等三角形对应边相等', '中位线定理', '勾股定理'],
        key: 0, score: 3,
        hint: '$D$ 在 $\\angle BAC$ 的平分线上，$DE\\perp AB$，$DF\\perp AC$。',
        why: '角平分线上的点到角两边的距离相等，直接得 $DE=DF$。',
      },
    ],
    solution: '连 $AD$。$\\because AB=AC$，$D$ 是 $BC$ 中点，$\\therefore AD\\perp BC$ 且 $AD$ 平分 $\\angle BAC$（三线合一）。\n$\\because DE\\perp AB$，$DF\\perp AC$，$\\therefore DE=DF$（角平分线上的点到角两边距离相等）。',
  },

  {
    id: 'v-mid-3', variantOf: 'q-mid-1', changed: 'reverse',
    chapter: 'ch-geo-aux', method: 'm-midpoint-4',
    tier: 'dist', tierName: '变式 · 逆向问', kind: 'solve', score: 6,
    stem: '在 $\\triangle ABC$ 中，$D$ 是 $AB$ 的中点，且 $CD=\\dfrac{1}{2}AB$。求证：$\\angle ACB=90^{\\circ}$。',
    errorTags: ['construct', 'express'],
    steps: [
      {
        label: '识别中点类型', ask: '本题是斜边中点模型的正向还是逆向？', type: 'choice',
        options: ['正向：已知直角证中线', '逆向：已知中线等于一半证直角'], key: 1, score: 1,
        hint: '母题是「有直角 → 中线等于一半」，这里是反过来的。',
        why: '这是斜边中点模型的逆定理。',
      },
      {
        label: '选对应模型', ask: '怎么把「$CD=\\dfrac{1}{2}AB$」转成角的关系？', type: 'choice',
        options: ['用 $CD=AD$ 得等腰三角形', '用勾股定理', '用中位线定理', '作高'], key: 0, score: 2,
        hint: '$D$ 是中点，所以 $AD=DB=\\dfrac{1}{2}AB$。',
        why: '$CD=AD=DB$，得到两个等腰三角形。',
      },
      {
        label: '作辅助线', ask: '由 $CD=AD$ 和 $CD=DB$ 能得到哪些等角？', type: 'choice',
        options: ['$\\angle A=\\angle ACD$，$\\angle B=\\angle BCD$', '只有 $\\angle A=\\angle B$', '没有任何等角'], key: 0, score: 2,
        hint: '等边对等角。',
        why: '两个等腰三角形分别给出 $\\angle A=\\angle ACD$，$\\angle B=\\angle BCD$。',
      },
      {
        label: '用模型结论转化', ask: '把三个角加起来能得出什么？', type: 'fill',
        accept: ['90', '90°', '∠ACB=90°'], answer: '90°', score: 1,
        hint: '$\\angle A+\\angle B+\\angle ACB=180^\\circ$，而 $\\angle ACB=\\angle ACD+\\angle BCD$。',
        why: '$2\\angle ACB=180^\\circ$，故 $\\angle ACB=90^\\circ$。',
      },
    ],
    solution: '$\\because D$ 是 $AB$ 中点，$\\therefore AD=DB=\\dfrac{1}{2}AB$。\n又 $CD=\\dfrac{1}{2}AB$，$\\therefore CD=AD$，$CD=DB$，$\\triangle ACD$ 与 $\\triangle BCD$ 均为等腰三角形。\n$\\therefore \\angle A=\\angle ACD$，$\\angle B=\\angle BCD$。\n$\\because \\angle A+\\angle B+\\angle ACB=180^{\\circ}$，且 $\\angle ACB=\\angle ACD+\\angle BCD=\\angle A+\\angle B$，\n$\\therefore 2\\angle ACB=180^{\\circ}$，$\\angle ACB=90^{\\circ}$。',
  },

  /* ---------- 方法 3：新定义三步法 ---------- */
  {
    id: 'q-newdef-1', chapter: 'ch-newdef', method: 'm-newdef-3step',
    tier: 'dist', tierName: '区分区 · 28 题型', kind: 'solve', score: 7,
    stem: '在平面直角坐标系 $xOy$ 中，对于点 $P(x,y)$，若 $|x|+|y|=2$，则称点 $P$ 为「方形点」。\n(1) 判断点 $A(1,1)$、$B(2,0)$ 是否为方形点；\n(2) 若点 $C(a,1)$ 是方形点，求 $a$ 的值；\n(3) 若方形点 $P$ 在直线 $y=x+b$ 上，求 $b$ 的取值范围。',
    errorTags: ['concept', 'method', 'calc'],
    steps: [
      {
        label: '圈出定义的三个要素', ask: '「方形点」的定义由哪几部分组成？', type: 'choice',
        options: [
          '对象：点 $P(x,y)$；条件：$|x|+|y|=2$',
          '对象：点 $P$；条件：$x>0$',
          '对象：直线；条件：$y=x+b$',
          '没有明确条件',
        ],
        key: 0, score: 1,
        hint: '把定义拆成「什么样的对象 + 满足什么条件」。',
        why: '定义 = 对象（点 $P(x,y)$）+ 条件（$|x|+|y|=2$），这是所有判断的唯一依据。',
      },
      {
        label: '第 (1) 问直接代入验证', ask: '点 $A(1,1)$ 是方形点吗？', type: 'judge',
        key: true, score: 2,
        hint: '把 $x=1,y=1$ 代入 $|x|+|y|$。',
        why: '$|1|+|1|=2$，满足定义，是方形点。',
      },
      {
        label: '第 (2) 问取特殊值或临界', ask: '由 $C(a,1)$ 是方形点，$|a|+1=2$ 给出？', type: 'choice',
        options: ['$a=1$', '$a=\\pm 1$', '$a=2$', '$a=\\pm 2$'], key: 1, score: 2,
        hint: '$|a|=1$，注意绝对值有两个解。',
        why: '$|a|=2-1=1$，所以 $a=1$ 或 $a=-1$，两个答案都不能漏。',
      },
      {
        label: '第 (3) 问分类或转函数', ask: '方形点满足 $|x|+|y|=2$，它在坐标系里围成什么图形？', type: 'choice',
        options: ['一个圆', '一个正方形（旋转 45°）', '两条直线', '一个三角形'], key: 1, score: 2,
        hint: '在四个象限分别去掉绝对值，会得到四条线段。',
        why: '$|x|+|y|=2$ 围成顶点在 $(\\pm2,0),(0,\\pm2)$ 的正方形，边长为 $2\\sqrt2$。直线 $y=x+b$ 与它有交点即 $b$ 的范围。',
      },
    ],
    solution: '(1) $|1|+|1|=2$，$A$ 是方形点；$|2|+|0|=2$，$B$ 也是方形点。\n(2) $|a|+1=2$，$|a|=1$，$a=\\pm 1$。\n(3) $|x|+|y|=2$ 围成顶点为 $(2,0),(0,2),(-2,0),(0,-2)$ 的正方形。直线 $y=x+b$ 斜率为 1，与正方形有交点时，$b$ 的范围由过顶点的两条平行线确定：过 $(2,0)$ 时 $b=-2$；过 $(0,2)$ 时 $b=2$。故 $-2\\le b\\le 2$。',
  },

  {
    id: 'v-newdef-1', variantOf: 'q-newdef-1', changed: 'number',
    chapter: 'ch-newdef', method: 'm-newdef-3step',
    tier: 'dist', tierName: '变式 · 改数字', kind: 'solve', score: 7,
    stem: '对于点 $P(x,y)$，若 $|x|+|y|=3$，则称 $P$ 为「三角点」。\n(1) 判断 $A(1,2)$、$B(3,1)$ 是否为三角点；\n(2) 若 $C(a,0)$ 是三角点，求 $a$。',
    errorTags: ['concept', 'calc'],
    steps: [
      {
        label: '圈出定义的三个要素', ask: '定义条件是什么？', type: 'fill',
        accept: ['|x|+|y|=3'], answer: '|x|+|y|=3', score: 1,
        hint: '直接抄定义里的等式。',
        why: '条件从 2 换成 3，其余结构不变。',
      },
      {
        label: '第 (1) 问直接代入验证', ask: '$A(1,2)$ 是三角点吗？', type: 'judge',
        key: true, score: 2,
        hint: '$|1|+|2|=3$。',
        why: '满足，是三角点。',
      },
      {
        label: '第 (2) 问取特殊值或临界', ask: '$B(3,1)$ 是三角点吗？', type: 'judge',
        key: false, score: 2,
        hint: '$|3|+|1|=4\\ne 3$。',
        why: '不等于 3，不是三角点。',
      },
      {
        label: '第 (3) 问分类或转函数', ask: '由 $C(a,0)$ 是三角点，$a$ 等于？', type: 'choice',
        options: ['$3$', '$\\pm 3$', '$0$', '$\\pm 9$'], key: 1, score: 2,
        hint: '$|a|+0=3$。',
        why: '$|a|=3$，$a=\\pm 3$。',
      },
    ],
    solution: '(1) $|1|+|2|=3$，$A$ 是三角点。(2) $|3|+|1|=4\\ne3$，$B$ 不是。(3) $|a|+0=3$，$a=\\pm3$。',
  },

  {
    id: 'v-newdef-2', variantOf: 'q-newdef-1', changed: 'condition',
    chapter: 'ch-newdef', method: 'm-newdef-3step',
    tier: 'dist', tierName: '变式 · 改条件', kind: 'solve', score: 7,
    stem: '对于点 $P(x,y)$，若 $|x|+|y|\\le 2$，则称 $P$ 为「方形内点」。\n(1) 判断 $A(1,1)$、$B(2,2)$ 是否为方形内点；\n(2) 求方形内点构成的图形面积。',
    errorTags: ['concept', 'method'],
    steps: [
      {
        label: '圈出定义的三个要素', ask: '这次条件从「等于」变成什么？', type: 'choice',
        options: ['仍为等于 2', '小于等于 2（区域）', '大于等于 2', '不等于 2'], key: 1, score: 1,
        hint: '看定义里的不等号方向。',
        why: '「$\\le$」把边界变成了实心区域，这是与母题的关键差别。',
      },
      {
        label: '第 (1) 问直接代入验证', ask: '$A(1,1)$ 是方形内点吗？', type: 'judge',
        key: true, score: 2,
        hint: '$|1|+|1|=2\\le 2$。',
        why: '等于 2 也在范围内（含边界）。',
      },
      {
        label: '第 (2) 问取特殊值或临界', ask: '$B(2,2)$ 是方形内点吗？', type: 'judge',
        key: false, score: 2,
        hint: '$|2|+|2|=4>2$。',
        why: '超过 2，不在区域内。',
      },
      {
        label: '第 (3) 问分类或转函数', ask: '方形内点构成的图形面积是？', type: 'fill',
        accept: ['8', '8平方单位'], answer: '8', score: 2,
        hint: '对角线长 4 的正方形，面积 $=\\dfrac{1}{2}\\times 4\\times 4$。',
        why: '顶点为 $(\\pm2,0),(0,\\pm2)$ 的正方形，两条对角线都是 4，面积 $=\\dfrac{1}{2}\\times4\\times4=8$。',
      },
    ],
    solution: '(1) $|1|+|1|=2\\le2$，是。(2) $|2|+|2|=4>2$，不是。(3) 区域为以 $(\\pm2,0),(0,\\pm2)$ 为顶点的正方形及其内部，对角线长 4，面积 $8$。',
  },

  {
    id: 'v-newdef-3', variantOf: 'q-newdef-1', changed: 'reverse',
    chapter: 'ch-newdef', method: 'm-newdef-3step',
    tier: 'dist', tierName: '变式 · 逆向问', kind: 'solve', score: 7,
    stem: '对于点 $P(x,y)$，若 $|x|+|y|=2$，则称 $P$ 为「方形点」。\n已知方形点 $P$ 到原点的距离为 $\\sqrt{2}$，求 $P$ 的坐标。',
    errorTags: ['method', 'express'],
    steps: [
      {
        label: '圈出定义的三个要素', ask: '本题已知哪两个条件？', type: 'choice',
        options: ['只有方形点定义', '方形点定义 + 到原点距离', '只有距离', '没有任何条件'], key: 1, score: 1,
        hint: '题目给了「是方形点」和「距离为 $\\sqrt2$」两个信息。',
        why: '两个条件联立，是逆向题的标准结构。',
      },
      {
        label: '第 (1) 问直接代入验证', ask: '到原点距离的式子怎么写？', type: 'fill',
        accept: ['x^2+y^2=2', 'x²+y²=2'], answer: 'x^2+y^2=2', score: 2,
        hint: '距离公式 $\\sqrt{x^2+y^2}=\\sqrt2$，两边平方。',
        why: '得到 $x^2+y^2=2$，与 $|x|+|y|=2$ 联立。',
      },
      {
        label: '第 (2) 问取特殊值或临界', ask: '令 $|x|=u,|y|=v$，两式变成？', type: 'choice',
        options: ['$u+v=2$ 且 $u^2+v^2=2$', '$u+v=2$ 且 $u^2+v^2=4$', '$uv=2$', '无法化简'], key: 0, score: 2,
        hint: '$|x|^2=x^2$。',
        why: '得 $u+v=2$，$u^2+v^2=2$。',
      },
      {
        label: '第 (3) 问分类或转函数', ask: '解这个方程组，$u,v$ 的值是？', type: 'fill',
        accept: ['u=v=1', '1,1'], answer: 'u=v=1', score: 2,
        hint: '$(u+v)^2=u^2+v^2+2uv$，代入得 $4=2+2uv$，$uv=1$。',
        why: '$uv=1$ 且 $u+v=2$，故 $u=v=1$，即 $|x|=|y|=1$，四个点 $(\\pm1,\\pm1)$。',
      },
    ],
    solution: '由 $|x|+|y|=2$ 与 $x^{2}+y^{2}=2$，令 $u=|x|,v=|y|$，得 $u+v=2$，$u^{2}+v^{2}=2$。\n由 $(u+v)^{2}=u^{2}+v^{2}+2uv$ 得 $4=2+2uv$，$uv=1$。\n于是 $u,v$ 是 $t^{2}-2t+1=0$ 的两根，$u=v=1$。\n$\\therefore |x|=|y|=1$，$P$ 为 $(1,1),(-1,1),(1,-1),(-1,-1)$。',
  },

  /* ---------- 送分区题（timed 模式压测） ---------- */
  {
    id: 'q-send-1', chapter: 'ch-quad', method: 'm-quad-interval',
    tier: 'send', tierName: '送分区 · 选 3 型', kind: 'choice', score: 2,
    stem: '二次函数 $y=2(x-1)^{2}+3$ 的顶点坐标是',
    options: ['$(1,3)$', '$(-1,3)$', '$(1,-3)$', '$(-1,-3)$'],
    answer: 0,
    errorTags: ['concept'],
    steps: [
      { label: '读出顶点式参数', ask: '顶点坐标是？', type: 'choice',
        options: ['$(1,3)$', '$(-1,3)$', '$(1,-3)$', '$(-1,-3)$'], key: 0, score: 2,
        hint: '顶点式 $y=a(x-h)^2+k$ 的顶点是 $(h,k)$，注意 $x-1$ 对应 $h=1$。',
        why: '$y=2(x-1)^2+3$ 中 $h=1,k=3$，顶点 $(1,3)$。' },
    ],
  },
  {
    id: 'q-send-2', chapter: 'ch-geo-aux', method: 'm-midpoint-4',
    tier: 'send', tierName: '送分区 · 选 5 型', kind: 'choice', score: 2,
    stem: '若一个多边形的内角和为 $1080^{\\circ}$，则它的边数是',
    options: ['6', '7', '8', '9'],
    answer: 2,
    errorTags: ['concept', 'calc'],
    steps: [
      { label: '用内角和公式', ask: '边数是？', type: 'choice',
        options: ['6', '7', '8', '9'], key: 2, score: 2,
        hint: '$(n-2)\\times 180^\\circ=1080^\\circ$。',
        why: '$n-2=6$，$n=8$。' },
    ],
  },
  {
    id: 'q-send-3', chapter: 'ch-quad', method: 'm-quad-interval',
    tier: 'send', tierName: '送分区 · 填 11 型', kind: 'fill', score: 2,
    stem: '若二次函数 $y=x^{2}-4x+m$ 的图象与 $x$ 轴只有一个交点，则 $m=$',
    accept: ['4'], answer: '4',
    errorTags: ['concept', 'calc'],
    steps: [
      { label: '用判别式', ask: '$m$ 等于？', type: 'fill',
        accept: ['4'], answer: '4', score: 2,
        hint: '只有一个交点 → $\\Delta=b^2-4ac=0$，即 $16-4m=0$。',
        why: '$\\Delta=16-4m=0$，$m=4$。' },
    ],
  },
  {
    id: 'q-send-4', chapter: 'ch-newdef', method: 'm-newdef-3step',
    tier: 'send', tierName: '送分区 · 填 13 型', kind: 'fill', score: 2,
    stem: '在平面直角坐标系中，点 $P(3,-2)$ 关于 $x$ 轴对称的点的坐标是',
    accept: ['(3,2)', '3,2'], answer: '(3,2)',
    errorTags: ['concept'],
    steps: [
      { label: '用对称规律', ask: '对称点坐标是？', type: 'fill',
        accept: ['(3,2)', '3,2'], answer: '(3,2)', score: 2,
        hint: '关于 $x$ 轴对称：横坐标不变，纵坐标变相反数。',
        why: '$(3,-2)\\to(3,2)$。' },
    ],
  },
];

/* 方法卡 id → 关联题（母题 + 变式） */
export function questionsByMethod() {
  const m = new Map();
  QUESTIONS.forEach((q) => {
    if (!m.has(q.method)) m.set(q.method, []);
    m.get(q.method).push(q);
  });
  return m;
}
